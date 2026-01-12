# Diagnóstico: Conexión de Usuarios Reales a Dashboards

## 🔍 Análisis del Sistema de Autenticación

### ✅ Componentes Implementados Correctamente

1. **Backend (PHP)**
   - ✅ `backend/auth.php` - Generación y verificación de JWT
   - ✅ `backend/index.php` - Endpoint `/login` funcional
   - ✅ `backend/database.php` - Conexión a base de datos
   - ✅ Campo `user_type` en tabla `users` (client, agent, admin)

2. **Frontend (JavaScript)**
   - ✅ `src/modules/auth.js` - Función `login()` con fallback a API
   - ✅ `src/api-integration.js` - `loginUser()` hace fetch a backend
   - ✅ `src/core/EntryPointMainApp.js` - Navegación basada en `user.type`
   - ✅ `src/modules/dashboardLoaders.js` - `loadAgentDashboard()` y `loadClientDashboard()`

### 📋 Flujo de Autenticación (Implementado)

```
Usuario ingresa credenciales
        ↓
auth.js → login(credentials, type)
        ↓
API attempt → loginUser(email, password)
        ↓
Backend → /backend/index.php endpoint=login
        ↓
Database query → SELECT * FROM users WHERE email = ?
        ↓
Password verify → password_verify(input, hash)
        ↓
JWT generation → Auth::generateToken(userId, userType, email)
        ↓
Response → { success: true, token: "...", user: {...} }
        ↓
Frontend → setUser(user) + localStorage.setItem('auth_token')
        ↓
Navegación → navigateTo(user.type === 'agent' ? 'agent-dashboard' : 'client-dashboard')
        ↓
Dashboard carga → loadAgentDashboard() o loadClientDashboard()
```

## 🐛 Posibles Causas del Problema

### 1. **Usuarios No Existen en Base de Datos**
**Síntoma:** Login falla y usa credenciales demo
**Verificación:**
```sql
SELECT id, email, user_type FROM users;
```
**Solución:** Crear usuarios de prueba con script `fix-passwords.php`

### 2. **Contraseñas No Hasheadas Correctamente**
**Síntoma:** `password_verify()` siempre retorna false
**Verificación:** Contraseñas en DB deben empezar con `$2y$`
**Solución:** Ejecutar `fix-passwords.php` para hashear contraseñas

### 3. **CORS Bloqueando Requests**
**Síntoma:** Error en consola "blocked by CORS policy"
**Verificación:** Headers en `backend/index.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```
**Estado:** ✅ Ya implementado en líneas 2-7 de index.php

### 4. **Base de Datos No Conecta**
**Síntoma:** Error "Could not connect to database"
**Verificación:** Credenciales en `backend/config.php`
**Solución:** Verificar DB_HOST, DB_NAME, DB_USER, DB_PASS

### 5. **Token JWT No Se Guarda/Envía Correctamente**
**Síntoma:** Dashboards cargan pero API requests fallan con 401
**Verificación:**
```javascript
// En consola del navegador
localStorage.getItem('auth_token')
```
**Solución:** Verificar que `api-integration.js` incluye token en headers

## 🔧 Pasos de Diagnóstico (Recomendados)

### Paso 1: Verificar Usuarios en Base de Datos
```bash
# En servidor, ejecutar:
php backend/list-users.php
```
**Esperado:** Lista de usuarios con emails y user_type

### Paso 2: Probar Login Directo con Backend
```bash
# Prueba simple de login:
php backend/simple-login-test.php
```
**Esperado:** JSON con token y datos de usuario

### Paso 3: Verificar Consola del Navegador
```javascript
// Al intentar login, revisar Network tab:
// 1. Request a /backend/index.php?endpoint=login
// 2. Response status (debe ser 200)
// 3. Response body (debe incluir "success": true)
```

### Paso 4: Verificar Estado de Sesión
```javascript
// En consola del navegador después de login:
window.dashboardData
localStorage.getItem('auth_token')
```

## 🚀 Soluciones Implementadas

### ✅ Sistema Ya Funcional (con fallback)
El código actual tiene:
1. **Intento de API real** → Si falla, cae a modo demo
2. **Token JWT** → Se guarda en localStorage
3. **Estado de usuario** → Se guarda en state.js
4. **Navegación automática** → Basada en user.type

### 🔄 Lo Que Falta (Posibles Issues)

1. **Usuarios Demo vs Reales:**
   - Demo: `demo@krause.com` / `demo123`
   - Reales: Deben estar en base de datos con contraseñas hasheadas

2. **API Endpoint URL:**
   - Verificar que `API_CONFIG.BASE_URL` apunta a servidor correcto
   - Archivo: `src/api-integration.js` línea ~15

3. **Database Connection:**
   - Verificar credenciales en `backend/config.php`
   - Servidor debe tener extensión PDO MySQL habilitada

## 📝 Script de Verificación Rápida

```javascript
// Ejecutar en consola del navegador para diagnosticar:
async function testBackendConnection() {
    try {
        const response = await fetch('http://ksinsurancee.com/backend/index.php?endpoint=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'demo@krause.com',
                password: 'demo123'
            })
        });
        const data = await response.json();
        console.log('Backend response:', data);
        return data;
    } catch (error) {
        console.error('Backend error:', error);
        return { error: error.message };
    }
}

testBackendConnection();
```

## 🎯 Recomendación Inmediata

**Para conectar usuarios reales:**

1. **Acceder a servidor y verificar base de datos:**
   ```bash
   php backend/check-users.php
   ```

2. **Si no hay usuarios, crear uno de prueba:**
   ```sql
   INSERT INTO users (email, password, first_name, last_name, user_type, created_at)
   VALUES (
       'agente@krause.com',
       '$2y$10$YourHashedPasswordHere',  -- Usar fix-passwords.php
       'Juan',
       'Agente',
       'agent',
       NOW()
   );
   ```

3. **Probar login con usuario real:**
   - Email: `agente@krause.com`
   - Password: (la que hayas configurado)

4. **Verificar en consola del navegador:**
   - Network tab → Request a backend
   - Console → Mensajes de error si los hay

## 📊 Estado Actual del Sistema

| Componente | Estado | Notas |
|------------|--------|-------|
| Backend API | ✅ Implementado | Endpoints funcionan |
| JWT Auth | ✅ Implementado | Tokens se generan correctamente |
| Frontend Login | ✅ Implementado | Con fallback a demo |
| Database Schema | ✅ Implementado | Tabla users existe |
| Password Hashing | ⚠️ Verificar | Usar fix-passwords.php |
| Usuarios Reales | ❓ Desconocido | Verificar con check-users.php |
| CORS Headers | ✅ Configurado | Permite requests desde frontend |

## 🔗 Archivos Clave para Revisar

1. `backend/config.php` - Credenciales de base de datos
2. `backend/index.php` - Endpoint de login (línea 73-105)
3. `src/api-integration.js` - URL de API (línea 15-18)
4. `src/modules/auth.js` - Lógica de login (línea 18-45)
5. `backend/list-users.php` - Script para listar usuarios

## 💡 Tip de Debugging

Habilitar logs verbosos temporalmente:

```javascript
// En src/api-integration.js, agregar al inicio de loginUser():
console.log('[API] Attempting login with:', { email, password: '***' });

// En src/modules/auth.js, agregar en catch:
console.error('[AUTH] Full error details:', error);
```

Esto mostrará exactamente dónde falla el proceso de autenticación.
