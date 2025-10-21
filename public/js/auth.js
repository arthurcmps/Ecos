import { auth, db } from './firebase-config.js'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile // 2. IMPORTAR 'updateProfile'
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"; // 3. IMPORTAR 'doc' e 'setDoc'

// ... (seletores e função setFeedback não mudam) ...
const formLogin = document.getElementById('form-login');
const formCriarConta = document.getElementById('form-criar-conta');
const btnGoogleLogin = document.getElementById('btn-google-login');
const feedbackMessage = document.getElementById('feedback-message');
const btnSubmit = document.getElementById('btn-submit');

function setFeedback(message, isError = true) {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback ${isError ? 'error' : 'success'}`;
}

// 4. NOVA FUNÇÃO: Validar Idade (>= 18 anos)
function isUserOver18(dateString) {
  // A data vem como 'AAAA-MM-DD'
  const today = new Date();
  const birthDate = new Date(dateString);

  // Calcula a idade
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  // Ajusta a idade se o aniversário ainda não ocorreu este ano
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
}


// --- Lógica para Criar Conta (MODIFICADA) ---
if (formCriarConta) {
  formCriarConta.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 5. OBTER TODOS OS VALORES DO FORMULÁRIO
    const nome = document.getElementById('nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();
    const dataNascimento = document.getElementById('data-nascimento').value;
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    
    // --- Validações ---
    if (senha !== confirmarSenha) {
      setFeedback("As senhas não coincidem.");
      return;
    }

    if (!nome || !sobrenome) {
        setFeedback("Nome e sobrenome são obrigatórios.");
        return;
    }

    if (!dataNascimento) {
        setFeedback("A data de nascimento é obrigatória.");
        return;
    }

    // 6. VALIDAR A IDADE
    if (!isUserOver18(dataNascimento)) {
      setFeedback("Você deve ter pelo menos 18 anos para criar uma conta.");
      return;
    }
    
    btnSubmit.disabled = true;
    setFeedback("Criando conta...", false);

    try {
      // 7. CRIAR O USUÁRIO no Auth (como antes)
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const nomeCompleto = `${nome} ${sobrenome}`;

      // 8. ATUALIZAR O PERFIL (Salva o nome no Firebase Auth)
      await updateProfile(user, {
        displayName: nomeCompleto
      });

      // 9. SALVAR DADOS NO FIRESTORE (Cria um documento para o usuário)
      // Isso salva os dados extras (como data de nasc.)
      const userDocRef = doc(db, "users", user.uid); // (db, 'nome_da_colecao', 'id_do_documento')
      
      await setDoc(userDocRef, {
        uid: user.uid,
        nome: nome,
        sobrenome: sobrenome,
        nomeCompleto: nomeCompleto,
        email: user.email,
        dataNascimento: dataNascimento,
        criadoEm: new Date() // Salva a data de criação do perfil
      });

      // Sucesso! Redireciona para a página inicial
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