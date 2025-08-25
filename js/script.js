// js/script.js

import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listaPoemas = document.getElementById('lista-poemas');
const filtros = document.getElementById('filtros');
const loadingMessage = document.getElementById('loading-message');

let todasCategorias = new Set();

async function carregarPoemas() {
    try {
        const querySnapshot = await getDocs(collection(db, "poemas"));
        
        // Esconde a mensagem de "carregando" apenas quando há poemas.
        if (loadingMessage) {
           loadingMessage.style.display = 'none';
        }
        
        querySnapshot.forEach((doc) =>{
            const poema = doc.data();
            // CORREÇÃO: Passando doc.id e o objeto poema corretamente.
            exibirPoema(doc.id, poema);
            poema.categorias.forEach(cat => todasCategorias.add(cat));
        });
        
        criarBotoesFiltro(Array.from(todasCategorias));
    
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
    // Adicionamos o ID do documento ao link
    div.innerHTML = `
    <h2><a href="poema.html?id=${id}">${titulo}</a></h2>
    <p>${texto.substring(0, 150)}...</p>
    <p class="categorias">${categorias.join(', ')}</p>`;
    
    listaPoemas.appendChild(div);
}

function criarBotoesFiltro(categorias) {
  filtros.innerHTML = '<button onclick="filtrarPoemas(\'Todos\')">Todos</button>';
  categorias.sort().forEach(cat => { // .sort() para ordem alfabética
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => filtrarPoemas(cat);
    filtros.appendChild(btn);
  });
}

function filtrarPoemas(categoria) {
  const poemas = document.querySelectorAll('.poema');
  poemas.forEach(poema => {
    if (categoria === 'Todos') {
        poema.style.display = 'block';
    } else {
        const textoCategorias = poema.querySelector('.categorias').textContent;
        poema.style.display = textoCategorias.includes(categoria) ? 'block' : 'none';
    }
  });
}

carregarPoemas();