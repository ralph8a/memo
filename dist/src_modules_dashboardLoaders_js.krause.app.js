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
    var dashboardData, _yield$import, AgentDashboardManager, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          console.log('🔄 loadAgentDashboard() called');
          _context.p = 1;
          // Update user name in header first
          updateUserNameInHeader();
          console.log('📡 Requesting agent dashboard data from API...');
          // Load dashboard data from backend
          _context.n = 2;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.AGENT_DASHBOARD, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 2:
          dashboardData = _context.v;
          console.log('📊 Agent dashboard data received:', dashboardData);

          // Update UI with real data
          if (dashboardData.stats) {
            console.log('Updating agent stats...');
            updateAgentStats(dashboardData.stats);
          }
          if (dashboardData.clients) {
            console.log('Rendering agent clients...');
            renderAgentClients(dashboardData.clients);
          }
          if (dashboardData.claims) {
            console.log('Rendering agent claims...');
            renderAgentClaims(dashboardData.claims);
          }

          // Load recent clients in sidebar
          console.log('🔄 Loading recent clients for sidebar...');
          _context.n = 3;
          return loadAgentRecentClients()["catch"](function (err) {
            return console.error('❌ Error loading recent clients:', err);
          });
        case 3:
          // Initialize Agent Dashboard Manager for payment/policy panels
          console.log('🔄 Initializing Agent Dashboard Manager...');
          _context.p = 4;
          _context.n = 5;
          return __webpack_require__.e(/*! import() */ "src_modules_agentDashboardComponents_js").then(__webpack_require__.bind(__webpack_require__, /*! ./agentDashboardComponents.js */ "./src/modules/agentDashboardComponents.js"));
        case 5:
          _yield$import = _context.v;
          AgentDashboardManager = _yield$import.AgentDashboardManager;
          if (window.agentDashboard) {
            _context.n = 7;
            break;
          }
          window.agentDashboard = new AgentDashboardManager();
          _context.n = 6;
          return window.agentDashboard.initialize();
        case 6:
          console.log('✅ Agent Dashboard Manager initialized');
        case 7:
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t = _context.v;
          console.error('❌ Error initializing Agent Dashboard Manager:', _t);
        case 9:
          // Load dynamic chart data for agent dashboard
          loadPolicyHealthStats()["catch"](function (err) {
            return console.error('Error loading policy health:', err);
          });
          loadPaymentTrends()["catch"](function (err) {
            return console.error('Error loading payment trends:', err);
          });
          console.log('✅ Agent dashboard loaded with real data');
          return _context.a(2, dashboardData);
        case 10:
          _context.p = 10;
          _t2 = _context.v;
          console.error('❌ Error loading agent dashboard:', _t2);
          (0,_notifications_js__WEBPACK_IMPORTED_MODULE_1__.showNotification)('Error al cargar datos del dashboard', _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.NOTIFICATION_TYPES.ERROR);
          throw _t2;
        case 11:
          return _context.a(2);
      }
    }, _callee, null, [[4, 8], [1, 10]]);
  }));
  return _loadAgentDashboard.apply(this, arguments);
}
function loadAgentClients() {
  return _loadAgentClients.apply(this, arguments);
}
function _loadAgentClients() {
  _loadAgentClients = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var clients, _t3;
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
          _t3 = _context2.v;
          console.error('Error loading clients:', _t3);
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
    var data, _t4;
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
          _t4 = _context3.v;
          console.error('Error loading client details:', _t4);
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
    var quotes, _t5;
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
          _t5 = _context4.v;
          console.error('Error loading quotes:', _t5);
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
    var dashboardData, _yield$Promise$all, _yield$Promise$all2, policies, claims, payments, _t6;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          console.log('🔄 loadClientDashboard() called');
          _context5.p = 1;
          // Update user name in header first
          updateUserNameInHeader();
          console.log('📡 Requesting client dashboard data from API...');
          // Load dashboard data from backend
          _context5.n = 2;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 2:
          dashboardData = _context5.v;
          console.log('📊 Client dashboard data received:', dashboardData);

          // Load additional data in parallel
          console.log('📡 Loading policies, claims, and payments...');
          _context5.n = 3;
          return Promise.all([loadClientPolicies(), loadClientClaims(), loadPaymentHistory()]);
        case 3:
          _yield$Promise$all = _context5.v;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 3);
          policies = _yield$Promise$all2[0];
          claims = _yield$Promise$all2[1];
          payments = _yield$Promise$all2[2];
          console.log('📊 Data loaded - Policies:', policies === null || policies === void 0 ? void 0 : policies.length, 'Claims:', claims === null || claims === void 0 ? void 0 : claims.length, 'Payments:', payments === null || payments === void 0 ? void 0 : payments.length);

          // Update stats from dashboard data
          if (dashboardData.stats) {
            console.log('Updating client stats...');
            updateClientStats(dashboardData.stats);
          }

          // Render lists
          if (policies) {
            console.log('Rendering policies...');
            renderClientPolicies(policies);
          }
          if (claims) {
            console.log('Rendering claims...');
            renderClientClaims(claims);
          }
          if (payments) {
            console.log('Rendering payment history...');
            renderPaymentHistory(payments);
          }

          // Load client contacts from backend
          loadClientContacts()["catch"](function (err) {
            return console.error('Error loading contacts:', err);
          });

          // Initialize payment calendar
          console.log('🔄 Initializing payment calendar...');
          if (typeof window.initPaymentCalendar === 'function') {
            window.initPaymentCalendar();
          } else {
            // Dynamic import if not available
            Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./paymentCalendar.js */ "./src/modules/paymentCalendar.js")).then(function (_ref7) {
              var initPaymentCalendar = _ref7.initPaymentCalendar;
              if (initPaymentCalendar) initPaymentCalendar();
            })["catch"](function (e) {
              return console.error('Failed to load payment calendar:', e);
            });
          }

          // Load dynamic chart data
          loadPolicyHealthStats()["catch"](function (err) {
            return console.error('Error loading policy health:', err);
          });
          loadPaymentTrends()["catch"](function (err) {
            return console.error('Error loading payment trends:', err);
          });
          loadPendingActions()["catch"](function (err) {
            return console.error('Error loading pending actions:', err);
          });
          console.log('✅ Client dashboard loaded with real data');
          return _context5.a(2, {
            dashboardData: dashboardData,
            policies: policies,
            claims: claims,
            payments: payments
          });
        case 4:
          _context5.p = 4;
          _t6 = _context5.v;
          console.error('❌ Error loading client dashboard:', _t6);
          (0,_notifications_js__WEBPACK_IMPORTED_MODULE_1__.showNotification)('Error al cargar datos del dashboard', _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.NOTIFICATION_TYPES.ERROR);
          throw _t6;
        case 5:
          return _context5.a(2);
      }
    }, _callee5, null, [[1, 4]]);
  }));
  return _loadClientDashboard.apply(this, arguments);
}
function loadClientPolicies() {
  return _loadClientPolicies.apply(this, arguments);
}
function _loadClientPolicies() {
  _loadClientPolicies = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var policies, _t7;
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
          _t7 = _context6.v;
          console.error('Error loading policies:', _t7);
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
    var payments, _t8;
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
          _t8 = _context7.v;
          console.error('Error loading payment history:', _t8);
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
    var dashboardData, _t9;
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
          _t9 = _context8.v;
          console.error('Error loading admin dashboard:', _t9);
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
    var claims, _t0;
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
          _t0 = _context9.v;
          console.error('Error loading claims:', _t0);
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
    var stats, _t1;
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
          _t1 = _context0.v;
          console.error('Error loading dashboard stats:', _t1);
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
    var isAssigned = client.is_assigned || client.assigned_policies > 0;
    var assignedBadge = isAssigned ? '<span class="badge badge-primary" style="margin-left: 8px;">Asignado</span>' : '';
    var policyCount = client.policy_count || 0;
    var policyInfo = policyCount > 0 ? "<span>".concat(policyCount, " p\xF3liza").concat(policyCount !== 1 ? 's' : '', "</span>") : '<span class="text-muted">Sin pólizas</span>';
    return "\n        <div class=\"client-item ".concat(isAssigned ? 'client-assigned' : '', "\" data-client-id=\"").concat(client.id, "\">\n          <div class=\"client-info\">\n            <h4>\n              ").concat(client.first_name, " ").concat(client.last_name, "\n              ").concat(assignedBadge, "\n            </h4>\n            <p>").concat(client.email, "</p>\n            <div class=\"client-meta\">\n              <span class=\"badge badge-").concat(client.status === 'active' ? 'success' : 'warning', "\">\n                ").concat(client.status, "\n              </span>\n              ").concat(policyInfo, "\n              <span>Desde: ").concat(new Date(client.created_at).toLocaleDateString(), "</span>\n            </div>\n          </div>\n          <div class=\"client-actions\">\n            <button class=\"btn btn-sm btn-outline\" onclick=\"window.appHandlers.viewClientDetails('").concat(client.id, "')\">\n              Ver Detalles\n            </button>\n          </div>\n        </div>\n      ");
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
  if (!container) return;
  if (!policies || policies.length === 0) {
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

  // Normaliza claves del backend (type vs policy_type)
  var html = policies.map(function (policy) {
    var policyType = policy.policy_type || policy.type || 'other';
    var endDate = policy.end_date || policy.renewal_date;
    var status = (policy.status || 'active').toLowerCase();
    return "\n                <div class=\"policy-item\" data-policy-id=\"".concat(policy.id, "\" data-policy-number=\"").concat(policy.policy_number, "\">\n                    <div class=\"policy-icon\">").concat(policyIcons[policyType] || '📄', "</div>\n                    <div class=\"policy-info\">\n                        <h4>Seguro de ").concat(getPolicyTypeName(policyType), "</h4>\n                        <p>P\xF3liza #").concat(policy.policy_number, "</p>\n                        <div class=\"policy-meta\">\n                            <span class=\"badge badge-").concat(status === 'active' ? 'success' : status === 'expired' ? 'danger' : 'warning', "\">\n                                ").concat(status, "\n                            </span>\n                            <span>").concat(endDate ? 'Vence: ' + new Date(endDate).toLocaleDateString() : '', "</span>\n                        </div>\n                    </div>\n                    <div class=\"policy-actions\">\n                        <button class=\"btn btn-sm btn-outline\" data-action=\"view-policy\" data-policy-id=\"").concat(policy.id, "\">\n                            Ver Detalles\n                        </button>\n                    </div>\n                </div>");
  }).join('');
  container.innerHTML = html;

  // Bind clicks a cada póliza
  container.querySelectorAll('[data-action="view-policy"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var _window$appHandlers;
      var policyId = e.currentTarget.dataset.policyId;
      if ((_window$appHandlers = window.appHandlers) !== null && _window$appHandlers !== void 0 && _window$appHandlers.viewPolicy) {
        window.appHandlers.viewPolicy(policyId);
      }
    });
  });

  // Permitir click en todo el item
  container.querySelectorAll('.policy-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      var _window$appHandlers2;
      if (e.target.closest('button')) return;
      var policyId = item.dataset.policyId;
      if ((_window$appHandlers2 = window.appHandlers) !== null && _window$appHandlers2 !== void 0 && _window$appHandlers2.viewPolicy) {
        window.appHandlers.viewPolicy(policyId);
      }
    });
  });
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
    return "\n    <div class=\"payment-item\" data-payment-id=\"".concat(payment.id, "\">\n      <div class=\"payment-info\">\n                <p class=\"payment-date\">").concat(new Date(payment.payment_date || payment.date).toLocaleDateString(), "</p>\n        <p class=\"payment-amount\">$").concat(parseFloat(payment.amount).toFixed(2), "</p>\n        <span class=\"badge badge-").concat(payment.status === 'completed' ? 'success' : 'warning', "\">\n          ").concat(payment.status, "\n        </span>\n      </div>\n    </div>\n  ");
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

