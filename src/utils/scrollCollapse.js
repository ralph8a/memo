/**
 * Scroll Collapse Handler for Dashboard Surfaces
 * Collapses hero-surface and dashboard-card elements when scrolling down
 */

let lastScrollY = 0;
const SCROLL_THRESHOLD = 80;
const COLLAPSE_CLASS = 'scrolled-collapsed';
let scrollHandler = null;

function initScrollCollapse() {
    const mainWrapper = document.querySelector('.dashboard-stage');
    if (!mainWrapper) {
        // Reintentar después de un delay si no existe aún
        setTimeout(initScrollCollapse, 200);
        return;
    }

    const heroSurface = document.querySelector('.hero-surface');
    const dashboardCards = document.querySelectorAll('.dashboard-card, .stat-card');

    if (!heroSurface && dashboardCards.length === 0) return;

    // Remover listener anterior si existe
    if (scrollHandler) {
        mainWrapper.removeEventListener('scroll', scrollHandler);
    }

    scrollHandler = () => {
        const currentScrollY = mainWrapper.scrollTop;
        const isScrollingDown = currentScrollY > lastScrollY;
        const hasScrolledEnough = currentScrollY > SCROLL_THRESHOLD;

        if (isScrollingDown && hasScrolledEnough) {
            // Collapse surfaces when scrolling down
            if (heroSurface) {
                heroSurface.classList.add(COLLAPSE_CLASS);
            }
            dashboardCards.forEach(card => {
                card.classList.add(COLLAPSE_CLASS);
            });
        } else if (!isScrollingDown || currentScrollY < SCROLL_THRESHOLD / 2) {
            // Expand surfaces when scrolling up or at top
            if (heroSurface) {
                heroSurface.classList.remove(COLLAPSE_CLASS);
            }
            dashboardCards.forEach(card => {
                card.classList.remove(COLLAPSE_CLASS);
            });
        }

        lastScrollY = currentScrollY;
    };

    mainWrapper.addEventListener('scroll', scrollHandler, { passive: true });
}

export { initScrollCollapse };
