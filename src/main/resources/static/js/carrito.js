let monedaSeleccionada = 'CLP';
let tasasDivisas = { CLP: 1 };

// ✅ Cache optimizado SOLO para productos del carrito
let productosCarritoCache = new Map();
let divisasCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

// ✅ Pre-carga optimizada
document.addEventListener('DOMContentLoaded', async () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // ✅ Solo proceder si estamos en página del carrito
    const carritoLista = document.getElementById('carrito-lista');
    if (!carritoLista) {
        console.log('📄 No estamos en página de carrito, saltando carga');
        return;
    }
    
    console.log('🛒 Cargando página del carrito...');
    mostrarLoadingCarrito(true);
    
    // Verificar usuario logueado
    const usuario = SessionManager?.obtenerUsuarioActivo();
    if (usuario) {
        console.log('Usuario logueado:', usuario.nombre);
    }
    
    try {
        // ✅ Cargar solo lo necesario
        const [divisasResult, carritoResult] = await Promise.allSettled([
            cargarDivisasRapido(),
            mostrarCarritoOptimizado()
        ]);
        
        if (divisasResult.status === 'rejected') {
            console.warn('Divisas no disponibles, usando valores por defecto');
        }
        
        if (carritoResult.status === 'rejected') {
            console.error('Error al cargar carrito:', carritoResult.reason);
            mostrarErrorCarrito('Error al cargar el carrito');
        }
        
    } catch (error) {
        console.error('Error crítico en carga inicial:', error);
        mostrarErrorCarrito('Error al cargar la página');
    } finally {
        mostrarLoadingCarrito(false);
    }
});

