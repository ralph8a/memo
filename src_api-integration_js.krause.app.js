"use strict";
(self["webpackChunkreact_app"] = self["webpackChunkreact_app"] || []).push([["src_api-integration_js"],{

/***/ "./src/api-integration.js":
/*!********************************!*\
  !*** ./src/api-integration.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APIService: () => (/* binding */ APIService),
/* harmony export */   API_CONFIG: () => (/* binding */ API_CONFIG),
/* harmony export */   apiService: () => (/* binding */ apiService),
/* harmony export */   downloadPaymentReceipt: () => (/* binding */ downloadPaymentReceipt),
/* harmony export */   getAdminActivity: () => (/* binding */ getAdminActivity),
/* harmony export */   getAdminDashboardData: () => (/* binding */ getAdminDashboardData),
/* harmony export */   getAdminStats: () => (/* binding */ getAdminStats),
/* harmony export */   getAgentClients: () => (/* binding */ getAgentClients),
/* harmony export */   getAgentDashboardData: () => (/* binding */ getAgentDashboardData),
/* harmony export */   getAgentStats: () => (/* binding */ getAgentStats),
/* harmony export */   getClientClaims: () => (/* binding */ getClientClaims),
/* harmony export */   getClientDashboardData: () => (/* binding */ getClientDashboardData),
/* harmony export */   getClientDocuments: () => (/* binding */ getClientDocuments),
/* harmony export */   getClientPayments: () => (/* binding */ getClientPayments),
/* harmony export */   getClientPolicies: () => (/* binding */ getClientPolicies),
/* harmony export */   getUserPolicies: () => (/* binding */ getUserPolicies),
/* harmony export */   loginUser: () => (/* binding */ loginUser),
/* harmony export */   logoutUser: () => (/* binding */ logoutUser),
/* harmony export */   uploadClaimDocument: () => (/* binding */ uploadClaimDocument)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// API Integration Layer for Krause Insurance
// GoDaddy Server + Database Integration

// API Configuration
var API_CONFIG = {
  // Update these URLs when deploying to GoDaddy
  BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost/backend' : window.location.protocol + '//' + window.location.hostname + '/backend',
  ENDPOINTS: {
    // Authentication
    LOGIN: '?action=login',
    LOGOUT: '?action=logout',
    VERIFY_TOKEN: '?action=verify_token',
    // User Management
    GET_USER_PROFILE: '?action=user_profile',
    UPDATE_USER_PROFILE: '?action=update_profile',
    GET_USER_POLICIES: '?action=user_policies',
    // Policies
    GET_POLICIES: '?action=policies',
    GET_POLICY_DETAILS: '?action=policy_details',
    CREATE_POLICY: '?action=create_policy',
    UPDATE_POLICY: '?action=update_policy',
    // Claims
    GET_CLAIMS: '?action=claims',
    GET_USER_CLAIMS: '?action=user_claims',
    CREATE_CLAIM: '?action=submit_claim',
    GET_CLAIM_DETAILS: '?action=claim_details',
    UPLOAD_CLAIM_DOCUMENT: '?action=upload_claim_doc',
    ASSIGN_CLAIM: '?action=assign_claim',
    // Payments
    GET_PAYMENT_HISTORY: '?action=payment_history',
    PROCESS_PAYMENT: '?action=process_payment',
    DOWNLOAD_RECEIPT: '?action=download_receipt',
    // Documents
    UPLOAD_DOCUMENT: '?action=upload_document',
    DOWNLOAD_DOCUMENT: '?action=download_document',
    LIST_DOCUMENTS: '?action=recent_documents',
    DELETE_DOCUMENT: '?action=delete_document',
    // Quotes
    REQUEST_QUOTE: '?action=submit_quote',
    GET_QUOTES: '?action=quotes',
    // Dashboard Endpoints
    CLIENT_DASHBOARD: '?action=client_dashboard',
    CLIENT_PAYMENTS: '?action=payment_history',
    CLIENT_POLICIES: '?action=user_policies',
    CLIENT_CLAIMS: '?action=user_claims',
    CLIENT_DOCUMENTS: '?action=recent_documents',
    AGENT_DASHBOARD: '?action=agent_dashboard',
    AGENT_CLIENTS: '?action=agent_clients',
    AGENT_STATS: '?action=agent_stats',
    ADMIN_DASHBOARD: '?action=admin_dashboard',
    ADMIN_STATS: '?action=admin_stats',
    ADMIN_ACTIVITY: '?action=system_activity',
    // Questionnaires / Roadmap
    GET_QUESTIONNAIRES: '/questionnaires',
    SEND_QUESTIONNAIRE: '/questionnaires/send',
    RESEND_QUESTIONNAIRE: '/questionnaires/:id/resend',
    COMPLETE_QUESTIONNAIRE: '/questionnaires/:id/complete',
    GET_ROADMAP: '/agents/clients/:id/roadmap',
    // Notifications
    SEND_NOTIFICATION: '/notifications/email',
    // Agents (for agent portal)
    GET_CLIENTS: '/agents/clients',
    GET_CLIENT_DETAILS: '/agents/clients/:id',
    UPDATE_CLIENT: '/agents/clients/:id',
    // Analytics
    GET_DASHBOARD_STATS: '/analytics/dashboard',
    GET_AGENT_PERFORMANCE: '/analytics/agent/:id'
  }
};

// API Service with caching
var APIService = /*#__PURE__*/function () {
  function APIService() {
    _classCallCheck(this, APIService);
    this.cache = window.cacheManager || new CacheManager();
    this.fileManager = window.fileManager || new FileManager();
  }

  // Build full URL
  return _createClass(APIService, [{
    key: "buildUrl",
    value: function buildUrl(endpoint) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var url = API_CONFIG.BASE_URL + endpoint;

      // Replace path parameters
      Object.keys(params).forEach(function (key) {
        url = url.replace(":".concat(key), params[key]);
      });
      return url;
    }

    // Make API request with caching
  }, {
    key: "request",
    value: function () {
      var _request = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(endpoint) {
        var options,
          cacheOptions,
          _options$method,
          method,
          _options$body,
          body,
          _options$headers,
          headers,
          _options$params,
          params,
          _options$queryParams,
          queryParams,
          _cacheOptions$useCach,
          useCache,
          _cacheOptions$cacheDu,
          cacheDuration,
          _cacheOptions$forceRe,
          forceRefresh,
          _cacheOptions$showLoa,
          showLoading,
          url,
          urlObj,
          fullUrl,
          cacheIdentifier,
          userId,
          cached,
          token,
          requestOptions,
          response,
          data,
          _args = arguments,
          _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
              cacheOptions = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
              _options$method = options.method, method = _options$method === void 0 ? 'GET' : _options$method, _options$body = options.body, body = _options$body === void 0 ? null : _options$body, _options$headers = options.headers, headers = _options$headers === void 0 ? {} : _options$headers, _options$params = options.params, params = _options$params === void 0 ? {} : _options$params, _options$queryParams = options.queryParams, queryParams = _options$queryParams === void 0 ? {} : _options$queryParams;
              _cacheOptions$useCach = cacheOptions.useCache, useCache = _cacheOptions$useCach === void 0 ? true : _cacheOptions$useCach, _cacheOptions$cacheDu = cacheOptions.cacheDuration, cacheDuration = _cacheOptions$cacheDu === void 0 ? this.cache.CACHE_DURATION.MEDIUM : _cacheOptions$cacheDu, _cacheOptions$forceRe = cacheOptions.forceRefresh, forceRefresh = _cacheOptions$forceRe === void 0 ? false : _cacheOptions$forceRe, _cacheOptions$showLoa = cacheOptions.showLoading, showLoading = _cacheOptions$showLoa === void 0 ? false : _cacheOptions$showLoa;
              url = this.buildUrl(endpoint, params); // Add query parameters
              urlObj = new URL(url);
              Object.keys(queryParams).forEach(function (key) {
                urlObj.searchParams.append(key, queryParams[key]);
              });
              fullUrl = urlObj.toString(); // Cache identifier
              cacheIdentifier = "api_".concat(method, "_").concat(endpoint, "_").concat(JSON.stringify(params), "_").concat(JSON.stringify(queryParams));
              userId = this.getCurrentUserId(); // Check cache for GET requests
              if (!(method === 'GET' && useCache && !forceRefresh)) {
                _context.n = 1;
                break;
              }
              cached = this.cache.get(cacheIdentifier, userId);
              if (!cached) {
                _context.n = 1;
                break;
              }
              console.log('✅ API Cache hit:', cacheIdentifier);
              return _context.a(2, cached);
            case 1:
              // Show loading if needed
              if (showLoading) {
                this.showLoadingScreen();
              }
              _context.p = 2;
              // Get auth token
              token = this.getAuthToken();
              requestOptions = {
                method: method,
                headers: _objectSpread({
                  'Content-Type': 'application/json',
                  'Authorization': token ? "Bearer ".concat(token) : ''
                }, headers)
              };
              if (body && method !== 'GET') {
                requestOptions.body = JSON.stringify(body);
              }
              _context.n = 3;
              return fetch(fullUrl, requestOptions);
            case 3:
              response = _context.v;
              if (response.ok) {
                _context.n = 4;
                break;
              }
              throw new Error("API Error: ".concat(response.status, " ").concat(response.statusText));
            case 4:
              _context.n = 5;
              return response.json();
            case 5:
              data = _context.v;
              // Cache successful GET requests
              if (method === 'GET' && useCache) {
                this.cache.set(cacheIdentifier, data, cacheDuration, userId);
              }

              // Invalidate related cache on mutations
              if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                this.invalidateRelatedCache(endpoint);
              }
              if (showLoading) {
                this.hideLoadingScreen();
              }
              return _context.a(2, data);
            case 6:
              _context.p = 6;
              _t = _context.v;
              console.error('API Request failed:', _t);
              if (showLoading) {
                this.hideLoadingScreen();
              }
              throw _t;
            case 7:
              return _context.a(2);
          }
        }, _callee, this, [[2, 6]]);
      }));
      function request(_x) {
        return _request.apply(this, arguments);
      }
      return request;
    }() // Invalidate related cache after mutations
  }, {
    key: "invalidateRelatedCache",
    value: function invalidateRelatedCache(endpoint) {
      // Clear cache entries related to this endpoint
      var keys = Object.keys(localStorage);
      keys.forEach(function (key) {
        if (key.includes(endpoint.split('/')[1])) {
          localStorage.removeItem(key);
        }
      });
    }

    // Get current user ID from session
  }, {
    key: "getCurrentUserId",
    value: function getCurrentUserId() {
      try {
        var user = localStorage.getItem('krauser_user');
        if (user) {
          var userData = JSON.parse(user);
          return userData.id || userData.email;
        }
      } catch (error) {
        return null;
      }
      return null;
    }

    // Get auth token
  }, {
    key: "getAuthToken",
    value: function getAuthToken() {
      return localStorage.getItem('auth_token');
    }

    // Set auth token
  }, {
    key: "setAuthToken",
    value: function setAuthToken(token) {
      localStorage.setItem('auth_token', token);
    }

    // Clear auth token
  }, {
    key: "clearAuthToken",
    value: function clearAuthToken() {
      localStorage.removeItem('auth_token');
    }

    // Show loading screen
  }, {
    key: "showLoadingScreen",
    value: function showLoadingScreen() {
      var currentUrl = encodeURIComponent(window.location.href);
      window.location.href = "loading.html?redirect=".concat(currentUrl);
    }

    // Hide loading screen (handled by loading.html)
  }, {
    key: "hideLoadingScreen",
    value: function hideLoadingScreen() {
      // Auto-handled by loading screen
    }

    // Upload file with progress
  }, {
    key: "uploadFile",
    value: function () {
      var _uploadFile = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(endpoint, file, onProgress) {
        var params,
          url,
          result,
          _args2 = arguments,
          _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              params = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {};
              url = this.buildUrl(endpoint, params);
              _context2.p = 1;
              _context2.n = 2;
              return this.fileManager.uploadFile(url, file, function (percent) {
                if (onProgress) onProgress(percent);
              });
            case 2:
              result = _context2.v;
              // Invalidate document cache
              this.invalidateRelatedCache('/documents');
              return _context2.a(2, result);
            case 3:
              _context2.p = 3;
              _t2 = _context2.v;
              console.error('File upload failed:', _t2);
              throw _t2;
            case 4:
              return _context2.a(2);
          }
        }, _callee2, this, [[1, 3]]);
      }));
      function uploadFile(_x2, _x3, _x4) {
        return _uploadFile.apply(this, arguments);
      }
      return uploadFile;
    }() // Download file with progress
  }, {
    key: "downloadFile",
    value: function () {
      var _downloadFile = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(endpoint, filename, onProgress) {
        var params,
          url,
          result,
          _args3 = arguments,
          _t3;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              params = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : {};
              url = this.buildUrl(endpoint, params);
              _context3.p = 1;
              _context3.n = 2;
              return this.fileManager.downloadFile(url, filename, function (percent) {
                if (onProgress) onProgress(percent);
              });
            case 2:
              result = _context3.v;
              return _context3.a(2, result);
            case 3:
              _context3.p = 3;
              _t3 = _context3.v;
              console.error('File download failed:', _t3);
              throw _t3;
            case 4:
              return _context3.a(2);
          }
        }, _callee3, this, [[1, 3]]);
      }));
      function downloadFile(_x5, _x6, _x7) {
        return _downloadFile.apply(this, arguments);
      }
      return downloadFile;
    }()
  }]);
}(); // Initialize and export API Service immediately
var apiService = new APIService();


