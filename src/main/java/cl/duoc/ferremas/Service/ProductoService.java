package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import cl.duoc.ferremas.Model.Productos;

public interface ProductoService {
    List<Productos> findAll();
    Productos findById(Long id);
    Productos save(Productos producto);
    List<Productos> saveAll(List<Productos> productos);
    Productos findByCodigo(String codigo);
    Productos findByCodigoProducto(String codigoProducto);  // <-- nuevo método
    Page<Productos> findAll(PageRequest pageRequest);
    long countAll(); // <-- nuevo método para contar productos
}
