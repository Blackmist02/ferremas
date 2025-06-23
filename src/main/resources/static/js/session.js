// Sistema de gestión de sesiones simplificado
class SessionManager {
    static obtenerUsuarioActivo() {
        try {
            const usuarioActivo = localStorage.getItem('usuarioActivo');
            return usuarioActivo ? JSON.parse(usuarioActivo) : null;
        } catch (error) {
            console.error('Error al obtener usuario activo:', error);
            localStorage.removeItem('usuarioActivo');
            return null;
        }
    }

    static guardarSesion(usuario) {
        try {
            localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
            
            // Notificar al header que se actualizó la sesión
            if (window.onUsuarioLogueado) {
                window.onUsuarioLogueado();
            }
            
            return true;
        } catch (error) {
            console.error('Error al guardar sesión:', error);
            return false;
        }
    }

    static cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        
        // Actualizar header si está disponible
        if (window.actualizarHeader) {
            window.actualizarHeader();
        }
        
        return true;
    }

    static estaLogueado() {
        return this.obtenerUsuarioActivo() !== null;
    }
}

// Hacer SessionManager disponible globalmente
window.SessionManager = SessionManager;

// Inicializar verificación de sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Session.js cargado, verificando usuario...');
    const usuario = SessionManager.obtenerUsuarioActivo();
    
    if (usuario) {
        console.log('Usuario encontrado en session.js:', usuario.nombre);
        // Actualizar header si existe
        if (window.actualizarHeader) {
            window.actualizarHeader();
        }
    } else {
        console.log('No hay usuario logueado');
    }
});

// Funciones globales de compatibilidad
window.cerrarSesion = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        SessionManager.cerrarSesion();
        alert('Sesión cerrada exitosamente');
        
        // Redirigir si no estás en la página principal
        if (window.location.pathname !== '/index.html' && 
            window.location.pathname !== '/' && 
            !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }
};

window.verificarSesion = function() {
    const usuario = SessionManager.obtenerUsuarioActivo();
    
    if (usuario) {
        mostrarUsuarioLogueado(usuario);
    } else {
        mostrarLinksAuth();
    }
};