package cl.duoc.ferremas.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.ferremas.Model.Productos;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, Long> {
    Productos findByCodigo(String codigo);
    Productos findByCodigoProducto(String codigoProducto); // <-- nuevo método
}