/**
 * Load client contacts - agents assigned to client's policies
 */
function loadClientContacts() {
  return _loadClientContacts.apply(this, arguments);
}
/**
 * Load recent clients for agent sidebar
 * Fetches clients from AGENT_CLIENTS endpoint and renders them dynamically
 */
function _loadClientContacts() {
  _loadClientContacts = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
    var contacts, _contactChipsContainer, contactChipsContainer, _contactChipsContainer2, _t10;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.p = _context1.n) {
        case 0:
          _context1.p = 0;
          _context1.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.GET_CLIENT_CONTACTS, {
            method: 'GET'
          });
        case 1:
          contacts = _context1.v;
          if (!(!contacts || contacts.length === 0)) {
            _context1.n = 2;
            break;
          }
          console.warn('No contacts found for client');
          _contactChipsContainer = document.querySelector('.contact-chips');
          if (_contactChipsContainer) {
            _contactChipsContainer.innerHTML = "\n                    <div style=\"text-align: center; padding: 20px; color: #999;\">\n                        <p style=\"margin: 0; font-size: 13px;\">No hay contactos asignados</p>\n                    </div>\n                ";
          }
          return _context1.a(2);
        case 2:
          contactChipsContainer = document.querySelector('.contact-chips');
          if (contactChipsContainer) {
            contactChipsContainer.innerHTML = contacts.map(function (contact) {
              return "\n                <button class=\"contact-chip\" \n                    data-name=\"".concat(contact.full_name, "\" \n                    data-phone=\"").concat(contact.phone || 'No disponible', "\" \n                    data-email=\"").concat(contact.email, "\" \n                    data-role=\"").concat(contact.role || 'Agente', "\" \n                    data-policy=\"").concat(contact.policy_types || '—', "\">\n                    ").concat(contact.full_name, "\n                </button>\n            ");
            }).join('');
            if (window.reinitializeContactChips) {
              window.reinitializeContactChips();
            }
          }
          console.log('✅ Client contacts loaded:', contacts.length);
          _context1.n = 4;
          break;
        case 3:
          _context1.p = 3;
          _t10 = _context1.v;
          console.error('Error loading client contacts:', _t10);
          _contactChipsContainer2 = document.querySelector('.contact-chips');
          if (_contactChipsContainer2) {
            _contactChipsContainer2.innerHTML = "\n                <div style=\"text-align: center; padding: 20px; color: #f44;\">\n                    <p style=\"margin: 0; font-size: 13px;\">Error al cargar contactos</p>\n                </div>\n            ";
          }
        case 4:
          return _context1.a(2);
      }
    }, _callee1, null, [[0, 3]]);
  }));
  return _loadClientContacts.apply(this, arguments);
}
function loadAgentRecentClients() {
  return _loadAgentRecentClients.apply(this, arguments);
} // ============================================
// DYNAMIC CHART DATA LOADERS
// ============================================
/**
 * Load policy health statistics for donut chart
 */
