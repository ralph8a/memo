/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/core/state.js":
/*!***************************!*\
  !*** ./src/core/state.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearState: () => (/* binding */ clearState),
/* harmony export */   getPage: () => (/* binding */ getPage),
/* harmony export */   getUser: () => (/* binding */ getUser),
/* harmony export */   setPage: () => (/* binding */ setPage),
/* harmony export */   setUser: () => (/* binding */ setUser),
/* harmony export */   state: () => (/* binding */ state)
/* harmony export */ });
// Application State Management
var state = {
  currentUser: null,
  currentPage: 'home'
};
function setUser(user) {
  state.currentUser = user;
  if (user) {
    localStorage.setItem('krauser_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('krauser_user');
  }
}
function getUser() {
  if (!state.currentUser) {
    var stored = localStorage.getItem('krauser_user');
    if (stored) {
      state.currentUser = JSON.parse(stored);
    }
  }
  return state.currentUser;
}
function setPage(page) {
  state.currentPage = page;
}
function getPage() {
  return state.currentPage;
}
function clearState() {
  state.currentUser = null;
  state.currentPage = 'home';
  localStorage.removeItem('krauser_user');
}

/***/ }),

/***/ "./src/modules/aboutEnhancements.js":
/*!******************************************!*\
  !*** ./src/modules/aboutEnhancements.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initAboutEnhancements: () => (/* binding */ initAboutEnhancements)
/* harmony export */ });
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// About page enhancements
// - Animated counters (Option B stats strip)
// - Testimonials slider (auto-advance + dot navigation)

function prefersReducedMotion() {
  try {
    var _window$matchMedia, _window;
    return !!((_window$matchMedia = (_window = window).matchMedia) !== null && _window$matchMedia !== void 0 && (_window$matchMedia = _window$matchMedia.call(_window, '(prefers-reduced-motion: reduce)')) !== null && _window$matchMedia !== void 0 && _window$matchMedia.matches);
  } catch (_unused) {
    return false;
  }
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function formatCompactInt(n) {
  // Keep it simple and language-agnostic; user can localize later if needed.
  return String(Math.round(n));
}
function animateNumber(el, target) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
    _ref$durationMs = _ref.durationMs,
    durationMs = _ref$durationMs === void 0 ? 900 : _ref$durationMs,
    _ref$suffix = _ref.suffix,
    suffix = _ref$suffix === void 0 ? '' : _ref$suffix;
  if (!el) return;
  var start = 0;
  var startTs = performance.now();
  var _tick = function tick(now) {
    var t = clamp((now - startTs) / durationMs, 0, 1);
    var eased = easeOutCubic(t);
    var value = start + (target - start) * eased;
    el.textContent = "".concat(formatCompactInt(value)).concat(suffix);
    if (t < 1) {
      window.requestAnimationFrame(_tick);
    } else {
      el.textContent = "".concat(formatCompactInt(target)).concat(suffix);
    }
  };
  window.requestAnimationFrame(_tick);
}
function initAboutEnhancements() {
  var _root$querySelector;
  var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var container = ((_root$querySelector = root.querySelector) === null || _root$querySelector === void 0 ? void 0 : _root$querySelector.call(root, '.about-fullpage')) || root;
  if (!container) return;

  // Cleanup any previous instance
  if (typeof window.__aboutEnhancementsCleanup === 'function') {
    try {
      window.__aboutEnhancementsCleanup();
    } catch (_unused2) {
      // no-op
    }
  }
  var cleanups = [];

  // ===== Counters =====
  var countEls = Array.from(container.querySelectorAll('.about-stat-number[data-target]'));
  var reduced = prefersReducedMotion();
  for (var _i = 0, _countEls = countEls; _i < _countEls.length; _i++) {
    var el = _countEls[_i];
    // Reset for a consistent first render
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = "0".concat(suffix);
  }
  var countersObserver = null;
  var counted = new WeakSet();
  if (!reduced && 'IntersectionObserver' in window && countEls.length) {
    countersObserver = new IntersectionObserver(function (entries) {
      var _iterator = _createForOfIteratorHelper(entries),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          if (!entry.isIntersecting) continue;
          var _el = entry.target;
          if (counted.has(_el)) continue;
          var rawTarget = Number(_el.getAttribute('data-target'));
          if (!Number.isFinite(rawTarget)) continue;
          counted.add(_el);
          var _suffix = _el.getAttribute('data-suffix') || '';
          animateNumber(_el, rawTarget, {
            durationMs: 950,
            suffix: _suffix
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }, {
      threshold: 0.35
    });
    var _iterator2 = _createForOfIteratorHelper(countEls),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _el2 = _step2.value;
        countersObserver.observe(_el2);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  } else {
    // No observer / reduced motion: just set final values.
    var _iterator3 = _createForOfIteratorHelper(countEls),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var _el3 = _step3.value;
        var rawTarget = Number(_el3.getAttribute('data-target'));
        if (!Number.isFinite(rawTarget)) continue;
        var _suffix2 = _el3.getAttribute('data-suffix') || '';
        _el3.textContent = "".concat(formatCompactInt(rawTarget)).concat(_suffix2);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  // ===== Core cards rail (Historia/Misión/Equipo) keyboard navigation =====
  var coreRail = container.querySelector('.about-content-grid');
  var coreActiveIndex = 0;
  function isEditableTarget(t) {
    if (!t) return false;
    var el = t.nodeType === 1 ? t : null;
    if (!el) return false;
    if (el.isContentEditable) return true;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }
  function getCorePanels() {
    return Array.from((coreRail === null || coreRail === void 0 ? void 0 : coreRail.children) || []).filter(function (n) {
      return (n === null || n === void 0 ? void 0 : n.nodeType) === 1;
    });
  }
  function getLeftWithinScroller(scroller, node) {
    if (!scroller || !node) return 0;
    var scrollerRect = scroller.getBoundingClientRect();
    var nodeRect = node.getBoundingClientRect();
    return nodeRect.left - scrollerRect.left + scroller.scrollLeft;
  }
  function computeCoreActiveFromScroll() {
    var panels = getCorePanels();
    if (!coreRail || !panels.length) return;
    var x = coreRail.scrollLeft;
    var bestIndex = 0;
    var bestDist = Infinity;
    for (var i = 0; i < panels.length; i++) {
      var left = getLeftWithinScroller(coreRail, panels[i]);
      var d = Math.abs(left - x);
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }
    coreActiveIndex = bestIndex;
  }
  function scrollCoreTo(index) {
    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$behavior = _ref2.behavior,
      behavior = _ref2$behavior === void 0 ? 'smooth' : _ref2$behavior;
    var panels = getCorePanels();
    if (!coreRail || !panels.length) return;
    var safeIndex = clamp(index, 0, panels.length - 1);
    var left = getLeftWithinScroller(coreRail, panels[safeIndex]);
    coreRail.scrollTo({
      left: Math.max(0, left - 2),
      behavior: behavior
    });
    coreActiveIndex = safeIndex;
  }
  if (coreRail) {
    var onCoreScroll = function onCoreScroll() {
      return computeCoreActiveFromScroll();
    };
    coreRail.addEventListener('scroll', onCoreScroll, {
      passive: true
    });
    cleanups.push(function () {
      return coreRail.removeEventListener('scroll', onCoreScroll);
    });
    var onCoreKeyDown = function onCoreKeyDown(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (isEditableTarget(e.target)) return;

      // If focus is inside the dynamic rail or the testimonials slider, do not steal their arrows.
      var target = e.target;
      if (target && typeof target.closest === 'function') {
        if (target.closest('.about-dynamic')) return;
      }
      var panels = getCorePanels();
      if (!panels.length) return;
      e.preventDefault();
      var delta = e.key === 'ArrowRight' ? 1 : -1;
      var next = clamp(coreActiveIndex + delta, 0, panels.length - 1);
      scrollCoreTo(next, {
        behavior: reduced ? 'auto' : 'smooth'
      });
    };

    // Capture so it works even if focus is on a child element.
    coreRail.addEventListener('keydown', onCoreKeyDown, true);
    cleanups.push(function () {
      return coreRail.removeEventListener('keydown', onCoreKeyDown, true);
    });

    // Initial sync
    computeCoreActiveFromScroll();
  }

  // ===== Testimonials slider =====
  var slider = container.querySelector('.about-testimonials-slider');
  var track = container.querySelector('.about-testimonials-track');
  var dotEls = Array.from(container.querySelectorAll('.about-dot'));

  // ===== Rail (stats/partners/testimonials) keyboard navigation =====
  var rail = container.querySelector('.about-dynamic');
  var railActiveIndex = 0;
  function getRailPanels() {
    if (!rail) return [];
    // Direct children are panels by design: stats strip, partners, testimonials
    return Array.from(rail.children || []).filter(function (n) {
      return (n === null || n === void 0 ? void 0 : n.nodeType) === 1;
    });
  }
  function getRailPanelLeft(panel) {
    if (!rail || !panel) return 0;
    // More robust than offsetLeft when layout/positioning changes.
    var railRect = rail.getBoundingClientRect();
    var panelRect = panel.getBoundingClientRect();
    return panelRect.left - railRect.left + rail.scrollLeft;
  }
  function computeRailActiveFromScroll() {
    var panels = getRailPanels();
    if (!rail || !panels.length) return;
    var x = rail.scrollLeft;
    var bestIndex = 0;
    var bestDist = Infinity;
    for (var i = 0; i < panels.length; i++) {
      var left = getRailPanelLeft(panels[i]);
      var d = Math.abs(left - x);
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }
    railActiveIndex = bestIndex;
  }
  function scrollRailTo(index) {
    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$behavior = _ref3.behavior,
      behavior = _ref3$behavior === void 0 ? 'smooth' : _ref3$behavior;
    var panels = getRailPanels();
    if (!rail || !panels.length) return;
    var safeIndex = clamp(index, 0, panels.length - 1);
    var left = getRailPanelLeft(panels[safeIndex]);
    rail.scrollTo({
      left: Math.max(0, left - 2),
      behavior: behavior
    });
    railActiveIndex = safeIndex;
  }
  var autoTimer = null;
  var activeIndex = 0;
  function getSlides() {
    return Array.from((track === null || track === void 0 ? void 0 : track.children) || []).filter(function (n) {
      return (n === null || n === void 0 ? void 0 : n.nodeType) === 1;
    });
  }
  function setActiveSlideClass(index) {
    var slides = getSlides();
    for (var i = 0; i < slides.length; i++) {
      if (i === index) slides[i].classList.add('is-active');else slides[i].classList.remove('is-active');
    }
  }
  function setActiveDot(index) {
    activeIndex = index;
    var _iterator4 = _createForOfIteratorHelper(dotEls),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var dot = _step4.value;
        var i = Number(dot.getAttribute('data-index'));
        if (i === index) dot.classList.add('is-active');else dot.classList.remove('is-active');
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
    setActiveSlideClass(index);
  }
  function scrollToSlide(index) {
    var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref4$behavior = _ref4.behavior,
      behavior = _ref4$behavior === void 0 ? 'smooth' : _ref4$behavior;
    var slides = getSlides();
    if (!slider || !slides.length) return;
    var safeIndex = clamp(index, 0, slides.length - 1);
    var slide = slides[safeIndex];

    // Use offsetLeft relative to the scrolling container.
    slider.scrollTo({
      left: slide.offsetLeft - 2,
      behavior: behavior
    });
    setActiveDot(safeIndex);
  }
  function computeActiveFromScroll() {
    var slides = getSlides();
    if (!slider || !slides.length) return;
    var x = slider.scrollLeft;
    var bestIndex = 0;
    var bestDist = Infinity;
    for (var i = 0; i < slides.length; i++) {
      var d = Math.abs(slides[i].offsetLeft - x);
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }
    setActiveDot(bestIndex);
  }
  function startAutoAdvance() {
    if (reduced) return;
    if (!slider || !track) return;
    stopAutoAdvance();
    autoTimer = window.setInterval(function () {
      var slides = getSlides();
      if (!slides.length) return;
      var next = (activeIndex + 1) % slides.length;
      scrollToSlide(next, {
        behavior: 'smooth'
      });
    }, 6500);
  }
  function stopAutoAdvance() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }
  if (slider && track && dotEls.length) {
    // Dot navigation
    var _iterator5 = _createForOfIteratorHelper(dotEls),
      _step5;
    try {
      var _loop = function _loop() {
        var dot = _step5.value;
        var handler = function handler() {
          var idx = Number(dot.getAttribute('data-index'));
          if (!Number.isFinite(idx)) return;
          scrollToSlide(idx, {
            behavior: 'smooth'
          });
        };
        dot.addEventListener('click', handler);
        cleanups.push(function () {
          return dot.removeEventListener('click', handler);
        });
      };
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        _loop();
      }

      // Keep dots in sync while user scrolls manually
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    var onScroll = function onScroll() {
      return computeActiveFromScroll();
    };
    slider.addEventListener('scroll', onScroll, {
      passive: true
    });
    cleanups.push(function () {
      return slider.removeEventListener('scroll', onScroll);
    });

    // Keyboard navigation (tech/power-user friendly)
    var onKeyDown = function onKeyDown(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var slides = getSlides();
      if (!slides.length) return;
      e.preventDefault();
      var delta = e.key === 'ArrowRight' ? 1 : -1;
      var next = clamp(activeIndex + delta, 0, slides.length - 1);
      scrollToSlide(next, {
        behavior: 'smooth'
      });
    };
    slider.addEventListener('keydown', onKeyDown);
    cleanups.push(function () {
      return slider.removeEventListener('keydown', onKeyDown);
    });

    // Pause on interaction
    var onEnter = function onEnter() {
      return stopAutoAdvance();
    };
    var onLeave = function onLeave() {
      return startAutoAdvance();
    };
    slider.addEventListener('pointerenter', onEnter);
    slider.addEventListener('pointerleave', onLeave);
    slider.addEventListener('focusin', onEnter);
    slider.addEventListener('focusout', onLeave);
    cleanups.push(function () {
      return slider.removeEventListener('pointerenter', onEnter);
    });
    cleanups.push(function () {
      return slider.removeEventListener('pointerleave', onLeave);
    });
    cleanups.push(function () {
      return slider.removeEventListener('focusin', onEnter);
    });
    cleanups.push(function () {
      return slider.removeEventListener('focusout', onLeave);
    });

    // Initial
    setActiveDot(0);
    startAutoAdvance();

    // In case layout changes, keep the active slide aligned.
    var resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(function () {
        // Snap back to the active slide (no animation on resize)
        scrollToSlide(activeIndex, {
          behavior: 'auto'
        });
      });
      resizeObserver.observe(slider);
      cleanups.push(function () {
        try {
          resizeObserver.disconnect();
        } catch (_unused3) {
          // no-op
        }
      });
    }
  }

  // Rail arrow navigation (power-user friendly).
  // Note: the testimonials slider already uses ArrowLeft/ArrowRight; avoid double-handling.
  if (rail) {
    // Keep railActiveIndex in sync when the user scrolls the rail manually.
    var onRailScroll = function onRailScroll() {
      return computeRailActiveFromScroll();
    };
    rail.addEventListener('scroll', onRailScroll, {
      passive: true
    });
    cleanups.push(function () {
      return rail.removeEventListener('scroll', onRailScroll);
    });
    var onRailKeyDown = function onRailKeyDown(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      // If user is interacting with the inner testimonials slider, let it handle arrows.
      var target = e.target;
      if (target && typeof target.closest === 'function') {
        if (target.closest('.about-testimonials-slider')) return;
      }
      var panels = getRailPanels();
      if (!panels.length) return;
      e.preventDefault();
      var delta = e.key === 'ArrowRight' ? 1 : -1;
      var next = clamp(railActiveIndex + delta, 0, panels.length - 1);
      scrollRailTo(next, {
        behavior: reduced ? 'auto' : 'smooth'
      });
    };

    // Use capture so it works even if focus is on a child element inside the rail.
    rail.addEventListener('keydown', onRailKeyDown, true);
    cleanups.push(function () {
      return rail.removeEventListener('keydown', onRailKeyDown, true);
    });

    // Initial sync
    computeRailActiveFromScroll();
  }
  window.__aboutEnhancementsCleanup = function () {
    stopAutoAdvance();
    for (var _i2 = 0, _cleanups = cleanups; _i2 < _cleanups.length; _i2++) {
      var fn = _cleanups[_i2];
      try {
        fn();
      } catch (_unused4) {
        // no-op
      }
    }
    if (countersObserver) {
      try {
        countersObserver.disconnect();
      } catch (_unused5) {
        // no-op
      }
      countersObserver = null;
    }
    delete window.__aboutEnhancementsCleanup;
  };
}

/***/ }),

