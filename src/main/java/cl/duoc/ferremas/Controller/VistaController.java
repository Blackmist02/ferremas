package cl.duoc.ferremas.Controller;

import java.io.IOException;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import cl.duoc.ferremas.Model.Usuario;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Controller
public class VistaController {

    @GetMapping("/ver-mensajes")
    public void verMensajes(HttpSession session, HttpServletResponse response) throws IOException {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null || !"ROLE_ADMIN".equals(usuario.getRol())) {
            response.sendRedirect("/404.html");
        } else {
            response.sendRedirect("/mensajes.html");
        }
    }

    @GetMapping("/ver-mis-mensajes")
    public void verMisMensajes(HttpSession session, HttpServletResponse response) throws IOException {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null || !"ROLE_USER".equals(usuario.getRol())) {
            response.sendRedirect("/404.html");
        } else {
            response.sendRedirect("/misMensajes.html");
        }
    }
}
