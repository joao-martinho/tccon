function preencherTabela() {
  listaDeTermos.innerHTML = ''
  if (!termos.length) {
    listaDeTermos.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum termo pendente :)</td></tr>'
    return
  }

  termos.forEach((termo, index) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${termo.emailDoAluno}</td>
      <td>${termo.curso || 'TODO'}</td>
      <td>${termo.titulo}</td>
      <td>${termo.dataEnvio ? new Date(termo.dataEnvio).toLocaleDateString() : 'TODO'}</td>
      <td>${criarBadgeStatus(termo.status || 'Pendente')}</td>
      <td><button class="btn btn-primary btn-sm btn-ver" data-index="${index}">Ver</button></td>
    `
    listaDeTermos.appendChild(tr)
  })

  document.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => {
      const termo = termos[btn.dataset.index]
      abrirModal(termo)
    })
  })
}
