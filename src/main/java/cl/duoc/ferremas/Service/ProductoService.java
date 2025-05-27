package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cl.duoc.ferremas.Repository.ProductosRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ProductoService {
    @Autowired
    private ProductosRepository productosRepository;
    
    //metodo para listar todos los productos en la bbdd
    
}