/***/ "./src/modules/auth.js":
/*!*****************************!*\
  !*** ./src/modules/auth.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkAuth: () => (/* binding */ checkAuth),
/* harmony export */   getRedirectPage: () => (/* binding */ getRedirectPage),
/* harmony export */   login: () => (/* binding */ login),
/* harmony export */   logout: () => (/* binding */ logout)
/* harmony export */ });
/* harmony import */ var _core_state_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/state.js */ "./src/core/state.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _notifications_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./notifications.js */ "./src/modules/notifications.js");
// Authentication Module



function checkAuth() {
  return (0,_core_state_js__WEBPACK_IMPORTED_MODULE_0__.getUser)() !== null;
}
function login(credentials) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'client';
  var user = type === 'client' ? validateClientLogin(credentials) : validateAgentLogin(credentials);
  if (user) {
    (0,_core_state_js__WEBPACK_IMPORTED_MODULE_0__.setUser)(user);
    (0,_notifications_js__WEBPACK_IMPORTED_MODULE_2__.showNotification)('Inicio de sesión exitoso', _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.NOTIFICATION_TYPES.SUCCESS);
    return user;
  }
  (0,_notifications_js__WEBPACK_IMPORTED_MODULE_2__.showNotification)('Credenciales incorrectas', _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.NOTIFICATION_TYPES.ERROR);
  return null;
}
function logout() {
  (0,_core_state_js__WEBPACK_IMPORTED_MODULE_0__.clearState)();
  (0,_notifications_js__WEBPACK_IMPORTED_MODULE_2__.showNotification)('Sesión cerrada exitosamente', _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.NOTIFICATION_TYPES.SUCCESS);
}
function validateClientLogin(_ref) {
  var email = _ref.email,
    password = _ref.password;
  if (email === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.DEMO_CREDENTIALS.CLIENT.email && password === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.DEMO_CREDENTIALS.CLIENT.password) {
    return {
      name: 'Juan Cliente',
      type: 'client',
      email: email
    };
  }
  return null;
}
function validateAgentLogin(_ref2) {
  var agentId = _ref2.agentId,
    password = _ref2.password;
  if (agentId === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.DEMO_CREDENTIALS.AGENT.id && password === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.DEMO_CREDENTIALS.AGENT.password) {
    return {
      name: 'Guillermo Krause',
      type: 'agent',
      id: agentId
    };
  }
  return null;
}
function getRedirectPage(user) {
  if (!user) return _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.HOME;
  if (user.type === 'client') return _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.CLIENT_DASHBOARD;
  if (user.type === 'agent') return _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.AGENT_DASHBOARD;
  return _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.HOME;
}

/***/ }),

/***/ "./src/modules/homeAnimations.js":
/*!***************************************!*\
  !*** ./src/modules/homeAnimations.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cleanupHomeAnimations: () => (/* binding */ cleanupHomeAnimations),
/* harmony export */   initStatsAnimation: () => (/* binding */ initStatsAnimation),
/* harmony export */   showHomeSection: () => (/* binding */ showHomeSection),
/* harmony export */   skipToFinalState: () => (/* binding */ skipToFinalState),
/* harmony export */   startHomeSequence: () => (/* binding */ startHomeSequence)
/* harmony export */ });
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");
/* harmony import */ var _utils_timing_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/timing.js */ "./src/utils/timing.js");
// Home Page Animations




