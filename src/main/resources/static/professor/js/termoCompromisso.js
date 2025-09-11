document.addEventListener('DOMContentLoaded', async () => {
    const tipo = localStorage.getItem('tipo')
    if (tipo !== 'professor') {
        alert('Você não tem permissão para acessar esta página :(')
        window.location.href = '../login.html'
        return
    }

    const listaTermos = document.getElementById('listaTermos')
    const modalTermoEl = document.getElementById('modalTermo')
    if (!listaTermos || !modalTermoEl) return

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
            if (!email) throw new Error('Email do professor não encontrado.')

            const res = await fetch(`/termos/professor/${encodeURIComponent(email)}`)
            if (!res.ok) throw new Error('Falha ao buscar os termos.')

            termos = await res.json()
            preencherTabela()
        } catch (error) {
            console.error('Erro ao carregar os termos:', error)
            if (listaTermos) {
                listaTermos.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Não foi possível carregar os termos.</td></tr>'
            }
        }
    }

    function calcularStatus(termo) {
        const statusOrientador = termo.statusOrientador
        const statusCoorientador = termo.emailCoorientador ? termo.statusCoorientador : null

        if (!termo.emailCoorientador) return statusOrientador || 'Pendente'
        if (!statusOrientador || !statusCoorientador) return 'Pendente'
        if (statusOrientador.toLowerCase() === 'rejeitado' || statusCoorientador.toLowerCase() === 'rejeitado') return 'Rejeitado'
        if (statusOrientador.toLowerCase() === 'aprovado' && statusCoorientador.toLowerCase() === 'aprovado') return 'Aprovado'
        return 'Pendente'
    }

    function criarBadgeStatus(status) {
        switch (status.toLowerCase()) {
            case 'pendente': return '<span class="badge bg-warning text-dark">Pendente</span>'
            case 'rejeitado': return '<span class="badge bg-danger">Rejeitado</span>'
            case 'aprovado': return '<span class="badge bg-success">Aprovado</span>'
            default: return `<span class="badge bg-secondary">${status}</span>`
        }
    }

    function formatarData(dataString) {
        const date = new Date(dataString)
        const pad = n => n.toString().padStart(2, '0')
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
    }

    function preencherTabela() {
        if (!listaTermos) return

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
                    <button class="btn btn-primary btn-sm btn-ver" data-index="${index}">Ver</button>
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

        const btnAprovar = document.getElementById('btnAprovar')
        const btnRejeitar = document.getElementById('btnRejeitar')

        if (btnAprovar) btnAprovar.onclick = () => atualizarStatus(termo.id, 'aprovado')
        if (btnRejeitar) btnRejeitar.onclick = () => atualizarStatus(termo.id, 'rejeitado')

        modalTermo.show()
    }

    async function atualizarStatus(id, status) {
        try {
            const email = localStorage.getItem('email')

            const url = `/termos/${encodeURIComponent(id)}/${encodeURIComponent(email)}`
            const body = {}

            if (email === modalOrientador.textContent.trim()) body.statusOrientador = status
            else if (email === modalCoorientador.textContent.trim()) body.statusCoorientador = status
            else throw new Error('Usuário não autorizado para atualizar este termo.')

            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error('Falha ao atualizar status.')

            await carregarTermos()
            modalTermo.hide()
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
        }
    }

    await carregarTermos()
})
