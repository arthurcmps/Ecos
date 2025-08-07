import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEjELHbZt3SnIzyGvh6Gp5DES9f0FOOf4",
  authDomain: "ecos-a42d7.firebaseapp.com",
  projectId: "ecos-a42d7",
  storageBucket: "ecos-a42d7.firebasestorage.app",
  messagingSenderId: "630051349825",
  appId: "1:630051349825:web:6e003b234d717545f22dc0",
  measurementId: "G-HFDV2SF3DG"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Pega o ID do poema da URL
const urlParams = new URLSearchParams(window.location.search);
const poemaId = urlParams.get("id");

// Seleciona o container onde o poema será exibido
const container = document.getElementById("poema");

// Carrega o poema com base no ID
async function carregarPoema() {
  if (!poemaId) {
    container.innerHTML = "<p>Poema não encontrado.</p>";
    return;
  }

  const docRef = doc(db, "poemas", poemaId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const poema = docSnap.data();
    exibirPoema(poema);
  } else {
    container.innerHTML = "<p>Poema não encontrado.</p>";
  }
}

// Exibe o poema na tela
function exibirPoema({ titulo, texto, categorias, data }) {
  const dataFormatada = data?.toDate().toLocaleDateString("pt-BR") || "Data desconhecida";

  container.innerHTML = `
    <h2>${titulo}</h2>
    <p class="categorias">${categorias.join(", ")} | ${dataFormatada}</p>
    <p>${texto.replace(/\n/g, "<br>")}</p>
  `;
}

carregarPoema();