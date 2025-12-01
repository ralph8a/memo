// Notifications System
import { TIMING, NOTIFICATION_TYPES } from '../utils/constants.js';
import { createElement, addClass, removeClass } from '../utils/dom.js';
import { createTimer } from '../utils/timing.js';

export function showNotification(message, type = NOTIFICATION_TYPES.INFO) {
  const notification = createElement('div', `notification notification-${type}`);
  notification.textContent = message;
  document.body.appendChild(notification);
  
  createTimer(() => {
    addClass(notification, 'show');
  }, 10);
  
  createTimer(() => {
    removeClass(notification, 'show');
    createTimer(() => notification.remove(), 300);
  }, TIMING.NOTIFICATION_DURATION);
}
