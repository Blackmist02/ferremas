package cl.duoc.ferremas.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Deshabilitar CSRF para APIs REST
            .authorizeHttpRequests(authz -> authz
                // Permitir acceso público a recursos estáticos
                .requestMatchers("/", "/index.html", "/login.html", "/registro.html").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/partials/**").permitAll()
                .requestMatchers("/productos.html", "/productoInd.html", "/carrito.html").permitAll()
                .requestMatchers("/webpay-success.html", "/webpay-failure.html").permitAll()
                
                // Permitir acceso público a APIs específicas
                .requestMatchers("/api/usuarios/registro", "/api/usuarios/login").permitAll()
                .requestMatchers("/api/productos/**").permitAll()
                .requestMatchers("/api/divisas/**").permitAll()
                .requestMatchers("/api/webpay/**").permitAll()
                
                // APIs administrativas requieren autenticación
                .requestMatchers("/api/usuarios/usuario", "/api/usuarios/usuarios").authenticated()
                .requestMatchers("/api/suc/**").authenticated()
                .requestMatchers("/api/boleta/**").authenticated()
                
                // Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {
                // Configuración de autenticación básica solo para endpoints admin
            });

        return http.build();
    }
}
