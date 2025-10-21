// js/admin.js

import { db, auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, query, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Seletores do DOM
const conteudoAdmin = document.getElementById('conteudo-admin');
const userInfo = document.getElementById('user-info');
const formPoema = document.getElementById('form-poema');
const feedbackMessage = document.getElementById('feedback-message');
const listaPoemasAdmin = document.getElementById('lista-poemas-admin');
const formTitle = document.getElementById('form-title');
const submitButton = formPoema.querySelector('button[type="submit"]');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

// Função para mostrar feedback ao usuário
const mostrarFeedback = (mensagem, tipo) => {
    feedbackMessage.textContent = mensagem;
    feedbackMessage.className = `feedback ${tipo}`;
    setTimeout(() => {
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback';
    }, 4000); // Esconde a mensagem após 4 segundos
};

// Função para verificar se o usuário logado tem a permissão de 'admin'
async function verificarPermissaoAdmin(user) {
    const userDocRef = doc(db, "usuarios", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().role === 'admin') {
        return true; // É um admin
    }
    return false; // Não é um admin
}

// Verifica o estado de autenticação e a permissão do usuário
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const isAdmin = await verificarPermissaoAdmin(user);
        
        if (isAdmin) {
            // Se for admin, mostra o conteúdo e carrega os dados
            conteudoAdmin.style.display = 'block';
            userInfo.innerHTML = `
                <span>Logado como: ${user.email} (Admin)</span>
                <button id="btn-logout" class="auth-button secondary">Sair</button>
            `;
            document.getElementById('btn-logout').addEventListener('click', fazerLogout);
            carregarPoemasAdmin();
        } else {
            // Se não for admin, nega o acesso e redireciona
            alert('Acesso negado. Esta área é restrita para administradores.');
            window.location.href = '../index.html';
        }
    } else {
        // Se não houver usuário logado, redireciona para a página de login
        window.location.href = 'login.html';
    }
});

// Função de Logout
const fazerLogout = () => {
    signOut(auth).catch((error) => console.error("Erro ao fazer logout:", error));
};

// Carrega todos os poemas para o painel de gerenciamento
async function carregarPoemasAdmin() {
    listaPoemasAdmin.innerHTML = '<p>Carregando poemas...</p>';
    try {
        const q = query(collection(db, "poemas"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        listaPoemasAdmin.innerHTML = ''; // Limpa a lista
        if (querySnapshot.empty) {
            listaPoemasAdmin.innerHTML = '<p>Nenhum poema publicado.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const poema = doc.data();
            const poemaDiv = document.createElement('div');
            poemaDiv.className = 'poema-admin-item';
            poemaDiv.innerHTML = `
                <div class="poema-info">
                    <strong>${poema.titulo}</strong>
                    <span>(${poema.categorias.join(', ')})</span>
                </div>
                <div class="poema-actions">
                    <button class="btn-editar" data-id="${doc.id}">Editar</button>
                    <button class="btn-excluir" data-id="${doc.id}">Excluir</button>
                </div>
            `;
            listaPoemasAdmin.appendChild(poemaDiv);
        });

        // Adiciona listeners aos botões de editar e excluir
        document.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', () => preencherFormularioParaEdicao(btn.dataset.id)));
        document.querySelectorAll('.btn-excluir').forEach(btn => btn.addEventListener('click', () => excluirPoema(btn.dataset.id)));

    } catch (error) {
        console.error("Erro ao carregar poemas para admin: ", error);
        listaPoemasAdmin.innerHTML = '<p>Erro ao carregar poemas.</p>';
    }
}

// Lógica do formulário (Adicionar ou Atualizar)
formPoema.addEventListener('submit', async (e) => {
    e.preventDefault();

    const poemaId = document.getElementById('poema-id').value;
    const titulo = document.getElementById('titulo').value;
    const texto = document.getElementById('texto').value;
    const categorias = document.getElementById('categorias').value.split(',').map(c => c.trim()).filter(Boolean);

    if (!titulo || !texto || categorias.length === 0) {
        mostrarFeedback('Por favor, preencha todos os campos.', 'error');
        return;
    }

    submitButton.disabled = true;

    try {
        if (poemaId) {
            // Atualizar poema existente
            submitButton.textContent = 'Atualizando...';
            const docRef = doc(db, 'poemas', poemaId);
            await updateDoc(docRef, { titulo, texto, categorias });
            mostrarFeedback('Poema atualizado com sucesso!', 'success');
        } else {
            // Adicionar novo poema
            submitButton.textContent = 'Salvando...';
            await addDoc(collection(db, 'poemas'), {
                titulo,
                texto,
                categorias,
                data: Timestamp.now()
            });
            mostrarFeedback('Poema salvo com sucesso!', 'success');
        }
        resetarFormulario();
        await carregarPoemasAdmin();
    } catch (error) {
        console.error("Erro ao salvar poema: ", error);
        mostrarFeedback('Erro ao salvar o poema.', 'error');
    } finally {
        submitButton.disabled = false;
        // O texto do botão será resetado pela função resetarFormulario()
    }
});

// Preenche o formulário para edição
async function preencherFormularioParaEdicao(id) {
    try {
        const poemaRef = doc(db, 'poemas', id);
        const docSnap = await getDoc(poemaRef);

        if (docSnap.exists()) {
            const poema = docSnap.data();
            document.getElementById('poema-id').value = docSnap.id;
            document.getElementById('titulo').value = poema.titulo;
            document.getElementById('texto').value = poema.texto;
            document.getElementById('categorias').value = poema.categorias.join(', ');

            formTitle.textContent = 'Editando Poema';
            submitButton.textContent = 'Atualizar Poema';
            btnCancelarEdicao.style.display = 'inline-block';
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo para focar no formulário
        }
    } catch (error) {
        console.error("Erro ao buscar poema para edição: ", error);
        mostrarFeedback('Não foi possível carregar os dados do poema.', 'error');
    }
}

// Exclui um poema
async function excluirPoema(id) {
    if (confirm('Tem certeza de que deseja excluir este poema? Esta ação não pode ser desfeita.')) {
        try {
            await deleteDoc(doc(db, 'poemas', id));
            mostrarFeedback('Poema excluído com sucesso!', 'success');
            await carregarPoemasAdmin();
            resetarFormulario(); // Limpa o formulário caso o poema excluído estivesse em edição
        } catch (error) {
            console.error("Erro ao excluir poema: ", error);
            mostrarFeedback('Erro ao excluir o poema.', 'error');
        }
    }
}

// Reseta o formulário para o estado inicial
const resetarFormulario = () => {
    formPoema.reset();
    document.getElementById('poema-id').value = '';
    formTitle.textContent = 'Adicionar Novo Poema';
    submitButton.textContent = 'Salvar Poema';
    btnCancelarEdicao.style.display = 'none';
};

// Event listener para o botão de cancelar edição
btnCancelarEdicao.addEventListener('click', resetarFormulario);