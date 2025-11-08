document.addEventListener("DOMContentLoaded", () => {
  const btnAgendar = document.getElementById("btn-agendar");
  const modal = document.getElementById("modal");
  const fecharModal = document.getElementById("fechar-modal");
  const btnCancel = document.getElementById("btn-cancel");
  const form = document.getElementById("form-agendamento");
   const responsavelSelect = document.getElementById("responsavel");
  const horaSelect = document.getElementById("hora");
  const dataInput = document.getElementById("data");
  const servicoSelect = document.getElementById("servico");

  // === Abrir e fechar modal ===
  btnAgendar.addEventListener("click", () => modal.classList.add("ativo"));
  fecharModal.addEventListener("click", () => modal.classList.remove("ativo"));
  btnCancel.addEventListener("click", () => modal.classList.remove("ativo"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("ativo");
  });

  // === Durações dos serviços (em minutos) ===
  const duracoes = {
    "Barba": 30,
    "Alisamento": 20,
    "Corte": 50,
    "Corte e Penteado": 60,
    "Luzes": 60,
    "Penteado": 15,
    "Pezinho": 10,
    "Progressiva": 60,
    "Sobrancelha": 5
  };

  // === Gera horários de minuto em minuto (09:00 até 18:00) ===
  function gerarHorarios() {
    const horarios = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m++) {
        if (h === 18 && m > 0) break;
        const horaFormatada = `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}`;
        horarios.push(horaFormatada);
      }
    }
    return horarios;
  }

  // === Recuperar agendamentos ===
  function obterAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
  }

  // === Atualizar horários disponíveis ===
  function atualizarHorarios() {
    horaSelect.innerHTML = "";

    const servicoSelecionado = servicoSelect.value;
    const responsavelSelecionado = responsavelSelect.value;
    const dataSelecionada = dataInput.value;

    if (!servicoSelecionado || !responsavelSelecionado || !dataSelecionada) return;

    const duracao = duracoes[servicoSelecionado] || 0;
    if (!duracao) return;

    const horarios = gerarHorarios();
    const agendamentos = obterAgendamentos();

    // === Filtra horários já ocupados para o mesmo responsável e data ===
    const ocupados = agendamentos
      .filter(
        (a) => a.data === dataSelecionada && a.responsavel === responsavelSelecionado
      )
      .map((a) => ({ hora: a.hora, duracao: parseInt(a.duracao) }));

    let disponiveis = horarios.filter((hora) => {
      const [h, m] = hora.split(":").map(Number);
      const inicio = h * 60 + m;
      const fim = inicio + duracao;

      const livre = !ocupados.some((ag) => {
        const [ah, am] = ag.hora.split(":").map(Number);
        const inicioAg = ah * 60 + am;
        const fimAg = inicioAg + ag.duracao;
        return (
          (inicio >= inicioAg && inicio < fimAg) ||
          (fim > inicioAg && fim <= fimAg)
        );
      });

      return livre;
    });

    // === 🔥 BLOQUEIA horários anteriores ao horário atual do sistema (se for o mesmo dia) ===
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split("T")[0]; // formato YYYY-MM-DD
    if (dataSelecionada === dataHoje) {
      const horaAtual = hoje.getHours();
      const minutoAtual = hoje.getMinutes();

      disponiveis = disponiveis.filter((hora) => {
        const [h, m] = hora.split(":").map(Number);
        return h > horaAtual || (h === horaAtual && m > minutoAtual);
      });
    }

    // === Exibe na lista de horários ===
    if (disponiveis.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "Sem horários disponíveis";
      opt.disabled = true;
      horaSelect.appendChild(opt);
    } else {
      disponiveis.forEach((hora) => {
        const opt = document.createElement("option");
        opt.value = hora;
        opt.textContent = hora;
        horaSelect.appendChild(opt);
      });
    }
  }

  // === Atualiza horários quando serviço, data ou responsável mudam ===
  servicoSelect.addEventListener("change", atualizarHorarios);
  responsavelSelect.addEventListener("change", atualizarHorarios);
  dataInput.addEventListener("change", atualizarHorarios);

  // === Salvar agendamento e enviar via WhatsApp ===
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const servico = servicoSelect.value;
    const responsavel = responsavelSelect.value;
    const data = dataInput.value;
    const hora = horaSelect.value;
    const duracao = duracoes[servico] || 0;

    if (!hora) {
      alert("Selecione um horário disponível.");
      return;
    }

    const agendamento = {
      nome,
      telefone,
      servico,
      duracao,
      responsavel,
      data,
      hora,
      criadoEm: new Date().toLocaleString("pt-BR"),
    };

    const agendamentos = obterAgendamentos();
    agendamentos.push(agendamento);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    // Enviar WhatsApp
    const msg = `Olá! Gostaria de agendar um horário:%0A%0A👤 *Nome:* ${nome}%0A📞 *Telefone:* ${telefone}%0A💈 *Serviço:* ${servico}%0A💇‍♂️ *Responsável:* ${responsavel}%0A📅 *Data:* ${data}%0A🕒 *Hora:* ${hora}`;
    const link = `https://wa.me/5511933199127?text=${msg}`;
    window.open(link, "_blank");

    alert("✅ Agendamento registrado com sucesso!");
    form.reset();
    horaSelect.innerHTML = "";
  });
});

