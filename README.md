# Documentação do Projeto

Este projeto é uma aplicação web completa com funcionalidades de autenticação e gerenciamento de conteúdo, utilizando Firebase como backend.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

- `css/`: Contém os arquivos de estilo CSS.
  - `style.css`: Folha de estilo principal.
- `ecos/`: Contém as páginas HTML da aplicação.
  - `index.html`: Página inicial.
  - `login.html`: Página de login.
  - `admin.html`: Painel de administração.
  - `criar-admin.html`: Página para criar novos administradores.
  - `criar-usuario.html`: Página para criar novos usuários.
  - `poema.html`: Página para visualização de poemas.
  - `redefinir-senha.html`: Página para redefinição de senha.
  - `404.html`: Página de erro 404.
- `functions/`: Contém o código do Firebase Functions.
  - `index.js`: Arquivo principal das funções.
- `js/`: Contém os arquivos JavaScript do lado do cliente.
  - `firebase-config.js`: Configuração do Firebase.
  - `auth-status.js`: Controla o status de autenticação do usuário.
  - `login.js`: Lógica de autenticação.
  - `admin.js`: Lógica do painel de administração.
  - `criar-admin.js`: Lógica para criação de administradores.
  - `criar-usuario.js`: Lógica para criação de usuários.
  - `poema.js`: Lógica da página de poemas.
  - `redefinir-senha.js`: Lógica de redefinição de senha.
  - `script.js`: Scripts gerais.
- `firebase.json`: Arquivo de configuração do Firebase para deploy.
- `firestore.rules`: Regras de segurança do Firestore.
- `storage.rules`: Regras de segurança do Cloud Storage.

## Como Executar o Projeto

1. **Instale as dependências:**
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   ```

2. **Configure o Firebase:**
   - Crie um projeto no [console do Firebase](https://console.firebase.google.com/).
   - Adicione um aplicativo da web ao seu projeto.
   - Copie a configuração do Firebase e cole no arquivo `js/firebase-config.js`.

3. **Execute o emulador do Firebase:**
   ```bash
   firebase emulators:start
   ```

4. **Acesse a aplicação:**
   - Abra o seu navegador e acesse `http://localhost:5000`.

## Deploy

Para fazer o deploy da aplicação para o Firebase Hosting, execute o seguinte comando:

```bash
firebase deploy
```
