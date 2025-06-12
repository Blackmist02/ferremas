document.addEventListener('DOMContentLoaded', () => {
    includePartial('header', 'partials/header.html');
    includePartial('footer', 'partials/footer.html');
});

function includePartial(elementId, url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
            if (elementId === 'footer') {
                // Actualiza el año en el footer si existe el span
                const yearSpan = document.getElementById('currentYear');
                if (yearSpan) yearSpan.textContent = new Date().getFullYear();
            }
        });
}