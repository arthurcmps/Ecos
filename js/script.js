import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listaPoemas = document.getElementById('lista-poemas');
const filtros = document.getElementById('filtros');
const loadingMessage = document.getElementById('loading-message');

let todasCategorias = new Set();
let todosOsPoemas = []; // Armazena todos os poemas para evitar múltiplas leituras do DB

// Função global para ser acessível pelo HTML
window.filtrarPoemas = (categoria, botaoAtivo) => {
    const poemasVisiveis = document.querySelectorAll('.poema');
    let algumPoemaVisivel = false;

    // Gerencia o estado "ativo" dos botões de filtro
    document.querySelectorAll('#filtros button').forEach(btn => btn.classList.remove('active'));
    botaoAtivo.classList.add('active');
    
    poemasVisiveis.forEach(poema => {
        const categoriasDoPoema = poema.dataset.categorias; // Usando data attribute
        
        if (categoria === 'Todos' || categoriasDoPoema.includes(categoria)) {
            poema.style.display = 'block';
            algumPoemaVisivel = true;
        } else {
            poema.style.display = 'none';
        }
    });

    // Mostra ou esconde a mensagem de "nenhum poema encontrado"
    let mensagem = document.getElementById('nenhum-poema-encontrado');
    if (!algumPoemaVisivel) {
        if (!mensagem) {
            mensagem = document.createElement('p');
            mensagem.id = 'nenhum-poema-encontrado';
            mensagem.textContent = 'Nenhum poema encontrado para esta categoria.';
            listaPoemas.appendChild(mensagem);
        }
    } else if (mensagem) {
        mensagem.remove();
    }
};

async function carregarPoemas() {
    try {
        const querySnapshot = await getDocs(collection(db, "poemas"));
        
        if (loadingMessage) {
           loadingMessage.style.display = 'none';
        }
        
        // Limpa a lista antes de adicionar os poemas
        listaPoemas.innerHTML = '';
        
        querySnapshot.forEach((doc) =>{
            const poema = doc.data();
            todosOsPoemas.push({ id: doc.id, ...poema }); // Guarda os poemas em um array
            poema.categorias.forEach(cat => todasCategorias.add(cat));
        });
        
        if (todosOsPoemas.length === 0) {
            listaPoemas.innerHTML = '<p>Nenhum poema publicado ainda.</p>';
        } else {
            todosOsPoemas.forEach(poema => exibirPoema(poema.id, poema));
            criarBotoesFiltro(Array.from(todasCategorias));
        }
    
    } catch (error) {
        console.error("Erro ao carregar poemas: ", error);
        if (loadingMessage) {
            loadingMessage.innerText = "Falha ao carregar poemas. Por favor, tente novamente mais tarde.";
        }
    }
}

function exibirPoema(id, {titulo, texto, categorias}){
    const div = document.createElement('div');
    div.className = 'poema';
    // Adiciona as categorias como um data attribute para facilitar a filtragem
    div.dataset.categorias = categorias.join(', ');

    div.innerHTML = `
    <h2><a href="poema.html?id=${id}">${titulo}</a></h2>
    <p>${texto.substring(0, 150)}...</p>
    <p class="categorias">${categorias.join(', ')}</p>`;
    
    listaPoemas.appendChild(div);
}

function criarBotoesFiltro(categorias) {
    filtros.innerHTML = ''; // Limpa os filtros antes de criar
    
    const btnTodos = document.createElement('button');
    btnTodos.textContent = 'Todos';
    btnTodos.className = 'active'; // O botão "Todos" começa ativo
    btnTodos.onclick = (event) => filtrarPoemas('Todos', event.target);
    filtros.appendChild(btnTodos);

    categorias.sort().forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.onclick = (event) => filtrarPoemas(cat, event.target);
        filtros.appendChild(btn);
    });
}

carregarPoemas();