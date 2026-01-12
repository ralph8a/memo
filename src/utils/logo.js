const SVG_NS = 'http://www.w3.org/2000/svg';

const SIZE_CLASS = {
    sm: 'logo-size-sm',
    md: 'logo-size-md',
    lg: 'logo-size-lg'
};

const VALID_SIZES = new Set(['sm', 'md', 'lg']);
const VALID_CONTRASTS = new Set(['primary', 'ink', 'on-dark', 'muted']);

function normalizeSize(size) {
    if (!size) return 'md';
    const normalized = String(size).toLowerCase();
    return VALID_SIZES.has(normalized) ? normalized : 'md';
}

function normalizeContrast(contrast) {
    if (!contrast) return 'primary';
    const normalized = String(contrast).toLowerCase();
    return VALID_CONTRASTS.has(normalized) ? normalized : 'primary';
}

function createPart(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, String(value));
    });
    return el;
}

export function createLogoElement(options = {}) {
    const size = normalizeSize(options.size);
    const contrast = normalizeContrast(options.contrast);
    const includeCenter = options.includeCenter !== false;
    const ariaLabel = options.ariaLabel ?? 'Krause Insurance';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 80 80');
    svg.setAttribute('role', 'img');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-label', ariaLabel);
    svg.classList.add('krause-shield', SIZE_CLASS[size]);
    svg.dataset.logoSize = size;
    svg.dataset.logoContrast = contrast;

    if (options.className) {
        options.className.split(/\s+/).filter(Boolean).forEach(cls => svg.classList.add(cls));
    }

    const circle = createPart('ellipse', {
        cx: 40,
        cy: 38,
        rx: 22,
        ry: 22,
        class: 'shield-circle',
        'stroke-width': 3,
        stroke: 'currentColor',
        fill: 'none'
    });

    const diamond = createPart('path', {
        d: 'M40 12 L62 35 L40 70 L18 35 Z',
        class: 'shield-diamond',
        'stroke-width': 3,
        stroke: 'currentColor',
        fill: 'none'
    });

    const arc = createPart('path', {
        d: 'M24 50 Q40 30 56 50',
        class: 'shield-arc',
        'stroke-width': 3,
        stroke: 'currentColor',
        fill: 'none'
    });

    const line = createPart('line', {
        x1: 40,
        y1: 50,
        x2: 40,
        y2: 68,
        class: 'shield-line',
        'stroke-width': 3,
        stroke: 'currentColor'
    });

    const center = includeCenter
        ? createPart('circle', { cx: 40, cy: 40, r: 6, class: 'shield-center', fill: 'currentColor' })
        : null;

    svg.appendChild(circle);
    svg.appendChild(diamond);
    svg.appendChild(arc);
    svg.appendChild(line);
    if (center) svg.appendChild(center);

    svg.__logoParts = { circle, diamond, arc, line, center };
    return svg;
}

export function renderLogo(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return null;

    const size = normalizeSize(options.size || el.dataset.logoSize);
    const contrast = normalizeContrast(options.contrast || el.dataset.logoContrast);
    const ariaLabel = options.ariaLabel || el.dataset.logoLabel || el.getAttribute('aria-label') || 'Krause Insurance';

    const className = [el.dataset.logoClass, options.className]
        .filter(Boolean)
        .join(' ')
        .trim();

    const logo = createLogoElement({ size, contrast, ariaLabel, className });
    el.innerHTML = '';
    el.appendChild(logo);
    el.dataset.logoRendered = 'true';
    return logo;
}

export function renderAllLogos(scope = document) {
    const slots = scope.querySelectorAll('[data-render-logo]');
    const rendered = [];
    slots.forEach(slot => {
        if (slot.dataset.logoRendered === 'true') return;
        const logo = renderLogo(slot);
        if (logo) rendered.push(logo);
    });
    return rendered;
}

export function getLogoParts(logoElement) {
    return logoElement?.__logoParts || null;
}
