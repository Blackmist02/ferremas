package cl.duoc.ferremas.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import cl.duoc.ferremas.Model.Boleta;
import cl.duoc.ferremas.Service.BoletaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/boleta")
public class BoletaController {

    @Autowired
    private BoletaService boletaService;

    @GetMapping("/boleta")
    public ResponseEntity<List<Boleta>> listar() {
        List<Boleta> boletas = boletaService.findAll();
        if (boletas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(boletas);
    }

    @PostMapping("/boletas")
    public ResponseEntity<Boleta> guardar(@RequestBody Boleta boleta) {
        Boleta nuevaBoleta = boletaService.save(boleta);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaBoleta);
    }

    @PostMapping("/lBoletas")
    public ResponseEntity<List<Boleta>> guardarLista(@RequestBody List<Boleta> boletas) {
        List<Boleta> nuevasBoletas = boletaService.saveAll(boletas);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevasBoletas);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        boletaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}