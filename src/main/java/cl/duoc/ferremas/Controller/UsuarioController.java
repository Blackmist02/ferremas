package cl.duoc.ferremas.Controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/usuario")
    public ResponseEntity<List<Usuario>> listar() {
        List<Usuario> usuarios = usuarioService.findAll();
        if (usuarios.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(usuarios);
    }

    @PostMapping("/usuario")
    public ResponseEntity<Usuario> guardar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    @PostMapping("/usuarios")
    public ResponseEntity<List<Usuario>> guardarLista(@RequestBody List<Usuario> usuarios) {
        List<Usuario> nuevosUsuarios = usuarioService.saveAll(usuarios);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevosUsuarios);
    }

    /*
    @PostMapping("/usuario/{id}/roles")
    public ResponseEntity<Usuario> agregarRoles(@PathVariable Long id, @RequestBody List<Usuario.Rol> nuevosRoles) {
        Usuario usuario = usuarioService.findById(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        usuario.getRoles().addAll(nuevosRoles); // Añade los nuevos roles a la lista existente
        Usuario usuarioActualizado = usuarioService.save(usuario); // Guarda el usuario actualizado
        return ResponseEntity.ok(usuarioActualizado);
    }

     */
}