// Toggle to enable verbose animation diagnostics in the console
var DEBUG = false;
var debugLog = function debugLog() {
  var _console;
  if (DEBUG) (_console = console).log.apply(_console, arguments);
};

// DOM Cache
var domCache = {
  hero: null,
  parade: null,
  cta: null,
  subNav: null,
  skipBtn: null
};
function initDOMCache() {
  if (domCache.hero) return; // Already initialized

  domCache.hero = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.HERO_SECTION, false);
  domCache.parade = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.PARADE_SECTION, false);
  domCache.cta = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.CTA_SECTION, false);
  domCache.subNav = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SUB_NAV, false);
  domCache.skipBtn = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SKIP_BUTTON, false);
  // Progress bar element (under sub-navigation)
  domCache.progress = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)('#animation-progress .progress-fill', false);
  debugLog('🎬 DOM Cache initialized:', {
    hero: !!domCache.hero,
    parade: !!domCache.parade,
    cta: !!domCache.cta,
    subNav: !!domCache.subNav,
    skipBtn: !!domCache.skipBtn,
    progress: !!domCache.progress
  });
}
function showButtonWithDroplet(selector) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
    var _domCache$subNav;
    var btn = (_domCache$subNav = domCache.subNav) === null || _domCache$subNav === void 0 ? void 0 : _domCache$subNav.querySelector(selector);
    if (!btn) return;
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(btn, 'display', 'inline-block');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(btn, 'btn-droplet');
    (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(btn, 'btn-droplet');
    }, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.DROPLET_DURATION);
  }, delay);
}
function setProgress(percent) {
  var durationMs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var easing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'linear';
  var defer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 50;
  var p = domCache.progress;
  if (!p) return;

  // Set transition if requested
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(p, 'transition', durationMs ? "width ".concat(durationMs, "ms ").concat(easing) : '');

  // Defer the width change slightly so the transition takes effect
  (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(p, 'width', percent);
  }, defer);
}
function setActiveSubNav(sectionKey) {
  var subNav = domCache.subNav;
  if (!subNav) return;
  var buttons = subNav.querySelectorAll(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SUB_NAV_BUTTONS);
  buttons.forEach(function (btn) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(btn, 'active');
    if (btn.dataset.section === sectionKey) (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(btn, 'active');
  });
}
function cleanupHomeAnimations() {
  (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.clearAllTimers)();

  // Reset DOM state
  if (domCache.subNav) {
    // Hide sub-nav container animation state (home.css hides it unless .show)
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(domCache.subNav, 'show');
    var buttons = domCache.subNav.querySelectorAll(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SUB_NAV_BUTTONS);
    buttons.forEach(function (btn) {
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(btn, 'display', 'none');
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(btn, 'btn-droplet');
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(btn, 'active');
    });
  }

  // Reset progress bar
  if (domCache.progress) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(domCache.progress, 'transition', '');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(domCache.progress, 'width', '0%');
  }

  // Clear DOM cache
  Object.keys(domCache).forEach(function (key) {
    domCache[key] = null;
  });
}
function startHomeSequence() {
  // Ensure previous animations are cleared before caching DOM nodes
  cleanupHomeAnimations();
  initDOMCache();
  var hero = domCache.hero,
    parade = domCache.parade,
    cta = domCache.cta,
    subNav = domCache.subNav,
    skipBtn = domCache.skipBtn;
  debugLog('🏠 startHomeSequence initiated - Parade element:', parade);
  if (!hero || !parade || !cta) {
    console.error('❌ Missing required sections:', {
      hero: hero,
      parade: parade,
      cta: cta
    });
    return;
  }

  // Always reset home sections to a known baseline.
  // Important: showHomeSection() uses inline display styles; those can block .active CSS.
  var allSections = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElements)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.HOME_SECTIONS);
  allSections.forEach(function (section) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(section, 'active');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(section, 'fade-out-up');
    // Clear any inline display overrides so CSS can drive visibility again
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(section, 'display', '');
  });

  // Ensure hero starts visible
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(hero, 'active');
  setActiveSubNav('hero');

  // Set initial gradient
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.PARADE);
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.CTA);
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.HERO);

  // Show sub-nav but hide all buttons
  if (subNav) {
    // home.css keeps sub-nav hidden unless the `.show` class is present
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(subNav, 'display', 'flex');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(subNav, 'show');
    // Defer so the browser can apply initial (hidden) state, then animate in
    (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
      return (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(subNav, 'show');
    }, 30);
    var allButtons = subNav.querySelectorAll(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SUB_NAV_BUTTONS);
    allButtons.forEach(function (btn) {
      return (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(btn, 'display', 'none');
    });

    // Show the first button early so the sub-nav isn't an empty bar.
    showButtonWithDroplet('[data-section="hero"]', 120);
  }

  // Initialize and animate progress bar (if present)
  if (domCache.progress) {
    // Reset
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(domCache.progress, 'width', '0%');
    // Animate to first milestone (hero -> 33%) over HERO_DURATION
    setProgress('33%', _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.HERO_DURATION);
  }

  // Step 1: Show hero for duration
  (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
    // Transition to parade
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.replaceClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.HERO, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.PARADE);
    // If a fade-out class exists, it can be applied here; otherwise we rely on section swap.

    // Immediately show parade (removed the CTA_FADE_IN delay)
    (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(hero, 'active');

      // Clear any inline display overrides that could prevent the parade from showing
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(parade, 'display', '');
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(parade, 'active');
      debugLog('🎪 Parade class added:', parade.className);
      debugLog('🎪 Parade element:', parade);
      debugLog('🎪 Parade classList:', parade.classList);
      setActiveSubNav('eleccion');
      showButtonWithDroplet('[data-section="eleccion"]', _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.BUTTON_DELAY);

      // Step 2: Show parade for duration
      // Update progress to 66% during parade
      if (domCache.progress) setProgress('66%', _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.PARADE_DURATION);
      (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
        // Transition to CTA
        (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.replaceClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.PARADE, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.CTA);
        // Remove parade visibility without using non-existent class
        (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(parade, 'active');

        // Clear any inline display overrides that could prevent the CTA from showing
        (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(cta, 'display', '');
        (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
          (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(cta, 'active');
          setActiveSubNav('cotiza');
          showButtonWithDroplet('[data-section="cotiza"]', _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.BUTTON_DELAY);
          if (skipBtn) (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(skipBtn, 'display', 'none');
          // Complete progress on CTA show
          if (domCache.progress) setProgress('100%', _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.CTA_FADE_IN, 'ease-out');
        }, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.CTA_FADE_IN);
      }, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.PARADE_DURATION);
    }, 0); // No delay - show immediately after hero transition
  }, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.HERO_DURATION);
}
function skipToFinalState() {
  // Clear any running animations first, then initialize DOM cache
  cleanupHomeAnimations();
  initDOMCache();
  var hero = domCache.hero,
    parade = domCache.parade,
    cta = domCache.cta,
    subNav = domCache.subNav,
    skipBtn = domCache.skipBtn;
  if (!hero || !parade || !cta) return;

  // Set final gradient
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.HERO);
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.PARADE);
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.CTA);

  // IMPORTANT: Hide ALL sections first, including any fade animations
  var allSections = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElements)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.HOME_SECTIONS);
  allSections.forEach(function (section) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(section, 'active');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(section, 'fade-out-up');
    // Clear any inline display overrides so .active can take effect
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(section, 'display', '');
  });

  // Now show ONLY the CTA section
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(cta, 'display', '');
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(cta, 'active');

  // Show all buttons with stagger
  if (subNav) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(subNav, 'display', 'flex');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(subNav, 'show');
    (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
      return (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(subNav, 'show');
    }, 30);
    var allButtons = subNav.querySelectorAll(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SUB_NAV_BUTTONS);
    allButtons.forEach(function (btn, index) {
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(btn, 'display', 'inline-block');
      (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
        (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(btn, 'btn-droplet');
        (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
          (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(btn, 'btn-droplet');
        }, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.DROPLET_DURATION);
      }, index * _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.BUTTON_STAGGER);
    });
  }

  // Remove skip button
  if (skipBtn) (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(skipBtn, 'display', 'none');

  // Ensure progress is complete
  if (domCache.progress) {
    // Fast completion without long transition
    setProgress('100%', 300, 'ease-out', 10);
  }
}
function showHomeSection(section) {
  // Manual navigation should cancel the automated intro sequence to avoid desync.
  (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.clearAllTimers)();
  initDOMCache();

  // Update gradient based on section
  var sectionMap = {
    hero: _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.HERO,
    eleccion: _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.PARADE,
    cotiza: _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.CTA
  };

  // Remove all gradient classes
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.HERO);
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.PARADE);
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(document.body, _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.GRADIENT_CLASSES.CTA);

  // Add new gradient class
  if (sectionMap[section]) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(document.body, sectionMap[section]);
  }

  // Update nav buttons
  var buttons = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElements)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.SUB_NAV_BUTTONS);
  buttons.forEach(function (btn) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(btn, 'active');
    if (btn.dataset.section === section) {
      (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(btn, 'active');
    }
  });

  // Hide all sections
  var allSections = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElements)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.HOME_SECTIONS);
  allSections.forEach(function (sec) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(sec, 'active');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(sec, 'fade-out-up');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(sec, 'display', 'none');
  });

  // Show selected section
  var targetSection = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)("#".concat(section, "-section"), false);
  if (targetSection) {
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.setStyle)(targetSection, 'display', 'flex');
    (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(targetSection, 'active');

    // Reinitialize stats if showing hero
    if (section === 'hero') {
      (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_2__.createTimer)(function () {
        initStatsAnimation();
      }, 100);
    }
    // Update progress bar to reflect manual selection
    if (domCache.progress) {
      var mapping = {
        hero: '33%',
        eleccion: '66%',
        cotiza: '100%'
      };
      var pct = mapping[section] || '0%';
      setProgress(pct, 400, 'ease-out', 10);
    }
  }
}
function initStatsAnimation() {
  var statNumbers = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElements)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.STAT_NUMBERS);
  statNumbers.forEach(function (stat) {
    var target = parseInt(stat.dataset.target);
    animateCounter(stat, target);
  });
}
function animateCounter(element, target) {
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.STATS_ANIMATION;
  var startTime = Date.now();
  function update() {
    var now = Date.now();
    var progress = Math.min((now - startTime) / duration, 1);
    var easeOut = 1 - Math.pow(1 - progress, 3);
    var currentValue = Math.floor(easeOut * target);
    element.textContent = currentValue;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  requestAnimationFrame(update);
}

/***/ }),

