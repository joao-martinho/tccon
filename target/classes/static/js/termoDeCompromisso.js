document.addEventListener('DOMContentLoaded', () => {
	const tipo = localStorage.getItem('tipo')
	if (tipo !== 'aluno') {
		alert('Você não tem permissão para acessar esta página :(')
		window.location.href = 'login.html'
	}
})

function mostrarMensagem(texto, tipo = 'danger') {
	const mensagemDiv = document.getElementById('mensagem')
	if (!mensagemDiv) return
	mensagemDiv.innerHTML = `
		<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
			${texto}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
		</div>
	`
}

document.addEventListener('DOMContentLoaded', async () => {
	const coorientadorCheckbox = document.getElementById('coorientadorCheckbox')
	const coorientadorMenu = document.getElementById('coorientadorMenu')
	const form = document.getElementById('formularioDoTermo')
	const visualizacao = document.getElementById('visualizacaoDoTermo')

	const collapse = new bootstrap.Collapse(coorientadorMenu, { toggle: false })

	coorientadorCheckbox.addEventListener('change', () => {
		if (coorientadorCheckbox.checked) collapse.show()
		else collapse.hide()
	})

	const emailDoAluno = localStorage.getItem('email')
	if (!emailDoAluno) {
		mostrarMensagem('Email do aluno não encontrado na sessão local.', 'danger')
		form.querySelectorAll('input, select, button').forEach(el => el.disabled = true)
		return
	}

	try {
		const alunoRes = await fetch(`/alunos/${encodeURIComponent(emailDoAluno)}`)
		if (!alunoRes.ok) throw new Error('Não foi possível recuperar os dados do aluno.')
		const aluno = await alunoRes.json()

		if (aluno.orientador || aluno.coorientador) {
			// Buscar termo existente, mas continuar mesmo se não existir
			try {
				const termoRes = await fetch(`/termos/aluno/${encodeURIComponent(emailDoAluno)}`)
				let termo = null
				if (termoRes.ok) {
					const termoText = await termoRes.text()
					if (termoText) termo = JSON.parse(termoText)
				}

				if (termo) {
					document.getElementById('termoTitulo').textContent = termo.titulo
					document.getElementById('termoOrientador').textContent = termo.emailDoOrientador
					if (termo.emailDoCoorientador) {
						document.getElementById('termoCoorientador').textContent = termo.emailDoCoorientador
						document.getElementById('termoCoorientadorContainer').classList.remove('d-none')
					} else {
						document.getElementById('termoCoorientadorContainer').classList.add('d-none')
					}
					document.getElementById('termoAnoSemestre').textContent = `${termo.ano}/${termo.semestre}`
					document.getElementById('termoResumo').textContent = termo.resumo

					const statusDiv = document.getElementById('termoStatus')
					let statusClass = 'alert-warning'
					let statusTexto = 'Pendente'
					if (termo.statusDoOrientador === 'aprovado' && termo.statusDoCoorientador === 'aprovado') {
						statusClass = 'alert-success'
						statusTexto = 'Aprovado'
					} else if (termo.status === 'rejeitado' || termo.status === 'rejeitado') {
						statusClass = 'alert-danger'
						statusTexto = 'Rejeitado'
					}
					statusDiv.className = `alert ${statusClass} text-center`
					statusDiv.textContent = `Status do termo: ${statusTexto}`

					visualizacao.classList.remove('d-none')
					form.querySelectorAll('input, select, button').forEach(el => el.disabled = true)
				}
			} catch (error) {
				console.warn('Não foi possível recuperar o termo, mas o formulário continuará vazio.', error)
			}
		}

	} catch (error) {
		console.error('Erro ao verificar aluno:', error)
		mostrarMensagem('Não foi possível verificar o status do termo de compromisso. Tente novamente.', 'danger')
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault()

		const emailDoOrientador = document.getElementById('emailDoOrientador').value.trim()
		const coorientador = coorientadorCheckbox.checked ? {
			email: document.getElementById('emailDoCoorientador').value.trim(),
			perfil: document.getElementById('perfilDoCoorientador').value.trim()
		} : null

		const termo = {
			emailDoAluno,
			emailDoOrientador,
			emailDoCoorientador: coorientador ? coorientador.email : null,
			perfilDoCoorientador: coorientador ? coorientador.perfil : null,
			titulo: document.getElementById('tituloDoTrabalho').value.trim(),
			ano: document.getElementById('anoDaFormatura').value,
			semestre: document.getElementById('semestreDaFormatura').value,
			resumo: document.getElementById('resumoDoProblema').value.trim()
		}

		try {
			await fetch(`/alunos/${encodeURIComponent(emailDoAluno)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orientador: emailDoOrientador,
					coorientador: coorientador ? coorientador.email : null
				})
			})

			await atualizarProfessor(emailDoOrientador, 'orientador', emailDoAluno)
			if (coorientador) await atualizarProfessor(coorientador.email, 'coorientador', emailDoAluno)

			await fetch('/termos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(termo)
			})

			await fetch('/emails/confirmar-termo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					emailAluno: emailDoAluno,
					emailDoOrientador,
					emailDoCoorientador: coorientador ? coorientador.email : null
				})
			})

			mostrarMensagem('Termo de compromisso cadastrado com sucesso.', 'success')
		} catch (error) {
			console.error('Erro ao enviar dados:', error)
			mostrarMensagem('Ocorreu um erro ao cadastrar o termo de compromisso. Tente novamente.', 'danger')
		}
	})
})

async function atualizarProfessor(emailDoProfessor, tipo, emailDoAluno) {
	const res = await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`)
	if (!res.ok) throw new Error('Não foi possível recuperar o professor')

	const professor = await res.json()
	if (tipo === 'orientador') {
		const orientandos = professor.orientandos || []
		if (!orientandos.includes(emailDoAluno)) orientandos.push(emailDoAluno)

		await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orientandos })
		})
	} else if (tipo === 'coorientador') {
		const coorientandos = professor.coorientandos || []
		if (!coorientandos.includes(emailDoAluno)) coorientandos.push(emailDoAluno)

		await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ coorientandos })
		})
	}
}
