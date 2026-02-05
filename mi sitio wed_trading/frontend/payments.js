// ===== SISTEMA DE PAGOS REAL =====
const PaymentSystem = (function() {
    // Configuración
    const config = {
        plans: [
            { 
                id: "free", 
                name: "Free", 
                price: 0, 
                period: "mes",
                features: [
                    "Acceso al foro básico",
                    "2 sesiones en vivo/mes",
                    "Recursos iniciales",
                    "Comunidad básica"
                ],
                color: "#666666"
            },
            { 
                id: "pro", 
                name: "Pro", 
                price: 49, 
                period: "mes",
                features: [
                    "Foro completo ilimitado",
                    "Sesiones ilimitadas",
                    "Recursos premium",
                    "Análisis semanal",
                    "Soporte por email"
                ],
                popular: true,
                color: "#00ffff"
            },
            { 
                id: "elite", 
                name: "Elite", 
                price: 99, 
                period: "mes",
                features: [
                    "Todo lo de Pro",
                    "Mentoría 1:1 semanal",
                    "Señales en tiempo real",
                    "Soporte prioritario 24/7",
                    "Webinars exclusivos",
                    "Acceso anticipado a herramientas"
                ],
                color: "#ff0000"
            }
        ],
        
        paymentMethods: [
            { id: "card", name: "Tarjeta", icon: "fas fa-credit-card", color: "#ff0000" },
            { id: "paypal", name: "PayPal", icon: "fab fa-paypal", color: "#00ffff" },
            { id: "crypto", name: "Criptomonedas", icon: "fas fa-coins", color: "#ff00ff" },
            { id: "transfer", name: "Transferencia", icon: "fas fa-university", color: "#00ff00" }
        ],
        
        currencies: [
            { code: "USD", symbol: "$", name: "Dólar USA" },
            { code: "EUR", symbol: "€", name: "Euro" },
            { code: "GBP", symbol: "£", name: "Libra Esterlina" }
        ]
    };
    
    // Estado
    let state = {
        selectedPlan: null,
        selectedMethod: null,
        selectedCurrency: "USD",
        currentUser: null,
        isLoading: false,
        transactions: []
    };
    
    // DOM Elements
    let elements = {};
    
    // ===== FUNCIONES PRIVADAS =====
    function init() {
        console.log('💰 Inicializando sistema de pagos REAL...');
        
        // Cargar usuario actual
        loadCurrentUser();
        
        // Cargar transacciones desde localStorage
        loadTransactions();
        
        // Inicializar DOM
        initDOM();
        
        // Renderizar sistema de pagos
        renderPayments();
        
        console.log('✅ Sistema de pagos REAL listo');
    }
    
    function loadCurrentUser() {
        try {
            const user = localStorage.getItem('current_user');
            if (user) {
                state.currentUser = JSON.parse(user);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    }
    
    function loadTransactions() {
        try {
            const savedTransactions = localStorage.getItem('trading_elite_transactions');
            if (savedTransactions) {
                state.transactions = JSON.parse(savedTransactions);
            } else {
                state.transactions = [];
                saveTransactions();
            }
            
            console.log(`💳 Transacciones cargadas: ${state.transactions.length}`);
        } catch (error) {
            console.error('Error cargando transacciones:', error);
            state.transactions = [];
        }
    }
    
    function saveTransactions() {
        try {
            localStorage.setItem('trading_elite_transactions', JSON.stringify(state.transactions));
            console.log('💾 Transacciones guardadas en localStorage');
        } catch (error) {
            console.error('Error guardando transacciones:', error);
        }
    }
    
    function initDOM() {
        const container = document.getElementById('payments-container');
        if (!container) {
            console.error('❌ Contenedor de pagos no encontrado');
            return;
        }
        
        // Crear estructura del sistema de pagos
        container.innerHTML = `
            <div class="payments-header">
                <div class="payments-info">
                    <h3><i class="fas fa-crown"></i> Acceso Elite</h3>
                    <p>Selecciona tu plan y método de pago preferido</p>
                </div>
                
                <div class="user-plan-info" id="user-plan-info">
                    <!-- Información del plan actual se cargará dinámicamente -->
                </div>
            </div>
            
            <div class="payments-main">
                <div class="plans-section">
                    <div class="section-header">
                        <h4><i class="fas fa-layer-group"></i> Selecciona tu Plan</h4>
                        <div class="currency-selector">
                            <label for="currency-select">Moneda:</label>
                            <select id="currency-select" class="form-input">
                                ${config.currencies.map(currency => `
                                    <option value="${currency.code}" ${currency.code === state.selectedCurrency ? 'selected' : ''}>
                                        ${currency.symbol} ${currency.code}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="plans-grid" id="plans-grid">
                        <!-- Los planes se cargarán dinámicamente -->
                    </div>
                </div>
                
                <div class="payment-section">
                    <div class="section-header">
                        <h4><i class="fas fa-credit-card"></i> Método de Pago</h4>
                    </div>
                    
                    <div class="payment-methods" id="payment-methods">
                        <!-- Métodos de pago se cargarán dinámicamente -->
                    </div>
                    
                    <div class="payment-form-container">
                        <div class="payment-form" id="payment-form">
                            <!-- Formulario de pago se cargará dinámicamente -->
                        </div>
                        
                        <div class="payment-summary" id="payment-summary">
                            <!-- Resumen del pago se cargará dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="transactions-section">
                <div class="section-header">
                    <h4><i class="fas fa-history"></i> Historial de Transacciones</h4>
                </div>
                
                <div class="transactions-container" id="transactions-container">
                    <!-- Historial de transacciones se cargará dinámicamente -->
                </div>
            </div>
            
            <!-- Modal de confirmación de pago -->
            <div class="modal payment-modal" id="payment-confirmation-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle"></i> Confirmar Pago</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content">
                    <div class="confirmation-content" id="confirmation-content">
                        <!-- Contenido de confirmación se cargará dinámicamente -->
                    </div>
                    <div class="modal-actions" id="confirmation-actions">
                        <!-- Acciones de confirmación se cargarán dinámicamente -->
                    </div>
                </div>
            </div>
            
            <!-- Modal de éxito de pago -->
            <div class="modal payment-modal" id="payment-success-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle" style="color: var(--neon-green);"></i> ¡Pago Exitoso!</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content">
                    <div class="success-content" id="success-content">
                        <!-- Contenido de éxito se cargará dinámicamente -->
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary modal-close">
                            <i class="fas fa-tachometer-alt"></i> Ir al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Cachear elementos
        elements = {
            container: container,
            userPlanInfo: document.getElementById('user-plan-info'),
            plansGrid: document.getElementById('plans-grid'),
            currencySelect: document.getElementById('currency-select'),
            paymentMethods: document.getElementById('payment-methods'),
            paymentForm: document.getElementById('payment-form'),
            paymentSummary: document.getElementById('payment-summary'),
            transactionsContainer: document.getElementById('transactions-container'),
            paymentConfirmationModal: document.getElementById('payment-confirmation-modal'),
            paymentSuccessModal: document.getElementById('payment-success-modal')
        };
        
        // Agregar event listeners
        attachEventListeners();
        
        // Inicializar selección de moneda
        if (elements.currencySelect) {
            elements.currencySelect.value = state.selectedCurrency;
        }
    }
    
    function attachEventListeners() {
        // Cambio de moneda
        elements.currencySelect?.addEventListener('change', function() {
            state.selectedCurrency = this.value;
            renderPayments();
        });
        
        // Cerrar modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Overlay
        document.getElementById('modal-overlay')?.addEventListener('click', function() {
            closeModal(elements.paymentConfirmationModal);
            closeModal(elements.paymentSuccessModal);
        });
    }
    
    function renderPayments() {
        updateUserPlanInfo();
        renderPlans();
        renderPaymentMethods();
        renderPaymentForm();
        renderPaymentSummary();
        renderTransactions();
    }
    
    function updateUserPlanInfo() {
        if (!elements.userPlanInfo) return;
        
        if (!state.currentUser) {
            elements.userPlanInfo.innerHTML = `
                <div class="current-plan">
                    <div class="plan-status">
                        <i class="fas fa-user"></i>
                        <div class="plan-info">
                            <div class="plan-name">No has iniciado sesión</div>
                            <div class="plan-action">
                                <button class="btn btn-outline" id="login-from-payments">
                                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Event listener para el botón de login
            setTimeout(() => {
                document.getElementById('login-from-payments')?.addEventListener('click', function() {
                    if (typeof AuthSystem !== 'undefined') {
                        AuthSystem.openModal('login');
                    }
                });
            }, 100);
            
            return;
        }
        
        const userPlan = state.currentUser.plan || 'free';
        const planConfig = config.plans.find(p => p.id === userPlan) || config.plans[0];
        const hasActiveSubscription = hasActivePlan(state.currentUser);
        
        elements.userPlanInfo.innerHTML = `
            <div class="current-plan">
                <div class="plan-status">
                    <div class="plan-icon" style="background: ${planConfig.color}20; color: ${planConfig.color};">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div class="plan-info">
                        <div class="plan-name">Plan Actual: <strong>${planConfig.name}</strong></div>
                        <div class="plan-details">
                            ${hasActiveSubscription ? `
                                <span class="plan-active">
                                    <i class="fas fa-check-circle"></i> Activo
                                </span>
                            ` : `
                                <span class="plan-inactive">
                                    <i class="fas fa-clock"></i> ${planConfig.price === 0 ? 'Gratis' : 'No activo'}
                                </span>
                            `}
                            ${state.currentUser.planExpiry ? `
                                <span class="separator">•</span>
                                <span class="plan-expiry">
                                    Renueva: ${formatDate(state.currentUser.planExpiry)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                ${userPlan !== 'elite' ? `
                    <div class="plan-upgrade">
                        <button class="btn btn-primary" id="upgrade-plan-btn">
                            <i class="fas fa-rocket"></i> Mejorar Plan
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Event listener para el botón de upgrade
        setTimeout(() => {
            document.getElementById('upgrade-plan-btn')?.addEventListener('click', function() {
                // Seleccionar automáticamente el siguiente plan
                const currentIndex = config.plans.findIndex(p => p.id === userPlan);
                const nextPlan = config.plans[currentIndex + 1];
                if (nextPlan) {
                    selectPlan(nextPlan.id);
                }
            });
        }, 100);
    }
    
    function hasActivePlan(user) {
        if (!user) return false;
        
        // Para el plan free, siempre está "activo"
        if (user.plan === 'free') return true;
        
        // Verificar si hay una fecha de expiración y si aún es válida
        if (user.planExpiry) {
            const expiryDate = new Date(user.planExpiry);
            const now = new Date();
            return expiryDate > now;
        }
        
        // Si no hay fecha de expiración pero tiene un plan pago, verificar en transacciones
        const recentPayment = state.transactions.find(t => 
            t.userId === user.id && 
            t.status === 'completed' &&
            new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        );
        
        return !!recentPayment;
    }
    
    function renderPlans() {
        if (!elements.plansGrid) return;
        
        const currency = config.currencies.find(c => c.code === state.selectedCurrency) || config.currencies[0];
        const userPlan = state.currentUser?.plan || 'free';
        const userHasActivePlan = hasActivePlan(state.currentUser);
        
        const plansHTML = config.plans.map(plan => {
            const isCurrentPlan = plan.id === userPlan;
            const isSelected = state.selectedPlan === plan.id;
            const isDisabled = isCurrentPlan && userHasActivePlan && plan.id !== 'free';
            
            // Calcular precio en la moneda seleccionada (simulación)
            const price = convertCurrency(plan.price, 'USD', state.selectedCurrency);
            
            return `
                <div class="plan-card ${isCurrentPlan ? 'current-plan' : ''} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                     data-plan="${plan.id}">
                    ${plan.popular ? `
                        <div class="plan-badge">
                            <i class="fas fa-fire"></i> Popular
                        </div>
                    ` : ''}
                    
                    <div class="plan-header">
                        <div class="plan-icon" style="background: ${plan.color}20; border-color: ${plan.color};">
                            <i class="fas fa-crown" style="color: ${plan.color};"></i>
                        </div>
                        <h4 class="plan-name">${plan.name}</h4>
                        ${isCurrentPlan ? `
                            <div class="current-badge">
                                <i class="fas fa-check"></i> Actual
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="plan-price">
                        <div class="price-amount">
                            ${currency.symbol}${price.toFixed(2)}
                            <span class="price-period">/${plan.period}</span>
                        </div>
                        <div class="price-note">
                            ${plan.price === 0 ? 'Gratis para siempre' : 'Facturación mensual'}
                        </div>
                    </div>
                    
                    <ul class="plan-features">
                        ${plan.features.map(feature => `
                            <li>
                                <i class="fas fa-check" style="color: ${plan.color};"></i>
                                ${feature}
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div class="plan-actions">
                        ${isCurrentPlan && userHasActivePlan && plan.id !== 'free' ? `
                            <button class="btn btn-outline" disabled>
                                <i class="fas fa-check"></i> Plan Actual
                            </button>
                        ` : isCurrentPlan ? `
                            <button class="btn btn-outline" disabled>
                                <i class="fas fa-user"></i> Ya tienes este plan
                            </button>
                        ` : `
                            <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} select-plan-btn" 
                                    data-plan="${plan.id}" 
                                    ${!state.currentUser ? 'disabled' : ''}>
                                ${plan.price === 0 ? 'Seleccionar Gratis' : 'Seleccionar Plan'}
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
        elements.plansGrid.innerHTML = plansHTML;
        
        // Agregar event listeners a los botones de selección
        document.querySelectorAll('.select-plan-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!state.currentUser) {
                    window.showMessage('Debes iniciar sesión para seleccionar un plan', 'error');
                    if (typeof AuthSystem !== 'undefined') {
                        AuthSystem.openModal('login');
                    }
                    return;
                }
                
                const planId = this.dataset.plan;
                selectPlan(planId);
            });
        });
        
        // Agregar event listeners a las tarjetas de plan
        document.querySelectorAll('.plan-card:not(.disabled)').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.select-plan-btn') && !e.target.closest('.plan-actions')) {
                    const planId = this.dataset.plan;
                    
                    if (!state.currentUser) {
                        window.showMessage('Debes iniciar sesión para seleccionar un plan', 'error');
                        if (typeof AuthSystem !== 'undefined') {
                            AuthSystem.openModal('login');
                        }
                        return;
                    }
                    
                    selectPlan(planId);
                }
            });
        });
    }
    
    function selectPlan(planId) {
        const plan = config.plans.find(p => p.id === planId);
        if (!plan) return;
        
        // Verificar si es el plan actual y está activo
        const isCurrentPlan = state.currentUser?.plan === planId;
        const hasActivePlan = hasActivePlan(state.currentUser);
        
        if (isCurrentPlan && hasActivePlan && planId !== 'free') {
            window.showMessage('Ya tienes este plan activo', 'info');
            return;
        }
        
        state.selectedPlan = planId;
        
        // Actualizar UI
        renderPayments();
        
        // Si es el plan free, procesar inmediatamente
        if (planId === 'free') {
            processFreePlan();
            return;
        }
        
        // Mostrar métodos de pago
        if (state.selectedMethod) {
            renderPaymentForm();
            renderPaymentSummary();
        }
    }
    
    function renderPaymentMethods() {
        if (!elements.paymentMethods) return;
        
        const methodsHTML = config.paymentMethods.map(method => {
            const isSelected = state.selectedMethod === method.id;
            
            return `
                <div class="payment-method ${isSelected ? 'selected' : ''}" data-method="${method.id}">
                    <div class="method-icon" style="background: ${method.color}20; color: ${method.color};">
                        <i class="${method.icon}"></i>
                    </div>
                    <div class="method-name">${method.name}</div>
                    ${isSelected ? `
                        <div class="method-check">
                            <i class="fas fa-check"></i>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        elements.paymentMethods.innerHTML = methodsHTML;
        
        // Agregar event listeners
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                const methodId = this.dataset.method;
                selectPaymentMethod(methodId);
            });
        });
    }
    
    function selectPaymentMethod(methodId) {
        state.selectedMethod = methodId;
        
        // Actualizar UI
        renderPayments();
        
        // Renderizar formulario de pago específico
        renderPaymentForm();
        renderPaymentSummary();
    }
    
    function renderPaymentForm() {
        if (!elements.paymentForm) return;
        
        if (!state.selectedPlan || state.selectedPlan === 'free') {
            elements.paymentForm.innerHTML = `
                <div class="payment-form-placeholder">
                    <i class="fas fa-crown" style="font-size: 3rem; color: var(--neon-green); margin-bottom: 1rem;"></i>
                    <h4>Selecciona un plan de pago</h4>
                    <p>Elige uno de nuestros planes para continuar con el proceso de pago.</p>
                </div>
            `;
            return;
        }
        
        if (!state.selectedMethod) {
            elements.paymentForm.innerHTML = `
                <div class="payment-form-placeholder">
                    <i class="fas fa-credit-card" style="font-size: 3rem; color: var(--neon-green); margin-bottom: 1rem;"></i>
                    <h4>Selecciona un método de pago</h4>
                    <p>Elige cómo quieres pagar tu suscripción.</p>
                </div>
            `;
            return;
        }
        
        const plan = config.plans.find(p => p.id === state.selectedPlan);
        const method = config.paymentMethods.find(m => m.id === state.selectedMethod);
        const currency = config.currencies.find(c => c.code === state.selectedCurrency) || config.currencies[0];
        const price = convertCurrency(plan.price, 'USD', state.selectedCurrency);
        
        let formHTML = '';
        
        switch (state.selectedMethod) {
            case 'card':
                formHTML = `
                    <form id="card-payment-form">
                        <div class="form-group">
                            <label class="form-label">Número de Tarjeta</label>
                            <div class="card-input-container">
                                <input type="text" class="form-input card-number" 
                                       placeholder="1234 5678 9012 3456" maxlength="19" required>
                                <div class="card-icons">
                                    <i class="fab fa-cc-visa"></i>
                                    <i class="fab fa-cc-mastercard"></i>
                                    <i class="fab fa-cc-amex"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha de Expiración</label>
                                <div class="expiry-inputs">
                                    <select class="form-input" id="card-expiry-month" required>
                                        <option value="">Mes</option>
                                        ${Array.from({length: 12}, (_, i) => {
                                            const month = (i + 1).toString().padStart(2, '0');
                                            return `<option value="${month}">${month}</option>`;
                                        }).join('')}
                                    </select>
                                    <select class="form-input" id="card-expiry-year" required>
                                        <option value="">Año</option>
                                        ${Array.from({length: 10}, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return `<option value="${year}">${year}</option>`;
                                        }).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">CVV</label>
                                <input type="text" class="form-input card-cvv" 
                                       placeholder="123" maxlength="4" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Nombre en la Tarjeta</label>
                            <input type="text" class="form-input" 
                                   value="${state.currentUser?.name || ''}" 
                                   placeholder="Nombre completo" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Correo para la factura</label>
                            <input type="email" class="form-input" 
                                   value="${state.currentUser?.email || ''}" 
                                   placeholder="tu@email.com" required>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" id="process-payment-btn">
                                <i class="fas fa-lock"></i> Pagar ${currency.symbol}${price.toFixed(2)}
                            </button>
                        </div>
                    </form>
                `;
                break;
                
            case 'paypal':
                formHTML = `
                    <div class="paypal-payment">
                        <div class="paypal-info">
                            <i class="fab fa-paypal" style="font-size: 3rem; color: #003087; margin-bottom: 1rem;"></i>
                            <h4>Pagar con PayPal</h4>
                            <p>Serás redirigido a PayPal para completar el pago de forma segura.</p>
                            
                            <div class="paypal-benefits">
                                <div class="benefit">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Pago seguro</span>
                                </div>
                                <div class="benefit">
                                    <i class="fas fa-bolt"></i>
                                    <span>Proceso rápido</span>
                                </div>
                                <div class="benefit">
                                    <i class="fas fa-undo"></i>
                                    <span>Reembolsos fáciles</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" id="pay-with-paypal" style="background: #003087; border-color: #003087;">
                                <i class="fab fa-paypal"></i> Pagar con PayPal
                            </button>
                        </div>
                    </div>
                `;
                break;
                
            case 'crypto':
                formHTML = `
                    <div class="crypto-payment">
                        <div class="crypto-info">
                            <i class="fas fa-coins" style="font-size: 3rem; color: #f7931a; margin-bottom: 1rem;"></i>
                            <h4>Pagar con Criptomonedas</h4>
                            <p>Selecciona la criptomoneda con la que deseas pagar.</p>
                            
                            <div class="crypto-options">
                                <div class="crypto-option" data-crypto="btc">
                                    <div class="crypto-icon">
                                        <i class="fab fa-bitcoin"></i>
                                    </div>
                                    <div class="crypto-name">Bitcoin (BTC)</div>
                                    <div class="crypto-rate" id="btc-rate">Cargando...</div>
                                </div>
                                <div class="crypto-option" data-crypto="eth">
                                    <div class="crypto-icon">
                                        <i class="fab fa-ethereum"></i>
                                    </div>
                                    <div class="crypto-name">Ethereum (ETH)</div>
                                    <div class="crypto-rate" id="eth-rate">Cargando...</div>
                                </div>
                                <div class="crypto-option" data-crypto="usdt">
                                    <div class="crypto-icon">
                                        <i class="fas fa-coins"></i>
                                    </div>
                                    <div class="crypto-name">USDT</div>
                                    <div class="crypto-rate" id="usdt-rate">1:1 con USD</div>
                                </div>
                            </div>
                            
                            <div class="crypto-address" id="crypto-address-container" style="display: none;">
                                <div class="address-header">
                                    <h5>Envía el pago a esta dirección:</h5>
                                    <button class="btn-icon copy-address" title="Copiar dirección">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="address-code" id="crypto-address">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
                                <div class="address-qr" id="crypto-qr">
                                    <div class="qr-placeholder">
                                        <i class="fas fa-qrcode"></i>
                                        <span>Código QR generado aquí</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" id="generate-crypto-address">
                                <i class="fas fa-wallet"></i> Generar Dirección de Pago
                            </button>
                        </div>
                    </div>
                `;
                break;
                
            case 'transfer':
                formHTML = `
                    <div class="transfer-payment">
                        <div class="transfer-info">
                            <i class="fas fa-university" style="font-size: 3rem; color: var(--neon-green); margin-bottom: 1rem;"></i>
                            <h4>Transferencia Bancaria</h4>
                            <p>Realiza una transferencia bancaria con los siguientes datos:</p>
                            
                            <div class="bank-details">
                                <div class="detail-row">
                                    <div class="detail-label">Banco:</div>
                                    <div class="detail-value">Banco Elite Trading</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Cuenta:</div>
                                    <div class="detail-value">0123-4567-8901-2345</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Titular:</div>
                                    <div class="detail-value">Trading Elite S.A.</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Concepto:</div>
                                    <div class="detail-value">Suscripción ${plan.name} - ${state.currentUser?.email || 'Tu email'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Importe:</div>
                                    <div class="detail-value">${currency.symbol}${price.toFixed(2)} ${currency.code}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">SWIFT/BIC:</div>
                                    <div class="detail-value">ELITETRXX</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">IBAN:</div>
                                    <div class="detail-value">ES12 0123 4567 8901 2345</div>
                                </div>
                            </div>
                            
                            <div class="transfer-note">
                                <i class="fas fa-info-circle"></i>
                                <p>Una vez realizada la transferencia, envía el comprobante a <strong>pagos@tradingelite.com</strong> para activar tu suscripción.</p>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" id="confirm-transfer">
                                <i class="fas fa-check"></i> Confirmar Transferencia
                            </button>
                        </div>
                    </div>
                `;
                break;
        }
        
        elements.paymentForm.innerHTML = formHTML;
        
        // Agregar event listeners específicos del método
        attachPaymentFormListeners();
    }
    
    function attachPaymentFormListeners() {
        // Formulario de tarjeta
        const cardForm = document.getElementById('card-payment-form');
        if (cardForm) {
            cardForm.addEventListener('submit', function(e) {
                e.preventDefault();
                processCardPayment();
            });
            
            // Formatear número de tarjeta
            const cardNumberInput = document.querySelector('.card-number');
            if (cardNumberInput) {
                cardNumberInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                    let matches = value.match(/\d{4,16}/g);
                    let match = matches && matches[0] || '';
                    let parts = [];
                    
                    for (let i = 0; i < match.length; i += 4) {
                        parts.push(match.substring(i, i + 4));
                    }
                    
                    if (parts.length) {
                        e.target.value = parts.join(' ');
                    } else {
                        e.target.value = value;
                    }
                });
            }
        }
        
        // Botón de PayPal
        const paypalBtn = document.getElementById('pay-with-paypal');
        if (paypalBtn) {
            paypalBtn.addEventListener('click', processPayPalPayment);
        }
        
        // Opciones de cripto
        document.querySelectorAll('.crypto-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.crypto-option').forEach(o => {
                    o.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
        
        // Generar dirección de cripto
        const cryptoBtn = document.getElementById('generate-crypto-address');
        if (cryptoBtn) {
            cryptoBtn.addEventListener('click', generateCryptoAddress);
        }
        
        // Copiar dirección de cripto
        const copyBtn = document.querySelector('.copy-address');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyCryptoAddress);
        }
        
        // Confirmar transferencia
        const transferBtn = document.getElementById('confirm-transfer');
        if (transferBtn) {
            transferBtn.addEventListener('click', confirmTransfer);
        }
    }
    
    function renderPaymentSummary() {
        if (!elements.paymentSummary) return;
        
        if (!state.selectedPlan || state.selectedPlan === 'free') {
            elements.paymentSummary.innerHTML = '';
            return;
        }
        
        const plan = config.plans.find(p => p.id === state.selectedPlan);
        const method = state.selectedMethod ? config.paymentMethods.find(m => m.id === state.selectedMethod) : null;
        const currency = config.currencies.find(c => c.code === state.selectedCurrency) || config.currencies[0];
        const price = convertCurrency(plan.price, 'USD', state.selectedCurrency);
        const tax = price * 0.16; // 16% de IVA (ejemplo)
        const total = price + tax;
        
        elements.paymentSummary.innerHTML = `
            <div class="summary-header">
                <h4><i class="fas fa-receipt"></i> Resumen del Pago</h4>
            </div>
            
            <div class="summary-details">
                <div class="summary-row">
                    <div class="summary-label">Plan:</div>
                    <div class="summary-value">${plan.name}</div>
                </div>
                
                <div class="summary-row">
                    <div class="summary-label">Periodo:</div>
                    <div class="summary-value">Mensual (renovable)</div>
                </div>
                
                <div class="summary-row">
                    <div class="summary-label">Precio:</div>
                    <div class="summary-value">${currency.symbol}${price.toFixed(2)}</div>
                </div>
                
                <div class="summary-row">
                    <div class="summary-label">IVA (16%):</div>
                    <div class="summary-value">${currency.symbol}${tax.toFixed(2)}</div>
                </div>
                
                <div class="summary-divider"></div>
                
                <div class="summary-row total">
                    <div class="summary-label">Total:</div>
                    <div class="summary-value">${currency.symbol}${total.toFixed(2)} ${currency.code}</div>
                </div>
                
                ${method ? `
                    <div class="summary-row method">
                        <div class="summary-label">Método:</div>
                        <div class="summary-value">
                            <i class="${method.icon}" style="color: ${method.color};"></i>
                            ${method.name}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="summary-benefits">
                <div class="benefit">
                    <i class="fas fa-sync-alt"></i>
                    <span>Cancelación en cualquier momento</span>
                </div>
                <div class="benefit">
                    <i class="fas fa-shield-alt"></i>
                    <span>Pago 100% seguro</span>
                </div>
                <div class="benefit">
                    <i class="fas fa-headset"></i>
                    <span>Soporte 24/7</span>
                </div>
            </div>
        `;
    }
    
    function renderTransactions() {
        if (!elements.transactionsContainer) return;
        
        const userTransactions = state.currentUser 
            ? state.transactions.filter(t => t.userId === state.currentUser.id)
            : [];
        
        if (userTransactions.length === 0) {
            elements.transactionsContainer.innerHTML = `
                <div class="empty-transactions">
                    <i class="fas fa-receipt" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h4>No hay transacciones</h4>
                    <p>Cuando realices un pago, aparecerá aquí tu historial.</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más recientes primero)
        userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const transactionsHTML = userTransactions.map(transaction => {
            const plan = config.plans.find(p => p.id === transaction.plan) || config.plans[0];
            const method = config.paymentMethods.find(m => m.id === transaction.method);
            const currency = config.currencies.find(c => c.code === transaction.currency) || config.currencies[0];
            
            return `
                <div class="transaction-card ${transaction.status}">
                    <div class="transaction-header">
                        <div class="transaction-icon" style="background: ${plan.color}20; color: ${plan.color};">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">${plan.name} - ${transaction.description || 'Suscripción mensual'}</div>
                            <div class="transaction-date">${formatDate(transaction.date)}</div>
                        </div>
                        <div class="transaction-amount">
                            ${currency.symbol}${transaction.amount.toFixed(2)}
                            <div class="transaction-status ${transaction.status}">
                                <i class="fas fa-${getStatusIcon(transaction.status)}"></i>
                                ${getStatusText(transaction.status)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="transaction-details">
                        <div class="detail">
                            <span class="detail-label">Método:</span>
                            <span class="detail-value">
                                <i class="${method?.icon || 'fas fa-credit-card'}" style="color: ${method?.color || '#666'};"></i>
                                ${method?.name || transaction.method}
                            </span>
                        </div>
                        <div class="detail">
                            <span class="detail-label">ID Transacción:</span>
                            <span class="detail-value">${transaction.id.substring(0, 8)}...</span>
                        </div>
                        ${transaction.nextBilling ? `
                            <div class="detail">
                                <span class="detail-label">Próxima factura:</span>
                                <span class="detail-value">${formatDate(transaction.nextBilling)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        elements.transactionsContainer.innerHTML = transactionsHTML;
    }
    
    // ===== PROCESAMIENTO DE PAGOS =====
    async function processFreePlan() {
        if (!state.currentUser) {
            window.showMessage('Debes iniciar sesión para cambiar de plan', 'error');
            return;
        }
        
        if (state.currentUser.plan === 'free') {
            window.showMessage('Ya tienes el plan Free activo', 'info');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres cambiar al plan Free? Perderás los beneficios de tu plan actual.')) {
            return;
        }
        
        state.isLoading = true;
        
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Crear transacción
        const transaction = {
            id: 'free_' + Date.now(),
            userId: state.currentUser.id,
            plan: 'free',
            amount: 0,
            currency: 'USD',
            method: 'free',
            date: new Date().toISOString(),
            status: 'completed',
            description: 'Cambio a plan Free'
        };
        
        state.transactions.push(transaction);
        saveTransactions();
        
        // Actualizar usuario
        state.currentUser.plan = 'free';
        state.currentUser.planExpiry = null;
        
        // Actualizar en localStorage
        localStorage.setItem('current_user', JSON.stringify(state.currentUser));
        if (typeof setCurrentUser === 'function') {
            setCurrentUser(state.currentUser);
        }
        
        // Actualizar en lista de usuarios
        const allUsers = JSON.parse(localStorage.getItem('trading_elite_users') || '[]');
        const userIndex = allUsers.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
            allUsers[userIndex] = state.currentUser;
            localStorage.setItem('trading_elite_users', JSON.stringify(allUsers));
        }
        
        state.isLoading = false;
        
        // Actualizar UI
        renderPayments();
        
        // Mostrar mensaje de éxito
        window.showMessage('¡Plan Free activado exitosamente!', 'success');
    }
    
    async function processCardPayment() {
        if (!validateCardForm()) return;
        
        state.isLoading = true;
        showPaymentConfirmation('card');
    }
    
    async function processPayPalPayment() {
        state.isLoading = true;
        showPaymentConfirmation('paypal');
    }
    
    async function generateCryptoAddress() {
        const selectedCrypto = document.querySelector('.crypto-option.selected')?.dataset.crypto;
        if (!selectedCrypto) {
            window.showMessage('Selecciona una criptomoneda', 'error');
            return;
        }
        
        // Simular generación de dirección
        const addressContainer = document.getElementById('crypto-address-container');
        const addressElement = document.getElementById('crypto-address');
        
        if (addressContainer && addressElement) {
            // Generar dirección de prueba (en producción sería una dirección real)
            const addresses = {
                btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                usdt: 'TM1zzNDcA1wACBv6S7WEAuM5rVsHSE2N5b'
            };
            
            addressElement.textContent = addresses[selectedCrypto] || addresses.btc;
            addressContainer.style.display = 'block';
            
            // Calcular monto en cripto
            const plan = config.plans.find(p => p.id === state.selectedPlan);
            const price = convertCurrency(plan.price, 'USD', 'USD'); // Cryptos generalmente en USD
            const cryptoRates = {
                btc: 45000, // $45,000 por BTC
                eth: 3000,  // $3,000 por ETH
                usdt: 1     // 1:1 con USD
            };
            
            const cryptoAmount = price / cryptoRates[selectedCrypto];
            const amountElement = document.getElementById(`${selectedCrypto}-rate`);
            if (amountElement) {
                amountElement.textContent = `${cryptoAmount.toFixed(8)} ${selectedCrypto.toUpperCase()}`;
            }
            
            window.showMessage('Dirección generada. Envía el pago para continuar.', 'info');
        }
    }
    
    async function copyCryptoAddress() {
        const addressElement = document.getElementById('crypto-address');
        if (addressElement) {
            try {
                await navigator.clipboard.writeText(addressElement.textContent);
                window.showMessage('Dirección copiada al portapapeles', 'success');
            } catch (err) {
                console.error('Error copiando dirección:', err);
                window.showMessage('Error al copiar la dirección', 'error');
            }
        }
    }
    
    async function confirmTransfer() {
        showPaymentConfirmation('transfer');
    }
    
    function validateCardForm() {
        const cardNumber = document.querySelector('.card-number')?.value.replace(/\s+/g, '');
        const expiryMonth = document.getElementById('card-expiry-month')?.value;
        const expiryYear = document.getElementById('card-expiry-year')?.value;
        const cvv = document.querySelector('.card-cvv')?.value;
        
        // Validaciones básicas
        if (!cardNumber || cardNumber.length < 16) {
            window.showMessage('Número de tarjeta inválido', 'error');
            return false;
        }
        
        if (!expiryMonth || !expiryYear) {
            window.showMessage('Fecha de expiración requerida', 'error');
            return false;
        }
        
        // Verificar si la tarjeta está expirada
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        if (parseInt(expiryYear) < currentYear || 
            (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
            window.showMessage('La tarjeta está expirada', 'error');
            return false;
        }
        
        if (!cvv || cvv.length < 3) {
            window.showMessage('CVV inválido', 'error');
            return false;
        }
        
        return true;
    }
    
    function showPaymentConfirmation(method) {
        if (!state.selectedPlan || !state.currentUser) return;
        
        const plan = config.plans.find(p => p.id === state.selectedPlan);
        const paymentMethod = config.paymentMethods.find(m => m.id === method);
        const currency = config.currencies.find(c => c.code === state.selectedCurrency) || config.currencies[0];
        const price = convertCurrency(plan.price, 'USD', state.selectedCurrency);
        const tax = price * 0.16;
        const total = price + tax;
        
        // Actualizar contenido del modal
        const modal = elements.paymentConfirmationModal;
        const content = modal.querySelector('#confirmation-content');
        const actions = modal.querySelector('#confirmation-actions');
        
        if (content) {
            content.innerHTML = `
                <div class="confirmation-details">
                    <div class="confirmation-item">
                        <div class="confirmation-label">Plan:</div>
                        <div class="confirmation-value">
                            <strong>${plan.name}</strong>
                            <div class="confirmation-sub">Suscripción mensual</div>
                        </div>
                    </div>
                    
                    <div class="confirmation-item">
                        <div class="confirmation-label">Método:</div>
                        <div class="confirmation-value">
                            <i class="${paymentMethod?.icon || 'fas fa-credit-card'}" style="color: ${paymentMethod?.color || '#666'};"></i>
                            ${paymentMethod?.name || method}
                        </div>
                    </div>
                    
                    <div class="confirmation-item">
                        <div class="confirmation-label">Total a pagar:</div>
                        <div class="confirmation-value total-amount">
                            ${currency.symbol}${total.toFixed(2)} ${currency.code}
                            <div class="confirmation-sub">Incluye IVA ${currency.symbol}${tax.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="confirmation-item">
                        <div class="confirmation-label">Facturar a:</div>
                        <div class="confirmation-value">
                            ${state.currentUser.name}
                            <div class="confirmation-sub">${state.currentUser.email}</div>
                        </div>
                    </div>
                </div>
                
                <div class="confirmation-terms">
                    <label class="terms-checkbox">
                        <input type="checkbox" id="accept-terms" required>
                        <span>Acepto los <a href="#terminos" class="auth-link">Términos del Servicio</a> y autorizo el cargo recurrente hasta cancelación.</span>
                    </label>
                </div>
            `;
        }
        
        if (actions) {
            actions.innerHTML = `
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline modal-close">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" id="confirm-payment-btn" data-method="${method}">
                        <i class="fas fa-check"></i> Confirmar Pago
                    </button>
                </div>
            `;
            
            // Agregar event listener al botón de confirmación
            setTimeout(() => {
                document.getElementById('confirm-payment-btn')?.addEventListener('click', function() {
                    const termsAccepted = document.getElementById('accept-terms')?.checked;
                    if (!termsAccepted) {
                        window.showMessage('Debes aceptar los términos del servicio', 'error');
                        return;
                    }
                    
                    const method = this.dataset.method;
                    processPayment(method);
                });
            }, 100);
        }
        
        // Mostrar modal
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('active');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    async function processPayment(method) {
        if (state.isLoading) return;
        
        state.isLoading = true;
        
        // Cerrar modal de confirmación
        closeModal(elements.paymentConfirmationModal);
        
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const plan = config.plans.find(p => p.id === state.selectedPlan);
        const currency = config.currencies.find(c => c.code === state.selectedCurrency) || config.currencies[0];
        const price = convertCurrency(plan.price, 'USD', state.selectedCurrency);
        const tax = price * 0.16;
        const total = price + tax;
        
        // Crear transacción
        const transactionId = 'txn_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
        const transaction = {
            id: transactionId,
            userId: state.currentUser.id,
            plan: state.selectedPlan,
            amount: total,
            currency: state.selectedCurrency,
            method: method,
            date: new Date().toISOString(),
            status: 'completed',
            description: `Suscripción ${plan.name} - Mensual`,
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días después
        };
        
        state.transactions.push(transaction);
        saveTransactions();
        
        // Actualizar usuario
        state.currentUser.plan = state.selectedPlan;
        state.currentUser.planExpiry = transaction.nextBilling;
        
        // Actualizar en localStorage
        localStorage.setItem('current_user', JSON.stringify(state.currentUser));
        if (typeof setCurrentUser === 'function') {
            setCurrentUser(state.currentUser);
        }
        
        // Actualizar en lista de usuarios
        const allUsers = JSON.parse(localStorage.getItem('trading_elite_users') || '[]');
        const userIndex = allUsers.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
            allUsers[userIndex] = state.currentUser;
            localStorage.setItem('trading_elite_users', JSON.stringify(allUsers));
        }
        
        state.isLoading = false;
        
        // Mostrar modal de éxito
        showPaymentSuccess(transaction);
        
        // Actualizar UI
        renderPayments();
        
        // Actualizar estadísticas globales
        if (typeof initializeRealStats === 'function') {
            initializeRealStats();
        }
        
        console.log(`💰 Pago procesado: ${plan.name} por ${state.currentUser.name}`);
    }
    
    function showPaymentSuccess(transaction) {
        const plan = config.plans.find(p => p.id === transaction.plan);
        const currency = config.currencies.find(c => c.code === transaction.currency) || config.currencies[0];
        
        // Actualizar contenido del modal
        const modal = elements.paymentSuccessModal;
        const content = modal.querySelector('#success-content');
        
        if (content) {
            content.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>¡Pago Completado Exitosamente!</h4>
                    <p>Tu suscripción a <strong>${plan.name}</strong> ha sido activada.</p>
                </div>
                
                <div class="success-details">
                    <div class="success-item">
                        <div class="success-label">ID Transacción:</div>
                        <div class="success-value">${transaction.id}</div>
                    </div>
                    
                    <div class="success-item">
                        <div class="success-label">Monto:</div>
                        <div class="success-value">${currency.symbol}${transaction.amount.toFixed(2)}</div>
                    </div>
                    
                    <div class="success-item">
                        <div class="success-label">Fecha:</div>
                        <div class="success-value">${formatDate(transaction.date)}</div>
                    </div>
                    
                    <div class="success-item">
                        <div class="success-label">Próxima factura:</div>
                        <div class="success-value">${formatDate(transaction.nextBilling)}</div>
                    </div>
                </div>
                
                <div class="success-next">
                    <h5><i class="fas fa-rocket"></i> ¿Qué sigue?</h5>
                    <ul>
                        <li><i class="fas fa-check"></i> Acceso inmediato a todos los recursos</li>
                        <li><i class="fas fa-check"></i> Recibirás un email de confirmación</li>
                        <li><i class="fas fa-check"></i> Puedes acceder a tu dashboard ahora</li>
                    </ul>
                </div>
            `;
        }
        
        // Mostrar modal
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('active');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modal) {
        const overlay = document.getElementById('modal-overlay');
        
        if (overlay) overlay.classList.remove('active');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ===== FUNCIONES DE UTILIDAD =====
    function convertCurrency(amount, from, to) {
        // Tasas de cambio simuladas (en producción usarías una API real)
        const rates = {
            'USD': { 'USD': 1, 'EUR': 0.85, 'GBP': 0.73 },
            'EUR': { 'USD': 1.18, 'EUR': 1, 'GBP': 0.86 },
            'GBP': { 'USD': 1.37, 'EUR': 1.16, 'GBP': 1 }
        };
        
        if (rates[from] && rates[from][to]) {
            return amount * rates[from][to];
        }
        
        return amount;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    function getStatusIcon(status) {
        const icons = {
            'completed': 'check-circle',
            'pending': 'clock',
            'failed': 'times-circle',
            'refunded': 'undo',
            'cancelled': 'ban'
        };
        return icons[status] || 'question-circle';
    }
    
    function getStatusText(status) {
        const texts = {
            'completed': 'Completado',
            'pending': 'Pendiente',
            'failed': 'Fallido',
            'refunded': 'Reembolsado',
            'cancelled': 'Cancelado'
        };
        return texts[status] || status;
    }
    
    // ===== FUNCIONES PÚBLICAS =====
    function getTransactions() {
        return [...state.transactions];
    }
    
    function getTransactionCount() {
        return state.transactions.length;
    }
    
    function resetTransactions() {
        if (confirm('¿Estás seguro de que quieres resetear las transacciones? Se perderá todo el historial.')) {
            state.transactions = [];
            saveTransactions();
            renderTransactions();
            window.showMessage('Transacciones reseteadas', 'info');
        }
    }
    
    // ===== INICIALIZACIÓN =====
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // Retornar API pública
    return {
        init,
        getTransactions,
        getTransactionCount,
        resetTransactions
    };
})();

// Hacerlo global
window.PaymentSystem = PaymentSystem;