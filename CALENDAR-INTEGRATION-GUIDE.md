# Integración con Calendario cPanel/Email

## 📅 Opciones de Sincronización con Calendario

### Opción 1: **CalDAV (Recomendado)**

cPanel soporta CalDAV nativo para sincronización de calendarios.

#### Ventajas:
- ✅ Soporte nativo en cPanel
- ✅ Compatible con todos los clientes de calendario (Outlook, Apple Calendar, Google Calendar vía bridge)
- ✅ Sincronización bidireccional en tiempo real
- ✅ Sin dependencias externas

#### Implementación:

**Backend PHP (CalDAV Client):**

```php
<?php
// backend/calendar-service.php

class CalDAVService {
    private $caldavUrl;
    private $username;
    private $password;
    
    public function __construct() {
        // URL del servidor CalDAV de cPanel
        // Formato: https://tudominio.com:2080/caldav/v2/[email]/[calendar-name]/
        $this->caldavUrl = 'https://ksinsurancee.com:2080/caldav/v2/admin@ksinsurancee.com/meetings/';
        $this->username = 'admin@ksinsurancee.com';
        $this->password = CALDAV_PASSWORD; // Definir en config.php
    }
    
    /**
     * Crear evento en calendario
     */
    public function createEvent($eventData) {
        $uid = uniqid('event-');
        $ical = $this->generateICalendar($uid, $eventData);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->caldavUrl . $uid . '.ics',
            CURLOPT_CUSTOMREQUEST => 'PUT',
            CURLOPT_POSTFIELDS => $ical,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
            CURLOPT_USERPWD => "$this->username:$this->password",
            CURLOPT_HTTPHEADER => [
                'Content-Type: text/calendar; charset=utf-8',
                'If-None-Match: *'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return ['success' => $httpCode === 201, 'uid' => $uid];
    }
    
    /**
     * Listar eventos
     */
    public function listEvents($startDate, $endDate) {
        $report = $this->generateCalendarQuery($startDate, $endDate);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->caldavUrl,
            CURLOPT_CUSTOMREQUEST => 'REPORT',
            CURLOPT_POSTFIELDS => $report,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
            CURLOPT_USERPWD => "$this->username:$this->password",
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/xml; charset=utf-8',
                'Depth: 1'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return $this->parseCalendarResponse($response);
    }
    
    /**
     * Generar formato iCalendar
     */
    private function generateICalendar($uid, $data) {
        $dtstart = date('Ymd\THis\Z', strtotime($data['start_time']));
        $dtend = date('Ymd\THis\Z', strtotime($data['end_time']));
        $dtstamp = date('Ymd\THis\Z');
        
        $ical = "BEGIN:VCALENDAR\r\n";
        $ical .= "VERSION:2.0\r\n";
        $ical .= "PRODID:-//Krause Insurance//Meeting Scheduler//EN\r\n";
        $ical .= "BEGIN:VEVENT\r\n";
        $ical .= "UID:$uid\r\n";
        $ical .= "DTSTAMP:$dtstamp\r\n";
        $ical .= "DTSTART:$dtstart\r\n";
        $ical .= "DTEND:$dtend\r\n";
        $ical .= "SUMMARY:" . $this->escapeIcal($data['title']) . "\r\n";
        $ical .= "DESCRIPTION:" . $this->escapeIcal($data['description']) . "\r\n";
        $ical .= "LOCATION:" . $this->escapeIcal($data['location'] ?? 'Virtual') . "\r\n";
        $ical .= "ORGANIZER:mailto:" . $data['organizer_email'] . "\r\n";
        $ical .= "ATTENDEE;RSVP=TRUE:mailto:" . $data['attendee_email'] . "\r\n";
        $ical .= "STATUS:CONFIRMED\r\n";
        $ical .= "SEQUENCE:0\r\n";
        $ical .= "END:VEVENT\r\n";
        $ical .= "END:VCALENDAR\r\n";
        
        return $ical;
    }
    
    private function generateCalendarQuery($startDate, $endDate) {
        $start = date('Ymd\THis\Z', strtotime($startDate));
        $end = date('Ymd\THis\Z', strtotime($endDate));
        
        return <<<XML
<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="$start" end="$end"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>
XML;
    }
    
    private function escapeIcal($text) {
        return str_replace(["\n", "\r", ",", ";"], ['\n', '', '\,', '\;'], $text);
    }
    
    private function parseCalendarResponse($xml) {
        // Parse XML response y extraer eventos
        // Implementar parsing según necesidad
        return [];
    }
}
```

**Endpoint para crear meetings:**

