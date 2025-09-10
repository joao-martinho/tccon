document.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipo')
    if (tipo !== 'professor') {
        alert('Você não tem permissão para acessar esta página :(')
        window.location.href = '../login.html'
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    const listaTermos = document.getElementById('listaTermos')
    const modalTermoEl = document.getElementById('modalTermo')
    const modalTermo = new bootstrap.Modal(modalTermoEl)

    const modalEmailAluno = document.getElementById('modalEmailAluno')
    const modalNomeAluno = document.getElementById('modalNomeAluno')
    const modalCurso = document.getElementById('modalCurso')
    const modalTitulo = document.getElementById('modalTitulo')
    const modalResumo = document.getElementById('modalResumo')
    const modalOrientador = document.getElementById('modalOrientador')
    const modalCoorientador = document.getElementById('modalCoorientador')
    const modalPerfilCoorientador = document.getElementById('modalPerfilCoorientador')
    const modalData = document.getElementById('modalData')
    const modalStatusValor = document.getElementById('modalStatusValor')

    let termos = []

    async function carregarTermos() {
        try {
            const email = localStorage.getItem('email')
            const res = await fetch(`/termos/professor/${encodeURIComponent(email)}`)
            if (!res.ok) throw new Error('Falha ao buscar os termos.')
            termos = await res.json()

            preencherTabela()
        } catch (error) {
            console.error('Erro ao carregar os termos:', error)
            listaTermos.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Não foi possível carregar os termos.</td></tr>'
        }
    }

    function calcularStatus(termo) {
        const statusOrientador = termo.statusOrientador
        const statusCoorientador = termo.emailCoorientador ? termo.statusCoorientador : null

        if (!termo.emailCoorientador) {
            return statusOrientador || 'Pendente'
        }
        if (!statusOrientador || !statusCoorientador) {
            return 'Pendente'
        }
        if (statusOrientador.toLowerCase() === 'rejeitado' || statusCoorientador.toLowerCase() === 'rejeitado') {
            return 'Rejeitado'
        }
        if (statusOrientador.toLowerCase() === 'aprovado' && statusCoorientador.toLowerCase() === 'aprovado') {
            return 'Aprovado'
        }
        return 'Pendente'
    }

    function preencherTabela() {
        listaTermos.innerHTML = ''
        if (!termos.length) {
            listaTermos.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum termo pendente :)</td></tr>'
            return
        }

        termos.forEach((termo, index) => {
            const tr = document.createElement('tr')
            const status = calcularStatus(termo)

            tr.innerHTML = `
                <td>${termo.nomeAluno}</td>
                <td>${termo.emailAluno}</td>
                <td>${termo.cursoAluno}</td>
                <td>${termo.titulo}</td>
                <td>${termo.criadoEm ? formatarData(termo.criadoEm) : '—'}</td>
                <td>${criarBadgeStatus(status)}</td>
                <td>
                    <button 
                        class="btn btn-primary btn-sm btn-ver" 
                        data-index="${index}" 
                        data-id="${termo.id}"
                    >
                        Ver
                    </button>
                </td>
            `

            listaTermos.appendChild(tr)
        })

        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', () => {
                const termo = termos[btn.dataset.index]
                abrirModal(termo)
            })
        })
    }

    function abrirModal(termo) {
        modalEmailAluno.textContent = termo.emailAluno
        modalNomeAluno.textContent = termo.nomeAluno
        modalCurso.textContent = termo.cursoAluno
        modalTitulo.textContent = termo.titulo
        modalResumo.textContent = termo.resumo
        modalOrientador.textContent = termo.emailOrientador
        modalCoorientador.textContent = termo.emailCoorientador || '—'
        modalPerfilCoorientador.textContent = termo.perfilCoorientador || '—'
        modalData.textContent = termo.criadoEm ? formatarData(termo.criadoEm) : '—'
        modalStatusValor.textContent = calcularStatus(termo)

        document.getElementById('btnAprovar').onclick = () => atualizarStatus(termo.id, 'aprovado')
        document.getElementById('btnRejeitar').onclick = () => atualizarStatus(termo.id, 'rejeitado')

        modalTermo.show()
    }

    async function atualizarStatus(id, status) {
        try {
            const email = localStorage.getItem('email')

            if (email === modalOrientador.textContent.trim()) {
                const res = await fetch(`/termos/${encodeURIComponent(id)}/${encodeURIComponent(email)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ statusOrientador: status })
                })
                if (!res.ok) throw new Error('Falha ao atualizar status')
            } else if (email === modalCoorientador.textContent.trim()) {
                const res = await fetch(`/termos/${encodeURIComponent(id)}/${encodeURIComponent(email)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ statusCoorientador: status })
                })
                if (!res.ok) throw new Error('Falha ao atualizar status')
            }

            await carregarTermos()
            modalTermo.hide()
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
        }
    }

    function criarBadgeStatus(status) {
        switch (status.toLowerCase()) {
            case 'pendente':
                return '<span class="badge bg-warning text-dark">Pendente</span>'
            case 'rejeitado':
                return '<span class="badge bg-danger">Rejeitado</span>'
            case 'aprovado':
                return '<span class="badge bg-success">Aprovado</span>'
            default:
                return `<span class="badge bg-secondary">${status}</span>`
        }
    }

    await carregarTermos()

    function formatarData(dataString) {
        const date = new Date(dataString);
        const pad = (n) => n.toString().padStart(2, '0');

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }
})

