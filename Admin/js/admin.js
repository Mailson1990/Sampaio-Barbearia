// ==== 🔹 Firebase Importação ====
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { 
  getFirestore, collection, getDocs, onSnapshot, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ==== 🔹 Configuração do Firebase ====
const firebaseConfig = {
  apiKey: "AIzaSyC5Ax2KcfpB4--rnLdBvdTgwE_GJgCCk0A",
  authDomain: "sampaio-barbearia.firebaseapp.com",
  projectId: "sampaio-barbearia",
  storageBucket: "sampaio-barbearia.appspot.com",
  messagingSenderId: "984419102837",
  appId: "1:984419102837:web:58e10be6f570f66438883c"
};

// ==== 🔹 Inicializa Firebase ====
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==== 🔹 Script Principal ====
document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-agendamentos");
  const btnLimpar = document.getElementById("btn-limpar");
  const btnSair = document.getElementById("btn-sair");
  const loginContainer = document.getElementById("login-container");
  const painel = document.getElementById("painel");
  const btnLogin = document.getElementById("btn-login");
  const senhaInput = document.getElementById("senha");
  const erro = document.getElementById("erro");
  const anoSpan = document.getElementById("ano");
  const filtroInput = document.getElementById("filtro");
  const btnAreaCliente = document.getElementById("btn-area-cliente");

  const SENHA_CORRETA = "admin123";
  const CHAVE_SESSAO = "usuarioLogado";

  anoSpan.textContent = new Date().getFullYear();

  // === Verifica se já está logado ===
  if (localStorage.getItem(CHAVE_SESSAO) === "true") {
    mostrarPainel();
  }

  // === Login ===
  btnLogin.addEventListener("click", () => {
    const senha = senhaInput.value.trim();
    if (senha === SENHA_CORRETA) {
      localStorage.setItem(CHAVE_SESSAO, "true");
      mostrarPainel();
    } else {
      erro.classList.remove("oculto");
      setTimeout(() => erro.classList.add("oculto"), 2000);
    }
  });

  // === Mostrar painel e carregar agendamentos ===
  function mostrarPainel() {
    loginContainer.classList.add("oculto");
    painel.classList.remove("oculto");
    carregarAgendamentos();
  }

  // === Botão para voltar à área do cliente ===
  btnAreaCliente.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // === Sair ===
  btnSair.addEventListener("click", () => {
    localStorage.removeItem(CHAVE_SESSAO);
    painel.classList.add("oculto");
    loginContainer.classList.remove("oculto");
    senhaInput.value = "";
  });

  // === Carregar e exibir agendamentos do Firestore ===
  async function carregarAgendamentos(filtro = "") {
    lista.innerHTML = `<tr><td colspan="7" style="text-align:center;">Carregando...</td></tr>`;

    try {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      let agendamentos = [];
      querySnapshot.forEach((doc) => {
        agendamentos.push({ id: doc.id, ...doc.data() });
      });

      // Filtro
      const filtrados = agendamentos.filter(a =>
        `${a.nome} ${a.servico} ${a.data}`
          .toLowerCase()
          .includes(filtro.toLowerCase())
      );

      if (filtrados.length === 0) {
        lista.innerHTML = `<tr><td colspan="7" style="text-align:center; color:gray;">Nenhum agendamento encontrado</td></tr>`;
        return;
      }

      lista.innerHTML = "";
      filtrados.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${a.nome}</td>
          <td>${a.telefone}</td>
          <td>${a.servico}</td>
          <td>${a.responsavel}</td>
          <td>${a.data}</td>
          <td>${a.hora}</td>
          <td>${a.criadoEm}</td>
          <td>
            <button class="btn danger" data-id="${a.id}">Excluir</button>
          </td>
        `;
        lista.appendChild(tr);
      });

      document.querySelectorAll(".btn.danger[data-id]").forEach(btn => {
        btn.addEventListener("click", async e => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Deseja excluir este agendamento?")) {
            await deleteDoc(doc(db, "agendamentos", id));
            carregarAgendamentos(filtroInput.value);
          }
        });
      });
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      lista.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Erro ao carregar agendamentos.</td></tr>`;
    }
  }

  // === Atualização em tempo real ===
  onSnapshot(collection(db, "agendamentos"), () => {
    carregarAgendamentos(filtroInput.value);
  });

  // === Filtro de busca ===
  filtroInput.addEventListener("input", e => {
    carregarAgendamentos(e.target.value);
  });

  // === Excluir todos ===
  btnLimpar.addEventListener("click", async () => {
    if (confirm("Tem certeza que deseja excluir todos os agendamentos?")) {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      querySnapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "agendamentos", docSnap.id));
      });
      carregarAgendamentos();
    }
  });
});
