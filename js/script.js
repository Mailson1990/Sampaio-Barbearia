document.addEventListener("DOMContentLoaded", () => {
  // === Seletores ===
  const btnAgendar = document.getElementById("btn-agendar");
  const modal = document.getElementById("modal");
  const fecharModal = document.getElementById("fechar-modal");
  const btnCancel = document.getElementById("btn-cancel");
  const form = document.getElementById("form-agendamento");
  const responsavelSelect = document.getElementById("responsavel");
  const horaSelect = document.getElementById("hora");
  const dataInput = document.getElementById("data");
  const servicoSelect = document.getElementById("servico");

  // Checa se os elementos existem
  if (!btnAgendar || !modal || !fecharModal || !btnCancel) {
    console.error("Algum elemento do modal não foi encontrado no DOM. Verifique os IDs.");
    return;
  }

  // === Modal ===
  function abrirModal() {
    modal.classList.add("ativo");
  }

  function fecharModalFunc() {
    modal.classList.remove("ativo");
  }

  btnAgendar.addEventListener("click", abrirModal);
  fecharModal.addEventListener("click", fecharModalFunc);
  btnCancel.addEventListener("click", fecharModalFunc);
  window.addEventListener("click", (e) => {
    if (e.target === modal) fecharModalFunc();
  });

  // === Durações dos serviços (minutos) ===
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

  // === Gera horários minuto a minuto ===
  function gerarHorarios() {
    const horarios = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m++) {
        if (h === 18 && m > 0) break;
        horarios.push(`${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}`);
      }
    }
    return horarios;
  }

  // === Obter agendamentos ===
  async function obterAgendamentos() {
    const snapshot = await getDocs(collection(db, "agendamentos"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // === Atualizar horários disponíveis ===
  async function atualizarHorarios() {
    horaSelect.innerHTML = "";
    const servico = servicoSelect.value;
    const responsavel = responsavelSelect.value;
    const data = dataInput.value;
    if (!servico || !responsavel || !data) return;

    const duracaoServico = duracoes[servico];
    if (!duracaoServico) return;

    const horarios = gerarHorarios();
    const agendamentos = await obterAgendamentos();

    const ocupados = agendamentos
      .filter(a => a.data === data && a.responsavel === responsavel)
      .map(a => ({ hora: a.hora, duracao: Number(a.duracao) }));

    const disponiveis = horarios.filter(h => {
      const [hH, hM] = h.split(":").map(Number);
      const inicio = hH * 60 + hM;
      const fim = inicio + duracaoServico;

      return !ocupados.some(o => {
        const [oh, om] = o.hora.split(":").map(Number);
        const inicioOcupado = oh * 60 + om;
        const fimOcupado = inicioOcupado + o.duracao;
        return (inicio < fimOcupado && fim > inicioOcupado);
      });
    });

    // Bloquear horários anteriores se for hoje
    const hoje = new Date();
    const agora = hoje.getHours() * 60 + hoje.getMinutes();
    const dataHoje = hoje.toISOString().split("T")[0];

    disponiveis.forEach(h => {
      const [hh, mm] = h.split(":").map(Number);
      if (data !== dataHoje || (hh*60 + mm > agora)) {
        const opt = document.createElement("option");
        opt.value = h;
        opt.textContent = h;
        horaSelect.appendChild(opt);
      }
    });

    if (!horaSelect.options.length) {
      const opt = document.createElement("option");
      opt.textContent = "Sem horários disponíveis";
      opt.disabled = true;
      horaSelect.appendChild(opt);
    }
  }

  servicoSelect.addEventListener("change", atualizarHorarios);
  responsavelSelect.addEventListener("change", atualizarHorarios);
  dataInput.addEventListener("change", atualizarHorarios);

  // === Envio formulário ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = form.querySelector("#nome").value.trim();
    const telefone = form.querySelector("#telefone").value.trim();
    const servico = servicoSelect.value;
    const responsavel = responsavelSelect.value;
    const data = dataInput.value;
    const hora = horaSelect.value;
    const duracaoServico = duracoes[servico];

    if (!hora) { alert("Selecione um horário disponível."); return; }

    const agendamento = { nome, telefone, servico, responsavel, data, hora, duracao: duracaoServico };

    try {
      await addDoc(collection(db, "agendamentos"), agendamento);
      alert("✅ Agendamento salvo!");
      fecharModalFunc();
      form.reset();
      horaSelect.innerHTML = "";
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao salvar agendamento.");
    }

    // Enviar WhatsApp
    const msg = `Olá! Gostaria de agendar um horário:%0A%0A👤 *Nome:* ${nome}%0A📞 *Telefone:* ${telefone}%0A💈 *Serviço:* ${servico}%0A💇‍♂️ *Responsável:* ${responsavel}%0A📅 *Data:* ${data}%0A🕒 *Hora:* ${hora}`;
    const link = `https://wa.me/5511933199127?text=${msg}`;
    window.open(link, "_blank");
  });
});

