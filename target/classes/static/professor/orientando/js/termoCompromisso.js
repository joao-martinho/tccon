document.addEventListener('DOMContentLoaded', async () => {
  const emailAluno = localStorage.getItem('orientando');
  const emailUsuario = localStorage.getItem('email');

  if (!emailAluno) {
    localStorage.clear();
    window.location.href = '../../login.html';
    return;
  }

  const elEmailAluno = document.getElementById('textEmailAluno');
  const elTelefoneAluno = document.getElementById('textTelefoneAluno');
  const elCurso = document.getElementById('textCurso');
  const elTitulo = document.getElementById('textTitulo');
  const elResumo = document.getElementById('textResumo');
  const elOrientador = document.getElementById('textOrientador');
  const elCoorientador = document.getElementById('textCoorientador');
  const elPerfilCoorientador = document.getElementById('textPerfilCoorientador');
  const elData = document.getElementById('textData');
  const elStatus = document.getElementById('textStatus');

  const btnAprovar = document.getElementById('btnAprovar');
  const btnRejeitar = document.getElementById('btnRejeitar');

  let termo = null;
  let acaoAtual = null;

  function formatarData(isoString) {
    const dt = new Date(isoString);
    return dt.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function atualizarBadgeStatus(status) {
    let badgeClass = 'bg-secondary';
    let texto = 'Pendente';

    if (status?.toLowerCase() === 'aprovado') {
      badgeClass = 'bg-success';
      texto = 'Aprovado';
    } else if (status?.toLowerCase() === 'rejeitado') {
      badgeClass = 'bg-danger';
      texto = 'Rejeitado';
    } else if (status?.toLowerCase() === 'pendente') {
      badgeClass = 'bg-warning text-dark';
      texto = 'Pendente';
    }

    if (elStatus) elStatus.innerHTML = `<span class="badge ${badgeClass}">${texto}</span>`;
  }

  function atualizarBotoes() {
    if (!btnAprovar && !btnRejeitar) return;

    if (!termo) {
      if (btnAprovar) btnAprovar.disabled = true;
      if (btnRejeitar) btnRejeitar.disabled = true;
      return;
    }

    if (emailUsuario === termo.emailOrientador) {
      const finalizado = termo.statusOrientador !== 'pendente';
      if (btnAprovar) btnAprovar.disabled = finalizado;
      if (btnRejeitar) btnRejeitar.disabled = finalizado;
    } else if (emailUsuario === termo.emailCoorientador) {
      const finalizadoCoor = termo.statusFinal !== 'pendente';
      const permitido = termo.statusOrientador === 'aprovado';
      if (btnAprovar) btnAprovar.disabled = !permitido || finalizadoCoor;
      if (btnRejeitar) btnRejeitar.disabled = !permitido || finalizadoCoor;
    } else {
      if (btnAprovar) btnAprovar.disabled = true;
      if (btnRejeitar) btnRejeitar.disabled = true;
    }
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

  async function povoarCampos(t) {
    if (!t) return;
    if (elEmailAluno) elEmailAluno.textContent = t.emailAluno || '—';
    if (elTelefoneAluno) elTelefoneAluno.textContent = t.telefoneAluno || '—';
    if (elCurso) elCurso.textContent = t.cursoAluno || '—';
    if (elTitulo) elTitulo.textContent = t.titulo || '—';
    if (elResumo) elResumo.textContent = t.resumo || '—';
    if (elOrientador) elOrientador.textContent = await buscarNomeProfessor(t.emailOrientador);
    if (elCoorientador) elCoorientador.textContent = await buscarNomeProfessor(t.emailCoorientador);
    if (elPerfilCoorientador) elPerfilCoorientador.textContent = t.perfilCoorientador || '—';
    if (elData) elData.textContent = t.criadoEm ? formatarData(t.criadoEm) : '—';

    let statusParaBadge;
    if (t.emailCoorientador) {
      statusParaBadge = t.statusFinal || 'pendente';
    } else {
      statusParaBadge = t.statusOrientador || 'pendente';
    }
    atualizarBadgeStatus(statusParaBadge);

    atualizarBotoes();
  }

  async function buscarTermo(email) {
    try {
      const res = await fetch(`/termos/aluno/${encodeURIComponent(email)}?t=${Date.now()}`); // evita cache
      if (!res.ok) throw new Error('Erro ao buscar termo');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function atualizarTermo(id, dados) {
    try {
      const res = await fetch(`/termos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao atualizar termo');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function refreshTermo() {
    const atualizado = await buscarTermo(emailAluno);
    if (atualizado) {
      termo = atualizado;
      await povoarCampos(termo);
    }
  }

  async function aprovar() {
    if (!termo) return;

    if (emailUsuario === termo.emailOrientador && termo.statusOrientador === 'pendente') {
      const payload = termo.emailCoorientador
        ? { statusOrientador: 'aprovado' }
        : { statusOrientador: 'aprovado', statusFinal: 'aprovado' };

      await atualizarTermo(termo.id, payload);
      await refreshTermo();
      return;
    }

    if (emailUsuario === termo.emailCoorientador && termo.statusOrientador === 'aprovado') {
      await atualizarTermo(termo.id, { statusFinal: 'aprovado' });
      await refreshTermo();
    }
  }

  async function rejeitar() {
    if (!termo) return;

    if (emailUsuario === termo.emailOrientador && termo.statusOrientador === 'pendente') {
      const payload = { statusOrientador: 'rejeitado', statusFinal: 'rejeitado' };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
      return;
    }

    if (emailUsuario === termo.emailCoorientador && termo.statusOrientador === 'aprovado') {
      await atualizarTermo(termo.id, { statusFinal: 'rejeitado' });
      await refreshTermo();
    }
  }

  const modalHTML = `
    <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-primary" id="confirmModalSim">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalEl = document.getElementById('confirmModal');
  const modalInstance = new bootstrap.Modal(modalEl);

  function mostrarModalConfirmacao(acao) {
    acaoAtual = acao;
    const modalBody = modalEl.querySelector('.modal-body');
    modalBody.textContent = `Tem certeza de que deseja ${acao === 'aprovar' ? 'APROVAR' : 'REJEITAR'} este termo de compromisso?`;
    modalInstance.show();
  }

  const btnConfirmar = document.getElementById('confirmModalSim');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
      modalInstance.hide();
      if (acaoAtual === 'aprovar') await aprovar();
      else if (acaoAtual === 'rejeitar') await rejeitar();
      acaoAtual = null;
    });
  }

  if (btnAprovar) btnAprovar.addEventListener('click', () => mostrarModalConfirmacao('aprovar'));
  if (btnRejeitar) btnRejeitar.addEventListener('click', () => mostrarModalConfirmacao('rejeitar'));

  termo = await buscarTermo(emailAluno);
  if (termo) await povoarCampos(termo);
  atualizarBotoes();

  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      localStorage.removeItem('orientando');
      window.location.href = '../../login.html';
    });
  }
});
