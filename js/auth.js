import { supabase } from './supabase-client.js';

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const msgDiv = document.getElementById('authMessage');

function showMessage(msg, type = 'info') {
    msgDiv.textContent = msg;
    msgDiv.style.color = type === 'error' ? '#ff6b6b' : '#46d369';
}

async function handleLogin() {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage('Por favor ingresa email y contraseña', 'error');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage(error.message, 'error');
    } else {
        showMessage('Login exitoso! Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 1000);
    }
}

async function handleSignup() {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage('Por favor ingresa email y contraseña', 'error');
        return;
    }

    // Default username from email
    const username = email.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
                avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`
            }
        }
    });

    if (error) {
        showMessage(error.message, 'error');
    } else {
        showMessage('Registro exitoso! Revisa tu email (o inicia sesión si el correo no es requerido).', 'success');
        // Auto login handling if email confirm is disabled could be added here
    }
}

// Bind events
loginBtn.addEventListener('click', handleLogin);
signupBtn.addEventListener('click', handleSignup);

// Check if already logged in
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'app.html';
    }
}

checkSession();