/***/ "./src/modules/notifications.js":
/*!**************************************!*\
  !*** ./src/modules/notifications.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearNotifications: () => (/* binding */ clearNotifications),
/* harmony export */   showNotification: () => (/* binding */ showNotification)
/* harmony export */ });
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");
// Notifications System



// Notification manager: append notifications into a wrapper so multiple
// messages stack cleanly and are reliably removed.
var WRAPPER_ID = 'notification-wrapper';
function ensureWrapper() {
  var wrapper = document.getElementById(WRAPPER_ID);
  if (!wrapper) {
    wrapper = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.createElement)('div', 'notification-wrapper', {
      id: WRAPPER_ID
    });
    document.body.appendChild(wrapper);
  }
  return wrapper;
}
function hideAndRemove(notification) {
  if (!notification) return;
  // prevent double-removal
  if (notification.__removing) return;
  notification.__removing = true;
  (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.removeClass)(notification, 'show');
  // wait for CSS transition then remove
  var _onTransitionEnd = function onTransitionEnd(e) {
    if (e && e.target !== notification) return;
    notification.removeEventListener('transitionend', _onTransitionEnd);
    if (notification.parentElement) notification.parentElement.removeChild(notification);
  };
  notification.addEventListener('transitionend', _onTransitionEnd);
  // Fallback removal in case transitionend doesn't fire
  setTimeout(function () {
    if (notification.parentElement) notification.parentElement.removeChild(notification);
  }, 400);
}
function showNotification(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.NOTIFICATION_TYPES.INFO;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$duration = options.duration,
    duration = _options$duration === void 0 ? _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.TIMING.NOTIFICATION_DURATION : _options$duration,
    _options$dismissible = options.dismissible,
    dismissible = _options$dismissible === void 0 ? true : _options$dismissible;
  var wrapper = ensureWrapper();
  var notification = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.createElement)('div', "notification notification-".concat(type));

  // content
  var content = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.createElement)('div', 'notification-body');
  content.textContent = message;
  notification.appendChild(content);

  // optional dismiss button
  if (dismissible) {
    var btn = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.createElement)('button', 'notification-close');
    btn.setAttribute('aria-label', 'Cerrar notificación');
    btn.innerHTML = '&times;';
    btn.addEventListener('click', function () {
      return hideAndRemove(notification);
    });
    notification.appendChild(btn);
  }
  wrapper.appendChild(notification);

  // trigger enter animation
  requestAnimationFrame(function () {
    return (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.addClass)(notification, 'show');
  });

  // auto-dismiss
  if (duration > 0) {
    var tid = setTimeout(function () {
      return hideAndRemove(notification);
    }, duration);
    // attach so it can be cleared if needed
    notification.__timeout = tid;
  }
  return notification;
}
function clearNotifications() {
  var wrapper = document.getElementById(WRAPPER_ID);
  if (!wrapper) return;
  Array.from(wrapper.children).forEach(function (n) {
    return hideAndRemove(n);
  });
}

/***/ }),

/***/ "./src/modules/particles.js":
/*!**********************************!*\
  !*** ./src/modules/particles.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   startParticles: () => (/* binding */ startParticles),
/* harmony export */   stopParticles: () => (/* binding */ stopParticles)
/* harmony export */ });
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// Particles Animation System (theme-aware)
// Default theme: Dust/Bokeh
// Dark Forest theme: Fireflies


var canvas = null;
var ctx = null;
var particles = [];
var animationFrameId = null;
var canvasWidth = 0;
var canvasHeight = 0;
var dpr = 1;
var themeObserver = null;
var activeThemeKey = null;
var activeProfile = null;
var activePalette = null;
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function parseCssColorToRgb(color) {
  if (!color) return {
    r: 255,
    g: 255,
    b: 255
  };
  var c = String(color).trim();

  // hex
  if (c.startsWith('#')) {
    var hex = c.slice(1);
    if (hex.length === 3) {
      var r = parseInt(hex[0] + hex[0], 16);
      var g = parseInt(hex[1] + hex[1], 16);
      var b = parseInt(hex[2] + hex[2], 16);
      return {
        r: r,
        g: g,
        b: b
      };
    }
    if (hex.length === 6) {
      var _r = parseInt(hex.slice(0, 2), 16);
      var _g = parseInt(hex.slice(2, 4), 16);
      var _b = parseInt(hex.slice(4, 6), 16);
      return {
        r: _r,
        g: _g,
        b: _b
      };
    }
  }

  // rgb/rgba
  var m = c.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    var parts = m[1].split(',').map(function (s) {
      return s.trim();
    });
    var _r2 = parseFloat(parts[0]);
    var _g2 = parseFloat(parts[1]);
    var _b2 = parseFloat(parts[2]);
    if ([_r2, _g2, _b2].every(function (v) {
      return Number.isFinite(v);
    })) {
      return {
        r: _r2,
        g: _g2,
        b: _b2
      };
    }
  }

  // fallback
  return {
    r: 255,
    g: 255,
    b: 255
  };
}
function rgba(rgb, a) {
  var alpha = clamp(a, 0, 1);
  return "rgba(".concat(Math.round(rgb.r), ", ").concat(Math.round(rgb.g), ", ").concat(Math.round(rgb.b), ", ").concat(alpha, ")");
}
function getThemeKey() {
  var theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark-forest' ? 'dark-forest' : 'default';
}
function readCssVar(name) {
  var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  try {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    var out = (v || '').trim();
    return out || fallback;
  } catch (_unused) {
    return fallback;
  }
}
function buildPalette(themeKey) {
  // Use semantic theme tokens so visuals adapt correctly
  var text = parseCssColorToRgb(readCssVar('--theme-text-primary', '#ffffff'));
  var accent = parseCssColorToRgb(readCssVar('--theme-accent-color', '#ffffff'));
  var glow = parseCssColorToRgb(readCssVar('--theme-highlight-glow', 'rgba(255,255,255,0.35)'));
  var warm = parseCssColorToRgb(readCssVar('--theme-highlight-strong', '#ffd700'));
  if (themeKey === 'dark-forest') {
    return {
      core: warm,
      halo: glow,
      line: accent,
      ink: text
    };
  }

  // default: dust/bokeh reads nicer with a softer highlight
  var soft = parseCssColorToRgb(readCssVar('--theme-highlight-light', '#ffffff'));
  return {
    core: soft,
    halo: glow,
    line: accent,
    ink: text
  };
}
function getProfile(themeKey) {
  // Keep counts conservative (dashboards are UI-dense)
  if (themeKey === 'dark-forest') {
    return {
      style: 'fireflies',
      maxCount: 42,
      densityFactor: 38000,
      minSize: 1.4,
      maxSize: 3.2,
      minSpeed: 0.01,
      maxSpeed: 0.055,
      minOpacity: 0.22,
      maxOpacity: 0.55,
      twinkleMin: 0.003,
      twinkleMax: 0.012,
      glowRadiusMin: 12,
      glowRadiusMax: 26,
      composite: 'lighter',
      connections: {
        enabled: false
      }
    };
  }
  return {
    style: 'dust',
    maxCount: Math.min(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.PARTICLES_CONFIG.MAX_COUNT, 70),
    densityFactor: 24000,
    minSize: 1.2,
    maxSize: 4.6,
    minSpeed: 0.008,
    maxSpeed: 0.05,
    minOpacity: 0.16,
    maxOpacity: 0.38,
    twinkleMin: 0.0015,
    twinkleMax: 0.006,
    glowRadiusMin: 8,
    glowRadiusMax: 18,
    composite: 'source-over',
    // very subtle (option C flavor) so it doesn't fight UI
    connections: {
      enabled: true,
      distance: 120,
      baseOpacity: 0.10,
      lineWidth: 1
    }
  };
}
var Particle = /*#__PURE__*/function () {
  function Particle(width, height, profile) {
    _classCallCheck(this, Particle);
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseSize = rand(profile.minSize, profile.maxSize);
    this.size = this.baseSize;
    var speed = rand(profile.minSpeed, profile.maxSpeed);
    var angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.baseOpacity = rand(profile.minOpacity, profile.maxOpacity);
    this.opacity = this.baseOpacity;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = rand(profile.twinkleMin, profile.twinkleMax);
    this.driftPhase = Math.random() * Math.PI * 2;
    this.driftSpeed = rand(0.0008, 0.002);
    this.driftStrength = rand(0.0006, 0.0022);
    this.width = width;
    this.height = height;
    this.profile = profile;
  }
  return _createClass(Particle, [{
    key: "update",
    value: function update() {
      // gentle drift/wander
      this.driftPhase += this.driftSpeed;
      this.vx += Math.cos(this.driftPhase) * this.driftStrength;
      this.vy += Math.sin(this.driftPhase) * this.driftStrength;

      // clamp speed
      var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      var max = this.profile.maxSpeed;
      if (speed > max) {
        var s = max / speed;
        this.vx *= s;
        this.vy *= s;
      }
      this.x += this.vx;
      this.y += this.vy;

      // wrap edges (calmer than bouncing)
      var margin = 20;
      if (this.x < -margin) this.x = this.width + margin;
      if (this.x > this.width + margin) this.x = -margin;
      if (this.y < -margin) this.y = this.height + margin;
      if (this.y > this.height + margin) this.y = -margin;

      // twinkle
      this.twinklePhase += this.twinkleSpeed;
      var tw = 0.65 + 0.35 * Math.sin(this.twinklePhase);
      this.opacity = this.baseOpacity * tw;
      this.size = this.baseSize * (0.92 + 0.12 * tw);
    }
  }, {
    key: "draw",
    value: function draw(palette) {
      var profile = this.profile;

      // Fireflies: warmer core + stronger halo
      if (profile.style === 'fireflies') {
        var glowR = rand(profile.glowRadiusMin, profile.glowRadiusMax);
        var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
        g.addColorStop(0, rgba(palette.core, this.opacity * 0.85));
        g.addColorStop(0.5, rgba(palette.halo, this.opacity * 0.22));
        g.addColorStop(1, rgba(palette.halo, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // tiny core dot
        ctx.fillStyle = rgba(palette.core, this.opacity);
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.8, this.size * 0.85), 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      // Dust/Bokeh: soft blobs
      var r = Math.max(2, this.size * 3.8);
      var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
      grad.addColorStop(0, rgba(palette.core, this.opacity * 0.80));
      grad.addColorStop(0.45, rgba(palette.halo, this.opacity * 0.22));
      grad.addColorStop(1, rgba(palette.halo, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }]);
}();
function connectParticles(palette, profile) {
  var conn = profile.connections;
  if (!conn || !conn.enabled) return;
  var maxD = conn.distance;
  for (var i = 0; i < particles.length; i++) {
    for (var j = i + 1; j < particles.length; j++) {
      var dx = particles[i].x - particles[j].x;
      var dy = particles[i].y - particles[j].y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= maxD) continue;
      var a = conn.baseOpacity * (1 - distance / maxD);
      ctx.strokeStyle = rgba(palette.line, a);
      ctx.lineWidth = conn.lineWidth || 1;
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
}
function resizeCanvas() {
  if (!canvas) return;
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvasWidth * dpr);
  canvas.height = Math.floor(canvasHeight * dpr);
  canvas.style.width = "".concat(canvasWidth, "px");
  canvas.style.height = "".concat(canvasHeight, "px");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Reinitialize particles with new dimensions
  if (activeProfile) {
    particles = particles.map(function () {
      return new Particle(canvasWidth, canvasHeight, activeProfile);
    });
  }
}
function applyThemeProfile() {
  var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var themeKey = getThemeKey();
  if (!force && themeKey === activeThemeKey) return;
  activeThemeKey = themeKey;
  activeProfile = getProfile(themeKey);
  activePalette = buildPalette(themeKey);
  if (!canvas) return;
  // rebuild particles to match style and count
  particles = [];
  var particleCount = Math.min(activeProfile.maxCount, Math.floor(canvasWidth * canvasHeight / activeProfile.densityFactor));
  for (var i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvasWidth, canvasHeight, activeProfile));
  }
}
function watchThemeChanges() {
  if (themeObserver) return;
  themeObserver = new MutationObserver(function () {
    return applyThemeProfile(false);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}
function unwatchThemeChanges() {
  if (!themeObserver) return;
  themeObserver.disconnect();
  themeObserver = null;
}
function initParticles() {
  canvas = (0,_utils_dom_js__WEBPACK_IMPORTED_MODULE_1__.getElement)(_utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.PARTICLES_CANVAS, false);
  if (!canvas) return false;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  applyThemeProfile(true);
  return true;
}
function animateParticles() {
  if (!ctx || !canvas) return;

  // Ensure composite mode matches active style
  if (activeProfile && activeProfile.composite) {
    ctx.globalCompositeOperation = activeProfile.composite;
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  particles.forEach(function (particle) {
    particle.update();
    particle.draw(activePalette);
  });

  // Keep constellation flavor only on default (very subtle)
  connectParticles(activePalette, activeProfile);
  animationFrameId = requestAnimationFrame(animateParticles);
}
function startParticles() {
  if (initParticles()) {
    window.addEventListener('resize', resizeCanvas);
    watchThemeChanges();
    animateParticles();
  }
}
function stopParticles() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  window.removeEventListener('resize', resizeCanvas);
  unwatchThemeChanges();
  particles = [];
}

/***/ }),

/***/ "./src/modules/servicesTechNav.js":
/*!****************************************!*\
  !*** ./src/modules/servicesTechNav.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initServicesTechNav: () => (/* binding */ initServicesTechNav)
/* harmony export */ });
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Services Tech Modules Navigation
// Handles active state for the Services technical module nav (Guía/Proceso/Comparador/Siniestros/FAQ)

