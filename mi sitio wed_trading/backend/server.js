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