// Example usage functions for common operations

// Login with caching
function loginUser(_x8, _x9) {
  return _loginUser.apply(this, arguments);
} // Get user policies with caching
function _loginUser() {
  _loginUser = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(email, password) {
    var response, _t4;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          _context4.n = 1;
          return apiService.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: {
              email: email,
              password: password
            }
          }, {
            useCache: false,
            showLoading: true
          });
        case 1:
          response = _context4.v;
          if (response.token) {
            apiService.setAuthToken(response.token);
            apiService.cache.set('user_profile', response.user, apiService.cache.CACHE_DURATION.LONG, response.user.id);
          }
          return _context4.a(2, response);
        case 2:
          _context4.p = 2;
          _t4 = _context4.v;
          throw new Error('Login failed: ' + _t4.message);
        case 3:
          return _context4.a(2);
      }
    }, _callee4, null, [[0, 2]]);
  }));
  return _loginUser.apply(this, arguments);
}
function getUserPolicies() {
  return _getUserPolicies.apply(this, arguments);
} // Upload claim document with progress
function _getUserPolicies() {
  _getUserPolicies = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var forceRefresh,
      policies,
      _args5 = arguments,
      _t5;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          forceRefresh = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : false;
          _context5.p = 1;
          _context5.n = 2;
          return apiService.request(API_CONFIG.ENDPOINTS.GET_USER_POLICIES, {
            method: 'GET'
          }, {
            useCache: true,
            cacheDuration: apiService.cache.CACHE_DURATION.MEDIUM,
            forceRefresh: forceRefresh,
            showLoading: !forceRefresh
          });
        case 2:
          policies = _context5.v;
          return _context5.a(2, policies);
        case 3:
          _context5.p = 3;
          _t5 = _context5.v;
          console.error('Failed to get policies:', _t5);
          return _context5.a(2, []);
      }
    }, _callee5, null, [[1, 3]]);
  }));
  return _getUserPolicies.apply(this, arguments);
}
function uploadClaimDocument(_x0, _x1, _x10) {
  return _uploadClaimDocument.apply(this, arguments);
} // Download payment receipt
function _uploadClaimDocument() {
  _uploadClaimDocument = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(claimId, file, onProgress) {
    var result, _t6;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          _context6.n = 1;
          return apiService.uploadFile(API_CONFIG.ENDPOINTS.UPLOAD_CLAIM_DOCUMENT, file, onProgress, {
            id: claimId
          });
        case 1:
          result = _context6.v;
          return _context6.a(2, result);
        case 2:
          _context6.p = 2;
          _t6 = _context6.v;
          throw new Error('Document upload failed: ' + _t6.message);
        case 3:
          return _context6.a(2);
      }
    }, _callee6, null, [[0, 2]]);
  }));
  return _uploadClaimDocument.apply(this, arguments);
}
function downloadPaymentReceipt(_x11, _x12) {
  return _downloadPaymentReceipt.apply(this, arguments);
} // Clear user cache on logout
function _downloadPaymentReceipt() {
  _downloadPaymentReceipt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(paymentId, onProgress) {
    var filename, result, _t7;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          _context7.p = 0;
          filename = "recibo_pago_".concat(paymentId, ".pdf");
          _context7.n = 1;
          return apiService.downloadFile(API_CONFIG.ENDPOINTS.DOWNLOAD_RECEIPT, filename, onProgress, {
            id: paymentId
          });
        case 1:
          result = _context7.v;
          return _context7.a(2, result);
        case 2:
          _context7.p = 2;
          _t7 = _context7.v;
          throw new Error('Receipt download failed: ' + _t7.message);
        case 3:
          return _context7.a(2);
      }
    }, _callee7, null, [[0, 2]]);
  }));
  return _downloadPaymentReceipt.apply(this, arguments);
}
function logoutUser() {
  var userId = apiService.getCurrentUserId();
  if (userId) {
    apiService.cache.clearUserCache(userId);
  }
  apiService.clearAuthToken();
  localStorage.removeItem('krauser_user');
}

