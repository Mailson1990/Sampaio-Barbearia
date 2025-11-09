// ==== 🔹 Firebase ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ==== 🔹 Configuração do Firebase ====
const firebaseConfig = {
  apiKey: "AIzaSyC5Ax2KcfpB4--rnLdBvdTgwE_GJgCCk0A",
  authDomain: "sampaio-barbearia.firebaseapp.com",
  projectId: "sampaio-barbearia",
  storageBucket: "sampaio-barbearia.firebasestorage.app",
  messagingSenderId: "984419102837",
  appId: "1:984419102837:web:58e10be6f570f66438883c"
};

// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================================================
// ======= ADMIN / PAINEL ============================
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  // ======= Seletores principais =======
  const lista = document.getElementById("lista-agendamentos");
  const btnLimpar = document.getElementById("btn-limpar");
  const btnSair = document.getElementById("btn-sair");
  const loginContainer = document.getElementById("login-container");
  const painel = document.getElementById("painel");
  const btnLogin = document.getElementById("btn-login");
  const senhaInput = document.getElementById("senha");
  const erro = document.getElementById("erro");
  const filtroInput = document.getElementById("filtro");
  const btnAreaCliente = document.getElementById("btn-area-cliente");

  const SENHA_CORRETA = "admin123";
  const CHAVE_SESSAO = "usuarioLogado";

  // ==================================================
  // ======= EXIBIR AGENDAMENTOS FIRESTORE ============
  // ==================================================
  function exibirAgendamentos(snapshot) {
  lista.innerHTML = "";

  if (snapshot.empty) {
    lista.innerHTML = `<tr><td colspan="8" style="text-align:center;">Nenhum agendamento encontrado.</td></tr>`;
    return;
  }

  // Converte snapshot em array e ordena por data + hora
  const agendamentos = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  agendamentos.sort((a, b) => {
    // Formata data para comparar: "dd/mm/yyyy" → "yyyy-mm-dd"
    const [diaA, mesA, anoA] = a.data.split("/").map(Number);
    const [diaB, mesB, anoB] = b.data.split("/").map(Number);

    const dataA = new Date(anoA, mesA - 1, diaA, ...a.hora.split(":").map(Number));
    const dataB = new Date(anoB, mesB - 1, diaB, ...b.hora.split(":").map(Number));

    return dataA - dataB; // crescente
  });

  // Agora cria as linhas da tabela
  agendamentos.forEach(ag => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ag.nome}</td>
      <td>${ag.telefone}</td>
      <td>${ag.servico}</td>
      <td>${ag.responsavel}</td>
      <td>${ag.data}</td>
      <td>${ag.hora}</td>
      <td>${ag.criadoEm ? new Date(ag.criadoEm.seconds * 1000).toLocaleString() : "-"}</td>
      <td><button class="btn-excluir" data-id="${ag.id}">Excluir</button></td>
    `;
    lista.appendChild(tr);
  });

  // Evento de exclusão
  document.querySelectorAll(".btn-excluir").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (confirm("Deseja excluir este agendamento?")) {
        const id = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "agendamentos", id));
        alert("Agendamento excluído!");
      }
    });
  });
}

  // ==================================================
  // ======= FIRESTORE: ATUALIZAÇÃO EM TEMPO REAL =====
  // ==================================================
  function iniciarListener() {
    const ref = collection(db, "agendamentos");
    onSnapshot(ref, (snapshot) => {
      exibirAgendamentos(snapshot);
    });
  }

  // ==================================================
  // ======= LOGIN =====================================
  // ==================================================
  btnLogin.addEventListener("click", () => {
    const senha = senhaInput.value.trim();
    if (senha === SENHA_CORRETA) {
      localStorage.setItem(CHAVE_SESSAO, "true");
      mostrarPainel();
      iniciarListener();
    } else {
      erro.classList.remove("oculto");
      setTimeout(() => erro.classList.add("oculto"), 2000);
    }
  });

  // ==================================================
  // ======= MOSTRAR PAINEL ===========================
  // ==================================================
  function mostrarPainel() {
    loginContainer.classList.add("oculto");
    painel.classList.remove("oculto");
  }

  // ==================================================
  // ======= SAIR =====================================
  // ==================================================
  btnSair.addEventListener("click", () => {
    localStorage.removeItem(CHAVE_SESSAO);
    painel.classList.add("oculto");
    loginContainer.classList.remove("oculto");
    senhaInput.value = "";
  });

  // ==================================================
  // ======= IR PARA ÁREA DO CLIENTE =================
  // ==================================================
  btnAreaCliente.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // ==================================================
  // ======= FILTRO DE AGENDAMENTOS ===================
  // ==================================================
  filtroInput.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const itens = lista.querySelectorAll("li");
    itens.forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(termo)
        ? "block"
        : "none";
    });
  });

  // ==================================================
  // ======= LIMPAR TODOS (caso deseje) ===============
  // ==================================================
  btnLimpar.addEventListener("click", async () => {
    if (confirm("Tem certeza que deseja excluir todos os agendamentos?")) {
      const ref = collection(db, "agendamentos");
      const snapshot = await new Promise((resolve) => {
        onSnapshot(ref, (snap) => resolve(snap));
      });
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "agendamentos", docSnap.id));
      });
      alert("Todos os agendamentos foram excluídos!");
    }
  });

  // ==================================================
  // ======= LOGIN AUTOMÁTICO SE JÁ LOGADO ============
  // ==================================================
  if (localStorage.getItem(CHAVE_SESSAO) === "true") {
    mostrarPainel();
    iniciarListener();
  }
});
