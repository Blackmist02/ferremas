package cl.duoc.ferremas.Controller;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
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

    // Nuevo endpoint para registro
    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody Map<String, String> datosRegistro) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String nombre = datosRegistro.get("nombre");
            String correo = datosRegistro.get("email");
            String password = datosRegistro.get("password");
            
            // Verificar si el correo ya existe
            if (usuarioService.existeCorreo(correo)) {
                response.put("success", false);
                response.put("message", "Este correo ya está registrado");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Crear nuevo usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(nombre);
            nuevoUsuario.setCorreo(correo);
            nuevoUsuario.setPassword(password);
            nuevoUsuario.setRol("USER"); // Rol por defecto
            
            Usuario usuarioGuardado = usuarioService.save(nuevoUsuario);
            
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("usuario", Map.of(
                "id", usuarioGuardado.getId(),
                "nombre", usuarioGuardado.getNombre(),
                "correo", usuarioGuardado.getCorreo(),
                "rol", usuarioGuardado.getRol()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al registrar usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Nuevo endpoint para login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String correo = credenciales.get("email");
            String password = credenciales.get("password");
            
            Usuario usuario = usuarioService.autenticar(correo, password);
            
            if (usuario != null) {
                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("usuario", Map.of(
                    "id", usuario.getId(),
                    "nombre", usuario.getNombre(),
                    "correo", usuario.getCorreo(),
                    "rol", usuario.getRol()
                ));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Credenciales incorrectas");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error en el login: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}