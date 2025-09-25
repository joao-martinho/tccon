document.addEventListener('DOMContentLoaded', async () => {
    const tipo = localStorage.getItem('tipo');
    if (tipo !== 'professor') {
        alert('Você não tem permissão para acessar esta página :(');
        window.location.href = '../../login.html';
        return;
    }

    document.getElementById('btnSair')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    const textEmailAluno = document.getElementById('textEmailAluno');
    const textTelefoneAluno = document.getElementById('textTelefoneAluno');
    const textCurso = document.getElementById('textCurso');
    const textTitulo = document.getElementById('textTitulo');
    const textResumo = document.getElementById('textResumo');
    const textCoorientador = document.getElementById('textCoorientador');
    const textPerfilCoorientador = document.getElementById('textPerfilCoorientador');
    const textData = document.getElementById('textData');
    const textStatus = document.getElementById('textStatus');

    const btnAprovar = document.getElementById('btnAprovar');
    const btnRejeitar = document.getElementById('btnRejeitar');

    let termo = null;

    async function carregarTermo() {
        try {
            const orientandoStr = localStorage.getItem('orientando');
            if (!orientandoStr) throw new Error('Email do aluno não encontrado no localStorage.');

            const emailAluno = orientandoStr.includes('{') ? JSON.parse(orientandoStr).email : orientandoStr;
            if (!emailAluno) throw new Error('Email do aluno inválido.');

            const res = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
            if (!res.ok) {
                if (res.status === 404) {
                    preencherCampos(null);
                    return;
                }
                throw new Error('Falha ao buscar o termo.');
            }

            termo = await res.json();
            preencherCampos(termo);
        } catch (error) {
            console.error('Erro ao carregar o termo:', error);
            preencherCampos(null);
        }
    }

    function calcularStatus(termo) {
        const statusOrientador = termo.statusOrientador;
        const statusCoorientador = termo.emailCoorientador ? termo.statusCoorientador : null;

        if (!termo.emailCoorientador) return statusOrientador || 'Pendente';
        if (statusOrientador?.toLowerCase() === 'rejeitado' || statusCoorientador?.toLowerCase() === 'rejeitado') return 'Rejeitado';
        if (statusOrientador?.toLowerCase() === 'aprovado' && statusCoorientador?.toLowerCase() === 'aprovado') return 'Aprovado';
        return 'Pendente';
    }

    function formatarData(dataString) {
        const date = new Date(dataString);
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    }

    function preencherCampos(t) {
        if (!t) {
            textEmailAluno.textContent = '—';
            textTelefoneAluno.textContent = '—';
            textCurso.textContent = '—';
            textTitulo.textContent = '—';
            textResumo.textContent = '—';
            textCoorientador.textContent = '—';
            textPerfilCoorientador.textContent = '—';
            textData.textContent = '—';
            textStatus.textContent = 'Nenhum termo pendente';
            btnAprovar.disabled = true;
            btnRejeitar.disabled = true;
            return;
        }

        textEmailAluno.textContent = t.emailAluno || '—';
        textTelefoneAluno.textContent = t.telefoneAluno || '—';
        textCurso.textContent = t.cursoAluno || '—';
        textTitulo.textContent = t.titulo || '—';
        textResumo.textContent = t.resumo || '—';
        textCoorientador.textContent = t.emailCoorientador || '—';
        textPerfilCoorientador.textContent = t.perfilCoorientador || '—';
        textData.textContent = t.criadoEm ? formatarData(t.criadoEm) : '—';
        
        const status = calcularStatus(t);
        let badgeClass = '';

        switch (status.toLowerCase()) {
            case 'aprovado':
                badgeClass = 'bg-success';
                break;
            case 'rejeitado':
                badgeClass = 'bg-danger';
                break;
            default:
                badgeClass = 'bg-warning text-dark';
        }

        const statusCapitalizado = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        textStatus.innerHTML = `<span class="badge ${badgeClass}">${statusCapitalizado}</span>`;

        const statusLower = textStatus.textContent.toLowerCase();
        if (['aprovado', 'rejeitado'].includes(statusLower)) {
            btnAprovar.disabled = true;
            btnRejeitar.disabled = true;
        } else {
            btnAprovar.disabled = false;
            btnRejeitar.disabled = false;
            btnAprovar.onclick = () => atualizarStatus('Aprovado');
            btnRejeitar.onclick = () => atualizarStatus('Rejeitado');
        }
    }

    async function atualizarStatus(status) {
        try {
            const email = localStorage.getItem('email');
            if (!termo) throw new Error('Nenhum termo carregado.');

            const url = `/termos/${encodeURIComponent(termo.id)}/${encodeURIComponent(email)}`;
            const body = {};

            if (email === termo.emailOrientador) body.statusOrientador = status;
            else if (email === termo.emailCoorientador) body.statusCoorientador = status;
            else throw new Error('Usuário não autorizado.');

            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Falha ao atualizar status.');

            await carregarTermo();
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    }

    await carregarTermo();
});
