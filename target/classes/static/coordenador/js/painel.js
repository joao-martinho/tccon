const btnSair = document.getElementById('btnSair')
	btnSair.addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../login.html'
})
