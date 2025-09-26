document.addEventListener('DOMContentLoaded', async () => {
    const tipo = localStorage.getItem('tipo');
    if (tipo !== 'aluno') {
        alert('Você não tem permissão para acessar esta página :(');
        window.location.href = '../login.html';
        return;
    }

    const btnSair = document.getElementById('btnSair');
    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });

    const badgeMensagens = document.getElementById('badge-mensagens');
    badgeMensagens.style.display = 'none';

    const email = localStorage.getItem('email');
    if (!email) {
        console.error('Email do usuário não encontrado no localStorage!');
        return;
    }

    async function atualizarBadgeMensagens() {
        try {
            const res = await fetch(`/notificacoes/${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(`Falha ao carregar notificações. Status: ${res.status}`);

            const dados = await res.json();
            const mensagens = Array.isArray(dados) ? dados : [dados];
            const naoLidas = mensagens.filter(msg => !msg.lida).length;

            if (naoLidas > 0) {
                badgeMensagens.textContent = naoLidas;
                badgeMensagens.style.display = 'inline-block';
            } else {
                badgeMensagens.style.display = 'none';
            }
        } catch (err) {
            console.error('Erro ao buscar mensagens:', err);
            badgeMensagens.style.display = 'none';
        }
    }

    await atualizarBadgeMensagens();

    try {
        const resAluno = await fetch(`/alunos/${encodeURIComponent(email)}`);
        if (!resAluno.ok) throw new Error('Falha ao carregar dados do aluno.');

        const aluno = await resAluno.json();

        const cardTermo = document.getElementById('card-termo');

        if (aluno.orientadorProvisorio) {
            cardTermo?.classList.remove('grayed-out');
        }

    } catch (error) {
        console.error('Erro ao verificar orientadorProvisorio:', error);
    }
});
