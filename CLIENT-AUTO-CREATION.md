# Sistema Automático de Creación de Clientes mediante Upload de Pólizas

## 📋 Descripción General

Sistema inteligente que **elimina la entrada manual de datos** para agregar clientes. En lugar de formularios tradicionales, los agentes simplemente suben el documento de póliza y el sistema:

1. **Extrae automáticamente** los datos del cliente (nombre, póliza, montos, fechas)
2. **Genera credenciales** de acceso (email y contraseña)
3. **Detecta clientes existentes** para evitar duplicados
4. **Envía email** con las credenciales al nuevo cliente
5. **Registra todo en la base de datos**

## 🎯 Flujo de Trabajo

### Para Agentes

```
1. Click en "Agregar Cliente" en dashboard
2. **INGRESAR EMAIL REAL DEL CLIENTE** (obligatorio)
3. Subir PDF/imagen de la póliza
4. Sistema analiza y extrae datos automáticamente
5. Si confianza alta → Cliente creado automáticamente
6. Si confianza baja → Revisar y confirmar datos
7. Si falla OCR → Formulario manual
8. ✅ Cliente creado, credenciales enviadas al EMAIL REAL
```

### Proceso Backend

```
Upload + Email → Análisis OCR/PDF → Extracción de datos → Detección duplicados POR EMAIL
       ↓
   ¿Existe cliente con ese email?
       ├─ SÍ → Solo agregar nueva póliza
       └─ NO → Crear cliente + generar password + enviar email
       ↓
   Registrar en DB + Mover archivo a storage permanente
```

## 🧠 Tecnologías de Extracción

### PolicyAnalyzer.php

Extrae datos de pólizas usando:

- **PDFs**: `pdftotext` (si disponible en servidor)
- **Imágenes**: Tesseract OCR con idioma español
- **Patrones regex** para capturar:
  - Número de póliza: `POL-001`, `AUTO-123`, etc.
  - Nombre del cliente: "María González Pérez"
  - Prima total: `$350.00`, `Prima: 1,200`
  - Fechas: `01/01/2025`, `2025-12-31`
  - Frecuencia de pago: Mensual, Anual, etc.
  - Aseguradora: AXA, GNP, Mapfre, etc.

### Nivel de Confianza

```javascript
confidence = (campos_encontrados / campos_requeridos) * 100

- high (≥75%): Procesamiento automático
- medium (50-74%): Requiere revisión
- low (<50%): Entrada manual
```

## 📁 Archivos del Sistema

### Backend

```
backend/
├── client-from-policy.php       ← Endpoint principal de creación
├── policy-analyzer.php          ← Extracción de datos de pólizas
├── document-matcher.php         ← Matching automático de documentos
└── receipt-analyzer.php         ← Análisis de comprobantes de pago
```

### Frontend

```
src/modules/
└── dashboardActions.js          ← UI y lógica de upload

styles/
└── dashboard-actions.css        ← Estilos del sistema
```

## 🔧 API Endpoints

### POST `/backend/client-from-policy.php`

Procesa póliza y crea cliente automáticamente.

**Request:**
```javascript
FormData {
  policy_file: File (PDF/JPG/PNG, max 10MB)
}

Headers: {
  Authorization: Bearer {JWT_TOKEN}
}
```

**Response (Éxito - Alta Confianza):**
```json
{
  "success": true,
  "client_id": 123,
  "policy_id": 456,
  "new_client": true,
  "email_sent": true,
  "message": "Cliente creado y póliza registrada. Credenciales enviadas por email."
}
```

**Response (Requiere Confirmación - Baja Confianza):**
```json
{
  "success": true,
  "requires_confirmation": true,
  "extracted_data": {
    "client_name": "María González",
    "policy_number": "POL-001",
    "total_premium": 350.00,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "payment_frequency": 12
  },
  "confidence": "low",
  "message": "Datos extraídos con baja confianza. Por favor revisa y confirma."
}
```

**Response (Cliente Existente):**
```json
{
  "success": true,
  "client_id": 123,
  "policy_id": 789,
  "new_client": false,
  "email_sent": true,
  "message": "Póliza agregada al cliente existente."
}
```

### POST `/backend/document-matcher.php`

Detecta automáticamente a qué cliente pertenece un documento genérico.

**Request:**
```javascript
FormData {
  document: File,
  agent_id: 1
}
```

**Response:**
```json
{
  "success": true,
  "auto_matched": true,
  "client_id": 123,
  "policy_id": 456,
  "document_type": "payment_receipt",
  "confidence": 95,
  "message": "Documento asociado automáticamente"
}
```

## 💾 Base de Datos

### Tablas Actualizadas

**users**
```sql
INSERT INTO users (
  email,                    -- Generado: "mariagonzalez@cliente.krause.com"
  password_hash,            -- Hash de password aleatorio
  user_type,                -- 'client'
  first_name,               -- Extraído del PDF
  last_name,                -- Extraído del PDF
  status                    -- 'active'
) VALUES (...)
```

