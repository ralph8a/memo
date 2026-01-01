// Timing and Animation Control Utilities

const activeTimers = new Set();
const activeIntervals = new Set();

export function createTimer(callback, delay) {
  const timerId = setTimeout(() => {
    activeTimers.delete(timerId);
    callback();
  }, delay);
  
  activeTimers.add(timerId);
  return timerId;
}

export function createInterval(callback, delay) {
  const intervalId = setInterval(callback, delay);
  activeIntervals.add(intervalId);
  return intervalId;
}

export function clearTimer(timerId) {
  clearTimeout(timerId);
  activeTimers.delete(timerId);
}

export function clearCustomInterval(intervalId) {
  clearInterval(intervalId);
  activeIntervals.delete(intervalId);
}

export function clearAllTimers() {
  activeTimers.forEach(timerId => clearTimeout(timerId));
  activeTimers.clear();
}

export function clearAllIntervals() {
  activeIntervals.forEach(intervalId => clearInterval(intervalId));
  activeIntervals.clear();
}

export function clearAllTiming() {
  clearAllTimers();
  clearAllIntervals();
}

export function delay(ms) {
  return new Promise(resolve => {
    const timerId = createTimer(resolve, ms);
    return timerId;
  });
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
