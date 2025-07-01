package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Repository.ProductosRepository;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductosRepository productoRepository;

    @Override
    public List<Productos> findAll() {
        return productoRepository.findAll();
    }

    @Override
    public Page<Productos> findAll(PageRequest pageRequest) {
        return productoRepository.findAll(pageRequest);
    }

    @Override
    public Productos findById(Long id) {
        return productoRepository.findById(id).orElse(null);
    }

    @Override
    public Productos save(Productos producto) {
        return productoRepository.save(producto);
    }

    @Override
    public List<Productos> saveAll(List<Productos> productos) {
        return productoRepository.saveAll(productos);
    }

    @Override
    public Productos findByCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo);
    }

    @Override
    public Productos findByCodigoProducto(String codigoProducto) {
        return productoRepository.findByCodigoProducto(codigoProducto);
    }
}
