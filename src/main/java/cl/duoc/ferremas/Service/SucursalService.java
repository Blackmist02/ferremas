package cl.duoc.ferremas.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import cl.duoc.ferremas.Model.Sucursal;
import cl.duoc.ferremas.Repository.SucursalRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class SucursalService {
    @Autowired
    private SucursalRepository sucursalRepository;
    
    //metodo para listar todos los productos en la bbdd
    public List<Sucursal> findAll(){
        return sucursalRepository.findAll();
    }
    
    public Sucursal findById(Long id){
        return sucursalRepository.findById(id).get();
    }

    public Sucursal save(Sucursal sucursal){
        return sucursalRepository.save(sucursal);
    }

    public List<Sucursal> saveAll(List<Sucursal> sucursal) {
        return sucursalRepository.saveAll(sucursal);
    }

    public void deleteById(Long id){
        sucursalRepository.deleteById(id);
    }

}
