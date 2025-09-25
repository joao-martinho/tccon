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

  const alunoEmail = localStorage.getItem('email');
  if (!alunoEmail) {
    mensagem.innerHTML = '<div class="alert alert-danger">Usuário não autenticado. Faça login novamente.</div>';
    return;
  }

  // 1. Buscar e popular combobox de professores
  fetch('/professores')
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar lista de professores');
      return response.json();
    })
    .then(professores => {
      professores.forEach(prof => {
        // prof.email é valor, prof.nome é texto
        const option = document.createElement('option');
        option.value = prof.email;
        option.textContent = prof.nome;
        selectOrientador.appendChild(option);
      });

      // Após popular o combobox, buscar dados do aluno para verificar orientadorProvisorio
      return fetch(`/alunos/${encodeURIComponent(alunoEmail)}`);
    })
    .then(responseAluno => {
      if (!responseAluno.ok) throw new Error('Erro ao carregar dados do aluno');
      return responseAluno.json();
    })
    .then(aluno => {
      if (aluno.orientadorProvisorio) {
        // Mostrar card de visualização
        visualizacao.style.display = 'block';

        // Exibir nome do orientador no span
        // Como temos a lista de professores já no select, tentamos buscar o nome correspondente
        const option = Array.from(selectOrientador.options).find(opt => opt.value === aluno.orientadorProvisorio);
        const nomeOrientador = option ? option.textContent : aluno.orientadorProvisorio;

        viewOrientador.textContent = nomeOrientador;

        // Tornar combobox readonly (disabled)
        selectOrientador.disabled = true;

        // Opcional: desabilitar botão de submit para evitar envio
        form.querySelector('button[type="submit"]').disabled = true;
      }
    })
    .catch(err => {
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    });

  // 2. Submissão do formulário para salvar orientador via PATCH
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const orientadorEmail = selectOrientador.value;
    if (!orientadorEmail) {
      mensagem.innerHTML = '<div class="alert alert-warning">Por favor, selecione um orientador.</div>';
      visualizacao.style.display = 'none';
      return;
    }

    mensagem.innerHTML = ''; // limpa mensagens antigas

    try {
      const response = await fetch(`/alunos/${encodeURIComponent(alunoEmail)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orientadorProvisorio: orientadorEmail })
      });

      if (!response.ok) {
        const erroData = await response.json();
        throw new Error(erroData.message || 'Erro ao salvar orientador');
      }

      // Exibe orientador escolhido
      const textoOrientador = selectOrientador.options[selectOrientador.selectedIndex].textContent;
      viewOrientador.textContent = textoOrientador;
      visualizacao.style.display = 'block';

      mensagem.innerHTML = '<div class="alert alert-success">Orientador provisório salvo com sucesso.</div>';

    } catch (error) {
      mensagem.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      visualizacao.style.display = 'none';
    }
  });

      // 3. Ação de remover orientador provisório
  const btnRemover = document.getElementById('btnRemoverOrientador');
  btnRemover?.addEventListener('click', async () => {
    try {
      const response = await fetch(`/alunos/remover-provisorio/${encodeURIComponent(alunoEmail)}/${encodeURIComponent(orientadorEmail)}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        const erroData = await response.json();
        throw new Error(erroData.message || 'Erro ao remover orientador');
      }

      mensagem.innerHTML = '<div class="alert alert-success">Orientador provisório removido com sucesso.</div>';

      // Oculta a visualização e habilita novamente o formulário
      visualizacao.style.display = 'none';
      selectOrientador.disabled = false;
      form.querySelector('button[type="submit"]').disabled = false;
      selectOrientador.value = ""; // limpa a seleção

    } catch (err) {
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  });

});
