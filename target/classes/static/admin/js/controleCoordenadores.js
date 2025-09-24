document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'admin') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
	btnSair.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../login.html';
	});

  const coordTcc = document.getElementById('coordTcc');
  const coordBcc = document.getElementById('coordBcc');
  const coordSis = document.getElementById('coordSis');
  const form = document.getElementById('formCoordenadores');
  const mensagem = document.getElementById('mensagem');
  
  const viewTcc = document.getElementById('viewTcc');
  const viewBcc = document.getElementById('viewBcc');
  const viewSis = document.getElementById('viewSis');

  let professores = [];
  let atuais = { tcc: null, bcc: null, sis: null };

  try {
    const resp = await fetch('/professores');
    professores = await resp.json();

    function preencherSelect(select, lista) {
      select.innerHTML = ''; 
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecione o professor';
      placeholder.selected = true;
      placeholder.disabled = true;
      select.appendChild(placeholder);

      lista.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.email;
        opt.textContent = p.nome;
        select.appendChild(opt);
      });
    }

    preencherSelect(coordTcc, professores);
    preencherSelect(coordBcc, professores);
    preencherSelect(coordSis, professores);

    professores.forEach(p => {
      if (p.papeis?.includes("COORD_TCC1")) {
        coordTcc.value = p.email;
        atuais.tcc = p.email;
        viewTcc.textContent = p.nome;
      }
      if (p.papeis?.includes("COORD_BCC")) {
        coordBcc.value = p.email;
        atuais.bcc = p.email;
        viewBcc.textContent = p.nome;
      }
      if (p.papeis?.includes("COORD_SIS")) {
        coordSis.value = p.email;
        atuais.sis = p.email;
        viewSis.textContent = p.nome;
      }
    });

  } catch (e) {
    mensagem.innerHTML = '<div class="alert alert-danger">Erro ao carregar professores.</div>';
  }

  async function atualizarPapel(papel, antigo, novo) {
    if (antigo && antigo !== novo) {
      await fetch(`/professores/${papel}/remover/${antigo}`, { method: 'PATCH' });
    }
    if (novo && antigo !== novo) {
      await fetch(`/professores/${papel}/adicionar/${novo}`, { method: 'PATCH' });
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const tcc = coordTcc.value;
    const bcc = coordBcc.value;
    const sis = coordSis.value;

    mensagem.innerHTML = '';

    if (bcc && sis && bcc === sis) {
      mensagem.innerHTML = '<div class="alert alert-warning">BCC e SIS não podem ter o mesmo coordenador.</div>';
      return;
    }

    try {
      await atualizarPapel("coord-tcc1", atuais.tcc, tcc);
      await atualizarPapel("coord-bcc", atuais.bcc, bcc);
      await atualizarPapel("coord-sis", atuais.sis, sis);

      const nome = email => professores.find(p => p.email === email)?.nome || '';
      viewTcc.textContent = nome(tcc);
      viewBcc.textContent = nome(bcc);
      viewSis.textContent = nome(sis);

      mensagem.innerHTML = '<div class="alert alert-success text-center">Coordenadores atualizados com sucesso!</div>';

      atuais = { tcc, bcc, sis };
    } catch (err) {
      mensagem.innerHTML = '<div class="alert alert-danger text-center">Erro ao atualizar coordenadores.</div>';
    }
  });
  
});
