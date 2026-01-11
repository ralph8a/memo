// Complete Loading Modal Controller with Progress, Logo Animation, and Particles
// Provides show/hide helpers with ref-counted overlay, progress tracking, and visual enhancements

let modalEl;
let progressEl;
let percentageEl;
let statusEl;
let titleEl;
let funFactEl;
let progressBarEl;
let timer = null;
let depth = 0;
let progressInterval = null;
let currentProgress = 0;

const MIN_DELAY = 180;

// Logo animation parts
const logoParts = {
    circle: null,
    diamond: null,
    arc: null,
    line: null,
    center: null
};

// Fun facts for the "Did you know" section
const funFacts = [
    "Krause Insurance fue fundada con el compromiso de brindar protección personalizada a cada familia y negocio.",
    "El primer seguro documentado data del año 1347 en Génova, Italia.",
    "El seguro de vida ayuda a proteger el futuro financiero de tus seres queridos.",
    "Krause Insurance trabaja con las aseguradoras más confiables.",
    "Comparar cotizaciones puede ahorrarte hasta un 30% en tu prima anual.",
    "Un seguro de hogar bien estructurado protege tu patrimonio ante eventos inesperados.",
    "El seguro de auto es obligatorio en la mayoría de estados para circular legalmente.",
    "Revisar tus pólizas anualmente puede ayudarte a identificar ahorros y mejorar coberturas."
];

// Status messages for different progress phases
const statusMessages = [
    { text: 'Inicializando sistema', detail: 'Conectando' },
    { text: 'Verificando credenciales', detail: 'Autenticando' },
    { text: 'Cargando datos de usuario', detail: 'Sincronizando' },
    { text: 'Configurando preferencias', detail: 'Personalizando' },
    { text: 'Preparando interfaz', detail: 'Optimizando' },
    { text: 'Cargando recursos', detail: 'Finalizando' },
    { text: 'Pre-cache completado', detail: 'Listo' }
];

function createModalComponent() {
    // Create modal HTML structure dynamically
    const modalHTML = `
        <div class="loading-modal" id="loadingModal" role="dialog" aria-modal="true" aria-label="Cargando">
            <div class="modal-card">
                <div class="logo-and-info">
                    <svg class="shield-svg krause-shield" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                        <ellipse class="shield-circle" cx="40" cy="38" rx="22" ry="22" />
                        <path class="shield-diamond" d="M40 12 L62 35 L40 70 L18 35 Z" />
                        <path class="shield-arc" d="M24 50 Q40 30 56 50" />
                        <line class="shield-line" x1="40" y1="50" x2="40" y2="68" />
                        <circle class="shield-center" cx="40" cy="40" r="6" />
                    </svg>
                    <div class="modal-info">
                        <h2 id="loading-title">Preparando tu experiencia</h2>
                        <div class="progress-percentage" id="percentage">0%</div>
                        <div class="status-text" id="status">Inicializando sistema</div>
                        <div class="progress-bar-container" aria-hidden="true">
                            <div id="progressBar" class="progress-bar-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="did-you-know" id="didYouKnow">
                    <div class="did-you-know-title">💡 Sabías que...</div>
                    <div id="funFact">Cargando dato interesante...</div>
                </div>
            </div>
        </div>
    `;

    // Create particles container
    const particlesHTML = '<div class="bg-particles" id="particles"></div>';

    // Insert into DOM
    document.body.insertAdjacentHTML('beforeend', particlesHTML);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    return document.getElementById('loadingModal');
}

function ensureModal() {
    if (modalEl) return true;

    // Try to find existing modal first
    modalEl = document.getElementById('loadingModal');
    
    // If not found, create it dynamically
    if (!modalEl) {
        modalEl = createModalComponent();
    }

    if (!modalEl) {
        console.error('Failed to create loading modal');
        return false;
    }

    progressBarEl = document.getElementById('progressBar');
    percentageEl = document.getElementById('percentage');
    statusEl = document.getElementById('status');
    titleEl = document.getElementById('loading-title');
    funFactEl = document.getElementById('funFact');

    // Initialize logo parts
    logoParts.circle = modalEl.querySelector('.shield-circle');
    logoParts.diamond = modalEl.querySelector('.shield-diamond');
    logoParts.arc = modalEl.querySelector('.shield-arc');
    logoParts.line = modalEl.querySelector('.shield-line');
    logoParts.center = modalEl.querySelector('.shield-center');

    initLogoParts();
    initParticles();
    return true;
}

