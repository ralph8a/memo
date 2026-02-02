# 🚀 Instrucciones de Deploy Manual - Fix GROUP BY

## ✅ Fix Aplicado

**Commit:** `a2109dd - fix(backend): correct GROUP BY clause in getAgentClients query`

**Problema resuelto:** Error 500 al cargar dashboard de agentes debido a consulta SQL con GROUP BY incompleto.

**Cambio realizado:** Se agregaron todos los campos no-agregados al GROUP BY en la función `getAgentClients()`.

```sql
-- ANTES (causaba error):
GROUP BY u.id

-- DESPUÉS (correcto):
GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.region
```

---

## 📦 Archivo para Subir

- **Archivo:** `backend-fix-groupby.zip`
- **Contiene:** `api-endpoints.php` (versión corregida)
- **Ubicación local:** `C:\react\backend-fix-groupby.zip`

---

## 📋 Instrucciones de Deploy via cPanel

### Opción 1: File Manager (Recomendado)

1. **Accede a cPanel**
   - URL: https://ksinsurancee.com:2083
   - Usuario: `nhs13h5k`
   - Password: (tu password de cPanel)

2. **Abre File Manager**
   - Click en "File Manager" en cPanel
   - Navega a: `public_html/backend`

3. **Respalda el archivo actual**
   - Localiza `api-endpoints.php`
   - Click derecho → Rename → `api-endpoints.php.backup`

4. **Sube el nuevo archivo**
   - Click en "Upload"
   - Selecciona `backend-fix-groupby.zip`
   - Espera a que se complete la subida

5. **Extrae el archivo**
   - Click derecho en `backend-fix-groupby.zip`
   - Select "Extract"
   - El archivo `api-endpoints.php` se extraerá

6. **Limpieza**
   - Elimina `backend-fix-groupby.zip`
   - (Opcional) Elimina `api-endpoints.php.backup` después de verificar

---

### Opción 2: Upload directo del archivo PHP

1. **Accede a cPanel File Manager**
   - Navega a `public_html/backend`

2. **Reemplaza directamente**
   - Click en "Upload"
   - Selecciona `C:\react\backend\api-endpoints.php`
   - Confirma sobrescribir

---

## ✅ Verificación

Después de subir, verifica que el dashboard funcione:

1. Accede a https://ksinsurancee.com
2. Login como agente (Guillermo)
3. Verifica que el dashboard cargue sin error 500
4. Revisa que aparezcan:
   - Estadísticas de clientes
   - Lista de clientes
   - Reclamaciones pendientes

---

## 🔧 Si el problema persiste

Ejecuta el diagnóstico:
1. Sube `backend/diagnostic.php` al servidor
2. Accede a https://ksinsurancee.com/backend/diagnostic.php
3. Verifica:
   - ✅ Conexión a BD exitosa
   - ✅ Tablas existen: users, policies, claims
   - ✅ Hay datos de prueba

---

## 📝 Archivos Disponibles

- ✅ `backend-fix-groupby.zip` - ZIP con api-endpoints.php corregido
- ✅ `backend/api-endpoints.php` - Archivo fuente
- ✅ `backend/diagnostic.php` - Script de diagnóstico DB
- ✅ `backend/check-tables.php` - Verificador de tablas
- ✅ `backend/test-simple.php` - Test básico backend

---

## 🎯 Siguiente paso

Una vez subido el archivo, el error 500 debería desaparecer y el dashboard de agentes funcionará correctamente.

Si necesitas ayuda adicional, contacta al equipo técnico.
