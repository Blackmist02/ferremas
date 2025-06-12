// Mostrar año actual en el footer
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    cargarProductosDestacados();
});

function cargarProductosDestacados() {
    fetch('/api/productos/producto')
        .then(res => res.json())
        .then(productos => {
            console.log("funciona");
            const destacados = document.getElementById('destacados');
            if (!destacados) return;
            destacados.innerHTML = '';
            // Mostrar hasta 3 productos destacados
            productos.slice(0, 3).forEach(producto => {
                destacados.innerHTML += `
                    <div class="bg-gray-50 rounded-lg shadow-lg p-6 flex flex-col items-center">
                        <img src="https://placehold.co/200x150/8B5CF6/FFFFFF?text=${encodeURIComponent(producto.nombre)}" alt="${producto.nombre}" class="mb-4 rounded-md w-full h-32 object-contain">
                        <h3 class="text-lg font-semibold mb-2">${producto.nombre}</h3>
                        <p class="text-sm text-gray-600 mb-1"><strong>Marca:</strong> ${producto.marca}</p>
                        <p class="text-sm text-gray-600 mb-1"><strong>Modelo:</strong> ${producto.modelo}</p>
                        <p class="text-sm text-gray-600 mb-1"><strong>Stock:</strong> ${producto.Stock}</p>
                        <p class="text-purple-700 font-bold text-lg mb-2">
                            $${producto.precios && producto.precios.length > 0 ? producto.precios[0].valor : 'No disponible'}
                        </p>
                        <a href="productoInd.html?producto=${producto.id}" class="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded transition">Ver detalle</a>
                    </div>
                `;
            });
        })
        .catch(err => {
            const destacados = document.getElementById('destacados');
            if (destacados) destacados.innerHTML = '<p class="text-red-600">No se pudieron cargar los productos.</p>';
            console.error('Error al cargar productos:', err);
        });
        
}


function agregarAlCarrito(productoId) {
    // Obtener carrito actual o crear uno nuevo
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    // Buscar si ya está en el carrito
    const index = carrito.findIndex(item => item.id === productoId);
    if (index !== -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push({ id: productoId, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert('Producto agregado al carrito');
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCount = document.getElementById('cart-count');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    if (cartCount) cartCount.textContent = total;
    if (mobileCartCount) mobileCartCount.textContent = total;
}

// Actualizar contador al cargar la página
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);