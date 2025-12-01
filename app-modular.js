var h={HERO_DURATION:6e3,PARADE_DURATION:8e3,CTA_FADE_IN:800,BUTTON_DELAY:400,BUTTON_STAGGER:150,DROPLET_DURATION:600,NOTIFICATION_DURATION:3e3,STATS_ANIMATION:2e3},b={HOME:"home",SERVICES:"services",ABOUT:"about",CONTACT:"contact",LOGIN:"login",AGENT_LOGIN:"agent-login",DASHBOARD:"dashboard",AGENT_DASHBOARD:"agent-dashboard"},B=[b.LOGIN,b.AGENT_LOGIN,b.DASHBOARD,b.AGENT_DASHBOARD],x={CLIENT:{email:"cliente@demo.com",password:"demo123"},AGENT:{id:"agente@demo.com",password:"agent123"}},m={HERO:"section-hero",PARADE:"section-parade",CTA:"section-cta"},s={NAV_MENU:"#navMenu",FOOTER:"#footer",MAIN_CONTENT:"#mainContent",SUB_NAV:"#sub-nav",PARTICLES_CANVAS:"#particles-canvas",HERO_SECTION:".hero-intro",PARADE_SECTION:".features-parade",CTA_SECTION:".final-cta",SKIP_BUTTON:".btn-home-start",HOME_SECTIONS:".home-section",SUB_NAV_BUTTONS:".sub-nav-btn",STAT_NUMBERS:".stat-number",NAV_LINKS:".nav-link"},o={SUCCESS:"success",ERROR:"error",INFO:"info",WARNING:"warning"},c={MAX_COUNT:100,MIN_SIZE:2,MAX_SIZE:6,MIN_SPEED:-.25,MAX_SPEED:.25,MIN_OPACITY:.4,MAX_OPACITY:.8,CONNECTION_DISTANCE:120,CONNECTION_OPACITY:.15,DENSITY_FACTOR:1e4};var R=new Map;function u(t,e=!0){if(e&&R.has(t))return R.get(t);let a=document.querySelector(t);return e&&a&&R.set(t,a),a}function C(t){return document.querySelectorAll(t)}function l(t,e){t&&t.classList.add(e)}function i(t,e){t&&t.classList.remove(e)}function D(t,e,a){t&&(t.classList.remove(e),t.classList.add(a))}function N(t,e,a){t&&(t.style[e]=a)}function k(t){t&&(t.style.display="")}function G(t){t&&(t.style.display="none")}function H(t,e){t&&(t.innerHTML=e)}function z(t,e="",a={}){let r=document.createElement(t);return e&&(r.className=e),Object.entries(a).forEach(([d,p])=>{r.setAttribute(d,p)}),r}var f=null,T=null,v=[],vt=null,_=class{constructor(e,a){this.x=Math.random()*e,this.y=Math.random()*a,this.size=Math.random()*(c.MAX_SIZE-c.MIN_SIZE)+c.MIN_SIZE,this.speedX=Math.random()*(c.MAX_SPEED-c.MIN_SPEED)+c.MIN_SPEED,this.speedY=Math.random()*(c.MAX_SPEED-c.MIN_SPEED)+c.MIN_SPEED,this.opacity=Math.random()*(c.MAX_OPACITY-c.MIN_OPACITY)+c.MIN_OPACITY,this.canvasWidth=e,this.canvasHeight=a}update(){this.x+=this.speedX,this.y+=this.speedY,this.x>this.canvasWidth&&(this.x=0),this.x<0&&(this.x=this.canvasWidth),this.y>this.canvasHeight&&(this.y=0),this.y<0&&(this.y=this.canvasHeight)}draw(){T.fillStyle=`rgba(255, 255, 255, ${this.opacity})`,T.beginPath(),T.arc(this.x,this.y,this.size,0,Math.PI*2),T.fill()}};function ft(){for(let t=0;t<v.length;t++)for(let e=t+1;e<v.length;e++){let a=v[t].x-v[e].x,r=v[t].y-v[e].y,d=Math.sqrt(a*a+r*r);if(d<c.CONNECTION_DISTANCE){let p=c.CONNECTION_OPACITY*(1-d/c.CONNECTION_DISTANCE);T.strokeStyle=`rgba(255, 255, 255, ${p})`,T.lineWidth=1,T.beginPath(),T.moveTo(v[t].x,v[t].y),T.lineTo(v[e].x,v[e].y),T.stroke()}}}function q(){f&&(f.width=window.innerWidth,f.height=window.innerHeight,v=v.map(()=>new _(f.width,f.height)))}function ht(){if(f=u(s.PARTICLES_CANVAS,!1),!f)return!1;T=f.getContext("2d"),q(),v=[];let t=Math.min(c.MAX_COUNT,Math.floor(f.width*f.height/c.DENSITY_FACTOR));for(let e=0;e<t;e++)v.push(new _(f.width,f.height));return!0}function V(){!T||!f||(T.clearRect(0,0,f.width,f.height),v.forEach(t=>{t.update(),t.draw()}),ft(),vt=requestAnimationFrame(V))}function Y(){ht()&&(window.addEventListener("resize",q),V())}var S={currentUser:null,currentPage:"home"};function X(t){S.currentUser=t,t?localStorage.setItem("krauser_user",JSON.stringify(t)):localStorage.removeItem("krauser_user")}function I(){if(!S.currentUser){let t=localStorage.getItem("krauser_user");t&&(S.currentUser=JSON.parse(t))}return S.currentUser}function $(t){S.currentPage=t}function W(){S.currentUser=null,S.currentPage="home",localStorage.removeItem("krauser_user")}var w=new Set;function g(t,e){let a=setTimeout(()=>{w.delete(a),t()},e);return w.add(a),a}function y(){w.forEach(t=>clearTimeout(t)),w.clear()}var A={hero:null,parade:null,cta:null,subNav:null,skipBtn:null};function K(){A.hero||(A.hero=u(s.HERO_SECTION,!1),A.parade=u(s.PARADE_SECTION,!1),A.cta=u(s.CTA_SECTION,!1),A.subNav=u(s.SUB_NAV,!1),A.skipBtn=u(s.SKIP_BUTTON,!1))}function L(t,e=0){g(()=>{let a=A.subNav?.querySelector(t);a&&(N(a,"display","inline-block"),l(a,"btn-droplet"),g(()=>{i(a,"btn-droplet")},h.DROPLET_DURATION))},e)}function M(){y(),A.subNav&&A.subNav.querySelectorAll(s.SUB_NAV_BUTTONS).forEach(e=>{N(e,"display","none"),i(e,"btn-droplet"),i(e,"active")}),Object.keys(A).forEach(t=>{A[t]=null})}function Q(){K(),M();let{hero:t,parade:e,cta:a,subNav:r,skipBtn:d}=A;!t||!e||!a||(l(document.body,m.HERO),r&&(N(r,"display","flex"),r.querySelectorAll(s.SUB_NAV_BUTTONS).forEach(E=>N(E,"display","none"))),g(()=>{D(document.body,m.HERO,m.PARADE),l(t,"fade-out-up"),L('[data-section="hero"]',h.BUTTON_DELAY),g(()=>{i(t,"active"),l(e,"active"),g(()=>{D(document.body,m.PARADE,m.CTA),l(e,"fade-out-up"),L('[data-section="eleccion"]',h.BUTTON_DELAY),g(()=>{i(e,"active"),l(a,"active"),L('[data-section="contacto"]',h.BUTTON_DELAY),d&&N(d,"display","none")},h.CTA_FADE_IN)},h.PARADE_DURATION)},h.CTA_FADE_IN)},h.HERO_DURATION))}function j(){K(),M();let{hero:t,parade:e,cta:a,subNav:r,skipBtn:d}=A;!t||!e||!a||(i(document.body,m.HERO),i(document.body,m.PARADE),l(document.body,m.CTA),i(t,"active"),i(t,"fade-out-up"),i(e,"active"),i(e,"fade-out-up"),l(a,"active"),r&&(N(r,"display","flex"),r.querySelectorAll(s.SUB_NAV_BUTTONS).forEach((E,P)=>{N(E,"display","inline-block"),g(()=>{l(E,"btn-droplet"),g(()=>{i(E,"btn-droplet")},h.DROPLET_DURATION)},P*h.BUTTON_STAGGER)})),d&&N(d,"display","none"))}function Z(t){let e={hero:m.HERO,eleccion:m.PARADE,contacto:m.CTA};i(document.body,m.HERO),i(document.body,m.PARADE),i(document.body,m.CTA),e[t]&&l(document.body,e[t]),C(s.SUB_NAV_BUTTONS).forEach(p=>{i(p,"active"),p.dataset.section===t&&l(p,"active")}),C(s.HOME_SECTIONS).forEach(p=>{i(p,"active"),i(p,"fade-out-up"),N(p,"display","none")});let d=u(`#${t}-section`,!1);d&&(N(d,"display","flex"),l(d,"active"),t==="hero"&&g(()=>{U()},100))}function U(){C(s.STAT_NUMBERS).forEach(e=>{let a=parseInt(e.dataset.target);gt(e,a)})}function gt(t,e,a=h.STATS_ANIMATION){let r=Date.now();function d(){let p=Date.now(),E=Math.min((p-r)/a,1),P=1-Math.pow(1-E,3),mt=Math.floor(P*e);t.textContent=mt,E<1?requestAnimationFrame(d):t.textContent=e}requestAnimationFrame(d)}var J=`
<nav class="sub-navigation" id="sub-nav" style="display: none;">
  <button class="sub-nav-btn active" data-section="hero" onclick="window.appHandlers.showHomeSection('hero')">Hero</button>
  <button class="sub-nav-btn" data-section="eleccion" onclick="window.appHandlers.showHomeSection('eleccion')">Elecci\xF3n</button>
  <button class="sub-nav-btn" data-section="contacto" onclick="window.appHandlers.showHomeSection('contacto')">Contacto</button>
</nav>

<section class="hero-section hero-intro home-section active" id="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">
      <span class="title-word">Protection</span>
      <span class="title-word accent">Beyond</span>
      <span class="title-word">The Limits</span>
    </h1>
    <p class="hero-subtitle">
      M\xE1s de 25 a\xF1os protegiendo lo que m\xE1s valoras. 
      Seguros personalizados respaldados por experiencia y compromiso.
    </p>
    
    <div class="hero-stats">
      <div class="stat-box">
        <div class="stat-number" data-target="25">0</div>
        <div class="stat-label">A\xF1os de Experiencia</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" data-target="5000">0</div>
        <div class="stat-label">Clientes Activos</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" data-target="10000">0</div>
        <div class="stat-label">P\xF3lizas Vigentes</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" data-target="98">0</div>
        <div class="stat-label">% Satisfacci\xF3n</div>
      </div>
    </div>
    
    <button class="btn-home-start" onclick="window.appHandlers.skipToFinalState()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      Saltar Animaci\xF3n
    </button>
  </div>
</section>

<section class="features-section features-parade home-section" id="eleccion-section">
  <div class="container">
    <h2 class="section-title">\xBFPor Qu\xE9 Elegirnos?</h2>
    <div class="features-grid">
      <div class="feature-box feature-card-1">
        <div class="feature-icon">\u{1F6E1}\uFE0F</div>
        <h3>Cobertura Integral</h3>
        <p>Protecci\xF3n completa adaptada a tus necesidades espec\xEDficas</p>
      </div>
      <div class="feature-box feature-card-2">
        <div class="feature-icon">\u26A1</div>
        <h3>Respuesta Inmediata</h3>
        <p>Atenci\xF3n 24/7 cuando m\xE1s nos necesitas</p>
      </div>
      <div class="feature-box feature-card-3">
        <div class="feature-icon">\u{1F4B0}</div>
        <h3>Mejores Precios</h3>
        <p>Cotizamos con m\xFAltiples aseguradoras para ti</p>
      </div>
      <div class="feature-box feature-card-4">
        <div class="feature-icon">\u{1F468}\u200D\u{1F4BC}</div>
        <h3>Asesor\xEDa Experta</h3>
        <p>25+ a\xF1os de experiencia a tu servicio</p>
      </div>
    </div>
  </div>
</section>

<section class="cta-section final-cta home-section" id="contacto-section">
  <div class="container">
    <div class="cta-hero-title">
      <h2 class="animated-title main-hero">
        <span class="title-line">\xBFListo para</span>
        <span class="title-line highlight">Proteger</span>
        <span class="title-line">tu Futuro?</span>
      </h2>
      <div class="title-underline"></div>
    </div>
    
    <p class="cta-subtitle">Obt\xE9n una cotizaci\xF3n personalizada sin compromiso</p>
    
    <div class="cta-buttons cta-main-buttons">
      <button class="btn btn-primary btn-lg btn-pulse" onclick="window.appHandlers.navigateTo('contact')">
        <span>\u{1F4DD} Solicitar Cotizaci\xF3n Gratis</span>
      </button>
      <button class="btn btn-secondary btn-lg" onclick="window.appHandlers.navigateTo('services')">
        <span>\u{1F6E1}\uFE0F Ver Servicios</span>
      </button>
    </div>
    
    <div class="section-divider"></div>
    
    <h3 class="agents-section-title">Contacta a Nuestros Agentes</h3>
    
    <div class="agents-grid">
      <div class="agent-card">
        <div class="agent-avatar">\u{1F468}\u200D\u{1F4BC}</div>
        <h4>Carlos M\xE9ndez</h4>
        <p class="agent-title">Agente Senior</p>
        <a href="tel:+525512345678" class="agent-contact">\u{1F4DE} (55) 1234-5678</a>
      </div>
      
      <div class="agent-card">
        <div class="agent-avatar">\u{1F469}\u200D\u{1F4BC}</div>
        <h4>Ana Rodr\xEDguez</h4>
        <p class="agent-title">Especialista Vida</p>
        <a href="tel:+525598765432" class="agent-contact">\u{1F4DE} (55) 9876-5432</a>
      </div>
      
      <div class="agent-card">
        <div class="agent-avatar">\u{1F468}\u200D\u{1F4BC}</div>
        <h4>Miguel Torres</h4>
        <p class="agent-title">Seguros Auto</p>
        <a href="tel:+525555551234" class="agent-contact">\u{1F4DE} (55) 5555-1234</a>
      </div>
      
      <div class="agent-card">
        <div class="agent-avatar">\u{1F469}\u200D\u{1F4BC}</div>
        <h4>Laura G\xF3mez</h4>
        <p class="agent-title">Seguros Hogar</p>
        <a href="tel:+525544445555" class="agent-contact">\u{1F4DE} (55) 4444-5555</a>
      </div>
    </div>
  </div>
</section>
`;var tt=`
<section class="page-header">
  <div class="container">
    <h1 class="page-title">Nuestros Servicios</h1>
    <p class="page-subtitle">Cobertura completa para todas tus necesidades</p>
  </div>
</section>
<section class="services-section">
  <div class="container">
    <div class="services-grid">
      <div class="service-card-detailed">
        <div class="service-icon-large">\u{1F697}</div>
        <h3>Seguros de Auto</h3>
        <p>Protecci\xF3n completa para tu veh\xEDculo</p>
        <ul class="service-list">
          <li>\u2713 Responsabilidad Civil</li>
          <li>\u2713 Cobertura Amplia</li>
          <li>\u2713 Asistencia Vial 24/7</li>
        </ul>
        <button class="btn btn-outline" onclick="window.appHandlers.openQuoteModal('auto')">Cotizar</button>
      </div>
      <div class="service-card-detailed featured">
        <div class="badge">M\xE1s Popular</div>
        <div class="service-icon-large">\u{1F3E0}</div>
        <h3>Seguros de Hogar</h3>
        <p>Tu patrimonio protegido</p>
        <ul class="service-list">
          <li>\u2713 Da\xF1os Estructurales</li>
          <li>\u2713 Contenido y Bienes</li>
          <li>\u2713 Responsabilidad Civil</li>
        </ul>
        <button class="btn btn-primary" onclick="window.appHandlers.openQuoteModal('hogar')">Cotizar</button>
      </div>
      <div class="service-card-detailed">
        <div class="service-icon-large">\u2764\uFE0F</div>
        <h3>Seguros de Vida</h3>
        <p>Asegura el futuro de tu familia</p>
        <ul class="service-list">
          <li>\u2713 Cobertura Familiar</li>
          <li>\u2713 Planes Personalizados</li>
          <li>\u2713 Beneficios por Invalidez</li>
        </ul>
        <button class="btn btn-outline" onclick="window.appHandlers.openQuoteModal('vida')">Cotizar</button>
      </div>
    </div>
  </div>
</section>
`;var et=`
<section class="page-header">
  <div class="container">
    <h1 class="page-title">Sobre Nosotros</h1>
    <p class="page-subtitle">Protection Beyond The Limits</p>
  </div>
</section>
<section class="about-section">
  <div class="container">
    <div class="about-content">
      <h2>Nuestra Historia</h2>
      <p>Con m\xE1s de 25 a\xF1os de experiencia, Krause Insurance ha protegido a miles de familias y negocios.</p>
      <h3 style="margin-top: 2rem;">Nuestra Misi\xF3n</h3>
      <p>Proporcionar soluciones de seguros personalizadas que superen las expectativas.</p>
    </div>
  </div>
</section>
`;var at=`
<section class="page-header">
  <div class="container">
    <h1 class="page-title">Cont\xE1ctanos</h1>
    <p class="page-subtitle">Estamos aqu\xED para ayudarte</p>
  </div>
</section>
<section class="contact-section">
  <div class="container">
    <form class="contact-form-app" onsubmit="window.appHandlers.handleContactSubmit(event)">
      <input type="text" class="form-control" placeholder="Nombre" required>
      <input type="email" class="form-control" placeholder="Email" required>
      <textarea class="form-control" placeholder="Mensaje" required></textarea>
      <button type="submit" class="btn btn-primary btn-block">Enviar</button>
    </form>
  </div>
</section>
`;var ot=`
<section class="auth-section">
  <div class="auth-container">
    <div class="auth-card">
      <h2>Portal de Clientes</h2>
      <form class="auth-form" onsubmit="window.appHandlers.handleClientLogin(event)">
        <input type="text" class="form-control" placeholder="Email o P\xF3liza" required>
        <input type="password" class="form-control" placeholder="Contrase\xF1a" required>
        <button type="submit" class="btn btn-primary btn-block">Iniciar Sesi\xF3n</button>
      </form>
      <div class="demo-credentials">
        <p><strong>Demo:</strong> cliente@demo.com / demo123</p>
      </div>
    </div>
  </div>
</section>
`;var it=`
<section class="auth-section">
  <div class="auth-container">
    <div class="auth-card">
      <h2>Portal de Agentes</h2>
      <form class="auth-form" onsubmit="window.appHandlers.handleAgentLogin(event)">
        <input type="text" class="form-control" placeholder="ID de Agente" required>
        <input type="password" class="form-control" placeholder="Contrase\xF1a" required>
        <button type="submit" class="btn btn-primary btn-block">Iniciar Sesi\xF3n</button>
      </form>
      <div class="demo-credentials">
        <p><strong>Demo:</strong> agente@demo.com / agent123</p>
      </div>
    </div>
  </div>
</section>
`;function nt(t){return`
<section class="dashboard-section">
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Mi Dashboard</h1>
        <p>Bienvenido, ${t?.name||"Cliente"}</p>
      </div>
      <button class="btn btn-outline" onclick="window.appHandlers.logout(); window.appHandlers.navigateTo('home')">Cerrar Sesi\xF3n</button>
    </div>
    <div class="dashboard-stats">
      <div class="dashboard-stat-card">
        <div class="stat-icon">\u{1F4C4}</div>
        <div class="stat-info">
          <div class="stat-value">3</div>
          <div class="stat-label">P\xF3lizas Activas</div>
        </div>
      </div>
    </div>
    <div class="dashboard-card">
      <h3>Mis P\xF3lizas</h3>
      <p>Gesti\xF3n de p\xF3lizas activas</p>
    </div>
  </div>
</section>
`}function st(t){return`
<section class="dashboard-section agent-dashboard">
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Panel de Agente</h1>
        <p>Bienvenido, ${t?.name||"Agente"}</p>
      </div>
      <button class="btn btn-outline" onclick="window.appHandlers.logout(); window.appHandlers.navigateTo('home')">Cerrar Sesi\xF3n</button>
    </div>
    <div class="dashboard-stats">
      <div class="dashboard-stat-card">
        <div class="stat-icon">\u{1F465}</div>
        <div class="stat-info">
          <div class="stat-value">142</div>
          <div class="stat-label">Clientes Activos</div>
        </div>
      </div>
    </div>
    <div class="dashboard-card">
      <h3>Clientes Recientes</h3>
      <p>Gesti\xF3n de clientes y p\xF3lizas</p>
    </div>
  </div>
</section>
`}function rt(t){let a={home:J,services:tt,about:et,contact:at,login:ot,"agent-login":it,dashboard:()=>nt(I()),"agent-dashboard":()=>st(I())}[t];return typeof a=="function"?a():a}function O(t){M(),y(),$(t);let e=u(s.NAV_MENU);e&&i(e,"active"),Tt(t),At(t),bt(t),window.scrollTo({top:0,behavior:"smooth"})}function Tt(t){C(s.NAV_LINKS).forEach(a=>{i(a,"active"),a.dataset.page===t&&l(a,"active")})}function At(t){let e=u(s.FOOTER);e&&(B.includes(t)?G(e):k(e))}function bt(t){let e=u(s.MAIN_CONTENT);if(!e)return;let a=rt(t);a?(H(e,a),t===b.HOME&&setTimeout(()=>{U(),Q()},100)):H(e,'<div class="container"><h1>P\xE1gina no encontrada</h1></div>')}function ct(){let t=u(s.NAV_MENU);t&&t.classList.toggle("active")}function lt(){let t=u(s.FOOTER),e=u("#footer-toggle-text",!1);t&&(t.classList.contains("collapsed")?(i(t,"collapsed"),e&&(e.textContent="Ocultar Informaci\xF3n")):(l(t,"collapsed"),e&&(e.textContent="Mostrar Informaci\xF3n")))}function n(t,e=o.INFO){let a=z("div",`notification notification-${e}`);a.textContent=t,document.body.appendChild(a),g(()=>{l(a,"show")},10),g(()=>{i(a,"show"),g(()=>a.remove(),300)},h.NOTIFICATION_DURATION)}function dt(){return I()!==null}function F(t,e="client"){let a=e==="client"?Nt(t):Et(t);return a?(X(a),n("Inicio de sesi\xF3n exitoso",o.SUCCESS),a):(n("Credenciales incorrectas",o.ERROR),null)}function ut(){W(),n("Sesi\xF3n cerrada exitosamente",o.SUCCESS)}function Nt({email:t,password:e}){return t===x.CLIENT.email&&e===x.CLIENT.password?{name:"Juan Cliente",type:"client",email:t}:null}function Et({agentId:t,password:e}){return t===x.AGENT.id&&e===x.AGENT.password?{name:"Guillermo Krause",type:"agent",id:t}:null}function pt(t){return t?t.type==="client"?b.DASHBOARD:t.type==="agent"?b.AGENT_DASHBOARD:b.HOME:b.HOME}window.appHandlers={navigateTo:O,toggleMobileMenu:ct,toggleFooter:lt,skipToFinalState:j,showHomeSection:Z,handleClientLogin:It,handleAgentLogin:Ct,handleContactSubmit:St,logout:ut,viewPolicy:Ot,makePayment:xt,fileClaim:_t,updateInfo:wt,contactAgent:yt,downloadPaymentHistory:Mt,openQuoteModal:Pt,addNewClient:Rt,viewClientDetails:Dt,editClient:Ht,processQuote:Lt,createQuote:Ut,processRenewal:Ft,viewReports:Bt,completeTask:kt,viewCommissionDetails:Gt,showAgentRegistration:zt};function St(t){t.preventDefault(),n("Mensaje enviado exitosamente. Te contactaremos pronto.",o.SUCCESS),t.target.reset()}function It(t){t.preventDefault();let e=t.target[0].value,a=t.target[1].value;F({email:e,password:a},"client")&&O("dashboard")}function Ct(t){t.preventDefault();let e=t.target[0].value,a=t.target[1].value;F({agentId:e,password:a},"agent")&&O("agent-dashboard")}function Ot(t){n(`Mostrando detalles de p\xF3liza ${t}`,o.INFO)}function xt(){n("Redirigiendo a pasarela de pago...",o.INFO)}function _t(){n("Abriendo formulario de siniestros...",o.INFO)}function wt(){n("Abriendo formulario de actualizaci\xF3n...",o.INFO)}function yt(){n("Abriendo chat con agente...",o.INFO)}function Mt(){n("Descargando historial...",o.INFO)}function Pt(t){n(`Abriendo cotizaci\xF3n para seguro de ${t}`,o.INFO)}function Rt(){n("Abriendo formulario de nuevo cliente...",o.INFO)}function Dt(t){n(`Mostrando detalles del cliente ${t}`,o.INFO)}function Ht(t){n(`Editando cliente ${t}`,o.INFO)}function Lt(t){n(`Procesando cotizaci\xF3n ${t}`,o.INFO)}function Ut(){n("Creando nueva cotizaci\xF3n...",o.INFO)}function Ft(){n("Abriendo renovaciones pendientes...",o.INFO)}function Bt(){n("Generando reportes...",o.INFO)}function kt(t){n("Tarea completada",o.SUCCESS)}function Gt(){n("Mostrando detalle de comisiones...",o.INFO)}function zt(){n("Contacta al administrador para solicitar acceso como agente",o.INFO)}document.addEventListener("DOMContentLoaded",()=>{if(Y(),dt()){let t=I(),e=pt(t);O(e)}else O("home");console.log("\u{1F3DB}\uFE0F Krause Insurance App cargada correctamente (Modular)")});
