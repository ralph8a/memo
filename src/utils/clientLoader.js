/**
 * API Client Loader
 * Carga clientes desde la base de datos para poblar selectores
 */

export async function loadClientsForSelect() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No hay token de autenticación');
            return [];
        }

        const response = await fetch(`${window.API_BASE_URL || ''}/backend/api-endpoints.php/clients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar clientes');
        }

        const data = await response.json();
        return data.success ? (data.clients || []) : [];

    } catch (error) {
        console.error('Error loading clients:', error);
        return [];
    }
}

/**
 * Poblar un select con opciones de clientes
 */
export async function populateClientSelect(selectElement, options = {}) {
    const {
        placeholder = 'Seleccionar cliente...',
        includeEmpty = true,
        selectedId = null
    } = options;

    if (!selectElement) {
        console.error('Select element not found');
        return;
    }

    // Limpiar opciones existentes
    selectElement.innerHTML = '';

    // Agregar opción vacía
    if (includeEmpty) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = placeholder;
        selectElement.appendChild(emptyOption);
    }

    // Cargar clientes
    const clients = await loadClientsForSelect();

    // Agregar opciones
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        option.dataset.email = client.email || '';
        option.dataset.phone = client.phone || '';

        if (selectedId && client.id === selectedId) {
            option.selected = true;
        }

        selectElement.appendChild(option);
    });

    return clients;
}

/**
 * Cargar pólizas de un cliente
 */
export async function loadClientPolicies(clientId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No hay token de autenticación');
            return [];
        }

        const response = await fetch(`${window.API_BASE_URL || ''}/backend/api-endpoints.php/policies?client_id=${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar pólizas');
        }

        const data = await response.json();
        return data.success ? (data.policies || []) : [];

    } catch (error) {
        console.error('Error loading policies:', error);
        return [];
    }
}
