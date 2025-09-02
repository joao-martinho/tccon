document.addEventListener('DOMContentLoaded', function () {

    const tabela = document.getElementById('tabelaRelatorios').getElementsByTagName('tbody')[0];
    const formulario = document.getElementById('formularioRelatorios');

    function carregarRelatorios() {
        fetch('/relatorios')
        .then(response => response.json())
        .then(data => {
            tabela.innerHTML = '';

            data.forEach(relatorio => {
                const rowId = `desc-${relatorio.id}`;

                // linha principal
                const fileira = tabela.insertRow();
                fileira.innerHTML = `
                    <td>${relatorio.titulo}</td>
                    <td>${new Date(relatorio.dataDeInicio).toLocaleDateString('pt-BR')}</td>
                    <td>${new Date(relatorio.dataDeFim).toLocaleDateString('pt-BR')}</td>
                    <td>${relatorio.horasTrabalhadas}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" type="button"
                            data-bs-toggle="collapse" data-bs-target="#${rowId}"
                            aria-expanded="false" aria-controls="${rowId}">
                            Abrir
                        </button>
                    </td>
                `;

                // linha com a descrição
                const descRow = tabela.insertRow();
                const descCell = descRow.insertCell();
                descCell.colSpan = 5;
                descCell.innerHTML = `
                    <div class="collapse mt-2" id="${rowId}">
                        <div class="card card-body">
                            ${relatorio.descricao}
                        </div>
                    </div>
                `;
            });
        })
        .catch(erro => console.error('Erro ao carregar relatórios: ', erro));
    }

    carregarRelatorios();

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dados = {
            titulo: formulario.querySelector('#titulo').value,
            dataDeInicio: formulario.querySelector('#dataDeInicio').value,
            dataDeFim: formulario.querySelector('#dataDeFim').value,
            horasTrabalhadas: formulario.querySelector('#horasTrabalhadas').value,
            descricao: formulario.querySelector('#descricao').value
        };

        fetch('/relatorios', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dados)
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao registrar relatório');
            return res.json();
        })
        .then(res => {
            console.log('Relatório salvo:', res);
            carregarRelatorios();
            formulario.reset();
        })
        .catch(err => console.error(err));
    });

});
