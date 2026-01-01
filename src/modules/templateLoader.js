// Template Loader - Dynamically loads HTML templates and CSS
// This module handles template injection and style loading for modular page architecture

const templateCache = {};
const loadedStyles = new Set();

/**
 * Load an HTML template
 * @param {string} templatePath - Path relative to templates folder
 * @returns {Promise<string>} Template HTML content
 */
export async function loadTemplate(templatePath) {
    const fullPath = `/templates/${templatePath}.html`;
    console.log(`[TEMPLATE LOADER] Attempting to load: ${fullPath}`);

    if (templateCache[fullPath]) {
        console.log(`[TEMPLATE LOADER] ✓ Cached: ${fullPath}`);
        return templateCache[fullPath];
    }

    try {
        const response = await fetch(fullPath);
        if (!response.ok) {
            console.error(`[TEMPLATE LOADER] ✗ Template not found: ${fullPath} (status: ${response.status})`);
            return '';
        }
        const html = await response.text();
        templateCache[fullPath] = html;
        console.log(`[TEMPLATE LOADER] ✓ Loaded: ${fullPath} (${html.length} bytes)`);
        return html;
    } catch (error) {
        console.error(`[TEMPLATE LOADER] ✗ Error loading ${fullPath}:`, error);
        return '';
    }
}

/**
 * Load a CSS file for a specific page/component
 * @param {string} stylePath - Path relative to styles folder
 */
export function loadStyles(stylePath) {
    const fullPath = `/styles/${stylePath}.css`;
    console.log(`[STYLE LOADER] Attempting to load: ${fullPath}`);

    // Avoid loading same style twice
    if (loadedStyles.has(fullPath)) {
        console.log(`[STYLE LOADER] ✓ Already loaded: ${fullPath}`);
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fullPath;
    link.dataset.page = stylePath;
    document.head.appendChild(link);
    loadedStyles.add(fullPath);
    console.log(`[STYLE LOADER] ✓ Added: ${fullPath}`);
}

/**
 * Unload CSS for a specific page (cleanup when leaving page)
 * @param {string} stylePath - Path relative to styles folder
 */
export function unloadStyles(stylePath) {
    const fullPath = `/styles/${stylePath}.css`;
    const link = document.querySelector(`link[data-page="${stylePath}"]`);

    if (link) {
        link.remove();
        loadedStyles.delete(fullPath);
    }
}

/**
 * Inject template into mainContent container
 * @param {HTMLElement} container - Target container
 * @param {string} html - Template HTML
 * @param {string} dataPage - data-page attribute value
 */
export function injectTemplate(container, html, dataPage) {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-page', dataPage);
    wrapper.className = 'd-none';
    wrapper.innerHTML = html;
    container.appendChild(wrapper);
}

/**
 * Load and inject a complete page (template + styles)
 * @param {HTMLElement} container - Target container
 * @param {string} pageName - Page name (e.g., 'home', 'services')
 * @param {string} templatePath - Template path
 * @param {string} stylePath - Style path (optional)
 */
export async function loadPage(container, pageName, templatePath, stylePath) {
    try {
        // Load template
        const html = await loadTemplate(templatePath);
        if (!html) {
            console.error(`Failed to load template for ${pageName}`);
            return false;
        }

        // Inject template
        injectTemplate(container, html, pageName);

        // Load styles if specified
        if (stylePath) {
            loadStyles(stylePath);
        }

        return true;
    } catch (error) {
        console.error(`Error loading page ${pageName}:`, error);
        return false;
    }
}

/**
 * Preload multiple templates (for better performance)
 * @param {Array<string>} paths - Array of template paths
 */
export async function preloadTemplates(paths) {
    const promises = paths.map(path => loadTemplate(path));
    await Promise.all(promises);
}
