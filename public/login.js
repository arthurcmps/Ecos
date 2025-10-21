// js/login.js

import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Função para verificar se o usuário logado tem a permissão de 'admin'
async function verificarPermissaoAdmin(user) {
    if (!user) return false;
    const userDocRef = doc(db, "usuarios", user.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            return true; // É um admin
        }
    } catch (error) {
        console.error("Erro ao verificar permissão de admin:", error);
    }
    return false; // Não é um admin ou ocorreu um erro
}

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
        .then(async (userCredential) => {
            // Login bem-sucedido, verificar se é admin e redirecionar
            const isAdmin = await verificarPermissaoAdmin(userCredential.user);
            if (isAdmin) {
                window.location.href = 'admin.html'; // Admin vai para a página de admin
            } else {
                window.location.href = '../index.html'; // Usuário comum vai para a página inicial
            }
        })
        .catch((error) => {
            console.error("Erro de autenticação:", error);
            let mensagemErro = 'Email ou senha inválidos. Tente novamente.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                // A mensagem genérica já é suficiente
            } else if (error.code === 'auth/too-many-requests') {
                mensagemErro = 'Muitas tentativas de login. Tente novamente mais tarde.';
            }
            feedbackMessage.textContent = mensagemErro;
            feedbackMessage.classList.add('error');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        });
});
