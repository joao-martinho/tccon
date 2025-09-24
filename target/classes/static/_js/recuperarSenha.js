document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmaInput = document.getElementById('confirmaSenha');
    const codigoVerInput = document.getElementById('codigoVer');
    const btnFinalizar = document.getElementById('btnFinalizar');
    const btnEnviarCodigoVer = document.getElementById('btnEnviarCodigoVer');
    const formPrimeiroAcesso = document.getElementById('formPrimeiroAcesso');

    function mostrarMensagem(texto, tipo = 'danger') {
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
            </div>
        `;
    }

    function validarCampos() {
        const camposPreenchidos = emailInput.value.trim() !== '' && codigoVerInput.value.trim() !== '';
        const senhasCoincidem = senhaInput.value === confirmaInput.value && senhaInput.value !== '';
        btnFinalizar.disabled = !(camposPreenchidos && senhasCoincidem);
    }

    btnEnviarCodigoVer.addEventListener('click', async () => {
        const selecionado = document.querySelector('input[name="tipoUsuario"]:checked');
        if (!selecionado) {
            mostrarMensagem('Selecione um tipo de usuário.');
            return;
        }

        const tipo = document.querySelector(`label[for="${selecionado.id}"]`).textContent;
        const email = emailInput.value.trim();
        if (!email) {
            mostrarMensagem('Digite o seu email antes de solicitar o código.');
            return;
        }

        try {
            const res = await fetch('/emails/codigo-ver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destinatario: email, tipo, criadoEm: new Date().toISOString() })
            });

            const texto = await res.text();
            if (!res.ok) {
                mostrarMensagem(texto || 'Houve um erro. Verifique suas credenciais e tente novamente.');
                return;
            }

            mostrarMensagem(texto || `O código de verificação foi enviado para ${email}.`, 'success');
            codigoVerInput.focus();
        } catch (err) {
            console.error(err);
            mostrarMensagem('Houve um erro. Verifique suas credenciais e tente novamente.');
        }
    });

    formPrimeiroAcesso.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selecionado = document.querySelector('input[name="tipoUsuario"]:checked');
        if (!selecionado) {
            mostrarMensagem('Selecione um tipo de usuário.');
            return;
        }

        const tipo = document.querySelector(`label[for="${selecionado.id}"]`).textContent;
        const email = emailInput.value.trim();
        const codigoDigitado = codigoVerInput.value.trim();

        if (!email || !codigoDigitado) {
            mostrarMensagem('Preencha o email e o código de verificação.');
            return;
        }

        if (senhaInput.value !== confirmaInput.value) {
            mostrarMensagem('As senhas não coincidem.');
            return;
        }

        try {
            const resVerificacao = await fetch('/emails/verificar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, tipo, codigoDigitado })
            });

            const textoVer = await resVerificacao.text();
            if (!resVerificacao.ok) {
                mostrarMensagem(textoVer || 'Código inválido.');
                return;
            }

            const dadosAtualizados = { senha: senhaInput.value };
            const endpoint = tipo === 'Professor' ? `/professores/${email}` : `/alunos/${email}`;

            const resPatch = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados)
            });

            if (!resPatch.ok) throw new Error('Houve um erro. Verifique suas credenciais e tente novamente.');

            mostrarMensagem('Senha alterada com sucesso!', 'success');

            emailInput.value = '';
            senhaInput.value = '';
            confirmaInput.value = '';
            codigoVerInput.value = '';
            btnFinalizar.disabled = true;
        } catch (err) {
            console.error(err);
            mostrarMensagem(err.message);
        }
    });

    btnFinalizar.addEventListener('click', (e) => {
        e.preventDefault();
        formPrimeiroAcesso.requestSubmit();
    });

    [emailInput, senhaInput, confirmaInput, codigoVerInput].forEach(input =>
        input.addEventListener('input', validarCampos)
    );

    validarCampos();
});
