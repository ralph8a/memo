import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

const TYPE_DETAILS = {
    auto: {
        title: 'Seguro de Auto',
        copy: 'Cobertura amplia + RC, asistencia vial y cristales. Ajustamos deducible y sumas según tu vehículo y uso.',
        sla: '10-15 min',
        pills: ['Cotización comparada', 'Entrega en 10-20 min', 'Asistencia 24/7'],
        docs: ['Modelo/año y uso (personal o ride-hailing).', 'Código postal y valor comercial aproximado.', 'Preferencia de deducible y coberturas opcionales.']
    },
    hogar: {
        title: 'Seguro de Hogar',
        copy: 'Protección de estructura, contenido y RC familiar. Añade robo, terremoto y asistencias para tu tranquilidad.',
        sla: '15-25 min',
        pills: ['RC familiar incluida', 'Robo y cristales opcionales', 'Desastres naturales disponibles'],
        docs: ['Código postal y tipo de inmueble.', 'Valor aproximado de estructura y contenido.', 'Medidas de seguridad (rejas, alarmas).']
    },
    vida: {
        title: 'Seguro de Vida',
        copy: 'Planes a medida con sumas aseguradas flexibles, invalidez y enfermedades graves opcionales.',
        sla: '20-30 min',
        pills: ['Planes temporales y vitalicios', 'Coberturas de invalidez', 'Enfermedades graves opcionales'],
        docs: ['Año de nacimiento y ocupación.', 'Dependientes y suma asegurada deseada.', 'Preferencia de ahorro o solo protección.']
    },
    salud: {
        title: 'Gastos Médicos',
        copy: 'Cobertura nacional o internacional con red médica. Ajustamos deducible, coaseguro y tope.',
        sla: '15-25 min',
        pills: ['Red médica verificada', 'Opciones de deducible', 'Tope de coaseguro claro'],
        docs: ['Edad y ciudad de residencia.', 'Cobertura deseada (nacional/internacional).', 'Condiciones preexistentes conocidas.']
    },
    viaje: {
        title: 'Seguro de Viaje',
        copy: 'Asistencia 24/7, gastos médicos, cancelación y equipaje. Coberturas ampliadas para deportes.',
        sla: '10-15 min',
        pills: ['Asistencia global', 'Cancelación opcional', 'Cobertura de equipaje'],
        docs: ['Destino y fechas de viaje.', 'Número de viajeros y edades.', 'Actividades especiales (deportes, trabajo).']
    },
    comercial: {
        title: 'Seguro Comercial',
        copy: 'RC general, daños a propiedad, robo, equipo electrónico y cyber opcional para tu negocio.',
        sla: '20-30 min',
        pills: ['RC + propiedad', 'Interrupción de negocio opcional', 'Cyber y equipo electrónico'],
        docs: ['Giro y ubicación del negocio.', 'Valores asegurados (inmueble, contenido, inventario).', 'Medidas de seguridad y procesos críticos.']
    }
};

let cleanupFn = null;
let pendingType = null;

export function setPendingQuoteType(type) {
    pendingType = type;
}

export function initQuoteFlow(root = document) {
    if (cleanupFn) {
        try { cleanupFn(); } catch { /* no-op */ }
        cleanupFn = null;
    }

    const page = root.querySelector?.('.quote-page');
    if (!page) return;

    const tabs = Array.from(page.querySelectorAll('[data-quote-tab]'));
    const forms = Array.from(page.querySelectorAll('.quote-form'));
    const summaryTitle = page.querySelector('[data-summary-title]');
    const summaryBody = page.querySelector('[data-summary-body]');
    const summarySla = page.querySelector('[data-summary-sla]');
    const summaryType = page.querySelector('[data-summary-type]');
    const summaryPills = page.querySelector('[data-summary-pills]');
    const summaryDocs = page.querySelector('[data-summary-docs]');

    const listeners = [];

    const setActive = (type) => {
        const normalized = TYPE_DETAILS[type] ? type : 'auto';
        const meta = TYPE_DETAILS[normalized];

        forms.forEach(form => {
            form.classList.toggle('active', form.dataset.quoteType === normalized);
            const hiddenType = form.querySelector('input[name="quoteType"]');
            if (hiddenType) hiddenType.value = normalized;
        });

        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.quoteTab === normalized);
        });

        if (summaryTitle) summaryTitle.textContent = meta.title;
        if (summaryBody) summaryBody.textContent = meta.copy;
        if (summarySla) summarySla.textContent = meta.sla;
        if (summaryType) summaryType.textContent = meta.title;
        if (summaryPills && Array.isArray(meta.pills)) {
            summaryPills.innerHTML = meta.pills.map(p => `<span class="quote-pill">${p}</span>`).join('');
        }
        if (summaryDocs && Array.isArray(meta.docs)) {
            summaryDocs.innerHTML = meta.docs.map(item => `<li>${item}</li>`).join('');
        }
    };

    tabs.forEach(tab => {
        const type = tab.dataset.quoteTab;
        const handler = (e) => {
            e.preventDefault();
            setActive(type);
        };
        tab.addEventListener('click', handler);
        listeners.push([tab, 'click', handler]);
    });

    const initial = (pendingType && TYPE_DETAILS[pendingType]) ? pendingType : (tabs[0]?.dataset.quoteTab || 'auto');
    setActive(initial);
    pendingType = null;

    cleanupFn = () => {
        listeners.forEach(([el, evt, fn]) => el.removeEventListener(evt, fn));
    };
}

export function notifyQuoteSuccess(typeLabel = 'Seguro') {
    showNotification(`${typeLabel} enviado. Te contactaremos en minutos.`, NOTIFICATION_TYPES.SUCCESS);
}
