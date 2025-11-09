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
  storageBucket: "sampaio-barbearia.firebasestorage.app",
  messagingSenderId: "984419102837",
  appId: "1:984419102837:web:58e10be6f570f66438883c"
};

// ==== 🔹 Inicializa Firebase ====
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

  const SENHA_CORRETA = "admin123"; // 🔒 altere se quiser
  const CHAVE_SESSAO = "usuarioLogado"; // nome do item no localStorage

  anoSpan.textContent = new Date().getFullYear();

  // ===== Verifica se já está logado =====
  if (localStorage.getItem(CHAVE_SESSAO) === "true") {
    mostrarPainel();
  }

  // ===== Login =====
  btnLogin.addEventListener("click", () => {
    const senha = senhaInput.value.trim();

    if (senha === SENHA_CORRETA) {
      localStorage.setItem(CHAVE_SESSAO, "true"); // mantém logado
      mostrarPainel();
    } else {
      erro.classList.remove("oculto");
      setTimeout(() => erro.classList.add("oculto"), 2000);
    }
  });

  // ===== Função para mostrar painel =====
  function mostrarPainel() {
    loginContainer.classList.add("oculto");
    painel.classList.remove("oculto");
    limparAgendamentosAntigos();
    carregarAgendamentos();
  }

  // ===== Botão para voltar à área do cliente =====
  btnAreaCliente.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // ===== Sair =====
  btnSair.addEventListener("click", () => {
    localStorage.removeItem(CHAVE_SESSAO); // encerra sessão
    painel.classList.add("oculto");
    loginContainer.classList.remove("oculto");
    senhaInput.value = "";
  });

  // ===== Funções de armazenamento =====
  function getAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
  }

  function salvarAgendamentos(lista) {
    localStorage.setItem("agendamentos", JSON.stringify(lista));
  }

  // ===== Excluir agendamentos vencidos =====
  function limparAgendamentosAntigos() {
    let agendamentos = getAgendamentos();
    const agora = new Date();

    agendamentos = agendamentos.filter(a => {
      const [ano, mes, dia] = a.data.split("-").map(Number);
      const [hora, minuto] = a.hora.split(":").map(Number);
      const horarioAgendamento = new Date(ano, mes - 1, dia, hora, minuto);
      const limite = new Date(horarioAgendamento.getTime() + 30 * 60000); // +30 minutos
      return agora < limite;
    });

    salvarAgendamentos(agendamentos);
  }

  // ===== Carregar e exibir agendamentos =====
  function carregarAgendamentos(filtro = "") {
    lista.innerHTML = "";
    const agendamentos = getAgendamentos();

    const filtrados = agendamentos.filter(a =>
      `${a.nome} ${a.servico} ${a.data}`
        .toLowerCase()
        .includes(filtro.toLowerCase())
    );

    if (filtrados.length === 0) {
      lista.innerHTML = `<tr><td colspan="7" style="text-align:center; color:gray;">Nenhum agendamento encontrado</td></tr>`;
      return;
    }

    filtrados.forEach((a, i) => {
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
          <button class="btn danger" data-index="${i}">Excluir</button>
        </td>
      `;
      lista.appendChild(tr);
    });

    document.querySelectorAll(".btn.danger[data-index]").forEach(btn => {
      btn.addEventListener("click", e => {
        const index = e.target.getAttribute("data-index");
        excluirAgendamento(index);
      });
    });
  }

  // ===== Filtro de busca =====
  filtroInput.addEventListener("input", e => {
    const texto = e.target.value;
    carregarAgendamentos(texto);
  });

  // ===== Excluir individual =====
  function excluirAgendamento(index) {
    let agendamentos = getAgendamentos();
    agendamentos.splice(index, 1);
    salvarAgendamentos(agendamentos);
    carregarAgendamentos(filtroInput.value);
  }

  // ===== Excluir todos =====
  btnLimpar.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja excluir todos os agendamentos?")) {
      localStorage.removeItem("agendamentos");
      carregarAgendamentos();
    }
  });
});