// Notifications System
import { TIMING, NOTIFICATION_TYPES } from '../utils/constants.js';
import { createElement, addClass, removeClass } from '../utils/dom.js';

// Notification manager: append notifications into a wrapper so multiple
// messages stack cleanly and are reliably removed.
const WRAPPER_ID = 'notification-wrapper';

function ensureWrapper() {
  let wrapper = document.getElementById(WRAPPER_ID);
  if (!wrapper) {
    wrapper = createElement('div', 'notification-wrapper', { id: WRAPPER_ID });
    document.body.appendChild(wrapper);
  }
  return wrapper;
}

function hideAndRemove(notification) {
  if (!notification) return;
  // prevent double-removal
  if (notification.__removing) return;
  notification.__removing = true;
  removeClass(notification, 'show');
  // wait for CSS transition then remove
  const onTransitionEnd = (e) => {
    if (e && e.target !== notification) return;
    notification.removeEventListener('transitionend', onTransitionEnd);
    if (notification.parentElement) notification.parentElement.removeChild(notification);
  };
  notification.addEventListener('transitionend', onTransitionEnd);
  // Fallback removal in case transitionend doesn't fire
  setTimeout(() => {
    if (notification.parentElement) notification.parentElement.removeChild(notification);
  }, 400);
}

export function showNotification(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
  const { duration = TIMING.NOTIFICATION_DURATION, dismissible = true } = options;
  const wrapper = ensureWrapper();

  const notification = createElement('div', `notification notification-${type}`);

  // content
  const content = createElement('div', 'notification-body');
  content.textContent = message;
  notification.appendChild(content);

  // optional dismiss button
  if (dismissible) {
    const btn = createElement('button', 'notification-close');
    btn.setAttribute('aria-label', 'Cerrar notificación');
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => hideAndRemove(notification));
    notification.appendChild(btn);
  }

  wrapper.appendChild(notification);

  // trigger enter animation
  requestAnimationFrame(() => addClass(notification, 'show'));

  // auto-dismiss
  if (duration > 0) {
    const tid = setTimeout(() => hideAndRemove(notification), duration);
    // attach so it can be cleared if needed
    notification.__timeout = tid;
  }

  return notification;
}

export function clearNotifications() {
  const wrapper = document.getElementById(WRAPPER_ID);
  if (!wrapper) return;
  Array.from(wrapper.children).forEach(n => hideAndRemove(n));
}
