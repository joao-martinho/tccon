document.addEventListener('DOMContentLoaded', async () => {
	const tipo = localStorage.getItem('tipo');
	if (tipo !== 'aluno') {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../login.html';
		return;
	}

	const btnSair = document.getElementById('btnSair');
	btnSair?.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../login.html';
	});

	const orientadorSelect = document.getElementById('orientador');
	const coorientadorSelect = document.getElementById('coorientador');
	const coorientadorCheckbox = document.getElementById('coorientadorCheckbox');
	const coorientadorMenu = document.getElementById('coorientadorMenu');
	const form = document.getElementById('formularioTermo');
	const collapse = new bootstrap.Collapse(coorientadorMenu, { toggle: false });

	coorientadorCheckbox.addEventListener('change', () => {
		if (coorientadorCheckbox.checked) collapse.show();
		else collapse.hide();
	});

	let professores = [];
	const professorMap = {};

	try {
		const res = await fetch('/professores');
		if (!res.ok) throw new Error();
		professores = await res.json();
		professores.forEach(prof => {
			professorMap[prof.email] = prof.nome;
			const opt1 = document.createElement('option');
			opt1.value = prof.email;
			opt1.textContent = prof.nome;
			orientadorSelect.appendChild(opt1);
			const opt2 = document.createElement('option');
			opt2.value = prof.email;
			opt2.textContent = prof.nome;
			coorientadorSelect.appendChild(opt2);
		});
	} catch {
		mostrarMensagem('Não foi possível carregar a lista de professores.', 'danger');
	}

	function validarOrientadores() {
		if (orientadorSelect.value && coorientadorSelect.value && orientadorSelect.value === coorientadorSelect.value) {
			mostrarMensagem('Orientador e coorientador não podem ser a mesma pessoa.', 'warning');
			coorientadorSelect.value = '';
		}
	}
	orientadorSelect.addEventListener('change', validarOrientadores);
	coorientadorSelect.addEventListener('change', validarOrientadores);

	const emailAluno = localStorage.getItem('email');
	if (!emailAluno) {
		mostrarMensagem('Email do aluno não encontrado na sessão local.', 'danger');
		form.querySelectorAll('input, select, button, textarea').forEach(el => el.disabled = true);
		return;
	}

	let nomeAluno, cursoAluno, telefoneAluno;
	try {
		const alunoRes = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
		if (!alunoRes.ok) throw new Error();
		const aluno = await alunoRes.json();
		nomeAluno = aluno.nome;
		cursoAluno = aluno.curso;
		telefoneAluno = aluno.telefone;
		if (aluno.orientador || aluno.coorientador) {
			try {
				const termoRes = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
				let termo = null;
				if (termoRes.ok) {
					const termoText = await termoRes.text();
					if (termoText) termo = JSON.parse(termoText);
				}
				if (termo) {
					atualizarVisualizacao(termo, professorMap);
					if (termo.statusFinal !== 'rejeitado') {
						form.querySelectorAll('input, select, button, textarea').forEach(el => el.disabled = true);
					}
				}
			} catch {}
		}
	} catch {
		mostrarMensagem('Não foi possível verificar o status do termo de compromisso. Tente novamente.', 'danger');
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const emailOrientador = orientadorSelect.value;
		const coorientador = coorientadorCheckbox.checked && coorientadorSelect.value
			? {
				email: coorientadorSelect.value,
				perfil: document.getElementById('perfilCoorientador').value.trim()
			}
			: null;

		const criadoEm = getLocalDateTimeString();

		const termo = {
			emailAluno,
			nomeAluno,
			telefoneAluno,
			cursoAluno,
			emailOrientador,
			emailCoorientador: coorientador ? coorientador.email : null,
			perfilCoorientador: coorientador ? coorientador.perfil : null,
			titulo: document.getElementById('titulo').value.trim(),
			ano: document.getElementById('ano').value,
			semestre: document.getElementById('semestre').value,
			resumo: document.getElementById('resumo').value.trim(),
			criadoEm,
			statusOrientador: null,
			statusCoorientador: null,
			statusFinal: null
		};

		try {
			await fetch(`/alunos/${encodeURIComponent(emailAluno)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orientador: emailOrientador,
					coorientador: coorientador ? coorientador.email : null
				})
			});

			await atualizarProfessor(emailOrientador, 'orientador', emailAluno);
			if (coorientador) await atualizarProfessor(coorientador.email, 'coorientador', emailAluno);

			let termoExistente = null;
			try {
				const termoRes = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
				if (termoRes.ok) {
					const termoText = await termoRes.text();
					if (termoText) termoExistente = JSON.parse(termoText);
				}
			} catch {}

			if (termoExistente && (termoExistente.statusOrientador === 'rejeitado' || termoExistente.statusCoorientador === 'rejeitado' || termoExistente.statusFinal === 'rejeitado')) {
				await fetch(`/termos/${encodeURIComponent(termoExistente.id)}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(termo)
				});
			} else {
				await fetch('/termos', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(termo)
				});
			}

			await fetch('/emails/confirmar-termo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					emailAluno,
					emailOrientador,
					emailCoorientador: coorientador ? coorientador.email : null
				})
			});

			atualizarVisualizacao(termo, professorMap);
			if (termo.statusFinal !== 'rejeitado') {
				form.querySelectorAll('input, select, button, textarea').forEach(el => el.disabled = true);
			}
			mostrarMensagem('Termo de compromisso cadastrado com sucesso.', 'success');
		} catch {
			mostrarMensagem('Ocorreu um erro ao cadastrar o termo de compromisso. Tente novamente.', 'danger');
		}
	});
});

