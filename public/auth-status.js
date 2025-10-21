// js/auth-status.js

import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const userAuthStatus = document.getElementById('user-auth-status');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está LOGADO
        userAuthStatus.innerHTML = `
            <div class="user-info">
                <span>Olá, ${user.email.split('@')[0]}</span>
                <button id="btn-logout" class="auth-button">Sair</button>
            </div>
        `;
        const btnLogout = document.getElementById('btn-logout');
        btnLogout.addEventListener('click', () => {
            signOut(auth).catch(error => console.error("Erro ao fazer logout:", error));
        });
    } else {
        // Usuário está DESLOGADO
        userAuthStatus.innerHTML = `
            <div class="auth-links">
                <a href="login.html" class="auth-button">Login</a>
                <a href="criar-usuario.html" class="auth-button secondary">Criar Conta</a>
            </div>
        `;
    }
});