function _loadAgentRecentClients() {
  _loadAgentRecentClients = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
    var clientsPillsContainer, clients, recentClients, _t11;
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.p = _context10.n) {
        case 0:
          console.log('🚀 loadAgentRecentClients() STARTED');
          clientsPillsContainer = document.querySelector('.recent-clients-pills');
          console.log('📍 Container found:', !!clientsPillsContainer);
          if (clientsPillsContainer) {
            _context10.n = 1;
            break;
          }
          console.log('⚠️ Recent clients container not found');
          return _context10.a(2);
        case 1:
          _context10.p = 1;
          console.log('📡 Loading recent clients from API...');
          _context10.n = 2;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request(_api_integration_js__WEBPACK_IMPORTED_MODULE_0__.API_CONFIG.ENDPOINTS.AGENT_CLIENTS, {
            method: 'GET'
          }, {
            cacheDuration: _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.cache.CACHE_DURATION.SHORT,
            useCache: true
          });
        case 2:
          clients = _context10.v;
          console.log('📊 Clients received:', (clients === null || clients === void 0 ? void 0 : clients.length) || 0, clients);
          if (!(!clients || clients.length === 0)) {
            _context10.n = 3;
            break;
          }
          console.log('⚠️ No clients to display');
          clientsPillsContainer.innerHTML = "\n                <div style=\"padding: 12px; text-align: center; color: var(--theme-text-secondary); font-size: 0.875rem;\">\n                    No hay clientes asignados\n                </div>\n            ";
          return _context10.a(2);
        case 3:
          // Get only the 5 most recent clients (sorted by most recent policy activity)
          recentClients = clients.sort(function (a, b) {
            return new Date(b.last_policy_update || b.created_at) - new Date(a.last_policy_update || a.created_at);
          }).slice(0, 5); // Render client pills
          clientsPillsContainer.innerHTML = recentClients.map(function (client) {
            var _client$first_name, _client$last_name, _client$last_name2;
            var initials = "".concat(((_client$first_name = client.first_name) === null || _client$first_name === void 0 ? void 0 : _client$first_name[0]) || '').concat(((_client$last_name = client.last_name) === null || _client$last_name === void 0 ? void 0 : _client$last_name[0]) || '').toUpperCase();
            var fullName = "".concat(client.first_name || '', " ").concat(client.last_name || '').trim();
            var shortName = "".concat(client.first_name || '', " ").concat(((_client$last_name2 = client.last_name) === null || _client$last_name2 === void 0 ? void 0 : _client$last_name2[0]) || '', ".").trim();
            return "\n                <button class=\"client-pill\" \n                    onclick=\"window.appHandlers?.viewClientDetails?.('".concat(client.id, "')\">\n                    <span class=\"client-pill-avatar\">").concat(initials, "</span>\n                    <span class=\"client-pill-name\">").concat(shortName, "</span>\n                </button>\n            ");
          }).join('');
          console.log("\u2705 Loaded ".concat(recentClients.length, " recent clients"));
          _context10.n = 5;
          break;
        case 4:
          _context10.p = 4;
          _t11 = _context10.v;
          console.error('❌ Error loading recent clients:', _t11);
          clientsPillsContainer.innerHTML = "\n            <div style=\"padding: 12px; text-align: center; color: var(--theme-text-secondary);\">\n                <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"margin-bottom: 8px;\">\n                    <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n                    <line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/>\n                    <line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/>\n                </svg>\n                <div style=\"font-size: 0.875rem;\">Error al cargar clientes</div>\n            </div>\n        ";
        case 5:
          return _context10.a(2);
      }
    }, _callee10, null, [[1, 4]]);
  }));
  return _loadAgentRecentClients.apply(this, arguments);
}
function loadPolicyHealthStats() {
  return _loadPolicyHealthStats.apply(this, arguments);
}
/**
 * Render policy health donut chart with real data
 */
