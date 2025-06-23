document.addEventListener('DOMContentLoaded', function() {
    console.log('Cargando partials...');
    
    // Cargar header
    const headerElement = document.getElementById('header');
    if (headerElement) {
        fetch('partials/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el header');
                }
                return response.text();
            })
            .then(html => {
                headerElement.innerHTML = html;
                console.log('Header cargado correctamente');
                
                // Verificar sesión después de cargar el header
                setTimeout(() => {
                    verificarSesionEnHeader();
                }, 100);
            })
            .catch(error => {
                console.error('Error cargando header:', error);
                headerElement.innerHTML = '<p>Error cargando header</p>';
            });
    }
    
    // Cargar footer
    const footerElement = document.getElementById('footer');
    if (footerElement) {
        fetch('partials/footer.html')
            .then(response => response.text())
            .then(html => {
                footerElement.innerHTML = html;
                console.log('Footer cargado correctamente');
            })
            .catch(error => {
                console.error('Error cargando footer:', error);
            });
    }
});

function verificarSesionEnHeader() {
    console.log('Verificando sesión en header...');
    
    // Obtener usuario del localStorage
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    
    if (usuarioActivo) {
        try {
            const usuario = JSON.parse(usuarioActivo);
            console.log('Usuario encontrado:', usuario.nombre);
            mostrarUsuarioEnHeader(usuario);
        } catch (error) {
            console.error('Error parseando usuario:', error);
            mostrarLinksAuthEnHeader();
        }
    } else {
        console.log('No hay usuario logueado');
        mostrarLinksAuthEnHeader();
    }
}

function mostrarUsuarioEnHeader(usuario) {
    // Para desktop
    const desktopAuth = document.getElementById('desktop-auth');
    if (desktopAuth) {
        desktopAuth.innerHTML = `
            <span class="text-gray-700">Bienvenido, <strong>${usuario.nombre}</strong></span>
            <button onclick="cerrarSesion()" class="text-red-600 hover:text-red-800 ml-4">Cerrar Sesión</button>
        `;
        console.log('Usuario mostrado en desktop');
    }

    // Para mobile
    const mobileAuth = document.getElementById('mobile-auth');
    if (mobileAuth) {
        mobileAuth.innerHTML = `
            <span class="block px-4 py-2 text-gray-700">Bienvenido, <strong>${usuario.nombre}</strong></span>
            <button onclick="cerrarSesion()" class="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left">Cerrar Sesión</button>
        `;
        console.log('Usuario mostrado en mobile');
    }
}

function mostrarLinksAuthEnHeader() {
    // Para desktop
    const desktopAuth = document.getElementById('desktop-auth');
    if (desktopAuth) {
        desktopAuth.innerHTML = `
            <a href="login.html" class="text-purple-600 hover:text-purple-800">Iniciar Sesión</a>
            <span class="text-gray-400">|</span>
            <a href="registro.html" class="text-purple-600 hover:text-purple-800">Registro</a>
        `;
    }

    // Para mobile
    const mobileAuth = document.getElementById('mobile-auth');
    if (mobileAuth) {
        mobileAuth.innerHTML = `
            <a href="login.html" class="block px-4 py-2 text-purple-600 hover:bg-gray-100">Iniciar Sesión</a>
            <a href="registro.html" class="block px-4 py-2 text-purple-600 hover:bg-gray-100">Registro</a>
        `;
    }
}

// Función global para cerrar sesión
window.cerrarSesion = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('carrito'); // Opcional: limpiar carrito
        alert('Sesión cerrada exitosamente');
        window.location.href = 'index.html';
    }
};