```php
// backend/index.php - agregar endpoint

if ($method === 'POST' && $action === 'create_meeting') {
    $user = Auth::requireAuth();
    
    require_once 'calendar-service.php';
    $calendar = new CalDAVService();
    
    $eventData = [
        'title' => $data['title'] ?? 'Meeting',
        'description' => $data['description'] ?? '',
        'start_time' => $data['start_time'],
        'end_time' => $data['end_time'],
        'organizer_email' => $user['email'],
        'attendee_email' => $data['attendee_email'],
        'location' => $data['location'] ?? 'Virtual Meeting'
    ];
    
    $result = $calendar->createEvent($eventData);
    
    // Guardar en DB también
    $stmt = $db->prepare("
        INSERT INTO meetings (user_id, title, start_time, end_time, attendee_email, calendar_uid)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user['user_id'],
        $eventData['title'],
        $eventData['start_time'],
        $eventData['end_time'],
        $eventData['attendee_email'],
        $result['uid']
    ]);
    
    sendResponse($result);
}

if ($action === 'list_meetings') {
    $user = Auth::requireAuth();
    
    require_once 'calendar-service.php';
    $calendar = new CalDAVService();
    
    $startDate = $_GET['start'] ?? date('Y-m-d');
    $endDate = $_GET['end'] ?? date('Y-m-d', strtotime('+30 days'));
    
    $events = $calendar->listEvents($startDate, $endDate);
    
    sendResponse($events);
}
```

---

### Opción 2: **Email con iCalendar Attachments**

Más simple, sin necesidad de CalDAV.

```php
<?php
// backend/email-meeting.php

function sendMeetingInvite($attendeeEmail, $meetingData) {
    $ical = generateICalendar($meetingData);
    
    $boundary = md5(time());
    
    $headers = "From: Krause Insurance <noreply@ksinsurancee.com>\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
    
    $message = "--$boundary\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $message .= "Hola,\n\n";
    $message .= "Tienes una reunión programada:\n\n";
    $message .= "Título: " . $meetingData['title'] . "\n";
    $message .= "Fecha: " . date('d/m/Y H:i', strtotime($meetingData['start_time'])) . "\n\n";
    $message .= "Saludos,\nKrause Insurance\r\n\r\n";
    
    $message .= "--$boundary\r\n";
    $message .= "Content-Type: text/calendar; charset=UTF-8; method=REQUEST\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $ical . "\r\n";
    $message .= "--$boundary--";
    
    return mail($attendeeEmail, "Invitación: " . $meetingData['title'], $message, $headers);
}
```

---

### Opción 3: **Integración con Google Calendar API**

Para sincronización con Google Calendar de los usuarios.

#### Requisitos:
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Calendar API
3. Obtener credenciales OAuth 2.0

```javascript
// frontend/src/modules/calendarSync.js

export async function syncWithGoogleCalendar() {
    // Implementar OAuth 2.0 flow
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
        client_id=YOUR_CLIENT_ID&
        redirect_uri=https://ksinsurancee.com/calendar-callback&
        response_type=code&
        scope=https://www.googleapis.com/auth/calendar`;
    
    window.location.href = authUrl;
}

export async function createGoogleCalendarEvent(eventData, accessToken) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            summary: eventData.title,
            description: eventData.description,
            start: {
                dateTime: eventData.start_time,
                timeZone: 'America/Mexico_City'
            },
            end: {
                dateTime: eventData.end_time,
                timeZone: 'America/Mexico_City'
            },
            attendees: [
                { email: eventData.attendee_email }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 }
                ]
            }
        })
    });
    
    return await response.json();
}
```

---

## 🎯 Recomendación de Implementación

**FASE 1 (Inmediata):**
- Implementar CalDAV básico para calendario de cPanel
- Guardar eventos en base de datos local
- Enviar emails con iCalendar attachments

**FASE 2 (Corto plazo):**
- Agregar interfaz de calendario en el dashboard
- Implementar recordatorios automáticos
- Vista de calendario mensual/semanal

**FASE 3 (Mediano plazo):**
- Integración con Google Calendar vía OAuth
- Sincronización bidireccional
- Notificaciones push

---

## 📋 Tabla de Reuniones en DB

```sql
CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    attendee_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(255),
    attendee_email VARCHAR(255),
    calendar_uid VARCHAR(255) UNIQUE,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (attendee_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔧 Configuración cPanel

1. **Acceder a Email Accounts**
2. **Configurar Calendar & Contacts** para la cuenta
3. **Obtener URL CalDAV:**
   ```
   https://ksinsurancee.com:2080/caldav/v2/[email]/[calendar]/
   ```
4. **Credenciales:** Email completo + contraseña de email

---

## 🎨 UI de Calendario (Frontend)

Usar librerías como:
- **FullCalendar.js** - Calendario completo con drag & drop
- **TUI Calendar** - Open source, muy personalizable
- **DayPilot** - Scheduler profesional

```javascript
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export function initializeCalendar(containerEl) {
    const calendar = new Calendar(containerEl, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: async function(info, successCallback, failureCallback) {
            try {
                const events = await apiService.request(
                    '?action=list_meetings',
                    { 
                        method: 'GET',
                        queryParams: {
                            start: info.startStr,
                            end: info.endStr
                        }
                    }
                );
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },
        editable: true,
        selectable: true,
        select: function(info) {
            // Abrir modal para crear evento
            openCreateMeetingModal(info.start, info.end);
        }
    });
    
    calendar.render();
}
```

¿Quieres que implemente alguna de estas opciones?
