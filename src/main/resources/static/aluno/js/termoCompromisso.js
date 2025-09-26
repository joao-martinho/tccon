document.addEventListener('DOMContentLoaded', () => {
	const tipo = localStorage.getItem('tipo');
	if (tipo !== 'aluno') {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../login.html';
	}

	const btnSair = document.getElementById('btnSair');
	btnSair.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../login.html';
	});

  const btnFinalizar = document.querySelector('button[type="submit"]');
  const visualizacaoTermo = document.getElementById('visualizacaoTermo');
  const mensagem = document.getElementById('mensagem');

  const campos = {
    titulo: document.getElementById('titulo'),
    ano: document.getElementById('ano'),
    semestre: document.getElementById('semestre'),
    resumo: document.getElementById('resumo'),
    coorientadorCheckbox: document.getElementById('coorientadorCheckbox'),
    coorientadorMenu: document.getElementById('coorientadorMenu'),
    coorientador: document.getElementById('coorientador'),
    perfilCoorientador: document.getElementById('perfilCoorientador'),
  };

  const termoInfo = {
    termoTitulo: document.getElementById('termoTitulo'),
    termoOrientador: document.getElementById('termoOrientador'),
    termoCoorientadorContainer: document.getElementById('termoCoorientadorContainer'),
    termoCoorientador: document.getElementById('termoCoorientador'),
    termoAnoSemestre: document.getElementById('termoAnoSemestre'),
    termoResumo: document.getElementById('termoResumo'),
    termoStatus: document.getElementById('termoStatus'),
  };

  campos.coorientadorMenu.style.maxHeight = '0';
  campos.coorientadorMenu.style.overflow = 'hidden';
  campos.coorientadorMenu.style.transition = 'max-height 0.5s ease, opacity 0.5s ease';
  campos.coorientadorMenu.style.opacity = '0';

  campos.coorientadorCheckbox.addEventListener('change', () => {
    if (campos.coorientadorCheckbox.checked) {
      campos.coorientadorMenu.style.display = 'block';
      requestAnimationFrame(() => {
        campos.coorientadorMenu.style.maxHeight = campos.coorientadorMenu.scrollHeight + 'px';
        campos.coorientadorMenu.style.opacity = '1';
      });
    } else {
      campos.coorientadorMenu.style.maxHeight = '0';
      campos.coorientadorMenu.style.opacity = '0';

      setTimeout(() => {
        campos.coorientadorMenu.style.display = 'none';
      }, 500);

      campos.coorientador.value = '';
      campos.perfilCoorientador.value = '';
    }
  });

  function setCamposReadonly(readonly) {
    campos.titulo.readOnly = readonly;
    campos.ano.disabled = readonly;
    campos.semestre.disabled = readonly;
    campos.resumo.readOnly = readonly;
    campos.coorientadorCheckbox.disabled = readonly;
    campos.coorientador.disabled = readonly || !campos.coorientadorCheckbox.checked;
    campos.perfilCoorientador.readOnly = readonly || !campos.coorientadorCheckbox.checked;
  }

  function atualizarVisualizacaoTermo(termo) {
    termoInfo.termoTitulo.textContent = termo.titulo;
    termoInfo.termoOrientador.textContent = termo.emailOrientador || 'Não informado';

    if (termo.emailCoorientador) {
      termoInfo.termoCoorientadorContainer.style.display = 'block';
      termoInfo.termoCoorientador.textContent = termo.emailCoorientador;
      campos.coorientadorCheckbox.checked = true;
      campos.coorientadorMenu.style.display = 'block';
      campos.coorientadorMenu.style.maxHeight = campos.coorientadorMenu.scrollHeight + 'px';
      campos.coorientadorMenu.style.opacity = '1';

      campos.coorientador.value = termo.emailCoorientador;
      campos.perfilCoorientador.value = termo.perfilCoorientador || '';
    } else {
      termoInfo.termoCoorientadorContainer.style.display = 'none';
      campos.coorientadorCheckbox.checked = false;
      campos.coorientadorMenu.style.maxHeight = '0';
      campos.coorientadorMenu.style.opacity = '0';
      campos.coorientadorMenu.style.display = 'none';
      campos.coorientador.value = '';
      campos.perfilCoorientador.value = '';
    }

    termoInfo.termoAnoSemestre.textContent = `${termo.ano}/${termo.semestre}`;
    termoInfo.termoResumo.textContent = termo.resumo;

    let status = termo.status;
    if (!status) status = 'pendente';

    termoInfo.termoStatus.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    termoInfo.termoStatus.className = 'alert text-center';

    if (status === 'aprovado') {
      termoInfo.termoStatus.classList.add('alert-success');
      setCamposReadonly(true);
    } else if (status === 'pendente') {
      termoInfo.termoStatus.classList.add('alert-warning');
      setCamposReadonly(true);
    } else if (status === 'rejeitado') {
      termoInfo.termoStatus.classList.add('alert-danger');
      setCamposReadonly(false);
    } else {
      termoInfo.termoStatus.classList.add('alert-secondary');
      setCamposReadonly(false);
    }

    visualizacaoTermo.classList.remove('d-none');
  }

  async function carregarTermo() {
    const emailAluno = localStorage.getItem('email');
    if (!emailAluno) {
      mensagem.innerHTML = `<div class="alert alert-danger">Usuário não autenticado (email não encontrado).</div>`;
      return;
    }

    try {
      const resTermo = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
      if (resTermo.ok) {
        const termo = await resTermo.json();
        if (termo && termo.titulo) {
          campos.titulo.value = termo.titulo;
          campos.ano.value = termo.ano;
          campos.semestre.value = termo.semestre;
          campos.resumo.value = termo.resumo;

          atualizarVisualizacaoTermo(termo);
        } else {
          visualizacaoTermo.classList.add('d-none');
        }
      } else if (resTermo.status === 404) {
        visualizacaoTermo.classList.add('d-none');
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function enviarTermo() {
    const emailAluno = localStorage.getItem('email');
    if (!emailAluno) {
      mensagem.innerHTML = `<div class="alert alert-danger">Usuário não autenticado (email não encontrado).</div>`;
      return;
    }

    try {
      const resAluno = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
      if (!resAluno.ok) {
        mensagem.innerHTML = `<div class="alert alert-danger">Erro ao buscar dados do aluno: ${resAluno.statusText}</div>`;
        return;
      }
      const aluno = await resAluno.json();

      if (!campos.titulo.value.trim() || !campos.ano.value || !campos.semestre.value || !campos.resumo.value.trim()) {
        mensagem.innerHTML = `<div class="alert alert-danger">Preencha todos os campos obrigatórios do formulário.</div>`;
        return;
      }

      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // meses começam do 0
      const ano = hoje.getFullYear();

      const termo = {
        titulo: campos.titulo.value.trim(),
        emailAluno: aluno.email,
        nomeAluno: aluno.nome,
        telefoneAluno: aluno.telefone,
        cursoAluno: aluno.curso,
        ano: campos.ano.value,
        semestre: campos.semestre.value,
        resumo: campos.resumo.value.trim(),
        emailOrientador: aluno.orientadorProvisorio || null,
        emailCoorientador: campos.coorientadorCheckbox.checked ? campos.coorientador.value : null,
        perfilCoorientador: campos.coorientadorCheckbox.checked ? campos.perfilCoorientador.value.trim() : null,
        status: "pendente",
        criadoEm: new Date().toISOString()
      };

      let metodo = 'POST';
      let url = '/termos';

      const resTermoExistente = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
      if (resTermoExistente.ok) {
        let termoExistente = null;
        const text = await resTermoExistente.text();
        if (text) termoExistente = JSON.parse(text);

        if (termoExistente && termoExistente.id) {
          metodo = 'PATCH';
          url = `/termos/${encodeURIComponent(termoExistente.id)}`;
        }
      }

      const resPost = await fetch(url, {
        method: metodo,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(termo),
      });

      let termoSalvo = null;
      const resText = await resPost.text();
      if (resText) termoSalvo = JSON.parse(resText);

      mensagem.innerHTML = `<div class="alert alert-success">Termo enviado com sucesso.</div>`;

      if (termoSalvo) atualizarVisualizacaoTermo(termoSalvo);

    } catch (error) {
      mensagem.innerHTML = `<div class="alert alert-danger">Erro na conexão: ${error.message}</div>`;
    }
  }

  btnFinalizar.addEventListener('click', e => {
    e.preventDefault();
    enviarTermo();
  });

  carregarTermo();
});

   
