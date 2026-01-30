/**
 * Global Search Component
 * Búsqueda universal en clientes, pólizas, pagos, cotizaciones
 */

class GlobalSearchComponent {
    constructor() {
        this.searchInput = null;
        this.resultsContainer = null;
        this.debounceTimer = null;
        this.userType = null;
    }

    /**
     * Inicializar búsqueda
     */
    init() {
        // Buscar input de búsqueda en dashboard hero
        this.searchInput = document.querySelector('.hero-search input[type="search"], .search-bar input[type="search"]');

        if (!this.searchInput) return;

        // Determinar tipo de usuario
        const token = localStorage.getItem('jwt_token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userType = payload.user_type;
        }

        // Crear contenedor de resultados
        this.createResultsContainer();

        // Event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim()) {
                this.showResults();
            }
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.hero-search') && !e.target.closest('.search-results')) {
                this.hideResults();
            }
        });
    }

    /**
     * Crear contenedor de resultados
     */
    createResultsContainer() {
        const searchBar = this.searchInput.closest('.hero-search') || this.searchInput.closest('.search-bar');
        if (!searchBar) return;

        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'search-results';
        this.resultsContainer.style.display = 'none';

        searchBar.style.position = 'relative';
        searchBar.appendChild(this.resultsContainer);
    }

    /**
     * Manejar búsqueda con debounce
     */
    handleSearch(query) {
        clearTimeout(this.debounceTimer);

        if (!query.trim()) {
            this.hideResults();
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query.trim());
        }, 300);
    }

    /**
     * Ejecutar búsqueda
     */
    async performSearch(query) {
        this.showLoading();

        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`/backend/index.php?action=global_search&q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data.results, query);
            } else {
                this.displayError('Error en la búsqueda');
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.displayError('Error conectando con el servidor');
        }
    }

    /**
     * Mostrar resultados
     */
    displayResults(results, query) {
        if (!results || Object.keys(results).every(key => results[key].length === 0)) {
            this.displayNoResults(query);
            return;
        }

        let html = `<div class="search-results-header">Resultados para "${query}"</div>`;

        // Clientes
        if (results.clients && results.clients.length > 0) {
            html += `
                <div class="search-category">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Clientes
                    </h4>
                    ${results.clients.map(client => `
                        <div class="search-result-item" onclick="window.globalSearch.viewClient(${client.id})">
                            <div class="search-result-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="7" r="4"/>
                                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                                </svg>
                            </div>
                            <div>
                                <strong>${client.first_name} ${client.last_name}</strong>
                                <small>${client.email}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Pólizas
        if (results.policies && results.policies.length > 0) {
            html += `
                <div class="search-category">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Pólizas
                    </h4>
                    ${results.policies.map(policy => `
                        <div class="search-result-item" onclick="window.globalSearch.viewPolicy(${policy.policy_id})">
                            <div class="search-result-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                </svg>
                            </div>
                            <div>
                                <strong>${policy.policy_number}</strong>
                                <small>${policy.policy_type} - ${policy.client_name || ''}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Cotizaciones (solo agentes)
        if (results.quotes && results.quotes.length > 0 && this.userType === 'agent') {
            html += `
                <div class="search-category">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Cotizaciones
                    </h4>
                    ${results.quotes.map(quote => `
                        <div class="search-result-item">
                            <div class="search-result-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                </svg>
                            </div>
                            <div>
                                <strong>${quote.first_name} ${quote.last_name}</strong>
                                <small>${quote.quote_type} - ${quote.requested_at}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.resultsContainer.innerHTML = html;
        this.showResults();
    }

    /**
     * Mostrar loading
     */
    showLoading() {
        this.resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="spinner"></div>
                <p>Buscando...</p>
            </div>
        `;
        this.showResults();
    }

    /**
     * Sin resultados
     */
    displayNoResults(query) {
        this.resultsContainer.innerHTML = `
            <div class="search-no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                </svg>
                <p>No se encontraron resultados para "${query}"</p>
            </div>
        `;
        this.showResults();
    }

    /**
     * Mostrar error
     */
    displayError(message) {
        this.resultsContainer.innerHTML = `
            <div class="search-error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>${message}</p>
            </div>
        `;
        this.showResults();
    }

    /**
     * Ver cliente
     */
    viewClient(clientId) {
        this.hideResults();
        // TODO: Implementar navegación a detalle de cliente
        console.log('Ver cliente:', clientId);
    }

    /**
     * Ver póliza
     */
    viewPolicy(policyId) {
        this.hideResults();
        // TODO: Implementar navegación a detalle de póliza
        console.log('Ver póliza:', policyId);
    }

    /**
     * Mostrar resultados
     */
    showResults() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'block';
        }
    }

    /**
     * Ocultar resultados
     */
    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
        }
    }
}

// Instancia global
window.globalSearch = new GlobalSearchComponent();

// Export for manual initialization after login
export function initGlobalSearch() {
    if (localStorage.getItem('jwt_token')) {
        setTimeout(() => {
            window.globalSearch.init();
        }, 100);
    }
}

// Auto-initialize if already logged in on page load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('jwt_token')) {
            initGlobalSearch();
        }
    });
}