function initLogoParts() {
    const partsConfig = [
        { el: logoParts.circle, start: 0, end: 35 },
        { el: logoParts.diamond, start: 30, end: 65 },
        { el: logoParts.arc, start: 55, end: 85 },
        { el: logoParts.line, start: 75, end: 95 }
    ];

    logoParts._config = partsConfig;

    partsConfig.forEach(p => {
        const el = p.el;
        if (!el) return;
        let len = 220;
        try {
            if (typeof el.getTotalLength === 'function') {
                len = Math.max(8, Math.floor(el.getTotalLength()));
            }
        } catch (e) { }
        el.__len = len;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        el.style.opacity = 0.25;
        el.style.transition = 'stroke-dashoffset 140ms linear, opacity 140ms linear';
    });

    if (logoParts.center) {
        logoParts.center.style.opacity = 0;
        logoParts.center.classList.remove('active');
    }
}

function resetLogo() {
    Object.values(logoParts).forEach(el => {
        if (el) el.classList.remove('active');
    });
}

function updateLogoByProgress(pct) {
    if (!logoParts._config) return;

    const cfg = logoParts._config;
    cfg.forEach(p => {
        const el = p.el;
        if (!el) return;
        const len = el.__len || 220;

        if (pct <= p.start) {
            el.style.strokeDashoffset = Math.ceil(len);
            el.style.opacity = 0.2;
        } else if (pct >= p.end) {
            el.style.strokeDashoffset = 0;
            el.style.opacity = 1;
        } else {
            const local = (pct - p.start) / (p.end - p.start);
            const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, local)), 0.9);
            el.style.strokeDashoffset = Math.ceil(len * (1 - eased));
            el.style.opacity = (0.25 + 0.75 * eased).toFixed(2);
        }
    });

    // Center pop near the end
    const centerStart = 90;
    if (logoParts.center) {
        if (pct >= centerStart) {
            if (!logoParts.center.classList.contains('active')) {
                logoParts.center.classList.add('active');
            }
        } else {
            logoParts.center.classList.remove('active');
        }
    }
}

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer || particlesContainer.children.length > 0) return;

    for (let i = 0; i < 24; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationName = 'floatUp';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationIterationCount = 'infinite';
        particle.style.animationTimingFunction = 'ease-in-out';
        particlesContainer.appendChild(particle);
    }
}

function startProgress(duration = 3000) {
    currentProgress = 0;
    const step = Math.max(10, Math.floor(duration / 100));

    if (progressInterval) clearInterval(progressInterval);

    progressInterval = setInterval(() => {
        currentProgress = Math.min(100, currentProgress + 1);

        if (percentageEl) percentageEl.textContent = currentProgress + '%';
        if (progressBarEl) progressBarEl.style.width = currentProgress + '%';

        updateLogoByProgress(currentProgress);

        const statusIndex = Math.floor((currentProgress / 100) * statusMessages.length);
        if (statusIndex < statusMessages.length && statusEl) {
            statusEl.textContent = statusMessages[statusIndex].text;
        }

        if (currentProgress >= 100) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }, Math.max(12, Math.floor(duration / 100)));
}

function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

export function showLoading(message = 'Preparando tu experiencia', detail = 'Inicializando sistema', showProgress = true) {
    if (!ensureModal()) {
        console.error('Could not initialize loading modal');
        return;
    }

    depth += 1;

    if (titleEl) titleEl.textContent = message;
    if (statusEl) statusEl.textContent = detail;
    if (funFactEl) funFactEl.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];

    // Reset progress
    currentProgress = 0;
    if (percentageEl) percentageEl.textContent = '0%';
    if (progressBarEl) progressBarEl.style.width = '0%';

    resetLogo();

    modalEl.classList.add('visible');
    document.body.classList.add('loading-locked');

    if (showProgress) {
        startProgress(3000);
    }

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}

export function hideLoading(delay = MIN_DELAY) {
    depth = Math.max(0, depth - 1);
    if (depth > 0) return;

    stopProgress();

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        if (depth === 0 && modalEl) {
            modalEl.classList.remove('visible');
            document.body.classList.remove('loading-locked');
            // Reset after animation
            setTimeout(() => {
                if (percentageEl) percentageEl.textContent = '0%';
                if (progressBarEl) progressBarEl.style.width = '0%';
                resetLogo();
            }, 300);
        }
    }, delay);
}

export async function withLoading(action, opts = {}) {
    const {
        message = 'Preparando tu experiencia',
        detail = 'Inicializando sistema',
        minDelay = MIN_DELAY,
        showProgress = true
    } = opts;

    showLoading(message, detail, showProgress);
    try {
        const result = typeof action === 'function' ? await action() : await action;
        return result;
    } finally {
        hideLoading(minDelay);
    }
}

// Helper to set progress manually (for custom loading scenarios)
export function setProgress(percent) {
    if (percentageEl) percentageEl.textContent = Math.round(percent) + '%';
    if (progressBarEl) progressBarEl.style.width = Math.round(percent) + '%';
    updateLogoByProgress(percent);
}

// Helper to update status message
export function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
}