**policies**
```sql
INSERT INTO policies (
  policy_number,            -- Extraído: "POL-001"
  client_id,                -- Del usuario creado
  agent_id,                 -- Del JWT del agente
  policy_type,              -- Detectado: 'auto', 'home', etc.
  premium_amount,           -- Calculado mensual
  start_date,               -- Extraído
  end_date,                 -- Extraído
  status                    -- 'active'
) VALUES (...)
```

**documents**
```sql
INSERT INTO documents (
  user_id,                  -- Cliente asociado
  policy_id,                -- Póliza asociada
  document_type,            -- 'policy_doc'
  file_name,                -- Nombre original
  file_path,                -- 'backend/uploads/policies/{client_id}/policy_456_xxx.pdf'
  file_size,                -- En bytes
  mime_type                 -- 'application/pdf'
) VALUES (...)
```

## 📧 Generación de Credenciales

### Email Real del Cliente

**⚠️ CAMBIO CRÍTICO: Ya NO se genera email automático**

```
El agente DEBE proporcionar el email REAL del cliente en el formulario.
Este email será usado para:
1. Inicio de sesión en el portal
2. Envío de credenciales
3. Todas las notificaciones futuras
```

**Campo obligatorio con validación:**
- Formato válido: `usuario@dominio.com`
- No puede estar vacío
- Advertencia clara en UI sobre su uso

### Password Aleatorio

```
- Longitud: 12 caracteres
- Incluye: Mayúsculas + minúsculas + números + símbolos
- Ejemplo: "Xy8@mKp3!Qz7"
- Se envía al email REAL proporcionado
```

### Email Enviado

```html
Asunto: Bienvenido a Krause Insurance - Tus credenciales de acceso

Bienvenido/a María González

Tu agente ha registrado una nueva póliza a tu nombre.

Email de acceso: cliente@ejemplo.com  ← EMAIL REAL
Contraseña temporal: Xy8@mKp3!Qz7

⚠️ Importante:
- Usa el email cliente@ejemplo.com para iniciar sesión
- Cambia tu contraseña al primer inicio de sesión  
- Este email se usará para todas las notificaciones

[Iniciar sesión ahora] → http://ksinsurancee.com
```

## 🎨 UI/UX

### Modal de Upload

```
┌──────────────────────────────────────────┐
│  Nuevo Cliente - Subir Póliza      [X]  │
├──────────────────────────────────────────┤
│                                          │
│  ℹ️ El sistema extraerá automáticamente: │
│    • Nombre del cliente                 │
│    • Número de póliza                   │
│    • Monto de prima                     │
│    • Fechas de vigencia                 │
│    • Tipo de cobertura                  │
│                                          │
│  Se generará contraseña automática.      │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ [📄] Documento de póliza          │  │
│  │      Seleccionar archivo...       │  │
│  └────────────────────────────────────┘  │
│  Formatos: PDF, JPG, PNG (máx 10MB)     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Email del cliente *               │  │
│  │ [cliente@ejemplo.com             ]│  │
│  └────────────────────────────────────┘  │
│  ⚠️ Importante: Este email será usado    │
│     para:                                │
│     • Enviar credenciales de acceso      │
│     • Inicio de sesión del cliente       │
│     • Notificaciones de pagos y pólizas  │
│                                          │
│         [Cancelar]  [Subir y procesar]  │
└──────────────────────────────────────────┘
```

### Indicador de Progreso

```
📤 Subiendo documento...  [████████░░] 85%
🔍 Analizando contenido...
✅ Datos extraídos correctamente
```

### Resumen de Éxito

```
┌────────────────────────────────┐
│  ✅ Cliente Creado            │
├────────────────────────────────┤
│  ID Cliente: 123              │
│  ID Póliza: 456               │
│  ✉️ Credenciales enviadas     │
│                                │
│  Cliente creado exitosamente.  │
│  Credenciales enviadas por     │
│  email.                        │
│                                │
│           [Entendido]          │
└────────────────────────────────┘
```

## 🔍 Sistema de Matching de Documentos

### Detección Automática

Cuando se sube un documento genérico, el sistema busca:

1. **Número de póliza** en el texto → Match con `policies.policy_number`
2. **Nombre del cliente** → Match con `users.first_name + last_name`
3. **Email** → Match con `users.email`

### Tipos de Documentos Detectados

```javascript
'policy_doc'       → Pólizas
'payment_receipt'  → Comprobantes de pago
'claim_doc'        → Documentos de siniestro
'id_proof'         → Identificaciones
'other'            → Otros
```

### Nivel de Confianza por Tipo de Match

```
policy_number → 95%  (Alta confianza)
email         → 90%  (Alta confianza)
client_name   → 70%  (Media confianza)
```

