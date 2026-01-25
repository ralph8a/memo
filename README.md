# Krause Insurance Platform

Sistema de gestión de seguros con portales diferenciados para clientes, agentes y administradores.

## 🚀 Características Principales

### Portales
- **Cliente**: Gestión de pólizas, pagos, reclamaciones
- **Agente**: Panel de clientes, pagos, pólizas, mensajería directa
- **Admin**: Administración completa del sistema

### Funcionalidades
- ✅ Autenticación JWT
- ✅ Gestión de pólizas y pagos
- ✅ Sistema de notificaciones contextual
- ✅ Mensajería directa (42 horas de expiración)
- ✅ Búsqueda global
- ✅ Calendario de citas
- ✅ Carga de comprobantes de pago
- ✅ Temas: Light y Dark Forest
- ✅ Responsive design

## 🛠️ Stack Tecnológico

### Frontend
- Vanilla JavaScript (ES6+)
- Webpack 5
- CSS custom properties
- PWA ready

### Backend
- PHP 7.4+
- MySQL 8.0+
- JWT Authentication
- REST API

## 📁 Estructura del Proyecto

```
c:\react\
├── src/                    # Código fuente JS
│   ├── core/              # Sistema principal
│   ├── modules/           # Módulos funcionales
│   └── utils/             # Utilidades
├── styles/                # Hojas de estilo
│   ├── pages/            # Estilos por página
│   └── dashboards/       # Estilos de dashboards
├── backend/              # APIs PHP
├── public/               # Archivos estáticos
├── scripts/              # Scripts de deploy
└── dist/                 # Build de producción
```

## 🚀 Desarrollo

### Instalación
```bash
npm install
```

### Desarrollo local
```bash
npm run dev
```

### Build de producción
```bash
npm run build
```

### Deploy a producción
```bash
node scripts/deploy-winscp.js
```

## 🔑 Configuración

### Variables de entorno (.env)
```env
SFTP_HOST=208.109.62.140
SFTP_PORT=22
SFTP_USER=nhs13h5k0x0j
SFTP_KEY_PATH=nhs13h5k0x0j_pem
REMOTE_DIR=/home/nhs13h5k0x0j/public_html
```

### Base de datos
Ver `backend/database-schema.sql` para el esquema completo.

## 📡 API Endpoints

### Autenticación
- `POST /backend/auth.php?action=login`
- `POST /backend/auth.php?action=register`

### Dashboards
- `GET /backend/index.php?action=client_dashboard`
- `GET /backend/index.php?action=agent_dashboard`
- `GET /backend/index.php?action=admin_dashboard`

### Mensajería Directa
- `POST /backend/direct-messages-api.php?action=start-thread`
- `POST /backend/direct-messages-api.php?action=reply`
- `GET /backend/direct-messages-api.php?action=my-threads`
- `GET /backend/direct-messages-api.php?action=unread-count`

### Búsqueda
- `GET /backend/index.php?action=global_search&q={query}`

### Notificaciones
- `GET /backend/notification-api.php?action=get-notifications`
- `POST /backend/notification-api.php?action=mark-read`

Ver `backend/api-endpoints.php` para documentación completa.

## 🎨 Temas

### Light Theme
Tema claro predeterminado.

### Dark Forest
Tema oscuro con paleta verde bosque.

Cambio automático con botón en header.

## 🔒 Seguridad

- Autenticación JWT
- Validación de permisos por rol
- Sanitización de inputs
- Prepared statements en SQL
- HTTPS en producción

## 📱 PWA

El proyecto incluye:
- Service Worker
- Manifest.json
- Soporte offline básico
- Instalable en móviles

## 🌐 Deploy

### Servidor de producción
- Host: krause.app (208.109.62.140)
- Puerto SSH: 22
- Usuario: nhs13h5k0x0j

### Proceso de deploy
1. Build local: `npm run build`
2. Deploy automático via WinSCP: `node scripts/deploy-winscp.js`
3. Archivos desplegados a `/home/nhs13h5k0x0j/public_html`

## 📝 Mantenimiento

### Limpieza de mensajes directos
Los mensajes directos se auto-eliminan después de 42 horas.
Limpieza automática en cada request a la API.

### Logs
Los logs de desarrollo se guardan en consola.
Producción usa error_log de PHP.

## 👥 Roles de Usuario

### Cliente (client)
- Ver pólizas propias
- Realizar pagos
- Presentar reclamaciones
- Responder mensajes directos del agente

### Agente (agent)
- Ver todos los clientes asignados
- Gestionar pólizas
- Iniciar mensajes directos
- Ver pagos pendientes
- Generar reportes

### Administrador (admin)
- Acceso completo al sistema
- Gestión de usuarios
- Configuración global
- Reportes avanzados

## 🐛 Troubleshooting

### Dashboard no carga datos
- Verificar token JWT válido
- Verificar conexión a API backend
- Revisar consola del navegador

### Tema oscuro en modales
- Verificar que `body.dark-forest` esté activo
- Verificar `dashboard-components.css` tiene overrides

### Mensajería directa
- Solo agentes pueden iniciar conversaciones
- Mensajes expiran en 42 horas
- Cliente solo puede responder

## 📄 Licencia

Propiedad de Krause Insurance © 2026
