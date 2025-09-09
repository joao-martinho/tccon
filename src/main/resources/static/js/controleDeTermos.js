document.addEventListener('DOMContentLoaded', async () => {
  const listaDeTermos = document.getElementById('listaDeTermos')
  const modalTermoEl = document.getElementById('modalTermo')
  const modalTermo = new bootstrap.Modal(modalTermoEl)

  const modalAluno = document.getElementById('modalAluno')
  const modalCurso = document.getElementById('modalCurso')
  const modalTitulo = document.getElementById('modalTitulo')
  const modalResumo = document.getElementById('modalResumo')
  const modalOrientador = document.getElementById('modalOrientador')
  const modalCoorientador = document.getElementById('modalCoorientador')
  const modalData = document.getElementById('modalData')

	let termos = []

	async function carregarTermos() {
		try {
			const res = await fetch('/termos')
			if (!res.ok) throw new Error('Falha ao buscar termos')
			termos = await res.json()
			preencherTabela()
		} catch (error) {
			console.error('Erro ao carregar termos:', error)
			listaDeTermos.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Não foi possível carregar os termos.</td></tr>'
		}
	}

	function preencherTabela() {
		listaDeTermos.innerHTML = ''
		if (!termos.length) {
			listaDeTermos.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum termo pendente</td></tr>'
			return
		}

		termos.forEach((termo, index) => {
			const tr = document.createElement('tr')
			tr.innerHTML = `
				<td>${termo.emailDoAluno}</td>
				<td>${'TODO'}</td>
				<td>${termo.titulo}</td>
				<td>${'TODO'}</td>
				<td>${termo.status || 'Pendente'}</td>
				<td><button class="btn btn-primary btn-sm btn-ver" data-index="${index}">Ver</button></td>
			`
			listaDeTermos.appendChild(tr)
		})

		document.querySelectorAll('.btn-ver').forEach(btn => {
			btn.addEventListener('click', () => {
				const termo = termos[btn.dataset.index]
				abrirModal(termo)
			})
		})
	}

	function abrirModal(termo) {
		modalAluno.textContent = termo.emailDoAluno
		modalCurso.textContent = 'TODO'
		modalTitulo.textContent = termo.titulo
		modalResumo.textContent = termo.resumo
		modalOrientador.textContent = termo.emailDoOrientador
		modalCoorientador.textContent = termo.emailDoCoorientador || '—'
		modalData.textContent = 'TODO'

		document.getElementById('btnAprovar').onclick = () => atualizarStatus(termo.id, 'Aprovado')
		document.getElementById('btnRejeitar').onclick = () => atualizarStatus(termo.id, 'Rejeitado')

		modalTermo.show()
	}

	async function atualizarStatus(id, status) {
		try {
			const res = await fetch(`/termos/${encodeURIComponent(id)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			})
			if (!res.ok) throw new Error('Falha ao atualizar status')
			await carregarTermos()
			modalTermo.hide()
			alert(`Termo ${status.toLowerCase()} com sucesso!`)
		} catch (error) {
			console.error('Erro ao atualizar status:', error)
			alert('Ocorreu um erro ao atualizar o termo. Tente novamente.')
		}
	}

	await carregarTermos()
})
