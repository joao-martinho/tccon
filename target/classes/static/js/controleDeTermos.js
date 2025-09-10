document.addEventListener('DOMContentLoaded', () => {
	const tipo = localStorage.getItem('tipo')
	if (tipo !== 'professor') {
		alert('Você não tem permissão para acessar esta página :(')
		window.location.href = 'login.html'
	}
})

document.addEventListener('DOMContentLoaded', async () => {
    const listaDeTermos = document.getElementById('listaDeTermos')
    const modalTermoEl = document.getElementById('modalTermo')
    const modalTermo = new bootstrap.Modal(modalTermoEl)

    const modalAluno = document.getElementById('modalAluno')
    const modalCurso = document.getElementById('modalCurso')
    const modalTitulo = document.getElementById('modalTitulo')
    const modalResumo = document.getElementById('modalResumo')
    const modalOrientador = document.getElementById('modalOrientador')
    const modalCoorientador = document.getElementById('modalCoorientador')
    const modalData = document.getElementById('modalData')

    let termos = []

    async function carregarTermos() {
        try {
            const email = encodeURIComponent(localStorage.getItem('email'))

            const res = await fetch(`/termos/professor/${email}`)
            if (!res.ok) throw new Error('Falha ao buscar os termos.')

            termos = await res.json()
            preencherTabela()
        } catch (error) {
            console.error('Erro ao carregar os termos:', error)
            listaDeTermos.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Não foi possível carregar os termos.</td></tr>'
        }
    }

    function preencherTabela() {
        listaDeTermos.innerHTML = ''
        if (!termos.length) {
            listaDeTermos.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum termo pendente :)</td></tr>'
            return
        }

        termos.forEach((termo, index) => {
            const tr = document.createElement('tr')
            tr.innerHTML = `
            <td>${termo.emailDoAluno}</td>
            <td>${termo.curso || 'TODO'}</td>
            <td>${termo.titulo}</td>
            <td>${termo.dataEnvio ? new Date(termo.dataEnvio).toLocaleDateString() : 'TODO'}</td>
            <td>${termo.status || 'Pendente'}</td>
            <td><button class="btn btn-primary btn-sm btn-ver" data-index="${index}">Ver</button></td>
            `
            listaDeTermos.appendChild(tr)
        })

        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', () => {
                const termo = termos[btn.dataset.index]
                abrirModal(termo)
            })
        })
    }

    function abrirModal(termo) {
        modalAluno.textContent = termo.emailDoAluno
        modalCurso.textContent = termo.curso || 'TODO'
        modalTitulo.textContent = termo.titulo
        modalResumo.textContent = termo.resumo
        modalOrientador.textContent = termo.emailDoOrientador
        modalCoorientador.textContent = termo.emailDoCoorientador || '—'
        modalData.textContent = termo.dataEnvio ? new Date(termo.dataEnvio).toLocaleDateString() : 'TODO'

        document.getElementById('btnAprovar').onclick = () => atualizarStatus(termo.id, 'aprovado')
        document.getElementById('btnRejeitar').onclick = () => atualizarStatus(termo.id, 'rejeitado')

        modalTermo.show()
    }

    async function atualizarStatus(id, status) {
        try {
            const res = await fetch(`/termos/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
            })
            if (!res.ok) throw new Error('Falha ao atualizar status')
            await carregarTermos()
            modalTermo.hide()
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
        }
    }

    await carregarTermos()

    function criarBadgeStatus(status) {
        switch (status.toLowerCase()) {
            case 'pendente':
            return '<span class="badge bg-warning text-dark">Pendente</span>'
            case 'rejeitado':
            return '<span class="badge bg-danger">Rejeitado</span>'
            case 'aprovado':
            return '<span class="badge bg-success">Aprovado</span>'
            default:
            return '<span class="badge bg-secondary">Desconhecido</span>'
        }
    }

    function preencherTabela() {
        listaDeTermos.innerHTML = ''
        if (!termos.length) {
            listaDeTermos.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum termo pendente :)</td></tr>'
            return
        }

        termos.forEach((termo, index) => {
            const tr = document.createElement('tr')
            tr.innerHTML = `
            <td>${termo.emailDoAluno}</td>
            <td>${termo.curso || 'TODO'}</td>
            <td>${termo.titulo}</td>
            <td>${termo.dataEnvio ? new Date(termo.dataEnvio).toLocaleDateString() : 'TODO'}</td>
            <td>${criarBadgeStatus(termo.status || 'Pendente')}</td>
            <td><button class="btn btn-primary btn-sm btn-ver" data-index="${index}">Ver</button></td>
            `
            listaDeTermos.appendChild(tr)
        })

        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', () => {
                const termo = termos[btn.dataset.index]
                abrirModal(termo)
            })
        })
    }

})