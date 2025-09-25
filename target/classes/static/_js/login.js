document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault();

    let email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    async function tentarLogin(emailTentativa) {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailTentativa, senha })
        });

        if (!response.ok) {
            throw new Error('Falha no login');
        }

        return response.json();
    }

    try {
        let data;

        try {
            // Primeira tentativa com o email original
            data = await tentarLogin(email);
        } catch (err) {
            // Se não tiver '@', tenta com @furb.br
            if (!email.includes('@')) {
                try {
                    email = `${email}@furb.br`;
                    data = await tentarLogin(email);
                } catch {
                    throw err; // Se ainda assim falhar, lança o erro original para cair no catch externo
                }
            } else {
                throw err;
            }
        }

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
            throw new Error('Tipo de usuário não reconhecido');
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