// ✅ Loading más rápido y visual
function mostrarLoadingCarrito(mostrar) {
    const cont = document.getElementById('carrito-lista');
    if (!cont) return;
    
    if (mostrar) {
        cont.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="relative">
                    <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div class="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent absolute top-0"></div>
                </div>
                <p class="mt-4 text-gray-600 font-medium">Cargando carrito...</p>
            </div>
        `;
    }
}

function mostrarErrorCarrito(mensaje) {
    const cont = document.getElementById('carrito-lista');
    if (cont) {
        cont.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-500 mb-4">
                    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p class="text-red-600 font-semibold">${mensaje}</p>
                <button onclick="reintentarCarrito()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// ✅ Función de reintento específica
function reintentarCarrito() {
    console.log('🔄 Reintentando carga del carrito...');
    mostrarLoadingCarrito(true);
    
    // Limpiar cache
    productosCarritoCache.clear();
    
    mostrarCarritoOptimizado()
        .then(() => {
            console.log('✅ Reintento del carrito exitoso');
            mostrarLoadingCarrito(false);
        })
        .catch(error => {
            console.error('❌ Reintento del carrito falló:', error);
            mostrarErrorCarrito('Error al cargar el carrito');
        });
}

// ✅ Carga divisas ultra rápida (500ms timeout)
async function cargarDivisasRapido() {
    const now = Date.now();
    
    if (divisasCache && (now - cacheTimestamp) < CACHE_TTL) {
        tasasDivisas = divisasCache;
        return tasasDivisas;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500); // Solo 500ms
        
        const res = await fetch('/api/divisas/tasas', { 
            signal: controller.signal,
            headers: { 'Cache-Control': 'max-age=300' }
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
            const data = await res.json();
            tasasDivisas = data;
            divisasCache = data;
            cacheTimestamp = now;
            console.log('💱 Divisas cargadas:', Object.keys(tasasDivisas).length);
        }
    } catch (error) {
        console.warn('⚠️ Usando divisas por defecto:', error.message);
        tasasDivisas = {
            CLP: 1,
            USD: 0.00105,
            EUR: 0.00092
        };
        divisasCache = tasasDivisas;
        cacheTimestamp = now;
    }
    
    return tasasDivisas;
}

// ✅ Cargar SOLO productos que están en el carrito (SIN LÍMITES)
async function cargarProductosDelCarrito(idsProductos) {
    if (idsProductos.length === 0) return [];
    
    try {
        console.log(`🔍 === CARGANDO PRODUCTOS DEL CARRITO ===`);
        console.log(`🔍 IDs solicitados: [${idsProductos.join(', ')}]`);
        console.log(`🔍 Cantidad total de productos: ${idsProductos.length}`);
        
        // ✅ Verificar cache primero
        const productosEncontrados = [];
        const idsNecesarios = [];
        
        idsProductos.forEach(id => {
            if (productosCarritoCache.has(id)) {
                const productoCache = productosCarritoCache.get(id);
                productosEncontrados.push(productoCache);
                console.log(`💾 Producto ${id} encontrado en cache: ${productoCache.nombre}`);
            } else {
                idsNecesarios.push(id);
                console.log(`🔍 Producto ${id} necesita ser cargado`);
            }
        });
        
        console.log(`📦 Cache: ${productosEncontrados.length} productos, Necesarios: ${idsNecesarios.length}`);
        
        // ✅ Solo cargar productos que no están en cache
        if (idsNecesarios.length > 0) {
            console.log(`🔍 Cargando productos específicos:`, idsNecesarios);
            
            // ✅ Intentar múltiples estrategias de carga
            let productosNuevos = [];
            
            // ESTRATEGIA 1: Cargar productos individuales
            console.log(`📡 Estrategia 1: Carga individual de ${idsNecesarios.length} productos`);
            const promesasProductos = idsNecesarios.map(async id => {
                try {
                    const controller = new AbortController();
                    setTimeout(() => controller.abort(), 5000); // 5 segundos por producto
                    
                    console.log(`📡 Cargando producto individual: ${id}`);
                    const res = await fetch(`/api/productos/${id}`, {
                        signal: controller.signal,
                        headers: { 'Cache-Control': 'max-age=300' }
                    });
                    
                    if (res.ok) {
                        const producto = await res.json();
                        console.log(`✅ Producto ${id} cargado: ${producto.nombre}`);
                        return producto;
                    } else {
                        console.warn(`⚠️ Producto ${id} no encontrado individualmente (HTTP ${res.status})`);
                        return null;
                    }
                } catch (error) {
                    console.error(`❌ Error cargando producto individual ${id}:`, error.message);
                    return null;
                }
            });
            
            productosNuevos = await Promise.all(promesasProductos);
            productosNuevos = productosNuevos.filter(p => p !== null);
            
            console.log(`📊 Estrategia 1 resultado: ${productosNuevos.length}/${idsNecesarios.length} productos cargados`);
            
            // ESTRATEGIA 2: Si faltan productos, buscar en lista completa
            const idsNoEncontrados = idsNecesarios.filter(id => 
                !productosNuevos.some(p => p.id === id)
            );
            
            if (idsNoEncontrados.length > 0) {
                console.log(`🔍 Estrategia 2: Buscando ${idsNoEncontrados.length} productos en lista completa`);
                
                try {
                    const resLista = await fetch('/api/productos/producto', {
                        headers: { 'Cache-Control': 'max-age=300' }
                    });
                    
                    if (resLista.ok) {
                        const dataLista = await resLista.json();
                        let todosLosProductos = [];
                        
                        if (dataLista.content && Array.isArray(dataLista.content)) {
                            todosLosProductos = dataLista.content;
                        } else if (Array.isArray(dataLista)) {
                            todosLosProductos = dataLista;
                        }
                        
                        console.log(`📡 Lista completa cargada: ${todosLosProductos.length} productos`);
                        
                        // Buscar productos faltantes en la lista
                        idsNoEncontrados.forEach(id => {
                            const productoEncontrado = todosLosProductos.find(p => p.id === id);
                            if (productoEncontrado) {
                                productosNuevos.push(productoEncontrado);
                                console.log(`✅ Producto ${id} encontrado en lista: ${productoEncontrado.nombre}`);
                            } else {
                                console.warn(`⚠️ Producto ${id} NO encontrado en ningún lado`);
                            }
                        });
                    }
                } catch (error) {
                    console.error('❌ Error en estrategia 2:', error);
                }
            }
            
            // ✅ Agregar al cache y resultado
            productosNuevos.forEach(producto => {
                if (producto && producto.id) {
                    productosCarritoCache.set(producto.id, producto);
                    productosEncontrados.push(producto);
                    console.log(`💾 Producto ${producto.id} agregado al cache: ${producto.nombre}`);
                }
            });
        }
        
        console.log(`✅ === RESUMEN CARGA DE PRODUCTOS ===`);
        console.log(`✅ Productos solicitados: ${idsProductos.length}`);
        console.log(`✅ Productos encontrados: ${productosEncontrados.length}`);
        console.log(`✅ Lista de productos cargados:`, productosEncontrados.map(p => ({
            id: p.id,
            nombre: p.nombre?.substring(0, 30) + '...',
            precio: p.precios?.[0]?.valor || 'Sin precio'
        })));
        
        return productosEncontrados;
        
    } catch (error) {
        console.error('❌ Error cargando productos del carrito:', error);
        throw error;
    }
}

// ✅ Mostrar carrito optimizado - TODOS los productos
async function mostrarCarritoOptimizado() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cont = document.getElementById('carrito-lista');
    
    console.log(`🛒 === PROCESANDO CARRITO COMPLETO ===`);
    console.log(`🛒 Items en carrito: ${carrito.length}`);
    console.log(`🛒 Detalle del carrito:`, carrito.map((item, index) => ({
        index: index + 1,
        id: item.id,
        cantidad: item.cantidad
    })));
    
    if (carrito.length === 0) {
        cont.innerHTML = `
            <div class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h3>
                <p class="text-gray-500 mb-6">¡Explora nuestros productos y encuentra lo que necesitas!</p>
                <a href="productos.html" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition inline-block">
                    Ver Productos
                </a>
            </div>
        `;
        return;
    }
    
    try {
        // ✅ Obtener TODOS los IDs únicos de productos en el carrito (SIN LÍMITES)
        const idsProductos = [...new Set(carrito.map(item => item.id))];
        console.log(`🔍 IDs únicos en carrito (${idsProductos.length}):`, idsProductos);
        
        // ✅ Cargar TODOS los productos del carrito
        const productos = await cargarProductosDelCarrito(idsProductos);
        
        if (productos.length === 0) {
            throw new Error('No se pudieron cargar los productos del carrito');
        }
        
        // ✅ Verificar que tenemos TODOS los productos necesarios
        const idsEncontrados = productos.map(p => p.id);
        const idsFaltantes = idsProductos.filter(id => !idsEncontrados.includes(id));
        
        if (idsFaltantes.length > 0) {
            console.warn(`⚠️ Productos faltantes en carrito: [${idsFaltantes.join(', ')}]`);
            console.warn(`⚠️ Estos productos se mostrarán como "Producto no disponible"`);
        }
        
        console.log(`✅ Renderizando carrito completo:`);
        console.log(`✅ - Items en carrito: ${carrito.length}`);
        console.log(`✅ - Productos únicos: ${idsProductos.length}`);
        console.log(`✅ - Productos cargados: ${productos.length}`);
        console.log(`✅ - Productos faltantes: ${idsFaltantes.length}`);
        
        renderizarCarritoCompleto(carrito, productos, cont, idsFaltantes);
        
    } catch (error) {
        console.error('❌ Error al mostrar carrito:', error);
        throw error;
    }
}

// ✅ Renderizado COMPLETO - todos los productos
function renderizarCarritoCompleto(carrito, productos, contenedor, idsFaltantes = []) {
    let total = 0;
    const productosMap = new Map(productos.map(p => [p.id, p]));
    
    console.log(`🎨 === RENDERIZANDO CARRITO COMPLETO ===`);
    console.log(`🎨 Items a renderizar: ${carrito.length}`);
    console.log(`🎨 Productos disponibles: ${productos.length}`);
    console.log(`🎨 Productos faltantes: ${idsFaltantes.length}`);
    
    // ✅ Crear elementos de forma más eficiente
    const fragment = document.createDocumentFragment();
    
    // Selector de moneda y resumen
    const selectorDiv = document.createElement('div');
    selectorDiv.className = 'mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg';
    selectorDiv.innerHTML = `
        <div>
            <h3 class="text-lg font-semibold text-gray-800">Resumen del pedido</h3>
            <p class="text-sm text-gray-600">${carrito.length} producto${carrito.length !== 1 ? 's' : ''} en tu carrito</p>
        </div>
        <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">Moneda:</label>
            <select id="currency-selector-carrito" class="px-3 py-1 rounded border border-gray-300 text-sm">
                <option value="CLP" ${monedaSeleccionada === 'CLP' ? 'selected' : ''}>CLP $</option>
                <option value="USD" ${monedaSeleccionada === 'USD' ? 'selected' : ''}>USD $</option>
                <option value="EUR" ${monedaSeleccionada === 'EUR' ? 'selected' : ''}>EUR €</option>
            </select>
        </div>
    `;
    fragment.appendChild(selectorDiv);
    
    // ✅ Lista COMPLETA de productos
    const productosDiv = document.createElement('div');
    productosDiv.className = 'space-y-4';
    
    // ✅ Renderizar TODOS los items del carrito
    carrito.forEach((item, index) => {
        console.log(`🎨 Renderizando item ${index + 1}/${carrito.length}: ID ${item.id}, Cantidad ${item.cantidad}`);
        
        const prod = productosMap.get(item.id);
        
        // ✅ Manejar productos no encontrados
        if (!prod) {
            console.warn(`⚠️ Producto ${item.id} no encontrado, mostrando como no disponible`);
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center justify-between bg-red-50 p-4 rounded-lg shadow-sm border border-red-200';
            itemDiv.innerHTML = `
                <div class="flex items-center space-x-4 flex-1">
                    <div class="w-15 h-15 bg-red-200 rounded flex items-center justify-center">
                        <span class="text-red-600 text-lg">❌</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-red-800">Producto no disponible</h4>
                        <p class="text-sm text-red-600">ID: ${item.id}</p>
                        <p class="text-sm text-red-600">Este producto ya no está disponible</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-center">
                        <p class="text-sm text-red-500">Cantidad</p>
                        <p class="font-bold text-red-700">${item.cantidad}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-red-500">Subtotal</p>
                        <p class="font-bold text-lg text-red-700">No disponible</p>
                    </div>
                    <button onclick="eliminarDelCarrito(${item.id})" 
                            class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                            title="Eliminar producto no disponible">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            productosDiv.appendChild(itemDiv);
            return;
        }
        
        // ✅ Producto encontrado - renderizar normalmente
        const precioReciente = prod.precios?.length 
            ? prod.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b))
            : null;
        
        const precioCLP = precioReciente?.valor || 0;
        const precioConvertido = convertirMonedaRapido(precioCLP);
        const subtotalCLP = precioCLP * item.cantidad;
        const subtotalConvertido = convertirMonedaRapido(subtotalCLP);
        total += subtotalCLP;
        
        // ✅ Información de stock
        const stockInfo = prod.stock <= 0 ? 
            '<span class="text-red-600 text-xs">Sin stock</span>' :
            prod.stock <= 5 ?
            `<span class="text-yellow-600 text-xs">Poco stock (${prod.stock})</span>` :
            `<span class="text-green-600 text-xs">Stock: ${prod.stock}</span>`;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border ${prod.stock <= 0 ? 'border-red-200 bg-red-50' : ''}`;
        itemDiv.innerHTML = `
            <div class="flex items-center space-x-4 flex-1">
                <img src="https://placehold.co/60x60/8B5CF6/FFFFFF?text=${encodeURIComponent(prod.nombre.charAt(0))}" 
                     alt="${prod.nombre}" 
                     class="w-15 h-15 rounded object-cover"
                     onerror="this.style.backgroundColor='#e5e7eb'; this.style.color='#6b7280';">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${prod.nombre}</h4>
                    <p class="text-sm text-gray-600">${prod.marca} - ${prod.modelo || 'N/A'}</p>
                    <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium text-green-600">${formatearMonedaRapido(precioConvertido)} c/u</p>
                        ${stockInfo}
                    </div>
                    <p class="text-xs text-gray-500">Código: ${prod.codigo_producto || prod.codigoProducto || prod.id}</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="text-center">
                    <p class="text-sm text-gray-500">Cantidad</p>
                    <div class="flex items-center space-x-2">
                        <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})" 
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full transition"
                                ${item.cantidad <= 1 ? 'disabled' : ''}>
                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                            </svg>
                        </button>
                        <span class="font-bold text-lg w-8 text-center">${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})" 
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full transition"
                                ${prod.stock <= item.cantidad ? 'disabled' : ''}>
                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="text-center">
                    <p class="text-sm text-gray-500">Subtotal</p>
                    <p class="font-bold text-lg">${formatearMonedaRapido(subtotalConvertido)}</p>
                </div>
                <button onclick="eliminarDelCarrito(${item.id})" 
                        class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                        title="Eliminar producto">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        productosDiv.appendChild(itemDiv);
        
        console.log(`✅ Item ${index + 1} renderizado: ${prod.nombre} x${item.cantidad} = ${formatearMonedaRapido(subtotalConvertido)}`);
    });
    
    fragment.appendChild(productosDiv);
    
    // ✅ Total y botón de compra
    const totalDiv = document.createElement('div');
    totalDiv.className = 'mt-6 bg-gray-50 p-6 rounded-lg';
    totalDiv.innerHTML = `
        <div class="mb-4">
            <div class="flex justify-between items-center text-lg mb-2">
                <span class="text-gray-700">Subtotal (${carrito.length} productos):</span>
                <span class="font-semibold">${formatearMonedaRapido(convertirMonedaRapido(total))}</span>
            </div>
            <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Envío:</span>
                <span>Gratis</span>
            </div>
            <hr class="my-3">
            <div class="flex justify-between items-center">
                <span class="text-xl font-bold text-gray-800">Total:</span>
                <div class="text-right">
                    <span class="text-2xl font-bold text-green-600">${formatearMonedaRapido(convertirMonedaRapido(total))}</span>
                    ${monedaSeleccionada !== 'CLP' ? `<p class="text-sm text-gray-500">${formatearMonedaRapido(total, 'CLP')} CLP</p>` : ''}
                </div>
            </div>
        </div>
        
        ${idsFaltantes.length > 0 ? `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p class="text-yellow-800 text-sm">
                    ⚠️ Algunos productos en tu carrito ya no están disponibles. Elimínalos para continuar.
                </p>
            </div>
        ` : ''}
        
        <button onclick="procesarCompraRapido(${total})" 
                class="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 ${idsFaltantes.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${idsFaltantes.length > 0 ? 'disabled' : ''}>
                🛒 ${idsFaltantes.length > 0 ? 'Productos no disponibles' : 'Pagar con Webpay'}
        </button>
        <p class="text-xs text-gray-500 text-center mt-2">El pago se procesará en pesos chilenos (CLP)</p>
    `;
    fragment.appendChild(totalDiv);
    
    // ✅ Actualizar DOM de una vez
    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
    
    // ✅ Event listener optimizado
    const currencySelector = document.getElementById('currency-selector-carrito');
    if (currencySelector) {
        currencySelector.addEventListener('change', (e) => {
            monedaSeleccionada = e.target.value;
            mostrarCarritoOptimizado();
        });
    }
    
    console.log(`✅ === CARRITO RENDERIZADO COMPLETAMENTE ===`);
    console.log(`✅ Total items renderizados: ${carrito.length}`);
    console.log(`✅ Total productos únicos: ${productos.length}`);
    console.log(`✅ Productos faltantes: ${idsFaltantes.length}`);
    console.log(`✅ Total del carrito: ${formatearMonedaRapido(convertirMonedaRapido(total))}`);
}

