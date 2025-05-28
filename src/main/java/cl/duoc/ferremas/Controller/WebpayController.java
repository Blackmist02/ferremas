package cl.duoc.ferremas.Controller; // Asegúrate de que el paquete sea correcto

import cl.duoc.ferremas.Service.WebpayService; // Importa tu servicio
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView; // Para redirigir al usuario

import java.util.Map;
import java.util.UUID; // Para generar buyOrder y sessionId únicos

@RestController
@RequestMapping("/api/webpay")
public class WebpayController {

    private final WebpayService webpayService;

    public WebpayController(WebpayService webpayService) {
        this.webpayService = webpayService;
    }

    /**
     * Endpoint para iniciar una transacción Webpay.
     * Recibe el monto y otros datos necesarios desde el frontend.
     * Retorna la URL de Transbank y el token para redirigir al usuario.
     *
     * @param requestDto Un DTO que contiene el monto y otros detalles de la compra.
     * @return ResponseEntity con la URL de Transbank y el token.
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createWebpayTransaction(@RequestBody WebpayRequestDto requestDto) {
        // Genera un buyOrder y sessionId únicos para esta transacción
        // Puedes usar IDs de tu base de datos si ya tienes órdenes de compra
        String buyOrder = "ferremas-" + UUID.randomUUID().toString().substring(0, 8); // Ejemplo de buyOrder
        String sessionId = "sess-" + UUID.randomUUID().toString().substring(0, 8);  // Ejemplo de sessionId

        // MUY IMPORTANTE: returnUrl debe ser una URL ACCESIBLE por Transbank desde el exterior.
        // Si estás desarrollando localmente, usa ngrok o similar para exponer tu localhost.
        // Para producción, será la URL pública de tu frontend o un endpoint de tu backend.
        String returnUrl = "http://localhost:8080/api/webpay/commit"; // Cambia esto por tu URL real

        try {
            Map<String, String> response = webpayService.createTransaction(requestDto.getAmount(), buyOrder, sessionId, returnUrl);
            // La respuesta de Transbank contiene "token" y "url"
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint al que Transbank redirige al usuario después de la transacción.
     * Recibe el token de Webpay y confirma la transacción.
     *
     * @param tokenWs El token que Transbank envía como parámetro de URL.
     * @return Redirige al usuario a una página de éxito o fracaso en tu frontend.
     */
    @GetMapping("/commit")
    public RedirectView commitWebpayTransaction(@RequestParam("token_ws") String tokenWs) {
        try {
            Map<String, Object> commitResult = webpayService.commitTransaction(tokenWs);

            // Aquí puedes inspeccionar `commitResult` para determinar el estado de la transacción.
            // Por ejemplo, `commitResult.get("response_code")` para saber si fue exitosa (0).
            // y `commitResult.get("status")` (ej. "AUTHORIZED").

            if (commitResult != null && "AUTHORIZED".equals(commitResult.get("status")) &&
                Integer.valueOf(0).equals(commitResult.get("response_code"))) {
                // Transacción exitosa. Redirige al usuario a una página de éxito.
                // Puedes pasar más datos en la URL si lo necesitas
                return new RedirectView("/webpay/success?token=" + tokenWs);
            } else {
                // Transacción fallida o rechazada. Redirige a una página de error.
                return new RedirectView("/webpay/failure?token=" + tokenWs + "&error=" + commitResult.getOrDefault("response_code", "unknown"));
            }
        } catch (RuntimeException e) {
            // Manejar errores de comunicación o lógicos
            return new RedirectView("/webpay/failure?error=" + e.getMessage());
        }
    }

    /**
     * DTO (Data Transfer Object) para la solicitud de creación de transacción.
     * Esta clase mapea el JSON que recibirás de tu frontend.
     */
    public static class WebpayRequestDto {
        private double amount;
        // Otros campos que necesites, ej. "productDescription", "quantity"

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }
        // Agrega getters y setters para otros campos
    }

    // Opcional: Si Transbank redirige por POST, puedes usar un @PostMapping
    // @PostMapping("/commit")
    // public RedirectView commitWebpayTransactionPost(@RequestBody Map<String, String> body) {
    //     String tokenWs = body.get("token_ws"); // Asumiendo que el token viene en el cuerpo
    //     // ... misma lógica que el método GET ...
    // }
}