document.addEventListener('DOMContentLoaded', function () {
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

	const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];
	const email = localStorage.getItem('email');

	function formatarData(isoString) {
		const data = new Date(isoString);
		return data.toLocaleDateString('pt-BR');
	}

	function carregarEntregas() {
		if (!email) return;

		fetch(`/documentos/professor/${email}`)
			.then(response => {
				if (!response.ok) throw new Error('Erro ao buscar documentos.');
				return response.json();
			})
			.then(data => {
				tabela.innerHTML = '';

				data.forEach(entrega => {
					const fileira = tabela.insertRow();
					fileira.innerHTML = `
						<td>${entrega.titulo}</td>
						<td>${entrega.emailAutor}</td>
						<td>${formatarData(entrega.criadoEm)}</td>
						<td><a href="/documentos/${entrega.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
					`;
				});
			})
			.catch(erro => console.error('Erro ao carregar entregas: ', erro));
	}

	carregarEntregas();

});
