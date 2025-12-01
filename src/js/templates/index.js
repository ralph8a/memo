// Template Manager
import { getUser } from '../core/state.js';
import homeTemplate from './home.js';
import servicesTemplate from './services.js';
import aboutTemplate from './about.js';
import contactTemplate from './contact.js';
import loginTemplate from './login.js';
import agentLoginTemplate from './agentLogin.js';
import { getDashboardTemplate } from './dashboard.js';
import { getAgentDashboardTemplate } from './agentDashboard.js';

export function getTemplate(page) {
  const templates = {
    home: homeTemplate,
    services: servicesTemplate,
    about: aboutTemplate,
    contact: contactTemplate,
    login: loginTemplate,
    'agent-login': agentLoginTemplate,
    dashboard: () => getDashboardTemplate(getUser()),
    'agent-dashboard': () => getAgentDashboardTemplate(getUser())
  };
  
  const template = templates[page];
  return typeof template === 'function' ? template() : template;
}
