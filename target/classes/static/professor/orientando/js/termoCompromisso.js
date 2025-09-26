document.addEventListener('DOMContentLoaded', () => {
  const email = localStorage.getItem('orientando');
  if (!email) {
    alert('Email do orientando não encontrado no localStorage. Por favor, faça login.');
    window.location.href = 'login.html';
    return;
  }

  const elEmailAluno = document.getElementById('textEmailAluno');
  const elTelefoneAluno = document.getElementById('textTelefoneAluno');
  const elCurso = document.getElementById('textCurso');
  const elTitulo = document.getElementById('textTitulo');
  const elResumo = document.getElementById('textResumo');
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

    if (status.toLowerCase() === 'aprovado') {
      badgeClass = 'bg-success';
      texto = 'Aprovado';
    } else if (status.toLowerCase() === 'rejeitado') {
      badgeClass = 'bg-danger';
      texto = 'Rejeitado';
    } else if (status.toLowerCase() === 'pendente') {
      badgeClass = 'bg-warning text-dark';
      texto = 'Pendente';
    }

    elStatus.innerHTML = `<span class="badge ${badgeClass}">${texto}</span>`;
  }

  function popularCampos(termo) {
    elEmailAluno.textContent = termo.emailAluno || '—';
    elTelefoneAluno.textContent = termo.telefoneAluno || '—';
    elCurso.textContent = termo.cursoAluno || '—';
    elTitulo.textContent = termo.titulo || '—';
    elResumo.textContent = termo.resumo || '—';
    elCoorientador.textContent = termo.emailCoorientador || '—';
    elPerfilCoorientador.textContent = termo.perfilCoorientador || '—';
    elData.textContent = termo.criadoEm ? formatarData(termo.criadoEm) : '—';
    atualizarBadgeStatus(termo.status || 'pendente');
  }

  async function buscarTermo(email) {
    try {
      const res = await fetch(`/termos/aluno/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Erro ao buscar termo');
      const data = await res.json();
      return data;
    } catch (error) {
      alert('Falha ao carregar o termo: ' + error.message);
      console.error(error);
      return null;
    }
  }

  async function atualizarTermo(id, novoStatus) {
    try {
      const res = await fetch(`/termos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar termo');

      const data = await res.json();
      return data;
    } catch (error) {
      alert('Falha ao atualizar termo: ' + error.message);
      console.error(error);
      return null;
    }
  }

  btnAprovar.addEventListener('click', async () => {
    if (!termo) return;

    const atualizado = await atualizarTermo(termo.id, 'aprovado');
    if (atualizado) {
      termo.status = 'aprovado';
      popularCampos(termo);
      alert('Termo aprovado com sucesso!');
    }
  });

  btnRejeitar.addEventListener('click', async () => {
    if (!termo) return;

    const atualizado = await atualizarTermo(termo.id, 'rejeitado');
    if (atualizado) {
      termo.status = 'rejeitado';
      popularCampos(termo);
      alert('Termo rejeitado com sucesso!');
    }
  });

  (async () => {
    termo = await buscarTermo(email);
    if (termo) {
      popularCampos(termo);
    }
  })();

  document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.removeItem('orientando');
    window.location.href = 'login.html'; // ou outra página de logout/login
  });
});
