package cl.duoc.ferremas.Service; // Asegúrate de que el paquete sea correcto

import cl.duoc.ferremas.config.WebpayConfig; // Importa tu clase de configuración
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate; // O usa WebClient si configuraste spring-boot-starter-webflux

import java.util.HashMap;
import java.util.Map;

@Service
public class WebpayService {

    private final RestTemplate restTemplate; // Puedes usar WebClient webClient; si lo prefieres
    private final WebpayConfig webpayConfig;

    // Constructor para inyectar RestTemplate (o WebClient) y WebpayConfig
    public WebpayService(RestTemplate restTemplate, WebpayConfig webpayConfig) {
        this.restTemplate = restTemplate;
        this.webpayConfig = webpayConfig;
    }

    /**
     * Inicia una transacción Webpay Plus.
     * Llama al endpoint POST /rswebpayTransaction/api/webpay/v1.2/transactions de Transbank.
     * @param amount Monto de la transacción.
     * @param buyOrder Número de orden de compra único.
     * @param sessionId Identificador de sesión.
     * @param returnUrl URL a la que Transbank redirigirá después de la transacción.
     * @return Un mapa con el "token" de la transacción y la "url" de redirección de Webpay.
     */
    public Map<String, String> createTransaction(double amount, String buyOrder, String sessionId, String returnUrl) {
        String url = webpayConfig.getIntegrationUrl(); // O .getProductionUrl() si estás en producción

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Tbk-Api-Key-Id", "597055555532");
        headers.set("Tbk-Api-Key-Secret", "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("buy_order", buyOrder);
        requestBody.put("session_id", sessionId);
        requestBody.put("amount", amount);
        requestBody.put("return_url", returnUrl); // MUY IMPORTANTE: debe ser una URL accesible por Transbank

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, String> result = new HashMap<>();
                Map<String, Object> responseBody = response.getBody();
                
                String token = (String) responseBody.get("token");
                String webpayUrl = (String) responseBody.get("url");
                
                result.put("token", token);
                result.put("url", webpayUrl);
                // Agregar URL completa con el token
                result.put("fullUrl", webpayUrl + "?token_ws=" + token);
                return result;
            } else {
                // Manejo de errores si la API de Transbank devuelve un código de estado no exitoso
                System.err.println("Error al crear transacción Webpay: " + response.getStatusCode() + " - " + response.getBody());
                throw new RuntimeException("Fallo al crear transacción Webpay.");
            }
        } catch (org.springframework.web.client.RestClientException e) {
            // Manejo de excepciones de red o de cliente REST
            System.err.println("Excepción al comunicarse con Transbank: " + e.getMessage());
            throw new RuntimeException("Error de comunicación con Transbank al crear transacción.", e);
        }
    }

    /**
     * Confirma una transacción Webpay Plus después de que el usuario regresa de Transbank.
     * Llama al endpoint PUT /rswebpayTransaction/api/webpay/v1.2/transactions/{token} de Transbank.
     * @param tokenWs El token que Transbank envía de vuelta en la URL.
     * @return Un mapa con los detalles de la transacción confirmada (estado, tipo de pago, etc.).
     */
    public Map<String, Object> commitTransaction(String tokenWs) {
        String url = webpayConfig.getIntegrationUrl() + "/" + tokenWs; // La URL incluye el token

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Tbk-Api-Key-Id", webpayConfig.getApiKeyId());
        headers.set("Tbk-Api-Key-Secret", webpayConfig.getApiKeySecret());

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers); // Para PUT sin cuerpo

        try {
            // Realiza la llamada HTTP PUT a Transbank para confirmar
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Aquí recibes el resultado final de la transacción (aprobada/rechazada, datos de la tarjeta, etc.)
                return response.getBody();
            } else {
                System.err.println("Error al confirmar transacción Webpay: " + response.getStatusCode() + " - " + response.getBody());
                throw new RuntimeException("Fallo al confirmar transacción Webpay.");
            }
        } catch (org.springframework.web.client.RestClientException e) {
            System.err.println("Excepción al comunicarse con Transbank: " + e.getMessage());
            throw new RuntimeException("Error de comunicación con Transbank al confirmar transacción.", e);
        }
    }

    // Opcional: Puedes agregar otros métodos para anular transacciones, consultar estado, etc.
    // Public Map<String, Object> refundTransaction(String tokenWs, double amount) { ... }
    // Public Map<String, Object> getTransactionStatus(String tokenWs) { ... }
}