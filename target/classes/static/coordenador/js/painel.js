document.addEventListener('DOMContentLoaded', async () => {
    // const tipo = localStorage.getItem('tipo');
    // if (tipo !== 'coordenador') {
    //     alert('Você não tem permissão para acessar esta página :(');
    //     window.location.href = '../login.html';
    //     return;
    // }

    const btnSair = document.getElementById('btnSair');
    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });
})