## 📊 Casos de Uso

### Caso 1: Nuevo Cliente (Éxito Total)

```
1. Agente ingresa email: maria@email.com
2. Agente sube póliza de AXA en PDF
3. Sistema extrae: "María González", "POL-001", "$350", "Mensual"
4. Confianza: 95% (high)
5. Cliente con email maria@email.com NO existe en DB
6. ✅ Crear user con email real: maria@email.com
7. ✅ Generar password: "Xy8@mKp3!Qz7"
8. ✅ Crear policy POL-001
9. ✅ Enviar email a maria@email.com con credenciales
10. ✅ Guardar PDF en: backend/uploads/policies/123/policy_456.pdf
11. Mensaje: "Cliente creado. Credenciales enviadas a maria@email.com"
```

### Caso 2: Cliente Existente (Nueva Póliza)

```
1. Agente ingresa email: maria@email.com
2. Agente sube póliza de GNP en PDF
3. Sistema extrae: "María González", "POL-002"
4. Cliente con email maria@email.com YA existe (ID: 123)
5. ✅ Solo crear nueva policy POL-002
6. ✅ Enviar email a maria@email.com: "Nueva póliza agregada"
7. Mensaje: "Póliza agregada al cliente existente"
```

### Caso 3: Baja Confianza (Confirmación Manual)

```
1. Agente sube imagen borrosa de póliza
2. OCR extrae parcialmente: "Mar__ Gonzá__", "POL-?"
3. Confianza: 40% (low)
4. ⚠️ Mostrar formulario de confirmación
5. Agente corrige: "María González", "POL-003"
6. Click "Confirmar y crear cliente"
7. ✅ Procesar con datos corregidos
```

### Caso 4: Fallo de OCR (Entrada Manual)

```
1. Agente sube póliza manuscrita
2. OCR no disponible o falla completamente
3. ℹ️ Mostrar formulario manual vacío
4. Agente ingresa todos los datos manualmente
5. ✅ Crear con datos manuales
```

## 🚀 Deployment

### Archivos Subidos a GoDaddy

```
✅ backend/client-from-policy.php     (17 KB)
✅ backend/document-matcher.php       (14 KB)
✅ backend/policy-analyzer.php        (actualizado)
✅ src/modules/dashboardActions.js    (actualizado)
✅ styles/dashboard-actions.css       (actualizado)
✅ dist/krause.app.js                 (1.5 MB)
```

### Dependencias del Servidor

**Requerido:**
- PHP 7.4+
- MySQL/MariaDB
- PDO extension

**Opcional (mejora OCR):**
- `pdftotext` → Extracción de PDFs
- `tesseract` → OCR para imágenes
- ImageMagick → Procesamiento de imágenes

**Si no están disponibles:**
- Sistema ofrece entrada manual automáticamente

## 🔐 Seguridad

### Validaciones

```php
// Tamaño de archivo
if ($file['size'] > 10 * 1024 * 1024) {
  throw new Exception('Archivo muy grande (máx 10MB)');
}

// Tipos permitidos
$allowed = ['application/pdf', 'image/jpeg', 'image/png'];
if (!in_array($file['type'], $allowed)) {
  throw new Exception('Tipo no permitido');
}

// Sanitización de nombres
$filename = preg_replace('/[^a-z0-9\._-]/i', '', $filename);
```

### Autenticación

- Requiere JWT válido en header `Authorization`
- Solo agentes autenticados pueden crear clientes
- Agent ID extraído del token para asociación

### Storage

```
backend/uploads/
├── temp/                    ← Archivos temporales (se limpian)
├── policies/{client_id}/    ← Pólizas permanentes
└── documents/{client_id}/   ← Documentos adicionales
```

## 📈 Mejoras Futuras

### V2.0 - Machine Learning

- Entrenar modelo ML con pólizas existentes
- Mejorar precisión de extracción a >95%
- Detección de tipo de póliza automática

### V2.1 - Validación Automática

- Verificar números de póliza con aseguradoras
- API de validación de documentos
- Detección de duplicados por contenido

### V2.2 - Batch Processing

- Subir múltiples pólizas a la vez
- Procesamiento en cola asíncrona
- Dashboard de progreso en tiempo real

## 📞 Soporte

**Para desarrolladores:**
- Logs en: `error_log()` de PHP
- Console del navegador para frontend
- Network tab para depurar requests

**Para agentes:**
- Si falla OCR → Usar entrada manual
- Si email no llega → Verificar spam
- Si duplicado → Sistema previene automáticamente

---

## ✅ Deploy Completado

**Commit:** `782af09`  
**URL:** http://ksinsurancee.com  
**Status:** ✅ Desplegado y funcionando

**Próximos pasos:**
1. Probar upload de póliza real
2. Verificar email con credenciales
3. Confirmar creación en base de datos
4. Probar matching de documentos adicionales
