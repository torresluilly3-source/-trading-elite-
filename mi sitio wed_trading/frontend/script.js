// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    colors: {
        neonRed: '#ff0000',
        neonGreen: '#00ffff',
        neonRedGlow: 'rgba(255, 0, 0, 0.7)',
        neonGreenGlow: 'rgba(0, 255, 255, 0.7)'
    }
};

// ===== VARIABLES GLOBALES =====
let currentUser = null;
let systemsLoaded = {
    auth: false,
    forum: false,
    calendar: false,
    payments: false
};

// ===== SISTEMA DE ESTADÍSTICAS REALES =====
function initializeRealStats() {
    console.log('📊 Inicializando estadísticas reales...');
    
    // Obtener usuarios reales
    const allUsers = JSON.parse(localStorage.getItem('trading_elite_users') || '[]');
    const activeUsers = allUsers.filter(u => u.active !== false).length;
    
    // Obtener posts reales del foro
    const forumPosts = JSON.parse(localStorage.getItem('trading_elite_forum_posts') || '[]');
    const activePosts = forumPosts.filter(p => !p.deleted).length;
    
    // Obtener sesiones de hoy
    const today = new Date().toISOString().split('T')[0];
    const calendarEvents = JSON.parse(localStorage.getItem('trading_elite_events') || '[]');
    const todaySessions = calendarEvents.filter(e => e.date === today).length;
    
    // Actualizar estadísticas en la UI
    updateStatsUI({
        traders: activeUsers || 1, // Mínimo 1 (el admin/tú)
        posts: activePosts,
        sessions: todaySessions,
        accuracy: '0%' // Iniciar en 0%
    });
    
    // Inicializar testimonios reales
    initializeRealTestimonials();
    
    console.log('✅ Estadísticas reales cargadas:', { activeUsers, activePosts, todaySessions });
}

function updateStatsUI(stats) {
    const tradersEl = document.getElementById('stats-traders');
    const postsEl = document.getElementById('stats-posts');
    const sessionsEl = document.getElementById('stats-sessions');
    const accuracyEl = document.getElementById('stats-accuracy');
    
    if (tradersEl) tradersEl.textContent = stats.traders;
    if (postsEl) postsEl.textContent = stats.posts;
    if (sessionsEl) sessionsEl.textContent = stats.sessions;
    if (accuracyEl) accuracyEl.textContent = stats.accuracy;
}

function initializeRealTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    
    // Obtener testimonios reales
    const testimonials = JSON.parse(localStorage.getItem('trading_elite_testimonials') || '[]');
    
    if (testimonials.length === 0) {
        // Mostrar placeholder si no hay testimonios
        container.innerHTML = `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <i class="fas fa-comment" style="color: var(--neon-green); font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p><strong>¡Aún no hay testimonios!</strong><br>
                    Sé el primero en compartir tu experiencia con la comunidad.</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">?</div>
                    <div class="author-info">
                        <h4>Próximo Trader</h4>
                        <span>Podría ser tú</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Mostrar testimonios reales
        container.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <i class="fas fa-quote-left" style="color: ${testimonial.avatarColor || '#ff0000'}; font-size: 1.5rem; margin-bottom: 1rem;"></i>
                    <p>"${testimonial.content}"</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar" style="background: ${testimonial.avatarColor || 'linear-gradient(135deg, #ff0000, #00ffff)'};">${testimonial.authorName?.charAt(0) || '?'}</div>
                    <div class="author-info">
                        <h4>${testimonial.authorName || 'Anónimo'}</h4>
                        <span>${testimonial.authorRole || 'Trader'} - ${testimonial.experience || 'Nueva cuenta'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function addTestimonial(content, authorName, authorRole = 'Trader', experience = 'Nueva cuenta') {
    const testimonials = JSON.parse(localStorage.getItem('trading_elite_testimonials') || '[]');
    
    const newTestimonial = {
        id: Date.now(),
        content: content,
        authorName: authorName || currentUser?.name || 'Anónimo',
        authorRole: authorRole,
        experience: experience,
        avatarColor: currentUser?.avatarColor || '#00ffff',
        date: new Date().toISOString().split('T')[0],
        verified: true
    };
    
    testimonials.push(newTestimonial);
    localStorage.setItem('trading_elite_testimonials', JSON.stringify(testimonials));
    
    // Actualizar UI
    initializeRealTestimonials();
    
    return newTestimonial;
}

// ===== FUNCIONES UTILITARIAS =====
function showMessage(text, type = 'info') {
    let container = document.getElementById('global-messages');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-messages';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
        `;
        document.body.appendChild(container);
    }
    
    const message = document.createElement('div');
    message.className = `global-message ${type}`;
    message.innerHTML = `
        <div style="
            background: ${type === 'error' ? '#ff0000' : type === 'success' ? '#00ffff' : '#ff0000'};
            color: black;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        ">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            ${text}
        </div>
    `;
    
    container.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateX(100%)';
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('current_user')) || null;
}