function _loadPolicyHealthStats() {
  _loadPolicyHealthStats = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
    var data, _t12;
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.p = _context11.n) {
        case 0:
          _context11.p = 0;
          _context11.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request('?action=policy_health_stats', {
            method: 'GET'
          });
        case 1:
          data = _context11.v;
          if (data.success && data.stats) {
            renderPolicyHealthChart(data.stats);
          }
          _context11.n = 3;
          break;
        case 2:
          _context11.p = 2;
          _t12 = _context11.v;
          console.error('Error loading policy health stats:', _t12);
        case 3:
          return _context11.a(2);
      }
    }, _callee11, null, [[0, 2]]);
  }));
  return _loadPolicyHealthStats.apply(this, arguments);
}
function renderPolicyHealthChart(stats) {
  // Update the monitor text in client dashboard
  var monitors = document.querySelectorAll('.chart-card');
  monitors.forEach(function (card) {
    var title = card.querySelector('.chart-title');
    if (title !== null && title !== void 0 && title.textContent.includes('Salud de pólizas')) {
      // Update legend with real percentages
      var legend = card.querySelector('.chart-legend');
      if (legend) {
        legend.innerHTML = "\n                    <span class=\"chart-legend-item\">\n                        <span class=\"chart-legend-dot\" style=\"background: #38ef7d; box-shadow: 0 0 0 4px rgba(56, 239, 125, 0.12);\"></span> \n                        Activas (".concat(stats.active_percent, "%)\n                    </span>\n                    <span class=\"chart-legend-item\">\n                        <span class=\"chart-legend-dot\" style=\"background: #f5576c; box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.12);\"></span> \n                        Riesgo (").concat(stats.risk_percent, "%)\n                    </span>\n                ");
      }

      // You can also update a visual chart here if implementing canvas/svg donut
      console.log('✅ Policy health chart updated:', stats);
    }
  });
}