function getPanelIdFromLink(link) {
  var _link$getAttribute;
  var href = (link === null || link === void 0 || (_link$getAttribute = link.getAttribute) === null || _link$getAttribute === void 0 ? void 0 : _link$getAttribute.call(link, 'href')) || '';
  if (!href.startsWith('#')) return null;
  var id = href.slice(1).trim();
  return id || null;
}
function initServicesTechNav() {
  var _root$querySelector;
  var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var container = (_root$querySelector = root.querySelector) === null || _root$querySelector === void 0 ? void 0 : _root$querySelector.call(root, '.services-tech');
  if (!container) return;

  // Cleanup any previous instance (in case we re-navigate to services)
  if (typeof window.__servicesTechNavCleanup === 'function') {
    try {
      window.__servicesTechNavCleanup();
    } catch (_unused) {
      // no-op
    }
  }
  var links = Array.from(container.querySelectorAll('.services-tech-link'));
  var panels = Array.from(container.querySelectorAll('.services-panel'));
  var panelsContainer = container.querySelector('.services-tech-panels');
  if (!links.length || !panels.length) return;

  // Signal to CSS that JS has enhanced the module nav (disables first-tab fallback styles)
  container.classList.add('is-enhanced');
  var panelById = new Map(panels.filter(function (p) {
    return p === null || p === void 0 ? void 0 : p.id;
  }).map(function (p) {
    return [p.id, p];
  }));
  var defaultId = getPanelIdFromLink(links[0]) || panels[0].id;
  var isDesktopLayout = function isDesktopLayout() {
    try {
      var _window$matchMedia, _window;
      return !!((_window$matchMedia = (_window = window).matchMedia) !== null && _window$matchMedia !== void 0 && (_window$matchMedia = _window$matchMedia.call(_window, '(min-width: 1024px)')) !== null && _window$matchMedia !== void 0 && _window$matchMedia.matches);
    } catch (_unused2) {
      return false;
    }
  };
  var isProgrammaticScroll = false;
  var programmaticScrollTimer = null;
  var observer = null;
  var compareUnlockTimer = null;
  var dragScrollCleanups = [];
  var COMPARE_PANEL_ID = 'services-panel-compare';
  var COMPARE_ACTIVE_CLASS = 'is-compare-active';
  function isMobileOrTabletLayout() {
    return !isDesktopLayout();
  }
  function setCompareActiveState(isActive) {
    if (!isMobileOrTabletLayout()) {
      container.classList.remove(COMPARE_ACTIVE_CLASS);
      return;
    }
    if (isActive) container.classList.add(COMPARE_ACTIVE_CLASS);else container.classList.remove(COMPARE_ACTIVE_CLASS);
  }
  function enableDragToScrollX(el) {
    var _el$dataset;
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$ignoreSelector = _ref.ignoreSelector,
      ignoreSelector = _ref$ignoreSelector === void 0 ? 'a, button, input, textarea, select, label, [role="button"]' : _ref$ignoreSelector;
    if (!el || ((_el$dataset = el.dataset) === null || _el$dataset === void 0 ? void 0 : _el$dataset.dragScrollX) === '1') return function () {};
    el.dataset.dragScrollX = '1';
    var isDragging = false;
    var startX = 0;
    var startScrollLeft = 0;
    var activePointerId = null;
    var onPointerDown = function onPointerDown(e) {
      var _e$target, _e$target$closest;
      // Only mouse/pen dragging; touch devices should use native panning.
      if (e.pointerType === 'touch') return;
      if (e.button !== 0) return;

      // Don't hijack clicks on interactive elements.
      if (ignoreSelector && (_e$target = e.target) !== null && _e$target !== void 0 && (_e$target$closest = _e$target.closest) !== null && _e$target$closest !== void 0 && _e$target$closest.call(_e$target, ignoreSelector)) return;

      // If the element can't scroll horizontally, don't start.
      if (el.scrollWidth <= el.clientWidth + 1) return;
      isDragging = true;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.classList.add('is-dragging');
      try {
        var _el$setPointerCapture;
        (_el$setPointerCapture = el.setPointerCapture) === null || _el$setPointerCapture === void 0 || _el$setPointerCapture.call(el, activePointerId);
      } catch (_unused3) {
        // no-op
      }

      // Prevent text selection while dragging.
      e.preventDefault();
    };
    var onPointerMove = function onPointerMove(e) {
      if (!isDragging) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      var dx = e.clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
    };
    var stopDrag = function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      activePointerId = null;
      el.classList.remove('is-dragging');
    };
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointercancel', stopDrag);
    el.addEventListener('lostpointercapture', stopDrag);
    return function () {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', stopDrag);
      el.removeEventListener('pointercancel', stopDrag);
      el.removeEventListener('lostpointercapture', stopDrag);
      try {
        delete el.dataset.dragScrollX;
      } catch (_unused4) {
        // no-op
      }
      el.classList.remove('is-dragging');
    };
  }
  function enhanceCompareHorizontalScroll() {
    var _container$querySelec;
    // Comparator card rail (horizontal)
    var compareGrid = (_container$querySelec = container.querySelector) === null || _container$querySelec === void 0 ? void 0 : _container$querySelec.call(container, "#".concat(COMPARE_PANEL_ID, " .services-compare-grid"));
    if (compareGrid) {
      // Make it keyboard-focusable (arrow keys + scrollbar drag).
      if (!compareGrid.hasAttribute('tabindex')) compareGrid.tabIndex = 0;
      if (!compareGrid.hasAttribute('role')) compareGrid.setAttribute('role', 'region');
      if (!compareGrid.hasAttribute('aria-label')) compareGrid.setAttribute('aria-label', 'Comparador: desplázate horizontalmente');
      dragScrollCleanups.push(enableDragToScrollX(compareGrid, {
        // Let the inner tables keep their own scroll behavior.
        ignoreSelector: 'a, button, input, textarea, select, label, [role="button"], .services-compare-table-wrapper, table'
      }));
    }

    // Individual comparison tables (also horizontal on narrow widths)
    var tableWrappers = Array.from(container.querySelectorAll("#".concat(COMPARE_PANEL_ID, " .services-compare-table-wrapper")));
    for (var _i = 0, _tableWrappers = tableWrappers; _i < _tableWrappers.length; _i++) {
      var w = _tableWrappers[_i];
      dragScrollCleanups.push(enableDragToScrollX(w));
    }
  }
  function markProgrammaticScroll() {
    var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 650;
    isProgrammaticScroll = true;
    if (programmaticScrollTimer) window.clearTimeout(programmaticScrollTimer);
    programmaticScrollTimer = window.setTimeout(function () {
      isProgrammaticScroll = false;
      programmaticScrollTimer = null;
    }, ms);
  }
  function setActive(id) {
    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$scrollIntoView = _ref2.scrollIntoView,
      scrollIntoView = _ref2$scrollIntoView === void 0 ? true : _ref2$scrollIntoView,
      _ref2$updateHash = _ref2.updateHash,
      updateHash = _ref2$updateHash === void 0 ? false : _ref2$updateHash;
    if (!id || !panelById.has(id)) id = defaultId;

    // On desktop, panels are not horizontally scrollable; avoid vertical jumps.
    if (isDesktopLayout()) {
      scrollIntoView = false;
    }

    // Links
    var _iterator = _createForOfIteratorHelper(links),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var link = _step.value;
        var linkId = getPanelIdFromLink(link);
        if (linkId === id) link.classList.add('is-active');else link.classList.remove('is-active');
      }

      // Panels
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    var _iterator2 = _createForOfIteratorHelper(panels),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _panel = _step2.value;
        if (_panel.id === id) _panel.classList.add('is-active');else _panel.classList.remove('is-active');
      }

      // On mobile/tablet, the panels container is itself a horizontal scroller.
      // When the comparator is active, we want horizontal gestures to operate on the comparator rail,
      // not the outer panels scroller. We apply the state class AFTER scrollIntoView so we don't block alignment.
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    if (compareUnlockTimer) {
      window.clearTimeout(compareUnlockTimer);
      compareUnlockTimer = null;
    }
    setCompareActiveState(false);
    if (updateHash) {
      var currentHashId = (window.location.hash || '').replace('#', '').trim();
      if (currentHashId !== id) {
        var nextUrl = "".concat(window.location.pathname).concat(window.location.search, "#").concat(id);
        window.history.replaceState(null, '', nextUrl);
      }
    }
    if (scrollIntoView) {
      var panel = panelById.get(id);
      if (panel) {
        markProgrammaticScroll();
        // If panels are horizontally scrollable (mobile/tablet), align the chosen one.
        // On desktop, panels are single-view, so this is essentially a no-op.
        panel.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });

        // Nudge the scroll container so keyboard users stay within the region.
        if (panelsContainer && panelsContainer.contains(panel)) {
          var _panelsContainer$focu;
          (_panelsContainer$focu = panelsContainer.focus) === null || _panelsContainer$focu === void 0 || _panelsContainer$focu.call(panelsContainer, {
            preventScroll: true
          });
        }
      }
    }
    if (id === COMPARE_PANEL_ID && isMobileOrTabletLayout()) {
      // Wait a beat so scrollIntoView can complete, then lock the outer panels scroller.
      compareUnlockTimer = window.setTimeout(function () {
        setCompareActiveState(true);
        compareUnlockTimer = null;
      }, 700);
    }
  }
  function syncFromHash() {
    var hashId = (window.location.hash || '').replace('#', '').trim();
    if (hashId && panelById.has(hashId)) {
      setActive(hashId, {
        scrollIntoView: true
      });
      return;
    }
    setActive(defaultId, {
      scrollIntoView: false
    });
  }
  var clickHandlers = new Map();
  var _loop = function _loop() {
    var link = _links[_i2];
    var handler = function handler(e) {
      e.preventDefault();
      var id = getPanelIdFromLink(link);
      if (!id) return;

      // Update URL hash WITHOUT jumping the page.
      var nextUrl = "".concat(window.location.pathname).concat(window.location.search, "#").concat(id);
      window.history.replaceState(null, '', nextUrl);
      setActive(id, {
        scrollIntoView: true
      });
    };
    clickHandlers.set(link, handler);
    link.addEventListener('click', handler);
  };
  for (var _i2 = 0, _links = links; _i2 < _links.length; _i2++) {
    _loop();
  }
  var onHashChange = function onHashChange() {
    return syncFromHash();
  };
  window.addEventListener('hashchange', onHashChange);

  // Initial state
  syncFromHash();

  // Comparator: make horizontal scrolling discoverable/easy (mouse drag + table drag).
  enhanceCompareHorizontalScroll();

  // Keep the active tab in sync when the user scrolls panels manually (mobile/tablet)
  if (panelsContainer && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      var _best;
      if (isProgrammaticScroll) return;

      // Pick the most visible intersecting panel
      var best = null;
      var _iterator3 = _createForOfIteratorHelper(entries),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var entry = _step3.value;
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      var panel = (_best = best) === null || _best === void 0 ? void 0 : _best.target;
      var id = panel === null || panel === void 0 ? void 0 : panel.id;
      if (id && panelById.has(id)) {
        setActive(id, {
          scrollIntoView: false,
          updateHash: true
        });
      }
    }, {
      root: panelsContainer,
      threshold: [0.55, 0.7, 0.85]
    });
    var _iterator4 = _createForOfIteratorHelper(panels),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var panel = _step4.value;
        observer.observe(panel);
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  }
  window.__servicesTechNavCleanup = function () {
    window.removeEventListener('hashchange', onHashChange);
    var _iterator5 = _createForOfIteratorHelper(clickHandlers.entries()),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var _step5$value = _slicedToArray(_step5.value, 2),
          link = _step5$value[0],
          handler = _step5$value[1];
        link.removeEventListener('click', handler);
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    container.classList.remove('is-enhanced');
    container.classList.remove(COMPARE_ACTIVE_CLASS);
    for (var _i3 = 0, _dragScrollCleanups = dragScrollCleanups; _i3 < _dragScrollCleanups.length; _i3++) {
      var cleanup = _dragScrollCleanups[_i3];
      try {
        cleanup();
      } catch (_unused5) {
        // no-op
      }
    }
    dragScrollCleanups = [];
    if (observer) {
      try {
        observer.disconnect();
      } catch (_unused6) {
        // no-op
      }
      observer = null;
    }
    if (programmaticScrollTimer) {
      window.clearTimeout(programmaticScrollTimer);
      programmaticScrollTimer = null;
    }
    if (compareUnlockTimer) {
      window.clearTimeout(compareUnlockTimer);
      compareUnlockTimer = null;
    }
    delete window.__servicesTechNavCleanup;
  };
}

