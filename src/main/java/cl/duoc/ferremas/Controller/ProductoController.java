package cl.duoc.ferremas.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Service.ProductoService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    
    @Autowired
    private ProductoService productoService;

    // ✅ Endpoint con paginación REAL Y fallback
    @GetMapping("/producto")
    public ResponseEntity<?> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        try {
            System.out.println("🔍 Solicitando página: " + page + ", tamaño: " + size);
            
            // ✅ Intentar paginación primero
            try {
                PageRequest pageRequest = PageRequest.of(page, size);
                Page<Productos> productosPage = productoService.findAll(pageRequest);
                
                // ✅ Retornar formato Spring Boot estándar
                Map<String, Object> response = new HashMap<>();
                response.put("content", productosPage.getContent());
                response.put("totalElements", productosPage.getTotalElements());
                response.put("totalPages", productosPage.getTotalPages());
                response.put("currentPage", productosPage.getNumber());
                response.put("size", productosPage.getSize());
                
                System.out.println("✅ Paginación exitosa: " + productosPage.getContent().size() + " productos");
                return ResponseEntity.ok(response);
                
            } catch (Exception paginacionError) {
                System.out.println("⚠️ Error en paginación, usando fallback: " + paginacionError.getMessage());
                
                // ✅ Fallback: simular paginación en memoria
                List<Productos> todosLosProductos = productoService.findAll();
                
                int start = page * size;
                int end = Math.min(start + size, todosLosProductos.size());
                
                if (start >= todosLosProductos.size()) {
                    // Página fuera de rango
                    Map<String, Object> response = new HashMap<>();
                    response.put("content", new ArrayList<>());
                    response.put("totalElements", todosLosProductos.size());
                    response.put("totalPages", (int) Math.ceil((double) todosLosProductos.size() / size));
                    response.put("currentPage", page);
                    response.put("size", size);
                    return ResponseEntity.ok(response);
                }
                
                List<Productos> productosPagina = todosLosProductos.subList(start, end);
                
                Map<String, Object> response = new HashMap<>();
                response.put("content", productosPagina);
                response.put("totalElements", todosLosProductos.size());
                response.put("totalPages", (int) Math.ceil((double) todosLosProductos.size() / size));
                response.put("currentPage", page);
                response.put("size", size);
                
                System.out.println("✅ Fallback exitoso: " + productosPagina.size() + " productos");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error general en endpoint: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al cargar productos");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Productos> obtenerPorId(@PathVariable Long id) {
        Productos producto = productoService.findById(id);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Productos> obtenerPorCodigo(@PathVariable String codigo) {
        Productos producto = productoService.findByCodigo(codigo);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/codigo-producto/{codigoProducto}")
    public ResponseEntity<Productos> obtenerPorCodigoProducto(@PathVariable String codigoProducto) {
        Productos producto = productoService.findByCodigoProducto(codigoProducto);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/productos")
    public ResponseEntity<List<Productos>> guardarLista(@RequestBody List<Productos> productos) {
        List<Productos> nuevosProductos = productoService.saveAll(productos);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevosProductos);
    }

    @PostMapping("/{id}/precios")
    public ResponseEntity<Productos> agregarPrecios(@PathVariable Long id, @RequestBody List<Productos.Precio> nuevosPrecios) {
        Productos producto = productoService.findById(id);
        if (producto == null) {
            return ResponseEntity.notFound().build();
        }
        producto.getPrecios().addAll(nuevosPrecios);
        Productos productoActualizado = productoService.save(producto);
        return ResponseEntity.ok(productoActualizado);
    }

    @PutMapping("/producto/{id}/stock")
    public ResponseEntity<Productos> actualizarStock(@PathVariable Long id, @RequestBody Map<String, Integer> stockData) {
        Productos producto = productoService.findById(id);
        if (producto == null) {
            return ResponseEntity.notFound().build();
        }
        producto.setStock(stockData.get("stock"));
        Productos productoActualizado = productoService.save(producto);
        return ResponseEntity.ok(productoActualizado);
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

    @PostMapping("/restaurar-stock")
    public ResponseEntity<Map<String, Object>> restaurarStock(@RequestBody List<Map<String, Object>> itemsCarrito) {
        try {
            for (Map<String, Object> item : itemsCarrito) {
                Long productoId = Long.valueOf(item.get("id").toString());
                Integer cantidad = Math.abs(Integer.valueOf(item.get("cantidad").toString()));
                
                Productos producto = productoService.findById(productoId);
                if (producto != null) {
                    producto.setStock(producto.getStock() + cantidad);
                    productoService.save(producto);
                }
            }
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("mensaje", "Stock restaurado correctamente");
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al restaurar stock");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