// ===== DASHBOARD DATA FETCHERS =====

/**
 * CLIENT DASHBOARD
 */
function getClientDashboardData() {
  return _getClientDashboardData.apply(this, arguments);
}
function _getClientDashboardData() {
  _getClientDashboardData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
    var clientId,
      endpoint,
      _args8 = arguments,
      _t8;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          clientId = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : null;
          _context8.p = 1;
          endpoint = clientId ? "".concat(API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD, "/").concat(clientId) : API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD;
          _context8.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context8.a(2, _context8.v);
        case 3:
          _context8.p = 3;
          _t8 = _context8.v;
          console.error('Failed to load client dashboard:', _t8);
          throw _t8;
        case 4:
          return _context8.a(2);
      }
    }, _callee8, null, [[1, 3]]);
  }));
  return _getClientDashboardData.apply(this, arguments);
}
function getClientPayments() {
  return _getClientPayments.apply(this, arguments);
}
function _getClientPayments() {
  _getClientPayments = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    var clientId,
      endpoint,
      _args9 = arguments,
      _t9;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.p = _context9.n) {
        case 0:
          clientId = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : null;
          _context9.p = 1;
          endpoint = clientId ? "".concat(API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS, "/").concat(clientId) : API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS;
          _context9.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context9.a(2, _context9.v);
        case 3:
          _context9.p = 3;
          _t9 = _context9.v;
          console.error('Failed to load payment history:', _t9);
          return _context9.a(2, []);
      }
    }, _callee9, null, [[1, 3]]);
  }));
  return _getClientPayments.apply(this, arguments);
}
function getClientPolicies() {
  return _getClientPolicies.apply(this, arguments);
}
function _getClientPolicies() {
  _getClientPolicies = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    var clientId,
      endpoint,
      _args0 = arguments,
      _t0;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.p = _context0.n) {
        case 0:
          clientId = _args0.length > 0 && _args0[0] !== undefined ? _args0[0] : null;
          _context0.p = 1;
          endpoint = clientId ? "".concat(API_CONFIG.ENDPOINTS.CLIENT_POLICIES, "/").concat(clientId) : API_CONFIG.ENDPOINTS.CLIENT_POLICIES;
          _context0.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context0.a(2, _context0.v);
        case 3:
          _context0.p = 3;
          _t0 = _context0.v;
          console.error('Failed to load policies:', _t0);
          return _context0.a(2, []);
      }
    }, _callee0, null, [[1, 3]]);
  }));
  return _getClientPolicies.apply(this, arguments);
}
function getClientClaims() {
  return _getClientClaims.apply(this, arguments);
}
function _getClientClaims() {
  _getClientClaims = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
    var clientId,
      endpoint,
      _args1 = arguments,
      _t1;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.p = _context1.n) {
        case 0:
          clientId = _args1.length > 0 && _args1[0] !== undefined ? _args1[0] : null;
          _context1.p = 1;
          endpoint = clientId ? "".concat(API_CONFIG.ENDPOINTS.CLIENT_CLAIMS, "/").concat(clientId) : API_CONFIG.ENDPOINTS.CLIENT_CLAIMS;
          _context1.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context1.a(2, _context1.v);
        case 3:
          _context1.p = 3;
          _t1 = _context1.v;
          console.error('Failed to load claims:', _t1);
          return _context1.a(2, []);
      }
    }, _callee1, null, [[1, 3]]);
  }));
  return _getClientClaims.apply(this, arguments);
}
function getClientDocuments() {
  return _getClientDocuments.apply(this, arguments);
}
/**
 * AGENT DASHBOARD
 */
