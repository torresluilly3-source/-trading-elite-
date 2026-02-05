// API CLIENT SIMPLIFICADO
const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.token = localStorage.getItem('auth_token');
    }
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }
    
    removeToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        try {
            console.log(`🌐 API Request: ${url}`);
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la solicitud');
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Error en API:', error.message);
            throw error;
        }
    }
    
    // Métodos específicos
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (data.success && data.data.token) {
            this.setToken(data.data.token);
            localStorage.setItem('current_user', JSON.stringify(data.data.user));
        }
        
        return data;
    }
    
    async verifyEmail(token, email) {
        return this.request(`/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
    }
    
    async getProfile() {
        return this.request('/auth/profile');
    }
}

// Crear instancia global
window.ApiClient = new ApiClient();
console.log('✅ API Client inicializado');