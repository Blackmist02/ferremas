document.addEventListener('DOMContentLoaded', function () {
    const headerDiv = document.getElementById('header');
    const footerDiv = document.getElementById('footer');

    if (headerDiv) {
        fetch('partials/header.html')
            .then(response => response.text())
            .then(data => {
                headerDiv.innerHTML = data;
                setTimeout(() => {
                    configurarHeader();
                }, 100);
            })
            .catch(error => console.error('❌ Error cargando header:', error));
    }

    if (footerDiv) {
        fetch('partials/footer.html')
            .then(response => response.text())
            .then(data => {
                footerDiv.innerHTML = data;
            })
            .catch(error => console.error('❌ Error cargando footer:', error));
    }
});

async function configurarHeader() {
    console.log('⚙️ Configurando header...');

    try {
        const res = await fetch('/api/usuarios/auth/user');
        if (!res.ok) throw new Error('Usuario no autenticado');

        const usuario = await res.json();
        console.log(`✅ Usuario activo: ${usuario.nombre} | Rol: ${usuario.rol}`);

        mostrarUsuarioEnHeader(usuario);
        mostrarLinksPorRol(usuario.rol);
    } catch (error) {
        console.log('ℹ️ No hay usuario autenticado');
    }

    configurarEventos();
    actualizarContadorCarrito();
}

function mostrarUsuarioEnHeader(usuario) {
    const userInfo = document.getElementById('user-info');
    const welcomeMessage = document.getElementById('welcome-message');
    const authLinks = document.getElementById('auth-links');

    if (userInfo && welcomeMessage && authLinks) {
        welcomeMessage.textContent = `Bienvenido, ${usuario.nombre}`;
        userInfo.classList.remove('hidden');
        userInfo.classList.add('flex');
        authLinks.classList.add('hidden');
    }

    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileWelcomeMessage = document.getElementById('mobile-welcome-message');
    const mobileAuthLinks = document.getElementById('mobile-auth-links');

    if (mobileUserInfo && mobileWelcomeMessage && mobileAuthLinks) {
        mobileWelcomeMessage.textContent = `Bienvenido, ${usuario.nombre}`;
        mobileUserInfo.classList.remove('hidden');
        mobileAuthLinks.classList.add('hidden');
    }
}

function mostrarLinksPorRol(rol) {
    if (rol === 'ROLE_ADMIN') {
        const adminLink = document.getElementById('admin-links');
        const mobileAdminLink = document.getElementById('mobile-admin-links');
        if (adminLink) adminLink.classList.remove('hidden');
        if (mobileAdminLink) mobileAdminLink.classList.remove('hidden');
    } else {
        const userLink = document.getElementById('user-links');
        const mobileUserLink = document.getElementById('mobile-user-links');
        if (userLink) userLink.classList.remove('hidden');
        if (mobileUserLink) mobileUserLink.classList.remove('hidden');
    }
}

function configurarEventos() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', cerrarSesion);

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', cerrarSesion);

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const contadorDesktop = document.getElementById('contador-carrito');
    if (contadorDesktop) contadorDesktop.textContent = totalItems;

    const contadorMobile = document.getElementById('mobile-cart-count');
    if (contadorMobile) contadorMobile.textContent = totalItems;
}

window.cerrarSesion = async function () {
    try {
        await fetch('/api/usuarios/logout', { method: 'POST' });
    } catch (error) {
        console.warn('⚠️ Error al cerrar sesión en el servidor:', error);
    }

    localStorage.removeItem('carrito');
    window.location.href = 'index.html';
};

window.actualizarHeader = function () {
    console.log('🔄 Actualizando header desde login...');
    setTimeout(() => {
        configurarHeader();
    }, 100);
};
