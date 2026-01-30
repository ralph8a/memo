<?php
// Email Notification Service
require_once 'config.php';
require_once 'database.php';

class EmailService {
    
    // Send email using PHP mail() or SMTP
    public static function send($to, $subject, $message, $isHTML = true) {
        try {
            // Log notification to database
            self::logNotification($to, $subject, $message);
            
            // Prepare headers
            $headers = [];
            $headers[] = 'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>';
            $headers[] = 'Reply-To: ' . SMTP_FROM_EMAIL;
            $headers[] = 'X-Mailer: PHP/' . phpversion();
            
            if ($isHTML) {
                $headers[] = 'MIME-Version: 1.0';
                $headers[] = 'Content-Type: text/html; charset=UTF-8';
            }
            
            // Send email
            $sent = mail($to, $subject, $message, implode("\r\n", $headers));
            
            if ($sent) {
                self::updateNotificationStatus($to, $subject, 'sent');
                return true;
            } else {
                self::updateNotificationStatus($to, $subject, 'failed');
                error_log("Email sending failed to: $to");
                return false;
            }
            
        } catch (Exception $e) {
            error_log("Email error: " . $e->getMessage());
            self::updateNotificationStatus($to, $subject, 'failed');
            return false;
        }
    }
    
    // Alias for send() for compatibility
    public static function sendEmail($to, $subject, $message, $isHTML = true) {
        return self::send($to, $subject, $message, $isHTML);
    }
    
    // Send notification for claim assignment
    public static function sendClaimAssignmentNotification($agentEmail, $clientName, $claimNumber) {
        $subject = "New Claim Assigned - #$claimNumber";
        $message = self::getEmailTemplate([
            'title' => 'New Claim Assignment',
            'content' => "
                <p>Hello,</p>
                <p>A new claim has been assigned to you:</p>
                <ul>
                    <li><strong>Client:</strong> $clientName</li>
                    <li><strong>Claim Number:</strong> $claimNumber</li>
                </ul>
                <p>Please log in to your dashboard to review the details.</p>
                <p><a href='https://ksinsurancee.com' style='background-color: #a02c5a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>View Dashboard</a></p>
            "
        ]);
        
        return self::send($agentEmail, $subject, $message);
    }
    
    // Send questionnaire notification
    public static function sendQuestionnaireNotification($clientEmail, $clientName, $questionnaireTitle) {
        $subject = "New Questionnaire Available";
        $message = self::getEmailTemplate([
            'title' => 'Complete Your Questionnaire',
            'content' => "
                <p>Hello $clientName,</p>
                <p>A new questionnaire has been sent to you:</p>
                <p><strong>$questionnaireTitle</strong></p>
                <p>Please log in to your client portal to complete it.</p>
                <p><a href='https://ksinsurancee.com' style='background-color: #a02c5a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Complete Questionnaire</a></p>
            "
        ]);
        
        return self::send($clientEmail, $subject, $message);
    }
    
    // Send quote request confirmation
    public static function sendQuoteRequestConfirmation($email, $firstName, $quoteType) {
        $subject = "Quote Request Received - Krause Insurance";
        $message = self::getEmailTemplate([
            'title' => 'Quote Request Confirmation',
            'content' => "
                <p>Hello $firstName,</p>
                <p>Thank you for requesting a quote for <strong>$quoteType insurance</strong>.</p>
                <p>Our team will review your request and get back to you within 24 hours.</p>
                <p>If you have any questions, feel free to contact us at:</p>
                <p>📞 +1-555-123-4567<br>✉️ info@ksinsurancee.com</p>
            "
        ]);
        
        return self::send($email, $subject, $message);
    }
    
    // Send payment confirmation
    public static function sendPaymentConfirmation($email, $clientName, $amount, $policyNumber) {
        $subject = "Payment Confirmation - Policy #$policyNumber";
        $message = self::getEmailTemplate([
            'title' => 'Payment Confirmed',
            'content' => "
                <p>Hello $clientName,</p>
                <p>Your payment has been successfully processed:</p>
                <ul>
                    <li><strong>Amount:</strong> $" . number_format($amount, 2) . "</li>
                    <li><strong>Policy Number:</strong> $policyNumber</li>
                    <li><strong>Date:</strong> " . date('F j, Y') . "</li>
                </ul>
                <p>Thank you for your payment!</p>
            "
        ]);
        
        return self::send($email, $subject, $message);
    }
    
    // Email template
    private static function getEmailTemplate($data) {
        $title = $data['title'] ?? 'Krause Insurance';
        $content = $data['content'] ?? '';
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>$title</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background-color: #a02c5a; padding: 30px; text-align: center;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 28px;'>Krause Insurance</h1>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style='padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.6;'>
                                    <h2 style='color: #a02c5a; margin-top: 0;'>$title</h2>
                                    $content
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #f8f8f8; padding: 20px 30px; text-align: center; color: #666666; font-size: 14px;'>
                                    <p style='margin: 0;'>© " . date('Y') . " Krause Insurance. All rights reserved.</p>
                                    <p style='margin: 5px 0 0 0;'>
                                        <a href='https://ksinsurancee.com' style='color: #a02c5a; text-decoration: none;'>ksinsurancee.com</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }
    
    // Log notification to database
    private static function logNotification($email, $subject, $message) {
        try {
            $db = getDB();
            
            // Get user ID from email
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if ($user) {
                $stmt = $db->prepare("
                    INSERT INTO notifications (user_id, notification_type, subject, message, status)
                    VALUES (?, 'email', ?, ?, 'pending')
                ");
                $stmt->execute([$user['id'], $subject, $message]);
            }
        } catch (Exception $e) {
            error_log("Failed to log notification: " . $e->getMessage());
        }
    }
    
    // Update notification status
    private static function updateNotificationStatus($email, $subject, $status) {
        try {
            $db = getDB();
            
            $stmt = $db->prepare("
                UPDATE notifications n
                JOIN users u ON n.user_id = u.id
                SET n.status = ?, n.sent_at = CURRENT_TIMESTAMP
                WHERE u.email = ? AND n.subject = ? AND n.status = 'pending'
                ORDER BY n.created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$status, $email, $subject]);
        } catch (Exception $e) {
            error_log("Failed to update notification status: " . $e->getMessage());
        }
    }
}
?>