/***/ }),

/***/ "./src/modules/simpleRouter.js":
/*!*************************************!*\
  !*** ./src/modules/simpleRouter.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getCurrentPage: () => (/* binding */ getCurrentPage),
/* harmony export */   initializeTemplates: () => (/* binding */ initializeTemplates),
/* harmony export */   navigateTo: () => (/* binding */ navigateTo),
/* harmony export */   toggleFooter: () => (/* binding */ toggleFooter),
/* harmony export */   toggleMobileMenu: () => (/* binding */ toggleMobileMenu)
/* harmony export */ });
/* harmony import */ var _core_state_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/state.js */ "./src/core/state.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _homeAnimations_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./homeAnimations.js */ "./src/modules/homeAnimations.js");
/* harmony import */ var _notifications_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./notifications.js */ "./src/modules/notifications.js");
/* harmony import */ var _utils_timing_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/timing.js */ "./src/utils/timing.js");
/* harmony import */ var _particles_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./particles.js */ "./src/modules/particles.js");
/* harmony import */ var _servicesTechNav_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./servicesTechNav.js */ "./src/modules/servicesTechNav.js");
/* harmony import */ var _aboutEnhancements_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./aboutEnhancements.js */ "./src/modules/aboutEnhancements.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Ultra-simple router - NO fetch, NO template loading
 * All templates are already in index.html as hidden sections (injected by webpack at build time)
 * Navigation = just show/hide with classList
 */










var currentPage = 'home';

/**
 * Navigate to a page by showing its section and hiding others
 * Templates are already in the DOM (injected by webpack at build time)
 * We just show/hide them
 */
