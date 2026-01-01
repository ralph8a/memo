// Services Tech Modules Navigation
// Handles active state for the Services technical module nav (Guía/Proceso/Comparador/Siniestros/FAQ)

function getPanelIdFromLink(link) {
    const href = link?.getAttribute?.('href') || '';
    if (!href.startsWith('#')) return null;
    const id = href.slice(1).trim();
    return id || null;
}

export function initServicesTechNav(root = document) {
    const container = root.querySelector?.('.services-tech');
    if (!container) return;

    // Cleanup any previous instance (in case we re-navigate to services)
    if (typeof window.__servicesTechNavCleanup === 'function') {
        try {
            window.__servicesTechNavCleanup();
        } catch {
            // no-op
        }
    }

    const links = Array.from(container.querySelectorAll('.services-tech-link'));
    const panels = Array.from(container.querySelectorAll('.services-panel'));
    const panelsContainer = container.querySelector('.services-tech-panels');

    if (!links.length || !panels.length) return;

    // Signal to CSS that JS has enhanced the module nav (disables first-tab fallback styles)
    container.classList.add('is-enhanced');

    const panelById = new Map(panels.filter(p => p?.id).map(p => [p.id, p]));

    const defaultId = getPanelIdFromLink(links[0]) || panels[0].id;

    const isDesktopLayout = () => {
        try {
            return !!window.matchMedia?.('(min-width: 1024px)')?.matches;
        } catch {
            return false;
        }
    };

    let isProgrammaticScroll = false;
    let programmaticScrollTimer = null;
    let observer = null;
    let compareUnlockTimer = null;
    let dragScrollCleanups = [];

    const COMPARE_PANEL_ID = 'services-panel-compare';
    const COMPARE_ACTIVE_CLASS = 'is-compare-active';

    function isMobileOrTabletLayout() {
        return !isDesktopLayout();
    }

    function setCompareActiveState(isActive) {
        if (!isMobileOrTabletLayout()) {
            container.classList.remove(COMPARE_ACTIVE_CLASS);
            return;
        }

        if (isActive) container.classList.add(COMPARE_ACTIVE_CLASS);
        else container.classList.remove(COMPARE_ACTIVE_CLASS);
    }

    function enableDragToScrollX(el, {
        ignoreSelector = 'a, button, input, textarea, select, label, [role="button"]'
    } = {}) {
        if (!el || el.dataset?.dragScrollX === '1') return () => { };
        el.dataset.dragScrollX = '1';

        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;
        let activePointerId = null;

        const onPointerDown = (e) => {
            // Only mouse/pen dragging; touch devices should use native panning.
            if (e.pointerType === 'touch') return;
            if (e.button !== 0) return;

            // Don't hijack clicks on interactive elements.
            if (ignoreSelector && e.target?.closest?.(ignoreSelector)) return;

            // If the element can't scroll horizontally, don't start.
            if (el.scrollWidth <= el.clientWidth + 1) return;

            isDragging = true;
            activePointerId = e.pointerId;
            startX = e.clientX;
            startScrollLeft = el.scrollLeft;
            el.classList.add('is-dragging');

            try {
                el.setPointerCapture?.(activePointerId);
            } catch {
                // no-op
            }

            // Prevent text selection while dragging.
            e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            if (activePointerId != null && e.pointerId !== activePointerId) return;

            const dx = e.clientX - startX;
            el.scrollLeft = startScrollLeft - dx;
        };

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            activePointerId = null;
            el.classList.remove('is-dragging');
        };

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', stopDrag);
        el.addEventListener('pointercancel', stopDrag);
        el.addEventListener('lostpointercapture', stopDrag);

        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerup', stopDrag);
            el.removeEventListener('pointercancel', stopDrag);
            el.removeEventListener('lostpointercapture', stopDrag);
            try {
                delete el.dataset.dragScrollX;
            } catch {
                // no-op
            }
            el.classList.remove('is-dragging');
        };
    }

    function enhanceCompareHorizontalScroll() {
        // Comparator card rail (horizontal)
        const compareGrid = container.querySelector?.(`#${COMPARE_PANEL_ID} .services-compare-grid`);
        if (compareGrid) {
            // Make it keyboard-focusable (arrow keys + scrollbar drag).
            if (!compareGrid.hasAttribute('tabindex')) compareGrid.tabIndex = 0;
            if (!compareGrid.hasAttribute('role')) compareGrid.setAttribute('role', 'region');
            if (!compareGrid.hasAttribute('aria-label')) compareGrid.setAttribute('aria-label', 'Comparador: desplázate horizontalmente');

            dragScrollCleanups.push(
                enableDragToScrollX(compareGrid, {
                    // Let the inner tables keep their own scroll behavior.
                    ignoreSelector: 'a, button, input, textarea, select, label, [role="button"], .services-compare-table-wrapper, table'
                })
            );
        }

        // Individual comparison tables (also horizontal on narrow widths)
        const tableWrappers = Array.from(container.querySelectorAll(`#${COMPARE_PANEL_ID} .services-compare-table-wrapper`));
        for (const w of tableWrappers) {
            dragScrollCleanups.push(enableDragToScrollX(w));
        }
    }

    function markProgrammaticScroll(ms = 650) {
        isProgrammaticScroll = true;
        if (programmaticScrollTimer) window.clearTimeout(programmaticScrollTimer);
        programmaticScrollTimer = window.setTimeout(() => {
            isProgrammaticScroll = false;
            programmaticScrollTimer = null;
        }, ms);
    }

    function setActive(id, { scrollIntoView = true, updateHash = false } = {}) {
        if (!id || !panelById.has(id)) id = defaultId;

        // On desktop, panels are not horizontally scrollable; avoid vertical jumps.
        if (isDesktopLayout()) {
            scrollIntoView = false;
        }

        // Links
        for (const link of links) {
            const linkId = getPanelIdFromLink(link);
            if (linkId === id) link.classList.add('is-active');
            else link.classList.remove('is-active');
        }

        // Panels
        for (const panel of panels) {
            if (panel.id === id) panel.classList.add('is-active');
            else panel.classList.remove('is-active');
        }

        // On mobile/tablet, the panels container is itself a horizontal scroller.
        // When the comparator is active, we want horizontal gestures to operate on the comparator rail,
        // not the outer panels scroller. We apply the state class AFTER scrollIntoView so we don't block alignment.
        if (compareUnlockTimer) {
            window.clearTimeout(compareUnlockTimer);
            compareUnlockTimer = null;
        }

        setCompareActiveState(false);

        if (updateHash) {
            const currentHashId = (window.location.hash || '').replace('#', '').trim();
            if (currentHashId !== id) {
                const nextUrl = `${window.location.pathname}${window.location.search}#${id}`;
                window.history.replaceState(null, '', nextUrl);
            }
        }

        if (scrollIntoView) {
            const panel = panelById.get(id);
            if (panel) {
                markProgrammaticScroll();
                // If panels are horizontally scrollable (mobile/tablet), align the chosen one.
                // On desktop, panels are single-view, so this is essentially a no-op.
                panel.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

                // Nudge the scroll container so keyboard users stay within the region.
                if (panelsContainer && panelsContainer.contains(panel)) {
                    panelsContainer.focus?.({ preventScroll: true });
                }
            }
        }

        if (id === COMPARE_PANEL_ID && isMobileOrTabletLayout()) {
            // Wait a beat so scrollIntoView can complete, then lock the outer panels scroller.
            compareUnlockTimer = window.setTimeout(() => {
                setCompareActiveState(true);
                compareUnlockTimer = null;
            }, 700);
        }
    }

    function syncFromHash() {
        const hashId = (window.location.hash || '').replace('#', '').trim();
        if (hashId && panelById.has(hashId)) {
            setActive(hashId, { scrollIntoView: true });
            return;
        }
        setActive(defaultId, { scrollIntoView: false });
    }

    const clickHandlers = new Map();
    for (const link of links) {
        const handler = (e) => {
            e.preventDefault();
            const id = getPanelIdFromLink(link);
            if (!id) return;

            // Update URL hash WITHOUT jumping the page.
            const nextUrl = `${window.location.pathname}${window.location.search}#${id}`;
            window.history.replaceState(null, '', nextUrl);

            setActive(id, { scrollIntoView: true });
        };

        clickHandlers.set(link, handler);
        link.addEventListener('click', handler);
    }

    const onHashChange = () => syncFromHash();
    window.addEventListener('hashchange', onHashChange);

    // Initial state
    syncFromHash();

    // Comparator: make horizontal scrolling discoverable/easy (mouse drag + table drag).
    enhanceCompareHorizontalScroll();

    // Keep the active tab in sync when the user scrolls panels manually (mobile/tablet)
    if (panelsContainer && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver(
            (entries) => {
                if (isProgrammaticScroll) return;

                // Pick the most visible intersecting panel
                let best = null;
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    if (!best || entry.intersectionRatio > best.intersectionRatio) {
                        best = entry;
                    }
                }

                const panel = best?.target;
                const id = panel?.id;
                if (id && panelById.has(id)) {
                    setActive(id, { scrollIntoView: false, updateHash: true });
                }
            },
            {
                root: panelsContainer,
                threshold: [0.55, 0.7, 0.85]
            }
        );

        for (const panel of panels) observer.observe(panel);
    }

    window.__servicesTechNavCleanup = () => {
        window.removeEventListener('hashchange', onHashChange);
        for (const [link, handler] of clickHandlers.entries()) {
            link.removeEventListener('click', handler);
        }

        container.classList.remove('is-enhanced');
        container.classList.remove(COMPARE_ACTIVE_CLASS);

        for (const cleanup of dragScrollCleanups) {
            try {
                cleanup();
            } catch {
                // no-op
            }
        }
        dragScrollCleanups = [];

        if (observer) {
            try {
                observer.disconnect();
            } catch {
                // no-op
            }
            observer = null;
        }

        if (programmaticScrollTimer) {
            window.clearTimeout(programmaticScrollTimer);
            programmaticScrollTimer = null;
        }

        if (compareUnlockTimer) {
            window.clearTimeout(compareUnlockTimer);
            compareUnlockTimer = null;
        }
        delete window.__servicesTechNavCleanup;
    };
}