// ✅ Funciones de conversión optimizadas
function convertirMonedaRapido(valorCLP) {
    const tasa = tasasDivisas[monedaSeleccionada] || 1;
    return valorCLP * tasa;
}

function formatearMonedaRapido(valor, moneda = null) {
    const monedaAUsar = moneda || monedaSeleccionada;
    const decimales = monedaAUsar === 'CLP' ? 0 : 2;
    
    if (monedaAUsar === 'CLP') {
        return `$${Math.round(valor).toLocaleString('es-CL')}`;
    }
    
    try {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: monedaAUsar,
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        }).format(valor);
    } catch (error) {
        const simbolos = { CLP: '$', USD: 'US$', EUR: '€' };
        const simbolo = simbolos[monedaAUsar] || '$';
        return `${simbolo}${valor.toFixed(decimales)}`;
    }
}

// ✅ Eliminar del carrito optimizado
function eliminarDelCarrito(id) {
    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(item => item.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // ✅ Eliminar del cache también
        productosCarritoCache.delete(id);
        
        // ✅ Actualizar sin recargar todo
        mostrarCarritoOptimizado();
        
        // ✅ Actualizar contador si existe
        if (window.actualizarContadorCarrito) {
            window.actualizarContadorCarrito();
        }
        
        // ✅ Mostrar notificación suave
        mostrarNotificacionRapida('Producto eliminado', 'warning');
        
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        mostrarNotificacionRapida('Error al eliminar producto', 'error');
    }
}

