package cl.duoc.ferremas.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.ferremas.Model.Mensaje;
import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Repository.MensajeRepository;
import cl.duoc.ferremas.Repository.UsuarioRepository;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Cliente envía mensaje
    @PostMapping
    public Mensaje enviarMensaje(@RequestBody Mensaje mensaje) {
        return mensajeRepository.save(mensaje);
    }

    // Admin ve todos los mensajes
    @GetMapping
    public List<Mensaje> listarMensajes() {
        return mensajeRepository.findAll();
    }

@GetMapping("/usuario/{id}")
public List<Mensaje> verMensajesPorUsuario(@PathVariable Long id) {
    return mensajeRepository.findByUsuario_Id(id);  // <-- corregido con guion bajo
}

    // Admin obtiene lista de usuarios que han enviado mensajes
    @GetMapping("/usuarios")
    public List<Usuario> obtenerUsuariosConMensajes() {
        return usuarioRepository.findDistinctByMensajesIsNotNull();
    }

    // Admin responde un mensaje específico
    @PutMapping("/responder/{id}")
    public ResponseEntity<?> responderMensaje(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Mensaje m = mensajeRepository.findById(id).orElse(null);
        if (m == null) return ResponseEntity.notFound().build();

        String respuesta = body.get("respuesta");
        m.setRespuesta(respuesta);
        return ResponseEntity.ok(mensajeRepository.save(m));
    }
}
