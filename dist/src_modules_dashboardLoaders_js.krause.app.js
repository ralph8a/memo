"use strict";
(self["webpackChunkreact_app"] = self["webpackChunkreact_app"] || []).push([["src_modules_dashboardLoaders_js"],{

/***/ "./src/modules/dashboardLoaders.js":
/*!*****************************************!*\
  !*** ./src/modules/dashboardLoaders.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadAdminDashboard: () => (/* binding */ loadAdminDashboard),
/* harmony export */   loadAgentClients: () => (/* binding */ loadAgentClients),
/* harmony export */   loadAgentDashboard: () => (/* binding */ loadAgentDashboard),
/* harmony export */   loadClientClaims: () => (/* binding */ loadClientClaims),
/* harmony export */   loadClientDashboard: () => (/* binding */ loadClientDashboard),
/* harmony export */   loadClientDetails: () => (/* binding */ loadClientDetails),
/* harmony export */   loadClientPolicies: () => (/* binding */ loadClientPolicies),
/* harmony export */   loadDashboardStats: () => (/* binding */ loadDashboardStats),
/* harmony export */   loadPaymentHistory: () => (/* binding */ loadPaymentHistory),
/* harmony export */   loadQuotes: () => (/* binding */ loadQuotes),
/* harmony export */   updateUserNameInHeader: () => (/* binding */ updateUserNameInHeader)
/* harmony export */ });
/* harmony import */ var _api_integration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../api-integration.js */ "./src/api-integration.js");
/* harmony import */ var _notifications_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./notifications.js */ "./src/modules/notifications.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Dashboard Data Loaders - Backend Integration




// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Update user name in dashboard hero header
 * Gets user data from localStorage and updates the UI
 */
function updateUserNameInHeader() {
  try {
    var userStr = localStorage.getItem('krauser_user');
    if (!userStr) return;
    var user = JSON.parse(userStr);
    var emailPart = user.email ? user.email.split('@')[0] : 'Usuario';
    var userName = user.full_name || user.name || emailPart;

    // Update all possible hero header selectors
    var selectors = ['[data-hero-user]', '[data-user-name]', '[data-agent-name]', '[data-admin-name]'];
    selectors.forEach(function (selector) {
      var element = document.querySelector(selector);
      if (element) {
        element.textContent = userName;
      }
    });
    console.log('✅ User name updated in header:', userName);
  } catch (error) {
    console.error('Error updating user name in header:', error);
  }
}

// ============================================
// AGENT DASHBOARD LOADERS
// ============================================

function loadAgentDashboard() {
  return _loadAgentDashboard.apply(this, arguments);
}
function _loadAgentDashboard() {
  _loadAgentDashboard = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var dashboardData, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          // Update user name in header first
          updateUserNameInHeader();

          // Load dashboard data from backend
          _context.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.AGENT_DASHBOARD, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          dashboardData = _context.v;
          // Update UI with real data
          if (dashboardData.stats) updateAgentStats(dashboardData.stats);
          if (dashboardData.clients) renderAgentClients(dashboardData.clients);
          if (dashboardData.claims) renderAgentClaims(dashboardData.claims);
          console.log('✅ Agent dashboard loaded with real data');
          return _context.a(2, dashboardData);
        case 2:
          _context.p = 2;
          _t = _context.v;
          console.error('Error loading agent dashboard:', _t);
          (0,_notifications_js__WEBPACK_IMPORTED_MODULE_1__.showNotification)('Error al cargar datos del dashboard', _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.NOTIFICATION_TYPES.ERROR);
        case 3:
          return _context.a(2);
      }
    }, _callee, null, [[0, 2]]);
  }));
  return _loadAgentDashboard.apply(this, arguments);
}
function loadAgentClients() {
  return _loadAgentClients.apply(this, arguments);
}
function _loadAgentClients() {
  _loadAgentClients = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var clients, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          _context2.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.AGENT_CLIENTS, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          clients = _context2.v;
          return _context2.a(2, clients);
        case 2:
          _context2.p = 2;
          _t2 = _context2.v;
          console.error('Error loading clients:', _t2);
          return _context2.a(2, []);
      }
    }, _callee2, null, [[0, 2]]);
  }));
  return _loadAgentClients.apply(this, arguments);
}
function loadClientDetails(_x) {
  return _loadClientDetails.apply(this, arguments);
}
function _loadClientDetails() {
  _loadClientDetails = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(clientId) {
    var data, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          _context3.p = 0;
          _context3.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.GET_CLIENT_DETAILS, {
            method: 'GET',
            params: {
              id: clientId
            }
          });
        case 1:
          data = _context3.v;
          return _context3.a(2, data);
        case 2:
          _context3.p = 2;
          _t3 = _context3.v;
          console.error('Error loading client details:', _t3);
          (0,_notifications_js__WEBPACK_IMPORTED_MODULE_1__.showNotification)('Error al cargar detalles del cliente', _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.NOTIFICATION_TYPES.ERROR);
          return _context3.a(2, null);
      }
    }, _callee3, null, [[0, 2]]);
  }));
  return _loadClientDetails.apply(this, arguments);
}
function loadQuotes() {
  return _loadQuotes.apply(this, arguments);
}

