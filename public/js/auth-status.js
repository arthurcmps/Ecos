import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const userStatusDiv = document.getElementById('user-status');
// 1. Selecionar o container do formulário de poema
const criarPoemaContainer = document.getElementById('criar-poema-container');

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado
    const userName = user.displayName || user.email; 
    
    userStatusDiv.innerHTML = `
      <div class="user-info">
        <span>Olá, ${userName}</span>
        <a href="perfil.html">Meu Perfil</a> <a href="diario.html">Meu Diário</a>
        <button id="btn-logout">Sair</button>
      </div>
    `;
    
    // 2. Mostrar o formulário de postar poema
    if (criarPoemaContainer) {
      criarPoemaContainer.classList.remove('hidden');
    }

    const btnLogout = document.getElementById('btn-logout');
    btnLogout.addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error("Erro ao fazer logout: ", error);
      });
    });

  } else {
    // Usuário está deslogado
    userStatusDiv.innerHTML = `
      <div class="user-links">
        <a href="login.html" class="secondary">Login</a>
        <a href="criar-conta.html">Criar Conta</a>
      </div>
    `;
    
    // 3. Garantir que o formulário esteja escondido
    if (criarPoemaContainer) {
      criarPoemaContainer.classList.add('hidden');
    }
  }
});