function _getClientDocuments() {
  _getClientDocuments = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
    var clientId,
      endpoint,
      _args10 = arguments,
      _t10;
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.p = _context10.n) {
        case 0:
          clientId = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : null;
          _context10.p = 1;
          endpoint = clientId ? "".concat(API_CONFIG.ENDPOINTS.CLIENT_DOCUMENTS, "/").concat(clientId) : API_CONFIG.ENDPOINTS.CLIENT_DOCUMENTS;
          _context10.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context10.a(2, _context10.v);
        case 3:
          _context10.p = 3;
          _t10 = _context10.v;
          console.error('Failed to load documents:', _t10);
          return _context10.a(2, []);
      }
    }, _callee10, null, [[1, 3]]);
  }));
  return _getClientDocuments.apply(this, arguments);
}
function getAgentDashboardData() {
  return _getAgentDashboardData.apply(this, arguments);
}
function _getAgentDashboardData() {
  _getAgentDashboardData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
    var agentId,
      endpoint,
      _args11 = arguments,
      _t11;
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.p = _context11.n) {
        case 0:
          agentId = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : null;
          _context11.p = 1;
          endpoint = agentId ? "".concat(API_CONFIG.ENDPOINTS.AGENT_DASHBOARD, "/").concat(agentId) : API_CONFIG.ENDPOINTS.AGENT_DASHBOARD;
          _context11.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context11.a(2, _context11.v);
        case 3:
          _context11.p = 3;
          _t11 = _context11.v;
          console.error('Failed to load agent dashboard:', _t11);
          throw _t11;
        case 4:
          return _context11.a(2);
      }
    }, _callee11, null, [[1, 3]]);
  }));
  return _getAgentDashboardData.apply(this, arguments);
}
function getAgentClients() {
  return _getAgentClients.apply(this, arguments);
}
function _getAgentClients() {
  _getAgentClients = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
    var agentId,
      endpoint,
      _args12 = arguments,
      _t12;
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.p = _context12.n) {
        case 0:
          agentId = _args12.length > 0 && _args12[0] !== undefined ? _args12[0] : null;
          _context12.p = 1;
          endpoint = agentId ? "".concat(API_CONFIG.ENDPOINTS.AGENT_CLIENTS, "/").concat(agentId) : API_CONFIG.ENDPOINTS.AGENT_CLIENTS;
          _context12.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context12.a(2, _context12.v);
        case 3:
          _context12.p = 3;
          _t12 = _context12.v;
          console.error('Failed to load clients:', _t12);
          return _context12.a(2, []);
      }
    }, _callee12, null, [[1, 3]]);
  }));
  return _getAgentClients.apply(this, arguments);
}
function getAgentStats() {
  return _getAgentStats.apply(this, arguments);
}
/**
 * ADMIN DASHBOARD
 */
