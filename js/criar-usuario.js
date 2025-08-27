// js/criar-usuario.js

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('form-criar-usuario');
const feedbackMessage = document.getElementById('feedback-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitButton = form.querySelector('button');

    submitButton.disabled = true;
    submitButton.textContent = 'Criando...';
    feedbackMessage.textContent = '';

    try {
        // 1. Cria o usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Salva a informação do usuário (com a função 'user') no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            email: user.email,
            role: 'user' // Define a função como 'user'
        });
        
        feedbackMessage.textContent = 'Conta criada com sucesso! Você será redirecionado para a página inicial.';
        feedbackMessage.className = 'feedback success';

        // Redireciona para a página inicial após 3 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        feedbackMessage.textContent = 'Erro ao criar conta. Verifique se o e-mail já está em uso.';
        feedbackMessage.className = 'feedback error';
        submitButton.disabled = false;
        submitButton.textContent = 'Criar Conta';
    }
});