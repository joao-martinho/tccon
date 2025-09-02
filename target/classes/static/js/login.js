document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    fetch('/autenticacao/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    .then(response => {
        if (!response.ok) throw new Error('Credenciais inválidas!');
        return response.text();
    })
    .then(data => {
        if (data.startsWith("Aluno")) {
            window.location.href = 'painel-do-aluno.html';
        } 
        else if (data.startsWith("Professor")) {
            window.location.href = 'painel-do-professor.html';
        }
    })
    .catch(error => {
        mostrarMensagem(error.message);
    });
});

function mostrarMensagem(texto, tipo = 'danger') {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
