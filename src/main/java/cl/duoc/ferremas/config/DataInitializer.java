package cl.duoc.ferremas.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import cl.duoc.ferremas.Model.Usuario;
import cl.duoc.ferremas.Service.UsuarioService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioService usuarioService;

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
    }
}
