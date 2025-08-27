// js/script.js

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listaPoemas = document.getElementById('lista-poemas');
const loadingMessage = document.getElementById('loading-message');
const paginacaoContainer = document.getElementById('paginacao-container');
const formBusca = document.getElementById('form-busca');
const campoBusca = document.getElementById('campo-busca');

const POEMAS_POR_PAGINA = 5;
let ultimoPoemaVisivel = null;
let buscaAtiva = false;

// Função principal que carrega os poemas
async function carregarPoemas(termoBusca = null) {
  try {
    loadingMessage.style.display = 'block';
    paginacaoContainer.innerHTML = ''; // Limpa o botão de carregar mais

    let q;
    const poemasRef = collection(db, "poemas");

    // Monta a query do Firestore
    if (termoBusca) {
      // Query para busca (não suporta busca parcial nativamente, mas funciona para correspondência exata ou inicial)
      q = query(poemasRef,
        where("titulo", ">=", termoBusca),
        where("titulo", "<=", termoBusca + '\uf8ff'),
        orderBy("titulo"),
        orderBy("data", "desc")
      );
    } else {
      // Query para paginação normal
      if (ultimoPoemaVisivel) {
        q = query(poemasRef, orderBy("data", "desc"), startAfter(ultimoPoemaVisivel), limit(POEMAS_POR_PAGINA));
      } else {
        q = query(poemasRef, orderBy("data", "desc"), limit(POEMAS_POR_PAGINA));
      }
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty && listaPoemas.children.length <= 1) { // <=1 para contar a msg de loading
      listaPoemas.innerHTML = '<p>Nenhum poema encontrado.</p>';
    }

    querySnapshot.forEach((doc) => {
      exibirPoema(doc.id, doc.data());
    });

    // Controla o botão "Carregar Mais"
    if (!querySnapshot.empty && !termoBusca) {
        ultimoPoemaVisivel = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (querySnapshot.docs.length === POEMAS_POR_PAGINA) {
            const btnCarregarMais = document.createElement('button');
            btnCarregarMais.textContent = 'Carregar Mais';
            btnCarregarMais.id = 'btn-carregar-mais';
            btnCarregarMais.onclick = () => carregarPoemas();
            paginacaoContainer.appendChild(btnCarregarMais);
        }
    }

  } catch (error) {
    console.error("Erro ao carregar poemas: ", error);
    listaPoemas.innerHTML = "<p>Falha ao carregar poemas. Tente novamente.</p>";
  } finally {
    loadingMessage.style.display = 'none';
  }
}

function exibirPoema(id, { titulo, texto, categorias }) {
  const div = document.createElement('div');
  div.className = 'poema';
  div.innerHTML = `
    <h2><a href="poema.html?id=${id}">${titulo}</a></h2>
    <p>${texto.substring(0, 150)}...</p>
    <p class="categorias">${categorias.join(', ')}</p>`;
  listaPoemas.appendChild(div);
}

// Lida com o evento de busca
formBusca.addEventListener('submit', (e) => {
  e.preventDefault();
  const termoBusca = campoBusca.value.trim();

  // Se a busca for vazia e uma busca já estava ativa, recarrega tudo
  if (!termoBusca && buscaAtiva) {
      buscaAtiva = false;
      resetarPagina();
      return;
  }
  
  if (termoBusca) {
      buscaAtiva = true;
      resetarPagina(true); // Reseta mantendo o termo de busca
      carregarPoemas(termoBusca);
  }
});

// Reseta a visualização para uma nova busca ou para limpar a busca
function resetarPagina(mantemBusca = false) {
    listaPoemas.innerHTML = '';
    paginacaoContainer.innerHTML = '';
    ultimoPoemaVisivel = null;
    if (!mantemBusca) {
        campoBusca.value = '';
        carregarPoemas();
    }
}

// Inicia o carregamento inicial
carregarPoemas();