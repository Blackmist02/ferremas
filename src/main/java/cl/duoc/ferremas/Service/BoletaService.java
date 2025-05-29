package cl.duoc.ferremas.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import cl.duoc.ferremas.Model.Boleta;
import cl.duoc.ferremas.Repository.BoletaRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class BoletaService {
    @Autowired
    private BoletaRepository boletaRepository;

    public List<Boleta> findAll() {
        return boletaRepository.findAll();
    }

    public Boleta findById(Long id) {
        return boletaRepository.findById(id).orElse(null);
    }

    public Boleta save(Boleta boleta) {
        return boletaRepository.save(boleta);
    }

    public List<Boleta> saveAll(List<Boleta> boletas) {
        return boletaRepository.saveAll(boletas);
    }

    public void deleteById(Long id) {
        boletaRepository.deleteById(id);
    }
}