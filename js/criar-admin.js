// js/criar-admin.js

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('form-criar-admin');
const feedbackMessage = document.getElementById('feedback-message');

// IMPORTANTE: Troque este código por um de sua preferência!
const CODIGO_SECRETO_ADMIN = 'MEU_CODIGO_SECRETO';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const adminCode = document.getElementById('admin-code').value;
    const submitButton = form.querySelector('button');

    if (adminCode !== CODIGO_SECRETO_ADMIN) {
        feedbackMessage.textContent = 'Código Secreto de Administrador incorreto.';
        feedbackMessage.className = 'feedback error';
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Criando...';
    feedbackMessage.textContent = '';

    try {
        // 1. Cria o usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Salva a informação do usuário (com a função 'admin') no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            email: user.email,
            role: 'admin' // Define a função do usuário
        });
        
        feedbackMessage.textContent = 'Conta de administrador criada com sucesso! Você será redirecionado para o login.';
        feedbackMessage.className = 'feedback success';

        // Redireciona para a página de login após 3 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);

    } catch (error) {
        console.error("Erro ao criar admin:", error);
        feedbackMessage.textContent = 'Erro ao criar conta. Verifique se o e-mail já está em uso.';
        feedbackMessage.className = 'feedback error';
        submitButton.disabled = false;
        submitButton.textContent = 'Criar Conta Admin';
    }
});