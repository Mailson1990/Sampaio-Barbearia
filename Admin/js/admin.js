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
  const anoSpan = document.getElementById("ano");
  const filtroInput = document.getElementById("filtro");
  const btnAreaCliente = document.getElementById("btn-area-cliente");

  const SENHA_CORRETA = "admin123";
  const CHAVE_SESSAO = "usuarioLogado";

  // ===== Verifica suporte ao localStorage =====
  function suporteStorage() {
    try {
      const teste = "__teste_storage__";
      localStorage.setItem(teste, "ok");
      localStorage.removeItem(teste);
      return true;
    } catch (e) {
      alert("⚠️ Seu navegador não suporta armazenamento local. Alguns recursos podem não funcionar.");
      return false;
    }
  }

  if (!suporteStorage()) return;

  // ===== Atualiza o ano no rodapé =====
  anoSpan.textContent = new Date().getFullYear();

  // ===== Verifica se já está logado =====
  if (localStorage.getItem(CHAVE_SESSAO) === "true") {
    mostrarPainel();
  }

  // ===== Login =====
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

  // ===== Mostrar painel =====
  function mostrarPainel() {
    loginContainer.classList.add("oculto");
    painel.classList.remove("oculto");
    limparAgendamentosAntigos();
    carregarAgendamentos();
  }

  // ===== Voltar à área do cliente =====
  btnAreaCliente.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // ===== Sair =====
  btnSair.addEventListener("click", () => {
    localStorage.removeItem(CHAVE_SESSAO);
    painel.classList.add("oculto");
    loginContainer.classList.remove("oculto");
    senhaInput.value = "";
  });

  // ===== Funções de armazenamento =====
  function getAgendamentos() {
    try {
      return JSON.parse(localStorage.getItem("agendamentos")) || [];
    } catch {
      return [];
    }
  }

  function salvarAgendamentos(lista) {
    localStorage.setItem("agendamentos", JSON.stringify(lista));
  }

  // ===== Excluir agendamentos antigos =====
  function limparAgendamentosAntigos() {
    let agendamentos = getAgendamentos();
    const agora = new Date();

    agendamentos = agendamentos.filter(a => {
      const [ano, mes, dia] = a.data.split("-").map(Number);
      const [hora, minuto] = a.hora.split(":").map(Number);
      const horario = new Date(ano, mes - 1, dia, hora, minuto);
      const limite = new Date(horario.getTime() + 30 * 60000);
      return agora < limite;
    });

    salvarAgendamentos(agendamentos);
  }

  // ===== Carregar agendamentos =====
  function carregarAgendamentos(filtro = "") {
    lista.innerHTML = "";
    const agendamentos = getAgendamentos();

    const filtrados = agendamentos.filter(a =>
      `${a.nome} ${a.servico} ${a.data}`
        .toLowerCase()
        .includes(filtro.toLowerCase())
    );

    if (filtrados.length === 0) {
      lista.innerHTML = `<tr><td colspan="8" style="text-align:center; color:gray;">Nenhum agendamento encontrado</td></tr>`;
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
        <td><button class="btn danger" data-index="${i}">Excluir</button></td>
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

  // ===== Filtro =====
  filtroInput.addEventListener("input", e => {
    carregarAgendamentos(e.target.value);
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
