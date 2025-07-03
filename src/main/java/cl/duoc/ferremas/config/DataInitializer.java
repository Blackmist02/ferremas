package cl.duoc.ferremas.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.core.io.ClassPathResource;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Model.Productos;
import cl.duoc.ferremas.Service.UsuarioService;
import cl.duoc.ferremas.Service.ProductoService;

import java.io.InputStream;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private ProductoService productoService;

    @Override
    public void run(String... args) throws Exception {
        // Crear usuario admin si no existe
        if (!usuarioService.existeCorreo("admin@ferremas.com")) {
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo("admin@ferremas.com");
            admin.setPassword("admin");
            admin.setRol("ADMIN");
            
            usuarioService.save(admin);
            System.out.println("✅ Usuario admin creado: admin@ferremas.com / admin");
        } else {
            System.out.println("ℹ️ Usuario admin ya existe");
        }
        
        // Cargar productos desde ejemplos.json si no existen
        if (productoService.countAll() == 0) {
            try {
                System.out.println("📦 Cargando productos desde ejemplos.json...");
                
                ClassPathResource resource = new ClassPathResource("ejemplos.json");
                InputStream inputStream = resource.getInputStream();
                
                ObjectMapper mapper = new ObjectMapper();
                List<Productos> productos = mapper.readValue(inputStream, new TypeReference<List<Productos>>() {});
                
                for (Productos producto : productos) {
                    productoService.save(producto);
                }
                
                System.out.println("✅ Se cargaron " + productos.size() + " productos exitosamente");
                
            } catch (Exception e) {
                System.err.println("❌ Error al cargar productos: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("ℹ️ Los productos ya existen en la base de datos");
        }
    }
}
