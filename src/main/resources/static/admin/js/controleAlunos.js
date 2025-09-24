document.addEventListener('DOMContentLoaded', function () {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'admin') {
      alert('Você não tem permissão para acessar esta página :(');
      window.location.href = '../login.html';
      return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '../login.html';
  });

  const tabela = document.getElementById('tabelaAlunos').getElementsByTagName('tbody')[0];

  const modalAlunoEl = document.getElementById('modalAluno');
  const formularioEdicao = document.getElementById('formularioEdicaoAluno');
  const modalAluno = new bootstrap.Modal(modalAlunoEl);

  function carregarAlunos() {
    fetch('/alunos')
      .then(response => response.json())
      .then(data => {
        tabela.innerHTML = '';

        data.forEach(aluno => {
          const fileira = tabela.insertRow();
          fileira.innerHTML = `
            <td>${aluno.email}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.curso}</td>
            <td>
              <button class="btn btn-warning btn-editar" data-email="${aluno.email}">Editar</button>
              <button class="btn btn-danger btn-deletar" data-email="${aluno.email}">Excluir</button>
            </td>
          `;
        });
      })
      .catch(erro => console.error('Erro ao carregar dados: ', erro));
  }

  carregarAlunos();

  document.getElementById('formularioAlunos').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const dados = {
      nome: form.querySelector('#nome')?.value,
      email: form.querySelector('#email')?.value,
      curso: form.querySelector('input[name="curso"]:checked')?.value
    };

    fetch('/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        carregarAlunos();
        form.reset();
      })
      .catch(err => console.error(err));
  });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-editar')) {
      const fileira = e.target.closest('tr');
      const email = fileira.cells[0].textContent;
      const nome = fileira.cells[1].textContent;
      const curso = fileira.cells[2].textContent;

      formularioEdicao.querySelector('#editarEmail').value = email;
      formularioEdicao.querySelector('#editarNome').value = nome;
      formularioEdicao.querySelector(`input[name="editarCurso"][value="${curso}"]`).checked = true;

      modalAluno.show();
    }

    if (e.target.classList.contains('btn-deletar')) {
      const email = e.target.dataset.email;
      fetch(`/alunos/${email}`, { method: 'DELETE' })
        .then(() => carregarAlunos())
        .catch(err => console.error(err));
    }
  });

  formularioEdicao.addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const dados = {
      nome: form.querySelector('#editarNome').value,
      curso: form.querySelector('input[name="editarCurso"]:checked').value
    };

    const email = form.querySelector('#editarEmail').value;

    fetch(`/alunos/${email}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        carregarAlunos();
        form.reset();
        modalAluno.hide();
      })
      .catch(err => console.error(err));
  });

});
