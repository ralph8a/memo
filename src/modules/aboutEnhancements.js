// About page enhancements
// - Animated counters (Option B stats strip)
// - Testimonials slider (auto-advance + dot navigation)

function prefersReducedMotion() {
    try {
        return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    } catch {
        return false;
    }
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function formatCompactInt(n) {
    // Keep it simple and language-agnostic; user can localize later if needed.
    return String(Math.round(n));
}

function animateNumber(el, target, { durationMs = 900, suffix = '' } = {}) {
    if (!el) return;
    const start = 0;
    const startTs = performance.now();

    const tick = (now) => {
        const t = clamp((now - startTs) / durationMs, 0, 1);
        const eased = easeOutCubic(t);
        const value = start + (target - start) * eased;
        el.textContent = `${formatCompactInt(value)}${suffix}`;

        if (t < 1) {
            window.requestAnimationFrame(tick);
        } else {
            el.textContent = `${formatCompactInt(target)}${suffix}`;
        }
    };

    window.requestAnimationFrame(tick);
}

export function initAboutEnhancements(root = document) {
    const container = root.querySelector?.('.about-fullpage') || root;
    if (!container) return;

    // Cleanup any previous instance
    if (typeof window.__aboutEnhancementsCleanup === 'function') {
        try {
            window.__aboutEnhancementsCleanup();
        } catch {
            // no-op
        }
    }

    const cleanups = [];

    // ===== Counters =====
    const countEls = Array.from(container.querySelectorAll('.about-stat-number[data-target]'));
    const reduced = prefersReducedMotion();

    for (const el of countEls) {
        // Reset for a consistent first render
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = `0${suffix}`;
    }

    let countersObserver = null;
    const counted = new WeakSet();

    if (!reduced && 'IntersectionObserver' in window && countEls.length) {
        countersObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const el = entry.target;
                    if (counted.has(el)) continue;

                    const rawTarget = Number(el.getAttribute('data-target'));
                    if (!Number.isFinite(rawTarget)) continue;

                    counted.add(el);
                    const suffix = el.getAttribute('data-suffix') || '';
                    animateNumber(el, rawTarget, { durationMs: 950, suffix });
                }
            },
            { threshold: 0.35 }
        );

        for (const el of countEls) countersObserver.observe(el);
    } else {
        // No observer / reduced motion: just set final values.
        for (const el of countEls) {
            const rawTarget = Number(el.getAttribute('data-target'));
            if (!Number.isFinite(rawTarget)) continue;
            const suffix = el.getAttribute('data-suffix') || '';
            el.textContent = `${formatCompactInt(rawTarget)}${suffix}`;
        }
    }

    // ===== Core cards rail (Historia/Misión/Equipo) keyboard navigation =====
    const coreRail = container.querySelector('.about-content-grid');
    let coreActiveIndex = 0;

    function isEditableTarget(t) {
        if (!t) return false;
        const el = t.nodeType === 1 ? t : null;
        if (!el) return false;
        if (el.isContentEditable) return true;
        const tag = (el.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select';
    }

    function getCorePanels() {
        return Array.from(coreRail?.children || []).filter((n) => n?.nodeType === 1);
    }

    function getLeftWithinScroller(scroller, node) {
        if (!scroller || !node) return 0;
        const scrollerRect = scroller.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        return (nodeRect.left - scrollerRect.left) + scroller.scrollLeft;
    }

    function computeCoreActiveFromScroll() {
        const panels = getCorePanels();
        if (!coreRail || !panels.length) return;

        const x = coreRail.scrollLeft;
        let bestIndex = 0;
        let bestDist = Infinity;
        for (let i = 0; i < panels.length; i++) {
            const left = getLeftWithinScroller(coreRail, panels[i]);
            const d = Math.abs(left - x);
            if (d < bestDist) {
                bestDist = d;
                bestIndex = i;
            }
        }
        coreActiveIndex = bestIndex;
    }

    function scrollCoreTo(index, { behavior = 'smooth' } = {}) {
        const panels = getCorePanels();
        if (!coreRail || !panels.length) return;
        const safeIndex = clamp(index, 0, panels.length - 1);
        const left = getLeftWithinScroller(coreRail, panels[safeIndex]);
        coreRail.scrollTo({ left: Math.max(0, left - 2), behavior });
        coreActiveIndex = safeIndex;
    }

    if (coreRail) {
        const onCoreScroll = () => computeCoreActiveFromScroll();
        coreRail.addEventListener('scroll', onCoreScroll, { passive: true });
        cleanups.push(() => coreRail.removeEventListener('scroll', onCoreScroll));

        const onCoreKeyDown = (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (isEditableTarget(e.target)) return;

            // If focus is inside the dynamic rail or the testimonials slider, do not steal their arrows.
            const target = e.target;
            if (target && typeof target.closest === 'function') {
                if (target.closest('.about-dynamic')) return;
            }

            const panels = getCorePanels();
            if (!panels.length) return;

            e.preventDefault();
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const next = clamp(coreActiveIndex + delta, 0, panels.length - 1);
            scrollCoreTo(next, { behavior: reduced ? 'auto' : 'smooth' });
        };

        // Capture so it works even if focus is on a child element.
        coreRail.addEventListener('keydown', onCoreKeyDown, true);
        cleanups.push(() => coreRail.removeEventListener('keydown', onCoreKeyDown, true));

        // Initial sync
        computeCoreActiveFromScroll();
    }

    // ===== Testimonials slider =====
    const slider = container.querySelector('.about-testimonials-slider');
    const track = container.querySelector('.about-testimonials-track');
    const dotEls = Array.from(container.querySelectorAll('.about-dot'));

    // ===== Rail (stats/partners/testimonials) keyboard navigation =====
    const rail = container.querySelector('.about-dynamic');
    let railActiveIndex = 0;

    function getRailPanels() {
        if (!rail) return [];
        // Direct children are panels by design: stats strip, partners, testimonials
        return Array.from(rail.children || []).filter((n) => n?.nodeType === 1);
    }

    function getRailPanelLeft(panel) {
        if (!rail || !panel) return 0;
        // More robust than offsetLeft when layout/positioning changes.
        const railRect = rail.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        return (panelRect.left - railRect.left) + rail.scrollLeft;
    }

    function computeRailActiveFromScroll() {
        const panels = getRailPanels();
        if (!rail || !panels.length) return;

        const x = rail.scrollLeft;
        let bestIndex = 0;
        let bestDist = Infinity;
        for (let i = 0; i < panels.length; i++) {
            const left = getRailPanelLeft(panels[i]);
            const d = Math.abs(left - x);
            if (d < bestDist) {
                bestDist = d;
                bestIndex = i;
            }
        }

        railActiveIndex = bestIndex;
    }

    function scrollRailTo(index, { behavior = 'smooth' } = {}) {
        const panels = getRailPanels();
        if (!rail || !panels.length) return;
        const safeIndex = clamp(index, 0, panels.length - 1);
        const left = getRailPanelLeft(panels[safeIndex]);
        rail.scrollTo({ left: Math.max(0, left - 2), behavior });
        railActiveIndex = safeIndex;
    }

    let autoTimer = null;
    let activeIndex = 0;

    function getSlides() {
        return Array.from(track?.children || []).filter((n) => n?.nodeType === 1);
    }

    function setActiveSlideClass(index) {
        const slides = getSlides();
        for (let i = 0; i < slides.length; i++) {
            if (i === index) slides[i].classList.add('is-active');
            else slides[i].classList.remove('is-active');
        }
    }

    function setActiveDot(index) {
        activeIndex = index;
        for (const dot of dotEls) {
            const i = Number(dot.getAttribute('data-index'));
            if (i === index) dot.classList.add('is-active');
            else dot.classList.remove('is-active');
        }

        setActiveSlideClass(index);
    }

    function scrollToSlide(index, { behavior = 'smooth' } = {}) {
        const slides = getSlides();
        if (!slider || !slides.length) return;

        const safeIndex = clamp(index, 0, slides.length - 1);
        const slide = slides[safeIndex];

        // Use offsetLeft relative to the scrolling container.
        slider.scrollTo({ left: slide.offsetLeft - 2, behavior });
        setActiveDot(safeIndex);
    }

    function computeActiveFromScroll() {
        const slides = getSlides();
        if (!slider || !slides.length) return;

        const x = slider.scrollLeft;
        let bestIndex = 0;
        let bestDist = Infinity;

        for (let i = 0; i < slides.length; i++) {
            const d = Math.abs(slides[i].offsetLeft - x);
            if (d < bestDist) {
                bestDist = d;
                bestIndex = i;
            }
        }

        setActiveDot(bestIndex);
    }

    function startAutoAdvance() {
        if (reduced) return;
        if (!slider || !track) return;

        stopAutoAdvance();
        autoTimer = window.setInterval(() => {
            const slides = getSlides();
            if (!slides.length) return;
            const next = (activeIndex + 1) % slides.length;
            scrollToSlide(next, { behavior: 'smooth' });
        }, 6500);
    }

    function stopAutoAdvance() {
        if (autoTimer) {
            window.clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    if (slider && track && dotEls.length) {
        // Dot navigation
        for (const dot of dotEls) {
            const handler = () => {
                const idx = Number(dot.getAttribute('data-index'));
                if (!Number.isFinite(idx)) return;
                scrollToSlide(idx, { behavior: 'smooth' });
            };
            dot.addEventListener('click', handler);
            cleanups.push(() => dot.removeEventListener('click', handler));
        }

        // Keep dots in sync while user scrolls manually
        const onScroll = () => computeActiveFromScroll();
        slider.addEventListener('scroll', onScroll, { passive: true });
        cleanups.push(() => slider.removeEventListener('scroll', onScroll));

        // Keyboard navigation (tech/power-user friendly)
        const onKeyDown = (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const slides = getSlides();
            if (!slides.length) return;

            e.preventDefault();

            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const next = clamp(activeIndex + delta, 0, slides.length - 1);
            scrollToSlide(next, { behavior: 'smooth' });
        };
        slider.addEventListener('keydown', onKeyDown);
        cleanups.push(() => slider.removeEventListener('keydown', onKeyDown));

        // Pause on interaction
        const onEnter = () => stopAutoAdvance();
        const onLeave = () => startAutoAdvance();
        slider.addEventListener('pointerenter', onEnter);
        slider.addEventListener('pointerleave', onLeave);
        slider.addEventListener('focusin', onEnter);
        slider.addEventListener('focusout', onLeave);

        cleanups.push(() => slider.removeEventListener('pointerenter', onEnter));
        cleanups.push(() => slider.removeEventListener('pointerleave', onLeave));
        cleanups.push(() => slider.removeEventListener('focusin', onEnter));
        cleanups.push(() => slider.removeEventListener('focusout', onLeave));

        // Initial
        setActiveDot(0);
        startAutoAdvance();

        // In case layout changes, keep the active slide aligned.
        let resizeObserver = null;
        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(() => {
                // Snap back to the active slide (no animation on resize)
                scrollToSlide(activeIndex, { behavior: 'auto' });
            });
            resizeObserver.observe(slider);
            cleanups.push(() => {
                try {
                    resizeObserver.disconnect();
                } catch {
                    // no-op
                }
            });
        }
    }

    // Rail arrow navigation (power-user friendly).
    // Note: the testimonials slider already uses ArrowLeft/ArrowRight; avoid double-handling.
    if (rail) {
        // Keep railActiveIndex in sync when the user scrolls the rail manually.
        const onRailScroll = () => computeRailActiveFromScroll();
        rail.addEventListener('scroll', onRailScroll, { passive: true });
        cleanups.push(() => rail.removeEventListener('scroll', onRailScroll));

        const onRailKeyDown = (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

            // If user is interacting with the inner testimonials slider, let it handle arrows.
            const target = e.target;
            if (target && typeof target.closest === 'function') {
                if (target.closest('.about-testimonials-slider')) return;
            }

            const panels = getRailPanels();
            if (!panels.length) return;

            e.preventDefault();

            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const next = clamp(railActiveIndex + delta, 0, panels.length - 1);
            scrollRailTo(next, { behavior: reduced ? 'auto' : 'smooth' });
        };

        // Use capture so it works even if focus is on a child element inside the rail.
        rail.addEventListener('keydown', onRailKeyDown, true);
        cleanups.push(() => rail.removeEventListener('keydown', onRailKeyDown, true));

        // Initial sync
        computeRailActiveFromScroll();
    }

    window.__aboutEnhancementsCleanup = () => {
        stopAutoAdvance();

        for (const fn of cleanups) {
            try {
                fn();
            } catch {
                // no-op
            }
        }

        if (countersObserver) {
            try {
                countersObserver.disconnect();
            } catch {
                // no-op
            }
            countersObserver = null;
        }

        delete window.__aboutEnhancementsCleanup;
    };
}
