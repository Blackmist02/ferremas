package cl.duoc.ferremas.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.ferremas.Model.Boleta;


@Repository
public interface BoletaRepository extends JpaRepository<Boleta, Long>{

}
