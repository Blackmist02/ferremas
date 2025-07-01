document.addEventListener('DOMContentLoaded', async () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // ✅ Verificar si estamos en página de producto individual
    const productContainer = document.getElementById('product-detail-container');
    if (!productContainer) {
        console.log('📄 No estamos en página de producto individual');
        return;
    }
    
    console.log('🔍 Cargando producto individual...');
    
    try {
        // ✅ Obtener código del producto desde URL
        const urlParams = new URLSearchParams(window.location.search);
        const codigoProducto = urlParams.get('producto');
        
        console.log('🔍 URL completa:', window.location.href);
        console.log('🔍 Parámetros URL:', Object.fromEntries(urlParams));
        console.log('🔍 Código de producto extraído:', codigoProducto);
        
        if (!codigoProducto) {
            console.error('❌ No se encontró código de producto en URL');
            mostrarErrorProducto('Producto no especificado en la URL');
            return;
        }
        
        console.log(`🔍 Buscando producto con código: "${codigoProducto}"`);
        mostrarLoadingProducto();
        
        await cargarProductoPorCodigo(codigoProducto);
        
    } catch (error) {
        console.error('❌ Error al cargar producto individual:', error);
        mostrarErrorProducto('Error al cargar el producto');
    }
});

// ✅ Cargar producto por código con debugging completo
async function cargarProductoPorCodigo(codigoProducto) {
    try {
        console.log(`🔄 === INICIANDO BÚSQUEDA DE PRODUCTO ===`);
        console.log(`🔄 Código buscado: "${codigoProducto}"`);
        console.log(`🔄 Tipo del código: ${typeof codigoProducto}`);
        console.log(`🔄 Longitud del código: ${codigoProducto.length}`);
        
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 15000);
        
        // ✅ PASO 1: Intentar endpoints específicos (probablemente fallarán)
        console.log(`🔍 === PASO 1: PROBANDO ENDPOINTS ESPECÍFICOS ===`);
        const endpoints = [
            `/api/productos/codigo-producto/${encodeURIComponent(codigoProducto)}`,
            `/api/productos/codigo/${encodeURIComponent(codigoProducto)}`,
            `/api/productos/${encodeURIComponent(codigoProducto)}`,
        ];
        
        let producto = null;
        let endpointUsado = '';
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Probando: ${endpoint}`);
                
                const res = await fetch(endpoint, {
                    signal: controller.signal,
                    headers: { 
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                console.log(`📡 Respuesta ${endpoint}: ${res.status} ${res.statusText}`);
                
                if (res.ok) {
                    const data = await res.json();
                    console.log(`📊 Datos recibidos de ${endpoint}:`, data);
                    
                    if (data && (data.id || data.codigo_producto || data.codigoProducto || data.codigo)) {
                        producto = data;
                        endpointUsado = endpoint;
                        console.log(`✅ Producto encontrado en endpoint específico: ${endpoint}`);
                        break;
                    }
                } else {
                    console.log(`⚠️ Endpoint ${endpoint} retornó ${res.status}`);
                }
                
            } catch (error) {
                console.warn(`⚠️ Error en endpoint ${endpoint}:`, error.message);
                continue;
            }
        }
        
        // ✅ PASO 2: Buscar en lista completa (aquí está la clave)
        if (!producto) {
            console.log(`🔍 === PASO 2: BUSCANDO EN LISTA COMPLETA ===`);
            
            const listEndpoints = [
                '/api/productos/producto',
                '/api/productos'
            ];
            
            for (const listEndpoint of listEndpoints) {
                try {
                    console.log(`📡 Cargando lista desde: ${listEndpoint}`);
                    
                    const productosRes = await fetch(listEndpoint, {
                        signal: controller.signal,
                        headers: { 
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        }
                    });
                    
                    console.log(`📡 Respuesta ${listEndpoint}: ${productosRes.status} ${productosRes.statusText}`);
                    
                    if (!productosRes.ok) {
                        console.warn(`⚠️ Error al cargar ${listEndpoint}: ${productosRes.status}`);
                        continue;
                    }
                    
                    const productosData = await productosRes.json();
                    console.log(`📊 Tipo de respuesta:`, typeof productosData);
                    console.log(`📊 Es array:`, Array.isArray(productosData));
                    console.log(`📊 Tiene content:`, !!productosData.content);
                    console.log(`📊 Datos completos:`, productosData);
                    
                    let productos = [];
                    
                    // ✅ Manejar respuesta paginada o array
                    if (productosData.content && Array.isArray(productosData.content)) {
                        productos = productosData.content;
                        console.log(`📄 Lista paginada: ${productos.length} productos`);
                    } else if (Array.isArray(productosData)) {
                        productos = productosData;
                        console.log(`📄 Lista simple: ${productos.length} productos`);
                    } else {
                        console.warn('⚠️ Formato no reconocido, intentando siguiente endpoint');
                        continue;
                    }
                    
                    if (productos.length === 0) {
                        console.warn('⚠️ Lista vacía, intentando siguiente endpoint');
                        continue;
                    }
                    
                    // ✅ DEBUGGING: Mostrar estructura de los primeros productos
                    console.log(`🔍 === ANÁLISIS DE PRODUCTOS DISPONIBLES ===`);
                    console.log(`🔍 Total de productos: ${productos.length}`);
                    console.log(`🔍 Estructura del primer producto:`, productos[0]);
                    console.log(`🔍 Campos disponibles:`, Object.keys(productos[0] || {}));
                    
                    // ✅ Mostrar todos los códigos disponibles para comparar
                    const muestraProductos = productos.slice(0, 10).map((p, index) => ({
                        index,
                        id: p.id,
                        nombre: p.nombre?.substring(0, 30) + '...',
                        codigo_producto: p.codigo_producto,
                        codigoProducto: p.codigoProducto,
                        codigo: p.codigo,
                        stock: p.stock
                    }));
                    
                    console.log(`🔍 Muestra de productos (primeros 10):`, muestraProductos);
                    
                    // ✅ BÚSQUEDA DETALLADA
                    console.log(`🔍 === BÚSQUEDA DETALLADA DE "${codigoProducto}" ===`);
                    
                    let encontrado = false;
                    
                    // Búsqueda por codigo_producto (exacto)
                    console.log(`🔍 Buscando por codigo_producto exacto...`);
                    for (let i = 0; i < productos.length; i++) {
                        const p = productos[i];
                        if (p.codigo_producto === codigoProducto) {
                            console.log(`✅ ENCONTRADO por codigo_producto exacto en índice ${i}:`, {
                                id: p.id,
                                nombre: p.nombre,
                                codigo_producto: p.codigo_producto
                            });
                            producto = p;
                            encontrado = true;
                            break;
                        }
                    }
                    
                    // Búsqueda por codigo_producto (case insensitive)
                    if (!encontrado) {
                        console.log(`🔍 Buscando por codigo_producto (case insensitive)...`);
                        for (let i = 0; i < productos.length; i++) {
                            const p = productos[i];
                            if (p.codigo_producto?.toLowerCase() === codigoProducto.toLowerCase()) {
                                console.log(`✅ ENCONTRADO por codigo_producto (case insensitive) en índice ${i}:`, {
                                    id: p.id,
                                    nombre: p.nombre,
                                    codigo_producto: p.codigo_producto
                                });
                                producto = p;
                                encontrado = true;
                                break;
                            }
                        }
                    }
                    
                    // Búsquedas alternativas
                    if (!encontrado) {
                        console.log(`🔍 Buscando por campos alternativos...`);
                        
                        const criterios = [
                            { campo: 'codigoProducto', exact: true },
                            { campo: 'codigo', exact: true },
                            { campo: 'id', exact: true },
                            { campo: 'codigoProducto', exact: false },
                            { campo: 'codigo', exact: false }
                        ];
                        
                        for (const criterio of criterios) {
                            if (encontrado) break;
                            
                            console.log(`🔍 Probando ${criterio.campo} (${criterio.exact ? 'exacto' : 'case insensitive'})...`);
                            
                            for (let i = 0; i < productos.length; i++) {
                                const p = productos[i];
                                let match = false;
                                
                                if (criterio.campo === 'id') {
                                    match = p.id.toString() === codigoProducto;
                                } else if (criterio.exact) {
                                    match = p[criterio.campo] === codigoProducto;
                                } else {
                                    match = p[criterio.campo]?.toLowerCase() === codigoProducto.toLowerCase();
                                }
                                
                                if (match) {
                                    console.log(`✅ ENCONTRADO por ${criterio.campo} en índice ${i}:`, {
                                        id: p.id,
                                        nombre: p.nombre,
                                        [criterio.campo]: p[criterio.campo]
                                    });
                                    producto = p;
                                    encontrado = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (producto) {
                        endpointUsado = `${listEndpoint} (búsqueda)`;
                        console.log(`✅ === PRODUCTO ENCONTRADO ===`);
                        console.log(`✅ Nombre: ${producto.nombre}`);
                        console.log(`✅ ID: ${producto.id}`);
                        console.log(`✅ codigo_producto: ${producto.codigo_producto}`);
                        console.log(`✅ Endpoint: ${endpointUsado}`);
                        break;
                    } else {
                        console.warn(`❌ === PRODUCTO NO ENCONTRADO ===`);
                        console.warn(`❌ Código buscado: "${codigoProducto}"`);
                        console.warn(`❌ Total productos revisados: ${productos.length}`);
                        
                        // ✅ Buscar similares para ayudar con debugging
                        const similares = productos.filter(p => {
                            const busqueda = codigoProducto.toLowerCase();
                            return (
                                p.nombre?.toLowerCase().includes(busqueda.substring(0, 3)) ||
                                p.codigo_producto?.toLowerCase().includes(busqueda.substring(0, 3)) ||
                                p.codigoProducto?.toLowerCase().includes(busqueda.substring(0, 3)) ||
                                p.marca?.toLowerCase().includes(busqueda.substring(0, 3))
                            );
                        }).slice(0, 5);
                        
                        if (similares.length > 0) {
                            console.log(`🔍 Productos similares encontrados:`, similares.map(p => ({
                                id: p.id,
                                nombre: p.nombre,
                                codigo_producto: p.codigo_producto,
                                codigoProducto: p.codigoProducto,
                                codigo: p.codigo
                            })));
                        }
                        
                        // ✅ Mostrar códigos que contienen parte del código buscado
                        const codigosContienen = productos.filter(p => {
                            const busqueda = codigoProducto.toUpperCase();
                            return (
                                p.codigo_producto?.toUpperCase().includes(busqueda) ||
                                p.codigoProducto?.toUpperCase().includes(busqueda) ||
                                p.codigo?.toUpperCase().includes(busqueda)
                            );
                        }).slice(0, 5);
                        
                        if (codigosContienen.length > 0) {
                            console.log(`🔍 Códigos que contienen "${codigoProducto}":`, codigosContienen.map(p => ({
                                id: p.id,
                                nombre: p.nombre,
                                codigo_producto: p.codigo_producto,
                                codigoProducto: p.codigoProducto,
                                codigo: p.codigo
                            })));
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ Error procesando ${listEndpoint}:`, error);
                    continue;
                }
            }
        }
        
        // ✅ RESULTADO FINAL
        if (!producto) {
            console.error(`❌ === BÚSQUEDA FALLIDA ===`);
            console.error(`❌ Código buscado: "${codigoProducto}"`);
            console.error(`❌ No se encontró en ningún endpoint ni en la lista completa`);
            throw new Error(`Producto con código "${codigoProducto}" no encontrado`);
        }
        
        console.log(`✅ === PRODUCTO CARGADO EXITOSAMENTE ===`);
        console.log(`✅ Fuente: ${endpointUsado}`);
        console.log(`✅ Producto:`, producto);
        
        renderizarProductoIndividual(producto);
        
    } catch (error) {
        console.error('❌ === ERROR EN CARGA DE PRODUCTO ===', error);
        
        if (error.name === 'AbortError') {
            mostrarErrorProducto(`Timeout al cargar el producto "${codigoProducto}"`);
        } else if (error.message.includes('no encontrado')) {
            mostrarErrorProductoNoEncontrado(codigoProducto);
        } else {
            mostrarErrorProducto('Error al cargar el producto: ' + error.message);
        }
    }
}

