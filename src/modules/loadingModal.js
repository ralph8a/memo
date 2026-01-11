// Lightweight loading modal controller
// Provides show/hide helpers and a ref-counted overlay to avoid flicker.

let modalEl;
let messageEl;
let detailEl;
let timer = null;
let depth = 0;

const MIN_DELAY = 180;

function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.id = 'loading-modal';
    modalEl.className = 'loading-modal';
    modalEl.innerHTML = `
        <div class="loading-container" role="status" aria-live="polite">
            <div class="shield-loader">
                <svg class="shield-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="shield-outline" d="M100 10 L180 50 L180 110 Q180 170 100 230 Q20 170 20 110 L20 50 Z"/>
                    <path class="shield-fill" d="M100 10 L180 50 L180 110 Q180 170 100 230 Q20 170 20 110 L20 50 Z"/>
                    <circle class="shield-center" cx="100" cy="100" r="30"/>
                    <rect class="shield-cross" x="95" y="75" width="10" height="50" rx="3"/>
                    <rect class="shield-cross" x="75" y="95" width="50" height="10" rx="3"/>
                </svg>
            </div>
            <h2 class="loading-title">KRAUSE INSURANCE</h2>
            <p class="loading-message" id="loading-message">Preparando la experiencia</p>
            <p class="loading-detail" id="loading-detail">Por favor espera...</p>
        </div>
    `;
    document.body.appendChild(modalEl);
    messageEl = modalEl.querySelector('#loading-message');
    detailEl = modalEl.querySelector('#loading-detail');
}

export function showLoading(message = 'Cargando...', detail = 'Procesando') {
    ensureModal();
    depth += 1;
    if (messageEl) messageEl.textContent = message;
    if (detailEl) detailEl.textContent = detail;
    modalEl.classList.add('visible');
    document.body.classList.add('loading-locked');
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}

export function hideLoading(delay = MIN_DELAY) {
    depth = Math.max(0, depth - 1);
    if (depth > 0) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        if (depth === 0 && modalEl) {
            modalEl.classList.remove('visible');
            document.body.classList.remove('loading-locked');
        }
    }, delay);
}

export async function withLoading(action, opts = {}) {
    const { message = 'Cargando...', detail = 'Procesando', minDelay = MIN_DELAY } = opts;
    showLoading(message, detail);
    try {
        const result = typeof action === 'function' ? await action() : await action;
        return result;
    } finally {
        hideLoading(minDelay);
    }
}
