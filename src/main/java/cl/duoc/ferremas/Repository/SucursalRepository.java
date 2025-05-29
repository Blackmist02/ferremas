package cl.duoc.ferremas.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.ferremas.Model.Sucursal;

@Repository
public interface SucursalRepository extends JpaRepository<Sucursal, Long> {

}