function navigateTo(page, event) {
  if (event) {
    event.preventDefault();
  }
  if (!page) page = 'home';

  // Contact page restriction
  if (page === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.CONTACT && !window.__allowContact) {
    (0,_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('La sección de Contacto sólo se abre desde el contacto con un agente.', _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.NOTIFICATION_TYPES.INFO);
    return;
  }

  // Cleanup previous page
  (0,_homeAnimations_js__WEBPACK_IMPORTED_MODULE_2__.cleanupHomeAnimations)();
  (0,_utils_timing_js__WEBPACK_IMPORTED_MODULE_4__.clearAllTimers)();

  // Page-specific cleanup hooks (avoid duplicated listeners when revisiting pages)
  try {
    if (typeof window.__servicesTechNavCleanup === 'function') {
      window.__servicesTechNavCleanup();
    }
    delete window.__servicesTechNavCleanup;
    if (typeof window.__aboutEnhancementsCleanup === 'function') {
      window.__aboutEnhancementsCleanup();
    }
    delete window.__aboutEnhancementsCleanup;
  } catch (e) {
    // Non-fatal
    console.warn('[ROUTER] cleanup hook error', e);
  }
  (0,_core_state_js__WEBPACK_IMPORTED_MODULE_0__.setPage)(page);

  // Expose current page as an attribute for page-scoped CSS (e.g. home progress bar)
  document.body.setAttribute('data-page', page);

  // Close mobile menu
  var navMenu = document.getElementById('navMenu');
  if (navMenu) navMenu.classList.remove('active');

  // Update nav links active state
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.classList.remove('active');
    if (link.dataset.page === page) link.classList.add('active');
  });

  // Handle footer visibility
  var footer = document.getElementById('footer');
  if (footer) {
    if (_utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES_WITHOUT_FOOTER.includes(page)) {
      footer.classList.add('d-none');
    } else {
      footer.classList.remove('d-none');
    }
  }

  // Hide all page sections
  document.querySelectorAll('.page-section').forEach(function (section) {
    section.classList.add('hidden');
  });

  // Show the requested page
  var pageElement = document.getElementById("page-".concat(page));
  if (pageElement) {
    pageElement.classList.remove('hidden');
    currentPage = page;
  } else {
    console.warn("Page element with id \"page-".concat(page, "\" not found, falling back to home"));
    document.getElementById('page-home').classList.remove('hidden');
    currentPage = 'home';
  }

  // Control particles (keep UI-dense work areas distraction-free)
  if (['services', 'about', 'contact', 'client-dashboard', 'agent-dashboard', 'admin-dashboard', 'login', 'agent-login'].includes(page)) {
    (0,_particles_js__WEBPACK_IMPORTED_MODULE_5__.stopParticles)();
  } else {
    (0,_particles_js__WEBPACK_IMPORTED_MODULE_5__.startParticles)();
  }

  // Initialize page-specific features
  if (page === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.HOME) {
    setTimeout(function () {
      (0,_homeAnimations_js__WEBPACK_IMPORTED_MODULE_2__.initStatsAnimation)();
      (0,_homeAnimations_js__WEBPACK_IMPORTED_MODULE_2__.startHomeSequence)();
    }, 100);
  }
  if (page === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.SERVICES || page === 'services') {
    (0,_servicesTechNav_js__WEBPACK_IMPORTED_MODULE_6__.initServicesTechNav)(pageElement || document);
  }
  if (page === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.ABOUT || page === 'about') {
    (0,_aboutEnhancements_js__WEBPACK_IMPORTED_MODULE_7__.initAboutEnhancements)(pageElement || document);
  }

  // Clear contact flag
  if (page === _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.PAGES.CONTACT) {
    setTimeout(function () {
      window.__allowContact = false;
    }, 500);
  }

  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  var navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.classList.toggle('active');
  }
}

/**
 * Toggle footer
 */
function toggleFooter() {
  var footer = document.getElementById('footer');
  var toggleText = document.getElementById('footer-toggle-text');
  if (!footer) return;
  if (footer.classList.contains('collapsed')) {
    footer.classList.remove('collapsed');
    if (toggleText) toggleText.textContent = 'Ocultar Información';
  } else {
    footer.classList.add('collapsed');
    if (toggleText) toggleText.textContent = 'Mostrar Información';
  }
}

/**
 * Dummy function (no longer needed, templates are already in DOM)
 */
function initializeTemplates() {
  return _initializeTemplates.apply(this, arguments);
}

/**
 * Get current page
 */
function _initializeTemplates() {
  _initializeTemplates = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          console.log('[ROUTER] Templates already injected in index.html by webpack');
        case 1:
          return _context.a(2);
      }
    }, _callee);
  }));
  return _initializeTemplates.apply(this, arguments);
}
function getCurrentPage() {
  return currentPage;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  navigateTo: navigateTo,
  toggleMobileMenu: toggleMobileMenu,
  toggleFooter: toggleFooter,
  initializeTemplates: initializeTemplates,
  getCurrentPage: getCurrentPage
});

/***/ }),

/***/ "./src/utils/constants.js":
/*!********************************!*\
  !*** ./src/utils/constants.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEMO_CREDENTIALS: () => (/* binding */ DEMO_CREDENTIALS),
/* harmony export */   GRADIENT_CLASSES: () => (/* binding */ GRADIENT_CLASSES),
/* harmony export */   NOTIFICATION_TYPES: () => (/* binding */ NOTIFICATION_TYPES),
/* harmony export */   PAGES: () => (/* binding */ PAGES),
/* harmony export */   PAGES_WITHOUT_FOOTER: () => (/* binding */ PAGES_WITHOUT_FOOTER),
/* harmony export */   PARTICLES_CONFIG: () => (/* binding */ PARTICLES_CONFIG),
/* harmony export */   SELECTORS: () => (/* binding */ SELECTORS),
/* harmony export */   TIMING: () => (/* binding */ TIMING)
/* harmony export */ });
// Application Constants

// Animation Timings
var TIMING = {
  HERO_DURATION: 6000,
  PARADE_DURATION: 8000,
  CTA_FADE_IN: 800,
  BUTTON_DELAY: 400,
  BUTTON_STAGGER: 150,
  DROPLET_DURATION: 600,
  NOTIFICATION_DURATION: 3000,
  STATS_ANIMATION: 2000
};

// Page Routes
var PAGES = {
  HOME: 'home',
  SERVICES: 'services',
  ABOUT: 'about',
  CONTACT: 'contact',
  LOGIN: 'login',
  AGENT_LOGIN: 'agent-login',
  CLIENT_DASHBOARD: 'client-dashboard',
  AGENT_DASHBOARD: 'agent-dashboard'
};

// Pages that hide footer
var PAGES_WITHOUT_FOOTER = [PAGES.LOGIN, PAGES.AGENT_LOGIN, PAGES.CLIENT_DASHBOARD, PAGES.AGENT_DASHBOARD];

// Demo Credentials
var DEMO_CREDENTIALS = {
  CLIENT: {
    email: 'cliente@demo.com',
    password: 'demo123'
  },
  AGENT: {
    id: 'agente@demo.com',
    password: 'agent123'
  }
};

// Gradient Section Classes
var GRADIENT_CLASSES = {
  HERO: 'section-hero',
  PARADE: 'section-parade',
  CTA: 'section-cta'
};

// DOM Selectors
var SELECTORS = {
  NAV_MENU: '#navMenu',
  FOOTER: '#footer',
  MAIN_CONTENT: '#mainContent',
  SUB_NAV: '#sub-nav',
  PARTICLES_CANVAS: '#particles-canvas',
  HERO_SECTION: '.hero-intro',
  PARADE_SECTION: '.features-parade',
  CTA_SECTION: '.final-cta',
  SKIP_BUTTON: '.btn-home-start',
  HOME_SECTIONS: '.home-section',
  SUB_NAV_BUTTONS: '.sub-nav-btn',
  STAT_NUMBERS: '.stat-number',
  NAV_LINKS: '.nav-link'
};

// Notification Types
var NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Particles Configuration
var PARTICLES_CONFIG = {
  MAX_COUNT: 60,
  MIN_SIZE: 2,
  MAX_SIZE: 5,
  // Velocidades reducidas para movimiento más calmado
  MIN_SPEED: 0.01,
  MAX_SPEED: 0.06,
  MIN_OPACITY: 0.25,
  MAX_OPACITY: 0.6,
  CONNECTION_DISTANCE: 120,
  CONNECTION_OPACITY: 0.10,
  DENSITY_FACTOR: 10000
};

/***/ }),

/***/ "./src/utils/dom.js":
/*!**************************!*\
  !*** ./src/utils/dom.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addClass: () => (/* binding */ addClass),
/* harmony export */   clearCache: () => (/* binding */ clearCache),
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   getElement: () => (/* binding */ getElement),
/* harmony export */   getElementById: () => (/* binding */ getElementById),
/* harmony export */   getElements: () => (/* binding */ getElements),
/* harmony export */   hasClass: () => (/* binding */ hasClass),
/* harmony export */   hide: () => (/* binding */ hide),
/* harmony export */   removeClass: () => (/* binding */ removeClass),
/* harmony export */   replaceClass: () => (/* binding */ replaceClass),
/* harmony export */   setHTML: () => (/* binding */ setHTML),
/* harmony export */   setStyle: () => (/* binding */ setStyle),
/* harmony export */   show: () => (/* binding */ show),
/* harmony export */   showBlock: () => (/* binding */ showBlock),
/* harmony export */   showFlex: () => (/* binding */ showFlex),
/* harmony export */   showInlineBlock: () => (/* binding */ showInlineBlock),
/* harmony export */   toggleClass: () => (/* binding */ toggleClass)
/* harmony export */ });
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// DOM Utility Functions

// Cache for frequently accessed elements
var domCache = new Map();
function getElement(selector) {
  var useCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (useCache && domCache.has(selector)) {
    return domCache.get(selector);
  }
  var element = document.querySelector(selector);
  if (useCache && element) {
    domCache.set(selector, element);
  }
  return element;
}
function getElements(selector) {
  return document.querySelectorAll(selector);
}
function getElementById(id) {
  return document.getElementById(id);
}
function clearCache() {
  domCache.clear();
}
function addClass(element, className) {
  if (element) element.classList.add(className);
}
function removeClass(element, className) {
  if (element) element.classList.remove(className);
}
function toggleClass(element, className) {
  if (element) element.classList.toggle(className);
}
function replaceClass(element, oldClass, newClass) {
  if (element) {
    element.classList.remove(oldClass);
    element.classList.add(newClass);
  }
}
function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}
function setStyle(element, property, value) {
  if (element) element.style[property] = value;
}
function show(element) {
  if (element) {
    element.classList.remove('d-none');
    element.style.display = 'block';
  }
}
function hide(element) {
  if (element) {
    element.classList.add('d-none');
    element.style.display = 'none';
  }
}
function showFlex(element) {
  if (element) {
    element.classList.add('d-flex');
    element.classList.remove('d-none');
  }
}
function showInlineBlock(element) {
  if (element) {
    element.classList.add('d-inline-block');
    element.classList.remove('d-none');
  }
}
function showBlock(element) {
  if (element) {
    element.classList.add('d-block');
    element.classList.remove('d-none');
  }
}
function setHTML(element, html) {
  if (element) element.innerHTML = html;
}
function createElement(tag) {
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var element = document.createElement(tag);
  if (className) element.className = className;
  Object.entries(attributes).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    element.setAttribute(key, value);
  });
  return element;
}

/***/ }),

/***/ "./src/utils/timing.js":
/*!*****************************!*\
  !*** ./src/utils/timing.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearAllIntervals: () => (/* binding */ clearAllIntervals),
