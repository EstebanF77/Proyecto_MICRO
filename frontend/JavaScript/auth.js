const API_URL = 'http://localhost:8000/api'; // Ajusta esto según tu configuración del backend

class Auth {
    static async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el inicio de sesión');
            }

            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async register(name, email, password) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
}

// Manejadores de eventos para el formulario de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await Auth.login(email, password);
                window.location.href = '/dashboard.html';
            } catch (error) {
                const errorDiv = document.getElementById('error-message');
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
    }

    // Manejador para el formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await Auth.register(name, email, password);
                window.location.href = '/login.html';
            } catch (error) {
                const errorDiv = document.getElementById('error-message');
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
    }
}); 