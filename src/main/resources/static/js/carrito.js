let monedaSeleccionada = 'CLP';
let tasasDivisas = { CLP: 1 }; // CLP es la base

document.addEventListener('DOMContentLoaded', async () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    await cargarTasasDivisas();
    mostrarCarrito();
});

async function cargarTasasDivisas() {
    try {
        const res = await fetch('/api/divisas/tasas');
        const data = await res.json();
        tasasDivisas = data;
        console.log('Tasas de divisas cargadas:', tasasDivisas);
    } catch (e) {
        console.error('Error cargando divisas:', e);
        // Tasas de fallback aproximadas
        tasasDivisas = {
            CLP: 1,
            USD: 0.0011,  // Aproximadamente 1 USD = 900 CLP
            EUR: 0.00095  // Aproximadamente 1 EUR = 1050 CLP
        };
    }
}

function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cont = document.getElementById('carrito-lista');
    if (carrito.length === 0) {
        cont.innerHTML = '<p class="text-gray-600">El carrito está vacío.</p>';
        return;
    }
    
    // Obtener todos los productos para mostrar detalles
    fetch('/api/productos/producto')
        .then(res => res.json())
        .then(productos => {
            let total = 0;
            cont.innerHTML = `
                <div class="mb-4 flex justify-end items-center">
                    <label for="currency-selector-carrito" class="mr-2 font-medium">Ver precios en:</label>
                    <select id="currency-selector-carrito" class="px-3 py-1 rounded-md border border-gray-300">
                        <option value="CLP" ${monedaSeleccionada === 'CLP' ? 'selected' : ''}>Peso Chileno (CLP)</option>
                        <option value="USD" ${monedaSeleccionada === 'USD' ? 'selected' : ''}>Dólar (USD)</option>
                        <option value="EUR" ${monedaSeleccionada === 'EUR' ? 'selected' : ''}>Euro (EUR)</option>
                    </select>
                </div>
                <table class="min-w-full text-left">
                    <thead>
                        <tr>
                            <th class="py-2">Producto</th>
                            <th class="py-2">Cantidad</th>
                            <th class="py-2">Precio</th>
                            <th class="py-2">Subtotal</th>
                            <th class="py-2">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${carrito.map(item => {
                            const prod = productos.find(p => p.id === item.id);
                            if (!prod) return '';
                            let precioReciente = null;
                            if (prod.precios && prod.precios.length > 0) {
                                precioReciente = prod.precios.reduce((a, b) => (a.fecha > b.fecha ? a : b));
                            }
                            const precioCLP = precioReciente ? precioReciente.valor : 0;
                            const precioConvertido = convertirMoneda(precioCLP);
                            const subtotalCLP = precioCLP * item.cantidad;
                            const subtotalConvertido = convertirMoneda(subtotalCLP);
                            total += subtotalCLP; // El total siempre en CLP para el pago
                            
                            return `
                                <tr>
                                    <td class="py-2">${prod.nombre}</td>
                                    <td class="py-2">${item.cantidad}</td>
                                    <td class="py-2">${formatearMoneda(precioConvertido)}</td>
                                    <td class="py-2">${formatearMoneda(subtotalConvertido)}</td>
                                    <td class="py-2">
                                        <button onclick="eliminarDelCarrito(${item.id})" class="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded">Eliminar</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="text-right mt-4 font-bold text-lg">
                    Total: ${formatearMoneda(convertirMoneda(total))}
                    ${monedaSeleccionada !== 'CLP' ? `<br><span class="text-sm text-gray-600">(${formatearMoneda(total, 'CLP')} CLP)</span>` : ''}
                </div>
                <div class="text-right mt-4">
                    <button onclick="procesarCompra(${total})" class="bg-green-600 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition">
                        Comprar con Webpay
                    </button>
                    <p class="text-xs text-gray-500 mt-1">*El pago se procesará en pesos chilenos (CLP)</p>
                </div>
            `;
            
            // Agregar event listener para el selector de moneda
            const currencySelector = document.getElementById('currency-selector-carrito');
            if (currencySelector) {
                currencySelector.addEventListener('change', (e) => {
                    monedaSeleccionada = e.target.value;
                    mostrarCarrito(); // Recargar carrito con nueva moneda
                });
            }
        });
}

function convertirMoneda(valorCLP) {
    const tasa = tasasDivisas[monedaSeleccionada] || 1;
    return valorCLP * tasa;
}

function formatearMoneda(valor, moneda = null) {
    const monedaAUsar = moneda || monedaSeleccionada;
    const opciones = {
        style: 'currency',
        currency: monedaAUsar,
        minimumFractionDigits: 2,
        maximumFractionDigits: monedaAUsar === 'CLP' ? 0 : 2
    };
    
    try {
        return new Intl.NumberFormat('es-CL', opciones).format(valor);
    } catch (error) {
        // Fallback si hay error con el formato
        const simbolos = { CLP: '$', USD: 'US$', EUR: '€' };
        const simbolo = simbolos[monedaAUsar] || '$';
        return `${simbolo}${valor.toFixed(monedaAUsar === 'CLP' ? 0 : 2)}`;
    }
}

function eliminarDelCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
}

async function procesarCompra(total) {
    if (total <= 0) {
        alert('El carrito está vacío o no tiene productos válidos.');
        return;
    }

    try {
        // Crear transacción Webpay (siempre en CLP)
        const response = await fetch('/api/webpay/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: total // Siempre en CLP
            })
        });

        if (!response.ok) {
            throw new Error('Error al crear la transacción');
        }

        const data = await response.json();
        
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        // Redirigir a Webpay
        if (data.url && data.token) {
            window.location.href = data.url + '?token_ws=' + data.token;
        } else {
            alert('Error: No se pudo obtener la URL de pago');
        }

    } catch (error) {
        console.error('Error al procesar la compra:', error);
        alert('Error al procesar la compra. Por favor, inténtalo de nuevo.');
    }
}