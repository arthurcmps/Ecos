// js/poema.js

import { db, auth } from './firebase-config.js'; // Adicionamos 'auth'
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; // Nova importação

// Pega o ID do poema da URL
const urlParams = new URLSearchParams(window.location.search);
const poemaId = urlParams.get("id");

// Seleciona os elementos do DOM
const poemaContainer = document.getElementById("poema");
const formComentario = document.getElementById("form-comentario");
const listaComentarios = document.getElementById("lista-comentarios");
const nomeInput = document.getElementById("nome"); // Movido para o escopo global

// --- NOVA FUNÇÃO ---
// Gerencia o estado do campo de nome baseado no status de login do usuário
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Se o usuário está logado, preenche o nome e desabilita o campo
        nomeInput.value = user.email.split('@')[0]; // Pega a parte do e-mail antes do @
        nomeInput.disabled = true;
    } else {
        // Se não há usuário logado, garante que o campo esteja vazio e habilitado
        nomeInput.value = '';
        nomeInput.disabled = false;
    }
});
// --- FIM DA NOVA FUNÇÃO ---

// Carrega o poema com base no ID
async function carregarPoema() {
  if (!poemaId) {
    poemaContainer.innerHTML = "<p>Poema não encontrado.</p>";
    return;
  }

  try {
    const docRef = doc(db, "poemas", poemaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const poema = docSnap.data();
      exibirPoema(poema);
      await carregarComentarios(); // Carrega os comentários após o poema
    } else {
      poemaContainer.innerHTML = "<p>Poema não encontrado.</p>";
    }
  } catch (error) {
    console.error("Erro ao buscar o poema:", error);
    poemaContainer.innerHTML = "<p>Ocorreu um erro ao carregar o poema.</p>";
  }
}

// Exibe o poema na tela
function exibirPoema({ titulo, texto, categorias, data }) {
  const dataFormatada = (data && data.toDate) ? data.toDate().toLocaleDateString("pt-BR") : "Data desconhecida";

  poemaContainer.innerHTML = `
    <h2>${titulo}</h2>
    <p class="categorias">${categorias.join(", ")} | ${dataFormatada}</p>
    <p>${texto.replace(/\n/g, "<br>")}</p>
  `;
}

// Carrega e exibe os comentários
async function carregarComentarios() {
    listaComentarios.innerHTML = "<h4>Carregando comentários...</h4>";
    
    const comentariosRef = collection(db, "poemas", poemaId, "comentarios");
    const q = query(comentariosRef, orderBy("data", "desc"));

    const querySnapshot = await getDocs(q);
    
    listaComentarios.innerHTML = "";
    
    if (querySnapshot.empty) {
        listaComentarios.innerHTML = "<p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>";
    } else {
        querySnapshot.forEach((doc) => {
            const comentario = doc.data();
            const div = document.createElement('div');
            div.className = 'comentario'; 
            div.innerHTML = `
                <p><strong>${comentario.nome}</strong> <span>- ${comentario.data.toDate().toLocaleDateString('pt-BR')}</span></p>
                <p>${comentario.mensagem.replace(/\n/g, "<br>")}</p>
            `;
            listaComentarios.appendChild(div);
        });
    }
}

// Adiciona um novo comentário ao Firestore
async function adicionarComentario(event) {
    event.preventDefault();

    const mensagemInput = document.getElementById("mensagem");
    const submitButton = formComentario.querySelector('button');

    // Validação para campos vazios
    if (!nomeInput.value.trim() || !mensagemInput.value.trim()) {
        alert("Por favor, preencha seu nome e a mensagem.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        await addDoc(collection(db, "poemas", poemaId, "comentarios"), {
            nome: nomeInput.value, // O valor já estará correto (do usuário logado ou do que foi digitado)
            mensagem: mensagemInput.value,
            data: Timestamp.now()
        });
        
        // Limpa apenas a mensagem, pois o nome pode ser mantido se o usuário estiver logado
        mensagemInput.value = ''; 
        await carregarComentarios();
        
        if (listaComentarios.firstChild) {
            listaComentarios.firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    
    } catch (e) {
        console.error("Erro ao adicionar comentário: ", e);
        alert("Ocorreu um erro ao enviar seu comentário.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar';
    }
}

// Adiciona o listener de evento 'submit' ao formulário
if (formComentario) {
    formComentario.addEventListener('submit', adicionarComentario);
}

// Inicia o carregamento da página
carregarPoema();