// ============================================
// CLIENT DASHBOARD LOADERS
// ============================================
function _loadQuotes() {
  _loadQuotes = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var quotes, _t4;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          _context4.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.GET_QUOTES, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          quotes = _context4.v;
          return _context4.a(2, quotes);
        case 2:
          _context4.p = 2;
          _t4 = _context4.v;
          console.error('Error loading quotes:', _t4);
          return _context4.a(2, []);
      }
    }, _callee4, null, [[0, 2]]);
  }));
  return _loadQuotes.apply(this, arguments);
}
function loadClientDashboard() {
  return _loadClientDashboard.apply(this, arguments);
}
function _loadClientDashboard() {
  _loadClientDashboard = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var dashboardData, _yield$Promise$all, _yield$Promise$all2, policies, claims, payments, _t5;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          _context5.p = 0;
          // Update user name in header first
          updateUserNameInHeader();

          // Load dashboard data from backend
          _context5.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          dashboardData = _context5.v;
          _context5.n = 2;
          return Promise.all([loadClientPolicies(), loadClientClaims(), loadPaymentHistory()]);
        case 2:
          _yield$Promise$all = _context5.v;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 3);
          policies = _yield$Promise$all2[0];
          claims = _yield$Promise$all2[1];
          payments = _yield$Promise$all2[2];
          // Update stats from dashboard data
          if (dashboardData.stats) updateClientStats(dashboardData.stats);

          // Render lists
          if (policies) renderClientPolicies(policies);
          if (claims) renderClientClaims(claims);
          if (payments) renderPaymentHistory(payments);
          console.log('✅ Client dashboard loaded with real data');
          return _context5.a(2, {
            dashboardData: dashboardData,
            policies: policies,
            claims: claims,
            payments: payments
          });
        case 3:
          _context5.p = 3;
          _t5 = _context5.v;
          console.error('Error loading client dashboard:', _t5);
          (0,_notifications_js__WEBPACK_IMPORTED_MODULE_1__.showNotification)('Error al cargar datos del dashboard', _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.NOTIFICATION_TYPES.ERROR);
        case 4:
          return _context5.a(2);
      }
    }, _callee5, null, [[0, 3]]);
  }));
  return _loadClientDashboard.apply(this, arguments);
}
function loadClientPolicies() {
  return _loadClientPolicies.apply(this, arguments);
}
function _loadClientPolicies() {
  _loadClientPolicies = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var policies, _t6;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          _context6.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.CLIENT_POLICIES, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.MEDIUM,
            useCache: true
          });
        case 1:
          policies = _context6.v;
          return _context6.a(2, policies);
        case 2:
          _context6.p = 2;
          _t6 = _context6.v;
          console.error('Error loading policies:', _t6);
          return _context6.a(2, []);
      }
    }, _callee6, null, [[0, 2]]);
  }));
  return _loadClientPolicies.apply(this, arguments);
}
function loadPaymentHistory() {
  return _loadPaymentHistory.apply(this, arguments);
}

