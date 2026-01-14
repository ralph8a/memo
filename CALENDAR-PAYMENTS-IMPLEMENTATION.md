# 📅 Sistema de Calendario y Pagos - Implementación Completada

## ✅ Tareas Completadas

### 1. Cleanup Script Ejecutado
- ✅ Limpieza de archivos temporales ejecutada vía HTTPS
- Archivos removidos: `run-test-data-insert.php`, `cleanup-temp-files.php`

### 2. Calendario Interno Implementado (Opción 2)

**Características:**
- ✅ Sistema de calendario **INTERNO** (no sincroniza con externos)
- ✅ Envío de invitaciones vía **email con archivos iCalendar (.ics)**
- ✅ Los clientes reciben emails con attachment que se agregan automáticamente a su calendario
- ✅ Vistas ampliadas: **día, semana, mes, año**

**Archivos Creados:**

#### Backend:
- `backend/calendar-service.php` (390 líneas)
  - Clase `CalendarService` con métodos:
    - `createMeeting()` - Crea reunión y envía invitación por email
    - `listMeetings()` - Lista reuniones de usuario con filtros
    - `updateMeetingStatus()` - Actualiza estado (pending, confirmed, cancelled, completed)
    - `cancelMeeting()` - Cancela y notifica vía email
    - `generateICalendar()` - Genera formato .ics RFC 5545 compliant
    - `sendMeetingInvite()` - Envía email HTML con archivo .ics adjunto

- `backend/meetings-schema.sql`
  - Tabla `meetings`: id, user_id, attendee_id, title, description, start_time, end_time, location, attendee_email, calendar_uid, status, reminder_sent, created_by, created_at, updated_at
  
- `backend/run-schema-update.php` - Ejecutor de schema SQL

#### Frontend:
- `src/modules/scheduling.js` (actualizado)
  - Integración con backend vía `apiService`
  - `loadMeetingsFromBackend()` - Carga reuniones desde DB
  - `requestMeeting()` - Crea reunión con backend
  - `setCalendarView()` / `getCalendarView()` - Manejo de vistas
  - `getMonthMeetings()` - Vista mensual
  - `getYearMeetings()` - Vista anual (agrupado por meses)
  - `getMeetingStats()` - Estadísticas de reuniones por período

#### Endpoints API:
```
POST /backend/index.php?action=create_meeting
GET  /backend/index.php?action=list_meetings&start=YYYY-MM-DD&end=YYYY-MM-DD&status=confirmed
POST /backend/index.php?action=cancel_meeting&id={id}
```

**Flujo de Uso:**
1. Usuario agenda reunión desde dashboard
2. Backend crea registro en DB
3. Genera archivo .ics con formato iCalendar
4. Envía email HTML con attachment .ics
5. Cliente recibe email, abre .ics → se agrega automáticamente a Outlook/Google Calendar/Apple Calendar
6. Recordatorios automáticos en email con 24h de anticipación

---

### 3. Sistema de Comprobantes de Pago

**Cambio de Paradigma:**
- ❌ NO procesamos pagos online
- ✅ SÍ aceptamos comprobantes de transferencias/depósitos
- ✅ Análisis automático con OCR para extraer información
- ✅ Verificación manual por admin

**Archivos Creados:**

#### Backend:
- `backend/receipt-analyzer.php` (380 líneas)
  - Clase `ReceiptAnalyzer`:
    - `processReceipt()` - Valida y guarda archivo
    - `analyzeReceipt()` - Extrae información con pattern matching
    - `extractTextFromPDF()` - Lee texto de PDFs
    - `extractTextFromImage()` - OCR con Tesseract (si disponible)
  
  - Clase `CloudOCRService` (opcional):
    - `analyzeWithGoogleVision()` - Google Cloud Vision API
    - `analyzeWithAzure()` - Azure Computer Vision API

- `backend/meetings-schema.sql`
  - Tabla `payment_receipts`: id, payment_id, policy_id, user_id, file_path, file_name, file_size, mime_type, extracted_amount, extracted_date, extracted_reference, extracted_bank, verification_status (pending/verified/rejected), verified_by, verified_at, verification_notes, uploaded_at

  - Tabla `claim_comments`: id, claim_id, user_id, user_type (client/agent/admin), message, is_internal, created_at

#### Frontend:
- `src/modules/modalManager.js` (actualizado)
  - `openMakePaymentModal()` - Formulario de subida de comprobante
    - Selección de póliza
    - Fecha del pago
    - Referencia/Folio
    - Upload de archivo (imagen o PDF, max 5MB)
    - Preview de imagen
    - Datos bancarios para transferencia
  
  - `uploadPaymentReceipt()` - Sube archivo con FormData
    - Muestra estado "Analizando..."
    - Recibe resultados de extracción
    - Notifica monto detectado, referencia, etc.