function setCurrentUser(user) {
    currentUser = user;
    if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('current_user');
    }
    updateAuthUI();
}

// ===== INICIALIZACIÓN DEL SISTEMA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando plataforma Trading Elite...');
    
    // Cargar usuario actual
    currentUser = getCurrentUser();
    
    // Inicializar sistemas básicos
    initNavigation();
    initModals();
    initBinaryParticles();
    initSmoothScroll();
    initMobileMenu();
    initScrollAnimations();
    
    // Inicializar estadísticas REALES
    initializeRealStats();
    
    // Verificar si los sistemas externos están cargados
    checkExternalSystems();
    
    // Actualizar UI inicial
    updateAuthUI();
    
    console.log('✅ Sistema base inicializado');
});

// ===== SISTEMA DE NAVEGACIÓN =====
function initNavigation() {
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Actualizar navegación activa
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Botones de auth
    document.getElementById('login-btn')?.addEventListener('click', function() {
        if (typeof AuthSystem !== 'undefined' && AuthSystem.openModal) {
            AuthSystem.openModal('login');
        } else {
            showMessage('Sistema de autenticación cargando...', 'info');
        }
    });
    
    document.getElementById('register-btn')?.addEventListener('click', function() {
        if (typeof AuthSystem !== 'undefined' && AuthSystem.openModal) {
            AuthSystem.openModal('register');
        } else {
            showMessage('Sistema de autenticación cargando...', 'info');
        }
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', function() {
        if (typeof AuthSystem !== 'undefined') {
            AuthSystem.logout();
        } else {
            setCurrentUser(null);
            showMessage('Sesión cerrada', 'info');
        }
    });
    
    // User profile toggle
    document.querySelector('.user-profile')?.addEventListener('click', function(e) {
        if (e.target.closest('.user-menu-item')) return;
        this.querySelector('.user-menu').classList.toggle('active');
    });
    
    console.log('🔍 Navegación inicializada');
}

// ===== SISTEMA DE MODALES =====
function initModals() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    // Abrir modal con data-modal
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-modal')) {
            const modalId = e.target.getAttribute('data-modal');
            const modal = document.getElementById(`modal-${modalId}`);
            if (modal) {
                openModal(modal);
            }
        }
    });
    
    // Cerrar modales
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeAllModals);
    }
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllModals();
    });
    
    function openModal(modal) {
        if (modalOverlay) modalOverlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeAllModals() {
        if (modalOverlay) modalOverlay.classList.remove('active');
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = '';
    }
    
    console.log('🗔 Sistema de modales inicializado');
}

// ===== PARTÍCULAS BINARIAS =====
function initBinaryParticles() {
    const container = document.getElementById('binary-particles');
    if (!container) return;
    
    const particles = ['1010', '0101', '1100', '0011', '1001', '0110'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'binary-particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 15}s`;
        particle.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
        particle.style.opacity = 0.1 + Math.random() * 0.3;
        particle.style.color = Math.random() > 0.5 ? 
            'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 255, 0.3)';
        particle.style.textShadow = Math.random() > 0.5 ? 
            '0 0 10px rgba(255, 0, 0, 0.5)' : '0 0 10px rgba(0, 255, 255, 0.5)';
        
        container.appendChild(particle);
    }
    
    console.log('🎲 Partículas binarias generadas');
}

// ===== SCROLL SUAVE =====
function initSmoothScroll() {
    console.log('🔍 Scroll suave activado');
}

// ===== ANIMACIONES AL SCROLL =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observar elementos importantes
    document.querySelectorAll('.method-card, .testimonial-card, .backup-content').forEach(el => {
        observer.observe(el);
    });
    
    console.log('🎭 Animaciones de scroll configuradas');
}

// ===== MENÚ MÓVIL =====
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.querySelector('.main-nav');
    
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        const icon = this.querySelector('i');
        icon.className = nav.classList.contains('active') 
            ? 'fas fa-times' 
            : 'fas fa-bars';
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-nav') && !e.target.closest('#mobile-toggle')) {
            nav.classList.remove('active');
            toggle.querySelector('i').className = 'fas fa-bars';
        }
    });
    
    console.log('📱 Menú móvil configurado');
}

// ===== ACTUALIZAR UI DE AUTENTICACIÓN =====
function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const body = document.body;
    
    if (currentUser) {
        // Usuario logueado
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            
            // Actualizar avatar
            const avatar = document.getElementById('user-avatar');
            if (avatar) {
                avatar.textContent = currentUser.name?.charAt(0)?.toUpperCase() || 'U';
                avatar.style.background = currentUser.avatarColor || 'linear-gradient(135deg, var(--neon-red), var(--neon-green))';
            }
            
            // Actualizar info
            const userName = document.querySelector('.user-name');
            const userPlan = document.querySelector('.user-plan');
            
            if (userName) userName.textContent = currentUser.name || 'Usuario';
            if (userPlan) userPlan.textContent = `Plan: ${currentUser.plan || 'Free'}`;
        }
        
        body.classList.add('logged-in');
    } else {
        // Usuario no logueado
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        
        body.classList.remove('logged-in');
    }
}

