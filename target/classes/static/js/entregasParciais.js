document.addEventListener('DOMContentLoaded', () => {
	const tipo = localStorage.getItem('tipo')
	if (tipo !== 'aluno') {
		alert('Você não tem permissão para acessar esta página :(')
		window.location.href = 'login.html'
	}
})

document.addEventListener('DOMContentLoaded', function () {

	const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];
	const formularioEntrega = document.getElementById('formularioEntrega');
	const email = localStorage.getItem('email');

	function formatarData(isoString) {
		const data = new Date(isoString);
		return data.toLocaleDateString('pt-BR');
	}

	function carregarEntregas() {
		fetch(`/projetos/${email}`)
		.then(response => response.json())
		.then(data => {
			tabela.innerHTML = '';

			data.forEach(entrega => {
				const fileira = tabela.insertRow();
				fileira.innerHTML = `
					<td>${entrega.titulo}</td>
					<td>${formatarData(entrega.criadoEm)}</td>
					<td><a href="/projetos/${entrega.id}/download" class="btn btn-sm btn-outline-primary">Baixar</a></td>
				`;
			});
		})
		.catch(erro => console.error('Erro ao carregar entregas: ', erro));
	}

	carregarEntregas();

	formularioEntrega.addEventListener('submit', function(e) {
		e.preventDefault();

		const form = e.target;
		const titulo = form.querySelector('#titulo').value;
		const arquivo = form.querySelector('#arquivo').files[0];

		if (!arquivo) return;

		const reader = new FileReader();
		reader.onload = function() {
			const arquivoBase64 = reader.result.split(',')[1];
			const dados = {
				titulo: titulo,
				nomeDoArquivo: arquivo.name,
				arquivoBase64: arquivoBase64
			};

			fetch(`/projetos/${email}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dados)
			})
			.then(res => {
				if (!res.ok) throw new Error('Erro ao enviar entrega');
				return res.json();
			})
			.then(() => {
				carregarEntregas();
				form.reset();
			})
			.catch(err => console.error(err));
		};

		reader.readAsDataURL(arquivo);
	});

});
