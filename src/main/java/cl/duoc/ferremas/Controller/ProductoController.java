package cl.duoc.ferremas.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Service.ProductoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/producto")
    public ResponseEntity<List<Productos>> listar(){
        List<Productos> productos = productoService.findAll();
        if (productos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(productos);
    }
    

    // POST para un solo producto
    @PostMapping("/producto")
    public ResponseEntity<Productos> guardar(@RequestBody Productos productos) {
        Productos nuevoProducto = productoService.save(productos);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    // POST para una lista de productos
    @PostMapping("/productos")
    public ResponseEntity<List<Productos>> guardarLista(@RequestBody List<Productos> productos) {
        List<Productos> nuevosProductos = productoService.saveAll(productos);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevosProductos);
    }

    @PostMapping("/producto/{id}/precios")
public ResponseEntity<Productos> agregarPrecios(@PathVariable Long id, @RequestBody List<Productos.Precio> nuevosPrecios) {
    Productos producto = productoService.findById(id);
    if (producto == null) {
        return ResponseEntity.notFound().build();
    }
    producto.getPrecios().addAll(nuevosPrecios); // Añade los nuevos precios a la lista existente
    Productos productoActualizado = productoService.save(producto); // Guarda el producto actualizado
    return ResponseEntity.ok(productoActualizado);
}
    @PutMapping("/producto/{id}/stock")
    public ResponseEntity<Productos> actualizarStock(@PathVariable Long id, @RequestBody Map<String, Integer> stockData) {
        try {
            Productos producto = productoService.findById(id);
            if (producto == null) {
                return ResponseEntity.notFound().build();
            }
            
            Integer nuevaCantidad = stockData.get("cantidad");
            if (nuevaCantidad == null || nuevaCantidad < 0) {
                return ResponseEntity.badRequest().build();
            }
            
            // Verificar que hay suficiente stock
            if (producto.getStock() < nuevaCantidad) {
                return ResponseEntity.badRequest().build();
            }
            
            producto.setStock(producto.getStock() - nuevaCantidad);
            Productos productoActualizado = productoService.save(producto);
            return ResponseEntity.ok(productoActualizado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/reducir-stock")
    public ResponseEntity<Map<String, Object>> reducirStockMasivo(@RequestBody List<Map<String, Object>> itemsCarrito) {
        try {
            Map<String, Object> resultado = new HashMap<>();
            List<String> errores = new ArrayList<>();
            
            for (Map<String, Object> item : itemsCarrito) {
                Long productoId = Long.valueOf(item.get("id").toString());
                Integer cantidad = Integer.valueOf(item.get("cantidad").toString());
                
                Productos producto = productoService.findById(productoId);
                if (producto == null) {
                    errores.add("Producto con ID " + productoId + " no encontrado");
                    continue;
                }
                
                if (producto.getStock() < cantidad) {
                    errores.add("Stock insuficiente para " + producto.getNombre() + " (disponible: " + producto.getStock() + ", solicitado: " + cantidad + ")");
                    continue;
                }
                
                producto.setStock(producto.getStock() - cantidad);
                productoService.save(producto);
            }
            
            if (!errores.isEmpty()) {
                resultado.put("success", false);
                resultado.put("errores", errores);
                return ResponseEntity.badRequest().body(resultado);
            }
            
            resultado.put("success", true);
            resultado.put("mensaje", "Stock actualizado correctamente");
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
