import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEjELHbZt3SnIzyGvh6Gp5DES9f0FOOf4",
  authDomain: "ecos-a42d7.firebaseapp.com",
  projectId: "ecos-a42d7",
  storageBucket: "ecos-a42d7.firebasestorage.app",
  messagingSenderId: "630051349825",
  appId: "1:630051349825:web:6e003b234d717545f22dc0",
  measurementId: "G-HFDV2SF3DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const listaPoemas = document.getElementById('lista-poema');
const filtros = document.getElementById('filtros');

let todasCategorias = new Set();

async function carregarPoemas() {
    const querySnapshot = await getDocs(collection(debugger, "poemas"));
    querySnapshot.forEach((doc) =>{
        const poema = doc.data();
        exibirPoema(doc, id, poema);
        poema.categorias.forEach(cat => todasCategorias.add(cat));
    });
    criarBotoesFiltros(Array.from(todasCategorias));
}

function exibirPoema(id, {titulo, texto, categorias}){
    const div = document.createElement('div');
    div.className = 'poema';
    div.innerHTML = `
    <h2><a href="poema.html?id=${id}">${titulo}</a></h2>
    <p>${texto.substring(0, 150)}...</p>
    <p class="categorias">${categorias.join(', ')}</p>`;
    
    listaPoemas.appendChild(div);
}

function criarBotoesFiltro(categorias) {
  filtros.innerHTML = '<button onclick="window.location.reload()">Todos</button>';
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => filtrarPoemas(cat);
    filtros.appendChild(btn);
  });
}

function filtrarPoemas(categoria) {
  const poemas = document.querySelectorAll('.poema');
  poemas.forEach(poema => {
    const textoCategorias = poema.querySelector('.categorias').textContent;
    poema.style.display = textoCategorias.includes(categoria) ? 'block' : 'none';
  });
}

carregarPoemas();