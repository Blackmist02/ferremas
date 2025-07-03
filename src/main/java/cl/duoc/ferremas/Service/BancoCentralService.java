package cl.duoc.ferremas.Service;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@Service
public class BancoCentralService {

    @Value("${banco-central.user:inachiomella.2008@gmail.com}")
    private String user;
    
    @Value("${banco-central.password:Blackmist.2}")
    private String password;
    
    private static final String BASE_URL = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DivisaDTO {
        private String codigo;
        private String nombre;
        private String fecha;
        private Double valor;
    }

    // Solo este método que realmente usas
    public List<DivisaDTO> obtenerDivisasPrincipales() {
        List<DivisaDTO> resultado = new ArrayList<>();
        
        try {
            // Solo USD y EUR que usas en el carrito
            Map<String, String> seriesPrincipales = new LinkedHashMap<>();
            seriesPrincipales.put("F073.TCO.PRE.Z.D", "Dólar estadounidense (USD)");
            seriesPrincipales.put("F072.CLP.EUR.N.O.D", "Euro (EUR)");
            
            RestTemplate restTemplate = new RestTemplate();
            String fechaHoy = LocalDate.now().toString();
            String fechaInicio = LocalDate.now().minusDays(30).toString();
            
            System.out.println("Obteniendo divisas para el carrito: USD y EUR");
            
            for (Map.Entry<String, String> entry : seriesPrincipales.entrySet()) {
                procesarSerieTipoCambio(entry.getKey(), entry.getValue(), fechaInicio, fechaHoy, resultado, restTemplate);
                Thread.sleep(150); // Pausa para no sobrecargar la API
            }
            
        } catch (Exception e) {
            System.err.println("Error al obtener divisas principales: " + e.getMessage());
        }

        return resultado;
    }

    private void procesarSerieTipoCambio(String seriesId, String nombre, String fechaInicio, String fechaHoy, List<DivisaDTO> resultado, RestTemplate restTemplate) {
        try {
            String getUrl = String.format(
                    "%s?user=%s&pass=%s&function=GetSeries&timeseries=%s&firstdate=%s&lastdate=%s",
                    BASE_URL, user, password, seriesId, fechaInicio, fechaHoy);

            System.out.println("Consultando serie: " + seriesId + " - " + nombre);
            
            String getResponse = restTemplate.getForObject(getUrl, String.class);
            
            if (getResponse == null || getResponse.trim().isEmpty()) {
                System.out.println("Respuesta vacía para serie: " + seriesId);
                return;
            }
            
            JSONObject responseJson = new JSONObject(getResponse);
            
            // Verificar si hay errores en la respuesta
            if (responseJson.has("error")) {
                System.out.println("Error en serie " + seriesId + ": " + responseJson.getString("error"));
                return;
            }
            
            Object seriesDataObj = responseJson.opt("Series");
            if (seriesDataObj == null) {
                System.out.println("No hay datos 'Series' para: " + seriesId);
                // Corregir la impresión del iterator
                StringBuilder keys = new StringBuilder();
                responseJson.keys().forEachRemaining(key -> keys.append(key).append(", "));
                System.out.println("Claves disponibles en la respuesta: " + keys.toString());
                return;
            }
            
            JSONArray seriesData;
            if (seriesDataObj instanceof JSONArray) {
                seriesData = (JSONArray) seriesDataObj;
                System.out.println("Series es un array con " + seriesData.length() + " elementos");
            } else if (seriesDataObj instanceof JSONObject) {
                seriesData = new JSONArray();
                seriesData.put(seriesDataObj);
                System.out.println("Series es un objeto, convertido a array");
            } else {
                System.out.println("Formato de datos desconocido para: " + seriesId + ", tipo: " + seriesDataObj.getClass());
                return;
            }

            if (seriesData.length() > 0) {
                JSONObject serieData = seriesData.getJSONObject(0);
                
                // Corregir la impresión de claves
                StringBuilder serieKeys = new StringBuilder();
                serieData.keys().forEachRemaining(key -> serieKeys.append(key).append(", "));
                System.out.println("Claves en serieData: " + serieKeys.toString());
                
                JSONArray obs = serieData.optJSONArray("obs");
                if (obs == null) {
                    obs = serieData.optJSONArray("Obs");
                    if (obs == null) {
                        obs = serieData.optJSONArray("observations");
                        if (obs == null) {
                            System.out.println("No se encontró campo de observaciones. Campos disponibles: " + serieKeys.toString());
                            return;
                        }
                    }
                }
                
                System.out.println("Número de observaciones encontradas: " + obs.length());
                
                if (obs.length() > 0) {
                    // Filtrar observaciones válidas (no NaN y statusCode OK)
                    JSONObject ultimaObsValida = null;
                    String fechaValor = "";
                    
                    // Buscar la última observación válida
                    for (int i = obs.length() - 1; i >= 0; i--) {
                        JSONObject observacion = obs.getJSONObject(i);
                        String statusCode = observacion.optString("statusCode", "");
                        String valueStr = observacion.optString("value", "");
                        
                        // Solo procesar si no es NaN y el status es OK
                        if (!"NaN".equals(valueStr) && "OK".equals(statusCode) && !observacion.isNull("value")) {
                            ultimaObsValida = observacion;
                            fechaValor = observacion.optString("indexDateString", "");
                            break;
                        }
                    }
                    
                    if (ultimaObsValida != null) {
                        double valor = ultimaObsValida.getDouble("value");
                        
                        if (valor > 0) {
                            resultado.add(new DivisaDTO(seriesId, nombre, fechaValor, valor));
                            System.out.println("✓ " + nombre + ": $" + String.format("%.2f", valor) + " (" + fechaValor + ")");
                        } else {
                            System.out.println("Valor inválido (<=0): " + valor);
                        }
                    } else {
                        System.out.println("No se encontraron observaciones válidas para: " + seriesId);
                    }
                } else {
                    System.out.println("No hay observaciones para: " + seriesId);
                }
            } else {
                System.out.println("No hay datos de series para: " + seriesId);
            }
            
        } catch (Exception e) {
            System.err.println("Error al procesar serie " + seriesId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}