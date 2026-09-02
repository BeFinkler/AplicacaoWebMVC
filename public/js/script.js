document.querySelectorAll('[data-confirm]').forEach((button) => {
    button.addEventListener('click', (event) => {
        if (!window.confirm(button.dataset.confirm)) event.preventDefault();
    });
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
});
