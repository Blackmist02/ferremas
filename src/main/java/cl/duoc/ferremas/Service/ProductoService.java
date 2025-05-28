package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Repository.ProductosRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ProductoService {
    @Autowired
    private ProductosRepository productosRepository;
    
    //metodo para listar todos los productos en la bbdd
    public List<Productos> findAll(){
        return productosRepository.findAll();
    }
    
    public Productos findById(Long id){
        return productosRepository.findById(id).get();
    }

    public Productos save(Productos productos){
        return productosRepository.save(productos);
    }

    public List<Productos> saveAll(List<Productos> productos) {
        return productosRepository.saveAll(productos);
    }

    public void delete(Long id){
        productosRepository.deleteById(id);
    }

}
