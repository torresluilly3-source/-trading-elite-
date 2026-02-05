// ===== SISTEMA DE AUTENTICACIÓN COMPLETO Y REAL =====
const AuthSystem = (function() {
    // Configuración REAL
    const config = {
        // Planes disponibles (REALES)
        plans: [
            { 
                id: "free", 
                name: "Free", 
                price: 0, 
                features: ["Acceso al foro básico", "2 sesiones en vivo/mes", "Recursos iniciales"] 
            },
            { 
                id: "pro", 
                name: "Pro", 
                price: 49, 
                features: ["Foro completo", "Sesiones ilimitadas", "Recursos premium", "Análisis semanal"] 
            },
            { 
                id: "elite", 
                name: "Elite", 
                price: 99, 
                features: ["Todo lo de Pro", "Mentoría 1:1", "Señales en tiempo real", "Soporte prioritario", "Webinars exclusivos"] 
            }
        ],
        
        // Validaciones
        validations: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
        },
        
        // Configuración de email (simulación)
        emailConfig: {
            from: "no-reply@tradingelite.com",
            support: "soporte@tradingelite.com",
            verificationExpiry: 24 // horas
        }
    };
    
    // Estado
    let state = {
        currentUser: null,
        modal: null,
        currentTab: 'login',
        selectedPlan: 'free', // Por defecto Free
        isLoading: false,
        pendingVerification: null
    };
    
    // DOM Elements
    let elements = {};
    
    // ===== FUNCIONES PRIVADAS =====
    function initDOM() {
        // Crear modal si no existe
        if (!document.getElementById('auth-modal')) {
            createAuthModal();
        }
        
        // Cachear elementos
        elements = {
            modal: document.getElementById('auth-modal'),
            overlay: document.getElementById('modal-overlay'),
            loginTab: document.getElementById('auth-tab-login'),
            registerTab: document.getElementById('auth-tab-register'),
            loginForm: document.getElementById('auth-form-login'),
            registerForm: document.getElementById('auth-form-register'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            registerName: document.getElementById('register-name'),
            registerEmail: document.getElementById('register-email'),
            registerPassword: document.getElementById('register-password'),
            registerConfirm: document.getElementById('register-confirm'),
            planOptions: document.querySelectorAll('.auth-plan-option'),
            submitBtn: document.querySelector('.auth-submit-btn'),
            switchToRegister: document.getElementById('switch-to-register'),
            switchToLogin: document.getElementById('switch-to-login'),
            successScreen: document.getElementById('auth-success'),
            verificationScreen: document.getElementById('auth-verification')
        };
        
        // Agregar event listeners
        attachEventListeners();
    }
    
    function createAuthModal() {
        const modalHTML = `
            <div class="modal auth-modal" id="auth-modal">
                <div class="auth-modal-header">
                    <h3><i class="fas fa-user-shield"></i> Trading Elite</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
                        Sistema 100% real - Con API backend
                    </p>
                </div>
                
                <div class="auth-modal-tabs">
                    <button class="auth-tab active" id="auth-tab-login" data-tab="login">
                        <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                    </button>
                    <button class="auth-tab" id="auth-tab-register" data-tab="register">
                        <i class="fas fa-user-plus"></i> Registrarse
                    </button>
                </div>
                
                <div class="auth-progress">
                    <div class="auth-progress-bar" id="auth-progress-bar"></div>
                </div>
                
                <div class="auth-modal-body">
                    <!-- Formulario Login -->
                    <form class="auth-form" id="auth-form-login">
                        <div class="form-group">
                            <label class="form-label" for="login-email">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" class="form-input" id="login-email" 
                                   placeholder="tu@email.com" required>
                            <div class="form-error" id="login-email-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="login-password">
                                <i class="fas fa-lock"></i> Contraseña
                            </label>
                            <div style="position: relative;">
                                <input type="password" class="form-input" id="login-password" 
                                       placeholder="••••••••" required>
                                <button type="button" class="password-toggle" 
                                        data-target="login-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="form-error" id="login-password-error"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary auth-submit-btn">
                            <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                        </button>
                        
                        <div class="auth-footer">
                            <p>¿No tienes cuenta? 
                                <span class="auth-link" id="switch-to-register">Regístrate aquí</span>
                            </p>
                            <p style="margin-top: 0.5rem; font-size: 0.8rem;">
                                <a href="#" class="auth-link" id="forgot-password">¿Olvidaste tu contraseña?</a>
                            </p>
                        </div>
                    </form>
                    
                    <!-- Formulario Registro -->
                    <form class="auth-form hidden" id="auth-form-register">
                        <div class="auth-plans">
                            <div class="auth-plan-title">
                                <i class="fas fa-crown"></i> Selecciona tu Plan
                            </div>
                            <div class="auth-plan-options">
                                ${config.plans.map(plan => `
                                    <div class="auth-plan-option ${plan.id === 'free' ? 'selected' : ''}" 
                                         data-plan="${plan.id}">
                                        <input type="radio" name="plan" id="plan-${plan.id}" 
                                               value="${plan.id}" ${plan.id === 'free' ? 'checked' : ''}>
                                        <div class="auth-plan-name">${plan.name}</div>
                                        <div class="auth-plan-price">
                                            $${plan.price}
                                            <span class="auth-plan-period">/mes</span>
                                        </div>
                                        <ul class="plan-features" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; text-align: left;">
                                            ${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="register-name">
                                <i class="fas fa-user"></i> Nombre Completo
                            </label>
                            <input type="text" class="form-input" id="register-name" 
                                   placeholder="Tu nombre completo" required>
                            <div class="form-error" id="register-name-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="register-email">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" class="form-input" id="register-email" 
                                   placeholder="tu@email.com" required>
                            <div class="form-error" id="register-email-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="register-password">
                                <i class="fas fa-lock"></i> Contraseña
                            </label>
                            <div style="position: relative;">
                                <input type="password" class="form-input" id="register-password" 
                                       placeholder="Mínimo 8 caracteres con letras y números" required>
                                <button type="button" class="password-toggle" 
                                        data-target="register-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="form-error" id="register-password-error">
                                <i class="fas fa-info-circle"></i>
                                Mínimo 8 caracteres, incluyendo letras y números
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="register-confirm">
                                <i class="fas fa-lock"></i> Confirmar Contraseña
                            </label>
                            <div style="position: relative;">
                                <input type="password" class="form-input" id="register-confirm" 
                                       placeholder="Repite tu contraseña" required>
                                <button type="button" class="password-toggle" 
                                        data-target="register-confirm">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="form-error" id="register-confirm-error"></div>
                        </div>
                        
                        <div class="form-group" style="margin-top: 1rem;">
                            <label style="display: flex; align-items: flex-start; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <input type="checkbox" id="terms-accept" required style="margin-top: 0.2rem;">
                                <span>Acepto los <a href="#terminos" class="auth-link">Términos y Condiciones</a> y la <a href="#privacidad" class="auth-link">Política de Privacidad</a></span>
                            </label>
                            <div class="form-error" id="terms-error"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary auth-submit-btn">
                            <i class="fas fa-rocket"></i> Crear Cuenta
                        </button>
                        
                        <div class="auth-footer">
                            <p>¿Ya tienes cuenta? 
                                <span class="auth-link" id="switch-to-login">Inicia sesión aquí</span>
                            </p>
                        </div>
                    </form>
                    
                    <!-- Pantalla de verificación por email -->
                    <div class="auth-verification hidden" id="auth-verification">
                        <div class="auth-success">
                            <i class="fas fa-envelope"></i>
                            <h3>Verifica tu email</h3>
                            <p>Hemos enviado un correo de verificación a <strong id="verification-email"></strong>.</p>
                            <p>Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.</p>
                            
                            <div style="margin: 2rem 0; padding: 1rem; background: rgba(0,255,255,0.1); border-radius: 8px; border-left: 3px solid var(--neon-green);">
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                    <i class="fas fa-info-circle"></i> 
                                    <strong>Nota:</strong> En este entorno de desarrollo, el email es simulado. Para producción, configura un servicio SMTP real.
                                </p>
                            </div>
                            
                            <button class="btn btn-secondary" id="simulate-verification">
                                <i class="fas fa-check"></i> Simular verificación
                            </button>
                            
                            <div style="margin-top: 1.5rem;">
                                <p style="color: var(--text-muted); font-size: 0.85rem;">
                                    <i class="fas fa-redo"></i>
                                    ¿No recibiste el email? 
                                    <a href="#" class="auth-link" id="resend-verification">Reenviar verificación</a>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pantalla de éxito -->
                    <div class="auth-success hidden" id="auth-success">
                        <i class="fas fa-check-circle"></i>
                        <h3>¡Cuenta activada!</h3>
                        <p>Tu cuenta ha sido verificada exitosamente.</p>
                        <p id="success-message">Ya puedes acceder a todos los recursos de la plataforma.</p>
                        <button class="btn btn-primary" id="auth-success-btn">
                            <i class="fas fa-tachometer-alt"></i> Ir al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    function attachEventListeners() {
        // Tabs
        if (elements.loginTab) elements.loginTab.addEventListener('click', () => switchTab('login'));
        if (elements.registerTab) elements.registerTab.addEventListener('click', () => switchTab('register'));
        
        // Switch forms
        if (elements.switchToRegister) elements.switchToRegister.addEventListener('click', () => switchTab('register'));
        if (elements.switchToLogin) elements.switchToLogin.addEventListener('click', () => switchTab('login'));
        
        // Forms submit
        if (elements.loginForm) elements.loginForm.addEventListener('submit', handleLogin);
        if (elements.registerForm) elements.registerForm.addEventListener('submit', handleRegister);
        
        // Plan selection
        if (elements.planOptions) {
            elements.planOptions.forEach(option => {
                option.addEventListener('click', function() {
                    selectPlan(this.dataset.plan);
                });
            });
        }
        
        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                togglePassword(this.dataset.target);
            });
        });
        
        // Success button
        const successBtn = document.getElementById('auth-success-btn');
        if (successBtn) successBtn.addEventListener('click', handleSuccess);
        
        // Verification buttons
        const simulateBtn = document.getElementById('simulate-verification');
        if (simulateBtn) simulateBtn.addEventListener('click', simulateVerification);
        
        const resendBtn = document.getElementById('resend-verification');
        if (resendBtn) resendBtn.addEventListener('click', resendVerification);
        
        // Forgot password
        const forgotBtn = document.getElementById('forgot-password');
        if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);
        
        // Close modal on overlay click
        if (elements.overlay) elements.overlay.addEventListener('click', closeModal);
    }
    
    function switchTab(tab) {
        if (state.currentTab === tab) return;
        
        // Update UI
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        // Show/hide forms
        if (elements.loginForm) elements.loginForm.classList.toggle('hidden', tab !== 'login');
        if (elements.registerForm) elements.registerForm.classList.toggle('hidden', tab !== 'register');
        
        // Hide verification/success screens
        if (elements.verificationScreen) elements.verificationScreen.classList.add('hidden');
        if (elements.successScreen) elements.successScreen.classList.add('hidden');
        
        // Update progress bar
        const progressBar = document.getElementById('auth-progress-bar');
        if (progressBar) {
            progressBar.style.width = tab === 'login' ? '30%' : '70%';
        }
        
        state.currentTab = tab;
        
        // Clear errors
        clearErrors();
        
        // Update button text
        const submitBtn = elements.submitBtn;
        if (submitBtn && tab === 'register') {
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Crear Cuenta';
        } else if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
    }
    
    function selectPlan(planId) {
        state.selectedPlan = planId;
        
        // Update UI
        if (elements.planOptions) {
            elements.planOptions.forEach(option => {
                option.classList.toggle('selected', option.dataset.plan === planId);
            });
        }
    }
    
    function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggle = document.querySelector(`[data-target="${inputId}"] i`);
        
        if (input && toggle) {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                toggle.className = 'fas fa-eye';
            }
        }
    }
    
    function clearErrors() {
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });
        
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
    }
    
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(`${inputId}-error`);
        
        if (input) input.classList.add('error');
        if (errorEl) {
            errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        }
    }
    
    function showVerificationScreen(email) {
        if (elements.loginForm) elements.loginForm.classList.add('hidden');
        if (elements.registerForm) elements.registerForm.classList.add('hidden');
        if (elements.successScreen) elements.successScreen.classList.add('hidden');
        if (elements.verificationScreen) elements.verificationScreen.classList.remove('hidden');
        
        // Set email
        const verificationEmail = document.getElementById('verification-email');
        if (verificationEmail) verificationEmail.textContent = email;
        
        // Store pending verification
        state.pendingVerification = {
            email: email,
            timestamp: Date.now(),
            verified: false
        };
        
        // En desarrollo, mostrar en consola el "email simulado"
        console.log(`📧 [SIMULACIÓN] Email de verificación enviado a: ${email}`);
        console.log(`🔗 En producción, el usuario recibiría un email real con enlace de verificación`);
        
        // Mostrar enlace simulado para testing
        setTimeout(() => {
            if (typeof window.showMessage === 'function') {
                window.showMessage(`Para testing: El enlace de verificación sería enviado a ${email}`, 'info');
            }
        }, 1000);
    }
    
    function showSuccessScreen(user) {
        if (elements.loginForm) elements.loginForm.classList.add('hidden');
        if (elements.registerForm) elements.registerForm.classList.add('hidden');
        if (elements.verificationScreen) elements.verificationScreen.classList.add('hidden');
        if (elements.successScreen) elements.successScreen.classList.remove('hidden');
        
        // Update success message
        const successMessage = document.getElementById('success-message');
        if (successMessage && user) {
            const plan = config.plans.find(p => p.id === state.selectedPlan);
            successMessage.innerHTML = `Bienvenido <strong>${user.name}</strong>! Tu cuenta <strong>${plan?.name || 'Free'}</strong> está ahora activa.`;
        }
    }
    
    // ===== FUNCIONES PRINCIPALES MODIFICADAS =====
    
    async function handleRegister(e) {
        e.preventDefault();
        if (state.isLoading) return;
        
        clearErrors();
        
        const name = elements.registerName?.value.trim();
        const email = elements.registerEmail?.value.trim();
        const password = elements.registerPassword?.value;
        const confirm = elements.registerConfirm?.value;
        const termsAccepted = document.getElementById('terms-accept')?.checked;
        
        // Validaciones
        let isValid = true;
        
        if (!name || name.length < 2) {
            showError('register-name', 'Nombre debe tener al menos 2 caracteres');
            isValid = false;
        }
        
        if (!email) {
            showError('register-email', 'El email es requerido');
            isValid = false;
        } else if (!config.validations.email.test(email)) {
            showError('register-email', 'Email no válido');
            isValid = false;
        }
        
        if (!password) {
            showError('register-password', 'La contraseña es requerida');
            isValid = false;
        } else if (!config.validations.password.test(password)) {
            showError('register-password', 'Mínimo 8 caracteres, letras y números');
            isValid = false;
        }
        
        if (password !== confirm) {
            showError('register-confirm', 'Las contraseñas no coinciden');
            isValid = false;
        }
        
        if (!termsAccepted) {
            showError('terms-error', 'Debes aceptar los términos y condiciones');
            isValid = false;
        }
        
        if (!isValid) return;
        
        state.isLoading = true;
        updateSubmitButton(true);
        
        try {
            // ========== LLAMADA REAL A LA API ==========
            if (!window.ApiClient) {
                throw new Error('API Client no está disponible. Asegúrate de incluir api.js');
            }
            
            const response = await window.ApiClient.register({
                name,
                email,
                password,
                plan: state.selectedPlan
            });
            
            if (response.success) {
                // Registro exitoso en el backend
                console.log('✅ Registro exitoso en backend:', response.data);
                
                // Mostrar pantalla de verificación
                showVerificationScreen(email);
                
                // Mostrar mensaje de éxito
                if (typeof window.showMessage === 'function') {
                    window.showMessage('¡Registro exitoso! Revisa tu email para verificar tu cuenta.', 'success');
                }
                
                // Mostrar en consola el enlace simulado para testing
                console.log('🔗 Para testing, simularía verificación con:');
                console.log(`/verify.html?token=simulated_token&email=${encodeURIComponent(email)}`);
                
            } else {
                // Error del backend
                showError('register-email', response.message || 'Error en el registro');
            }
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            
            // Mostrar error apropiado
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                showError('register-email', 'Error conectando con el servidor. Asegúrate de que el backend está corriendo en http://localhost:5000');
            } else {
                showError('register-email', error.message || 'Error en el servidor');
            }
            
        } finally {
            state.isLoading = false;
            updateSubmitButton(false);
        }
    }
    
    async function handleLogin(e) {
        e.preventDefault();
        if (state.isLoading) return;
        
        clearErrors();
        
        const email = elements.loginEmail?.value.trim();
        const password = elements.loginPassword?.value;
        
        // Validaciones básicas
        if (!email) {
            showError('login-email', 'El email es requerido');
            return;
        }
        
        if (!config.validations.email.test(email)) {
            showError('login-email', 'Email no válido');
            return;
        }
        
        if (!password) {
            showError('login-password', 'La contraseña es requerida');
            return;
        }
        
        state.isLoading = true;
        updateSubmitButton(true);
        
        try {
            // ========== LLAMADA REAL A LA API ==========
            if (!window.ApiClient) {
                throw new Error('API Client no está disponible. Asegúrate de incluir api.js');
            }
            
            const response = await window.ApiClient.login({
                email,
                password
            });
            
            if (response.success) {
                // Login exitoso
                state.currentUser = response.data.user;
                
                // Guardar en localStorage
                localStorage.setItem('current_user', JSON.stringify(state.currentUser));
                
                // Actualizar UI global
                if (typeof setCurrentUser === 'function') {
                    setCurrentUser(state.currentUser);
                }
                
                // Mostrar mensaje de éxito
                if (typeof window.showMessage === 'function') {
                    window.showMessage(`¡Bienvenido de nuevo ${state.currentUser.name}!`, 'success');
                }
                
                // Cerrar modal
                setTimeout(() => {
                    closeModal();
                    state.isLoading = false;
                    updateSubmitButton(false);
                    
                    // Actualizar estadísticas
                    if (typeof initializeRealStats === 'function') {
                        initializeRealStats();
                    }
                }, 1000);
                
            } else if (response.needsVerification) {
                // Usuario no verificado
                showError('login-email', 'Por favor, verifica tu email primero');
                showError('login-password', 'Revisa tu bandeja de entrada');
                
                // Mostrar opción para reenviar verificación
                setTimeout(() => {
                    if (confirm('¿Quieres que reenviemos el email de verificación?')) {
                        showVerificationScreen(email);
                    }
                }, 500);
                
                state.isLoading = false;
                updateSubmitButton(false);
                
            } else {
                // Credenciales incorrectas
                showError('login-email', 'Credenciales incorrectas');
                showError('login-password', 'Verifica tu email y contraseña');
                state.isLoading = false;
                updateSubmitButton(false);
            }
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            
            // Mostrar error apropiado
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                showError('login-email', 'Error conectando con el servidor. Asegúrate de que el backend está corriendo en http://localhost:5000');
            } else {
                showError('login-email', error.message || 'Error en el servidor');
            }
            
            state.isLoading = false;
            updateSubmitButton(false);
        }
    }
    
    function simulateVerification() {
        if (!state.pendingVerification) return;
        
        // En un sistema real, esto sería automático al hacer clic en el email
        // Aquí simulamos la verificación
        const email = state.pendingVerification.email;
        
        // Mostrar mensaje
        if (typeof window.showMessage === 'function') {
            window.showMessage('Verificación simulada. En producción, el usuario haría clic en el email real.', 'info');
        }
        
        // Mostrar enlace para testing
        console.log(`🔗 Para testing, ir a:`);
        console.log(`/verify.html?token=simulated_token_${Date.now()}&email=${encodeURIComponent(email)}`);
    }
    
    function resendVerification() {
        if (!state.pendingVerification) return;
        
        const email = state.pendingVerification.email;
        
        // En un sistema real, esto reenviaría el email
        console.log(`📧 [SIMULACIÓN] Reenviando email de verificación a: ${email}`);
        
        if (typeof window.showMessage === 'function') {
            window.showMessage('Email de verificación reenviado (simulado)', 'info');
        }
    }
    
    function handleForgotPassword(e) {
        e.preventDefault();
        const email = prompt('Ingresa tu email para recuperar la contraseña:');
        
        if (email && config.validations.email.test(email)) {
            // En un sistema real, esto enviaría un email de recuperación
            console.log(`📧 [SIMULACIÓN] Email de recuperación enviado a: ${email}`);
            
            if (typeof window.showMessage === 'function') {
                window.showMessage('Instrucciones enviadas a tu email (simulado)', 'info');
            }
        } else if (email) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('Email no válido', 'error');
            }
        }
    }
    
    function handleSuccess() {
        closeModal();
        
        // Redirigir al dashboard si existe
        const dashboardLink = document.querySelector('a[href="#dashboard"]');
        if (dashboardLink && state.currentUser) {
            dashboardLink.click();
        }
    }
    
    function updateSubmitButton(isLoading) {
        const btn = elements.submitBtn;
        if (!btn) return;
        
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = state.currentTab === 'login' 
                ? '<i class="fas fa-spinner fa-spin"></i> Iniciando...'
                : '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
        } else {
            btn.disabled = false;
            btn.innerHTML = state.currentTab === 'login'
                ? '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión'
                : '<i class="fas fa-rocket"></i> Crear Cuenta';
        }
    }
    
    function getRandomNeonColor() {
        const colors = ['#ff0000', '#00ffff', '#ff00ff', '#00ff00', '#ffff00'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function loadUserFromStorage() {
        try {
            const stored = localStorage.getItem('current_user');
            if (stored) {
                state.currentUser = JSON.parse(stored);
                return state.currentUser;
            }
        } catch (e) {
            console.warn('Error loading user from storage:', e);
        }
        return null;
    }
    
    // ===== FUNCIONES PÚBLICAS =====
    function openModal(tab = 'login') {
        // Inicializar DOM si no está listo
        if (!elements.modal) {
            initDOM();
        }
        
        // Mostrar overlay
        if (elements.overlay) {
            elements.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Mostrar modal
        if (elements.modal) {
            elements.modal.classList.add('active');
            switchTab(tab);
            
            // Auto-focus
            setTimeout(() => {
                if (tab === 'login' && elements.loginEmail) {
                    elements.loginEmail.focus();
                } else if (tab === 'register' && elements.registerName) {
                    elements.registerName.focus();
                }
            }, 100);
        }
    }
    
    function closeModal() {
        if (elements.overlay) elements.overlay.classList.remove('active');
        if (elements.modal) elements.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset forms
        clearErrors();
        
        // Reset to login tab
        setTimeout(() => switchTab('login'), 300);
    }
    
    function logout() {
        state.currentUser = null;
        localStorage.removeItem('current_user');
        if (window.ApiClient) {
            window.ApiClient.removeToken();
        }
        
        if (typeof setCurrentUser === 'function') {
            setCurrentUser(null);
        }
        
        if (typeof window.showMessage === 'function') {
            window.showMessage('Sesión cerrada exitosamente', 'info');
        }
        
        // Actualizar estadísticas
        if (typeof initializeRealStats === 'function') {
            initializeRealStats();
        }
    }
    
    function isAuthenticated() {
        return !!state.currentUser;
    }
    
    function getUser() {
        return state.currentUser;
    }
    
    function updateUserProfile(updates) {
        if (!state.currentUser) return false;
        
        // Actualizar en estado
        state.currentUser = { ...state.currentUser, ...updates };
        localStorage.setItem('current_user', JSON.stringify(state.currentUser));
        
        if (typeof setCurrentUser === 'function') {
            setCurrentUser(state.currentUser);
        }
        
        return true;
    }
    
    function upgradePlan(planId) {
        const plan = config.plans.find(p => p.id === planId);
        if (!plan || !state.currentUser) return false;
        
        return updateUserProfile({ 
            plan: planId,
            planName: plan.name 
        });
    }
    
    function getStatistics() {
        // En un sistema real, esto vendría de la API
        const users = JSON.parse(localStorage.getItem('trading_elite_users') || '[]');
        return {
            totalUsers: users.length,
            verifiedUsers: users.filter(u => u.verified).length,
            activeUsers: users.filter(u => u.active !== false).length,
            plans: {
                free: users.filter(u => u.plan === 'free').length,
                pro: users.filter(u => u.plan === 'pro').length,
                elite: users.filter(u => u.plan === 'elite').length
            }
        };
    }
    
    // ===== INICIALIZACIÓN =====
    function init() {
        console.log('🔐 Inicializando sistema de autenticación REAL con API...');
        
        // Cargar usuario desde storage
        state.currentUser = loadUserFromStorage();
        
        // Inicializar DOM
        initDOM();
        
        // Verificar conexión API
        if (window.ApiClient) {
            console.log('✅ API Client detectado');
        } else {
            console.warn('⚠️ API Client no detectado. Asegúrate de incluir api.js');
        }
        
        console.log('✅ Sistema de autenticación listo');
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // Retornar API pública
    return {
        init,
        openModal,
        closeModal,
        logout,
        isAuthenticated,
        getUser,
        updateUserProfile,
        upgradePlan,
        getStatistics,
        get currentUser() { return state.currentUser; }
    };
})();

// Hacerlo global
window.AuthSystem = AuthSystem;