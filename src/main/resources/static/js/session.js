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
            console.log('✅ Sesión guardada:', usuario);
            return true;
        } catch (error) {
            console.error('Error al guardar sesión:', error);
            return false;
        }
    }

    static cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        console.log('❌ Sesión cerrada');
        return true;
    }

    static estaLogueado() {
        return this.obtenerUsuarioActivo() !== null;
    }
}

// Hacer SessionManager disponible globalmente
window.SessionManager = SessionManager;

// Función global para cerrar sesión
window.cerrarSesion = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        SessionManager.cerrarSesion();
        alert('Sesión cerrada exitosamente');
        window.location.href = 'index.html';
    }
};

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Session.js cargado - verificando usuario...');
    const usuario = SessionManager.obtenerUsuarioActivo();
    
    if (usuario) {
        console.log('✅ Usuario encontrado:', usuario.nombre);
        console.log('📧 Email:', usuario.correo);
        console.log('🔑 Rol:', usuario.rol);
    } else {
        console.log('❌ No hay usuario logueado');
    }
});