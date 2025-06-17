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

    public List<DivisaDTO> obtenerUltimosValoresDivisas() {
    List<DivisaDTO> resultado = new ArrayList<>();
    
    try {
        // Series específicas de tipos de cambio del Banco Central de Chile
        Map<String, String> seriesTiposCambio = new LinkedHashMap<>();
        
        // Series de tipos de cambio CLP a otras monedas
        seriesTiposCambio.put("F072.CLP.SAR.N.O.D", "Riyal saudí");
        seriesTiposCambio.put("F072.CLP.ARS.N.O.D", "Peso argentino");
        seriesTiposCambio.put("F072.CLP.AUD.N.O.D", "Dólar australiano");
        seriesTiposCambio.put("F072.CLP.BSP.N.O.D", "Peso filipino");
        seriesTiposCambio.put("F072.CLP.BMD.N.O.D", "Dólar bermudeño");
        seriesTiposCambio.put("F072.CLP.BOL.N.O.D", "Boliviano boliviano");
        seriesTiposCambio.put("F072.CLP.BRL.N.O.D", "Real brasileño");
        seriesTiposCambio.put("F072.CLP.CAD.N.O.D", "Dólar canadiense");
        seriesTiposCambio.put("F072.CLP.QAR.N.O.D", "Riyal catarí");
        seriesTiposCambio.put("F072.CLP.CNY.N.O.D", "Yuan chino");
        seriesTiposCambio.put("F072.CLP.COP.N.O.D", "Peso colombiano");
        seriesTiposCambio.put("F072.CLP.KRW.N.O.D", "Won surcoreano");
        seriesTiposCambio.put("F072.CLP.CRC.N.O.D", "Colón costarricense");
        seriesTiposCambio.put("F072.CLP.CUP.N.O.D", "Peso cubano");
        seriesTiposCambio.put("F072.CLP.DEG.N.O.D", "Deg");
        seriesTiposCambio.put("F072.CLP.DKK.N.O.D", "Corona danesa");
        seriesTiposCambio.put("F072.CLP.EGP.N.O.D", "Libra egipcia");
        seriesTiposCambio.put("F072.CLP.AED.N.O.D", "Dirham de EAU");
        seriesTiposCambio.put("F073.TCO.PRE.Z.D", "Dólar observado");
        seriesTiposCambio.put("F072.CLP.EUR.N.O.D", "Euro");
        seriesTiposCambio.put("F072.CLP.PHP.N.O.D", "Peso filipino");
        seriesTiposCambio.put("F072.CLP.FJD.N.O.D", "Dólar fiyiano");
        seriesTiposCambio.put("F072.CLP.XPF.N.O.D", "Franco CFP");
        seriesTiposCambio.put("F072.CLP.GTQ.N.O.D", "Quetzal guatemalteco");
        seriesTiposCambio.put("F072.CLP.HKD.N.O.D", "Dólar de Hong Kong");
        seriesTiposCambio.put("F072.CLP.HUF.N.O.D", "Forinto húngaro");
        seriesTiposCambio.put("F072.CLP.INR.N.O.D", "Rupia india");
        seriesTiposCambio.put("F072.CLP.IDR.N.O.D", "Rupia indonesia");
        seriesTiposCambio.put("F072.CLP.IRR.N.O.D", "Rial iraní");
        seriesTiposCambio.put("F072.CLP.ISK.N.O.D", "Corona islandesa");
        seriesTiposCambio.put("F072.CLP.KYD.N.O.D", "Dólar caimán");
        seriesTiposCambio.put("F072.CLP.ILS.N.O.D", "Nuevo shéquel israelí");
        seriesTiposCambio.put("F072.CLP.JPY.N.O.D", "Yen japonés");
        seriesTiposCambio.put("F072.CLP.KZT.N.O.D", "Tenge kazajo");
        seriesTiposCambio.put("F072.CLP.MYR.N.O.D", "Ringgit malayo");
        seriesTiposCambio.put("F072.CLP.MAD.N.O.D", "Dirham marroquí");
        seriesTiposCambio.put("F072.CLP.MXN.N.O.D", "Peso mexicano");
        seriesTiposCambio.put("F072.CLP.NOK.N.O.D", "Corona noruega");
        seriesTiposCambio.put("F072.CLP.NZD.N.O.D", "Dólar neozelandés");
        seriesTiposCambio.put("F072.CLP.PKR.N.O.D", "Rupia pakistaní");
        seriesTiposCambio.put("F072.CLP.PAB.N.O.D", "Balboa panameño");
        seriesTiposCambio.put("F072.CLP.PYG.N.O.D", "Guaraní paraguayo");
        seriesTiposCambio.put("F072.CLP.PEN.N.O.D", "Sol peruano");
        seriesTiposCambio.put("F072.CLP.PLN.N.O.D", "Zloty polaco");
        seriesTiposCambio.put("F072.CLP.GBP.N.O.D", "Libra esterlina");
        seriesTiposCambio.put("F072.CLP.CZK.N.O.D", "Corona checa");
        seriesTiposCambio.put("F072.CLP.DOP.N.O.D", "Peso dominicano");
        seriesTiposCambio.put("F072.CLP.RON.N.O.D", "Leu rumano");
        seriesTiposCambio.put("F072.CLP.RUR.N.O.D", "Rublo ruso");
        seriesTiposCambio.put("F072.CLP.SGD.N.O.D", "Dólar singapurense");
        seriesTiposCambio.put("F072.CLP.ZAR.N.O.D", "Rand sudafricano");
        seriesTiposCambio.put("F072.CLP.SEK.N.O.D", "Corona sueca");
        seriesTiposCambio.put("F072.CLP.CHF.N.O.D", "Franco suizo");
        seriesTiposCambio.put("F072.CLP.THB.N.O.D", "Baht tailandés");
        seriesTiposCambio.put("F072.CLP.TWD.N.O.D", "Nuevo dólar taiwanés");
        seriesTiposCambio.put("F072.CLP.TRY.N.O.D", "Lira turca");
        seriesTiposCambio.put("F072.CLP.UAH.N.O.D", "Grivna ucraniana");
        seriesTiposCambio.put("F072.CLP.UYU.N.O.D", "Peso uruguayo");
        seriesTiposCambio.put("F072.CLP.VEB.N.O.D", "Bolívar venezolano");
        seriesTiposCambio.put("F072.CLP.VND.N.O.D", "Dong vietnamita");
        
        RestTemplate restTemplate = new RestTemplate();
        
        // Usar un rango más amplio de fechas (últimos 60 días)
        String fechaHoy = LocalDate.now().toString();
        String fechaInicio = LocalDate.now().minusDays(60).toString();
        
        System.out.println("Obteniendo tipos de cambio desde: " + fechaInicio + " hasta: " + fechaHoy);
        System.out.println("Procesando " + seriesTiposCambio.size() + " series de divisas...");
        
        // Procesar cada serie de tipo de cambio
        int contador = 0;
        for (Map.Entry<String, String> entry : seriesTiposCambio.entrySet()) {
            contador++;
            System.out.println("--- Procesando " + contador + "/" + seriesTiposCambio.size() + " ---");
            procesarSerieTipoCambio(entry.getKey(), entry.getValue(), fechaInicio, fechaHoy, resultado, restTemplate);
            
            // Pequeña pausa para no sobrecargar la API (100ms entre consultas)
            Thread.sleep(100);
        }
        
        System.out.println("=== RESUMEN ===");
        System.out.println("Total de divisas obtenidas: " + resultado.size());
        for (DivisaDTO divisa : resultado) {
            System.out.println("- " + divisa.getNombre() + ": $" + String.format("%.4f", divisa.getValor()));
        }
        
    } catch (Exception e) {
        System.err.println("Error al obtener datos del Banco Central: " + e.getMessage());
        e.printStackTrace();
    }

    return resultado;
}

