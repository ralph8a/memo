# Guía de Implementación - Krause Insurance en GoDaddy

## 📋 Resumen del Sistema de Caché

### Arquitectura de Caché
El sistema implementa una estrategia de caché en tres niveles:

1. **LocalStorage Cache** (Frontend)
   - Datos de usuario frecuentes
   - Resultados de API recientes
   - Preferencias y configuraciones

2. **API Cache Layer** (Middleware)
   - Reduce llamadas a la base de datos
   - Mejora tiempos de respuesta
   - Manejo inteligente de invalidación

3. **Database Query Cache** (Backend)
   - Consultas optimizadas
   - Índices apropiados
   - Query result caching

## 🎯 Puntos de Carga Implementados

### 1. **Splash Screen** (`index.html`)
- **Duración**: 10 segundos con countdown
- **Uso**: Página de entrada principal
- **Cachea**: Preferencias de navegación

### 2. **Loading Screen** (`loading.html`)
- **Duración**: 5 segundos con progreso animado
- **Uso**: 
  - Login de clientes/agentes
  - Carga inicial de dashboards
  - Operaciones de base de datos pesadas
  - Pre-caching de datos de usuario
- **Características**:
  - Escudo animado con 12 segmentos
  - "Sabías que..." con 20 datos educativos
  - Estados de carga realistas
  - Redirección automática

### 3. **Puntos de Integración Sugeridos**

#### En el Dashboard de Cliente:
```javascript
// Cargar pólizas con caché
async function loadClientDashboard() {
  try {
    // Mostrar loading screen
    showLoadingScreen();
    
    // Obtener datos con caché
    const policies = await getUserPolicies();
    const payments = await getPaymentHistory();
    const claims = await getClaims();
    
    // Renderizar dashboard
    renderDashboard({ policies, payments, claims });
    
  } catch (error) {
    showNotification('Error al cargar datos', 'error');
  }
}
```

#### En Subida de Archivos:
```javascript
// Upload con progress
async function handleFileUpload(file) {
  const progressBar = showProgressBar();
  
  try {
    await uploadClaimDocument(claimId, file, (percent) => {
      progressBar.update(percent);
    });
    
    showNotification('Archivo subido exitosamente', 'success');
  } catch (error) {
    showNotification('Error al subir archivo', 'error');
  } finally {
    hideProgressBar();
  }
}
```

#### En Descarga de Documentos:
```javascript
// Download con progress
async function handleReceiptDownload(paymentId) {
  const progressBar = showProgressBar();
  
  try {
    await downloadPaymentReceipt(paymentId, (percent) => {
      progressBar.update(percent);
    });
    
    showNotification('Recibo descargado', 'success');
  } catch (error) {
    showNotification('Error al descargar', 'error');
  } finally {
    hideProgressBar();
  }
}
```

## 🗄️ Configuración de Base de Datos (GoDaddy)

### Estructura PHP Backend Recomendada

```
/public_html/
├── api/
│   ├── config/
│   │   ├── database.php      # Conexión MySQL
│   │   └── cache-config.php  # Configuración de caché
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── verify.php
│   ├── users/
│   │   ├── profile.php
│   │   └── policies.php
│   ├── claims/
│   │   ├── list.php
│   │   ├── create.php
│   │   └── upload.php
│   ├── payments/
│   │   ├── history.php
│   │   └── process.php
│   └── documents/
│       ├── upload.php
│       └── download.php
├── uploads/                   # Archivos subidos (protegido)
├── cache/                     # Cache del servidor (777)
└── [archivos frontend]
```

### Ejemplo: database.php
```php
<?php
// GoDaddy MySQL Connection
define('DB_HOST', 'localhost'); // o IP del servidor MySQL
define('DB_NAME', 'krause_insurance_db');
define('DB_USER', 'krause_user');
define('DB_PASS', 'your_secure_password');

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Query with caching
    public function cachedQuery($sql, $params = [], $cacheMinutes = 30) {
        $cacheKey = 'query_' . md5($sql . serialize($params));
        $cacheFile = __DIR__ . '/../cache/' . $cacheKey . '.cache';
        
        // Check cache
        if (file_exists($cacheFile)) {
            $cacheAge = time() - filemtime($cacheFile);
            if ($cacheAge < ($cacheMinutes * 60)) {
                return json_decode(file_get_contents($cacheFile), true);
            }
        }
        
        // Execute query
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll();
        
        // Save to cache
        file_put_contents($cacheFile, json_encode($result));
        
        return $result;
    }
}
?>
```

### Ejemplo: api/users/policies.php
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

// Verify JWT token
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

