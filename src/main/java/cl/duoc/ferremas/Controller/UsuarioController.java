package cl.duoc.ferremas.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Service.UsuarioService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Listar todos los usuarios (requiere admin)
    @GetMapping("/usuario")
    public ResponseEntity<List<Usuario>> listar() {
        List<Usuario> usuarios = usuarioService.findAll();
        if (usuarios.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(usuarios);
    }

    // Guardar un usuario (general)
    @PostMapping("/usuario")
    public ResponseEntity<Usuario> guardar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // Guardar lista de usuarios
    @PostMapping("/usuarios")
    public ResponseEntity<List<Usuario>> guardarLista(@RequestBody List<Usuario> usuarios) {
        List<Usuario> nuevosUsuarios = usuarioService.saveAll(usuarios);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevosUsuarios);
    }

    // Registro público (sin autenticación)
    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody Map<String, String> datosRegistro) {
        Map<String, Object> response = new HashMap<>();

        try {
            String nombre = datosRegistro.get("nombre");
            String correo = datosRegistro.get("email");
            String password = datosRegistro.get("password");

            if (usuarioService.existeCorreo(correo)) {
                response.put("success", false);
                response.put("message", "Este correo ya está registrado");
                return ResponseEntity.badRequest().body(response);
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(nombre);
            nuevoUsuario.setCorreo(correo);
            nuevoUsuario.setPassword(password);
            nuevoUsuario.setRol("ROLE_USER"); // por defecto

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

    // Login general
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String correo = credenciales.get("email");
            String password = credenciales.get("password");

            Usuario usuario = usuarioService.autenticar(correo, password);

            if (usuario != null) {
                session.setAttribute("usuario", usuario);

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


@GetMapping("/auth/user")
public ResponseEntity<?> getUsuarioLogueado(HttpSession session) {
    Usuario usuario = (Usuario) session.getAttribute("usuario");
    if (usuario == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
    }
    return ResponseEntity.ok(usuario);
}


@PostMapping("/logout")
public ResponseEntity<?> logout(HttpSession session) {
    session.invalidate();
    return ResponseEntity.ok().build();
}


    // Crear usuario con cualquier rol (acceso restringido a ADMIN)
    @PostMapping("/crear")
    public ResponseEntity<Map<String, Object>> crearUsuario(@RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (usuarioService.existeCorreo(usuario.getCorreo())) {
                response.put("success", false);
                response.put("message", "El correo ya está registrado");
                return ResponseEntity.badRequest().body(response);
            }

            if (!usuario.getRol().equals("ROLE_ADMIN") && !usuario.getRol().equals("ROLE_USER")) {
                response.put("success", false);
                response.put("message", "Rol inválido. Use ROLE_ADMIN o ROLE_USER");
                return ResponseEntity.badRequest().body(response);
            }

            Usuario nuevo = usuarioService.save(usuario);
            response.put("success", true);
            response.put("usuario", Map.of(
                "id", nuevo.getId(),
                "correo", nuevo.getCorreo(),
                "rol", nuevo.getRol()
            ));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