// ✅ Renderizar producto individual (con imagen más pequeña e historial oculto)
function renderizarProductoIndividual(producto) {
    console.log(`🎨 === INICIANDO RENDERIZADO ===`);
    console.log(`🎨 Producto a renderizar:`, producto);
    
    const container = document.getElementById('product-detail-container');
    if (!container) {
        console.error('❌ Contenedor product-detail-container no encontrado en DOM');
        return;
    }
    
    console.log(`🎨 Contenedor encontrado, renderizando: ${producto.nombre}`);
    
    // ✅ Obtener precio más reciente de forma segura
    let precioDisplay = 'Precio no disponible';
    let precioReciente = null;
    
    try {
        if (producto.precios && Array.isArray(producto.precios) && producto.precios.length > 0) {
            precioReciente = producto.precios.reduce((a, b) => {
                const fechaA = new Date(a.fecha || a.timestamp || 0);
                const fechaB = new Date(b.fecha || b.timestamp || 0);
                return fechaA > fechaB ? a : b;
            });
            
            if (precioReciente && precioReciente.valor) {
                precioDisplay = `$${Math.round(precioReciente.valor).toLocaleString('es-CL')}`;
            }
        }
        console.log(`💰 Precio calculado: ${precioDisplay}`);
    } catch (error) {
        console.warn('⚠️ Error al calcular precio:', error);
    }
    
    // ✅ Datos seguros del producto
    const nombre = producto.nombre || 'Producto sin nombre';
    const marca = producto.marca || 'Sin marca';
    const stock = producto.stock || 0;
    const id = producto.id || 0;
    
    // ✅ Badge de stock
    const stockClass = stock > 10 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600';
    const stockText = stock > 0 ? `${stock} disponibles` : 'Sin stock';
    
    // ✅ Código del producto (prioridad a codigo_producto)
    const codigoMostrar = producto.codigo_producto || producto.codigoProducto || producto.codigo || `ID: ${id}`;
    
    console.log(`📊 Datos para renderizar:`, {
        nombre,
        marca,
        stock,
        id,
        codigoMostrar,
        precioDisplay
    });
    
    // ✅ Historial de precios (preparado pero oculto)
    const tieneHistorial = producto.precios?.length > 1;
    const historialPrecios = tieneHistorial 
        ? producto.precios
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 8) // Mostrar hasta 8 precios
            .map(precio => `
                <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span class="text-sm text-gray-600">${new Date(precio.fecha).toLocaleDateString('es-CL')}</span>
                    <span class="font-medium text-gray-800">$${Math.round(precio.valor).toLocaleString('es-CL')}</span>
                </div>
            `).join('')
        : '';
    
    // ✅ Generar HTML con imagen más pequeña e historial oculto
    const htmlContent = `
        <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="lg:flex">
                <!-- ✅ Imagen del producto - MÁS PEQUEÑA -->
                <div class="lg:w-2/5 xl:w-1/3">
                    <div class="relative h-64 sm:h-72 md:h-80 lg:h-96">
                        <img src="https://placehold.co/400x320/8B5CF6/FFFFFF?text=${encodeURIComponent(nombre.substring(0, 10))}" 
                             alt="${nombre}" 
                             class="w-full h-full object-cover"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div class="hidden w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center">
                            <div class="text-center">
                                <div class="text-purple-400 text-5xl mb-3">📦</div>
                                <span class="text-purple-600 text-base font-medium">Sin imagen disponible</span>
                            </div>
                        </div>
                        ${stock <= 5 && stock > 0 ? '<span class="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Poco stock</span>' : ''}
                        ${stock === 0 ? '<span class="absolute top-3 right-3 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">Sin stock</span>' : ''}
                    </div>
                </div>
                
                <!-- ✅ Información del producto - MÁS ESPACIO -->
                <div class="lg:w-3/5 xl:w-2/3 p-6 lg:p-8">
                    <div class="mb-6">
                        <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">${nombre}</h1>
                        <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <span><strong>Marca:</strong> ${marca}</span>
                            <span><strong>Modelo:</strong> ${producto.modelo || 'N/A'}</span>
                            <span><strong>Código:</strong> ${codigoMostrar}</span>
                        </div>
                        <div class="flex items-center gap-2 mb-4">
                            <span class="text-sm text-gray-600">Stock:</span>
                            <span class="font-medium ${stockClass}">${stockText}</span>
                        </div>
                    </div>
                    
                    <!-- ✅ Precio prominente -->
                    <div class="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div class="text-3xl lg:text-4xl font-bold text-purple-600 mb-1">${precioDisplay}</div>
                        ${precioReciente ? `<p class="text-sm text-purple-700">Precio actualizado el ${new Date(precioReciente.fecha).toLocaleDateString('es-CL')}</p>` : ''}
                        ${tieneHistorial ? `
                            <button onclick="toggleHistorialPrecios()" 
                                    class="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium underline focus:outline-none">
                                📊 Ver historial de precios (${producto.precios.length} registros)
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- ✅ Descripción -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-2 text-gray-800">Descripción</h3>
                        <p class="text-gray-700 leading-relaxed">${producto.descripcion || 'No hay descripción disponible para este producto.'}</p>
                    </div>
                    
                    <!-- ✅ Información adicional del producto (más compacta) -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3 text-gray-800">Información del Producto</h3>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">ID:</span>
                                    <span class="font-medium">${id}</span>
                                </div>
                                ${producto.codigo_producto ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Código:</span>
                                        <span class="font-medium">${producto.codigo_producto}</span>
                                    </div>
                                ` : ''}
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Categoría:</span>
                                    <span class="font-medium">${producto.categoria || 'Sin categoría'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Disponibilidad:</span>
                                    <span class="font-medium ${stockClass}">${stockText}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ✅ Acciones -->
                    <div class="space-y-3">
                        ${stock > 0 ? `
                            <button onclick="agregarAlCarritoDesdeDetalle(${id}, '${nombre.replace(/'/g, "\\'")}')" 
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-98 shadow-md hover:shadow-lg">
                                🛒 Agregar al Carrito
                            </button>
                        ` : `
                            <button disabled class="w-full bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold text-lg cursor-not-allowed opacity-75">
                                ❌ Sin Stock
                            </button>
                        `}
                        
                        <div class="flex gap-3">
                            <button onclick="window.history.back()" 
                                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors">
                                ← Volver
                            </button>
                            <button onclick="window.location.href='productos.html'" 
                                    class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                                Ver todos los productos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ✅ Historial de precios (OCULTO POR DEFECTO) -->
            ${tieneHistorial ? `
                <div id="historial-precios" class="hidden border-t bg-gradient-to-r from-gray-50 to-purple-50 p-6">
                    <div class="max-w-4xl mx-auto">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-800">📊 Historial de Precios</h3>
                            <button onclick="toggleHistorialPrecios()" 
                                    class="text-gray-500 hover:text-gray-700 transition-colors">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <!-- Lista de precios -->
                            <div class="bg-white rounded-lg p-4 shadow-sm border">
                                <h4 class="font-semibold text-gray-700 mb-3">Variaciones de Precio</h4>
                                <div class="space-y-1 max-h-64 overflow-y-auto">
                                    ${historialPrecios}
                                </div>
                            </div>
                            
                            <!-- Estadísticas -->
                            <div class="bg-white rounded-lg p-4 shadow-sm border">
                                <h4 class="font-semibold text-gray-700 mb-3">Estadísticas</h4>
                                <div class="space-y-3">
                                    ${calcularEstadisticasPrecios(producto.precios)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    console.log(`🎨 HTML generado, aplicando al contenedor...`);
    container.innerHTML = htmlContent;
    console.log('✅ === PRODUCTO RENDERIZADO EXITOSAMENTE ===');
}

