document.addEventListener('DOMContentLoaded', async () => { 
    // const tipo = localStorage.getItem('tipo');
    // if (tipo !== 'aluno') {
    //     alert('Você não tem permissão para acessar esta página :(');
    //     window.location.href = '../login.html';
    //     return;
    // }

    const btnSair = document.getElementById('btnSair');
    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });

    const container = document.querySelector('.row.row-cols-1');
    if (!container) {
        console.error('Container de mensagens não encontrado!');
        return;
    }

    const email = localStorage.getItem('email');
    if (!email) {
        console.error('Email do aluno não encontrado no localStorage!');
        container.innerHTML = `<div class="col"><div class="alert alert-danger">Erro ao carregar mensagens.</div></div>`;
        return;
    }

    async function buscarMensagens() {
        console.log('Buscando mensagens para:', email);
        try {
            const res = await fetch(`/mensagens/${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(`Falha ao carregar mensagens. Status: ${res.status}`);

            const dados = await res.json();

            // Se não houver mensagens, renderiza array vazio
            if (!dados || (Array.isArray(dados) && dados.length === 0)) {
                console.log('Nenhuma mensagem encontrada.');
                renderizarMensagens([]);
                return;
            }

            // Garante sempre um array, mesmo que venha um único objeto
            const mensagens = Array.isArray(dados) ? dados : [dados];

            console.log('Mensagens recebidas:', mensagens);
            renderizarMensagens(mensagens);
        } catch (err) {
            console.error('Erro ao buscar mensagens:', err);
            container.innerHTML = `<div class="col"><div class="alert">
                <div class="card shadow-sm border-info text-center p-4">
                    <div class="card-body">
                        <p class="mb-0 text-info">Nenhuma mensagem encontrada.</p>
                    </div>
                </div></div>
            </div>`;
        }
    }

    function renderizarMensagens(mensagens) {
        container.innerHTML = '';

        if (!mensagens || mensagens.length === 0) {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = 'card shadow-sm border-info text-center p-4';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const mensagem = document.createElement('p');
            mensagem.className = 'mb-0 text-info';
            mensagem.textContent = 'Nenhuma mensagem encontrada.';

            cardBody.appendChild(mensagem);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
            return;
        }

        mensagens.forEach(msg => {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = `card shadow-sm ${msg.lida ? 'border-secondary' : 'border-warning'}`;
            card.dataset.lida = msg.lida;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const tituloWrapper = document.createElement('div');
            tituloWrapper.className = 'd-flex justify-content-between align-items-center mb-2';

            const titulo = document.createElement('h5');
            titulo.className = 'card-title mb-0';
            titulo.textContent = msg.titulo;

            if (!msg.lida) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-warning text-dark ms-2';
                badge.textContent = 'Não lida';
                titulo.appendChild(badge);

                const btnLida = document.createElement('button');
                btnLida.className = 'btn btn-sm btn-outline-success marcar-lida ms-2';
                btnLida.textContent = 'Marcar como lida';
                btnLida.addEventListener('click', () => marcarComoLida(msg.id, card));
                tituloWrapper.appendChild(btnLida);
            }

            tituloWrapper.appendChild(titulo);

            const subtitulo = document.createElement('h6');
            subtitulo.className = 'card-subtitle mb-2 text-muted';
            subtitulo.textContent = `De: ${msg.emailRemetente} | Para: ${msg.emailDestinatario}`;

            const conteudo = document.createElement('p');
            conteudo.className = 'card-text mt-2';
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
            const res = await fetch(`/mensagens/${encodeURIComponent(id)}/marcar-lida`, { method: 'PATCH' });
            if (!res.ok) throw new Error(`Falha ao marcar mensagem como lida. Status: ${res.status}`);

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

    await buscarMensagens();
});
