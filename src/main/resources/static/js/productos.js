let productos = [];
let monedaSeleccionada = 'CLP';
let tasasDivisas = { CLP: 1 };

// ✅ Cache por página específica
let paginasCache = new Map();
let divisasCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos
let totalProductosGlobal = 0;

// ✅ Pre-load crítico ULTRA OPTIMIZADO
document.addEventListener('DOMContentLoaded', async () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ✅ Verificar si realmente estamos en página de productos
    const productList = document.getElementById('product-list');
    if (!productList) {
        console.log('📄 No estamos en página de productos, saltando carga');
        actualizarContadorCarrito();
        return;
    }

    console.log('📄 Cargando página de productos...');
    mostrarSkeletonProductos();

    try {
        const startTime = performance.now();
        
        // ✅ Cargar SOLO primera página (12 productos)
        const currencySelector = document.getElementById('currency-selector');
        const promises = [cargarPaginaProductos(1, 12)];
        
        // Solo cargar divisas si hay selector
        if (currencySelector) {
            promises.push(cargarDivisasUltraRapido());
        }
        
        const resultados = await Promise.allSettled(promises);
        
        console.log(`⚡ Primera página cargada en ${Math.round(performance.now() - startTime)}ms`);
        
        if (resultados[0].status === 'rejected') {
            console.error('Error cargando productos:', resultados[0].reason);
            mostrarErrorProductos();
            return;
        }
        
        // Configurar selector de moneda
        if (currencySelector && resultados[1]?.status === 'fulfilled') {
            configurarSelectorMoneda();
        }
        
    } catch (error) {
        console.error('Error crítico:', error);
        mostrarErrorProductos();
    } finally {
        actualizarContadorCarrito();
    }
});

// ✅ Cargar SOLO una página específica
async function cargarPaginaProductos(pagina = 1, porPagina = 12) {
    const cacheKey = `${pagina}-${porPagina}`;
    const now = Date.now();
    
    // ✅ Verificar cache de página específica
    if (paginasCache.has(cacheKey)) {
        const cached = paginasCache.get(cacheKey);
        if ((now - cached.timestamp) < CACHE_DURATION) {
            console.log(`📦 Usando página ${pagina} desde cache`);
            renderizarProductosPagina(cached.productos, pagina, porPagina, cached.total);
            return;
        }
    }

    try {
        console.log(`🔄 Cargando página ${pagina} desde API...`);
        
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000); // 10 segundos timeout para debugging
        
        // ✅ URL con paginación específica
        const url = `/api/productos/producto?page=${pagina - 1}&size=${porPagina}`;
        console.log(`📡 URL solicitada: ${url}`);
        
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 
                'Cache-Control': 'no-cache', // Forzar carga fresca para debugging
                'Accept': 'application/json'
            }
        });
        
        console.log(`📡 Respuesta HTTP: ${res.status} ${res.statusText}`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('📊 Datos recibidos:', data);
        
        let productos, total;
        
        // ✅ Manejar respuesta paginada o simple array
        if (data.content && Array.isArray(data.content)) {
            // Respuesta paginada de Spring Boot
            productos = data.content;
            total = data.totalElements || data.content.length;
            console.log(`📄 Respuesta paginada: ${productos.length} productos de ${total} totales`);
        } else if (Array.isArray(data)) {
            // Array simple - simular paginación
            const offset = (pagina - 1) * porPagina;
            productos = data.slice(offset, offset + porPagina);
            total = data.length;
            console.log(`📄 Array simple paginado: ${productos.length} productos de ${total} totales`);
        } else {
            console.error('❌ Formato de respuesta inválido:', typeof data, data);
            throw new Error('Formato de respuesta inválido: se esperaba array o objeto paginado');
        }
        
        if (productos.length === 0 && pagina === 1) {
            console.warn('⚠️ No hay productos en la primera página');
            mostrarMensajeVacio();
            return;
        }
        
        // ✅ Guardar en cache específico de página
        paginasCache.set(cacheKey, {
            productos,
            total,
            timestamp: now
        });
        
        // ✅ Actualizar total global
        totalProductosGlobal = total;
        
        console.log(`✅ Página ${pagina} cargada exitosamente: ${productos.length} productos`);
        renderizarProductosPagina(productos, pagina, porPagina, total);
        
    } catch (error) {
        console.error(`❌ Error cargando página ${pagina}:`, error);
        
        if (error.name === 'AbortError') {
            console.warn('⏰ Timeout en carga de página (>10s)');
        }
        
        if (pagina === 1) {
            mostrarErrorEspecifico(error);
        } else {
            mostrarErrorPaginacion(pagina);
        }
        throw error;
    }
}