/**
 * Load payment trends for sparkline chart
 */
function loadPaymentTrends() {
  return _loadPaymentTrends.apply(this, arguments);
}
/**
 * Render payment trends chart with real data
 */
function _loadPaymentTrends() {
  _loadPaymentTrends = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
    var data, _t13;
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.p = _context12.n) {
        case 0:
          _context12.p = 0;
          _context12.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request('?action=payment_trends', {
            method: 'GET'
          });
        case 1:
          data = _context12.v;
          if (data.success) {
            renderPaymentTrendsChart(data.trends, data.summary);
          }
          _context12.n = 3;
          break;
        case 2:
          _context12.p = 2;
          _t13 = _context12.v;
          console.error('Error loading payment trends:', _t13);
        case 3:
          return _context12.a(2);
      }
    }, _callee12, null, [[0, 2]]);
  }));
  return _loadPaymentTrends.apply(this, arguments);
}
function renderPaymentTrendsChart(trends, summary) {
  var chartCards = document.querySelectorAll('.chart-card');
  chartCards.forEach(function (card) {
    var title = card.querySelector('.chart-title');
    if (title !== null && title !== void 0 && title.textContent.includes('Tendencia de pagos')) {
      // Update metrics with real data
      var metrics = card.querySelector('.chart-metrics');
      if (metrics) {
        metrics.innerHTML = "\n                    <div class=\"chart-metric\">\n                        <span class=\"label\">Total pagos</span>\n                        <span class=\"value\">".concat(summary.total_payments, "</span>\n                    </div>\n                    <div class=\"chart-metric\">\n                        <span class=\"label\">Pagos puntuales</span>\n                        <span class=\"value\">").concat(summary.on_time, "</span>\n                    </div>\n                    <div class=\"chart-metric\">\n                        <span class=\"label\">Retrasos</span>\n                        <span class=\"value\">").concat(summary.late, "</span>\n                    </div>\n                ");
      }

      // Update legend
      var legend = card.querySelector('.chart-legend');
      if (legend) {
        legend.innerHTML = "\n                    <span class=\"chart-legend-item\"><span class=\"chart-legend-dot\"></span> Pagos</span>\n                    <span class=\"chart-legend-item\" style=\"color: var(--theme-accent-color);\">\n                        ".concat(summary.on_time_rate, "% puntualidad\n                    </span>\n                ");
      }
      console.log('✅ Payment trends chart updated:', summary);
    }
  });
}

