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
    
  const email = localStorage.getItem('email')
  if (!email) {
    console.error('Email não encontrado no localStorage')
    return
  }

  try {
    const response = await fetch(`/professores/orientandos/${email}`)
    if (!response.ok) {
      throw new Error(`Erro ao buscar orientandos: ${response.status}`)
    }
    const orientandos = await response.json()

    const row = document.querySelector('.row')
    orientandos.forEach(o => {
      const col = document.createElement('div')
      col.className = 'col'
      col.style.display = 'block'

      const card = document.createElement('div')
      card.className = 'card h-100 shadow-sm'

      const body = document.createElement('div')
      body.className = 'card-body d-flex flex-column justify-content-between'

      const title = document.createElement('h5')
      title.className = 'card-title'
      title.textContent = o.nome

      const text = document.createElement('p')
      text.className = 'card-text text-muted'
      text.textContent = 'Clique para acompanhar o progresso do aluno.'

      const link = document.createElement('a')
      link.href = 'orientando/painel.html'
      link.className = 'btn btn-primary mt-3'
      link.textContent = 'Acessar'

      body.appendChild(title)
      body.appendChild(text)
      body.appendChild(link)

      card.appendChild(body)
      col.appendChild(card)
      row.appendChild(col)

      card.addEventListener('click', () => {
        localStorage.setItem('orientando', o.email)
      })
    })
  } catch (err) {
    console.error(err)
  }
})