// ✅ Renderizar página específica
function renderizarProductosPagina(productosArray, pagina, porPagina, total) {
    const productList = document.getElementById('product-list');
    if (!productList) {
        console.warn('⚠️ Elemento product-list no encontrado');
        return;
    }
    
    console.log(`🎨 Renderizando página ${pagina}: ${productosArray.length} productos`);
    
    // ✅ Usar DocumentFragment para rendimiento
    const fragment = document.createDocumentFragment();
    
    productosArray.forEach((producto, index) => {
        const card = crearTarjetaProducto(producto, index < 4);
        fragment.appendChild(card);
    });
    
    // ✅ Update DOM una sola vez
    productList.innerHTML = '';
    productList.appendChild(fragment);
    
    // ✅ Renderizar paginación con total correcto
    renderizarPaginacionRapida(total, porPagina, pagina);
}

// ✅ Cambio de página optimizado
function cambiarPaginaRapida(nuevaPagina) {
    paginaActualGlobal = nuevaPagina;
    
    // ✅ Mostrar loading específico
    const productList = document.getElementById('product-list');
    if (productList) {
        productList.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
                <div class="flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span class="text-gray-600">Cargando página ${nuevaPagina}...</span>
                </div>
            </div>
        `;
    }
    
    // ✅ Cargar solo la página solicitada
    cargarPaginaProductos(nuevaPagina, 12)
        .catch(error => {
            console.error('Error al cambiar página:', error);
            mostrarErrorPaginacion(nuevaPagina);
        });
    
    // Scroll suave al top
    document.getElementById('product-list')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// ✅ Error específico para paginación
function mostrarErrorPaginacion(pagina) {
    const productList = document.getElementById('product-list');
    if (productList) {
        productList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-red-500 mb-4">
                    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Error al cargar página ${pagina}</h3>
                <div class="space-x-2">
                    <button onclick="cambiarPaginaRapida(${pagina})" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Reintentar
                    </button>
                    <button onclick="cambiarPaginaRapida(1)" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Ir a página 1
                    </button>
                </div>
            </div>
        `;
    }
}

// ✅ Carga divisas ultra rápida (300ms timeout)
async function cargarDivisasUltraRapido() {
    const now = Date.now();
    
    if (divisasCache && (now - lastCacheTime) < CACHE_DURATION) {
        tasasDivisas = divisasCache;
        return;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300); // Solo 300ms
        
        const res = await fetch('/api/divisas/tasas', { 
            signal: controller.signal,
            headers: { 'Cache-Control': 'max-age=300' }
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
            const data = await res.json();
            tasasDivisas = { CLP: 1, ...data };
            divisasCache = tasasDivisas;
            lastCacheTime = now;
            console.log('💱 Divisas cargadas:', Object.keys(tasasDivisas));
        }
    } catch (error) {
        console.warn('⚠️ Divisas no disponibles, usando valores por defecto');
        tasasDivisas = { CLP: 1, USD: 0.00105, EUR: 0.00092 };
        divisasCache = tasasDivisas;
        lastCacheTime = now;
    }
}

