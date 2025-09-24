document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login.html';
  });

  const emailProfessor = localStorage.getItem('email');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');
  const mensagem = document.getElementById('mensagem');
  const form = document.getElementById('formularioEntrega');

  async function carregarAlunos() {
    try {
      const resp = await fetch('/alunos');
      if (!resp.ok) throw new Error('Erro ao carregar alunos.');

    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.classList.add('text-danger');
    }
  }

  async function carregarEntregas() {
    try {
      const emailAluno = localStorage.getItem('orientando')
      const resp = await fetch(`/revisoes/aluno/${emailAluno}`);
      if (!resp.ok) throw new Error('Erro ao carregar revisões.');
      const revisoes = await resp.json();

      tabelaBody.innerHTML = '';

      revisoes
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .forEach(async revisao => {
          const alunoResp = await fetch(`/alunos/${revisao.emailAluno}`);
          if (!alunoResp.ok) throw new Error('Erro ao carregar aluno.');
          const aluno = await alunoResp.json();

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${revisao.titulo}</td>
            <td>${new Date(revisao.criadoEm).toLocaleDateString('pt-BR')}</td>
            <td>
              <a href="/revisoes/${revisao.id}/download" class="btn btn-sm btn-primary">Baixar</a>
            </td>
          `;
          tabelaBody.appendChild(tr);
        });
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.classList.add('text-danger');
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    mensagem.textContent = '';

    try {
      const titulo = document.getElementById('titulo').value;
      const emailAluno = selectAluno.value;
      const arquivo = document.getElementById('arquivo').files[0];

      if (!emailAluno) throw new Error('Selecione um aluno.');
      if (!arquivo) throw new Error('Selecione um arquivo.');

      const base64 = await toBase64(arquivo);

      const payload = {
        titulo: titulo,
        emailAutor: emailProfessor,
        nomeArquivo: arquivo.name,
        arquivoBase64: base64,
        emailAluno: emailAluno
      };

      const resp = await fetch(`/revisoes/professor/${emailProfessor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Erro ao enviar revisão.');
      form.reset();
      carregarEntregas();
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.classList.add('text-danger');
    }
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result.split(',')[1];
        resolve(result);
      };
      reader.onerror = reject;
    });
  }

  carregarAlunos();
  carregarEntregas();
});
