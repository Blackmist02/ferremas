package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Repository.ProductosRepository;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductosRepository productosRepository;

    @Override
    public List<Productos> findAll() {
        return productosRepository.findAll();
    }

    @Override
    public Productos findById(Long id) {
        return productosRepository.findById(id).orElse(null);
    }

    @Override
    public Productos save(Productos producto) {
        return productosRepository.save(producto);
    }

    @Override
    public List<Productos> saveAll(List<Productos> productos) {
        return productosRepository.saveAll(productos);
    }

    @Override
    public Productos findByCodigo(String codigo) {
        return productosRepository.findByCodigo(codigo);
    }

    @Override
    public Productos findByCodigoProducto(String codigoProducto) {
        return productosRepository.findByCodigoProducto(codigoProducto);
    }
}
