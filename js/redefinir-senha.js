// js/redefinir-senha.js

import { auth } from './firebase-config.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const form = document.getElementById('form-redefinir-senha');
const feedbackMessage = document.getElementById('feedback-message');
const submitButton = form.querySelector('button');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback';

    sendPasswordResetEmail(auth, email)
        .then(() => {
            feedbackMessage.textContent = 'Link de redefinição enviado! Verifique seu e-mail.';
            feedbackMessage.classList.add('success');
            form.reset();
        })
        .catch((error) => {
            console.error("Erro ao redefinir senha:", error);
            feedbackMessage.textContent = 'Ocorreu um erro. Verifique o e-mail digitado.';
            feedbackMessage.classList.add('error');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Link de Redefinição';
        });
});