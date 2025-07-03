// session.js — Sin uso de localStorage, completamente con backend

// Obtener usuario desde la sesión del backend
window.obtenerUsuarioActivo = async function() {
  try {
    const res = await fetch('/api/usuarios/session/user'); // ✅ Cambio de endpoint
    if (!res.ok) throw new Error('No autenticado');
    const data = await res.json();
    if (data.success && data.usuario) {
      console.log('✅ Usuario activo:', data.usuario.nombre, '| Rol:', data.usuario.rol);
      return data.usuario;
    } else {
      throw new Error('Respuesta inválida');
    }
  } catch (error) {
    console.log('ℹ️ Usuario no autenticado (normal para páginas públicas)');
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

// Verificación automática al cargar el script (SIN redirigir en páginas públicas)
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔍 Verificando sesión desde backend...');
  const usuario = await obtenerUsuarioActivo();

  if (!usuario) {
    console.log('ℹ️ Usuario no logueado (normal para páginas públicas)');
    // ✅ NO redirigir automáticamente - permitir navegación libre
  } else {
    console.log('✅ Usuario logueado:', usuario.nombre);
  }
});
