import { auth, db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 

// Seletores
const formCriarPoema = document.getElementById('form-criar-poema');
const feedPoemas = document.getElementById('feed-poemas');
const loadingFeed = document.getElementById('loading-feed');
const feedbackPoema = document.getElementById('feedback-poema');
const btnPostarPoema = document.getElementById('btn-postar-poema');

// --- 1. Lógica para Postar Poemas ---
if (formCriarPoema) {
  formCriarPoema.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      alert("Você precisa estar logado para postar.");
      return;
    }

    const titulo = document.getElementById('poema-titulo').value.trim();
    const texto = document.getElementById('poema-texto').value.trim();

    if (!titulo || !texto) {
      feedbackPoema.textContent = "Título e texto são obrigatórios.";
      feedbackPoema.className = "feedback error";
      return;
    }

    btnPostarPoema.disabled = true;
    feedbackPoema.textContent = "Postando...";
    feedbackPoema.className = "feedback success";

    try {
      // Salva o poema na coleção 'poemas'
      await addDoc(collection(db, "poemas"), {
        titulo: titulo,
        texto: texto,
        autorId: user.uid,
        autorNome: user.displayName || user.email,
        dataCriacao: Timestamp.now(), // Usa o timestamp do servidor
        visibilidade: "publico" // Por padrão, poemas são públicos
      });

      // Limpa o formulário e dá feedback
      formCriarPoema.reset();
      feedbackPoema.textContent = "Poema postado com sucesso!";
      feedbackPoema.className = "feedback success";
      // Recarrega o feed para mostrar o novo poema (ou podemos adicionar no topo)
      carregarPoemas(); 
    } catch (error) {
      console.error("Erro ao postar poema: ", error);
      feedbackPoema.textContent = "Erro ao postar. Tente novamente.";
      feedbackPoema.className = "feedback error";
    } finally {
      btnPostarPoema.disabled = false;
      // Limpa a mensagem de feedback após 3s
      setTimeout(() => { feedbackPoema.className = "feedback"; }, 3000);
    }
  });
}


// --- 2. Lógica para Carregar o Feed de Poemas ---
async function carregarPoemas() {
  if (!feedPoemas) return; // Não faz nada se não estiver na página do feed

  feedPoemas.innerHTML = ''; // Limpa o feed antigo
  loadingFeed.style.display = 'block';

  try {
    // Cria uma query para buscar poemas
    const poemasRef = collection(db, "poemas");
    // Ordena pelos mais recentes e limita a 20
    const q = query(poemasRef, orderBy("dataCriacao", "desc"), limit(20));

    const querySnapshot = await getDocs(q);

    loadingFeed.style.display = 'none';

    if (querySnapshot.empty) {
      feedPoemas.innerHTML = '<p>Nenhum poema postado ainda. Seja o primeiro!</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const poema = doc.data();
      const id = doc.id;
      renderizarPoema(feedPoemas, id, poema);
    });

  } catch (error) {
    console.error("Erro ao carregar feed: ", error);
    loadingFeed.style.display = 'none';
    feedPoemas.innerHTML = '<p>Erro ao carregar o feed. Tente recarregar a página.</p>';
  }
}

// --- 3. Função para Renderizar um Card de Poema ---
function renderizarPoema(container, id, poema) {
  const divCard = document.createElement('div');
  divCard.className = 'poema-card';
  divCard.setAttribute('data-id', id);

  // Converte o Timestamp do Firebase para um Date do JS
  const data = poema.dataCriacao.toDate().toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  divCard.innerHTML = `
    <h3>${poema.titulo}</h3>
    <div class="poema-card-meta">
      Postado por <a href="perfil.html?id=${poema.autorId}">${poema.autorNome}</a> em ${data}
    </div>
    <p class="poema-card-texto">${poema.texto}</p>
  `;
  container.appendChild(divCard);
}

// Carrega os poemas assim que a página é aberta
carregarPoemas();