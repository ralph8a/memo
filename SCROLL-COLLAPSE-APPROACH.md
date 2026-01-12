# Approach Recomendado: Scroll Collapse en Dashboards

## 🎯 Estrategia Implementada (Corregida)

### Arquitectura de Scroll - Padre Estático, Hijos Móviles

```
┌─────────────────────────────────────┐
│ .hero-surface (PADRE ESTÁTICO)      │ ← Dimensiones fijas, NO se mueve
│ ├─ .hero-copy (HIJO)                │ ← Se oculta con opacity/transform
│ │  ├─ .hero-title-row              │ ← Se mantiene visible
│ │  └─ .hero-description (hide)     │ ← display: none al colapsar
│ └─ .hero-search (hide)              │ ← display: none al colapsar
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ .dashboard-stage (SCROLL CONTAINER) │ ← overflow-y: auto, height: 100vh
│ ├─ .stage-main                      │ ← Contenedor interno
│ │  ├─ .hero-surface                │ ← ESTÁTICO (no cambia height)
│ │  ├─ .dashboard-tabs              │ ← Se mantiene visible
│ │  └─ .tab-panels                  │ ← Contenido scrollable
│ │     └─ .tab-panel                │
│ │        ├─ .stats-grid            │
│ │        ├─ .chart-cards           │
│ │        └─ .content-cards         │
└─────────────────────────────────────┘
```

### ✅ Comportamiento Correcto

**Concepto clave:** El contenedor padre `.hero-surface` mantiene sus dimensiones. Solo los elementos internos cambian su visibilidad.

**Estado Normal (scroll = 0):**
```css
.hero-surface {
  height: 280px;  /* FIJO - no cambia */
  overflow: hidden;
  position: relative;
}

.hero-surface .hero-description,
.hero-surface .hero-search {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

**Estado Colapsado (scroll > 80px):**
```css
.hero-surface {
  height: 280px;  /* MISMO HEIGHT - no cambia */
}

.hero-surface.collapsed .hero-description,
.hero-surface.collapsed .hero-search {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
  display: none;  /* Opcional para remover del layout */
}

.hero-surface.collapsed .hero-title-row {
  /* Se mantiene visible, puede ajustarse visualmente */
  font-size: 0.9em;
}
```

## 📐 Especificaciones Técnicas (Approach Correcto)

### 1. Container Principal (Scroll)
```css
.dashboard-stage {
    overflow-y: auto;        /* Scroll activado */
    overflow-x: hidden;      /* Sin scroll horizontal */
    height: 100vh;           /* Altura completa */
    scroll-behavior: smooth; /* Scroll suave */
    padding: 12px;
}
```

### 2. Hero Surface (Contenedor Estático)
```css
.hero-surface {
    height: 280px;           /* FIJO - No cambia */
    overflow: hidden;        /* Oculta contenido que sale */
    position: relative;
    transition: none;        /* El contenedor NO anima */
}

/* Solo los HIJOS animan */
.hero-surface .hero-copy,
.hero-surface .hero-search {
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estado colapsado - SOLO afecta hijos */
.hero-surface.collapsed .hero-description {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
}

.hero-surface.collapsed .hero-search {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
}

/* Título se mantiene pero compacto */
.hero-surface.collapsed .hero-title-row {
    font-size: 0.9em;
    transform: translateY(10px); /* Reposiciona hacia arriba */
}
```

### 3. JavaScript (scrollCollapse.js)
```javascript
const SCROLL_THRESHOLD = 80; // px
const COLLAPSE_CLASS = 'collapsed';

function handleScroll() {
    const scrollTop = container.scrollTop;
    const shouldCollapse = scrollTop > SCROLL_THRESHOLD;
    
    // Solo toggle class, CSS maneja el resto
    heroSurface.classList.toggle(COLLAPSE_CLASS, shouldCollapse);
}

// Attach to .dashboard-stage (el que hace scroll)
const dashboardStage = document.querySelector('.dashboard-stage');
const heroSurface = document.querySelector('.hero-surface');

if (dashboardStage && heroSurface) {
    dashboardStage.addEventListener('scroll', handleScroll, { passive: true });
}
```

## ✅ Ventajas de Este Approach (Padre Estático)

1. **Performance Optimizado**
   - `passive: true` en listeners
   - Solo animan elementos internos (GPU-accelerated)
   - No hay layout reflow (contenedor mantiene dimensiones)
   - Menor carga de cálculo para el navegador

2. **UX Mejorada**
   - Más espacio visual para contenido sin cambiar layout
   - Navegación rápida sin saltos de layout
   - Smooth animations solo donde se necesita

3. **Mantenibilidad**
   - Un solo scroll container (.dashboard-stage)
   - Lógica simple: toggle class, CSS hace el trabajo
   - Fácil de debuggear (no hay cambios de dimensiones complejos)
   - Predecible: contenedor siempre mismo tamaño

4. **No Layout Shift**
   - **Crítico:** Como el padre mantiene altura fija, NO hay Cumulative Layout Shift
   - Los elementos debajo del hero no "saltan" durante el scroll
   - Mejor Core Web Vitals score

## 🎨 Recomendación Final (Implementación Correcta)

**Usar padre estático con hijos móviles:**

```css
/* Contenedor padre - SIEMPRE mismo tamaño */
.hero-surface {
    height: 280px;          /* FIJO */
    overflow: hidden;
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    padding: 24px;
}

/* Elementos internos que se ocultan */
.hero-description,
.hero-search {
    transition: opacity 0.35s ease,
                transform 0.35s ease;
    opacity: 1;
    transform: translateY(0);
}

/* Estado colapsado - solo afecta hijos */
.hero-surface.collapsed .hero-description,
.hero-surface.collapsed .hero-search {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
    /* Opcional: remover del layout flow */
    position: absolute;
    visibility: hidden;
}

/* Título siempre visible, puede reposicionarse */
.hero-title-row {
    transition: transform 0.35s ease, font-size 0.35s ease;
}

.hero-surface.collapsed .hero-title-row {
    font-size: 0.9em;
    transform: translateY(10px); /* Sube visualmente */
}

/* KPIs (para agent dashboard) se mantienen visibles */
.agent-kpi-row {
    transition: transform 0.35s ease;
}

.hero-surface.collapsed .agent-kpi-row {
    transform: translateY(-30px); /* Sube para ocupar espacio libre */
}
```

## 📊 Métricas de Success

- ✅ Scroll smooth sin lag
- ✅ Transición < 350ms
- ✅ No layout shifts
- ✅ Funciona con teclado (scroll programático)
- ✅ Compatible con touch devices

## 🚀 Próximos Pasos

1. Agregar preference de usuario para desactivar collapse
2. Implementar shortcuts de teclado (Ctrl+Home para expandir)
3. Añadir indicador visual de "scroll para más"
4. Considerar intersection observer para mejor performance
