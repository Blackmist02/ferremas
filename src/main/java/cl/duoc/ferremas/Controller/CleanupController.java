package cl.duoc.ferremas.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RestController
@RequestMapping("/api/cleanup")
@CrossOrigin(origins = "*")
public class CleanupController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostMapping("/test-data")
    @Transactional
    public ResponseEntity<Map<String, Object>> cleanupTestData() {
        Map<String, Object> response = new HashMap<>();
        List<String> operations = new ArrayList<>();
        
        try {
            // 🔍 Contar datos de prueba antes de eliminar
            String countProductsSQL = """
                SELECT COUNT(*) FROM productos 
                WHERE nombre LIKE '%Test%' 
                   OR nombre LIKE '%PERF%' 
                   OR codigo_producto LIKE '%PERF%'
                   OR marca = 'TestMarca Performance'
            """;
            
            String countUsersSQL = """
                SELECT COUNT(*) FROM usuario 
                WHERE email LIKE '%perf-test%'
                   OR email LIKE '%ferremas-test%'
                   OR nombre LIKE '%Performance Test%'
            """;
            
            int testProducts = jdbcTemplate.queryForObject(countProductsSQL, Integer.class);
            int testUsers = jdbcTemplate.queryForObject(countUsersSQL, Integer.class);
            
            operations.add("🔍 Productos de prueba encontrados: " + testProducts);
            operations.add("🔍 Usuarios de prueba encontrados: " + testUsers);
            
            if (testProducts == 0 && testUsers == 0) {
                response.put("success", true);
                response.put("message", "No hay datos de prueba para limpiar");
                response.put("operations", operations);
                return ResponseEntity.ok(response);
            }
            
            // 🗑️ Eliminar precios de productos de prueba
            String deletePreciosSQL = """
                DELETE precios FROM precios 
                INNER JOIN productos ON precios.producto_id = productos.id
                WHERE productos.nombre LIKE '%Test%' 
                   OR productos.nombre LIKE '%PERF%' 
                   OR productos.codigo_producto LIKE '%PERF%'
                   OR productos.marca = 'TestMarca Performance'
            """;
            
            int deletedPrecios = jdbcTemplate.update(deletePreciosSQL);
            operations.add("🗑️ Precios eliminados: " + deletedPrecios);
            
            // 🗑️ Eliminar relaciones sucursal_productos
            String deleteSucursalProductosSQL = """
                DELETE sp FROM sucursal_productos sp
                INNER JOIN productos p ON sp.producto_id = p.id
                WHERE p.nombre LIKE '%Test%' 
                   OR p.nombre LIKE '%PERF%' 
                   OR p.codigo_producto LIKE '%PERF%'
                   OR p.marca = 'TestMarca Performance'
            """;
            
            int deletedRelations = jdbcTemplate.update(deleteSucursalProductosSQL);
            operations.add("🗑️ Relaciones sucursal-producto eliminadas: " + deletedRelations);
            
            // 🗑️ Eliminar productos de prueba
            String deleteProductsSQL = """
                DELETE FROM productos 
                WHERE nombre LIKE '%Test%' 
                   OR nombre LIKE '%PERF%' 
                   OR codigo_producto LIKE '%PERF%'
                   OR marca = 'TestMarca Performance'
            """;
            
            int deletedProducts = jdbcTemplate.update(deleteProductsSQL);
            operations.add("🗑️ Productos eliminados: " + deletedProducts);
            
            // 🗑️ Eliminar usuarios de prueba
            String deleteUsersSQL = """
                DELETE FROM usuario 
                WHERE email LIKE '%perf-test%'
                   OR email LIKE '%ferremas-test%'
                   OR nombre LIKE '%Performance Test%'
            """;
            
            int deletedUsers = jdbcTemplate.update(deleteUsersSQL);
            operations.add("🗑️ Usuarios eliminados: " + deletedUsers);
            
            operations.add("✅ Limpieza completada exitosamente");
            
            response.put("success", true);
            response.put("message", "Datos de prueba eliminados exitosamente");
            response.put("operations", operations);
            response.put("deleted", Map.of(
                "products", deletedProducts,
                "users", deletedUsers,
                "prices", deletedPrecios,
                "relations", deletedRelations
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            operations.add("❌ Error durante la limpieza: " + e.getMessage());
            
            response.put("success", false);
            response.put("message", "Error durante la limpieza");
            response.put("error", e.getMessage());
            response.put("operations", operations);
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/test-data/count")
    public ResponseEntity<Map<String, Object>> countTestData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String countProductsSQL = """
                SELECT COUNT(*) FROM productos 
                WHERE nombre LIKE '%Test%' 
                   OR nombre LIKE '%PERF%' 
                   OR codigo_producto LIKE '%PERF%'
                   OR marca = 'TestMarca Performance'
            """;
            
            String countUsersSQL = """
                SELECT COUNT(*) FROM usuario 
                WHERE email LIKE '%perf-test%'
                   OR email LIKE '%ferremas-test%'
                   OR nombre LIKE '%Performance Test%'
            """;
            
            int testProducts = jdbcTemplate.queryForObject(countProductsSQL, Integer.class);
            int testUsers = jdbcTemplate.queryForObject(countUsersSQL, Integer.class);
            
            response.put("success", true);
            response.put("testProducts", testProducts);
            response.put("testUsers", testUsers);
            response.put("hasTestData", testProducts > 0 || testUsers > 0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
