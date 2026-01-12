# 🔒 Guía para Habilitar HTTPS en GoDaddy cPanel

## ✅ OPCIÓN 1: SSL Gratuito de GoDaddy (MÁS FÁCIL)

### Pasos en cPanel:
1. **Login a cPanel** → https://ksinsurancee.com:2083
2. **Buscar "SSL/TLS Status"** en el panel de búsqueda
3. **Run AutoSSL** para `ksinsurancee.com`
4. **Esperar 5-10 minutos** mientras se instala

### Si AutoSSL no está disponible:
1. **cPanel → SSL/TLS**
2. **"Manage SSL Sites"**
3. Buscar si hay un certificado disponible
4. Contactar soporte de GoDaddy (suelen activarlo gratis)

---

## ✅ OPCIÓN 2: Cloudflare SSL (GRATIS - 100% FUNCIONAL)

### Ventajas:
- ✅ Gratis para siempre
- ✅ SSL/TLS automático
- ✅ CDN global (sitio más rápido)
- ✅ Protección DDoS
- ✅ No necesita acceso root

### Pasos:

#### 1. Crear cuenta Cloudflare
```
https://dash.cloudflare.com/sign-up
```

#### 2. Agregar sitio
- Click "Add a Site"
- Ingresa: `ksinsurancee.com`
- Plan: **Free** (seleccionar)

#### 3. Verificar registros DNS
Cloudflare detectará automáticamente tus DNS actuales. Asegúrate que aparezcan:
```
Tipo    Nombre              Contenido               Proxy
A       ksinsurancee.com    208.109.62.140         ✅ Proxied
A       www                 208.109.62.140         ✅ Proxied
```

#### 4. Cambiar Nameservers en GoDaddy
Cloudflare te dará 2 nameservers como:
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

**En GoDaddy:**
1. Login → My Products
2. Click en "DNS" junto a `ksinsurancee.com`
3. Scroll hasta "Nameservers"
4. Click "Change" → "Custom"
5. Ingresa los nameservers de Cloudflare
6. Save

**Espera**: 5-30 minutos para propagación

#### 5. Configurar SSL en Cloudflare
Cuando el sitio esté activo:
1. **Cloudflare Dashboard → SSL/TLS**
2. **Modo de cifrado: "Flexible"**
   - Flexible = Cloudflare→Usuario (HTTPS), Cloudflare→Server (HTTP)
3. **SSL/TLS → Edge Certificates**
   - ✅ "Always Use HTTPS" → ON
   - ✅ "Automatic HTTPS Rewrites" → ON

#### 6. Activar HTTPS en el código
Descomentar en `.htaccess` (ya preparado):
```apache
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

Luego ejecutar:
```bash
node scripts/deploy-winscp.js
```

---

## ✅ OPCIÓN 3: Certificado Manual (AVANZADO)

Si tienes acceso SSH y permisos sudo (poco común en shared hosting):

```bash
# Instalar certbot
sudo apt-get update
sudo apt-get install certbot

# Generar certificado
sudo certbot certonly --webroot -w /home/nhs13h5k0x0j/public_html -d ksinsurancee.com -d www.ksinsurancee.com

# Los certificados estarán en:
# /etc/letsencrypt/live/ksinsurancee.com/fullchain.pem
# /etc/letsencrypt/live/ksinsurancee.com/privkey.pem
```

⚠️ **Nota**: Esto requiere acceso root que normalmente no está disponible en GoDaddy shared hosting.

---

## 📋 CHECKLIST DE ACTIVACIÓN

Después de activar SSL (cualquier método):

### 1. Activar redirect HTTPS en .htaccess
```apache
# Descomentar en public/.htaccess líneas 9-11:
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

### 2. Actualizar config.php
```php
// backend/config.php
$GLOBALS['ALLOWED_ORIGINS'] = [
    'https://ksinsurancee.com',  // Ya incluido
    'https://nhs13h5k0x0j.krause.app',
    'http://localhost:8080'
];
```

### 3. Deploy
```bash
node scripts/deploy-winscp.js
```

### 4. Verificar
- ✅ `https://ksinsurancee.com` carga
- ✅ Sin errores de certificado
- ✅ Login funciona
- ✅ No aparecen advertencias de "insecure password field"

---

## 🆘 TROUBLESHOOTING

### Error: "Too many redirects"
```apache
# En .htaccess, cambiar:
RewriteCond %{HTTPS} off
# Por:
RewriteCond %{HTTP:X-Forwarded-Proto} !https
```

### SSL no activa después de 24 horas
- Verificar nameservers: `dig ksinsurancee.com NS`
- Contactar soporte GoDaddy
- Probar Cloudflare (más confiable)

### Certificado muestra advertencia
- Esperar 10-15 minutos más
- Limpiar caché del navegador (Ctrl+Shift+Del)
- Probar en modo incógnito

---

## 🎯 RECOMENDACIÓN FINAL

**Para máxima velocidad y confiabilidad → Cloudflare (Opción 2)**

Es gratis, se configura en 15 minutos, y obtienes:
- ✅ SSL/TLS automático
- ✅ CDN global
- ✅ DDoS protection
- ✅ Analytics
- ✅ Sin necesidad de acceso root

Una vez activo Cloudflare, descomenta las 3 líneas en `.htaccess` y redeploya.