// ✅ Configurar selector de moneda optimizado
function configurarSelectorMoneda() {
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        currencySelector.addEventListener('change', (e) => {
            monedaSeleccionada = e.target.value;
            
            // ✅ Solo re-renderizar la página actual sin recargar datos
            const cacheKey = `${paginaActualGlobal}-12`;
            if (paginasCache.has(cacheKey)) {
                const cached = paginasCache.get(cacheKey);
                renderizarProductosPagina(cached.productos, paginaActualGlobal, 12, cached.total);
            }
        });
    }
}

// ✅ Skeleton loading optimizado
function mostrarSkeletonProductos() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    // Solo 12 skeletons (una página)
    const skeleton = Array.from({ length: 12 }, () => `
        <div class="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div class="bg-gray-200 h-32 rounded mb-3"></div>
            <div class="bg-gray-200 h-4 rounded mb-2"></div>
            <div class="bg-gray-200 h-3 rounded mb-1 w-3/4"></div>
            <div class="bg-gray-200 h-3 rounded mb-1 w-1/2"></div>
            <div class="bg-gray-200 h-6 rounded mb-3 w-1/3"></div>
            <div class="bg-gray-200 h-8 rounded"></div>
        </div>
    `).join('');
    
    productList.innerHTML = skeleton;
}

// ✅ Función de reintento mejorada
function reintentar() {
    console.log('🔄 Reintentando carga de productos...');
    mostrarSkeletonProductos();
    
    // Limpiar cache
    paginasCache.clear();
    lastCacheTime = 0;
    
    // Reintentar primera página
    cargarPaginaProductos(1, 12)
        .then(() => {
            console.log('✅ Reintento exitoso');
        })
        .catch(error => {
            console.error('❌ Reintento falló:', error);
            mostrarErrorProductos();
        });
}

// ✅ Crear tarjeta de producto optimizada
function crearTarjetaProducto(producto, isEager = false) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 flex flex-col';
    
    const precioReciente = producto.precios?.length 
        ? producto.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b))
        : null;
    
    const precioDisplay = precioReciente 
        ? formatearMonedaRapido(convertirMonedaRapido(precioReciente.valor))
        : 'Precio no disponible';
    
    div.innerHTML = `
        <div class="relative">
            <img src="https://placehold.co/200x150/8B5CF6/FFFFFF?text=${encodeURIComponent(producto.nombre.substring(0, 3))}" 
                 alt="${producto.nombre}" 
                 class="w-full h-32 object-contain rounded mb-3"
                 loading="${isEager ? 'eager' : 'lazy'}"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div class="hidden w-full h-32 bg-gray-100 rounded mb-3 items-center justify-center">
                <span class="text-gray-400 text-xs">Sin imagen</span>
            </div>
            ${producto.stock <= 5 ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Poco stock</span>' : ''}
        </div>
        
        <div class="flex-1 flex flex-col">
            <h3 class="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">${producto.nombre}</h3>
            <p class="text-sm text-gray-600 mb-1"><strong>Marca:</strong> ${producto.marca}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Stock:</strong> ${producto.stock}</p>
            <p class="text-purple-700 font-bold text-xl mb-3 flex-1 flex items-end">${precioDisplay}</p>
            
            <div class="space-y-2">
                <a href="productoInd.html?producto=${encodeURIComponent(producto.codigoProducto)}" 
                   class="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition">
                   Ver detalle
                </a>
                <button onclick="agregarAlCarritoRapido(${producto.id}, '${producto.nombre}')" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition">
                        Agregar al carrito
                </button>
            </div>
        </div>
    `;
    
    return div;
}

