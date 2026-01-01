// DOM Utility Functions

// Cache for frequently accessed elements
const domCache = new Map();

export function getElement(selector, useCache = true) {
  if (useCache && domCache.has(selector)) {
    return domCache.get(selector);
  }

  const element = document.querySelector(selector);
  if (useCache && element) {
    domCache.set(selector, element);
  }

  return element;
}

export function getElements(selector) {
  return document.querySelectorAll(selector);
}

export function getElementById(id) {
  return document.getElementById(id);
}

export function clearCache() {
  domCache.clear();
}

export function addClass(element, className) {
  if (element) element.classList.add(className);
}

export function removeClass(element, className) {
  if (element) element.classList.remove(className);
}

export function toggleClass(element, className) {
  if (element) element.classList.toggle(className);
}

export function replaceClass(element, oldClass, newClass) {
  if (element) {
    element.classList.remove(oldClass);
    element.classList.add(newClass);
  }
}

export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

export function setStyle(element, property, value) {
  if (element) element.style[property] = value;
}

export function show(element) {
  if (element) {
    element.classList.remove('d-none');
    element.style.display = 'block';
  }
}

export function hide(element) {
  if (element) {
    element.classList.add('d-none');
    element.style.display = 'none';
  }
}

export function showFlex(element) {
  if (element) {
    element.classList.add('d-flex');
    element.classList.remove('d-none');
  }
}

export function showInlineBlock(element) {
  if (element) {
    element.classList.add('d-inline-block');
    element.classList.remove('d-none');
  }
}

export function showBlock(element) {
  if (element) {
    element.classList.add('d-block');
    element.classList.remove('d-none');
  }
}

export function setHTML(element, html) {
  if (element) element.innerHTML = html;
}

export function createElement(tag, className = '', attributes = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}
