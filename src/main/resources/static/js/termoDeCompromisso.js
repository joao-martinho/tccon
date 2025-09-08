document.addEventListener("DOMContentLoaded", () => {
	const coorientadorCheckbox = document.getElementById("coorientadorCheckbox");
	const coorientadorMenu = document.getElementById("coorientadorMenu");
	const form = document.getElementById("formularioDoTermo");

	const collapse = new bootstrap.Collapse(coorientadorMenu, { toggle: false });

	coorientadorCheckbox.addEventListener("change", () => {
		if (coorientadorCheckbox.checked) {
			collapse.show();
		} else {
			collapse.hide();
		}
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const emailDoAluno = localStorage.getItem('email')

		const orientador = {
			email: document.getElementById("emailDoOrientador").value.trim()
		};

		let coorientador = null;
		if (coorientadorCheckbox.checked) {
			coorientador = {
				email: document.getElementById("emailDoCoorientador").value.trim(),
				perfil: document.getElementById("perfilDoCoorientador").value.trim()
			};
		}

		const termo = {
			emailDoAluno: emailDoAluno,
			emailDoOrientador: orientador.email,
			emailDoCoorientador: coorientador ? coorientador.email : null,
			perfilDoCoorientador: coorientador ? coorientador.perfil : null,
			titulo: document.getElementById("tituloDoTrabalho").value.trim(),
			ano: document.getElementById("anoDaFormatura").value,
			semestre: document.getElementById("semestreDaFormatura").value,
			resumo: document.getElementById("resumoDoProblema").value.trim()
		};


		try {
			console.log("Enviando PATCH para aluno:", {
				orientador: orientador.email,
				coorientador: coorientador ? coorientador.email : null
			});

			await fetch(`/alunos/${encodeURIComponent(emailDoAluno)}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					orientador: orientador.email,
					coorientador: coorientador ? coorientador.email : null
				})
			});

			atualizarProfessor(orientador.email, 'orientador', emailDoAluno)
			atualizarProfessor(coorientador.email, 'coorientador', emailDoAluno)

			await fetch("/termos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(termo)
			});

			alert("Termo de compromisso cadastrado com sucesso!");
		} catch (error) {
			console.error("Erro ao enviar dados:", error);
			alert("Ocorreu um erro ao cadastrar o termo. Tente novamente.");
		}
	});

});

async function atualizarProfessor(emailDoProfessor, tipo, emailDoAluno) {
	const res = await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`);
	if (!res.ok) throw new Error("Não foi possível recuperar o professor");

	const professor = await res.json();
	
	if (tipo === 'orientador') {
		let orientandos = professor.orientandos || [];

		if (!orientandos.includes(emailDoAluno)) {
			orientandos.push(emailDoAluno);
		}

		await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ orientandos })
		});
	} 
	else if (tipo === 'coorientador') {
		let coorientandos = professor.coorientandos || [];

		if (!coorientandos.includes(emailDoAluno)) {
			coorientandos.push(emailDoAluno);
		}

		await fetch(`/professores/${encodeURIComponent(emailDoProfessor)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ coorientandos })
		});
	}
}

