// js/auth.js (Modificado)
import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, // 1. Importar o Provedor Google
  signInWithPopup     // 2. Importar o método de Popup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const formLogin = document.getElementById('form-login');
const formCriarConta = document.getElementById('form-criar-conta');
const btnGoogleLogin = document.getElementById('btn-google-login'); // 3. Selecionar o botão
const feedbackMessage = document.getElementById('feedback-message');
const btnSubmit = document.getElementById('btn-submit');

// Função para mostrar feedback
function setFeedback(message, isError = true) {
  // ... (função existente, sem mudanças)
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback ${isError ? 'error' : 'success'}`;
}

// --- Lógica para Criar Conta ---
if (formCriarConta) {
  // ... (código existente, sem mudanças)
  formCriarConta.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (senha !== confirmarSenha) {
      setFeedback("As senhas não coincidem.");
      return;
    }

    btnSubmit.disabled = true;
    setFeedback("Criando conta...", false);

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      window.location.href = 'index.html'; 
    } catch (error) {
      console.error(error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        setFeedback("Este email já está em uso.");
      } else if (error.code === 'auth/weak-password') {
        setFeedback("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setFeedback("Erro ao criar conta. Tente novamente.");
      }
      btnSubmit.disabled = false;
    }
  });
}

// --- Lógica para Login ---
if (formLogin) {
  // ... (código existente, sem mudanças)
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    btnSubmit.disabled = true;
    setFeedback("Entrando...", false);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = 'index.html';
    } catch (error) {
      console.error(error.code, error.message);
      if (error.code === 'auth/invalid-credential') {
        setFeedback("Email ou senha inválidos.");
      } else {
        setFeedback("Erro ao fazer login. Tente novamente.");
      }
      btnSubmit.disabled = false;
    }
  });
}

// 4. NOVA LÓGICA PARA O LOGIN COM GOOGLE
if (btnGoogleLogin) {
  btnGoogleLogin.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider(); // Cria uma instância do provedor
    
    try {
      // Abre o popup de login do Google
      await signInWithPopup(auth, provider);
      // Sucesso! Redireciona para a página inicial
      window.location.href = 'index.html';
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error.code, error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setFeedback("Login com Google cancelado.");
      } else {
        setFeedback("Ocorreu um erro ao tentar logar com o Google.");
      }
    }
  });
}