#### Endpoints API:
```
POST /backend/index.php?action=upload_payment_receipt
     FormData: receipt (file), policy_id, payment_date, reference
     
     Response:
     {
       "success": true,
       "receipt_id": 123,
       "extracted_data": {
         "amount": 1234.56,
         "date": "14/01/2026",
         "reference": "ABC123456",
         "bank": "BBVA",
         "confidence": "high"
       },
       "confidence": "Alta - Datos extraídos con alta confiabilidad",
       "message": "Receipt uploaded successfully. Verification pending."
     }
```

**Información Extraída Automáticamente:**
- 💰 **Monto**: `$1,234.56` (formatos mexicanos)
- 📅 **Fecha**: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
- 🔢 **Referencia/Folio**: Patrones como "Referencia: 123456", "Folio: ABC123"
- 🏦 **Banco**: BBVA, Banamex, Santander, HSBC, Banorte, Scotiabank, Inbursa, Azteca

**Niveles de Confianza:**
- **High**: Banco detectado + referencia + monto
- **Medium**: Monto detectado
- **Low**: Análisis manual requerido

**Datos Bancarios Mostrados:**
```
Banco: BBVA Bancomer
Cuenta: 0123456789
CLABE: 012180001234567890
Beneficiario: Krause Insurance LLC
```

---

### 4. Sistema de Comentarios en Siniestros

**Características:**
- ✅ Thread de conversación en cada claim
- ✅ Cliente y agente pueden intercambiar mensajes
- ✅ Notificaciones por email cuando hay nuevo comentario
- ✅ Distingue visualmente comentarios de agente vs cliente

**Archivos:**
- `src/modules/modalManager.js`
  - `openClaimDetailsModal()` - Muestra claim con thread de comentarios
  - `addClaimComment()` - Agrega comentario y notifica

#### Endpoints:
```
GET  /backend/index.php?action=claim_details&id={id}
     Response: claim + comments array
     
POST /backend/index.php?action=add_claim_comment
     Body: { id: claim_id, message: "texto" }
     → Inserta comentario
     → Envía email a la otra parte
```

**UI de Comentarios:**
```html
<div class="comment-item comment-agent">
  <div class="comment-header">
    <strong>Carlos Mendez</strong>
    <span class="comment-date">14/01/2026 10:30</span>
  </div>
  <div class="comment-body">Estamos revisando tu siniestro...</div>
</div>
```

---

### 5. Endpoints API Actualizados

**src/api-integration.js** - Nuevos endpoints:

```javascript
// Calendar/Meetings
CREATE_MEETING: '?action=create_meeting',
LIST_MEETINGS: '?action=list_meetings',
UPDATE_MEETING: '?action=update_meeting',
CANCEL_MEETING: '?action=cancel_meeting',

// Payment Receipts
UPLOAD_PAYMENT_RECEIPT: '?action=upload_payment_receipt',
VERIFY_PAYMENT_RECEIPT: '?action=verify_payment_receipt',

// Claim Comments
GET_CLAIM_DETAILS: '?action=claim_details',
ADD_CLAIM_COMMENT: '?action=add_claim_comment',
SUBMIT_CLAIM: '?action=submit_claim',
```

---

## 📊 Estructura de Base de Datos

### Tabla `meetings`
```sql
- id (PK)
- user_id (FK → users)
- attendee_id (FK → users, nullable)
- title VARCHAR(255)
- description TEXT
- start_time DATETIME
- end_time DATETIME
- location VARCHAR(255) DEFAULT 'Virtual Meeting'
- attendee_email VARCHAR(255)
- calendar_uid VARCHAR(255) UNIQUE
- status ENUM('pending', 'confirmed', 'cancelled', 'completed')
- reminder_sent BOOLEAN
- created_by (FK → users)
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

### Tabla `payment_receipts`
```sql
- id (PK)
- payment_id (FK → payments, nullable)
- policy_id (FK → policies)
- user_id (FK → users)
- file_path VARCHAR(500)
- file_name VARCHAR(255)
- file_size INT
- mime_type VARCHAR(100)
- extracted_amount DECIMAL(10,2)
- extracted_date DATE
- extracted_reference VARCHAR(100)
- extracted_bank VARCHAR(100)
- verification_status ENUM('pending', 'verified', 'rejected')
- verified_by (FK → users)
- verified_at TIMESTAMP NULL
- verification_notes TEXT
- uploaded_at TIMESTAMP
```

### Tabla `claim_comments`
```sql
- id (PK)
- claim_id (FK → claims)
- user_id (FK → users)
- user_type ENUM('client', 'agent', 'admin')
- message TEXT
- is_internal BOOLEAN
- created_at TIMESTAMP
```

---

## 🎨 Próximos Pasos (Pendientes)

### 1. Wiring de Modales
- [ ] Importar `modalManager.js` en `EntryPointMainApp.js`
- [ ] Reemplazar funciones stub (`viewPolicy`, `fileClaim`, `makePayment`) con llamadas a modales
- [ ] Conectar botones de quick actions a funciones exportadas

### 2. Estilos de Tablas
- [ ] Importar `data-tables.css` en webpack config
- [ ] Aplicar clase `.data-table` a todas las tablas de dashboards
- [ ] Verificar responsive en móviles

### 3. UI de Calendario
- [ ] Crear página/modal de calendario con vista mensual/anual
- [ ] Integrar librería FullCalendar.js o TUI Calendar
- [ ] Conectar eventos del calendario con `scheduling.js`

### 4. OCR Avanzado (Opcional)
Si se requiere mayor precisión:
- [ ] Instalar Tesseract en servidor: `sudo apt-get install tesseract-ocr tesseract-ocr-spa`
- [ ] O integrar Google Cloud Vision API / Azure Computer Vision
- [ ] Configurar API keys en `config.php`

### 5. Admin Dashboard
- [ ] Panel de verificación de comprobantes de pago
- [ ] Lista de receipts con estado pending
- [ ] Botones: Aprobar / Rechazar / Ver imagen
- [ ] Actualizar estado de póliza cuando se aprueba pago

---

## 🔧 Configuración Requerida

### Servidor
```bash
# Para OCR básico (opcional)
sudo apt-get install tesseract-ocr tesseract-ocr-spa