// ============================================
// ADMIN DASHBOARD LOADERS
// ============================================
function _loadPaymentHistory() {
  _loadPaymentHistory = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var payments, _t7;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          _context7.p = 0;
          _context7.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.MEDIUM,
            useCache: true
          });
        case 1:
          payments = _context7.v;
          return _context7.a(2, payments);
        case 2:
          _context7.p = 2;
          _t7 = _context7.v;
          console.error('Error loading payment history:', _t7);
          return _context7.a(2, []);
      }
    }, _callee7, null, [[0, 2]]);
  }));
  return _loadPaymentHistory.apply(this, arguments);
}
function loadAdminDashboard() {
  return _loadAdminDashboard.apply(this, arguments);
}

// ============================================
// SHARED LOADERS
// ============================================
function _loadAdminDashboard() {
  _loadAdminDashboard = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
    var dashboardData, _t8;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          _context8.p = 0;
          // Update user name in header first
          updateUserNameInHeader();

          // Load admin dashboard data from backend
          _context8.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          dashboardData = _context8.v;
          // Update UI with real data
          if (dashboardData.stats) updateAdminStats(dashboardData.stats);
          if (dashboardData.activity) renderAdminActivity(dashboardData.activity);
          console.log('✅ Admin dashboard loaded with real data');
          return _context8.a(2, dashboardData);
        case 2:
          _context8.p = 2;
          _t8 = _context8.v;
          console.error('Error loading admin dashboard:', _t8);
          (0,_notifications_js__WEBPACK_IMPORTED_MODULE_1__.showNotification)('Error al cargar dashboard de administración', _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.NOTIFICATION_TYPES.ERROR);
        case 3:
          return _context8.a(2);
      }
    }, _callee8, null, [[0, 2]]);
  }));
  return _loadAdminDashboard.apply(this, arguments);
}
function loadClientClaims() {
  return _loadClientClaims.apply(this, arguments);
}
function _loadClientClaims() {
  _loadClientClaims = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    var claims, _t9;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.p = _context9.n) {
        case 0:
          _context9.p = 0;
          _context9.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.CLIENT_CLAIMS, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          claims = _context9.v;
          return _context9.a(2, claims);
        case 2:
          _context9.p = 2;
          _t9 = _context9.v;
          console.error('Error loading claims:', _t9);
          return _context9.a(2, []);
      }
    }, _callee9, null, [[0, 2]]);
  }));
  return _loadClientClaims.apply(this, arguments);
}
function loadDashboardStats() {
  return _loadDashboardStats.apply(this, arguments);
}

// ============================================
// RENDERERS - AGENT
// ============================================
function _loadDashboardStats() {
  _loadDashboardStats = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    var stats, _t0;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.p = _context0.n) {
        case 0:
          _context0.p = 0;
          _context0.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.GET_DASHBOARD_STATS, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 1:
          stats = _context0.v;
          return _context0.a(2, stats);
        case 2:
          _context0.p = 2;
          _t0 = _context0.v;
          console.error('Error loading dashboard stats:', _t0);
          return _context0.a(2, null);
      }
    }, _callee0, null, [[0, 2]]);
  }));
  return _loadDashboardStats.apply(this, arguments);
}
function renderAgentClients(clients) {
  var container = document.querySelector('[data-clients-list]');
  if (!container || !clients || clients.length === 0) return;
  var html = clients.map(function (client) {
    return "\n    <div class=\"client-item\" data-client-id=\"".concat(client.id, "\">\n      <div class=\"client-info\">\n        <h4>").concat(client.first_name, " ").concat(client.last_name, "</h4>\n        <p>").concat(client.email, "</p>\n        <div class=\"client-meta\">\n          <span class=\"badge badge-").concat(client.status === 'active' ? 'success' : 'warning', "\">\n            ").concat(client.status, "\n          </span>\n          <span>Desde: ").concat(new Date(client.created_at).toLocaleDateString(), "</span>\n        </div>\n      </div>\n      <div class=\"client-actions\">\n        <button class=\"btn btn-sm btn-outline\" onclick=\"window.appHandlers.viewClientDetails('").concat(client.id, "')\">\n          Ver Detalles\n        </button>\n      </div>\n    </div>\n  ");
  }).join('');
  container.innerHTML = html;
}
function renderAgentClaims(claims) {
  var container = document.querySelector('[data-agent-claims-list]');
  if (!container || !claims || claims.length === 0) return;
  var html = claims.slice(0, 5).map(function (claim) {
    return "\n    <div class=\"claim-item\" data-claim-id=\"".concat(claim.id, "\">\n      <div class=\"claim-info\">\n        <h4>Claim #").concat(claim.claim_number, "</h4>\n        <p>").concat(claim.description || 'Sin descripción', "</p>\n        <div class=\"claim-meta\">\n          <span class=\"badge badge-").concat(getClaimStatusColor(claim.status), "\">\n            ").concat(getClaimStatusLabel(claim.status), "\n          </span>\n          <span>$").concat(parseFloat(claim.claim_amount).toFixed(2), "</span>\n        </div>\n      </div>\n    </div>\n  ");
  }).join('');
  container.innerHTML = html;
}
function updateAgentStats(stats) {
  if (!stats) return;

  // Update stat cards
  var statsMap = {
    'stat-clients': stats.total_clients || 0,
    'stat-policies': stats.active_policies || 0,
    'stat-claims': stats.pending_claims || 0,
    'stat-quotes': stats.new_quotes || 0
  };
  Object.entries(statsMap).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    var element = document.querySelector("[data-".concat(key, "]"));
    if (element) {
      element.textContent = value;
    }
  });
}

