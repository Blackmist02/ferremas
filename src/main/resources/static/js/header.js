function cerrarSesion() {
  localStorage.removeItem('usuarioActivo');
  location.reload(); // Refrescar para aplicar cambios visuales
}

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));

  const bienvenida = document.getElementById('bienvenida');
  const logoutButton = document.getElementById('logout-button');
  const loginLink = document.getElementById('login-link');
  const registroLink = document.getElementById('registro-link');

  const mobileBienvenida = document.getElementById('mobile-bienvenida');
  const mobileLogoutLink = document.getElementById('mobile-logout-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const mobileRegistroLink = document.getElementById('mobile-registro-link');

  if (usuario) {
    // Versión escritorio
    bienvenida.textContent = `Bienvenido, ${usuario.nombre}`;
    bienvenida.classList.remove('hidden');
    logoutButton.classList.remove('hidden');
    loginLink.classList.add('hidden');
    registroLink.classList.add('hidden');

    // Versión móvil
    mobileBienvenida.textContent = `Bienvenido, ${usuario.nombre}`;
    mobileBienvenida.classList.remove('hidden');
    mobileLogoutLink.classList.remove('hidden');
    mobileLoginLink.classList.add('hidden');
    mobileRegistroLink.classList.add('hidden');
  }
});
