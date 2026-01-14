# 🤖 Análisis Automático de Pólizas - Guía Técnica

## Contexto: Modelo Broker

Como broker de seguros, **NO emiten pólizas** - las aseguradoras (GNP, AXA, Mapfre, etc.) las emiten. El broker solo:
1. Recibe el documento de la póliza (PDF)
2. Sube al sistema
3. El sistema extrae datos automáticamente
4. Genera calendario de pagos para seguimiento

---

## 📄 ¿Qué extrae el sistema?

### Datos Principales

| Campo | Ejemplos | Patrones Detectados |
|-------|----------|---------------------|
| **Número de Póliza** | POL-2024-001, 12345-ABC | "Número de Póliza:", "Póliza:", "No. Póliza:" |
| **Aseguradora** | GNP, AXA, Mapfre | Lista de aseguradoras conocidas |
| **Prima Total** | $6,000.00 | "Prima Total:", "Suma Asegurada:", "Prima Anual:" |
| **Frecuencia de Pago** | Mensual, Trimestral | "Forma de Pago:", "Periodicidad:" |
| **Fecha Inicio** | 01/01/2024 | "Fecha de Inicio:", "Vigencia desde:" |
| **Fecha Vencimiento** | 01/01/2025 | "Fecha de Vencimiento:", "Vigencia hasta:" |
| **Cliente** | Juan Pérez García | "Asegurado:", "Contratante:", "Nombre:" |

### Aseguradoras Detectadas Automáticamente

- AXA
- GNP (Grupo Nacional Provincial)
- Mapfre
- Seguros Monterrey
- Qualitas
- BBVA Seguros
- Metlife
- Allianz
- Inbursa
- Banorte
- HDI Seguros
- Chubb
- Zurich
- ANA Seguros

---

## 🔍 Cómo Funciona

### Paso 1: Upload del Archivo

```javascript
// Frontend
const formData = new FormData();
formData.append('client_id', 123);
formData.append('policy_file', pdfFile);

const response = await fetch('/backend/payment-api.php/upload-policy', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer token' },
    body: formData
});
```

### Paso 2: Conversión a Texto

El backend intenta convertir el PDF a texto plano usando:

**Opción 1: pdftotext** (si disponible en GoDaddy)
```php
exec("pdftotext archivo.pdf salida.txt");
```

**Opción 2: Tesseract OCR** (para imágenes escaneadas)
```php
exec("tesseract imagen.jpg salida -l spa");
```

**Opción 3: Entrada manual** (si las anteriores fallan)

### Paso 3: Extracción con Regex

```php
// Ejemplo: Número de póliza
$patterns = [
    '/Número de Póliza:\s*([A-Z0-9\-]+)/i',
    '/Póliza:\s*([A-Z0-9\-]+)/i',
    '/No\.\s*Póliza:\s*([A-Z0-9\-]+)/i'
];

foreach ($patterns as $pattern) {
    if (preg_match($pattern, $texto, $matches)) {
        $policyNumber = trim($matches[1]);
        break;
    }
}
```

### Paso 4: Cálculo de Confianza

```php
$requiredFields = ['policy_number', 'total_premium', 'start_date', 'payment_frequency'];
$foundFields = 0;

foreach ($requiredFields as $field) {
    if (!empty($data[$field])) $foundFields++;
}

$confidence = ($foundFields / count($requiredFields)) * 100;

// 75%+ = high
// 50-74% = medium
// <50% = low
```

### Paso 5: Generación Automática

Si confianza >= 75% (high):
```php
// Crear póliza en BD
INSERT INTO policies (policy_number, insurer_name, total_premium, ...)

// Generar calendario automáticamente
CALL sp_generate_payment_schedule(policyId, totalPremium, frequency, startDate)
```

Si confianza < 75%:
```json
{
  "success": true,
  "requires_review": true,
  "data": { ... },
  "confidence": "medium"
}
```

---

## 📊 Niveles de Confianza

### 🟢 High (75%+)
- **Acción:** Procesamiento automático completo
- **Resultado:** Póliza creada + calendario generado
- **Requiere:** Nada, está listo

**Ejemplo:**
```json
{
  "success": true,
  "policy_id": 456,
  "confidence": "high",
  "data": {
    "policy_number": "POL-2024-001",
    "insurer_name": "GNP",
    "total_premium": 6000.00,
    "payment_frequency": 12,
    "start_date": "2024-01-01"
  }
}
```

### 🟡 Medium (50-74%)
- **Acción:** Mostrar datos para revisión
- **Resultado:** Agente revisa y confirma
- **Requiere:** Validación manual

**Ejemplo:**
```json
{
  "success": true,
  "requires_review": true,
  "confidence": "medium",
  "data": {
    "policy_number": "POL-2024-001",
    "insurer_name": "GNP",
    "total_premium": 6000.00,
    "payment_frequency": null,  // ← Faltante
    "start_date": "2024-01-01"
  }
}
```

### 🔴 Low (<50%)
- **Acción:** Solicitar entrada manual
- **Resultado:** Formulario manual disponible
- **Requiere:** Agente completa todos los datos

**Ejemplo:**
```json
{
  "success": false,
  "manual_entry": true,
  "error": "No se pudo extraer texto del PDF. Por favor ingresa los datos manualmente."
}
```

---

## 🛠️ Configuración en GoDaddy

### Verificar Herramientas Disponibles

```php
// Verificar pdftotext
exec('which pdftotext', $output);
echo !empty($output) ? 'Disponible' : 'No disponible';

// Verificar tesseract
exec('which tesseract', $output);
echo !empty($output) ? 'Disponible' : 'No disponible';
```