// ✅ Proceso de compra ultra optimizado
async function procesarCompraRapido(total) {
    if (total <= 0) {
        mostrarNotificacionRapida('El carrito está vacío', 'warning');
        return;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        mostrarNotificacionRapida('El carrito está vacío', 'warning');
        return;
    }

    // ✅ Loading más elegante
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `
        <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            Procesando...
        </div>
    `;
    btn.disabled = true;

    try {
        // ✅ Verificar stock primero
        const stockResponse = await fetch('/api/productos/reducir-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carrito)
        });

        const stockResult = await stockResponse.json();
        
        if (!stockResult.success) {
            mostrarNotificacionRapida('Stock insuficiente: ' + stockResult.errores[0], 'error');
            return;
        }

        // ✅ Proceder con Webpay
        const webpayResponse = await fetch('/api/webpay/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total })
        });

        if (!webpayResponse.ok) {
            await restaurarStockRapido(carrito);
            throw new Error('Error en Webpay');
        }

        const webpayData = await webpayResponse.json();
        
        if (webpayData.error) {
            await restaurarStockRapido(carrito);
            mostrarNotificacionRapida('Error en el pago: ' + webpayData.error, 'error');
            return;
        }

        // ✅ Redirigir inmediatamente
        if (webpayData.url && webpayData.token) {
            localStorage.setItem('carritoTemporal', JSON.stringify(carrito));
            mostrarNotificacionRapida('Redirigiendo a Webpay...', 'success');
            setTimeout(() => {
                window.location.href = webpayData.url + '?token_ws=' + webpayData.token;
            }, 500);
        } else {
            await restaurarStockRapido(carrito);
            mostrarNotificacionRapida('Error: URL de pago no disponible', 'error');
        }

    } catch (error) {
        console.error('Error al procesar compra:', error);
        mostrarNotificacionRapida('Error al procesar la compra', 'error');
        await restaurarStockRapido(carrito);
    } finally {
        // ✅ Restaurar botón
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

async function restaurarStockRapido(carrito) {
    try {
        const itemsParaRestaurar = carrito.map(item => ({
            id: item.id,
            cantidad: -item.cantidad
        }));
        
        await fetch('/api/productos/restaurar-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemsParaRestaurar)
        });
    } catch (error) {
        console.error('Error al restaurar stock:', error);
    }
}