// ✅ Función para calcular estadísticas de precios
function calcularEstadisticasPrecios(precios) {
    if (!precios || precios.length === 0) {
        return '<p class="text-gray-500 text-sm">No hay datos suficientes</p>';
    }
    
    const valores = precios.map(p => p.valor).sort((a, b) => a - b);
    const precioActual = precios.reduce((a, b) => (a.fecha > b.fecha ? a : b)).valor;
    const precioMinimo = Math.min(...valores);
    const precioMaximo = Math.max(...valores);
    const precioPromedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    
    // Calcular tendencia (comparar último precio con el anterior)
    const preciosOrdenados = precios.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    let tendencia = '';
    if (preciosOrdenados.length >= 2) {
        const ultimo = preciosOrdenados[preciosOrdenados.length - 1].valor;
        const anterior = preciosOrdenados[preciosOrdenados.length - 2].valor;
        if (ultimo > anterior) {
            tendencia = '<span class="text-red-600">↗️ Subiendo</span>';
        } else if (ultimo < anterior) {
            tendencia = '<span class="text-green-600">↘️ Bajando</span>';
        } else {
            tendencia = '<span class="text-gray-600">➡️ Estable</span>';
        }
    }
    
    return `
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Precio Actual:</span>
            <span class="font-semibold text-purple-600">$${Math.round(precioActual).toLocaleString('es-CL')}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Precio Mínimo:</span>
            <span class="font-medium text-green-600">$${Math.round(precioMinimo).toLocaleString('es-CL')}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Precio Máximo:</span>
            <span class="font-medium text-red-600">$${Math.round(precioMaximo).toLocaleString('es-CL')}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Precio Promedio:</span>
            <span class="font-medium text-gray-700">$${Math.round(precioPromedio).toLocaleString('es-CL')}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Tendencia:</span>
            <span class="font-medium">${tendencia}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t">
            <span class="text-sm text-gray-600">Total Registros:</span>
            <span class="font-medium text-blue-600">${precios.length}</span>
        </div>
    `;
}

