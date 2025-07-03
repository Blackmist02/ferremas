package cl.duoc.ferremas.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cl.duoc.ferremas.Model.Productos;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, Long> {
    @Query("SELECT p FROM Productos p WHERE p.codigo = :codigo")
    Productos findByCodigo(@Param("codigo") String codigo);
    
    // ✅ Buscar por código de producto
    @Query("SELECT p FROM Productos p WHERE p.codigoProducto = :codigoProducto")
    Productos findByCodigoProducto(@Param("codigoProducto") String codigoProducto);
}
