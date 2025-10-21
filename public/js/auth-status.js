import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const userStatusDiv = document.getElementById('user-status');

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado
    userStatusDiv.innerHTML = `
      <div class="user-info">
        <span>Olá, ${user.email}</span>
        <a href="diario.html">Meu Diário</a>
        <button id="btn-logout">Sair</button>
      </div>
    `;

    // Adiciona o evento de clique para o botão Sair
    const btnLogout = document.getElementById('btn-logout');
    btnLogout.addEventListener('click', () => {
      signOut(auth).then(() => {
        // Redireciona para o index após o logout
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
  }
});