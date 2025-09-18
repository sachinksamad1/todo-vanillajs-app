// js/auth.js
class AuthManager {
    constructor() {
        this.initializeEventListeners();
        this.checkAuthStatus();
    }
    
    initializeEventListeners() {
        // Tab switching
        document.getElementById('loginTab').addEventListener('click', () => this.showLoginForm());
        document.getElementById('registerTab').addEventListener('click', () => this.showRegisterForm());
        
        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    }
    
    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginTab').classList.add('bg-blue-500', 'text-white');
        document.getElementById('loginTab').classList.remove('bg-gray-300', 'text-gray-700');
        document.getElementById('registerTab').classList.add('bg-gray-300', 'text-gray-700');
        document.getElementById('registerTab').classList.remove('bg-blue-500', 'text-white');
    }
    
    showRegisterForm() {
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerTab').classList.add('bg-blue-500', 'text-white');
        document.getElementById('registerTab').classList.remove('bg-gray-300', 'text-gray-700');
        document.getElementById('loginTab').classList.add('bg-gray-300', 'text-gray-700');
        document.getElementById('loginTab').classList.remove('bg-blue-500', 'text-white');
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await api.login({ email, password });
            this.showMessage('Login successful!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        try {
            const response = await api.register({ username, email, password });
            this.showMessage('Registration successful! Please login.', 'success');
            
            // Clear form and switch to login
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                this.showLoginForm();
            }, 1500);
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }
    
    showMessage(message, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        
        if (type === 'error') {
            messageEl.classList.add('bg-red-100', 'text-red-700');
        } else {
            messageEl.classList.add('bg-green-100', 'text-green-700');
        }
        
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token && window.location.pathname.endsWith('index.html')) {
            // Redirect to dashboard if already logged in
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});