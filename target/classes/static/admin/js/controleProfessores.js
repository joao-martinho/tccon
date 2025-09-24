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

  const tabela = document.getElementById('tabelaProfessores').getElementsByTagName('tbody')[0]

  const modalProfessorEl = document.getElementById('modalProfessor')
  const formularioEdicao = document.getElementById('formularioEdicaoProfessor')
  const modalProfessor = new bootstrap.Modal(modalProfessorEl)

  function carregarProfessores() {
    fetch('/professores')
      .then(response => response.json())
      .then(data => {
        tabela.innerHTML = ''
        data.forEach(professor => {
          const fileira = tabela.insertRow()
          fileira.innerHTML = `
            <td>${professor.email}</td>
            <td>${professor.nome}</td>
            <td>
              <button class="btn btn-warning btn-editar" data-email="${professor.email}">Editar</button>
              <button class="btn btn-danger btn-deletar" data-email="${professor.email}">Excluir</button>
            </td>
          `
        })
      })
      .catch(erro => console.error('Erro ao carregar dados: ', erro))
  }

  carregarProfessores()

  document.getElementById('formularioProfessores').addEventListener('submit', function (e) {
    e.preventDefault()
    const form = e.target
    const dados = {
      nome: form.querySelector('#nome')?.value,
      email: form.querySelector('#email')?.value
    }

    fetch('/professores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(res => {
        console.log(res)
        carregarProfessores()
        form.reset()
      })
      .catch(err => console.error(err))
  })

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-editar')) {
      const fileira = e.target.closest('tr')
      const email = fileira.cells[0].textContent
      const nome = fileira.cells[1].textContent

      formularioEdicao.querySelector('#editarEmail').value = email
      formularioEdicao.querySelector('#editarNome').value = nome

      modalProfessor.show()
    }

    if (e.target.classList.contains('btn-deletar')) {
      const email = e.target.dataset.email
      fetch(`/professores/${email}`, { method: 'DELETE' })
        .then(() => carregarProfessores())
        .catch(err => console.error(err))
    }
  })

  formularioEdicao.addEventListener('submit', function (e) {
    e.preventDefault()
    const form = e.target
    const dados = { nome: form.querySelector('#editarNome').value }
    const email = form.querySelector('#editarEmail').value

    fetch(`/professores/${email}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(res => {
        console.log(res)
        carregarProfessores()
        form.reset()
        modalProfessor.hide()
      })
      .catch(err => console.error(err))
  })
})
