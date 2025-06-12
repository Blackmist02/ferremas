package cl.duoc.ferremas.config; 

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WebpayConfig {

    @Value("${transbank.webpay.commerce-code}")
    private String commerceCode;

    @Value("${transbank.webpay.api-key-id}")
    private String apiKeyId;

    @Value("${transbank.webpay.api-key-secret}")
    private String apiKeySecret;

    @Value("${transbank.webpay.integration-url}")
    private String integrationUrl; // URL base de la API de Transbank (ej. sandbox o producción)

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getCommerceCode() {
        return commerceCode;
    }

    public String getApiKeyId() {
        return apiKeyId;
    }

    public String getApiKeySecret() {
        return apiKeySecret;
    }

    public String getIntegrationUrl() {
        return integrationUrl;
    }
}