// js/login.js

import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const formLogin = document.getElementById('form-login');
const feedbackMessage = document.getElementById('feedback-message');

formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitButton = formLogin.querySelector('button');

    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback';

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login bem-sucedido, redireciona para a página de admin
            window.location.href = 'admin.html';
        })
        .catch((error) => {
            console.error("Erro de autenticação:", error);
            feedbackMessage.textContent = 'Email ou senha inválidos. Tente novamente.';
            feedbackMessage.classList.add('error');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        });
});