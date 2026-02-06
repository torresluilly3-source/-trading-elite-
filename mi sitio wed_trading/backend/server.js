// trading-elite-real/backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SIMULACIÓN DE BASE DE DATOS (para empezar)
let users = [];

// Rutas de API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, plan = 'free' } = req.body;
        
        // Verificar si el usuario ya existe
        if (users.find(u => u.email === email)) {
            return res.status(400).json({
                success: false,
                message: 'Este email ya está registrado'
            });
        }
        
        // Crear usuario
        const user = {
            id: Date.now(),
            name,
            email,
            password, // EN PRODUCCIÓN: Encriptar con bcrypt
            plan,
            verified: false,
            verificationToken: Math.random().toString(36).substring(2) + Date.now().toString(36),
            createdAt: new Date(),
            avatarColor: getRandomColor()
        };
        
        users.push(user);
        
        // SIMULAR ENVÍO DE EMAIL (en producción usarías nodemailer)
        console.log('📧 EMAIL SIMULADO ENVIADO A:', email);
        console.log('🔗 Enlace de verificación:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify.html?token=${user.verificationToken}&email=${email}`);
        
        res.status(201).json({
            success: true,
            message: '¡Registro exitoso! Revisa tu email para verificar tu cuenta.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: user.plan
            }
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }
        
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: 'Por favor, verifica tu email primero',
                needsVerification: true
            });
        }
        
        // Token simple (en producción usar JWT)
        const token = `token_${Date.now()}_${user.id}`;
        
        res.json({
            success: true,
            message: `¡Bienvenido ${user.name}!`,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan,
                    verified: user.verified,
                    avatarColor: user.avatarColor,
                    joinDate: user.createdAt
                }
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

app.get('/api/auth/verify-email', async (req, res) => {
    try {
        const { token, email } = req.query;
        
        const userIndex = users.findIndex(u => 
            u.email === email && 
            u.verificationToken === token
        );
        
        if (userIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificación inválido'
            });
        }
        
        // Marcar como verificado
        users[userIndex].verified = true;
        users[userIndex].verificationToken = null;
        
        // Token simple
        const newToken = `token_${Date.now()}_${users[userIndex].id}`;
        
        res.json({
            success: true,
            message: '¡Email verificado exitosamente!',
            data: {
                token: newToken,
                user: users[userIndex]
            }
        });
        
    } catch (error) {
        console.error('Error verificando email:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando email'
        });
    }
});

// ============================================
// RUTAS PARA FRONTEND - AGREGAR DESPUÉS DE AUTH
// ============================================

// 1. RUTAS DE PAGOS
app.get('/api/payments/plans', (req, res) => {
    res.json({
        success: true,
        data: {
            plans: [
                {
                    id: 'free',
                    name: 'Free',
                    price: 0,
                    features: [
                        'Acceso básico al foro',
                        'Análisis limitados', 
                        'Soporte por email',
                        'Comunidad básica'
                    ],
                    color: '#666'
                },
                {
                    id: 'premium',
                    name: 'Premium',
                    price: 29,
                    features: [
                        'Todos los features Free',
                        'Análisis avanzados',
                        'Señales en tiempo real',
                        'Soporte prioritario',
                        'Webinars exclusivos'
                    ],
                    color: '#ffd700'
                },
                {
                    id: 'pro',
                    name: 'Pro Trader',
                    price: 79,
                    features: [
                        'Todos los features Premium',
                        'Señales premium + alertas',
                        'Mentoría personalizada',
                        'Herramientas avanzadas',
                        'Acceso VIP a eventos'
                    ],
                    color: '#0af'
                },
                {
                    id: 'vip',
                    name: 'VIP Elite',
                    price: 199,
                    features: [
                        'Todos los features Pro',
                        'Soporte 24/7 dedicado',
                        'Estrategias personalizadas',
                        'Reuniones 1-on-1',
                        'Acceso a beta features'
                    ],
                    color: '#f0f'
                }
            ]
        }
    });
});

app.get('/api/payments/transactions', (req, res) => {
    res.json({
        success: true,
        data: {
            transactions: []
        }
    });
});

// 2. RUTAS DE CALENDARIO
app.get('/api/calendar/events', (req, res) => {
    res.json({
        success: true,
        data: {
            events: [
                {
                    id: '1',
                    title: 'Webinar: Introducción al Trading',
                    type: 'webinar',
                    start_time: new Date().toISOString(),
                    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    description: 'Webinar gratuito para principiantes',
                    link: '#',
                    location: 'Online',
                    creator: { name: 'Juan Pérez', plan: 'pro' }
                },
                {
                    id: '2',
                    title: 'Análisis Mercado Mañana',
                    type: 'analysis',
                    start_time: new Date(Date.now() + 86400000).toISOString(), // Mañana
                    description: 'Análisis diario del mercado',
                    location: 'Sala de Trading',
                    creator: { name: 'Sistema', plan: 'premium' }
                }
            ]
        }
    });
});

// 3. RUTAS DE FORO
app.get('/api/forum/posts', (req, res) => {
    res.json({
        success: true,
        data: {
            posts: [
                {
                    id: '1',
                    title: '¡Bienvenido a Trading Elite!',
                    content: 'Esta es nuestra comunidad de traders. Comparte tus análisis y aprende de otros.',
                    category: 'general',
                    author: { 
                        name: 'Admin', 
                        plan: 'vip',
                        avatarColor: getRandomColor()
                    },
                    created_at: new Date().toISOString(),
                    likes: 15,
                    comment_count: 3,
                    tags: ['bienvenida', 'comunidad']
                },
                {
                    id: '2',
                    title: 'Análisis S&P 500 - Soporte clave',
                    content: 'El índice muestra un soporte importante en 4200 puntos. Recomiendo atención a esta zona.',
                    category: 'analysis',
                    author: { 
                        name: 'Trader Pro', 
                        plan: 'pro',
                        avatarColor: getRandomColor()
                    },
                    created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
                    likes: 28,
                    comment_count: 12,
                    tags: ['SP500', 'análisis', 'mercado']
                }
            ]
        }
    });
});

// 4. RUTAS DE ESTADÍSTICAS
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            activeUsers: users.filter(u => u.verified).length,
            activePosts: 2, // Por los 2 posts de ejemplo
            todaySessions: Math.floor(Math.random() * 50) + 10,
            totalTrades: 156,
            successRate: 78.5
        }
    });
});

// 5. RUTA DE PERFIL DE USUARIO (para /api/auth/me)
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }
    
    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            verified: user.verified,
            avatarColor: user.avatarColor,
            joinDate: user.createdAt
        }
    });
});

// Función middleware para autenticación (simple)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }
    
    // Token simple: token_1678901234567_123
    try {
        const parts = token.split('_');
        if (parts.length < 3) {
            throw new Error('Token inválido');
        }
        
        const userId = parseInt(parts[2]);
        req.userId = userId;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token inválido'
        });
    }
}

// ============================================
// FIN DE RUTAS NUEVAS
// ============================================

// Ruta de prueba (ESTA YA LA TIENES)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Trading Elite API funcionando',
        usersCount: users.length,
        features: ['auth', 'payments', 'calendar', 'forum', 'stats'] // Actualizado
    });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Trading Elite API funcionando',
        usersCount: users.length
    });
});

// Función auxiliar
function getRandomColor() {
    const colors = ['#ff0000', '#00ffff', '#ff00ff', '#00ff00', '#ffff00'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend ejecutándose en: http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

});
