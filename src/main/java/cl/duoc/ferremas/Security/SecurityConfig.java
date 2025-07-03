package cl.duoc.ferremas.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/index.html", "/productos.html", "/carrito.html", "/productoInd.html").permitAll()
                .requestMatchers("/login.html", "/registro.html").permitAll()
                .requestMatchers("/webpay-success.html", "/webpay-failure.html").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/partials/**", "/favicon.ico").permitAll()

                // APIs públicas
                .requestMatchers("/api/usuarios/registro", "/api/usuarios/login").permitAll()
                .requestMatchers("/api/productos/**", "/api/divisas/**", "/api/webpay/**").permitAll()

                // APIs restringidas
                .requestMatchers("/api/usuarios/usuario", "/api/usuarios/usuarios", "/api/usuarios/crear").hasRole("ADMIN")
                .requestMatchers("/api/suc/**", "/api/boleta/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .httpBasic(httpBasic -> httpBasic.realmName("Ferremas Admin API"));

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Contraseñas seguras
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
