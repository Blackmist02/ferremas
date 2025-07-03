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

// ✅ Cargar productos destacados con mejor manejo de respuesta
async function cargarProductosDestacados() {
    try {
        console.log('🔄 Cargando productos destacados...');
        
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        // ✅ Primero intentar endpoint con paginación
        let res = await fetch('/api/productos/producto?page=0&size=6', {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        
        if (!res.ok) {
            console.warn('⚠️ Endpoint paginado falló, intentando endpoint simple');
            // Fallback: endpoint sin paginación
            res = await fetch('/api/productos/producto', {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
        }
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('📊 Respuesta productos destacados:', data);
        
        let productos = [];
        
        // ✅ Manejar diferentes formatos de respuesta
        if (data.content && Array.isArray(data.content)) {
            // Respuesta paginada de Spring Boot
            productos = data.content;
            console.log(`📄 Respuesta paginada: ${productos.length} productos`);
        } else if (Array.isArray(data)) {
            // Array simple
            productos = data;
            console.log(`📄 Array simple: ${productos.length} productos`);
        } else {
            console.error('❌ Formato de respuesta inválido:', typeof data, data);
            throw new Error('Respuesta del servidor en formato inválido');
        }
        
        if (productos.length === 0) {
            console.warn('⚠️ No hay productos disponibles');
            mostrarMensajeProductosVacio();
            return;
        }
        
        // ✅ Tomar solo los primeros 6 productos
        const productosDestacados = productos.slice(0, 6);
        console.log(`✅ Mostrando ${productosDestacados.length} productos destacados`);
        
        renderizarProductosDestacados(productosDestacados);
        
    } catch (error) {
        console.error('❌ Error al cargar productos destacados:', error);
        
        if (error.name === 'AbortError') {
            console.warn('⏰ Timeout en carga de productos destacados');
        }
        
        mostrarErrorProductosDestacados(error);
    }
}

// ✅ Renderizar productos destacados optimizado
function renderizarProductosDestacados(productos) {
    const container = document.getElementById('productos-destacados');
    if (!container) {
        console.warn('⚠️ Contenedor productos-destacados no encontrado');
        return;
    }
    
    console.log(`🎨 Renderizando ${productos.length} productos destacados`);
    
    // ✅ Limpiar contenedor
    container.innerHTML = '';
    
    // ✅ Crear tarjetas con DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    productos.forEach((producto, index) => {
        const tarjeta = crearTarjetaProductoDestacado(producto, index < 2);
        fragment.appendChild(tarjeta);
    });
    
    container.appendChild(fragment);
}

// ✅ Crear tarjeta de producto destacado
function crearTarjetaProductoDestacado(producto, isEager = false) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group';
    
    // ✅ Obtener precio más reciente
    const precioReciente = producto.precios?.length 
        ? producto.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b))
        : null;
    
    const precioDisplay = precioReciente 
        ? `$${Math.round(precioReciente.valor).toLocaleString('es-CL')}`
        : 'Precio no disponible';
    
    // ✅ Badge de stock bajo
    const stockBadge = producto.stock <= 5 
        ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Poco stock</span>'
        : '';
    
    // ✅ Badge de descuento (si hay múltiples precios)
    const descuentoBadge = producto.precios?.length > 1
        ? '<span class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Oferta</span>'
        : '';
    
    div.innerHTML = `
        <div class="relative overflow-hidden">
            <img src="https://placehold.co/280x200/8B5CF6/FFFFFF?text=${encodeURIComponent(producto.nombre.substring(0, 3))}" 
                 alt="${producto.nombre}" 
                 class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                 loading="${isEager ? 'eager' : 'lazy'}"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div class="hidden w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center">
                <div class="text-center">
                    <div class="text-purple-400 text-4xl mb-2">📦</div>
                    <span class="text-purple-600 text-sm font-medium">Sin imagen</span>
                </div>
            </div>
            ${stockBadge}
            ${descuentoBadge}
        </div>
        
        <div class="p-4">
            <h3 class="text-lg font-semibold mb-2 text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                ${producto.nombre}
            </h3>
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-500">${producto.marca}</span>
                <span class="text-xs text-gray-400">Stock: ${producto.stock}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-purple-600">${precioDisplay}</span>
                <button onclick="agregarAlCarritoRapido(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}')" 
                        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95">
                    Agregar
                </button>
            </div>
        </div>
    `;
    
    // ✅ Event listener para ver producto individual
    div.addEventListener('click', (e) => {
        // Solo navegar si no se clickeó el botón
        if (!e.target.closest('button')) {
            window.location.href = `productoInd.html?producto=${encodeURIComponent(producto.codigoProducto)}`;
        }
    });
    
    div.style.cursor = 'pointer';
    
    return div;
}

// ✅ Mostrar error en productos destacados
function mostrarErrorProductosDestacados(error) {
    const container = document.getElementById('productos-destacados');
    if (!container) return;
    
    let mensaje = 'Error al cargar productos';
    if (error.message.includes('formato inválido')) {
        mensaje = 'Error en el formato de respuesta del servidor';
    } else if (error.name === 'AbortError') {
        mensaje = 'Timeout al cargar productos';
    }
    
    container.innerHTML = `
        <div class="col-span-full text-center py-8">
            <div class="text-red-500 mb-4">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">${mensaje}</h3>
            <button onclick="cargarProductosDestacados()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                Reintentar
            </button>
        </div>
    `;
}

// ✅ Mostrar mensaje cuando no hay productos
function mostrarMensajeProductosVacio() {
    const container = document.getElementById('productos-destacados');
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-span-full text-center py-8">
            <div class="text-gray-400 mb-4">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-700">No hay productos disponibles</h3>
            <p class="text-gray-500 text-sm">Vuelve pronto para ver nuestros productos</p>
        </div>
    `;
}

// ✅ Función para agregar al carrito (si no existe)
function agregarAlCarritoRapido(productoId, nombre) {
    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(item => item.id === productoId);
        
        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ id: productoId, cantidad: 1 });
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // ✅ Actualizar contador si existe la función
        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito();
        }
        
        // ✅ Mostrar notificación simple
        mostrarNotificacionSimple(`${nombre} agregado al carrito`);
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarNotificacionSimple('Error al agregar producto', 'error');
    }
}

// ✅ Notificación simple para main.js
function mostrarNotificacionSimple(mensaje, tipo = 'success') {
    // Eliminar notificaciones anteriores
    const notificacionesAnteriores = document.querySelectorAll('.notificacion-main');
    notificacionesAnteriores.forEach(n => n.remove());
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-main fixed top-4 right-4 ${colores[tipo]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Animación de entrada
    requestAnimationFrame(() => {
        notificacion.classList.remove('translate-x-full');
    });
    
    // Auto-eliminar
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => notificacion.remove(), 300);
    }, 2500);
}

// ✅ Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏠 Inicializando página principal...');
    
    // ✅ Establecer año actual
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // ✅ Solo cargar productos si estamos en la página principal
    const productosContainer = document.getElementById('productos-destacados');
    if (productosContainer) {
        console.log('🏠 Detectada página principal, cargando productos destacados...');
        await cargarProductosDestacados();
    } else {
        console.log('📄 No estamos en página principal, saltando carga de productos');
    }
    
    // ✅ Actualizar contador de carrito si existe la función
    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito();
    }
});

// ✅ Exportar funciones para uso global
window.cargarProductosDestacados = cargarProductosDestacados;
window.agregarAlCarritoRapido = agregarAlCarritoRapido;
