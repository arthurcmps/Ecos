import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Usuário não está logado!
    console.log("Acesso negado. Redirecionando para o login.");
    // Redireciona para o login, guardando a página atual para onde voltar
    window.location.href = `login.html?redirect=${window.location.pathname}`;
  } else {
    // Usuário está logado. Pode ficar na página.
    console.log("Acesso permitido.");
  }
});