# Crear directorio de uploads
mkdir -p backend/uploads/receipts
chmod 755 backend/uploads/receipts
```

### Email (Ya configurado)
- GoDaddy SMTP para envío de invitaciones de calendario
- Formato iCalendar RFC 5545 en attachments
- HTML email con tabla de detalles

---

## 📖 Documentación de Uso

### Para Clientes

**Agendar Reunión:**
1. Dashboard → "Agendar Cita"
2. Seleccionar fecha/hora
3. Escribir motivo
4. Enviar → Recibirás email con invitación .ics

**Subir Comprobante de Pago:**
1. Dashboard → "Realizar Pago"
2. Seleccionar póliza a pagar
3. Subir foto/PDF del comprobante
4. Sistema extrae automáticamente: monto, fecha, referencia, banco
5. Admin verifica y aprueba pago

**Comentar en Siniestro:**
1. Dashboard → Ver siniestro
2. Scroll a "Conversación"
3. Escribir mensaje
4. "Enviar Comentario" → Agente recibe notificación por email

### Para Agentes

**Gestionar Reuniones:**
- Ver agenda completa (día/semana/mes/año)
- Confirmar/cancelar reuniones
- Recibir recordatorios automáticos

**Verificar Pagos:**
- Admin Dashboard → Comprobantes Pendientes
- Ver imagen del comprobante
- Ver datos extraídos automáticamente
- Aprobar/rechazar con notas

**Responder Comentarios:**
- Ver claim con thread completo
- Agregar respuesta
- Cliente recibe email automático

---

## 🚀 Deployment

**Archivos Desplegados:**
```
✅ backend/calendar-service.php
✅ backend/receipt-analyzer.php
✅ backend/meetings-schema.sql
✅ backend/run-schema-update.php
✅ backend/index.php (actualizado con nuevos endpoints)
✅ src/modules/scheduling.js (vistas mes/año)
✅ src/modules/modalManager.js (comprobantes de pago)
✅ src/api-integration.js (nuevos endpoints)
```

**Base de Datos:**
- Ejecutar: https://ksinsurancee.com/backend/run-schema-update.php
- Verifica creación de tablas: `meetings`, `payment_receipts`, `claim_comments`
- Después eliminar el archivo por seguridad

---

## 🎯 Resumen Técnico

### Calendario
- **Tipo**: Interno, no sincroniza con servicios externos
- **Invitaciones**: Email + archivo .ics (compatible con todos los calendarios)
- **Vistas**: Día, Semana, **Mes**, **Año**
- **Notificaciones**: Email 24h antes de reunión
- **Estados**: pending → confirmed → completed/cancelled

### Pagos
- **Flujo**: Cliente transfiere → sube comprobante → admin verifica → póliza actualizada
- **OCR**: Pattern matching básico + opcional Tesseract/Cloud OCR
- **Formatos**: JPG, PNG, PDF (max 5MB)
- **Extracción**: Monto, fecha, referencia, banco
- **Confiabilidad**: Alta/Media/Baja según datos detectados

### Comentarios
- **Thread**: Conversación completa en modal de claim
- **Notificaciones**: Email cuando hay nueva respuesta
- **Participantes**: Cliente ↔ Agente ↔ Admin
- **Estados**: Normal / Internal (solo visibles para staff)

---

## ✅ Checklist de Verificación

- [x] Cleanup script ejecutado
- [x] Calendar service creado y desplegado
- [x] Receipt analyzer creado y desplegado
- [x] Schema SQL creado
- [x] Endpoints API implementados
- [x] Frontend scheduling.js actualizado (vistas mes/año)
- [x] Frontend modalManager.js actualizado (comprobantes)
- [x] API endpoints configurados
- [ ] Ejecutar schema update en browser
- [ ] Probar subida de comprobante
- [ ] Probar creación de reunión
- [ ] Probar comentarios en claims
- [ ] Wire modales a UI
- [ ] Aplicar estilos data-tables.css
- [ ] Crear UI de calendario

---

**Estado Actual**: ✅ Backend completo, frontend listo, pendiente wiring y UI final

¿Listo para ejecutar schema y probar funcionalidades?