/* harmony export */   clearAllTimers: () => (/* binding */ clearAllTimers),
/* harmony export */   clearAllTiming: () => (/* binding */ clearAllTiming),
/* harmony export */   clearCustomInterval: () => (/* binding */ clearCustomInterval),
/* harmony export */   clearTimer: () => (/* binding */ clearTimer),
/* harmony export */   createInterval: () => (/* binding */ createInterval),
/* harmony export */   createTimer: () => (/* binding */ createTimer),
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   delay: () => (/* binding */ delay),
/* harmony export */   throttle: () => (/* binding */ throttle)
/* harmony export */ });
// Timing and Animation Control Utilities

var activeTimers = new Set();
var activeIntervals = new Set();
function createTimer(callback, delay) {
  var timerId = setTimeout(function () {
    activeTimers["delete"](timerId);
    callback();
  }, delay);
  activeTimers.add(timerId);
  return timerId;
}
function createInterval(callback, delay) {
  var intervalId = setInterval(callback, delay);
  activeIntervals.add(intervalId);
  return intervalId;
}
function clearTimer(timerId) {
  clearTimeout(timerId);
  activeTimers["delete"](timerId);
}
function clearCustomInterval(intervalId) {
  clearInterval(intervalId);
  activeIntervals["delete"](intervalId);
}
function clearAllTimers() {
  activeTimers.forEach(function (timerId) {
    return clearTimeout(timerId);
  });
  activeTimers.clear();
}
function clearAllIntervals() {
  activeIntervals.forEach(function (intervalId) {
    return clearInterval(intervalId);
  });
  activeIntervals.clear();
}
function clearAllTiming() {
  clearAllTimers();
  clearAllIntervals();
}
function delay(ms) {
  return new Promise(function (resolve) {
    var timerId = createTimer(resolve, ms);
    return timerId;
  });
}
function debounce(func, wait) {
  var timeout;
  return function executedFunction() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var later = function later() {
      clearTimeout(timeout);
      func.apply(void 0, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function throttle(func, limit) {
  var inThrottle;
  return function executedFunction() {
    if (!inThrottle) {
      func.apply(void 0, arguments);
      inThrottle = true;
      setTimeout(function () {
        return inThrottle = false;
      }, limit);
    }
  };
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************************!*\
  !*** ./src/core/EntryPointMainApp.js ***!
  \***************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_particles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/particles.js */ "./src/modules/particles.js");
/* harmony import */ var _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/simpleRouter.js */ "./src/modules/simpleRouter.js");
/* harmony import */ var _modules_auth_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/auth.js */ "./src/modules/auth.js");
/* harmony import */ var _modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modules/notifications.js */ "./src/modules/notifications.js");
/* harmony import */ var _modules_homeAnimations_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/homeAnimations.js */ "./src/modules/homeAnimations.js");
/* harmony import */ var _state_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./state.js */ "./src/core/state.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
// Main Application Entry Point









// Expose handlers globally for onclick handlers in templates
window.appHandlers = {
  navigateTo: _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo,
  toggleMobileMenu: _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.toggleMobileMenu,
  toggleFooter: _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.toggleFooter,
  skipToFinalState: _modules_homeAnimations_js__WEBPACK_IMPORTED_MODULE_4__.skipToFinalState,
  showHomeSection: _modules_homeAnimations_js__WEBPACK_IMPORTED_MODULE_4__.showHomeSection,
  handleClientLogin: handleClientLogin,
  handleAgentLogin: handleAgentLogin,
  handleContactSubmit: handleContactSubmit,
  logout: _modules_auth_js__WEBPACK_IMPORTED_MODULE_2__.logout,
  toggleTheme: toggleTheme,
  // Dashboard placeholders
  viewPolicy: viewPolicy,
  makePayment: makePayment,
  fileClaim: fileClaim,
  updateInfo: updateInfo,
  contactAgent: contactAgent,
  downloadPaymentHistory: downloadPaymentHistory,
  openQuoteModal: openQuoteModal,
  addNewClient: addNewClient,
  viewClientDetails: viewClientDetails,
  editClient: editClient,
  processQuote: processQuote,
  createQuote: createQuote,
  processRenewal: processRenewal,
  viewReports: viewReports,
  completeTask: completeTask,
  viewCommissionDetails: viewCommissionDetails,
  showAgentRegistration: showAgentRegistration
};

// Also expose common helpers as globals for legacy inline onclicks
window.navigateTo = _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo;
window.toggleMobileMenu = _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.toggleMobileMenu;
window.toggleFooter = _modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.toggleFooter;
window.handleContactSubmit = handleContactSubmit;
window.handleClientLogin = handleClientLogin;
window.handleAgentLogin = handleAgentLogin;
window.contactAgent = contactAgent;
window.toggleTheme = toggleTheme;
// Expose notification helper for quick console testing / legacy inline calls
window.showNotification = _modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification;

// Form handlers
function handleContactSubmit(e) {
  e.preventDefault();
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Mensaje enviado exitosamente. Te contactaremos pronto.', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.SUCCESS);
  e.target.reset();
}
function handleClientLogin(e) {
  e.preventDefault();
  var email = e.target[0].value;
  var password = e.target[1].value;
  var user = (0,_modules_auth_js__WEBPACK_IMPORTED_MODULE_2__.login)({
    email: email,
    password: password
  }, 'client');
  if (user) {
    (0,_modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo)('client-dashboard');
  }
}
function handleAgentLogin(e) {
  e.preventDefault();
  var agentId = e.target[0].value;
  var password = e.target[1].value;

  // Check if admin credentials
  if (agentId === 'admin' && password === 'admin123') {
    // Store admin session and redirect to admin page
    localStorage.setItem('krause_admin', JSON.stringify({
      name: 'Administrator',
      loggedAt: Date.now()
    }));
    // Use a relative URL so it works both locally and under a subpath (e.g. /memo/ on GitHub Pages)
    window.location.href = 'admin.html';
    return;
  }

  // Normal agent login
  var user = (0,_modules_auth_js__WEBPACK_IMPORTED_MODULE_2__.login)({
    agentId: agentId,
    password: password
  }, 'agent');
  if (user) {
    (0,_modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo)('agent-dashboard');
  }
}

// Dashboard placeholder functions
function viewPolicy(policyId) {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)("Mostrando detalles de p\xF3liza ".concat(policyId), _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function makePayment() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Redirigiendo a pasarela de pago...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function fileClaim() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Abriendo formulario de siniestros...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function updateInfo() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Abriendo formulario de actualización...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function contactAgent() {
  // Allow navigation to contact page when triggered from an agent action
  window.__allowContact = true;
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Abriendo chat con agente...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
  (0,_modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo)('contact');
  // Clear temporary flag shortly after navigation
  setTimeout(function () {
    window.__allowContact = false;
  }, 500);
}
function downloadPaymentHistory() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Descargando historial...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function openQuoteModal(type) {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)("Abriendo cotizaci\xF3n para seguro de ".concat(type), _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function addNewClient() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Abriendo formulario de nuevo cliente...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function viewClientDetails(clientId) {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)("Mostrando detalles del cliente ".concat(clientId), _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function editClient(clientId) {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)("Editando cliente ".concat(clientId), _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function processQuote(quoteId) {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)("Procesando cotizaci\xF3n ".concat(quoteId), _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function createQuote() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Creando nueva cotización...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function processRenewal() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Abriendo renovaciones pendientes...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function viewReports() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Generando reportes...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function completeTask(taskId) {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Tarea completada', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.SUCCESS);
}
function viewCommissionDetails() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Mostrando detalle de comisiones...', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}
function showAgentRegistration() {
  (0,_modules_notifications_js__WEBPACK_IMPORTED_MODULE_3__.showNotification)('Contacta al administrador para solicitar acceso como agente', _utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.NOTIFICATION_TYPES.INFO);
}

// Theme helpers (global toggle separate from any contact-card toggle)
function applyTheme(theme) {
  try {
    var root = document.documentElement;
    if (theme === 'dark-forest') {
      root.setAttribute('data-theme', 'dark-forest');
      localStorage.setItem('krause_theme', 'dark-forest');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('krause_theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem('krause_theme');
    }
  } catch (e) {
    console.warn('applyTheme error', e);
  }
}
function toggleTheme() {
  var root = document.documentElement;
  var current = root.getAttribute('data-theme');
  // Toggle the 'dark-forest' theme specifically (secondary theme requested)
  if (current === 'dark-forest') {
    applyTheme('light');
  } else {
    applyTheme('dark-forest');
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  // If a service worker was registered in a previous session, it can keep serving stale HTML/CSS.
  // Since SW registration is intentionally disabled during testing, proactively unregister it on localhost.
  try {
    var isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (r) {
          return r.unregister();
        }));
      })["catch"](function () {
        return undefined;
      });
    }
  } catch (e) {
    // Non-fatal
  }

  // Apply light theme by default (restore from localStorage if saved)
  var savedTheme = localStorage.getItem('krause_theme');
  applyTheme(savedTheme || 'light');

  // Check authentication and navigate (this will start particles)
  if ((0,_modules_auth_js__WEBPACK_IMPORTED_MODULE_2__.checkAuth)()) {
    var user = (0,_state_js__WEBPACK_IMPORTED_MODULE_5__.getUser)();
    var redirectPage = (0,_modules_auth_js__WEBPACK_IMPORTED_MODULE_2__.getRedirectPage)(user);
    (0,_modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo)(redirectPage);
  } else {
    (0,_modules_simpleRouter_js__WEBPACK_IMPORTED_MODULE_1__.navigateTo)('home');
  }
  console.log('🏛️ Krause Insurance App cargada correctamente (Modular)');
  // Service worker disabled during testing
  // if ('serviceWorker' in navigator) {
  //   window.addEventListener('load', () => {
  //     navigator.serviceWorker.register('/service-worker.js')
  //       .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
  //       .catch(err => console.warn('ServiceWorker registration failed:', err));
  //   });
  // }
});
})();

/******/ })()
;
//# sourceMappingURL=krause.app.js.map