// ============================================
// RENDERERS - CLIENT
// ============================================

function updateClientStats(stats) {
  if (!stats) return;

  // Update stat cards with real data from backend
  var statsSelectors = {
    '[data-stat-policies]': stats.active_policies || 0,
    '[data-stat-claims]': stats.pending_claims || 0,
    '[data-stat-payments]': stats.payment_status || 'current',
    '[data-next-payment]': stats.next_payment_date ? new Date(stats.next_payment_date).toLocaleDateString() : 'N/A',
    '[data-total-monthly]': stats.total_monthly ? "$".concat(parseFloat(stats.total_monthly).toFixed(2)) : '$0.00'
  };
  Object.entries(statsSelectors).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      selector = _ref4[0],
      value = _ref4[1];
    var element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  });
  console.log('✅ Client stats updated:', stats);
}
function renderClientPolicies(policies) {
  var container = document.querySelector('.policies-list');
  if (!container || !policies || policies.length === 0) {
    container.innerHTML = '<p class="empty-state">No tienes pólizas activas</p>';
    return;
  }
  var policyIcons = {
    'auto': '🚗',
    'home': '🏠',
    'life': '❤️',
    'health': '💼',
    'business': '🏢',
    'other': '📄'
  };
  var html = policies.map(function (policy) {
    return "\n    <div class=\"policy-item\" data-policy-id=\"".concat(policy.id, "\">\n      <div class=\"policy-icon\">").concat(policyIcons[policy.policy_type] || '📄', "</div>\n      <div class=\"policy-info\">\n        <h4>Seguro de ").concat(getPolicyTypeName(policy.policy_type), "</h4>\n        <p>P\xF3liza #").concat(policy.policy_number, "</p>\n        <div class=\"policy-meta\">\n          <span class=\"badge badge-").concat(policy.status === 'active' ? 'success' : 'warning', "\">\n            ").concat(policy.status, "\n          </span>\n          <span>Vence: ").concat(new Date(policy.end_date || policy.renewal_date).toLocaleDateString(), "</span>\n        </div>\n      </div>\n      <div class=\"policy-actions\">\n        <button class=\"btn btn-sm btn-outline\" onclick=\"window.appHandlers.viewPolicy('").concat(policy.id, "')\">\n          Ver Detalles\n        </button>\n      </div>\n    </div>\n  ");
  }).join('');
  container.innerHTML = html;
}
function renderClientClaims(claims) {
  var container = document.querySelector('[data-client-claims-list]');
  if (!container) return;
  if (!claims || claims.length === 0) {
    container.innerHTML = '<p class="empty-state">No tienes reclamaciones</p>';
    return;
  }
  var html = claims.map(function (claim) {
    return "\n    <div class=\"claim-item\" data-claim-id=\"".concat(claim.id, "\">\n      <div class=\"claim-info\">\n        <h4>Reclamaci\xF3n #").concat(claim.claim_number, "</h4>\n        <p>").concat(claim.description || 'Sin descripción', "</p>\n        <div class=\"claim-meta\">\n          <span class=\"badge badge-").concat(getClaimStatusColor(claim.status), "\">\n            ").concat(getClaimStatusLabel(claim.status), "\n          </span>\n          <span>Monto: $").concat(parseFloat(claim.claim_amount).toFixed(2), "</span>\n        </div>\n      </div>\n    </div>\n  ");
  }).join('');
  container.innerHTML = html;
}
function renderPaymentHistory(payments) {
  var container = document.querySelector('[data-payment-history]');
  if (!container) return;
  if (!payments || payments.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay historial de pagos</p>';
    return;
  }
  var html = payments.slice(0, 10).map(function (payment) {
    return "\n    <div class=\"payment-item\" data-payment-id=\"".concat(payment.id, "\">\n      <div class=\"payment-info\">\n        <p class=\"payment-date\">").concat(new Date(payment.payment_date).toLocaleDateString(), "</p>\n        <p class=\"payment-amount\">$").concat(parseFloat(payment.amount).toFixed(2), "</p>\n        <span class=\"badge badge-").concat(payment.status === 'completed' ? 'success' : 'warning', "\">\n          ").concat(payment.status, "\n        </span>\n      </div>\n    </div>\n  ");
  }).join('');
  container.innerHTML = html;
}