// ===== VERIFICAR SISTEMAS EXTERNOS =====
function checkExternalSystems() {
    const checkInterval = setInterval(() => {
        let allLoaded = true;
        
        // Verificar AuthSystem
        if (typeof AuthSystem !== 'undefined' && !systemsLoaded.auth) {
            systemsLoaded.auth = true;
            console.log('✅ AuthSystem cargado');
        }
        
        // Verificar ForumSystem
        if (typeof ForumSystem !== 'undefined' && !systemsLoaded.forum) {
            systemsLoaded.forum = true;
            console.log('✅ ForumSystem cargado');
        }
        
        // Verificar CalendarSystem
        if (typeof CalendarSystem !== 'undefined' && !systemsLoaded.calendar) {
            systemsLoaded.calendar = true;
            console.log('✅ CalendarSystem cargado');
        }
        
        // Verificar PaymentSystem
        if (typeof PaymentSystem !== 'undefined' && !systemsLoaded.payments) {
            systemsLoaded.payments = true;
            console.log('✅ PaymentSystem cargado');
        }
        
        // Verificar si todos están cargados
        allLoaded = systemsLoaded.auth && systemsLoaded.forum && 
                    systemsLoaded.calendar && systemsLoaded.payments;
        
        if (allLoaded) {
            clearInterval(checkInterval);
            console.log('🎉 ¡TODOS los sistemas cargados!');
            showMessage('Plataforma lista 🚀', 'success');
        }
    }, 500);
    
    // Timeout de seguridad
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⏰ Timeout de carga de sistemas');
        
        if (!systemsLoaded.auth) console.warn('❌ AuthSystem no cargó');
        if (!systemsLoaded.forum) console.warn('❌ ForumSystem no cargó');
        if (!systemsLoaded.calendar) console.warn('❌ CalendarSystem no cargó');
        if (!systemsLoaded.payments) console.warn('❌ PaymentSystem no cargó');
    }, 10000);
}

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const header = document.getElementById('main-header');
    if (!header) return;
    
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
        header.style.background = 'rgba(5, 5, 5, 0.98)';
    } else {
        header.style.boxShadow = 'none';
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    }
    
    // Actualizar navegación activa según scroll
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.showMessage = showMessage;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.initializeRealStats = initializeRealStats;
window.addTestimonial = addTestimonial;

// ===== ANIMACIÓN CSS DINÁMICA =====
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .global-message {
        animation: slideIn 0.3s ease;
    }
    
    .logged-in .auth-buttons {
        display: none !important;
    }
    
    .logged-in .user-profile {
        display: flex !important;
    }
    
    .user-menu.active {
        display: block !important;
    }
    
    /* Animaciones para elementos al aparecer */
    .method-card, .testimonial-card, .backup-content {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .method-card.visible, .testimonial-card.visible, .backup-content.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(dynamicStyles);

console.log('✨ Estilos dinámicos cargados');

// ===== INTEGRACIÓN DEL SISTEMA DE AUTH =====
setTimeout(() => {
    if (typeof AuthSystem !== 'undefined') {
        console.log('🔗 Integrando sistema de autenticación...');
        
        // Sincronizar usuario actual
        if (AuthSystem.currentUser && !currentUser) {
            setCurrentUser(AuthSystem.currentUser);
        }
        
        // Actualizar estadísticas después del registro
        if (typeof AuthSystem.onNewUserRegistered === 'function') {
            AuthSystem.onNewUserRegistered = function() {
                initializeRealStats();
            };
        }
        
        console.log('✅ Sistema de auth integrado');
    }
}, 1000);

// ===== INICIALIZACIÓN FINAL =====
window.addEventListener('load', function() {
    console.log('📄 Página completamente cargada');
    
    // Actualizar estadísticas finales
    setTimeout(initializeRealStats, 500);
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        if (!currentUser) {
            showMessage('Bienvenido a Trading Elite 👋', 'info');
        }
    }, 1000);
});

// ===== MENSAJE FINAL =====
console.log(`
╔═══════════════════════════════════════╗
║    TRADING ELITE - SISTEMA REAL      ║
╠═══════════════════════════════════════╣
║ ✅ Navegación suave                  ║
║ ✅ Sistema de modales                ║
║ ✅ Partículas binarias               ║
║ ✅ Menú móvil responsive             ║
║ ✅ Gestión de autenticación          ║
║ ✅ Sistema de mensajes               ║
║ ✅ Header scroll effect              ║
║ ✅ Animaciones al scroll             ║
║ ✅ Estadísticas REALES               ║
║ ✅ Testimonios REALES                ║
║ ✅ Sistema 100% real - SIN DEMO      ║
╚═══════════════════════════════════════╝
`);