// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔧 Cole aqui as suas credenciais do Firebase Console:
const firebaseConfig = {
  apiKey: "SUA_CHAVE_AQUI",
  authDomain: "Sampaio-Barbearia.firebaseapp.com",
  databaseURL: "https://Sampaio-Barbearia-default-rtdb.firebaseio.com",
  projectId: "Sampaio-Barbearia",
  storageBucket: "Sampaio-Barbearia.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue, remove };