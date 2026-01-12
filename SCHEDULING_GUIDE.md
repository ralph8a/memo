# Sistema de Calendario y Gestión de Contactos - Guía de Implementación

## 📅 Módulos Creados

### 1. **scheduling.js** - Sistema de Reserva de Citas
Ubicación: `src/modules/scheduling.js`

**Funciones principales:**
```javascript
// Obtener disponibilidad de un agente
getAgentAvailability(agentId, startDate, endDate)

// Obtener citas del agente
getAgentMeetings(agentId, options)

// Obtener citas del cliente
getClientMeetings(clientId, options)

// Solicitar una reunión
requestMeeting(request)

// Confirmar reunión
confirmMeeting(meetingId, confirmedBy)

// Cancelar reunión
cancelMeeting(meetingId, reason)

// Marcar como completada
completeMeeting(meetingId, summary)

// Obtener agentes disponibles
getAvailableAgents(startTime, endTime)
```

**Estructura de Meeting:**
```javascript
{
  id: "mtg_xxx",
  agentId: "ag_001",
  agentName: "Carlos Mendez",
  clientId: "cl_001",
  clientName: "Roberto García",
  clientEmail: "cliente@demo.com",
  startTime: Date,
  endTime: Date,
  type: "quote|consultation|renewal|support",
  status: "available|requested|confirmed|completed|cancelled",
  notes: "Notas de la reunión",
  confirmations: { agent: bool, client: bool },
  reminders: { agent: "24h", client: "24h" }
}
```

### 2. **contactsManager.js** - Directorio de Agentes y Contactos
Ubicación: `src/modules/contactsManager.js`

**Funciones principales:**
```javascript
// Obtener todos los agentes
getAgents(options)  // options: {specialties, status, search}

// Obtener agente por ID
getAgentById(agentId)

// Obtener agentes por especialidad
getAgentsBySpecialty(specialty)

// Actualizar estado del agente
updateAgentStatus(agentId, status)

// Agregar contacto cliente
addClientContact(clientId, contactData)

// Obtener contacto cliente
getClientContact(clientId)

// Actualizar contacto cliente
updateClientContact(clientId, updates)

// Agregar etiqueta a cliente
addClientTag(clientId, tag)

// Buscar clientes
searchClients(query)

// Obtener clientes por etiqueta
getClientsByTag(tag)
```

**Estructura de Agent:**
```javascript
{
  id: "ag_001",
  name: "Carlos Mendez",
  email: "agente@demo.com",
  phone: "+1 (555) 123-4567",
  avatar: "CM",
  specialties: ["auto", "hogar", "comercial"],
  bio: "Especialista en seguros de vehículos",
  yearsExperience: 8,
  clientsServed: 234,
  satisfaction: 4.8,
  languages: ["Spanish", "English"],
  status: "available|busy|offline"
}
```

### 3. **scheduling.css** - Estilos de Calendario
Ubicación: `styles/scheduling.css`

Clases principales:
- `.calendar-section` - Contenedor del calendario
- `.meeting-card` - Card de reunión
- `.agent-card` - Card de agente
- `.booking-form` - Formulario de reserva
- `.time-slots` - Slots de tiempo disponibles
- `.agents-grid` - Grid de agentes

## 🎯 Handlers Globales (Expuestos en window)

```javascript
// Agendar cita
window.scheduleAppointment()

// Ver directorio de agentes
window.viewAgentDirectory()

// Contactar agente específico
window.handleAgentContact(agentId, agentName)
```

## 🔗 Uso en Templates HTML

### Botón para agendar cita:
```html
<button class="btn btn-primary" onclick="scheduleAppointment()">
  📅 Agendar Cita
</button>
```

### Botón para ver agentes:
```html
<button class="btn btn-secondary" onclick="viewAgentDirectory()">
  👥 Ver Agentes Disponibles
</button>
```

## 📊 Datos de Demo

Se cargan automáticamente al inicializar:

**Agentes (3):**
- Carlos Mendez (ag_001) - Auto, Hogar, Comercial
- María López (ag_002) - Vida, Salud, Viaje
- Juan Rivera (ag_003) - Comercial, Auto, Viaje

**Clientes (2):**
- Roberto García (cl_001) - cliente@demo.com
- Ana Martinez (cl_002) - ana@example.com

**Reuniones demo (2):**
- MTG mañana con Carlos (10:00 AM) - Cotización de auto
- MTG próxima semana con María (2:00 PM) - Renovación de vida

## 🎨 Colores Integrados

Los módulos usan las variables de tema principal:
- `--theme-primary-color`: Maroon (#8b2348)
- `--theme-accent-color`: Purple (#9b59b6)
- `--theme-secondary-color`: Wine (#722f37)

Todas las Card y componentes ahora tienen:
✅ **Contraste mejorado** - Textos legibles
✅ **Colores de acento** - Alineados con paleta principal
✅ **Sombras suaves** - Para profundidad visual
✅ **Transiciones suaves** - 0.2s ease

## 🔄 Flujo de Reserva

```
1. Cliente hace click en "Agendar Cita"
   ↓
2. Modal se abre con agentes disponibles
   ↓
3. Selecciona agente, tipo, fecha y hora
   ↓
4. Envía solicitud → showLoading aparece
   ↓
5. Sistema crea reunión con status "requested"
   ↓
6. Agente recibe notificación
   ↓
7. Agente confirma → status cambia a "confirmed"
   ↓
8. Recordatorio 24h y 1h antes
   ↓
9. Post-meeting → status "completed"
```

## 📱 Responsive

Los componentes están optimizados para:
- 📱 Móvil (< 768px) - Grid 1 columna
- 💻 Tablet (768px - 1024px) - Grid 2 columnas
- 🖥️ Desktop (> 1024px) - Grid completo

## 🚀 Próximas Mejoras (Opcional)

1. **Integración de email** - Enviar confirmaciones por email
2. **SMS reminders** - Notificaciones por SMS
3. **Video conferencing** - Zoom/Teams integration
4. **Analytics** - Estadísticas de citas
5. **Bloqueo de horarios** - Los agentes pueden bloquear su tiempo
6. **Rescheduling** - Permitir reprogramar citas
7. **Rating de reuniones** - Clientes califiquen reuniones
8. **Historial de reuniones** - Búsqueda y filtrado avanzado

## ✅ Estados de Colores

```css
.meeting-badge.confirmed  → Verde (#28a745)
.meeting-badge.requested  → Amarillo (#ffc107)
.meeting-badge.completed  → Azul (#17a2b8)
.meeting-badge.cancelled  → Rojo (#dc3545)

.status-dot.available     → Verde
.status-dot.busy          → Amarillo
.status-dot.offline       → Gris
```

## 📝 Notas Importantes

- El sistema funciona en modo DEMO sin backend
- Los datos se almacenan en memoria (se pierden al refrescar)
- Para producción: reemplaza las funciones con llamadas a API
- Las reuniones con conflictos se validan automáticamente
- Los recordatorios se programan con setTimeout (clientside)
- Para producción: usa un servidor de colas (Bull, Celery, etc)
