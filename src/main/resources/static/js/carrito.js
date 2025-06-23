document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    mostrarCarrito();
});

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
                            const precio = precioReciente ? precioReciente.valor : 0;
                            const subtotal = precio * item.cantidad;
                            total += subtotal;
                            return `
                                <tr>
                                    <td class="py-2">${prod.nombre}</td>
                                    <td class="py-2">${item.cantidad}</td>
                                    <td class="py-2">$${precio}</td>
                                    <td class="py-2">$${subtotal}</td>
                                    <td class="py-2">
                                        <button onclick="eliminarDelCarrito(${item.id})" class="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded">Eliminar</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="text-right mt-4 font-bold text-lg">Total: $${total}</div>
                <div class="text-right mt-4">
                    <button onclick="procesarCompra(${total})" class="bg-green-600 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition">
                        Comprar con Webpay
                    </button>
                </div>
            `;
        });
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
        // Crear transacción Webpay
        const response = await fetch('/api/webpay/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: total
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