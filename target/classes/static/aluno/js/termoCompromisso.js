document.addEventListener('DOMContentLoaded', () => {
	const tipo = localStorage.getItem('tipo')
	if (tipo !== 'aluno') {
		alert('Você não tem permissão para acessar esta página :(')
		window.location.href = '../login.html'
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

	const emailAluno = localStorage.getItem('email')
	const alunoRes = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`)
	if (!alunoRes.ok) throw new Error('Falha ao buscar dados do aluno.')
	const aluno = await alunoRes.json()
	const nomeAluno = aluno.nome
	const cursoAluno = aluno.curso

	if (!emailAluno) {
		mostrarMensagem('Email do aluno não encontrado na sessão local.', 'danger')
		form.querySelectorAll('input, select, button').forEach(el => el.disabled = true)
		return
	}

	try {
		const alunoRes = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`)
		if (!alunoRes.ok) throw new Error('Não foi possível recuperar os dados do aluno.')
		const aluno = await alunoRes.json()

		if (aluno.orientador || aluno.coorientador) {
			try {
				const termoRes = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`)
				let termo = null
				if (termoRes.ok) {
					const termoText = await termoRes.text()
					if (termoText) termo = JSON.parse(termoText)
				}

				if (termo) {
					document.getElementById('termoTitulo').textContent = termo.titulo
					document.getElementById('termoOrientador').textContent = termo.emailOrientador

					if (termo.emailCoorientador) {
						document.getElementById('termoCoorientador').textContent = termo.emailCoorientador
						document.getElementById('termoCoorientadorContainer').classList.remove('d-none')
					} else {
						document.getElementById('termoCoorientadorContainer').classList.add('d-none')
					}

					document.getElementById('termoAnoSemestre').textContent = `${termo.ano}/${termo.semestre}`
					document.getElementById('termoResumo').textContent = termo.resumo

					const statusDiv = document.getElementById('termoStatus')
					let statusClass = 'alert-warning'
					let statusTexto = 'Pendente'

					if (termo.statusOrientador === 'aprovado' && (termo.statusCoorientador === 'aprovado' || !termo.emailCoorientador)) {
						statusClass = 'alert-success'
						statusTexto = 'Aprovado'
					} else if (termo.statusOrientador === 'rejeitado' || termo.statusCoorientador === 'rejeitado') {
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

		const emailOrientador = document.getElementById('emailOrientador').value.trim()
		const coorientador = coorientadorCheckbox.checked ? {
			email: document.getElementById('emailCoorientador').value.trim(),
			perfil: document.getElementById('perfilCoorientador').value.trim()
		} : null

		const criadoEm = getLocalDateTimeString();

		const termo = {
			emailAluno,
			nomeAluno,
			cursoAluno,
			emailOrientador,
			emailCoorientador: coorientador ? coorientador.email : null,
			perfilCoorientador: coorientador ? coorientador.perfil : null,
			titulo: document.getElementById('tituloDoTrabalho').value.trim(),
			ano: document.getElementById('anoDaFormatura').value,
			semestre: document.getElementById('semestreDaFormatura').value,
			resumo: document.getElementById('resumoDoProblema').value.trim(),
			criadoEm
		}

		try {
			await fetch(`/alunos/${encodeURIComponent(emailAluno)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orientador: emailOrientador,
					coorientador: coorientador ? coorientador.email : null
				})
			})

			await atualizarProfessor(emailOrientador, 'orientador', emailAluno)
			if (coorientador) await atualizarProfessor(coorientador.email, 'coorientador', emailAluno)

			await fetch('/termos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(termo)
			})

			await fetch('/emails/confirmar-termo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					emailAluno: emailAluno,
					emailOrientador,
					emailCoorientador: coorientador ? coorientador.email : null
				})
			})

			mostrarMensagem('Termo de compromisso cadastrado com sucesso.', 'success')
		} catch (error) {
			console.error('Erro ao enviar dados:', error)
			mostrarMensagem('Ocorreu um erro ao cadastrar o termo de compromisso. Tente novamente.', 'danger')
		}
	})
})

async function atualizarProfessor(emailDoProfessor, tipo, emailAluno) {
	const res = await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`)
	if (!res.ok) throw new Error('Não foi possível recuperar o professor')

	const professor = await res.json()
	if (tipo === 'orientador') {
		const orientandos = professor.orientandos || []
		if (!orientandos.includes(emailAluno)) orientandos.push(emailAluno)

		await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orientandos })
		})
	} else if (tipo === 'coorientador') {
		const coorientandos = professor.coorientandos || []
		if (!coorientandos.includes(emailAluno)) coorientandos.push(emailAluno)

		await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ coorientandos })
		})
	}
}

function getLocalDateTimeString() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
