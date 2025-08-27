import { db, auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, query, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ... (todo o código que já tínhamos para os seletores do DOM continua igual)
const conteudoAdmin = document.getElementById('conteudo-admin');
const userInfo = document.getElementById('user-info');
// ... etc.

// Função para verificar a permissão do usuário
async function verificarPermissaoAdmin(user) {
    const userDocRef = doc(db, "usuarios", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().role === 'admin') {
        return true; // É um admin
    }
    return false; // Não é um admin
}

// Verifica o estado de autenticação e a permissão
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Usuário está logado, agora vamos verificar se é admin
        const isAdmin = await verificarPermissaoAdmin(user);
        
        if (isAdmin) {
            // Se for admin, mostra o conteúdo
            conteudoAdmin.style.display = 'block';
            userInfo.innerHTML = `
                <span>Logado como: ${user.email} (Admin)</span>
                <button id="btn-logout">Sair</button>
            `;
            document.getElementById('btn-logout').addEventListener('click', fazerLogout);
            carregarPoemasAdmin();
        } else {
            // Se não for admin, nega o acesso
            alert('Acesso negado. Você não tem permissão de administrador.');
            window.location.href = 'index.html';
        }
    } else {
        // Usuário não está logado, redireciona para a página de login
        window.location.href = 'login.html';
    }
});

// O RESTANTE DO CÓDIGO DO admin.js (fazerLogout, carregarPoemasAdmin, o listener do formulário, etc.) CONTINUA EXATAMENTE O MESMO.
// Não precisa alterar as outras funções que já fizemos.
// ... (cole o resto do seu código de admin.js aqui)

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
        submitButton.textContent = 'Salvar Poema';
    }
});

// Preenche o formulário para edição
async function preencherFormularioParaEdicao(id) {
    const poemaRef = doc(db, 'poemas', id);
    const docSnap = await getDocs(collection(db, "poemas"));
    const poemaDoc = docSnap.docs.find(doc => doc.id === id); // Encontra o documento pelo ID

    if (poemaDoc) {
        const poema = poemaDoc.data();
        document.getElementById('poema-id').value = poemaDoc.id;
        document.getElementById('titulo').value = poema.titulo;
        document.getElementById('texto').value = poema.texto;
        document.getElementById('categorias').value = poema.categorias.join(', ');

        formTitle.textContent = 'Editando Poema';
        submitButton.textContent = 'Atualizar Poema';
        btnCancelarEdicao.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo
    }
}


// Exclui um poema
async function excluirPoema(id) {
    if (confirm('Tem certeza de que deseja excluir este poema? Esta ação não pode ser desfeita.')) {
        try {
            await deleteDoc(doc(db, 'poemas', id));
            mostrarFeedback('Poema excluído com sucesso!', 'success');
            await carregarPoemasAdmin();
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