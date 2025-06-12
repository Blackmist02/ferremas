document.addEventListener('DOMContentLoaded', () => {
    // Mostrar año actual en el footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Obtener el ID del producto desde la URL
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('producto');
    if (!productoId) {
        mostrarError('No se ha especificado un producto.');
        return;
    }

    fetch(`/api/productos/producto`)
        .then(res => res.json())
        .then(productos => {
            const producto = productos.find(p => p.id == productoId);
            if (!producto) {
                mostrarError('Producto no encontrado.');
                return;
            }
            mostrarProducto(producto);
        })
        .catch(err => {
            mostrarError('Error al cargar el producto.');
            console.error(err);
        });
});

function mostrarProducto(producto) {
    const cont = document.getElementById('producto-detalle');
    let precioReciente = null;
    if (producto.precios && producto.precios.length > 0) {
        precioReciente = producto.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b));
    }
    cont.innerHTML = `
        <div class="flex flex-col md:flex-row items-center gap-8">
            <img src="https://placehold.co/300x200/8B5CF6/FFFFFF?text=${encodeURIComponent(producto.nombre)}" alt="${producto.nombre}" class="rounded-md w-full md:w-1/2 object-contain mb-4 md:mb-0">
            <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">${producto.nombre}</h2>
                <p class="mb-1"><strong>Marca:</strong> ${producto.marca}</p>
                <p class="mb-1"><strong>Modelo:</strong> ${producto.modelo}</p>
                <p class="mb-1"><strong>Código:</strong> ${producto.codigoProducto}</p>
                <p class="mb-1"><strong>Stock:</strong> ${producto.Stock}</p>
                <div class="mb-2">
                    <strong>Precio más reciente:</strong>
                    <ul class="list-disc ml-6">
                        ${precioReciente
                            ? `<li>${precioReciente.fecha}: $${precioReciente.valor}</li>`
                            : '<li>No disponible</li>'}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function mostrarError(msg) {
    const cont = document.getElementById('producto-detalle');
    cont.innerHTML = `<p class="text-red-600">${msg}</p>`;
}