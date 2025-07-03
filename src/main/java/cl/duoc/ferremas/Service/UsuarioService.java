package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario save(Usuario usuario) {
        // Cifrar contraseña al guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> saveAll(List<Usuario> usuarios) {
        usuarios.forEach(u -> u.setPassword(passwordEncoder.encode(u.getPassword())));
        return usuarioRepository.saveAll(usuarios);
    }

    public boolean existeCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo) != null;
    }

    public Usuario autenticar(String correo, String passwordPlano) {
        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario != null && passwordEncoder.matches(passwordPlano, usuario.getPassword())) {
            return usuario;
        }
        return null;
    }
}
