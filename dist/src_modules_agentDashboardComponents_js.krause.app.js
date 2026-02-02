"use strict";
(self["webpackChunkreact_app"] = self["webpackChunkreact_app"] || []).push([["src_modules_agentDashboardComponents_js"],{

/***/ "./src/modules/agentDashboardComponents.js":
/*!*************************************************!*\
  !*** ./src/modules/agentDashboardComponents.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgentDashboardManager: () => (/* binding */ AgentDashboardManager),
/* harmony export */   AgentPaymentSchedulePanel: () => (/* binding */ AgentPaymentSchedulePanel),
/* harmony export */   AgentPoliciesPanel: () => (/* binding */ AgentPoliciesPanel)
/* harmony export */ });
/* harmony import */ var _api_integration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../api-integration.js */ "./src/api-integration.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Agent Dashboard Components
 * Componentes específicos para el portal del agente
 */



/**
 * Panel de Calendario de Pagos del Agente
 * Muestra todos los pagos de sus clientes con filtros
 */
var AgentPaymentSchedulePanel = /*#__PURE__*/function () {
  function AgentPaymentSchedulePanel(containerId) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, AgentPaymentSchedulePanel);
    this.container = document.getElementById(containerId);
    this.filteredClientId = options.clientId || null;
    this.viewMode = options.viewMode || 'all'; // 'all', 'pending', 'overdue'
  }
  return _createClass(AgentPaymentSchedulePanel, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        var _this = this;
        var data, payments, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              if (this.container) {
                _context.n = 1;
                break;
              }
              console.warn('Agent payment schedule container not found');
              return _context.a(2);
            case 1:
              _context.p = 1;
              _context.n = 2;
              return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request('?action=agent_payments', {
                method: 'GET'
              });
            case 2:
              data = _context.v;
              payments = data.payments || data || []; // Filtrar por cliente si está especificado
              if (this.filteredClientId) {
                payments = payments.filter(function (p) {
                  return p.client_id === _this.filteredClientId;
                });
              }

              // Filtrar por modo de vista
              if (this.viewMode === 'pending') {
                payments = payments.filter(function (p) {
                  return p.status === 'pending';
                });
              } else if (this.viewMode === 'overdue') {
                payments = payments.filter(function (p) {
                  return p.status === 'overdue';
                });
              }

              // Renderizar solo el contenido interno (tabla o empty state)
              this.container.innerHTML = "\n                ".concat(payments.length > 0 ? "\n                    <div class=\"payment-table-wrapper\">\n                        <div class=\"payment-filters\" style=\"margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;\">\n                            <button class=\"filter-btn ".concat(this.viewMode === 'all' ? 'active' : '', "\" \n                                    onclick=\"window.agentDashboard?.setPaymentView('all')\">\n                                Todos (").concat(payments.length, ")\n                            </button>\n                            <button class=\"filter-btn ").concat(this.viewMode === 'pending' ? 'active' : '', "\" \n                                    onclick=\"window.agentDashboard?.setPaymentView('pending')\">\n                                Pendientes (").concat(payments.filter(function (p) {
                return p.status === 'pending';
              }).length, ")\n                            </button>\n                            <button class=\"filter-btn ").concat(this.viewMode === 'overdue' ? 'active' : '', "\" \n                                    onclick=\"window.agentDashboard?.setPaymentView('overdue')\">\n                                Vencidos (").concat(payments.filter(function (p) {
                return p.status === 'overdue';
              }).length, ")\n                            </button>\n                        </div>\n                        <div class=\"modern-table\">\n                            <table class=\"payments-table\">\n                                <thead>\n                                    <tr>\n                                        <th>Cliente</th>\n                                        <th>P\xF3liza</th>\n                                        <th>Monto</th>\n                                        <th>Vence</th>\n                                        <th>Estado</th>\n                                        <th></th>\n                                    </tr>\n                                </thead>\n                                <tbody>\n                                    ").concat(payments.map(function (p) {
                return _this.renderPaymentRow(p);
              }).join(''), "\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n                ") : "\n                    <div class=\"empty-state\" style=\"text-align: center; padding: 3rem 1rem;\">\n                        <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" style=\"margin: 0 auto 1rem; opacity: 0.5;\">\n                            <rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />\n                            <line x1=\"2\" y1=\"10\" x2=\"22\" y2=\"10\" />\n                        </svg>\n                        <p style=\"margin: 0; color: var(--text-muted);\">No hay pagos ".concat(this.viewMode !== 'all' ? this.viewMode === 'pending' ? 'pendientes' : 'vencidos' : '', "</p>\n                    </div>\n                "), "\n            ");
              _context.n = 4;
              break;
            case 3:
              _context.p = 3;
              _t = _context.v;
              console.error('Error rendering agent payments:', _t);
              this.container.innerHTML = "\n                <div class=\"error-state\">\n                    <p>Error al cargar pagos: ".concat(_t.message, "</p>\n                </div>\n            ");
            case 4:
              return _context.a(2);
          }
        }, _callee, this, [[1, 3]]);
      }));
      function render() {
        return _render.apply(this, arguments);
      }
      return render;
    }()
  }, {
    key: "renderPaymentRow",
    value: function renderPaymentRow(payment) {
      var _payment$client_name;
      var statusClass = this.getStatusClass(payment.status);
      var daysUntilDue = Math.ceil((new Date(payment.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      var urgencyClass = daysUntilDue < 0 ? 'urgent' : daysUntilDue <= 3 ? 'warning' : '';
      var shortName = ((_payment$client_name = payment.client_name) === null || _payment$client_name === void 0 ? void 0 : _payment$client_name.split(' ').slice(0, 2).join(' ')) || 'N/A';
      return "\n            <tr class=\"".concat(urgencyClass, "\">\n                <td>\n                    <div class=\"client-info\">\n                        <strong>").concat(shortName, "</strong>\n                    </div>\n                </td>\n                <td><span class=\"policy-num\">").concat(payment.policy_number, "</span></td>\n                <td class=\"amount\">$").concat(parseFloat(payment.amount).toFixed(2), "</td>\n                <td>\n                    <div class=\"due-date ").concat(urgencyClass, "\">\n                        ").concat(this.formatShortDate(payment.due_date), "\n                        ").concat(daysUntilDue < 0 ? "<small class=\"text-danger\">-".concat(Math.abs(daysUntilDue), "d</small>") : daysUntilDue <= 3 ? "<small class=\"text-warning\">".concat(daysUntilDue, "d</small>") : '', "\n                    </div>\n                </td>\n                <td><span class=\"status-badge ").concat(statusClass, "\">").concat(this.getStatusText(payment.status), "</span></td>\n                <td>\n                    <div class=\"action-buttons\">\n                        ").concat(payment.proof_id ? "\n                            <button class=\"btn-icon\" title=\"Revisar comprobante\"\n                                    onclick=\"window.agentDashboard.paymentSchedule?.reviewReceipt('".concat(payment.proof_id, "', '").concat(payment.id, "')\">\n                                <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                                    <path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/>\n                                    <polyline points=\"14 2 14 8 20 8\"/>\n                                    <path d=\"M16 13l-4 4-2-2\"/>\n                                </svg>\n                            </button>\n                        ") : '', "\n                        <button class=\"btn-icon\" title=\"Ver P\xF3liza\"\n                                onclick=\"window.openPolicyModal?.('").concat(payment.policy_id, "')\">\n                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                                <path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/>\n                                <polyline points=\"14 2 14 8 20 8\"/>\n                                <path d=\"M9 15h6\"/>\n                                <path d=\"M9 11h6\"/>\n                            </svg>\n                        </button>\n                    </div>\n                </td>\n            </tr>\n        ");
    }
  }, {
    key: "getStatusClass",
    value: function getStatusClass(status) {
      var classes = {
        'paid': 'success',
        'pending': 'warning',
        'overdue': 'danger',
        'cancelled': 'neutral'
      };
      return classes[status] || 'neutral';
    }
  }, {
    key: "getStatusText",
    value: function getStatusText(status) {
      var texts = {
        'paid': 'Pagado',
        'pending': 'Pendiente',
        'overdue': 'Vencido',
        'cancelled': 'Cancelado'
      };
      return texts[status] || status;
    }
  }, {
    key: "formatDate",
    value: function formatDate(dateString) {
      var date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }, {
    key: "formatShortDate",
    value: function formatShortDate(dateString) {
      var date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  }, {
    key: "reviewReceipt",
    value: function reviewReceipt(proofId, paymentId) {
      var modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.innerHTML = "\n            <div class=\"modal-content\" style=\"max-width: 600px;\">\n                <div class=\"modal-header\">\n                    <h2>Revisar Comprobante de Pago</h2>\n                    <button class=\"modal-close\" onclick=\"this.closest('.modal-overlay').remove()\">\xD7</button>\n                </div>\n                <div class=\"modal-body\">\n                    <div class=\"receipt-preview\">\n                        <div class=\"receipt-image-placeholder\" style=\"text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;\">\n                            <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"margin: 0 auto; color: #666;\">\n                                <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/>\n                                <circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/>\n                                <polyline points=\"21 15 16 10 5 21\"/>\n                            </svg>\n                            <p style=\"margin-top: 1rem; color: #666;\">Comprobante ID: ".concat(proofId, "</p>\n                        </div>\n                        <div class=\"receipt-details\" style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;\">\n                            <div class=\"detail-group\">\n                                <label>ID de Pago</label>\n                                <p>").concat(paymentId, "</p>\n                            </div>\n                            <div class=\"detail-group\">\n                                <label>Estado Actual</label>\n                                <p><span class=\"badge badge-warning\">Pendiente de Revisi\xF3n</span></p>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"receipt-notes\">Notas de Revisi\xF3n (Opcional)</label>\n                        <textarea id=\"receipt-notes\" rows=\"3\" placeholder=\"Agrega comentarios sobre este comprobante...\"></textarea>\n                    </div>\n                </div>\n                <div class=\"modal-footer\" style=\"display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #e5e5e5;\">\n                    <button class=\"btn btn-outline\" onclick=\"this.closest('.modal-overlay').remove()\">Cancelar</button>\n                    <button class=\"btn btn-danger\" onclick=\"window.agentDashboard.paymentSchedule?.rejectReceipt('").concat(proofId, "', '").concat(paymentId, "')\">\n                        Rechazar\n                    </button>\n                    <button class=\"btn btn-success\" onclick=\"window.agentDashboard.paymentSchedule?.approveReceipt('").concat(proofId, "', '").concat(paymentId, "')\">\n                        Aprobar\n                    </button>\n                </div>\n            </div>\n        ");
      document.body.appendChild(modal);
    }
  }, {
    key: "approveReceipt",
    value: function approveReceipt(proofId, paymentId) {
      var _document$getElementB, _document$querySelect;
      var notes = ((_document$getElementB = document.getElementById('receipt-notes')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || '';
      console.log('Approving receipt:', proofId, paymentId, notes);
      showNotification('Comprobante aprobado exitosamente', NOTIFICATION_TYPES.SUCCESS);
      (_document$querySelect = document.querySelector('.modal-overlay')) === null || _document$querySelect === void 0 || _document$querySelect.remove();
      this.loadPaymentSchedule();
    }
  }, {
    key: "rejectReceipt",
    value: function rejectReceipt(proofId, paymentId) {
      var _document$getElementB2, _document$querySelect2;
      var notes = ((_document$getElementB2 = document.getElementById('receipt-notes')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || '';
      console.log('Rejecting receipt:', proofId, paymentId, notes);
      showNotification('Comprobante rechazado', NOTIFICATION_TYPES.INFO);
      (_document$querySelect2 = document.querySelector('.modal-overlay')) === null || _document$querySelect2 === void 0 || _document$querySelect2.remove();
      this.loadPaymentSchedule();
    }
  }]);
}();

/**
 * Panel de Pólizas del Agente
 * Lista todas las pólizas de sus clientes
 */
var AgentPoliciesPanel = /*#__PURE__*/function () {
  function AgentPoliciesPanel(containerId) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, AgentPoliciesPanel);
    this.container = document.getElementById(containerId);
    this.filteredClientId = options.clientId || null;
    this.viewMode = options.viewMode || 'all'; // 'all', 'active', 'expiring'
  }
  return _createClass(AgentPoliciesPanel, [{
    key: "render",
    value: function () {
      var _render2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var _this2 = this;
        var _dashboardData$client, _yield$import, _apiService, dashboardData, policies, now, thirtyDaysFromNow, _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              if (this.container) {
                _context2.n = 1;
                break;
              }
              console.warn('Agent policies container not found');
              return _context2.a(2);
            case 1:
              _context2.p = 1;
              _context2.n = 2;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../api-integration.js */ "./src/api-integration.js"));
            case 2:
              _yield$import = _context2.v;
              _apiService = _yield$import.apiService;
              _context2.n = 3;
              return _apiService.request('?action=agent_dashboard', {
                method: 'GET'
              });
            case 3:
              dashboardData = _context2.v;
              policies = ((_dashboardData$client = dashboardData.clients) === null || _dashboardData$client === void 0 ? void 0 : _dashboardData$client.flatMap(function (c) {
                return c.policies || [];
              })) || []; // Filtrar por cliente si está especificado
              if (this.filteredClientId) {
                policies = policies.filter(function (p) {
                  return p.client_id === _this2.filteredClientId;
                });
              }

              // Filtrar por modo de vista
              if (this.viewMode === 'active') {
                policies = policies.filter(function (p) {
                  return p.status === 'active';
                });
              } else if (this.viewMode === 'expiring') {
                now = new Date();
                thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                policies = policies.filter(function (p) {
                  var renewalDate = new Date(p.renewal_date);
                  return renewalDate <= thirtyDaysFromNow && renewalDate > now;
                });
              }

              // Renderizar solo el contenido interno (tabla o empty state)
              this.container.innerHTML = "\n                ".concat(policies.length > 0 ? "\n                    <div class=\"policies-table-wrapper\">\n                        <div class=\"policy-filters\" style=\"margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;\">\n                            <button class=\"filter-btn ".concat(this.viewMode === 'all' ? 'active' : '', "\" \n                                    onclick=\"window.agentDashboard?.setPoliciesView('all')\">\n                                Todas (").concat(policies.length, ")\n                            </button>\n                            <button class=\"filter-btn ").concat(this.viewMode === 'active' ? 'active' : '', "\" \n                                    onclick=\"window.agentDashboard?.setPoliciesView('active')\">\n                                Activas (").concat(policies.filter(function (p) {
                return p.status === 'active';
              }).length, ")\n                            </button>\n                            <button class=\"filter-btn ").concat(this.viewMode === 'expiring' ? 'active' : '', "\" \n                                    onclick=\"window.agentDashboard?.setPoliciesView('expiring')\">\n                                Por vencer (").concat(this.getExpiringCount(policies), ")\n                            </button>\n                        </div>\n                        <div class=\"modern-table\">\n                            <table class=\"policies-table\">\n                                <thead>\n                                    <tr>\n                                        <th>P\xF3liza</th>\n                                        <th>Tipo</th>\n                                        <th>Cliente</th>\n                                        <th>Prima</th>\n                                        <th>Renovaci\xF3n</th>\n                                        <th>Estado</th>\n                                        <th>Acciones</th>\n                                    </tr>\n                                </thead>\n                                <tbody>\n                                    ").concat(policies.map(function (p) {
                return _this2.renderPolicyRow(p);
              }).join(''), "\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n                ") : "\n                    <div class=\"empty-state\" style=\"text-align: center; padding: 3rem 1rem;\">\n                        <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" style=\"margin: 0 auto 1rem; opacity: 0.5;\">\n                            <path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/>\n                            <polyline points=\"14 2 14 8 20 8\"/>\n                        </svg>\n                        <p style=\"margin: 0; color: var(--text-muted);\">No hay p\xF3lizas</p>\n                    </div>\n                ", "\n            ");
              _context2.n = 5;
              break;
            case 4:
              _context2.p = 4;
              _t2 = _context2.v;
              console.error('Error rendering agent policies:', _t2);
              this.container.innerHTML = "\n                <div class=\"error-state\">\n                    <p>Error al cargar p\xF3lizas: ".concat(_t2.message, "</p>\n                </div>\n            ");
            case 5:
              return _context2.a(2);
          }
        }, _callee2, this, [[1, 4]]);
      }));
      function render() {
        return _render2.apply(this, arguments);
      }
      return render;
    }()
  }, {
    key: "renderPolicyRow",
    value: function renderPolicyRow(policy) {
      var statusClass = policy.status === 'active' ? 'success' : policy.status === 'expired' ? 'danger' : 'neutral';
      var daysUntilRenewal = Math.ceil((new Date(policy.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
      return "\n            <tr>\n                <td><strong>".concat(policy.policy_number, "</strong></td>\n                <td>").concat(this.getPolicyTypeLabel(policy.policy_type), "</td>\n                <td>").concat(policy.client_name || 'N/A', "</td>\n                <td>$").concat(parseFloat(policy.premium_amount || 0).toFixed(2), "</td>\n                <td>\n                    ").concat(this.formatDate(policy.renewal_date), "\n                    ").concat(daysUntilRenewal <= 30 && daysUntilRenewal > 0 ? "<br><small class=\"text-warning\">".concat(daysUntilRenewal, " d\xEDas</small>") : '', "\n                </td>\n                <td><span class=\"status-badge ").concat(statusClass, "\">").concat(policy.status, "</span></td>\n                <td>\n                    <div class=\"action-buttons\">\n                        <button class=\"btn-icon\" title=\"Ver detalles\" \n                                onclick=\"window.openPolicyModal?.('").concat(policy.id, "')\">\n                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                                <path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/>\n                                <circle cx=\"12\" cy=\"12\" r=\"3\"/>\n                            </svg>\n                        </button>\n                    </div>\n                </td>\n            </tr>\n        ");
    }
  }, {
    key: "renderPolicyCard",
    value: function renderPolicyCard(policy) {
      var statusClass = policy.status === 'active' ? 'success' : policy.status === 'expired' ? 'danger' : 'neutral';
      var daysUntilRenewal = Math.ceil((new Date(policy.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
      return "\n            <div class=\"policy-card ".concat(statusClass, "\">\n                <div class=\"policy-header\">\n                    <span class=\"policy-type\">").concat(this.getPolicyTypeLabel(policy.policy_type), "</span>\n                    <span class=\"policy-status ").concat(statusClass, "\">").concat(policy.status, "</span>\n                </div>\n                <div class=\"policy-body\">\n                    <h4>").concat(policy.policy_number, "</h4>\n                    <p class=\"client-name\">").concat(policy.client_name || 'Cliente N/A', "</p>\n                    <div class=\"policy-details\">\n                        <div class=\"detail-item\">\n                            <span class=\"label\">Prima:</span>\n                            <span class=\"value\">$").concat(parseFloat(policy.premium_amount).toFixed(2), "/mes</span>\n                        </div>\n                        <div class=\"detail-item\">\n                            <span class=\"label\">Cobertura:</span>\n                            <span class=\"value\">$").concat(parseFloat(policy.coverage_amount).toLocaleString(), "</span>\n                        </div>\n                        <div class=\"detail-item\">\n                            <span class=\"label\">Renovaci\xF3n:</span>\n                            <span class=\"value ").concat(daysUntilRenewal <= 30 ? 'warning' : '', "\">\n                                ").concat(this.formatDate(policy.renewal_date), "\n                                ").concat(daysUntilRenewal <= 30 && daysUntilRenewal > 0 ? " (".concat(daysUntilRenewal, " d\xEDas)") : '', "\n                            </span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"policy-footer\">\n                    <button class=\"btn btn-sm btn-outline\" \n                            onclick=\"window.appHandlers?.viewPolicy?.('").concat(policy.id, "')\">\n                        Ver detalles\n                    </button>\n                    <button class=\"btn btn-sm btn-primary\" \n                            onclick=\"window.appHandlers?.viewClientDetails?.('").concat(policy.client_id, "')\">\n                        Ver cliente\n                    </button>\n                </div>\n            </div>\n        ");
    }
  }, {
    key: "getPolicyTypeLabel",
    value: function getPolicyTypeLabel(type) {
      var labels = {
        'auto': '🚗 Auto',
        'home': '🏠 Hogar',
        'life': '❤️ Vida',
        'health': '🏥 Salud',
        'business': '💼 Negocio'
      };
      return labels[type] || type;
    }
  }, {
    key: "getExpiringCount",
    value: function getExpiringCount(policies) {
      var now = new Date();
      var thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return policies.filter(function (p) {
        var renewalDate = new Date(p.renewal_date);
        return renewalDate <= thirtyDaysFromNow && renewalDate > now;
      }).length;
    }
  }, {
    key: "formatDate",
    value: function formatDate(dateString) {
      var date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }]);
}();

/**
 * Dashboard Manager para Agente
 * Coordina todos los paneles y filtros
 */
var AgentDashboardManager = /*#__PURE__*/function () {
  function AgentDashboardManager() {
    _classCallCheck(this, AgentDashboardManager);
    this.filteredClientId = null;
    this.paymentPanel = null;
    this.policiesPanel = null;
    this.paymentViewMode = 'all';
    this.policiesViewMode = 'all';
  }
  return _createClass(AgentDashboardManager, [{
    key: "initialize",
    value: function () {
      var _initialize = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              // Inicializar paneles
              this.paymentPanel = new AgentPaymentSchedulePanel('agent-payments-container', {
                clientId: this.filteredClientId,
                viewMode: this.paymentViewMode
              });
              this.policiesPanel = new AgentPoliciesPanel('agent-policies-container', {
                clientId: this.filteredClientId,
                viewMode: this.policiesViewMode
              });
              _context3.n = 1;
              return this.render();
            case 1:
              return _context3.a(2);
          }
        }, _callee3, this);
      }));
      function initialize() {
        return _initialize.apply(this, arguments);
      }
      return initialize;
    }()
  }, {
    key: "render",
    value: function () {
      var _render3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              if (!this.paymentPanel) {
                _context4.n = 1;
                break;
              }
              _context4.n = 1;
              return this.paymentPanel.render();
            case 1:
              if (!this.policiesPanel) {
                _context4.n = 2;
                break;
              }
              _context4.n = 2;
              return this.policiesPanel.render();
            case 2:
              return _context4.a(2);
          }
        }, _callee4, this);
      }));
      function render() {
        return _render3.apply(this, arguments);
      }
      return render;
    }()
  }, {
    key: "setClientFilter",
    value: function setClientFilter(clientId) {
      this.filteredClientId = clientId;

      // Actualizar paneles con nuevo filtro
      if (this.paymentPanel) {
        this.paymentPanel.filteredClientId = clientId;
      }
      if (this.policiesPanel) {
        this.policiesPanel.filteredClientId = clientId;
      }
      this.render();

      // Actualizar UI del filtro
      this.updateFilterUI(clientId);
    }
  }, {
    key: "clearClientFilter",
    value: function clearClientFilter() {
      this.setClientFilter(null);
    }
  }, {
    key: "setPaymentView",
    value: function setPaymentView(viewMode) {
      this.paymentViewMode = viewMode;
      if (this.paymentPanel) {
        this.paymentPanel.viewMode = viewMode;
        this.paymentPanel.render();
      }
    }
  }, {
    key: "setPoliciesView",
    value: function setPoliciesView(viewMode) {
      this.policiesViewMode = viewMode;
      if (this.policiesPanel) {
        this.policiesPanel.viewMode = viewMode;
        this.policiesPanel.render();
      }
    }
  }, {
    key: "updateFilterUI",
    value: function updateFilterUI(clientId) {
      var filterPanel = document.getElementById('client-filter-panel');
      var filterClientName = document.querySelector('[data-filter-client-name]');
      if (filterPanel) {
        if (clientId) {
          var _window$dashboardData;
          // Mostrar panel
          filterPanel.style.display = 'block';

          // Buscar nombre del cliente en los datos cargados
          if (filterClientName && (_window$dashboardData = window.dashboardData) !== null && _window$dashboardData !== void 0 && _window$dashboardData.clients) {
            var client = window.dashboardData.clients.find(function (c) {
              return c.id == clientId;
            });
            if (client) {
              filterClientName.textContent = client.name;
            } else {
              filterClientName.textContent = "Cliente ID: ".concat(clientId);
            }
          }
        } else {
          // Ocultar panel
          filterPanel.style.display = 'none';
        }
      }
    }
  }, {
    key: "reviewProof",
    value: function reviewProof(proofId) {
      var _window$appHandlers;
      // Implementar lógica de revisión de comprobante
      console.log('Reviewing proof:', proofId);
      // Abrir modal de revisión
      if ((_window$appHandlers = window.appHandlers) !== null && _window$appHandlers !== void 0 && _window$appHandlers.reviewPaymentProof) {
        window.appHandlers.reviewPaymentProof(proofId);
      }
    }
  }, {
    key: "contactClient",
    value: function contactClient(clientId) {
      var _window$appHandlers2;
      // Implementar lógica de contacto
      console.log('Contacting client:', clientId);
      // Abrir modal de contacto o email
      if ((_window$appHandlers2 = window.appHandlers) !== null && _window$appHandlers2 !== void 0 && _window$appHandlers2.contactClient) {
        window.appHandlers.contactClient(clientId);
      }
    }
  }]);
}();

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function () {
    // Solo inicializar si estamos en el dashboard de agente
    if (document.getElementById('agent-payments-container') || document.getElementById('agent-policies-container')) {
      window.agentDashboard = new AgentDashboardManager();
      window.agentDashboard.initialize();
    }
  });
}

/***/ })

}]);
//# sourceMappingURL=src_modules_agentDashboardComponents_js.krause.app.js.map