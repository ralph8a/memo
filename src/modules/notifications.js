// Notifications System - OVERLAY DISABLED
// Using dedicated notification panel instead
import { TIMING, NOTIFICATION_TYPES } from '../utils/constants.js';

/**
 * Notification function - logs to console only
 * Overlay notifications disabled - use dedicated notification panel
 */
export function showNotification(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
  // Log to console for debugging
  const emoji = {
    [NOTIFICATION_TYPES.SUCCESS]: '✅',
    [NOTIFICATION_TYPES.ERROR]: '❌',
    [NOTIFICATION_TYPES.WARNING]: '⚠️',
    [NOTIFICATION_TYPES.INFO]: 'ℹ️'
  };

  console.log(`${emoji[type] || 'ℹ️'} ${type.toUpperCase()}: ${message}`);

  // TODO: Send to notification panel/bell icon instead of overlay
  // For now, only critical errors show browser alert
  if (type === NOTIFICATION_TYPES.ERROR && message.includes('Error al cargar')) {
    // Silent fail - don't interrupt user
    return null;
  }

  return null;
}

export function clearNotifications() {
  // No-op since overlay notifications are disabled
  console.log('clearNotifications called (no-op)');
}
