# Recomendación Visual: Dashboard de Agente

## 📐 Arquitectura del Layout

Reutilizaremos la misma estructura de 3 columnas del dashboard de cliente:

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar (300px)  │  Stage Principal (flex)  │  Rail (300px)     │
│                  │                           │                   │
│  [Logo]          │  ┌──────────────────┐   │  ┌──────────────┐ │
│                  │  │ Hero Surface     │   │  │ Acciones     │ │
│  [Nav]           │  │ - Nombre agente  │   │  │ Rápidas      │ │
│  • Resumen       │  │ - Stats clave    │   │  └──────────────┘ │
│  • Clientes      │  │ - KPIs mes       │   │                   │
│  • Siniestros    │  └──────────────────┘   │  ┌──────────────┐ │
│  • Cotizaciones  │                           │  │ Calendario   │ │
│  • Comisiones    │  ┌──────────────────┐   │  │ Citas        │ │
│  • Alertas       │  │ Stats Grid (4)   │   │  │ - Hoy        │ │
│                  │  │ • Total clientes │   │  │ - Pendientes │ │
│  [Acciones Q.]   │  │ • Pólizas activas│   │  └──────────────┘ │
│  • Crear quote   │  │ • Comisión mes   │   │                   │
│  • Nuevo cliente │  │ • Tasa cierre    │   │  ┌──────────────┐ │
│  • Agendar cita  │  └──────────────────┘   │  │ Prioridades  │ │
│                  │                           │  │ - Urgentes   │ │
│  [Equipo]        │  ┌──────────────────┐   │  │ - Seguimiento│ │
│  • Compañeros    │  │ Clientes Grid    │   │  └──────────────┘ │
│  • Soporte       │  │ (Tabla/Cards)    │   │                   │
│                  │  │ - Buscar         │   │  ┌──────────────┐ │
│  [Logout]        │  │ - Filtros        │   │  │ Actividad    │ │
│                  │  │ - Acciones       │   │  │ Reciente     │ │
│                  │  └──────────────────┘   │  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Secciones Específicas del Agente

### 1. **Hero Surface** (Personalizado para Agente)
```html
<div class="hero-surface">
  <div class="agent-profile">
    <div class="agent-avatar-large">AG</div>
    <div class="agent-info">
      <h1>Roberto Sánchez</h1>
      <p>Agente Senior • ID: AG-2405</p>
      <div class="agent-badges">
        <span class="badge success">Top Performer</span>
        <span class="badge info">5 años</span>
      </div>
    </div>
  </div>
  
  <div class="agent-kpi-row">
    <div class="kpi-mini">
      <span class="kpi-value">$45,280</span>
      <span class="kpi-label">Comisiones este mes</span>
      <span class="kpi-trend success">↑ 12%</span>
    </div>
    <div class="kpi-mini">
      <span class="kpi-value">89</span>
      <span class="kpi-label">Clientes activos</span>
    </div>
    <div class="kpi-mini">
      <span class="kpi-value">73%</span>
      <span class="kpi-label">Tasa de cierre</span>
      <span class="kpi-trend success">↑ 5%</span>
    </div>
  </div>
</div>
```

### 2. **Stats Grid** (4 stats horizontales)
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ 📊 89         │ 📋 156        │ 💰 $45,280    │ 📈 73%        │
│ Total         │ Pólizas       │ Comisiones    │ Tasa de       │
│ Clientes      │ Activas       │ Este Mes      │ Cierre        │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

### 3. **Clientes Grid** (Panel Principal Scrollable)
Vista de tabla con acciones:
```
╔══════════════════════════════════════════════════════════╗
║ 🔍 Buscar cliente...        [Filtros ▼] [+ Nuevo]       ║
╠══════════════════════════════════════════════════════════╣
║ Cliente          │ Pólizas │ Estado   │ Últ. Contacto   ║
║──────────────────┼─────────┼──────────┼─────────────────║
║ 👤 Ana Martínez  │ Auto    │ ✓ Activo │ Hace 2 días     ║
║    ana@email.com │ Hogar   │          │ [Ver] [Editar]  ║
║──────────────────┼─────────┼──────────┼─────────────────║
║ 👤 Luis García   │ Vida    │ ⚠ Pend.  │ Hace 1 semana   ║
║    luis@email.com│         │          │ [Ver] [Editar]  ║
║──────────────────┼─────────┼──────────┼─────────────────║
║ 👤 Sofía López   │ Auto    │ ✓ Activo │ Hoy             ║
║    sofia@email.com│ Salud  │          │ [Ver] [Editar]  ║
╚══════════════════════════════════════════════════════════╝
```

