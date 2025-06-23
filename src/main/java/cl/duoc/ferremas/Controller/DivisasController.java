package cl.duoc.ferremas.Controller;

import cl.duoc.ferremas.Service.BancoCentralService;
import cl.duoc.ferremas.Service.BancoCentralService.DivisaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/divisas")
@CrossOrigin(origins = "*")
public class DivisasController {

    @Autowired
    private BancoCentralService bancoCentralService;

    // Endpoint principal para el carrito
    @GetMapping("/principales")
    public ResponseEntity<List<DivisaDTO>> obtenerDivisasPrincipales() {
        try {
            List<DivisaDTO> resultado = bancoCentralService.obtenerDivisasPrincipales();
            
            if (resultado.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint optimizado para tasas de cambio
    @GetMapping("/tasas")
    public ResponseEntity<Map<String, Double>> obtenerTasasCambio() {
        try {
            List<DivisaDTO> divisas = bancoCentralService.obtenerDivisasPrincipales();
            Map<String, Double> tasas = new HashMap<>();
            
            // CLP es la base
            tasas.put("CLP", 1.0);
            
            for (DivisaDTO divisa : divisas) {
                if (divisa.getCodigo().contains("USD") || divisa.getCodigo().contains("F073.TCO.PRE.Z.D")) {
                    tasas.put("USD", 1.0 / divisa.getValor());
                } else if (divisa.getCodigo().contains("EUR")) {
                    tasas.put("EUR", 1.0 / divisa.getValor());
                }
            }
            
            return ResponseEntity.ok(tasas);
        } catch (Exception e) {
            // Tasas de fallback
            Map<String, Double> fallbackTasas = new HashMap<>();
            fallbackTasas.put("CLP", 1.0);
            fallbackTasas.put("USD", 0.0011);
            fallbackTasas.put("EUR", 0.00095);
            return ResponseEntity.ok(fallbackTasas);
        }
    }

}