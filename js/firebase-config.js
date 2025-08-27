import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// IMPORTAÇÃO ADICIONAL
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Sua configuração do Firebase (mantém a mesma)
const firebaseConfig = {
  apiKey: "AIzaSyAy0Q4pK0oigiRUVMRFEm8QQsU5zvJeqHI",
  authDomain: "ecos-4f84d.firebaseapp.com",
  databaseURL: "https://ecos-4f84d-default-rtdb.firebaseio.com",
  projectId: "ecos-4f84d",
  storageBucket: "ecos-4f84d.appspot.com",
  messagingSenderId: "145323796661",
  appId: "1:145323796661:web:e53bd8a7cb2fa37204b6fc"
};

// Inicializa e exporta as instâncias
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// EXPORTAÇÃO ADICIONAL
export const auth = getAuth(app);