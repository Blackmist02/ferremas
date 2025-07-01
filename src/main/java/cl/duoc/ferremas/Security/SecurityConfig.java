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
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Permitir acceso público a páginas web
                .requestMatchers("/", "/index.html", "/productos.html", "/carrito.html", "/productoInd.html").permitAll()
                .requestMatchers("/login.html", "/registro.html").permitAll()
                .requestMatchers("/webpay-success.html", "/webpay-failure.html").permitAll()
                
                // Permitir acceso a recursos estáticos
                .requestMatchers("/css/**", "/js/**", "/images/**", "/partials/**").permitAll()
                .requestMatchers("/favicon.ico").permitAll()
                
                // APIs públicas (sin autenticación)
                .requestMatchers("/api/usuarios/registro", "/api/usuarios/login").permitAll()
                .requestMatchers("/api/productos/**").permitAll()
                .requestMatchers("/api/divisas/**").permitAll()
                .requestMatchers("/api/webpay/**").permitAll()
                
                // APIs administrativas (requieren autenticación básica)
                .requestMatchers("/api/usuarios/usuario", "/api/usuarios/usuarios").hasRole("ADMIN")
                .requestMatchers("/api/suc/**").hasRole("ADMIN")
                .requestMatchers("/api/boleta/**").hasRole("ADMIN")
                
                // Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {
                httpBasic.realmName("Ferremas Admin API");
            });

        return http.build();
    }
}