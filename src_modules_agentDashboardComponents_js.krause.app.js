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
        var clients, payments, _t;
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
              return _api_integration_js__WEBPACK_IMPORTED_MODULE_0__.apiService.request('?action=agent_clients', {
                method: 'GET'
              });
            case 2:
              clients = _context.v;
              // Transformar datos de clientes a estructura de pagos
              // Cada póliza activa genera un "pago pendiente" ficticio
              payments = [];
              clients.forEach(function (client) {
                if (client.policies && client.policies.length > 0) {
                  client.policies.forEach(function (policy) {
                    if (policy.status === 'active') {
                      // Calcular próxima fecha de pago basado en renewal_date
                      var renewalDate = policy.renewal_date ? new Date(policy.renewal_date) : null;
                      var nextPaymentDate = renewalDate || new Date();
                      payments.push({
                        id: "payment_".concat(policy.id),
                        client_id: client.id,
                        client_name: client.name,
                        client_email: client.email,
                        policy_id: policy.id,
                        policy_number: policy.policy_number,
                        policy_type: policy.policy_type,
                        amount: parseFloat(policy.premium_amount || 0),
                        due_date: nextPaymentDate.toISOString().split('T')[0],
                        status: _this.calculatePaymentStatus(nextPaymentDate),
                        proof_id: null
                      });
                    }
                  });
                }
              });

              // Guardar datos completos en JSON para reutilización
              window.agentClientsData = {
                clients: clients,
                payments: payments,
                lastUpdated: new Date().toISOString()
              };
              console.log('💾 Agent clients data stored:', window.agentClientsData);

              // Filtrar por cliente si está especificado
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
              this.container.innerHTML = "\n                ".concat(payments.length > 0 ? "\n                    <div class=\"payment-table-wrapper\">\n                        <div class=\"payment-filters\" style=\"margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;\">\n                            <div style=\"display: flex; gap: 8px;\">\n                                <button class=\"filter-btn ".concat(this.viewMode === 'all' ? 'active' : '', "\" \n                                        onclick=\"window.agentDashboard?.setPaymentView('all')\">\n                                    Todos (").concat(payments.length, ")\n                                </button>\n                                <button class=\"filter-btn ").concat(this.viewMode === 'pending' ? 'active' : '', "\" \n                                        onclick=\"window.agentDashboard?.setPaymentView('pending')\">\n                                    Pendientes (").concat(payments.filter(function (p) {
                return p.status === 'pending';
              }).length, ")\n                                </button>\n                                <button class=\"filter-btn ").concat(this.viewMode === 'overdue' ? 'active' : '', "\" \n                                        onclick=\"window.agentDashboard?.setPaymentView('overdue')\">\n                                    Vencidos (").concat(payments.filter(function (p) {
                return p.status === 'overdue';
              }).length, ")\n                                </button>\n                            </div>\n                            <div style=\"margin-left: auto; display: flex; gap: 8px; align-items: center;\">\n                                <label style=\"font-size: 13px; color: var(--text-secondary);\">Agrupar:</label>\n                                <select class=\"form-control\" style=\"width: auto; padding: 4px 8px;\" \n                                        onchange=\"window.agentDashboard?.toggleGroupByPolicy(this.value)\">\n                                    <option value=\"none\">Sin agrupar</option>\n                                    <option value=\"policy\">Por p\xF3liza</option>\n                                    <option value=\"client\">Por cliente</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div class=\"modern-table\">\n                            <table class=\"payments-table\">\n                                <thead>\n                                    <tr>\n                                        <th>Cliente</th>\n                                        <th>P\xF3liza</th>\n                                        <th>Monto</th>\n                                        <th>Vence</th>\n                                        <th>Estado</th>\n                                        <th></th>\n                                    </tr>\n                                </thead>\n                                <tbody>\n                                    ").concat(this.renderGroupedPayments(payments), "\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n                ") : "\n                    <div class=\"empty-state\" style=\"text-align: center; padding: 3rem 1rem;\">\n                        <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" style=\"margin: 0 auto 1rem; opacity: 0.5;\">\n                            <rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />\n                            <line x1=\"2\" y1=\"10\" x2=\"22\" y2=\"10\" />\n                        </svg>\n                        <p style=\"margin: 0; color: var(--text-muted);\">No hay pagos ".concat(this.viewMode !== 'all' ? this.viewMode === 'pending' ? 'pendientes' : 'vencidos' : '', "</p>\n                    </div>\n                "), "\n            ");
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
    key: "calculatePaymentStatus",
    value: function calculatePaymentStatus(dueDate) {
      var now = new Date();
      var due = new Date(dueDate);
      var diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'overdue';
      if (diffDays <= 7) return 'pending';
      return 'upcoming';
    }
  }, {
    key: "getStatusClass",
    value: function getStatusClass(status) {
      var classes = {
        'paid': 'success',
        'pending': 'warning',
        'overdue': 'danger',
        'upcoming': 'info',
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
        'upcoming': 'Próximo',
        'cancelled': 'Cancelado'
      };
      return texts[status] || status;
    }
    /**
     * Agrupa los pagos según el criterio seleccionado
     * @param {string} groupBy - 'none', 'policy', 'client'
     */
  }, {
    key: "toggleGroupByPolicy",
    value: function toggleGroupByPolicy(groupBy) {
      this.groupBy = groupBy;
      this.render(); // Re-renderizar con nuevo agrupamiento
    }

    /**
     * Organiza los pagos según el modo de agrupación actual
     */
  }, {
    key: "organizePayments",
    value: function organizePayments(payments) {
      if (!this.groupBy || this.groupBy === 'none') {
        return [{
          group: null,
          payments: payments
        }];
      }
      var grouped = {};
      if (this.groupBy === 'policy') {
        payments.forEach(function (payment) {
          var key = payment.policy_number;
          if (!grouped[key]) {
            grouped[key] = {
              group: "P\xF3liza ".concat(key),
              payments: []
            };
          }
          grouped[key].payments.push(payment);
        });
      } else if (this.groupBy === 'client') {
        payments.forEach(function (payment) {
          var key = payment.client_name;
          if (!grouped[key]) {
            grouped[key] = {
              group: key,
              payments: []
            };
          }
          grouped[key].payments.push(payment);
        });
      }
      return Object.values(grouped);
    }

    /**
     * Renderiza los pagos con agrupación opcional
     */
  }, {
    key: "renderGroupedPayments",
    value: function renderGroupedPayments(payments) {
      var _this2 = this;
      var groups = this.organizePayments(payments);
      return groups.map(function (_ref) {
        var group = _ref.group,
          groupPayments = _ref.payments;
        var groupTotal = groupPayments.reduce(function (sum, p) {
          return sum + parseFloat(p.amount);
        }, 0);
        return "\n                ".concat(group ? "\n                    <tr class=\"group-header\">\n                        <td colspan=\"6\" style=\"background: var(--surface-low); font-weight: 600; padding: 0.75rem 1rem;\">\n                            ".concat(group, "\n                            <span style=\"float: right; color: var(--text-muted); font-weight: normal;\">\n                                ").concat(groupPayments.length, " pago").concat(groupPayments.length !== 1 ? 's' : '', " \xB7 \n                                Total: $").concat(groupTotal.toFixed(2), "\n                            </span>\n                        </td>\n                    </tr>\n                ") : '', "\n                ").concat(groupPayments.map(function (p) {
          return _this2.renderPaymentRow(p);
        }).join(''), "\n            ");
      }).join('');
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
    value: function () {
      var _reviewReceipt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(proofId, paymentId) {
        var _receiptData$extracte, _receiptData$extracte2, _receiptData$extracte3, _receiptData$extracte4;
        var _yield$import, apiService, _yield$import2, showNotification, _yield$import3, NOTIFICATION_TYPES, receiptData, modal, _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              _context2.n = 1;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../api-integration.js */ "./src/api-integration.js"));
            case 1:
              _yield$import = _context2.v;
              apiService = _yield$import.apiService;
              _context2.n = 2;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./notifications.js */ "./src/modules/notifications.js"));
            case 2:
              _yield$import2 = _context2.v;
              showNotification = _yield$import2.showNotification;
              _context2.n = 3;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../utils/constants.js */ "./src/utils/constants.js"));
            case 3:
              _yield$import3 = _context2.v;
              NOTIFICATION_TYPES = _yield$import3.NOTIFICATION_TYPES;
              receiptData = null;
              _context2.p = 4;
              _context2.n = 5;
              return apiService.request("?action=payment_receipt&id=".concat(proofId), {
                method: 'GET'
              });
            case 5:
              receiptData = _context2.v;
              _context2.n = 7;
              break;
            case 6:
              _context2.p = 6;
              _t2 = _context2.v;
              console.error('Error loading receipt:', _t2);
              // Mock data si falla
              receiptData = {
                id: proofId,
                file_name: 'comprobante.pdf',
                file_path: '/uploads/receipts/demo.pdf',
                amount: 500.00,
                payment_date: new Date().toISOString(),
                status: 'pending',
                extracted_data: {
                  amount: 500.00,
                  reference: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                  bank: 'Banco Demo',
                  confidence: 0.85
                }
              };
            case 7:
              modal = document.createElement('div');
              modal.className = 'app-modal-overlay active';
              modal.innerHTML = "\n            <div class=\"app-modal app-modal-lg\">\n                <div class=\"app-modal-header\">\n                    <h2 class=\"app-modal-title\">\uD83D\uDCC4 Revisar Comprobante de Pago</h2>\n                    <button class=\"app-modal-close\" onclick=\"this.closest('.app-modal-overlay').remove()\">\n                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                            <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/>\n                        </svg>\n                    </button>\n                </div>\n                <div class=\"app-modal-body\">\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 24px;\">\n                        <!-- Columna izquierda: Vista previa del archivo -->\n                        <div>\n                            <h3 style=\"margin: 0 0 16px; font-size: 16px;\">Archivo Original</h3>\n                            <div class=\"receipt-preview\" style=\"border: 2px dashed var(--border-color); border-radius: 8px; padding: 24px; text-align: center; background: var(--bg-secondary);\">\n                                ".concat(receiptData.file_path.endsWith('.pdf') ? "\n                                    <svg width=\"64\" height=\"64\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" style=\"margin: 0 auto 16px; color: var(--accent-primary);\">\n                                        <path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/>\n                                        <polyline points=\"14 2 14 8 20 8\"/>\n                                        <path d=\"M9 13h6\"/><path d=\"M9 17h6\"/>\n                                    </svg>\n                                    <p style=\"margin: 0 0 8px; font-weight: 600;\">".concat(receiptData.file_name, "</p>\n                                    <p style=\"margin: 0 0 16px; font-size: 13px; color: var(--text-secondary);\">Documento PDF</p>\n                                ") : "\n                                    <img src=\"".concat(receiptData.file_path, "\" alt=\"Comprobante\" style=\"max-width: 100%; border-radius: 4px; margin-bottom: 16px;\">\n                                    <p style=\"margin: 0; font-size: 13px; color: var(--text-secondary);\">").concat(receiptData.file_name, "</p>\n                                "), "\n                                <a href=\"").concat(receiptData.file_path, "\" target=\"_blank\" class=\"btn btn-outline btn-sm\" style=\"margin-top: 16px;\">\n                                    Abrir archivo completo\n                                </a>\n                            </div>\n                        </div>\n\n                        <!-- Columna derecha: Informaci\xF3n extra\xEDda -->\n                        <div>\n                            <h3 style=\"margin: 0 0 16px; font-size: 16px;\">Informaci\xF3n Extra\xEDda</h3>\n                            <div class=\"info-grid\" style=\"display: grid; gap: 16px; margin-bottom: 24px;\">\n                                <div class=\"info-card\" style=\"padding: 16px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-color);\">\n                                    <label style=\"display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;\">Monto</label>\n                                    <p style=\"margin: 0; font-size: 24px; font-weight: 600; color: var(--accent-primary);\">$").concat(parseFloat(((_receiptData$extracte = receiptData.extracted_data) === null || _receiptData$extracte === void 0 ? void 0 : _receiptData$extracte.amount) || receiptData.amount).toFixed(2), "</p>\n                                    ").concat((_receiptData$extracte2 = receiptData.extracted_data) !== null && _receiptData$extracte2 !== void 0 && _receiptData$extracte2.confidence ? "\n                                        <small style=\"display: block; margin-top: 4px; color: ".concat(receiptData.extracted_data.confidence > 0.7 ? 'var(--success)' : 'var(--warning)', ";\">\u2713 Confianza: ").concat((receiptData.extracted_data.confidence * 100).toFixed(0), "%</small>\n                                    ") : '', "\n                                </div>\n                                <div class=\"info-card\" style=\"padding: 16px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-color);\">\n                                    <label style=\"display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;\">Referencia</label>\n                                    <p style=\"margin: 0; font-weight: 600;\">").concat(((_receiptData$extracte3 = receiptData.extracted_data) === null || _receiptData$extracte3 === void 0 ? void 0 : _receiptData$extracte3.reference) || 'N/A', "</p>\n                                </div>\n                                <div class=\"info-card\" style=\"padding: 16px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-color);\">\n                                    <label style=\"display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;\">Banco</label>\n                                    <p style=\"margin: 0; font-weight: 600;\">").concat(((_receiptData$extracte4 = receiptData.extracted_data) === null || _receiptData$extracte4 === void 0 ? void 0 : _receiptData$extracte4.bank) || 'No detectado', "</p>\n                                </div>\n                                <div class=\"info-card\" style=\"padding: 16px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-color);\">\n                                    <label style=\"display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;\">Estado Actual</label>\n                                    <span class=\"badge badge-").concat(receiptData.status === 'approved' ? 'success' : receiptData.status === 'rejected' ? 'danger' : 'warning', "\">\n                                        ").concat(receiptData.status === 'approved' ? 'Aprobado' : receiptData.status === 'rejected' ? 'Rechazado' : 'Pendiente', "\n                                    </span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group\">\n                                <label for=\"receipt-review-notes\" style=\"display: block; margin-bottom: 8px; font-weight: 500;\">Comentarios de Revisi\xF3n</label>\n                                <textarea id=\"receipt-review-notes\" rows=\"4\" class=\"form-control\" \n                                    placeholder=\"Agrega notas sobre la revisi\xF3n, motivo de aprobaci\xF3n o rechazo...\" \n                                    style=\"width: 100%; resize: vertical;\"></textarea>\n                            </div>\n\n                            <div class=\"form-group\" style=\"margin-top: 16px;\">\n                                <label style=\"display: flex; align-items: center; gap: 8px; cursor: pointer;\">\n                                    <input type=\"checkbox\" id=\"notify-client-checkbox\" checked>\n                                    <span>Notificar al cliente sobre esta decisi\xF3n</span>\n                                </label>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"app-modal-footer\" style=\"display: flex; gap: 12px; justify-content: flex-end;\">\n                    <button class=\"btn btn-outline\" onclick=\"this.closest('.app-modal-overlay').remove()\">Cancelar</button>\n                    <button class=\"btn btn-danger\" onclick=\"window.agentDashboard.paymentSchedule?.rejectReceipt('").concat(proofId, "', '").concat(paymentId, "')\">\n                        \u274C Rechazar\n                    </button>\n                    <button class=\"btn btn-success\" onclick=\"window.agentDashboard.paymentSchedule?.approveReceipt('").concat(proofId, "', '").concat(paymentId, "')\">\n                        \u2705 Aprobar\n                    </button>\n                </div>\n            </div>\n        ");
              document.body.appendChild(modal);
            case 8:
              return _context2.a(2);
          }
        }, _callee2, null, [[4, 6]]);
      }));
      function reviewReceipt(_x, _x2) {
        return _reviewReceipt.apply(this, arguments);
      }
      return reviewReceipt;
    }()
  }, {
    key: "approveReceipt",
    value: function () {
      var _approveReceipt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(proofId, paymentId) {
        var _document$getElementB, _document$getElementB2;
        var notes, notifyClient, _yield$import4, apiService, _yield$import5, showNotification, _yield$import6, NOTIFICATION_TYPES, _document$querySelect, _t3;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              notes = ((_document$getElementB = document.getElementById('receipt-review-notes')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || '';
              notifyClient = ((_document$getElementB2 = document.getElementById('notify-client-checkbox')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.checked) || false;
              _context3.n = 1;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../api-integration.js */ "./src/api-integration.js"));
            case 1:
              _yield$import4 = _context3.v;
              apiService = _yield$import4.apiService;
              _context3.n = 2;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./notifications.js */ "./src/modules/notifications.js"));
            case 2:
              _yield$import5 = _context3.v;
              showNotification = _yield$import5.showNotification;
              _context3.n = 3;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../utils/constants.js */ "./src/utils/constants.js"));
            case 3:
              _yield$import6 = _context3.v;
              NOTIFICATION_TYPES = _yield$import6.NOTIFICATION_TYPES;
              _context3.p = 4;
              _context3.n = 5;
              return apiService.request('?action=approve_receipt', {
                method: 'POST',
                body: JSON.stringify({
                  receipt_id: proofId,
                  payment_id: paymentId,
                  notes: notes,
                  notify_client: notifyClient
                })
              });
            case 5:
              showNotification("Comprobante aprobado".concat(notifyClient ? ' y cliente notificado' : ''), NOTIFICATION_TYPES.SUCCESS);
              (_document$querySelect = document.querySelector('.app-modal-overlay')) === null || _document$querySelect === void 0 || _document$querySelect.remove();
              this.render(); // Recargar lista
              _context3.n = 7;
              break;
            case 6:
              _context3.p = 6;
              _t3 = _context3.v;
              console.error('Error approving receipt:', _t3);
              showNotification('Error al aprobar el comprobante', NOTIFICATION_TYPES.ERROR);
            case 7:
              return _context3.a(2);
          }
        }, _callee3, this, [[4, 6]]);
      }));
      function approveReceipt(_x3, _x4) {
        return _approveReceipt.apply(this, arguments);
      }
      return approveReceipt;
    }()
  }, {
    key: "rejectReceipt",
    value: function () {
      var _rejectReceipt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(proofId, paymentId) {
        var _document$getElementB3, _document$getElementB4;
        var notes, notifyClient, _yield$import7, _showNotification, _yield$import8, _NOTIFICATION_TYPES, _yield$import9, apiService, _yield$import0, showNotification, _yield$import1, NOTIFICATION_TYPES, _document$querySelect2, _t4;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              notes = (_document$getElementB3 = document.getElementById('receipt-review-notes')) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.value;
              notifyClient = ((_document$getElementB4 = document.getElementById('notify-client-checkbox')) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.checked) || false;
              if (!(!notes || notes.trim().length === 0)) {
                _context4.n = 3;
                break;
              }
              _context4.n = 1;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./notifications.js */ "./src/modules/notifications.js"));
            case 1:
              _yield$import7 = _context4.v;
              _showNotification = _yield$import7.showNotification;
              _context4.n = 2;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../utils/constants.js */ "./src/utils/constants.js"));
            case 2:
              _yield$import8 = _context4.v;
              _NOTIFICATION_TYPES = _yield$import8.NOTIFICATION_TYPES;
              _showNotification('Debes agregar una razón para rechazar el comprobante', _NOTIFICATION_TYPES.WARNING);
              return _context4.a(2);
            case 3:
              _context4.n = 4;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../api-integration.js */ "./src/api-integration.js"));
            case 4:
              _yield$import9 = _context4.v;
              apiService = _yield$import9.apiService;
              _context4.n = 5;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./notifications.js */ "./src/modules/notifications.js"));
            case 5:
              _yield$import0 = _context4.v;
              showNotification = _yield$import0.showNotification;
              _context4.n = 6;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../utils/constants.js */ "./src/utils/constants.js"));
            case 6:
              _yield$import1 = _context4.v;
              NOTIFICATION_TYPES = _yield$import1.NOTIFICATION_TYPES;
              _context4.p = 7;
              _context4.n = 8;
              return apiService.request('?action=reject_receipt', {
                method: 'POST',
                body: JSON.stringify({
                  receipt_id: proofId,
                  payment_id: paymentId,
                  notes: notes,
                  notify_client: notifyClient
                })
              });
            case 8:
              showNotification("Comprobante rechazado".concat(notifyClient ? ' y cliente notificado' : ''), NOTIFICATION_TYPES.INFO);
              (_document$querySelect2 = document.querySelector('.app-modal-overlay')) === null || _document$querySelect2 === void 0 || _document$querySelect2.remove();
              this.render(); // Recargar lista
              _context4.n = 10;
              break;
            case 9:
              _context4.p = 9;
              _t4 = _context4.v;
              console.error('Error rejecting receipt:', _t4);
              showNotification('Error al rechazar el comprobante', NOTIFICATION_TYPES.ERROR);
            case 10:
              return _context4.a(2);
          }
        }, _callee4, this, [[7, 9]]);
      }));
      function rejectReceipt(_x5, _x6) {
        return _rejectReceipt.apply(this, arguments);
      }
      return rejectReceipt;
    }()
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
      var _render2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
        var _this3 = this;
        var _dashboardData$client, _yield$import10, _apiService, dashboardData, policies, now, thirtyDaysFromNow, _t5;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.p = _context5.n) {
            case 0:
              if (this.container) {
                _context5.n = 1;
                break;
              }
              console.warn('Agent policies container not found');
              return _context5.a(2);
            case 1:
              _context5.p = 1;
              _context5.n = 2;
              return Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../api-integration.js */ "./src/api-integration.js"));
            case 2:
              _yield$import10 = _context5.v;
              _apiService = _yield$import10.apiService;
              _context5.n = 3;
              return _apiService.request('?action=agent_dashboard', {
                method: 'GET'
              });
            case 3:
              dashboardData = _context5.v;
              policies = ((_dashboardData$client = dashboardData.clients) === null || _dashboardData$client === void 0 ? void 0 : _dashboardData$client.flatMap(function (c) {
                return c.policies || [];
              })) || []; // Filtrar por cliente si está especificado
              if (this.filteredClientId) {
                policies = policies.filter(function (p) {
                  return p.client_id === _this3.filteredClientId;
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
                return _this3.renderPolicyRow(p);
              }).join(''), "\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n                ") : "\n                    <div class=\"empty-state\" style=\"text-align: center; padding: 3rem 1rem;\">\n                        <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" style=\"margin: 0 auto 1rem; opacity: 0.5;\">\n                            <path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/>\n                            <polyline points=\"14 2 14 8 20 8\"/>\n                        </svg>\n                        <p style=\"margin: 0; color: var(--text-muted);\">No hay p\xF3lizas</p>\n                    </div>\n                ", "\n            ");
              _context5.n = 5;
              break;
            case 4:
              _context5.p = 4;
              _t5 = _context5.v;
              console.error('Error rendering agent policies:', _t5);
              this.container.innerHTML = "\n                <div class=\"error-state\">\n                    <p>Error al cargar p\xF3lizas: ".concat(_t5.message, "</p>\n                </div>\n            ");
            case 5:
              return _context5.a(2);
          }
        }, _callee5, this, [[1, 4]]);
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
      var _initialize = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
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
              _context6.n = 1;
              return this.render();
            case 1:
              return _context6.a(2);
          }
        }, _callee6, this);
      }));
      function initialize() {
        return _initialize.apply(this, arguments);
      }
      return initialize;
    }()
  }, {
    key: "render",
    value: function () {
      var _render3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              if (!this.paymentPanel) {
                _context7.n = 1;
                break;
              }
              _context7.n = 1;
              return this.paymentPanel.render();
            case 1:
              if (!this.policiesPanel) {
                _context7.n = 2;
                break;
              }
              _context7.n = 2;
              return this.policiesPanel.render();
            case 2:
              return _context7.a(2);
          }
        }, _callee7, this);
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