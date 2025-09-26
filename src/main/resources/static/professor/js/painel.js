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

    if (isProvisorio) {
      const badge = document.createElement('span');
      badge.className = 'badge bg-warning text-dark position-absolute top-0 end-0 m-2';
      badge.textContent = 'Provisório';
      card.appendChild(badge);
    }

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(link);

    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);

    card.addEventListener('click', () => {
      localStorage.setItem('orientando', aluno.email);
    });
  }

  try {
    const responseFixos = await fetch(`/professores/orientandos/${email}`);
    if (!responseFixos.ok) throw new Error(`Erro ao buscar orientandos: ${responseFixos.status}`);
    const alunosFixos = await responseFixos.json();
    alunosFixos.forEach(aluno => criarCard(aluno, false));

    const responseProvisorios = await fetch(`/professores/orientandos-provisorios/${email}`);
    if (!responseProvisorios.ok) throw new Error(`Erro ao buscar orientandos provisórios: ${responseProvisorios.status}`);
    const alunosProvisorios = await responseProvisorios.json();
    alunosProvisorios.forEach(aluno => criarCard(aluno, true));

  } catch (err) {
    console.error(err);
  }
});
