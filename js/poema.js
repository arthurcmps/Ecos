// js/poema.js

import { db } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Pega o ID do poema da URL
const urlParams = new URLSearchParams(window.location.search);
const poemaId = urlParams.get("id");

// Seleciona os elementos do DOM
const poemaContainer = document.getElementById("poema");
const formComentario = document.getElementById("form-comentario");
const listaComentarios = document.getElementById("lista-comentarios");

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
  // Verifica se 'data' existe e é um objeto Timestamp do Firebase
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
    
    // Caminho para a subcoleção de comentários
    const comentariosRef = collection(db, "poemas", poemaId, "comentarios");
    const q = query(comentariosRef, orderBy("data", "desc"));

    const querySnapshot = await getDocs(q);
    
    listaComentarios.innerHTML = ""; // Limpa a lista antes de carregar
    
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
    event.preventDefault(); // Impede o recarregamento da página

    const nomeInput = document.getElementById("nome");
    const mensagemInput = document.getElementById("mensagem");
    const submitButton = formComentario.querySelector('button');

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        await addDoc(collection(db, "poemas", poemaId, "comentarios"), {
            nome: nomeInput.value,
            mensagem: mensagemInput.value,
            data: Timestamp.now() // Usa o timestamp do servidor Firebase
        });
        
        formComentario.reset(); // Limpa o formulário
        await carregarComentarios(); // Recarrega a lista de comentários
    
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

// Inicia o carregamento do poema e comentários
carregarPoema();