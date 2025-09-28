document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'aluno') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const btnFinalizar = document.querySelector('button[type="submit"]');
  const visualizacaoTermo = document.getElementById('visualizacaoTermo');
  const mensagem = document.getElementById('mensagem');

  const campos = {
    titulo: document.getElementById('titulo'),
    ano: document.getElementById('ano'),
    semestre: document.getElementById('semestre'),
    resumo: document.getElementById('resumo')
  };

  const termoInfo = {
    termoTitulo: document.getElementById('termoTitulo'),
    termoOrientador: document.getElementById('termoOrientador'),
    termoCoorientadorContainer: document.getElementById('termoCoorientadorContainer'),
    termoCoorientador: document.getElementById('termoCoorientador'),
    termoAnoSemestre: document.getElementById('termoAnoSemestre'),
    termoResumo: document.getElementById('termoResumo'),
    termoStatus: document.getElementById('termoStatus')
  };

  function setCamposReadonly(readonly) {
    campos.titulo.readOnly = readonly;
    campos.ano.disabled = readonly;
    campos.semestre.disabled = readonly;
    campos.resumo.readOnly = readonly;
  }

  async function buscarNomeProfessor(email) {
    if (!email) return '—';
    try {
      const res = await fetch(`/professores/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Erro ao buscar professor');
      const dados = await res.json();
      return dados.nome || '—';
    } catch (err) {
      console.error(err);
      return '—';
    }
  }

  async function atualizarVisualizacaoTermo(termo) {
    termoInfo.termoTitulo.textContent = termo.titulo;
    termoInfo.termoOrientador.textContent = await buscarNomeProfessor(termo.emailOrientador);

    if (termo.emailCoorientador) {
      termoInfo.termoCoorientadorContainer.style.display = 'block';
      termoInfo.termoCoorientador.textContent = await buscarNomeProfessor(termo.emailCoorientador);
    } else {
      termoInfo.termoCoorientadorContainer.style.display = 'none';
    }

    termoInfo.termoAnoSemestre.textContent = `${termo.ano}/${termo.semestre}`;
    termoInfo.termoResumo.textContent = termo.resumo;

    let status = termo.statusFinal || 'pendente';
    termoInfo.termoStatus.textContent = `Status: ${status}`;
    termoInfo.termoStatus.className = 'alert text-center';

    if (status === 'aprovado') {
      termoInfo.termoStatus.classList.add('alert-success');
      setCamposReadonly(true);
    } else if (status === 'pendente') {
      termoInfo.termoStatus.classList.add('alert-warning');
      setCamposReadonly(true);
    } else if (status === 'rejeitado') {
      termoInfo.termoStatus.classList.add('alert-danger');
      setCamposReadonly(false);
    } else {
      termoInfo.termoStatus.classList.add('alert-secondary');
      setCamposReadonly(false);
    }

    visualizacaoTermo.classList.remove('d-none');
  }

  async function carregarTermo() {
    const emailAluno = localStorage.getItem('email');
    if (!emailAluno) {
      mensagem.innerHTML = `<div class="alert alert-danger">Usuário não autenticado.</div>`;
      return;
    }

    try {
      const resTermo = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
      if (resTermo.ok) {
        const termo = await resTermo.json();
        if (termo && termo.titulo) {
          campos.titulo.value = termo.titulo;
          campos.ano.value = termo.ano;
          campos.semestre.value = termo.semestre;
          campos.resumo.value = termo.resumo;
          await atualizarVisualizacaoTermo(termo);
        } else {
          visualizacaoTermo.classList.add('d-none');
        }
      } else if (resTermo.status === 404) {
        visualizacaoTermo.classList.add('d-none');
      }
    } catch (error) {
      console.log(error);
    }
  }

  carregarTermo();

  async function enviarTermo() {
    const emailAluno = localStorage.getItem('email');
    if (!emailAluno) {
      mensagem.innerHTML = `<div class="alert alert-danger">Usuário não autenticado (email não encontrado).</div>`;
      return;
    }

    try {
      const resAluno = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
      if (!resAluno.ok) {
        mensagem.innerHTML = `<div class="alert alert-danger">Erro ao buscar dados do aluno: ${resAluno.statusText}</div>`;
        return;
      }
      const aluno = await resAluno.json();

      if (!campos.titulo.value.trim() || !campos.ano.value || !campos.semestre.value || !campos.resumo.value.trim()) {
        mensagem.innerHTML = `<div class="alert alert-danger">Preencha todos os campos obrigatórios do formulário.</div>`;
        return;
      }

      const data = new Date();
      const offset = 3 * 60;
      const dataUTC3 = new Date(data.getTime() - offset * 60 * 1000).toISOString();

      const termo = {
        titulo: campos.titulo.value.trim(),
        emailAluno: aluno.email,
        nomeAluno: aluno.nome,
        telefoneAluno: aluno.telefone,
        cursoAluno: aluno.curso,
        ano: campos.ano.value,
        semestre: campos.semestre.value,
        resumo: campos.resumo.value.trim(),
        emailOrientador: aluno.orientadorProvisorio || null,
        emailCoorientador: aluno.coorientadorProvisorio || null,
        statusOrientador: "pendente",
        statusFinal: "pendente",
        criadoEm: dataUTC3,
      };

      let metodo = 'POST';
      let url = '/termos';

      const resTermoExistente = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
      if (resTermoExistente.ok) {
        let termoExistente = null;
        const text = await resTermoExistente.text();
        if (text) termoExistente = JSON.parse(text);

        if (termoExistente && termoExistente.id) {
          metodo = 'PATCH';
          url = `/termos/${encodeURIComponent(termoExistente.id)}`;
        }
      }

      const resPost = await fetch(url, {
        method: metodo,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(termo),
      });

      let termoSalvo = null;
      const resText = await resPost.text();
      if (resText) termoSalvo = JSON.parse(resText);

      mensagem.innerHTML = `<div class="alert alert-success">Termo enviado com sucesso.</div>`;
      if (termoSalvo) atualizarVisualizacaoTermo(termoSalvo);

    } catch (error) {
      mensagem.innerHTML = `<div class="alert alert-danger">Erro na conexão: ${error.message}</div>`;
    }
  }

  const modalHTML = `
    <div class="modal fade" id="modalConfirmEnviar" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja enviar o termo de compromisso?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-success" id="confirmEnviar">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmEnviar'));

  btnFinalizar.addEventListener('click', e => {
    e.preventDefault();
    modalConfirm.show();
  });

  document.getElementById('confirmEnviar').addEventListener('click', async () => {
    modalConfirm.hide();
    await enviarTermo();
  });

  carregarTermo();
});