// ✅ Paginación optimizada
function renderizarPaginacionRapida(totalProductos, porPagina, paginaActual) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPaginas = Math.ceil(totalProductos / porPagina);
    if (totalPaginas <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    // ✅ Info de página actual
    const infoDiv = document.createElement('div');
    infoDiv.className = 'text-sm text-gray-600 mb-2';
    infoDiv.textContent = `Página ${paginaActual} de ${totalPaginas} (${totalProductos} productos totales)`;
    fragment.appendChild(infoDiv);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex items-center justify-center gap-2';
    
    // Botón anterior
    if (paginaActual > 1) {
        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = '← Anterior';
        btnAnterior.className = 'px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition';
        btnAnterior.onclick = () => cambiarPaginaRapida(paginaActual - 1);
        buttonsDiv.appendChild(btnAnterior);
    }
    
    // Números de página (máximo 5)
    const startPage = Math.max(1, paginaActual - 2);
    const endPage = Math.min(totalPaginas, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-2 rounded transition ${
            i === paginaActual 
                ? 'bg-purple-800 text-white' 
                : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
        }`;
        btn.onclick = () => cambiarPaginaRapida(i);
        buttonsDiv.appendChild(btn);
    }
    
    // Botón siguiente
    if (paginaActual < totalPaginas) {
        const btnSiguiente = document.createElement('button');
        btnSiguiente.textContent = 'Siguiente →';
        btnSiguiente.className = 'px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition';
        btnSiguiente.onclick = () => cambiarPaginaRapida(paginaActual + 1);
        buttonsDiv.appendChild(btnSiguiente);
    }
    
    fragment.appendChild(buttonsDiv);
    pagination.innerHTML = '';
    pagination.appendChild(fragment);
}

let paginaActualGlobal = 1;

// ✅ Funciones de conversión optimizadas
function convertirMonedaRapido(valorCLP) {
    return valorCLP * (tasasDivisas[monedaSeleccionada] || 1);
}

function formatearMonedaRapido(valor) {
    const decimales = monedaSeleccionada === 'CLP' ? 0 : 2;
    
    if (monedaSeleccionada === 'CLP') {
        return `$${Math.round(valor).toLocaleString('es-CL')}`;
    }
    
    const simbolos = { USD: 'US$', EUR: '€' };
    const simbolo = simbolos[monedaSeleccionada] || '$';
    
    return `${simbolo}${valor.toFixed(decimales)}`;
}

// ✅ Agregar al carrito ultra optimizado
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
        actualizarContadorCarrito();
        
        // ✅ Notificación más elegante
        mostrarNotificacionProducto(`${nombre} agregado al carrito`);
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarNotificacionProducto('Error al agregar producto', 'error');
    }
}

function actualizarContadorCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        
        const contadores = ['cart-count', 'mobile-cart-count', 'contador-carrito'];
        contadores.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = total;
        });
    } catch (error) {
        console.error('Error al actualizar contador:', error);
    }
}

// ✅ Notificaciones elegantes
function mostrarNotificacionProducto(mensaje, tipo = 'success') {
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-4 py-3 rounded-lg shadow-xl z-50 transform translate-x-full transition-transform duration-300 flex items-center space-x-2`;
    notificacion.innerHTML = `
        <span class="text-lg">${iconos[tipo]}</span>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    requestAnimationFrame(() => {
        notificacion.classList.remove('translate-x-full');
    });
    
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => notificacion.remove(), 300);
    }, 2500);
}

// ✅ Error handling mejorado
function mostrarErrorProductos() {
    const productList = document.getElementById('product-list');
    if (productList) {
        productList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-red-500 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Error al cargar productos</h3>
                <p class="text-gray-500 mb-4">No se pudieron cargar los productos. Verifica tu conexión.</p>
                <button onclick="reintentar()" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// ✅ Error más específico para debugging
function mostrarErrorEspecifico(error) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    let mensajeError = 'Error al cargar productos';
    let solucion = 'Revisa la consola para más detalles';
    let detallesExtra = '';
    
    if (error.name === 'AbortError') {
        mensajeError = 'La carga está tomando demasiado tiempo';
        solucion = 'El servidor puede estar sobrecargado o la base de datos es muy grande';
        detallesExtra = 'Timeout después de 10 segundos';
    } else if (error.message.includes('HTTP 404')) {
        mensajeError = 'Endpoint no encontrado';
        solucion = 'Verifica que el endpoint /api/productos/producto exista';
        detallesExtra = 'El controlador puede no estar configurado correctamente';
    } else if (error.message.includes('HTTP 500')) {
        mensajeError = 'Error interno del servidor';
        solucion = 'Revisa los logs del servidor Spring Boot';
        detallesExtra = 'Posible error en ProductoService o base de datos';
    } else if (error.message.includes('Failed to fetch')) {
        mensajeError = 'No se puede conectar al servidor';
        solucion = 'Verifica que Spring Boot esté ejecutándose en puerto 8081';
        detallesExtra = 'Servidor no responde o CORS bloqueado';
    } else if (error.message.includes('Formato de respuesta inválido')) {
        mensajeError = 'Respuesta del servidor inválida';
        solucion = 'El endpoint no está devolviendo el formato esperado';
        detallesExtra = 'Verifica la implementación del ProductoController';
    }
    
    productList.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">${mensajeError}</h3>
            <p class="text-gray-500 mb-4">${solucion}</p>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                <h4 class="font-semibold text-yellow-800 mb-2">Pasos para debugging:</h4>
                <ol class="text-sm text-yellow-700 space-y-1">
                    <li>1. Abre la consola del navegador (F12)</li>
                    <li>2. Verifica que Spring Boot esté corriendo</li>
                    <li>3. Prueba manualmente: <code class="bg-white px-1 rounded">http://localhost:8081/api/productos/producto</code></li>
                    <li>4. Revisa los logs del servidor</li>
                    <li>5. Verifica la implementación de ProductoServiceImpl</li>
                </ol>
            </div>
            
            <div class="space-y-2 mb-4">
                <button onclick="reintentar()" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 mr-2">
                    🔄 Reintentar
                </button>
                <button onclick="location.reload()" class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
                    🔃 Recargar página
                </button>
                <button onclick="testearEndpoint()" class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600">
                    🧪 Testear endpoint
                </button>
            </div>
            
            <details class="text-xs text-gray-400">
                <summary class="cursor-pointer hover:text-gray-600">Ver detalles técnicos</summary>
                <div class="mt-2 p-2 bg-gray-50 rounded text-left">
                    <strong>Error:</strong> ${error.message}<br>
                    <strong>Tipo:</strong> ${error.name}<br>
                    <strong>Detalles:</strong> ${detallesExtra}<br>
                    <strong>URL:</strong> /api/productos/producto?page=0&size=12
                </div>
            </details>
        </div>
    `;
}

// ✅ Función de testing manual
function testearEndpoint() {
    const urls = [
        '/api/productos/producto',
        '/api/productos/producto?page=0&size=12',
        '/api/productos/producto?page=0&size=5'
    ];
    
    console.log('🧪 Testeando endpoints...');
    
    urls.forEach(async (url, index) => {
        try {
            console.log(`Test ${index + 1}: ${url}`);
            const res = await fetch(url);
            console.log(`  Status: ${res.status} ${res.statusText}`);
            const data = await res.json();
            console.log(`  Respuesta:`, data);
            console.log(`  Tipo: ${Array.isArray(data) ? 'Array' : 'Object'}`);
            if (data.content) {
                console.log(`  Productos en content: ${data.content.length}`);
            } else if (Array.isArray(data)) {
                console.log(`  Productos en array: ${data.length}`);
            }
        } catch (error) {
            console.error(`  Error en ${url}:`, error);
        }
    });
}

// ✅ Agregar función de test global
window.testearEndpoint = testearEndpoint;

// ✅ Backward compatibility
window.agregarAlCarrito = agregarAlCarritoRapido;
window.cambiarPagina = cambiarPaginaRapida;
window.reintentar = reintentar;
