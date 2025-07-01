package cl.duoc.ferremas.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Service.ProductoService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")  // Para permitir llamadas desde otros orígenes (frontend)
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Productos>> listar() {
        List<Productos> productos = productoService.findAll();
        if (productos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Productos> obtenerPorId(@PathVariable Long id) {
        Productos producto = productoService.findById(id);
        if (producto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(producto);
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Productos> obtenerPorCodigo(@PathVariable String codigo) {
        Productos producto = productoService.findByCodigo(codigo);
        if (producto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(producto);
    }

    // NUEVO endpoint para buscar por codigoProducto y devolver producto por su codigo
    @GetMapping("/codigo-producto/{codigoProducto}")
    public ResponseEntity<Productos> obtenerPorCodigoProducto(@PathVariable String codigoProducto) {
        Productos productoPorCodigoProducto = productoService.findByCodigoProducto(codigoProducto);
        if (productoPorCodigoProducto == null) {
            return ResponseEntity.notFound().build();
        }

        Productos productoPorCodigo = productoService.findByCodigo(productoPorCodigoProducto.getCodigo());
        if (productoPorCodigo == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(productoPorCodigo);
    }

    @PostMapping
    public ResponseEntity<Productos> guardar(@RequestBody Productos producto) {
        Productos nuevoProducto = productoService.save(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PostMapping("/lista")
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
}