function _getAgentStats() {
  _getAgentStats = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13() {
    var agentId,
      endpoint,
      _args13 = arguments,
      _t13;
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.p = _context13.n) {
        case 0:
          agentId = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : null;
          _context13.p = 1;
          endpoint = agentId ? "".concat(API_CONFIG.ENDPOINTS.AGENT_STATS, "/").concat(agentId) : API_CONFIG.ENDPOINTS.AGENT_STATS;
          _context13.n = 2;
          return apiService.get(endpoint);
        case 2:
          return _context13.a(2, _context13.v);
        case 3:
          _context13.p = 3;
          _t13 = _context13.v;
          console.error('Failed to load agent stats:', _t13);
          return _context13.a(2, {
            total_clients: 0,
            active_policies: 0,
            pending_claims: 0,
            monthly_revenue: 0
          });
      }
    }, _callee13, null, [[1, 3]]);
  }));
  return _getAgentStats.apply(this, arguments);
}
function getAdminDashboardData() {
  return _getAdminDashboardData.apply(this, arguments);
}
function _getAdminDashboardData() {
  _getAdminDashboardData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14() {
    var _t14;
    return _regenerator().w(function (_context14) {
      while (1) switch (_context14.p = _context14.n) {
        case 0:
          _context14.p = 0;
          _context14.n = 1;
          return apiService.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
        case 1:
          return _context14.a(2, _context14.v);
        case 2:
          _context14.p = 2;
          _t14 = _context14.v;
          console.error('Failed to load admin dashboard:', _t14);
          throw _t14;
        case 3:
          return _context14.a(2);
      }
    }, _callee14, null, [[0, 2]]);
  }));
  return _getAdminDashboardData.apply(this, arguments);
}
function getAdminStats() {
  return _getAdminStats.apply(this, arguments);
}
function _getAdminStats() {
  _getAdminStats = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15() {
    var _t15;
    return _regenerator().w(function (_context15) {
      while (1) switch (_context15.p = _context15.n) {
        case 0:
          _context15.p = 0;
          _context15.n = 1;
          return apiService.get(API_CONFIG.ENDPOINTS.ADMIN_STATS);
        case 1:
          return _context15.a(2, _context15.v);
        case 2:
          _context15.p = 2;
          _t15 = _context15.v;
          console.error('Failed to load admin stats:', _t15);
          return _context15.a(2, {});
      }
    }, _callee15, null, [[0, 2]]);
  }));
  return _getAdminStats.apply(this, arguments);
}
function getAdminActivity() {
  return _getAdminActivity.apply(this, arguments);
} // Export for use (ES6 modules)
function _getAdminActivity() {
  _getAdminActivity = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16() {
    var _t16;
    return _regenerator().w(function (_context16) {
      while (1) switch (_context16.p = _context16.n) {
        case 0:
          _context16.p = 0;
          _context16.n = 1;
          return apiService.get(API_CONFIG.ENDPOINTS.ADMIN_ACTIVITY);
        case 1:
          return _context16.a(2, _context16.v);
        case 2:
          _context16.p = 2;
          _t16 = _context16.v;
          console.error('Failed to load admin activity:', _t16);
          return _context16.a(2, []);
      }
    }, _callee16, null, [[0, 2]]);
  }));
  return _getAdminActivity.apply(this, arguments);
}


/***/ })

}]);
//# sourceMappingURL=src_api-integration_js.krause.app.js.map