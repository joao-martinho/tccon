document.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipo');
    if (tipo !== 'professor') {
        alert('Você não tem permissão para acessar esta página :(');
        window.location.href = '../login.html';
        return;
    }

    const btnSair = document.getElementById('btnSair');
    btnSair.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });

    const container = document.querySelector('.row.row-cols-1');
    const email = localStorage.getItem('email');

    async function buscarMensagens() {
        console.log('buscando mensagens para', email);
        try {
            const endpoint = `/mensagens/${encodeURIComponent(email)}`;
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Falha ao carregar mensagens.');
            const mensagens = await res.json();
            console.log('mensagens recebidas:', mensagens);
            renderizarMensagens(mensagens);
        } catch (err) {
            console.error(err);
            container.innerHTML = `<div class="col"><div class="alert alert-danger">Erro ao carregar mensagens.</div></div>`;
        }
    }

    function renderizarMensagens(mensagens) {
        container.innerHTML = '';
        mensagens.forEach(msg => {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = `card shadow-sm ${msg.lida ? 'border-secondary' : 'border-warning'}`;
            card.dataset.lida = msg.lida;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const tituloWrapper = document.createElement('div');
            tituloWrapper.className = 'd-flex justify-content-between align-items-center';

            const titulo = document.createElement('h5');
            titulo.className = 'card-title mb-1';
            titulo.textContent = msg.titulo;

            if (!msg.lida) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-warning text-dark ms-2';
                badge.textContent = 'Não lida';
                titulo.appendChild(badge);

                const btnLida = document.createElement('button');
                btnLida.className = 'btn btn-sm btn-outline-success marcar-lida';
                btnLida.textContent = 'Marcar como lida';
                btnLida.addEventListener('click', () => marcarComoLida(msg.id, card));
                tituloWrapper.appendChild(btnLida);
            }

            tituloWrapper.appendChild(titulo);

            const subtitulo = document.createElement('h6');
            subtitulo.className = 'card-subtitle mb-2 text-muted';
            subtitulo.textContent = `De: ${msg.emailRemetente} | Para: ${msg.emailDestinatario}`;

            const conteudo = document.createElement('p');
            conteudo.className = 'card-text mt-3';
            conteudo.textContent = msg.conteudo;

            cardBody.appendChild(tituloWrapper);
            cardBody.appendChild(subtitulo);
            cardBody.appendChild(conteudo);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
        });
    }

    async function marcarComoLida(id, card) {
        try {
            const res = await fetch(`/mensagens/${id}/marcar-lida`, { method: 'PATCH' });
            if (!res.ok) throw new Error('Falha ao marcar mensagem como lida.');
            card.classList.remove('border-warning');
            card.classList.add('border-secondary');
            card.dataset.lida = 'true';
            const badge = card.querySelector('.badge');
            if (badge) badge.remove();
            const btn = card.querySelector('.marcar-lida');
            if (btn) btn.remove();
        } catch (err) {
            console.error(err);
            alert('Não foi possível marcar a mensagem como lida.');
        }
    }

    buscarMensagens();
});
