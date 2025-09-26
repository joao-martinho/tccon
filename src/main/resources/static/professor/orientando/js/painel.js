document.addEventListener('DOMContentLoaded', async () => {
    const tipo = localStorage.getItem('tipo');
	if (tipo !== 'professor') {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../../login.html';
	}

	const btnSair = document.getElementById('btnSair');
	btnSair.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../../login.html';
	});
    
  const h1 = document.getElementById('titulo-aluno')
  h1.style.display = 'none'

  const emailAluno = localStorage.getItem('orientando')

  try {
    if (emailAluno) {
      try {
        const response = await fetch(`/alunos/${emailAluno}`)
        if (response.ok) {
          const aluno = await response.json()
          h1.textContent = `Aluno: ${aluno.nome || emailAluno}`
        } else {
          h1.textContent = `Aluno: ${emailAluno}`
        }
      } catch (err) {
        h1.textContent = `Aluno: ${emailAluno}`
      }
    } else {
      h1.textContent = 'Aluno: (não definido)'
    }
  } catch (err) {
    console.error('Erro ao interpretar orientando:', err)
    h1.textContent = 'Aluno: (não definido)'
  }
  
  h1.style.display = 'block'

  const papeisAtivos = []
  ;['coordTcc1', 'coordBcc', 'coordSis'].forEach(papel => {
    if (localStorage.getItem(papel) === 'true') {
      papeisAtivos.push(papel)
    }
  })

  document.querySelectorAll('.col').forEach(card => {
    const roles = card.getAttribute('data-role')
    const livre = card.getAttribute('data-livre') === 'true'

    if (livre) {
      card.style.display = 'block'
      return
    }

    if (roles) {
      const lista = roles.split(',').map(r => r.trim())
      const autorizado = lista.some(r => papeisAtivos.includes(r))
      if (autorizado) {
        card.style.display = 'block'
      }
    }
  })

  document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../../login.html'
  })

  const badgeMensagens = document.getElementById('badge-mensagens')
  const email = localStorage.getItem('email')

  async function atualizarBadgeMensagens() {
    const orientando = localStorage.getItem('orientando')

    if (!email || !orientando) {
      badgeMensagens.textContent = '0'
      badgeMensagens.style.display = 'none'
      return
    }

    try {
      const res = await fetch(`/notificacoes/${encodeURIComponent(email)}`)
      if (!res.ok) throw new Error(`Falha ao carregar notificações. Status: ${res.status}`)

      const dados = await res.json()
      const mensagens = Array.isArray(dados) ? dados : [dados]

      const naoLidasDoOrientando = mensagens.filter(
        msg => !msg.lida && msg.emailRemetente === orientando
      ).length

      if (naoLidasDoOrientando > 0) {
        badgeMensagens.textContent = naoLidasDoOrientando
        badgeMensagens.style.display = 'inline-block'
      } else {
        badgeMensagens.style.display = 'none'
      }
    } catch (err) {
      badgeMensagens.textContent = '0'
      badgeMensagens.style.display = 'none'
    }
  }

  await atualizarBadgeMensagens()
})