// Decode and verify token (implement JWT verification)
$userId = verifyToken($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Get user policies with caching (30 minutes)
$db = Database::getInstance();
$sql = "SELECT * FROM policies WHERE user_id = ? ORDER BY created_at DESC";
$policies = $db->cachedQuery($sql, [$userId], 30);

echo json_encode([
    'success' => true,
    'data' => $policies
]);
?>
```

## 📤 Manejo de Subida de Archivos

### api/documents/upload.php
```php
<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Verificar autenticación
$userId = verifyToken($_SERVER['HTTP_AUTHORIZATION']);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file'];
    
    // Validaciones
    $maxSize = 10 * 1024 * 1024; // 10MB
    $allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['error' => 'File too large']);
        exit;
    }
    
    if (!in_array($fileExt, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type']);
        exit;
    }
    
    // Generar nombre único
    $fileName = uniqid() . '_' . time() . '.' . $fileExt;
    $uploadDir = __DIR__ . '/../../uploads/documents/';
    $uploadPath = $uploadDir . $fileName;
    
    // Crear directorio si no existe
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Mover archivo
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Guardar en base de datos
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO documents (user_id, filename, original_name, file_path, file_size, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$userId, $fileName, $file['name'], $uploadPath, $file['size']]);
        
        $documentId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'document_id' => $documentId,
            'filename' => $fileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Upload failed']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
}
?>
```

## 🔧 Configuración en GoDaddy

### 1. Subir Archivos
```bash
# Estructura de carpetas en GoDaddy
/public_html/
├── memo/                    # Tu aplicación frontend
│   ├── index.html
│   ├── app.html
│   ├── loading.html
│   ├── app.css
│   ├── app.js
│   ├── cache-manager.js
│   └── api-integration.js
├── api/                     # Backend PHP
│   └── [archivos PHP]
├── uploads/                 # 755 permisos
└── cache/                   # 777 permisos
```

### 2. Actualizar api-integration.js
```javascript
const API_CONFIG = {
  BASE_URL: 'https://www.krauseinsurances.com/api',  // Tu dominio real
  // ... resto de configuración
};
```

### 3. Configurar .htaccess
```apache
# En /public_html/.htaccess

# Habilitar compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache estático
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# Proteger uploads
<IfModule mod_rewrite.c>
  RewriteEngine On
  # Bloquear acceso directo a uploads
  RewriteRule ^uploads/(.*)$ api/documents/download.php?file=$1 [L]
</IfModule>
```

## 🚀 Optimizaciones de Performance

### 1. LocalStorage Strategy
- **Políticas**: Cache MEDIUM (30 min)
- **Datos usuario**: Cache LONG (24h)
- **Contenido estático**: Cache PERMANENT
- **Datos en tiempo real**: Cache SHORT (5 min)

### 2. Pre-fetching
```javascript
// Pre-cargar datos comunes al iniciar sesión
async function prefetchCommonData(userId) {
  const prefetchPromises = [
    getUserPolicies(),
    getPaymentHistory(),
    getUserProfile()
  ];
  
  await Promise.all(prefetchPromises);
  console.log('✅ Common data pre-cached');
}
```

### 3. Invalidación Inteligente
```javascript
// Invalidar caché relacionado después de actualizaciones
function invalidateUserData() {
  cacheManager.clearUserCache(getCurrentUserId());
  // Re-fetch datos críticos
  getUserPolicies(true); // forceRefresh = true
}
```

## 📊 Monitoreo de Caché

### Ver estadísticas
```javascript
// En consola del navegador
console.log(cacheManager.getCacheStats());

// Output:
// {
//   totalEntries: 12,
//   validEntries: 10,
//   expiredEntries: 2,
//   totalSize: "45.23 KB"
// }
```

## 🔐 Seguridad

### 1. Proteger API Endpoints
- Implementar JWT tokens
- Validar origen de requests (CORS)
- Rate limiting en servidor
- Sanitizar inputs

### 2. Proteger Archivos Subidos
- Validar tipos de archivo
- Escanear por malware
- Almacenar fuera de public_html si es posible
- Generar URLs firmadas para descargas

### 3. Limpiar Caché Sensible
```javascript
// Al hacer logout
function secureLogout() {
  logoutUser(); // Limpia caché de usuario
  cacheManager.clearAllCache(); // Limpia todo
  apiService.clearAuthToken();
  window.location.href = 'index.html';
}
```

## 📱 Testing en Producción

### Checklist Post-Deployment
- [ ] Verificar conexión a base de datos
- [ ] Probar login/logout
- [ ] Verificar caché funciona correctamente
- [ ] Probar subida de archivos
- [ ] Probar descarga de documentos
- [ ] Verificar loading screens
- [ ] Comprobar permisos de carpetas (uploads, cache)
- [ ] Probar en diferentes navegadores
- [ ] Verificar responsive design
- [ ] Monitorear performance en consola

---

**Última actualización**: Diciembre 2025  
**Versión**: 1.0.0
