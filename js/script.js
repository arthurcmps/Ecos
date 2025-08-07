import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAy0Q4pK0oigiRUVMRFEm8QQsU5zvJeqHI",
  authDomain: "ecos-4f84d.firebaseapp.com",
  projectId: "ecos-4f84d",
  storageBucket: "ecos-4f84d.firebasestorage.app",
  messagingSenderId: "145323796661",
  appId: "1:145323796661:web:e53bd8a7cb2fa37204b6fc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let todasCategorias = new Set();

async function carregarPoemas() {
    const querySnapshot = await getDocs(collection(db, "poemas"));
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