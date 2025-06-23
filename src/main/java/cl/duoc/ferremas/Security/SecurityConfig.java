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
            .authorizeHttpRequests(authz -> authz
                // Permitir todos los archivos estáticos
                .requestMatchers("/", "/index.html", "/productos.html", "/carrito.html", 
                                "/login.html", "/registro.html", "/productoInd.html", "/divisas.html",
                                "/webpay-success.html", "/webpay-failure.html").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/partials/**", "/webpay/**").permitAll()
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions().disable());
        
        return http.build();
    }
}
