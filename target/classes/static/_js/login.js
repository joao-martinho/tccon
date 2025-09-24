document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error(); // qualquer falha cai no catch
        }

        const data = await response.json();

        localStorage.clear();
        localStorage.setItem('email', email);

        if (data.tipo === "Aluno") {
            localStorage.setItem("tipo", "aluno");
            window.location.href = '../aluno/painel.html';
        } 
        else if (data.tipo === "Professor") {
            localStorage.setItem("tipo", "professor");

            if (Array.isArray(data.papeis)) {
                data.papeis.forEach(papel => {
                    switch (papel) {
                        case "COORD_TCC1":
                            localStorage.setItem("coordTcc1", "true");
                            break;
                        case "COORD_BCC":
                            localStorage.setItem("coordBcc", "true");
                            break;
                        case "COORD_SIS":
                            localStorage.setItem("coordSis", "true");
                            break;
                    }
                });
            }

            window.location.href = '../professor/painel.html';
        } 
        else if (data.tipo === "Admin") {
            localStorage.setItem("tipo", "admin");
            window.location.href = '../admin/painel.html';
        } 
        else {
            throw new Error();
        }
    } catch (err) {
        mostrarMensagem("Houve um erro. Verifique as suas credenciais e tente novamente.", "danger");
        console.error(err);
    }
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
