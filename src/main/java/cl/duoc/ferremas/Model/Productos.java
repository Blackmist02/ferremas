package cl.duoc.ferremas.Model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Productos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String codigoProducto;
    private String marca;
    private String codigo;
    private String nombre;
    private List<Precio> precios;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Precio {
        private String fecha;
        private double valor;
    }
}