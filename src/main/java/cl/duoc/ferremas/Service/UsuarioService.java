package cl.duoc.ferremas.Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Repository.UsuarioRepository;
import jakarta.transaction.Transactional;



@Service
@Transactional
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Método para listar todos los usuarios en la base de datos
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    // Método para buscar un usuario por su ID
    public Usuario findById(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    // Método para guardar un usuario
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Método para guardar una lista de usuarios
    public List<Usuario> saveAll(List<Usuario> usuarios) {
        return usuarioRepository.saveAll(usuarios);
    }

    // Método para eliminar un usuario por su ID
    public void delete(Long id) {
        usuarioRepository.deleteById(id);
    }

    // Método para buscar usuario por correo
    public Usuario findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    // Método para autenticar usuario
    public Usuario autenticar(String correo, String password) {
        Usuario usuario = findByCorreo(correo);
        if (usuario != null && usuario.getPassword().equals(password)) {
            return usuario;
        }
        return null;
    }

    // Método para verificar si existe un correo
    public boolean existeCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo) != null;
    }
}