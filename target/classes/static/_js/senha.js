const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const senhaInput = document.getElementById('senha');
const confirmaInput = document.getElementById('confirmaSenha');
const codigoVerInput = document.getElementById('codigoVer');
const btnFinalizar = document.getElementById('btnFinalizar');
const btnEnviarcodigoVer = document.getElementById('btnEnviarCodigoVer');

function validarCampos() {
    const camposPreenchidos = emailInput.value.trim() !== '' && codigoVerInput.value.trim() !== '';
    const senhasCoincidem = senhaInput.value === confirmaInput.value && senhaInput.value !== '';
    btnFinalizar.disabled = !(camposPreenchidos && senhasCoincidem);
}

btnEnviarcodigoVer.addEventListener('click', () => {
    const selecionado = document.querySelector('input[name="tipoUsuario"]:checked')
    const tipo = document.querySelector(`label[for="${selecionado.id}"]`).textContent
    const email = emailInput.value.trim();

    if (email === '') {
        mostrarMensagem('Digite o seu email antes de solicitar o código.');
        return;
    }

    const criadoEm = new Date().toISOString();

    fetch('/emails/codigo-ver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            destinatario: email,
            tipo: tipo,
            criadoEm: criadoEm
        })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (!ok) {
            mostrarMensagem(text || 'Erro ao enviar o código de verificação.');
            return;
        }
        mostrarMensagem(text || `O código de verificação foi enviado para ${email}.`, 'success');
        codigoVerInput.focus();
    })
    .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao enviar o código de verificação.');
    });
});

document.getElementById('formPrimeiroAcesso').addEventListener('submit', function(e) {
    e.preventDefault();
    const selecionado = document.querySelector('input[name="tipoUsuario"]:checked')
    const tipo = document.querySelector(`label[for="${selecionado.id}"]`).textContent
    const email = emailInput.value.trim();
    const codigoDigitado = codigoVerInput.value.trim();

    if (senhaInput.value !== confirmaInput.value) {
        mostrarMensagem('As senhas não coincidem.');
        return;
    }

    fetch('/emails/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tipo, codigoDigitado })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (!ok) {
            mostrarMensagem(text || 'Código inválido!');
            return;
        }

        const dadosAtualizados = { telefone: telefoneInput.value, senha: senhaInput.value };
        const endpoint = tipo === 'Professor' ? `/professores/${email}` : `/alunos/${email}`;

        return fetch(endpoint, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });
    })
    .then(res => {
        if (!res) return;
        if (!res.ok) throw new Error('Erro ao criar a senha. Verifique se o email está correto.');
        mostrarMensagem('Senha alterada com sucesso!', 'success');
        emailInput.value = '';
        telefoneInput.value = '';
        senhaInput.value = '';
        confirmaInput.value = '';
        codigoVerInput.value = '';
    })
    .catch(err => {
        console.error(err);
        mostrarMensagem(err.message);
    });
});

btnFinalizar.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const codigoDigitado = codigoVerInput.value.trim();

    if (email === '' || codigoDigitado === '') {
        mostrarMensagem('Preencha o email e o código de verificação.');
        return;
    }

    fetch('/emails/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigoDigitado })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (!ok) {
            mostrarMensagem(text || 'Erro ao verificar o código.');
            return;
        }
        mostrarMensagem('Código verificado com sucesso.', 'success');
    })
    .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao verificar o código: ' + err.message);
    });
});

function mostrarMensagem(texto, tipo = 'danger') {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
}
