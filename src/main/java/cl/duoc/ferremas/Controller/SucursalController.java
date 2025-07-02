package cl.duoc.ferremas.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.ferremas.Model.Sucursal;
import cl.duoc.ferremas.Service.SucursalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;




@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {
    
    @Autowired
    private SucursalService sucursalService;

    @GetMapping
    public ResponseEntity<List<Sucursal>> listarSucursales() {
        List<Sucursal> sucursales = sucursalService.findAll();
        if (sucursales.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(sucursales);
    }

    @PostMapping
    public ResponseEntity<Sucursal> guardar(@RequestBody Sucursal sucursal) {
        Sucursal nuevaSucursal = sucursalService.save(sucursal);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSucursal);
    }

    @PostMapping("/lista")
    public ResponseEntity<List<Sucursal>> guardarLista(@RequestBody List<Sucursal> sucursales) {
        List<Sucursal> nuevasSucursales = sucursalService.saveAll(sucursales);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevasSucursales);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        sucursalService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /*
    @PatchMapping("/{id}")
    public ResponseEntity<Sucursal> actualizar(@PathVariable Long id, @RequestBody Sucursal sucursal) {
        Sucursal sucursalActualizada = sucursalService.update(id, sucursal);
        return ResponseEntity.ok(sucursalActualizada);
    }
    */
}