/**
 * Load pending actions/tasks
 */
function loadPendingActions() {
  return _loadPendingActions.apply(this, arguments);
}
/**
 * Render pending actions list
 */
function _loadPendingActions() {
  _loadPendingActions = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13() {
    var data, _t14;
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.p = _context13.n) {
        case 0:
          _context13.p = 0;
          _context13.n = 1;
          return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request('?action=pending_actions', {
            method: 'GET'
          });
        case 1:
          data = _context13.v;
          if (data.success && data.actions) {
            renderPendingActions(data.actions);
          }
          _context13.n = 3;
          break;
        case 2:
          _context13.p = 2;
          _t14 = _context13.v;
          console.error('Error loading pending actions:', _t14);
        case 3:
          return _context13.a(2);
      }
    }, _callee13, null, [[0, 2]]);
  }));
  return _loadPendingActions.apply(this, arguments);
}
function renderPendingActions(actions) {
  // Find pending actions container (could be in sidebar or main area)
  var containers = document.querySelectorAll('[data-pending-actions], .pending-actions-list');

  // Update count badge
  var countBadges = document.querySelectorAll('[data-actions-count]');
  countBadges.forEach(function (badge) {
    badge.textContent = actions.length;
  });
  if (actions.length === 0) {
    containers.forEach(function (container) {
      container.innerHTML = "\n                <div style=\"padding: 20px; text-align: center; color: var(--theme-text-secondary);\">\n                    <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"margin-bottom: 8px; opacity: 0.5;\">\n                        <polyline points=\"20 6 9 17 4 12\"/>\n                    </svg>\n                    <p style=\"margin: 0; font-size: 0.875rem;\">No hay acciones pendientes</p>\n                </div>\n            ";
    });
    return;
  }
  var html = actions.map(function (action) {
    var daysUntil = action.days_until;
    var urgencyClass = daysUntil < 3 ? 'urgent' : daysUntil < 7 ? 'warning' : 'info';
    var daysText = daysUntil < 0 ? "Vencido hace ".concat(Math.abs(daysUntil), "d") : daysUntil === 0 ? 'Hoy' : "En ".concat(daysUntil, "d");
    return "\n            <div class=\"pending-action-item ".concat(urgencyClass, "\" style=\"padding: 10px; border-left: 3px solid ").concat(daysUntil < 3 ? '#f5576c' : daysUntil < 7 ? '#ffa726' : 'var(--theme-accent-color)', "; margin-bottom: 8px; background: var(--theme-surface-variant); border-radius: 6px;\">\n                <div style=\"display: flex; align-items: start; gap: 10px;\">\n                    <div style=\"flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: ").concat(daysUntil < 3 ? '#f5576c' : daysUntil < 7 ? '#ffa726' : 'var(--theme-accent-color)', ";\">\n                        <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                            ").concat(action.action.includes('Pago') ? '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' : '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', "\n                        </svg>\n                    </div>\n                    <div style=\"flex: 1; min-width: 0;\">\n                        <div style=\"font-weight: 600; font-size: 0.875rem; margin-bottom: 2px;\">").concat(action.action, "</div>\n                        <div style=\"font-size: 0.8125rem; color: var(--theme-text-secondary); margin-bottom: 4px;\">").concat(action.policy_number, "</div>\n                        <div style=\"font-size: 0.75rem; font-weight: 600; color: ").concat(daysUntil < 3 ? '#f5576c' : daysUntil < 7 ? '#ffa726' : 'var(--theme-text-secondary)', ";\">").concat(daysText, "</div>\n                    </div>\n                </div>\n            </div>\n        ");
  }).join('');
  containers.forEach(function (container) {
    container.innerHTML = html;
  });
  console.log("\u2705 Rendered ".concat(actions.length, " pending actions"));
}

/***/ })

}]);
//# sourceMappingURL=src_modules_dashboardLoaders_js.krause.app.js.map