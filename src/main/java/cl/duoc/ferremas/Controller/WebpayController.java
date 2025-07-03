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
        String returnUrl = "http://localhost:8081/api/webpay/commit"; // Cambia esto por tu URL real

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
     * Maneja tanto transacciones exitosas/fallidas como cancelaciones.
     *
     * @param tokenWs El token que Transbank envía cuando la transacción se procesa
     * @param tbkToken El token que Transbank envía cuando el usuario cancela
     * @param tbkOrdenCompra La orden de compra cuando el usuario cancela
     * @param tbkIdSesion El ID de sesión cuando el usuario cancela
     * @return Redirige al usuario a una página de éxito, fracaso o cancelación
     */
    @GetMapping("/commit")
    public RedirectView commitWebpayTransaction(
            @RequestParam(value = "token_ws", required = false) String tokenWs,
            @RequestParam(value = "TBK_TOKEN", required = false) String tbkToken,
            @RequestParam(value = "TBK_ORDEN_COMPRA", required = false) String tbkOrdenCompra,
            @RequestParam(value = "TBK_ID_SESION", required = false) String tbkIdSesion) {
        
        try {
            // 🚫 CASO 1: Usuario canceló desde Transbank (parámetros TBK_*)
            if (tbkToken != null && tbkOrdenCompra != null && tbkIdSesion != null) {
                System.out.println("🚫 Usuario canceló desde Transbank:");
                System.out.println("   - TBK_TOKEN: " + tbkToken);
                System.out.println("   - TBK_ORDEN_COMPRA: " + tbkOrdenCompra);
                System.out.println("   - TBK_ID_SESION: " + tbkIdSesion);
                
                // Redirigir a página de cancelación con información
                return new RedirectView("/webpay-cancel.html?source=transbank&orden=" + tbkOrdenCompra + "&sesion=" + tbkIdSesion);
            }
            
            // ✅ CASO 2: Transacción procesada (token_ws presente)
            if (tokenWs != null && !tokenWs.trim().isEmpty()) {
                System.out.println("💳 Procesando transacción con token: " + tokenWs);
                
                Map<String, Object> commitResult = webpayService.commitTransaction(tokenWs);

                if (commitResult != null && "AUTHORIZED".equals(commitResult.get("status")) &&
                    Integer.valueOf(0).equals(commitResult.get("response_code"))) {
                    // Transacción exitosa
                    System.out.println("✅ Transacción autorizada exitosamente");
                    return new RedirectView("/webpay-success.html?token=" + tokenWs);
                } else {
                    // Transacción fallida
                    System.out.println("❌ Transacción fallida: " + commitResult.getOrDefault("response_code", "unknown"));
                    return new RedirectView("/webpay-failure.html?token=" + tokenWs + "&error=" + commitResult.getOrDefault("response_code", "unknown"));
                }
            }
            
            // ⚠️ CASO 3: Sin parámetros válidos
            System.out.println("⚠️ Commit sin parámetros válidos - posible error");
            return new RedirectView("/webpay-failure.html?error=no_valid_parameters");
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error en el procesamiento de commit: " + e.getMessage());
            e.printStackTrace();
            
            // Si hay información de cancelación, redirigir a cancelación
            if (tbkToken != null) {
                return new RedirectView("/webpay-cancel.html?source=transbank&error=" + e.getMessage());
            }
            
            // Error general
            return new RedirectView("/webpay-failure.html?error=" + e.getMessage());
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

    /**
     * Endpoint para cancelar una transacción Webpay.
     * El usuario puede acceder a esta URL para cancelar el pago antes de completarlo.
     * 
     * @param token El token opcional de la transacción a cancelar
     * @return Redirige a la página de cancelación
     */
    @GetMapping("/cancel")
    public RedirectView cancelWebpayTransaction(@RequestParam(value = "token", required = false) String token) {
        // Registrar la cancelación (opcional - para logs/auditoría)
        try {
            if (token != null && !token.isEmpty()) {
                // Si hay un token, podrías intentar anular la transacción
                // webpayService.cancelTransaction(token); // Implementar si es necesario
                System.out.println("🚫 Usuario canceló transacción con token: " + token);
            } else {
                System.out.println("🚫 Usuario canceló transacción sin token");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error al procesar cancelación: " + e.getMessage());
        }
        
        // Redirigir a la página de cancelación
        return new RedirectView("/webpay-cancel.html" + (token != null ? "?token=" + token : ""));
    }

    /**
     * Endpoint API para cancelar desde JavaScript
     * @param requestBody Datos de la cancelación
     * @return Respuesta JSON
     */
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancelWebpayTransactionAPI(@RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String token = requestBody != null ? requestBody.get("token") : null;
            String reason = requestBody != null ? requestBody.get("reason") : "Usuario canceló";
            
            if (token != null && !token.isEmpty()) {
                System.out.println("🚫 API: Usuario canceló transacción con token: " + token + " - Razón: " + reason);
            } else {
                System.out.println("🚫 API: Usuario canceló transacción - Razón: " + reason);
            }
            
            return ResponseEntity.ok(Map.of(
                "status", "cancelled",
                "message", "Transacción cancelada exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Error al cancelar la transacción",
                "details", e.getMessage()
            ));
        }
    }

    // Opcional: Si Transbank redirige por POST, puedes usar un @PostMapping
    // @PostMapping("/commit")
    // public RedirectView commitWebpayTransactionPost(@RequestBody Map<String, String> body) {
    //     String tokenWs = body.get("token_ws"); // Asumiendo que el token viene en el cuerpo
    //     // ... misma lógica que el método GET ...
    // }
}