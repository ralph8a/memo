<?php
/**
 * Calendar Service - Internal Calendar System
 * Sends meeting invites via email with iCalendar attachments
 * No external sync, just internal meeting management
 */

require_once 'email-service.php';

class CalendarService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Create a new meeting and send invitations
     */
    public function createMeeting($data) {
        try {
            // Insert into database
            $stmt = $this->db->prepare("
                INSERT INTO meetings (
                    user_id, attendee_id, title, description, 
                    start_time, end_time, location, attendee_email,
                    calendar_uid, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            ");
            
            $uid = $this->generateUID();
            
            $stmt->execute([
                $data['user_id'],
                $data['attendee_id'] ?? null,
                $data['title'],
                $data['description'] ?? '',
                $data['start_time'],
                $data['end_time'],
                $data['location'] ?? 'Virtual Meeting',
                $data['attendee_email'],
                $uid,
                $data['created_by'] ?? $data['user_id']
            ]);
            
            $meetingId = $this->db->lastInsertId();
            
            // Generate iCalendar content
            $icalContent = $this->generateICalendar($uid, $data);
            
            // Send email invitations
            $this->sendMeetingInvite($data, $icalContent);
            
            return [
                'success' => true,
                'meeting_id' => $meetingId,
                'uid' => $uid,
                'message' => 'Meeting created and invitations sent'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * List meetings for a user
     */
    public function listMeetings($userId, $startDate = null, $endDate = null, $status = null) {
        try {
            $query = "
                SELECT 
                    m.*,
                    u1.name as organizer_name,
                    u2.name as attendee_name
                FROM meetings m
                LEFT JOIN users u1 ON m.user_id = u1.id
                LEFT JOIN users u2 ON m.attendee_id = u2.id
                WHERE (m.user_id = ? OR m.attendee_id = ?)
            ";
            
            $params = [$userId, $userId];
            
            if ($startDate) {
                $query .= " AND m.start_time >= ?";
                $params[] = $startDate;
            }
            
            if ($endDate) {
                $query .= " AND m.end_time <= ?";
                $params[] = $endDate;
            }
            
            if ($status) {
                $query .= " AND m.status = ?";
                $params[] = $status;
            }
            
            $query .= " ORDER BY m.start_time ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Update meeting status
     */
    public function updateMeetingStatus($meetingId, $status) {
        try {
            $stmt = $this->db->prepare("
                UPDATE meetings 
                SET status = ?, updated_at = NOW()
                WHERE id = ?
            ");
            
            $stmt->execute([$status, $meetingId]);
            
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Cancel meeting and notify attendees
     */
    public function cancelMeeting($meetingId, $reason = '') {
        try {
            // Get meeting details
            $stmt = $this->db->prepare("SELECT * FROM meetings WHERE id = ?");
            $stmt->execute([$meetingId]);
            $meeting = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$meeting) {
                throw new Exception('Meeting not found');
            }
            
            // Update status
            $this->updateMeetingStatus($meetingId, 'cancelled');
            
            // Send cancellation email
            $this->sendCancellationEmail($meeting, $reason);
            
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Generate unique ID for calendar event
     */
    private function generateUID() {
        return 'meeting-' . uniqid() . '@ksinsurancee.com';
    }
    
    /**
     * Generate iCalendar format
     */
    private function generateICalendar($uid, $data) {
        $dtstart = $this->formatICalDate($data['start_time']);
        $dtend = $this->formatICalDate($data['end_time']);
        $dtstamp = $this->formatICalDate(date('Y-m-d H:i:s'));
        
        $ical = "BEGIN:VCALENDAR\r\n";
        $ical .= "VERSION:2.0\r\n";
        $ical .= "PRODID:-//Krause Insurance//Meeting Scheduler//EN\r\n";
        $ical .= "METHOD:REQUEST\r\n";
        $ical .= "BEGIN:VEVENT\r\n";
        $ical .= "UID:$uid\r\n";
        $ical .= "DTSTAMP:$dtstamp\r\n";
        $ical .= "DTSTART:$dtstart\r\n";
        $ical .= "DTEND:$dtend\r\n";
        $ical .= "SUMMARY:" . $this->escapeIcal($data['title']) . "\r\n";
        $ical .= "DESCRIPTION:" . $this->escapeIcal($data['description'] ?? '') . "\r\n";
        $ical .= "LOCATION:" . $this->escapeIcal($data['location'] ?? 'Virtual Meeting') . "\r\n";
        $ical .= "ORGANIZER;CN=" . $this->escapeIcal($data['organizer_name'] ?? 'Krause Insurance') . ":MAILTO:" . ($data['organizer_email'] ?? 'noreply@ksinsurancee.com') . "\r\n";
        $ical .= "ATTENDEE;RSVP=TRUE;CN=" . $this->escapeIcal($data['attendee_name'] ?? '') . ":MAILTO:" . $data['attendee_email'] . "\r\n";
        $ical .= "STATUS:CONFIRMED\r\n";
        $ical .= "SEQUENCE:0\r\n";
        $ical .= "BEGIN:VALARM\r\n";
        $ical .= "TRIGGER:-PT24H\r\n";
        $ical .= "ACTION:DISPLAY\r\n";
        $ical .= "DESCRIPTION:Recordatorio: " . $this->escapeIcal($data['title']) . "\r\n";
        $ical .= "END:VALARM\r\n";
        $ical .= "END:VEVENT\r\n";
        $ical .= "END:VCALENDAR\r\n";
        
        return $ical;
    }
    
    /**
     * Format date for iCalendar (YYYYMMDDTHHMMSSZ)
     */
    private function formatICalDate($datetime) {
        return gmdate('Ymd\THis\Z', strtotime($datetime));
    }
    
    /**
     * Escape special characters for iCalendar
     */
    private function escapeIcal($text) {
        return str_replace(["\n", "\r", ",", ";"], ['\n', '', '\,', '\;'], $text);
    }
    
    /**
     * Send meeting invitation email with iCalendar attachment
     */
    private function sendMeetingInvite($data, $icalContent) {
        $to = $data['attendee_email'];
        $subject = 'Invitación: ' . $data['title'];
        
        $boundary = md5(time());
        
        $headers = "From: Krause Insurance <noreply@ksinsurancee.com>\r\n";
        $headers .= "Reply-To: " . ($data['organizer_email'] ?? 'noreply@ksinsurancee.com') . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
        
        $startTime = date('d/m/Y H:i', strtotime($data['start_time']));
        $endTime = date('H:i', strtotime($data['end_time']));
        
        $message = "--$boundary\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= "<html><body style='font-family: Arial, sans-serif;'>";
        $message .= "<h2>📅 Nueva Reunión Programada</h2>";
        $message .= "<p>Hola,</p>";
        $message .= "<p>Tienes una reunión programada:</p>";
        $message .= "<table style='border-collapse: collapse; margin: 20px 0;'>";
        $message .= "<tr><td style='padding: 8px; font-weight: bold;'>Título:</td><td style='padding: 8px;'>" . htmlspecialchars($data['title']) . "</td></tr>";
        $message .= "<tr><td style='padding: 8px; font-weight: bold;'>Fecha y Hora:</td><td style='padding: 8px;'>" . $startTime . " - " . $endTime . "</td></tr>";
        $message .= "<tr><td style='padding: 8px; font-weight: bold;'>Ubicación:</td><td style='padding: 8px;'>" . htmlspecialchars($data['location'] ?? 'Virtual Meeting') . "</td></tr>";
        
        if (!empty($data['description'])) {
            $message .= "<tr><td style='padding: 8px; font-weight: bold;'>Descripción:</td><td style='padding: 8px;'>" . nl2br(htmlspecialchars($data['description'])) . "</td></tr>";
        }
        
        $message .= "</table>";
        $message .= "<p>Este evento ha sido agregado a tu calendario automáticamente.</p>";
        $message .= "<p style='margin-top: 30px; color: #666; font-size: 12px;'>Saludos,<br>Krause Insurance<br>Protection Beyond The Limits</p>";
        $message .= "</body></html>\r\n\r\n";
        
        // Attach iCalendar file
        $message .= "--$boundary\r\n";
        $message .= "Content-Type: text/calendar; charset=UTF-8; method=REQUEST; name=\"meeting.ics\"\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n";
        $message .= "Content-Disposition: attachment; filename=\"meeting.ics\"\r\n\r\n";
        $message .= $icalContent . "\r\n";
        $message .= "--$boundary--\r\n";
        
        return mail($to, $subject, $message, $headers);
    }
    
    /**
     * Send cancellation email
     */
    private function sendCancellationEmail($meeting, $reason) {
        $to = $meeting['attendee_email'];
        $subject = 'Cancelación: ' . $meeting['title'];
        
        $headers = "From: Krause Insurance <noreply@ksinsurancee.com>\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        
        $message = "<html><body style='font-family: Arial, sans-serif;'>";
        $message .= "<h2>❌ Reunión Cancelada</h2>";
        $message .= "<p>La siguiente reunión ha sido cancelada:</p>";
        $message .= "<p><strong>" . htmlspecialchars($meeting['title']) . "</strong><br>";
        $message .= "Programada para: " . date('d/m/Y H:i', strtotime($meeting['start_time'])) . "</p>";
        
        if ($reason) {
            $message .= "<p><strong>Motivo:</strong> " . htmlspecialchars($reason) . "</p>";
        }
        
        $message .= "<p>Por favor, contáctanos si deseas reagendar.</p>";
        $message .= "<p style='margin-top: 30px; color: #666; font-size: 12px;'>Saludos,<br>Krause Insurance</p>";
        $message .= "</body></html>";
        
        return mail($to, $subject, $message, $headers);
    }
}