// ✅ Sistema de notificaciones rápidas
function mostrarNotificacionRapida(mensaje, tipo = 'info') {
    // Eliminar notificaciones anteriores
    const notificacionesAnteriores = document.querySelectorAll('.notificacion-rapida');
    notificacionesAnteriores.forEach(n => n.remove());
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-rapida fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
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
    }, 3000);
}

// ✅ Backward compatibility
window.mostrarCarrito = mostrarCarritoOptimizado;
window.procesarCompra = procesarCompraRapido;
window.reintentarCarrito = reintentarCarrito;

// ✅ Nueva función para cambiar cantidad
function cambiarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }
    
    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(item => item.id === id);
        
        if (index !== -1) {
            carrito[index].cantidad = nuevaCantidad;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            // Actualizar carrito
            mostrarCarritoOptimizado();
            
            // Actualizar contador
            if (window.actualizarContadorCarrito) {
                window.actualizarContadorCarrito();
            }
            
            mostrarNotificacionRapida('Cantidad actualizada', 'success');
        }
        
    } catch (error) {
        console.error('Error al cambiar cantidad:', error);
        mostrarNotificacionRapida('Error al actualizar cantidad', 'error');
    }
}

// ✅ Exportar nuevas funciones
window.cambiarCantidad = cambiarCantidad;
window.renderizarCarritoCompleto = renderizarCarritoCompleto;