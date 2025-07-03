package cl.duoc.ferremas.Controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sesion")
public class SesionController {

    @GetMapping("/actual")
    public ResponseEntity<?> obtenerSesion(HttpSession session) {
        Object usuario = session.getAttribute("usuario");
        if (usuario == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No hay sesión activa"));
        }
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarSesion(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Sesión cerrada"));
    }
}
