package cl.duoc.ferremas.Model;

import java.util.List;

import cl.duoc.ferremas.Model.Productos.Precio;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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


    @ElementCollection
    @CollectionTable(name = "producto_precios", joinColumns = @JoinColumn(name = "producto_id"))
    private List<Precio> precios;

    @Embeddable
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Precio {
        @Column(name = "fecha")
        private String fecha;

        @Column(name = "valor")
        private double valor;
    }
}