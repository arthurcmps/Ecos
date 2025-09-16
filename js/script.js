// js/script.js

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listaPoemas = document.getElementById('lista-poemas');
const loadingMessage = document.getElementById('loading-message');
const paginacaoContainer = document.getElementById('paginacao-container');
const formBusca = document.getElementById('form-busca');
const campoBusca = document.getElementById('campo-busca');

// !!! AÇÃO NECESSÁRIA !!!
// Substitua a URL abaixo pela URL da sua Cloud Function que você obterá no Passo 4.
const FUNCAO_DE_BUSCA_URL = "URL_DA_SUA_FUNCAO_AQUI"; 

const POEMAS_POR_PAGINA = 5;
let ultimoPoemaVisivel = null;
let buscaAtiva = false;

// --- Funções de Carregamento e Exibição --- //

// Carrega os poemas iniciais e para paginação (usa o Firestore)
async function carregarPoemas() {
  if (buscaAtiva) return; // Não carrega mais se uma busca estiver ativa

  try {
    loadingMessage.style.display = 'block';
    paginacaoContainer.innerHTML = '';

    const poemasRef = collection(db, "poemas");
    let q;

    if (ultimoPoemaVisivel) {
      q = query(poemasRef, orderBy("data", "desc"), startAfter(ultimoPoemaVisivel), limit(POEMAS_POR_PAGINA));
    } else {
      q = query(poemasRef, orderBy("data", "desc"), limit(POEMAS_POR_PAGINA));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty && listaPoemas.children.length <= 1) {
      listaPoemas.innerHTML = '<p>Nenhum poema publicado ainda.</p>';
    }

    querySnapshot.forEach((doc) => {
      exibirPoema(doc.id, doc.data());
    });

    // Controla o botão "Carregar Mais"
    if (!querySnapshot.empty) {
      ultimoPoemaVisivel = querySnapshot.docs[querySnapshot.docs.length - 1];
      if (querySnapshot.docs.length === POEMAS_POR_PAGINA) {
        criarBotaoCarregarMais();
      }
    }

  } catch (error) {
    console.error("Erro ao carregar poemas: ", error);
    listaPoemas.innerHTML = "<p>Falha ao carregar poemas. Tente novamente.</p>";
  } finally {
    loadingMessage.style.display = 'none';
  }
}

// Realiza a busca usando a Cloud Function
async function buscarPoemasComFuncao(termoBusca) {
  if (FUNCAO_DE_BUSCA_URL === "URL_DA_SUA_FUNCAO_AQUI") {
      alert("AÇÃO NECESSÁRIA: Configure a URL da sua Cloud Function no arquivo js/script.js");
      return;
  }

  resetarPagina(true);
  loadingMessage.style.display = 'block';

  try {
    const response = await fetch(`${FUNCAO_DE_BUSCA_URL}?query=${encodeURIComponent(termoBusca)}`);
    if (!response.ok) {
      throw new Error(`Erro na chamada da função: ${response.statusText}`);
    }
    const resultados = await response.json();

    if (resultados.length === 0) {
      listaPoemas.innerHTML = '<p>Nenhum poema encontrado para o termo buscado.</p>';
    } else {
      resultados.forEach(poema => {
        exibirPoema(poema.id, poema);
      });
    }

  } catch (error) {
    console.error("Erro ao buscar com a função: ", error);
    listaPoemas.innerHTML = "<p>Ocorreu um erro ao realizar a busca. Tente novamente.</p>";
  } finally {
    loadingMessage.style.display = 'none';
  }
}

function exibirPoema(id, { titulo, texto, categorias }) {
  const div = document.createElement('div');
  div.className = 'poema';
  // Garante que categorias seja um array antes de usar join
  const cats = Array.isArray(categorias) ? categorias.join(', ') : 'Sem categoria';

  div.innerHTML = `
    <h2><a href="ecos/poema.html?id=${id}">${titulo}</a></h2>
    <p>${texto.substring(0, 150)}...</p>
    <p class="categorias">${cats}</p>`;
  listaPoemas.appendChild(div);
}

function criarBotaoCarregarMais() {
    const btnCarregarMais = document.createElement('button');
    btnCarregarMais.textContent = 'Carregar Mais';
    btnCarregarMais.id = 'btn-carregar-mais';
    btnCarregarMais.onclick = () => carregarPoemas();
    paginacaoContainer.appendChild(btnCarregarMais);
}

// --- Manipuladores de Eventos e Funções Auxiliares --- //

formBusca.addEventListener('submit', (e) => {
  e.preventDefault();
  const termoBusca = campoBusca.value.trim();

  if (!termoBusca && buscaAtiva) {
    buscaAtiva = false;
    resetarPagina();
    return;
  }
  
  if (termoBusca) {
    buscaAtiva = true;
    buscarPoemasComFuncao(termoBusca);
  }
});

function resetarPagina(mantemBusca = false) {
  listaPoemas.innerHTML = '';
  paginacaoContainer.innerHTML = '';
  ultimoPoemaVisivel = null;
  if (!mantemBusca) {
    campoBusca.value = '';
    // Recarrega a lista inicial
    carregarPoemas(); 
  }
}

// Inicia o carregamento inicial da página
carregarPoemas();
