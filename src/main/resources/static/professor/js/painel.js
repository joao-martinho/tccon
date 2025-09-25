document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const email = localStorage.getItem('email');
  if (!email) {
    console.error('Email não encontrado no localStorage');
    return;
  }

  const row = document.querySelector('.row');

  // Função para criar um card
  function criarCard(aluno, isProvisorio = false) {
    const col = document.createElement('div');
    col.className = 'col';
    col.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm position-relative';

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column justify-content-between';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = aluno.nome;

    const text = document.createElement('p');
    text.className = 'card-text text-muted';
    text.textContent = 'Clique para acompanhar o progresso do aluno.';

    const link = document.createElement('a');
    link.href = 'orientando/painel.html';
    link.className = 'btn btn-primary mt-3';
    link.textContent = 'Acessar';

    const btnContainer = document.createElement('div');
    btnContainer.className = 'd-flex gap-2 mt-3';

    link.className = 'btn btn-primary w-50';
    btnContainer.appendChild(link);

    if (isProvisorio) {
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn btn-danger w-50';
      btnRemover.textContent = 'Remover';

      btnRemover.addEventListener('click', async (event) => {
        event.stopPropagation();

        try {
          const emailProfessor = localStorage.getItem('email');
          const response = await fetch(`/professores/remover-provisorio/${encodeURIComponent(emailProfessor)}/${encodeURIComponent(aluno.email)}`, {
            method: 'PATCH',
          });

          if (!response.ok) {
            throw new Error(`Erro ao remover aluno provisório: ${response.status}`);
          }

          col.remove();
          alert('Aluno provisório removido com sucesso.');
        } catch (error) {
          console.error(error);
          alert('Ocorreu um erro ao remover o aluno.');
        }
      });

      btnContainer.appendChild(btnRemover);
    }

    body.appendChild(btnContainer);


    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(link);

    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);

    // Salva o email do aluno ao clicar no card (evite isso se clicar no botão Remover)
    card.addEventListener('click', () => {
      localStorage.setItem('orientando', aluno.email);
    });
  }

  try {
    // 🔵 Alunos fixos
    const responseFixos = await fetch(`/professores/orientandos/${encodeURIComponent(email)}`);
    if (!responseFixos.ok) throw new Error(`Erro ao buscar orientandos: ${responseFixos.status}`);
    const alunosFixos = await responseFixos.json();
    alunosFixos.forEach(aluno => criarCard(aluno, false));

    // 🟡 Alunos provisórios
    const responseProvisorios = await fetch(`/professores/orientandos-provisorios/${encodeURIComponent(email)}`);
    if (!responseProvisorios.ok) throw new Error(`Erro ao buscar orientandos provisórios: ${responseProvisorios.status}`);
    const alunosProvisorios = await responseProvisorios.json();
    alunosProvisorios.forEach(aluno => criarCard(aluno, true));

  } catch (err) {
    console.error(err);
  }
});
