package cl.duoc.ferremas.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import cl.duoc.ferremas.Model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Buscar usuario por correo
    Usuario findByCorreo(String correo);

    // Buscar usuarios que tengan al menos un mensaje
    @Query("SELECT DISTINCT m.usuario FROM Mensaje m")
    List<Usuario> findDistinctByMensajesIsNotNull();
}
