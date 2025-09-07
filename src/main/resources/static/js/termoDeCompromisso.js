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

		const aluno = {
			email: document.getElementById("emailDoAluno").value.trim()
		};

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
			emailDoAluno: aluno.email,
			emailDoOrientador: orientador.email,
			emailDoCoorientador: coorientador ? coorientador.email : null,
			perfilDoCoorientador: coorientador ? coorientador.perfil : null,
			titulo: document.getElementById("tituloDoTrabalho").value.trim(),
			ano: document.getElementById("anoDaFormatura").value,
			semestre: document.getElementById("semestreDaFormatura").value,
			resumo: document.getElementById("resumoDoProblema").value.trim()
		};

		try {
			await fetch(`/alunos/${encodeURIComponent(aluno.email)}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					orientador: orientador,
					coorientador: coorientador
				})
			});

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
