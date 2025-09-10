document.addEventListener('DOMContentLoaded', () => {
	const tipo = localStorage.getItem('tipo')
	if (tipo !== 'professor') {
		alert('Você não tem permissão para acessar esta página :(')
		window.location.href = '../login.html'
	}
})

const btnSair = document.getElementById('btnSair')
	btnSair.addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../login.html'
})
