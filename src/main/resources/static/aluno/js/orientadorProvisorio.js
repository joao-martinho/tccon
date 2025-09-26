document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'aluno') {
      alert('Você não tem permissão para acessar esta página :(');
      window.location.href = '../login.html';
      return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '../login.html';
  });

  const selectOrientador = document.getElementById('orientador');
  const form = document.getElementById('formOrientador');
  const mensagem = document.getElementById('mensagem');
  const visualizacao = document.getElementById('visualizacao');
  const viewOrientador = document.getElementById('viewOrientador');
  const btnRemover = document.getElementById('btnRemoverOrientador');

  let orientadorEmail = null;
  const alunoEmail = localStorage.getItem('email');
  if (!alunoEmail) {
    mensagem.innerHTML = '<div class="alert alert-danger">Usuário não autenticado. Faça login novamente.</div>';
    return;
  }

  fetch('/professores')
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar lista de professores.');
      return response.json();
    })
    .then(professores => {
      professores.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.email;
        option.textContent = prof.nome;
        selectOrientador.appendChild(option);
      });
      return fetch(`/alunos/${encodeURIComponent(alunoEmail)}`);
    })
    .then(responseAluno => {
      if (!responseAluno.ok) throw new Error('Erro ao carregar dados do aluno.');
      return responseAluno.json();
    })
    .then(aluno => {
      if (aluno.orientadorProvisorio) {
        orientadorEmail = aluno.orientadorProvisorio;
        visualizacao.style.display = 'block';
        const option = Array.from(selectOrientador.options).find(opt => opt.value === orientadorEmail);
        viewOrientador.textContent = option ? option.textContent : orientadorEmail;
        selectOrientador.disabled = true;
        form.querySelector('button[type="submit"]').disabled = true;
      }
    })
    .catch(err => {
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const orientadorEmailSelecionado = selectOrientador.value;
    if (!orientadorEmailSelecionado) {
      mensagem.innerHTML = '<div class="alert alert-warning">Por favor, selecione um orientador.</div>';
      visualizacao.style.display = 'none';
      return;
    }

    mensagem.innerHTML = '';

    try {
      const response = await fetch(`/alunos/${encodeURIComponent(alunoEmail)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orientadorProvisorio: orientadorEmailSelecionado })
      });

      if (!response.ok) {
        const erroData = await response.json();
        throw new Error(erroData.message || 'Erro ao salvar orientador.');
      }

      orientadorEmail = orientadorEmailSelecionado;
      viewOrientador.textContent = selectOrientador.options[selectOrientador.selectedIndex].textContent;
      visualizacao.style.display = 'block';
      mensagem.innerHTML = '<div class="alert alert-success">Orientador provisório salvo com sucesso.</div>';
      selectOrientador.disabled = true;
      form.querySelector('button[type="submit"]').disabled = true;

    } catch (error) {
      mensagem.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      visualizacao.style.display = 'none';
    }
  });

  const modalHTML = `
    <div class="modal fade" id="modalConfirmRemover" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja remover o orientador provisório?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-danger" id="confirmRemove">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmRemover'));

  btnRemover?.addEventListener('click', () => {
    if (!orientadorEmail) {
      mensagem.innerHTML = '<div class="alert alert-warning">Nenhum orientador para remover.</div>';
      return;
    }
    modalConfirm.show();
  });

  document.getElementById('confirmRemove').addEventListener('click', async () => {
    modalConfirm.hide();
    try {
      const response = await fetch(`/alunos/remover-provisorio/${encodeURIComponent(alunoEmail)}/${encodeURIComponent(orientadorEmail)}`, { method: 'PATCH' });
      if (!response.ok) {
        const erroData = await response.json();
        throw new Error(erroData.message || 'Erro ao remover orientador');
      }
      mensagem.innerHTML = '<div class="alert alert-success">Orientador provisório removido com sucesso.</div>';
      visualizacao.style.display = 'none';
      selectOrientador.disabled = false;
      form.querySelector('button[type="submit"]').disabled = false;
      selectOrientador.value = "";
      orientadorEmail = null;
    } catch (err) {
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  });
});
