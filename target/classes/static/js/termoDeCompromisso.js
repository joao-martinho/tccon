const coorientadorCheckbox = document.getElementById('coorientadorCheckbox');
  const coorientadorMenu = document.getElementById('coorientadorMenu');
  coorientadorCheckbox.addEventListener('change', () => {
    if (coorientadorCheckbox.checked) {
      new bootstrap.Collapse(coorientadorMenu, { show: true });
    } else {
      new bootstrap.Collapse(coorientadorMenu, { hide: true });
    }
  });