package cl.duoc.ferremas.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Service.ProductoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



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
    

}
