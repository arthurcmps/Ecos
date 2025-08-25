// js/admin.js

import { db } from './firebase-config.js';
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Seleciona os elementos do formulário
const formPoema = document.getElementById('form-poema');
const feedbackMessage = document.getElementById('feedback-message');
const submitButton = formPoema.querySelector('button');

// Adiciona um listener para o evento de 'submit' do formulário
formPoema.addEventListener('submit', async (event) => {
  event.preventDefault(); // Impede o recarregamento da página

  // Pega os valores dos campos
  const titulo = document.getElementById('titulo').value;
  const texto = document.getElementById('texto').value;
  const categoriasInput = document.getElementById('categorias').value;

  // Processa as categorias: transforma a string "amor, saudade" em um array ["amor", "saudade"]
  const categorias = categoriasInput.split(',').map(cat => cat.trim()).filter(cat => cat);

  // Validação simples
  if (!titulo || !texto || categorias.length === 0) {
    mostrarFeedback('Por favor, preencha todos os campos.', 'error');
    return;
  }

  // Desabilita o botão para evitar envios múltiplos
  submitButton.disabled = true;
  submitButton.textContent = 'Salvando...';

  try {
    // Cria um novo documento na coleção "poemas"
    const docRef = await addDoc(collection(db, "poemas"), {
      titulo: titulo,
      texto: texto,
      categorias: categorias,
      data: Timestamp.now() // Adiciona a data atual
    });

    mostrarFeedback(`Poema "${titulo}" salvo com sucesso!`, 'success');
    formPoema.reset(); // Limpa o formulário

  } catch (error) {
    console.error("Erro ao salvar o poema: ", error);
    mostrarFeedback('Ocorreu um erro ao salvar o poema. Tente novamente.', 'error');
  } finally {
    // Reabilita o botão após a operação
    submitButton.disabled = false;
    submitButton.textContent = 'Salvar Poema';
  }
});

// Função para exibir mensagens de feedback ao usuário
function mostrarFeedback(mensagem, tipo) {
  feedbackMessage.textContent = mensagem;
  feedbackMessage.className = `feedback ${tipo}`; // 'success' ou 'error'
}