### 4. **Right Rail Widgets**

#### A) Citas del Día
```
┌─────────────────────────┐
│ 📅 Citas de Hoy         │
├─────────────────────────┤
│ 10:00 AM                │
│ Ana Martínez            │
│ Renovación Auto         │
│ [Videollamada]          │
├─────────────────────────┤
│ 2:30 PM                 │
│ Luis García             │
│ Nueva cotización        │
│ [Presencial]            │
├─────────────────────────┤
│ [+ Agendar Nueva]       │
└─────────────────────────┘
```

#### B) Tareas Prioritarias
```
┌─────────────────────────┐
│ ⚡ Tareas Urgentes      │
├─────────────────────────┤
│ 🔴 Renovación vence hoy │
│    Cliente: Ana M.      │
│    [Contactar]          │
├─────────────────────────┤
│ 🟡 Seguimiento quote    │
│    Cliente: Carlos D.   │
│    [Llamar]             │
├─────────────────────────┤
│ 🟢 Enviar documentos    │
│    Cliente: María S.    │
│    [Enviar]             │
└─────────────────────────┘
```

#### C) Actividad Reciente
```
┌─────────────────────────┐
│ 🔔 Actividad Reciente   │
├─────────────────────────┤
│ Hace 5 min              │
│ Ana M. firmó póliza     │
├─────────────────────────┤
│ Hace 15 min             │
│ Nueva cotización: Luis  │
├─────────────────────────┤
│ Hace 1 hora             │
│ Pago recibido: Sofía    │
└─────────────────────────┘
```

## 🎯 Navegación Principal (Sidebar)

```
┌─────────────────────┐
│ [Logo Krause]       │
├─────────────────────┤
│ 📊 Resumen          │ ← Vista actual
│ 👥 Clientes (89)    │
│ 🚗 Pólizas (156)    │
│ 📄 Cotizaciones (12)│
│ 💰 Comisiones       │
│ ⚠️  Alertas (3)     │
│ 📅 Calendario       │
│ 📊 Reportes         │
├─────────────────────┤
│ ACCIONES RÁPIDAS    │
│ [+ Nueva Quote]     │
│ [+ Nuevo Cliente]   │
│ [📅 Agendar Cita]   │
├─────────────────────┤
│ EQUIPO              │
│ Ana • María         │
│ Luis • Carlos       │
├─────────────────────┤
│ [🚪 Cerrar sesión]  │
└─────────────────────┘
```

## 📱 Responsive Behavior

### Desktop (>1200px)
- 3 columnas completas: Sidebar + Stage + Rail
- Todos los widgets visibles
- Grid de clientes: 100% ancho

### Tablet (768px - 1200px)
- 2 columnas: Sidebar + Stage
- Rail colapsado (widgets se mueven a modales)
- Grid de clientes: scrollable horizontal si es necesario

### Mobile (<768px)
- Sidebar slim (80px, solo iconos)
- Stage full width
- Stats: 1 columna vertical
- Clientes: cards en lugar de tabla

## 🎨 Paleta de Colores (Consistente con Cliente)

```css
/* Hero Agent */
--agent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Stats */
--stat-clients: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--stat-policies: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--stat-commission: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
--stat-close-rate: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
```

## 🔄 Interacciones Clave

1. **Click en cliente** → Abre modal con:
   - Info completa del cliente
   - Historial de pólizas
   - Notas del agente
   - Próximas acciones

2. **Hover en stat-card** → Muestra sparkline de tendencia

3. **Click en cita** → Opciones:
   - Iniciar videollamada
   - Ver detalles
   - Reprogramar
   - Cancelar

4. **Scroll en Stage** → Hero se colapsa (igual que cliente)

## 📊 Métricas Adicionales Sugeridas

Para futura implementación:
- Gráfico de comisiones por mes (últimos 6 meses)
- Funnel de conversión (leads → quotes → ventas)
- Distribución de pólizas por tipo
- Ranking vs otros agentes (gamificación)
- Tiempo promedio de respuesta
- Satisfacción del cliente (NPS)

## 🚀 Implementación Recomendada

1. **Fase 1**: Reutilizar estructura de client-dashboard.html
2. **Fase 2**: Crear componentes específicos:
   - `agent-hero-surface.html`
   - `clients-table.html`
   - `appointments-widget.html`
3. **Fase 3**: Adaptar estilos existentes con clases `.agent-dashboard`
4. **Fase 4**: Conectar con APIs reales (cuando estén listas)

---

**Ventaja de este diseño**: Máxima reutilización de código CSS y componentes existentes, con personalización mínima para las necesidades específicas del agente.
