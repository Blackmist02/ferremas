package cl.duoc.ferremas.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.ferremas.Model.Mensaje;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByUsuario_Id(Long usuarioId); // Corregido: usa 'usuario_Id' no 'usuarioId'
}
