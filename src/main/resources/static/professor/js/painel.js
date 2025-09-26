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

  const emailsProcessados = new Set();

  function criarCard(aluno, tipoOrientacao = 'Orientando', isProvisorio = false) {
    if (emailsProcessados.has(aluno.email)) return;
    emailsProcessados.add(aluno.email);

    const col = document.createElement('div');
    col.className = 'col';
    col.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm position-relative';

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'position-absolute top-0 end-0 m-2 d-flex gap-1';

    if (isProvisorio || tipoOrientacao.includes('provisório')) {
        const badgeProvisorio = document.createElement('span');
        badgeProvisorio.className = 'badge bg-warning text-dark';
        badgeProvisorio.textContent = 'Provisório';
        badgeContainer.appendChild(badgeProvisorio);
    }

    if (tipoOrientacao.includes('Coorientando')) {
        const badgeCoorientando = document.createElement('span');
        badgeCoorientando.className = 'badge bg-info text-dark';
        badgeCoorientando.textContent = 'Coorientando';
        badgeContainer.appendChild(badgeCoorientando);
    }

    if (badgeContainer.childElementCount > 0) {
        card.appendChild(badgeContainer);
    }

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column justify-content-between';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = aluno.nome;

    const text = document.createElement('p');
    text.className = 'card-text text-muted';
    text.textContent = `Clique para acompanhar o progresso do ${tipoOrientacao.toLowerCase()}.`;

    const link = document.createElement('a');
    link.href = 'orientando/painel.html';
    link.className = 'btn btn-primary mt-3';
    link.textContent = 'Acessar';

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
    const tipos = [
      { url: `/professores/orientandos/${email}`, tipo: 'Orientando', provisorio: false },
      { url: `/professores/orientandos-provisorios/${email}`, tipo: 'Orientando', provisorio: true },
      { url: `/professores/coorientandos/${email}`, tipo: 'Coorientando', provisorio: false },
      { url: `/professores/coorientandos-provisorios/${email}`, tipo: 'Coorientando', provisorio: true },
    ];

    for (const t of tipos) {
      const response = await fetch(t.url);
      if (!response.ok) throw new Error(`Erro ao buscar ${t.tipo}${t.provisorio ? ' provisórios' : ''}: ${response.status}`);
      const alunos = await response.json();
      alunos.forEach(aluno => criarCard(aluno, t.tipo, t.provisorio));
    }

  } catch (err) {
    console.error(err);
  }
});