async function atualizarProfessor(emailProfessor, tipo, emailAluno) {
	const res = await fetch(`/professores/${encodeURIComponent(emailProfessor)}`);
	if (!res.ok) throw new Error();
	const professor = await res.json();
	if (tipo === 'orientador') {
		const orientandos = professor.orientandos || [];
		if (!orientandos.includes(emailAluno)) orientandos.push(emailAluno);
		await fetch(`/professores/${encodeURIComponent(emailProfessor)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orientandos })
		});
	} else if (tipo === 'coorientador') {
		const coorientandos = professor.coorientandos || [];
		if (!coorientandos.includes(emailAluno)) coorientandos.push(emailAluno);
		await fetch(`/professores/${encodeURIComponent(emailProfessor)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ coorientandos })
		});
	}
}

function atualizarVisualizacao(termo, professorMap) {
	const visualizacao = document.getElementById('visualizacaoTermo');
	visualizacao.classList.remove('d-none');
	document.getElementById('termoTitulo').textContent = termo.titulo;
	document.getElementById('termoOrientador').textContent = professorMap[termo.emailOrientador] || termo.emailOrientador;
	if (termo.emailCoorientador) {
		document.getElementById('termoCoorientador').textContent = professorMap[termo.emailCoorientador] || termo.emailCoorientador;
		document.getElementById('termoCoorientadorContainer').classList.remove('d-none');
	} else {
		document.getElementById('termoCoorientadorContainer').classList.add('d-none');
	}
	document.getElementById('termoAnoSemestre').textContent = `${termo.ano}/${termo.semestre}`;
	document.getElementById('termoResumo').textContent = termo.resumo;
	const statusDiv = document.getElementById('termoStatus');
	let statusClass = 'alert-warning';
	let statusTexto = 'Pendente';
	if (termo.statusOrientador === 'aprovado' && (termo.statusCoorientador === 'aprovado' || !termo.emailCoorientador)) {
		statusClass = 'alert-success';
		statusTexto = 'Aprovado';
	} else if (termo.statusOrientador === 'rejeitado' || termo.statusCoorientador === 'rejeitado' || termo.statusFinal === 'rejeitado') {
		statusClass = 'alert-danger';
		statusTexto = 'Rejeitado';
	}
	statusDiv.className = `alert ${statusClass} text-center`;
	statusDiv.textContent = `Status do termo: ${statusTexto}`;
}

function mostrarMensagem(texto, tipo = 'danger') {
	const mensagemDiv = document.getElementById('mensagem');
	if (!mensagemDiv) return;
	mensagemDiv.innerHTML = `
		<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
			${texto}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
		</div>
	`;
}

function getLocalDateTimeString() {
	const now = new Date();
	const pad = (n) => n.toString().padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