### Si No Están Disponibles

**Opciones:**
1. Solicitar a GoDaddy instalación (vía ticket de soporte)
2. Usar entrada manual como fallback
3. Usar servicio externo de OCR (Google Vision API, AWS Textract)

**Nota:** El sistema funciona sin estas herramientas, solo requiere entrada manual.

---

## 💡 Mejores Prácticas

### Para Mejorar Precisión

1. **Usar PDFs nativos** (no escaneados)
   - ✅ PDF generado directamente por aseguradora
   - ❌ Escáner de documento físico

2. **Calidad de documento**
   - ✅ Texto seleccionable en el PDF
   - ❌ Imágenes de baja resolución

3. **Formato estándar**
   - ✅ Aseguradoras conocidas (GNP, AXA, etc.)
   - ✅ Pólizas en español
   - ❌ Formatos muy personalizados

### Workflow Recomendado

```
1. Agente sube PDF de póliza
2. Sistema intenta análisis automático
3. Si confianza >= 75%:
   → Procesamiento automático
   → Notificación de éxito
4. Si confianza < 75%:
   → Mostrar datos extraídos
   → Agente revisa/corrige
   → Confirma y genera calendario
5. Si falla completamente:
   → Formulario manual
   → Agente completa campos
   → Genera calendario
```

---

## 🧪 Ejemplos de Uso

### Ejemplo 1: Póliza GNP (Alta Confianza)

**Input:** PDF de póliza GNP con texto nativo

**Salida:**
```json
{
  "success": true,
  "policy_id": 123,
  "confidence": "high",
  "data": {
    "policy_number": "GNP-2024-12345",
    "insurer_name": "GNP",
    "client_name": "Juan Pérez García",
    "total_premium": 12000.00,
    "payment_frequency": 4,  // Trimestral
    "start_date": "2024-01-15",
    "end_date": "2025-01-15"
  },
  "message": "Póliza procesada y calendario generado correctamente"
}
```

**Resultado:** 4 pagos de $3,000 cada uno generados automáticamente.

### Ejemplo 2: Póliza Escaneada (Baja Confianza)

**Input:** Imagen escaneada de póliza

**Salida:**
```json
{
  "success": true,
  "requires_review": true,
  "confidence": "low",
  "data": {
    "policy_number": null,
    "insurer_name": "Mapfre",  // Solo esto detectado
    "total_premium": null,
    "payment_frequency": null,
    "start_date": null
  },
  "message": "Datos extraídos con baja confianza. Por favor revisa y confirma."
}
```

**Acción:** Agente completa campos faltantes manualmente.

### Ejemplo 3: PDF Protegido (Fallo)

**Input:** PDF con protección de copia

**Salida:**
```json
{
  "success": false,
  "manual_entry": true,
  "error": "No se pudo extraer texto del PDF. Por favor ingresa los datos manualmente."
}
```

**Acción:** Formulario manual disponible.

---

## 🔧 Troubleshooting

### Problema: Siempre retorna "manual_entry"

**Causas:**
- pdftotext no instalado
- PDF protegido contra copia
- PDF es imagen escaneada sin OCR

**Solución:**
1. Verificar `which pdftotext` en SSH
2. Probar con PDF diferente (nativo)
3. Usar formulario manual como fallback

### Problema: Confianza siempre "low"

**Causas:**
- Formato de póliza no estándar
- Aseguradora no reconocida
- Patrones de regex no coinciden

**Solución:**
1. Agregar nuevos patrones en `policy-analyzer.php`
2. Agregar aseguradora a lista de detección
3. Revisar logs para ver qué campos no se detectan

### Problema: Extrae datos incorrectos

**Causas:**
- Patrones muy amplios
- Múltiples coincidencias en documento

**Solución:**
1. Refinar regex para ser más específicos
2. Agregar contexto adicional al patrón
3. Priorizar patrones más específicos primero

---

## 📈 Métricas de Éxito

### Medir Efectividad

```sql
-- Tasa de éxito de análisis automático
SELECT 
    COUNT(*) as total_uploads,
    SUM(CASE WHEN auto_generated = 1 THEN 1 ELSE 0 END) as auto_success,
    ROUND(SUM(CASE WHEN auto_generated = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM policies
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);
```

**Meta:** 70%+ de pólizas procesadas automáticamente

---

## 🚀 Mejoras Futuras

### Opcionales (No Implementadas Aún)

1. **Machine Learning**
   - Entrenar modelo con pólizas reales
   - Mejorar detección con IA

2. **API Externa de OCR**
   - Google Cloud Vision API
   - AWS Textract
   - Azure Computer Vision

3. **Validación Cruzada**
   - Verificar número de póliza con aseguradora
   - Validar datos automáticamente

4. **Aprendizaje Adaptativo**
   - Sistema aprende de correcciones manuales
   - Mejora patrones con el tiempo

---

## ✅ Checklist de Implementación

- [x] Clase `PolicyAnalyzer` creada
- [x] Endpoint `/upload-policy` implementado
- [x] Patrones de extracción para español
- [x] Detección de aseguradoras principales
- [x] Cálculo de nivel de confianza
- [x] Fallback a entrada manual
- [x] Frontend con upload de póliza
- [x] Manejo de errores robusto
- [x] Documentación completa

---

## 📞 Soporte

Para agregar nuevos patrones o aseguradoras:
- Editar `backend/policy-analyzer.php`
- Agregar patrones en array `$patterns`
- Agregar aseguradoras en array `$insurers`
- Probar con PDF de prueba
