document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('producto')?.trim(); // ejemplo: "HM001"

    if (!productoId) {
        mostrarError('No se ha especificado un producto.');
        return;
    }

    fetch(`/api/productos/codigo-producto/${productoId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Producto no encontrado');
            }
            return res.json();
        })
        .then(producto => {
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
        <div class="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-lg shadow-md max-w-5xl mx-auto my-12">
            <img src="https://placehold.co/300x200/015d5f/ffffff?text=${encodeURIComponent(producto.nombre)}" alt="${producto.nombre}" class="rounded-md w-full md:w-1/2 object-contain mb-6 md:mb-0 border-2 border-teal-700 shadow-lg">
            <div class="flex-1 text-gray-800">
                <h2 class="text-3xl font-bold mb-4 text-teal-800">${producto.nombre}</h2>
                <p class="mb-2"><strong>Marca:</strong> <span class="font-medium">${producto.marca}</span></p>
                <p class="mb-2"><strong>Modelo:</strong> <span class="font-medium">${producto.modelo}</span></p>
                <p class="mb-2"><strong>Código:</strong> <span class="font-medium">${producto.codigoProducto}</span></p>
                <p class="mb-2"><strong>Stock:</strong> <span class="font-medium">${producto.stock}</span></p>
                <div class="mb-4">
                    <strong class="text-red-700 text-lg">Precio más reciente:</strong>
                    <ul class="list-disc list-inside ml-4 text-gray-700">
                        ${precioReciente
                            ? `<li>${precioReciente.fecha}: <span class="font-semibold">$${precioReciente.valor}</span></li>`
                            : '<li>No disponible</li>'}
                    </ul>
                </div>
                <button onclick="agregarAlCarrito(${producto.id})" class="bg-red-600 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-semibold transition">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;
}

function mostrarError(msg) {
    const cont = document.getElementById('producto-detalle');
    cont.innerHTML = `<p class="text-red-600 text-center mt-10 font-semibold">${msg}</p>`;
}