// Método para obtener solo las divisas más importantes (más rápido)
public List<DivisaDTO> obtenerDivisasPrincipales() {
    List<DivisaDTO> resultado = new ArrayList<>();
    
    try {
        // Solo las 5 divisas más importantes
        Map<String, String> seriesPrincipales = new LinkedHashMap<>();
        seriesPrincipales.put("F073.TCO.PRE.Z.D", "Dólar observado");
        seriesPrincipales.put("F073.UF.CLP.D", "Unidad de Fomento (UF)");
        seriesPrincipales.put("F072.EUR.USD.N.O.D", "Euro");
        seriesPrincipales.put("F072.GBP.USD.N.O.D", "Libra esterlina");
        seriesPrincipales.put("F072.BRL.USD.N.O.D", "Real brasileño");
        
        RestTemplate restTemplate = new RestTemplate();
        String fechaHoy = LocalDate.now().toString();
        String fechaInicio = LocalDate.now().minusDays(30).toString();
        
        System.out.println("Obteniendo divisas principales...");
        
        for (Map.Entry<String, String> entry : seriesPrincipales.entrySet()) {
            procesarSerieTipoCambio(entry.getKey(), entry.getValue(), fechaInicio, fechaHoy, resultado, restTemplate);
            Thread.sleep(50); // Pausa más corta
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
        System.out.println("URL: " + getUrl);
        
        String getResponse = restTemplate.getForObject(getUrl, String.class);
        
        if (getResponse == null || getResponse.trim().isEmpty()) {
            System.out.println("Respuesta vacía para serie: " + seriesId);
            return;
        }
        
        System.out.println("Respuesta recibida (primeros 500 caracteres): " + 
                          getResponse.substring(0, Math.min(500, getResponse.length())));
        
        JSONObject responseJson = new JSONObject(getResponse);
        
        // Verificar si hay errores en la respuesta
        if (responseJson.has("error")) {
            System.out.println("Error en serie " + seriesId + ": " + responseJson.getString("error"));
            return;
        }
        
        Object seriesDataObj = responseJson.opt("Series");
        if (seriesDataObj == null) {
            System.out.println("No hay datos 'Series' para: " + seriesId);
            System.out.println("Claves disponibles en la respuesta: " + responseJson.keys());
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
            System.out.println("Claves en serieData: " + serieData.keys());
            
            JSONArray obs = serieData.optJSONArray("obs");
            if (obs == null) {
                // Probar con diferentes nombres de campo
                obs = serieData.optJSONArray("Obs");
                if (obs == null) {
                    obs = serieData.optJSONArray("observations");
                    if (obs == null) {
                        System.out.println("No se encontró campo de observaciones. Campos disponibles: " + serieData.keys());
                        return;
                    }
                }
            }
            
            System.out.println("Número de observaciones encontradas: " + obs.length());
            
            if (obs.length() > 0) {
                // Mostrar las últimas 3 observaciones para debug
                for (int i = Math.max(0, obs.length() - 3); i < obs.length(); i++) {
                    JSONObject observacion = obs.getJSONObject(i);
                    System.out.println("Obs " + i + ": " + observacion.toString());
                }
                
                // Tomar la última observación
                JSONObject ultimaObs = obs.getJSONObject(obs.length() - 1);
                String fechaValor = ultimaObs.optString("indexDateString", "");
                
                if (!ultimaObs.isNull("value")) {
                    double valor = ultimaObs.getDouble("value");
                    
                    if (valor > 0) {
                        resultado.add(new DivisaDTO(seriesId, nombre, fechaValor, valor));
                        System.out.println("✓ " + nombre + ": $" + String.format("%.2f", valor) + " (" + fechaValor + ")");
                    } else {
                        System.out.println("Valor inválido (<=0): " + valor);
                    }
                } else {
                    System.out.println("Valor es null en la observación");
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