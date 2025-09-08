async function carregarMensagens(email) {
	const resposta = await fetch(`/mensagens/${email}`)
	if (!resposta.ok) return
	const mensagens = await resposta.json()
	const naoLidas = mensagens.filter(m => !m.lida).length
	const badge = document.querySelector('#badge-mensagens')
	if (badge) badge.textContent = naoLidas
	return mensagens
}

document.addEventListener('DOMContentLoaded', () => {
	const email = localStorage.getItem('emailAluno')
	carregarMensagens(email)
})