// ✅ Función para mostrar/ocultar historial de precios
function toggleHistorialPrecios() {
    const historial = document.getElementById('historial-precios');
    if (!historial) {
        console.warn('⚠️ Elemento historial-precios no encontrado');
        return;
    }
    
    const isHidden = historial.classList.contains('hidden');
    
    if (isHidden) {
        // Mostrar con animación
        historial.classList.remove('hidden');
        historial.style.opacity = '0';
        historial.style.transform = 'translateY(-10px)';
        
        // Animación suave
        requestAnimationFrame(() => {
            historial.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            historial.style.opacity = '1';
            historial.style.transform = 'translateY(0)';
        });
        
        // Scroll suave hacia el historial
        setTimeout(() => {
            historial.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 150);
        
        console.log('📊 Historial de precios mostrado');
    } else {
        // Ocultar con animación
        historial.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        historial.style.opacity = '0';
        historial.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            historial.classList.add('hidden');
        }, 300);
        
        console.log('📊 Historial de precios ocultado');
    }
}

// ✅ Exportar la nueva función
window.toggleHistorialPrecios = toggleHistorialPrecios;

// ✅ Error específico para producto no encontrado
function mostrarErrorProductoNoEncontrado(codigoProducto) {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center py-12">
            <div class="text-yellow-500 mb-6">
                <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Producto "${codigoProducto}" no encontrado</h2>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <h3 class="font-semibold text-yellow-800 mb-2">Información de búsqueda:</h3>
                <ul class="text-sm text-yellow-700 space-y-1">
                    <li>• Código buscado: <strong>${codigoProducto}</strong></li>
                    <li>• Se buscó en campo: <strong>codigo_producto</strong></li>
                    <li>• También se verificaron campos alternativos</li>
                    <li>• Revisa la consola (F12) para más detalles</li>
                </ul>
            </div>
            <div class="space-x-4">
                <button onclick="window.history.back()" 
                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                    ← Volver
                </button>
                <a href="productos.html" 
                   class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition inline-block">
                    Ver todos los productos
                </a>
                <button onclick="buscarProductosSimilares('${codigoProducto}')" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                    Buscar similares
                </button>
            </div>
        </div>
    `;
}

// ✅ Agregar al carrito desde detalle
function agregarAlCarritoDesdeDetalle(productoId, nombre) {
    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(item => item.id === productoId);
        
        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ id: productoId, cantidad: 1 });
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito();
        }
        
        mostrarNotificacionProductoDetalle(`${nombre} agregado al carrito`);
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarNotificacionProductoDetalle('Error al agregar producto', 'error');
    }
}

// ✅ Loading para producto individual
function mostrarLoadingProducto() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="md:flex animate-pulse">
                <div class="md:w-1/2">
                    <div class="bg-gray-200 h-96 md:h-full"></div>
                </div>
                <div class="md:w-1/2 p-8">
                    <div class="bg-gray-200 h-8 rounded mb-4 w-3/4"></div>
                    <div class="bg-gray-200 h-4 rounded mb-2 w-1/2"></div>
                    <div class="bg-gray-200 h-4 rounded mb-4 w-1/3"></div>
                    <div class="bg-gray-200 h-12 rounded mb-4 w-1/4"></div>
                    <div class="bg-gray-200 h-6 rounded mb-2 w-full"></div>
                    <div class="bg-gray-200 h-6 rounded mb-4 w-2/3"></div>
                    <div class="bg-gray-200 h-12 rounded w-full"></div>
                </div>
            </div>
        </div>
    `;
}

// ✅ Mostrar error de producto
function mostrarErrorProducto(mensaje) {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center py-12">
            <div class="text-red-500 mb-6">
                <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
            <p class="text-gray-600 mb-6">${mensaje}</p>
            <div class="space-x-4">
                <button onclick="window.history.back()" 
                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                    ← Volver
                </button>
                <a href="productos.html" 
                   class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition inline-block">
                    Ver todos los productos
                </a>
            </div>
        </div>
    `;
}

// ✅ Notificación para producto detalle
function mostrarNotificacionProductoDetalle(mensaje, tipo = 'success') {
    const notificacionesAnteriores = document.querySelectorAll('.notificacion-detalle');
    notificacionesAnteriores.forEach(n => n.remove());
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
    
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-detalle fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-xl z-50 transform translate-x-full transition-transform duration-300 flex items-center space-x-2`;
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
    }, 3000);
}

// ✅ Exportar funciones globales
window.agregarAlCarritoDesdeDetalle = agregarAlCarritoDesdeDetalle;
window.buscarProductosSimilares = buscarProductosSimilares;
