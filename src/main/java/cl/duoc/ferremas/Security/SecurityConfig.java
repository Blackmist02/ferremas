package cl.duoc.ferremas.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UsuarioDetailsServiceImpl usuarioDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(authz -> authz
                // Rutas que requieren autenticación (solo admin)
                .requestMatchers("/Administracion.html").authenticated()
                .requestMatchers("/api/usuarios/usuario", "/api/usuarios/usuarios").authenticated()
                .requestMatchers("/api/suc/**").authenticated()
                .requestMatchers("/api/boleta/**").authenticated()
                
                // Todo lo demás es público - NO REQUIERE AUTENTICACIÓN
                .anyRequest().permitAll()
            )
            .userDetailsService(usuarioDetailsService)
            .httpBasic(httpBasic -> httpBasic
                .authenticationEntryPoint((request, response, authException) -> {
                    String requestUri = request.getRequestURI();
                    // Solo mostrar diálogo de autenticación para rutas administrativas específicas
                    if (requestUri.equals("/Administracion.html") || 
                        requestUri.startsWith("/api/usuarios/usuario") || 
                        requestUri.startsWith("/api/usuarios/usuarios") ||
                        requestUri.startsWith("/api/suc/") ||
                        requestUri.startsWith("/api/boleta/")) {
                        response.setHeader("WWW-Authenticate", "Basic realm=\"Ferremas Admin\"");
                        response.setStatus(401);
                    } else {
                        // Para todas las otras rutas, NO mostrar diálogo de autenticación
                        response.setStatus(403);
                        response.getWriter().write("{\"error\":\"Access denied\"}");
                        response.setContentType("application/json");
                    }
                })
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
