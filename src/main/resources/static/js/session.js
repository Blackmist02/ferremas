// session.js — Sin uso de localStorage, completamente con backend

// Obtener usuario desde la sesión del backend
window.obtenerUsuarioActivo = async function() {
  try {
    const res = await fetch('/api/usuarios/auth/user');
    if (!res.ok) throw new Error('No autenticado');
    const usuario = await res.json();
    console.log('✅ Usuario activo:', usuario.nombre, '| Rol:', usuario.rol);
    return usuario;
  } catch (error) {
    console.warn('❌ Usuario no autenticado o sesión expirada');
    return null;
  }
};

// Cerrar sesión vía backend
window.cerrarSesion = async function() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    try {
      const res = await fetch('/api/usuarios/logout', { method: 'POST' });
      if (res.ok) {
        alert('Sesión cerrada correctamente');
        window.location.href = 'index.html';
      } else {
        alert('No se pudo cerrar la sesión');
      }
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  }
};

// Verificación automática al cargar el script (opcional)
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔍 Verificando sesión desde backend...');
  const usuario = await obtenerUsuarioActivo();

  if (!usuario) {
    console.log('🔒 Usuario no logueado. Redirigiendo a login...');
    // Puedes redirigir si estás en una vista privada
    // window.location.href = 'login.html';
  }
});
