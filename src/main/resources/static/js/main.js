// Mostrar año actual en el footer
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    cargarProductosDestacados();
});

function obtenerImagenProducto(codigoProducto) {
    const imagenes = {
        "HM001": "img/productos/HM001.jpg",
        "DP002": "img/productos/DP002.jpg",
        "LL003": "img/productos/LL003.jpg", 
        "DS004": "img/productos/DS004.jpg",
        "TL005": "img/productos/TL005.jpg",
        "SR006": "img/productos/SR006.jpg",
        "AL007": "img/productos/AL007.jpg",
        "TP008": "img/productos/TP008.jpg",
        "ED009": "img/productos/ED009.jpg",
        "CL010": "img/productos/CL010.jpg",
        "PT011": "img/productos/PT011.jpg",
        "CV012": "img/productos/CV012.jpg",
        "ML013": "img/productos/ML013.jpg",
        "TC014": "img/productos/TC014.jpg",
        "PA015": "img/productos/PA015.jpg",
        "ES016": "img/productos/ES016.jpg",
        "MS017": "img/productos/MS017.jpg",
        "RG018": "img/productos/RG018.jpg",
        "NR019": "img/productos/NR019.jpg",
        "CP020": "img/productos/CP020.jpg",
        "default": "img/productos/default.jpg"
    };
    return imagenes[codigoProducto] || imagenes["default"];
}

// ✅ Optimizar carga de productos destacados con lazy loading
async function cargarProductosDestacados() {
    try {
        const res = await fetch('/api/productos/producto');
        if (!res.ok) throw new Error('Error al cargar productos');
        
        const productos = await res.json();
        const destacados = document.getElementById('destacados');
        if (!destacados) return;

        destacados.innerHTML = '';

        // Solo cargar primeros 4 productos para mejor rendimiento
        productos.slice(0, 4).forEach((producto, index) => {
            const precioReciente = producto.precios?.length
                ? producto.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b))
                : null;

            const imagenSrc = obtenerImagenProducto(producto.codigoProducto);

            // ✅ Agregar lazy loading a las imágenes
            destacados.innerHTML += `
                <div class="bg-gray-50 rounded-lg shadow-lg p-6 flex flex-col items-center">
                    <img src="${imagenSrc}" 
                         alt="${producto.nombre}" 
                         class="mb-4 rounded-md w-full h-32 object-contain shadow"
                         loading="${index < 2 ? 'eager' : 'lazy'}"
                         onerror="this.src='img/productos/default.jpg'">
                    <h3 class="text-lg font-semibold mb-2">${producto.nombre}</h3>
                    <p class="text-sm text-black-600 mb-1"><strong>Marca:</strong> ${producto.marca}</p>
                    <p class="text-sm text-black-600 mb-1"><strong>Modelo:</strong> ${producto.modelo}</p>
                    <p class="text-sm text-black-600 mb-1"><strong>Stock:</strong> ${producto.stock}</p>
                    <p class="text-red-700 font-bold text-lg mb-2">
                        $${precioReciente ? precioReciente.valor.toLocaleString() : 'No disponible'}
                    </p>
                    <a href="productoInd.html?producto=${producto.codigoProducto}" 
                       class="bg-emerald-600 hover:bg-emerald-800 text-white px-4 py-2 rounded transition">
                       Ver detalle
                    </a>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
        const destacados = document.getElementById('destacados');
        if (destacados) destacados.innerHTML = '<p class="text-red-600">Error al cargar productos destacados.</p>';
    }
}

function agregarAlCarrito(productoId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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

document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);
