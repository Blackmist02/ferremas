document.addEventListener('DOMContentLoaded', function() {
    // Cargar header
    const headerDiv = document.getElementById('header');
    if (headerDiv) {
        fetch('partials/header.html')
            .then(response => response.text())
            .then(data => {
                headerDiv.innerHTML = data;
                
                // Después de cargar el header, configurar todo
                setTimeout(() => {
                    verificarSesionYConfigurar();
                }, 100);
            })
            .catch(error => {
                console.error('Error cargando header:', error);
            });
    }

    // Cargar footer
    const footerDiv = document.getElementById('footer');
    if (footerDiv) {
        fetch('partials/footer.html')
            .then(response => response.text())
            .then(data => {
                footerDiv.innerHTML = data;
            })
            .catch(error => {
                console.error('Error cargando footer:', error);
            });
    }
});

function verificarSesionYConfigurar() {
    console.log('🔧 Configurando header...');
    
    // Verificar sesión
    const usuario = SessionManager ? SessionManager.obtenerUsuarioActivo() : null;
    
    if (usuario) {
        console.log('✅ Mostrando usuario en header:', usuario.nombre);
        mostrarUsuarioEnHeader(usuario);
    } else {
        console.log('❌ Mostrando links de auth');
        mostrarLinksAuth();
    }
    
    // Configurar eventos
    configurarEventos();
    
    // Actualizar contador de carrito
    actualizarContadorCarrito();
}

function mostrarUsuarioEnHeader(usuario) {
    // Desktop
    const userInfo = document.getElementById('user-info');
    const authLinks = document.getElementById('auth-links');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (userInfo && authLinks && welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${usuario.nombre}`;
        userInfo.classList.remove('hidden');
        userInfo.classList.add('flex');
        authLinks.classList.add('hidden');
    }
    
    // Mobile
    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileAuthLinks = document.getElementById('mobile-auth-links');
    const mobileWelcomeMessage = document.getElementById('mobile-welcome-message');
    
    if (mobileUserInfo && mobileAuthLinks && mobileWelcomeMessage) {
        mobileWelcomeMessage.textContent = `Bienvenido, ${usuario.nombre}`;
        mobileUserInfo.classList.remove('hidden');
        mobileAuthLinks.classList.add('hidden');
    }
}

function mostrarLinksAuth() {
    // Desktop
    const userInfo = document.getElementById('user-info');
    const authLinks = document.getElementById('auth-links');
    
    if (userInfo && authLinks) {
        userInfo.classList.add('hidden');
        userInfo.classList.remove('flex');
        authLinks.classList.remove('hidden');
    }
    
    // Mobile
    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileAuthLinks = document.getElementById('mobile-auth-links');
    
    if (mobileUserInfo && mobileAuthLinks) {
        mobileUserInfo.classList.add('hidden');
        mobileAuthLinks.classList.remove('hidden');
    }
}

function configurarEventos() {
    // Logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.cerrarSesion);
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', window.cerrarSesion);
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    const contadorDesktop = document.getElementById('contador-carrito');
    const contadorMovil = document.getElementById('mobile-cart-count');
    
    if (contadorDesktop) {
        contadorDesktop.textContent = totalItems;
    }
    
    if (contadorMovil) {
        contadorMovil.textContent = totalItems;
    }
}

// Función global para actualizar header después del login
window.actualizarHeader = function() {
    console.log('🔄 Actualizando header...');
    setTimeout(() => {
        verificarSesionYConfigurar();
    }, 100);
};

// Función global para actualizar carrito
window.actualizarContadorCarrito = actualizarContadorCarrito;

// Función global para cerrar sesión
window.cerrarSesion = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('carrito'); // Opcional: limpiar carrito
        alert('Sesión cerrada exitosamente');
        window.location.href = 'index.html';
    }
};