document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    fetch('/api/productos/producto')
        .then(res => res.json())
        .then(productos => {
            if (!Array.isArray(productos) || productos.length === 0) {
                document.getElementById('product-list').innerHTML = '<p class="text-red-600">No hay productos disponibles.</p>';
                return;
            }
            iniciarPaginacion(productos, 12);
        })
        .catch(err => {
            document.getElementById('product-list').innerHTML = '<p class="text-red-600">Error al cargar los productos.</p>';
            console.error(err);
        });
});

function iniciarPaginacion(productos, porPagina) {
    let paginaActual = 1;
    const totalPaginas = Math.ceil(productos.length / porPagina);

    function mostrarPagina(pagina) {
        paginaActual = pagina;
        const inicio = (pagina - 1) * porPagina;
        const fin = inicio + porPagina;
        const productosPagina = productos.slice(inicio, fin);

        const lista = document.getElementById('product-list');
        lista.innerHTML = '';
        productosPagina.forEach(producto => {
            let precioReciente = null;
            if (producto.precios && producto.precios.length > 0) {
                precioReciente = producto.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b));
            }
            lista.innerHTML += `
                <div class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                    <img src="https://placehold.co/200x150/8B5CF6/FFFFFF?text=${encodeURIComponent(producto.nombre)}" alt="${producto.nombre}" class="mb-3 rounded w-full h-32 object-contain">
                    <h3 class="text-lg font-semibold mb-1">${producto.nombre}</h3>
                    <p class="text-sm text-gray-600 mb-1"><strong>Marca:</strong> ${producto.marca}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Modelo:</strong> ${producto.modelo}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Stock:</strong> ${producto.Stock}</p>
                    <p class="text-purple-700 font-bold text-lg mb-2">
                        $${precioReciente ? precioReciente.valor : 'No disponible'}
                    </p>
                    <a href="productoInd.html?producto=${producto.id}" class="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded transition">Ver detalle</a>
                    <button onclick="agregarAlCarrito(${producto.id})" class="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded transition">Agregar al carrito</button>
                </div>
            `;
        });

        renderizarPaginacion();
    }

    function renderizarPaginacion() {
        const pag = document.getElementById('pagination');
        pag.innerHTML = '';

        // Botón anterior
        pag.innerHTML += `<button ${paginaActual === 1 ? 'disabled' : ''} class="px-3 py-1 rounded ${paginaActual === 1 ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-800'}" onclick="window.cambiarPagina(${paginaActual - 1})">Anterior</button>`;

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            pag.innerHTML += `<button class="px-3 py-1 rounded mx-1 ${i === paginaActual ? 'bg-purple-800 text-white' : 'bg-purple-200 text-purple-800 hover:bg-purple-400'}" onclick="window.cambiarPagina(${i})">${i}</button>`;
        }

        // Botón siguiente
        pag.innerHTML += `<button ${paginaActual === totalPaginas ? 'disabled' : ''} class="px-3 py-1 rounded ${paginaActual === totalPaginas ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-800'}" onclick="window.cambiarPagina(${paginaActual + 1})">Siguiente</button>`;
    }

    // Exponer función global para los botones
    window.cambiarPagina = function(nuevaPagina) {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            mostrarPagina(nuevaPagina);
        }
    };

    mostrarPagina(1);
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