// ============================================
// RENDERERS - ADMIN
// ============================================

function updateAdminStats(stats) {
  if (!stats) return;

  // Update admin stat cards with real data
  var statsSelectors = {
    '[data-stat-users]': (stats.users_client || 0) + (stats.users_agent || 0) + (stats.users_admin || 0),
    '[data-stat-clients]': stats.users_client || 0,
    '[data-stat-agents]': stats.users_agent || 0,
    '[data-stat-policies]': stats.policies_active || 0,
    '[data-stat-claims]': stats.pending_claims || 0,
    '[data-stat-revenue]': stats.monthly_revenue ? "$".concat(parseFloat(stats.monthly_revenue).toLocaleString()) : '$0'
  };
  Object.entries(statsSelectors).forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      selector = _ref6[0],
      value = _ref6[1];
    var element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  });
  console.log('✅ Admin stats updated:', stats);
}
function renderAdminActivity(activities) {
  var container = document.querySelector('[data-admin-activity]');
  if (!container) return;
  if (!activities || activities.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay actividad reciente</p>';
    return;
  }
  var html = activities.map(function (activity) {
    var icon = activity.type === 'policy' ? '📄' : '🔔';
    var date = new Date(activity.timestamp).toLocaleDateString();
    return "\n        <div class=\"activity-item\">\n            <div class=\"activity-icon\">".concat(icon, "</div>\n            <div class=\"activity-info\">\n                <p><strong>").concat(activity.user_name, "</strong> ").concat(activity.type === 'policy' ? 'creó una póliza' : 'presentó un reclamo', "</p>\n                <p class=\"activity-meta\">").concat(activity.type === 'policy' ? activity.policy_type : activity.claim_type, " - ").concat(activity.status, "</p>\n                <span class=\"activity-date\">").concat(date, "</span>\n            </div>\n        </div>\n        ");
  }).join('');
  container.innerHTML = html;
}

// ============================================
// HELPERS
// ============================================

function getClaimStatusColor(status) {
  var colors = {
    'submitted': 'primary',
    'under_review': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'paid': 'success'
  };
  return colors[status] || 'secondary';
}
function getClaimStatusLabel(status) {
  var labels = {
    'submitted': 'Enviado',
    'under_review': 'En Revisión',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'paid': 'Pagado'
  };
  return labels[status] || status;
}
function getPolicyTypeName(type) {
  var names = {
    'auto': 'Auto',
    'home': 'Hogar',
    'life': 'Vida',
    'health': 'Salud',
    'business': 'Comercial',
    'other': 'Otro'
  };
  return names[type] || type;
}

/***/ })

}]);
//# sourceMappingURL=src_modules_dashboardLoaders_js.krause.app.js.map