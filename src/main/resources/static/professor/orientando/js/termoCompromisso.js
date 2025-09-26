document.addEventListener('DOMContentLoaded', () => {
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

    elStatus.innerHTML = `<span class="badge ${badgeClass}">${texto}</span>`;
  }

  function atualizarBotoes() {
    if (!termo) return;

    if (emailUsuario === termo.emailOrientador) {
      const finalizado = termo.statusOrientador !== 'pendente';
      btnAprovar.disabled = finalizado;
      btnRejeitar.disabled = finalizado;
    } else if (emailUsuario === termo.emailCoorientador) {
      const finalizadoCoor = termo.statusFinal !== 'pendente'
      const permitido = termo.statusOrientador === 'aprovado';
      btnAprovar.disabled = !permitido || finalizadoCoor;
      btnRejeitar.disabled = !permitido || finalizadoCoor;
    } else {
      btnAprovar.disabled = true;
      btnRejeitar.disabled = true;
    }
  }

  function popularCampos(termo) {
    elEmailAluno.textContent = termo.emailAluno || '—';
    elTelefoneAluno.textContent = termo.telefoneAluno || '—';
    elCurso.textContent = termo.cursoAluno || '—';
    elTitulo.textContent = termo.titulo || '—';
    elResumo.textContent = termo.resumo || '—';
    elOrientador.textContent = termo.emailOrientador || '—';
    elCoorientador.textContent = termo.emailCoorientador || '—';
    elPerfilCoorientador.textContent = termo.perfilCoorientador || '—';
    elData.textContent = termo.criadoEm ? formatarData(termo.criadoEm) : '—';
    atualizarBadgeStatus(termo.statusFinal || 'pendente');
    atualizarBotoes();
  }

  async function buscarTermo(emailAluno) {
    try {
      const res = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao atualizar termo');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function aprovar() {
    if (!termo) return;

    if (emailUsuario === termo.emailOrientador && termo.statusOrientador === 'pendente') {
      const atualizado = await atualizarTermo(termo.id, { statusOrientador: 'aprovado' });
      if (atualizado) {
        termo.statusOrientador = 'aprovado';
        termo.statusFinal = termo.statusFinal || 'pendente';
        atualizarBadgeStatus(termo.statusFinal);
        atualizarBotoes();
      }
    } else if (emailUsuario === termo.emailCoorientador && termo.statusOrientador === 'aprovado') {
      const atualizado = await atualizarTermo(termo.id, { statusFinal: 'aprovado' });
      if (atualizado) {
        termo.statusFinal = 'aprovado';
        atualizarBadgeStatus('aprovado');
        atualizarBotoes();
      }
    }
  }

  async function rejeitar() {
    if (!termo) return;

    if (emailUsuario === termo.emailOrientador && termo.statusOrientador === 'pendente') {
      const atualizado = await atualizarTermo(termo.id, { statusOrientador: 'rejeitado' });
      if (atualizado) {
        termo.statusOrientador = 'rejeitado';
        termo.statusFinal = 'rejeitado';
        atualizarBadgeStatus('rejeitado');
        atualizarBotoes();
      }
    } else if (emailUsuario === termo.emailCoorientador && termo.statusOrientador === 'aprovado') {
      const atualizado = await atualizarTermo(termo.id, { statusFinal: 'rejeitado' });
      if (atualizado) {
        termo.statusFinal = 'rejeitado';
        atualizarBadgeStatus('rejeitado');
        atualizarBotoes();
      }
    }
  }

  btnAprovar.addEventListener('click', aprovar);
  btnRejeitar.addEventListener('click', rejeitar);

  (async () => {
    termo = await buscarTermo(emailAluno);
    if (termo) popularCampos(termo);
  })();

  document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.removeItem('orientando');
    window.location.href = '../../login.html';
  });
});
