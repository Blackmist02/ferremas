package cl.duoc.ferremas.Controller;

import cl.duoc.ferremas.Service.BancoCentralService;
import cl.duoc.ferremas.Service.BancoCentralService.DivisaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/divisas")
@CrossOrigin(origins = "*")
public class DivisasController {

    @Autowired
    private BancoCentralService bancoCentralService;

    @GetMapping("/ultimas")
    public ResponseEntity<List<DivisaDTO>> obtenerUltimosValoresDivisas() {
        try {
            List<DivisaDTO> resultado = bancoCentralService.obtenerUltimosValoresDivisas();
            
            if (resultado.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/principales")
    public ResponseEntity<List<DivisaDTO>> obtenerDivisasPrincipales() {
        try {
            List<DivisaDTO> resultado = bancoCentralService.obtenerDivisasPrincipales();
            
            if (resultado.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/uf")
    public ResponseEntity<DivisaDTO> obtenerUF() {
        try {
            List<DivisaDTO> divisas = bancoCentralService.obtenerDivisasPrincipales();
            
            DivisaDTO uf = divisas.stream()
                .filter(d -> d.getCodigo().contains("UF"))
                .findFirst()
                .orElse(null);
                
            if (uf == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(uf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/euro")
    public ResponseEntity<DivisaDTO> obtenerEuro() {
        try {
            List<DivisaDTO> divisas = bancoCentralService.obtenerDivisasPrincipales();
            
            DivisaDTO euro = divisas.stream()
                .filter(d -> d.getCodigo().contains("EUR"))
                .findFirst()
                .orElse(null);
                
            if (euro == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(euro);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/yen")
    public ResponseEntity<DivisaDTO> obtenerYen() {
        try {
            List<DivisaDTO> divisas = bancoCentralService.obtenerDivisasPrincipales();
            
            DivisaDTO yen = divisas.stream()
                .filter(d -> d.getCodigo().contains("JPY"))
                .findFirst()
                .orElse(null);
                
            if (yen == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(yen);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ver")
    @ResponseBody
    public String verDivisasHTML() {
        try {
            List<DivisaDTO> divisas = bancoCentralService.obtenerUltimosValoresDivisas();
            
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>");
            html.append("<html lang='es'>");
            html.append("<head>");
            html.append("<meta charset='UTF-8'>");
            html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
            html.append("<title>Divisas - FerreMax</title>");
            html.append("<style>");
            html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }");
            html.append(".container { max-width: 1400px; margin: 0 auto; }");
            html.append(".header { text-align: center; color: white; margin-bottom: 40px; }");
            html.append(".header h1 { font-size: 3.2em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }");
            html.append(".header p { font-size: 1.2em; opacity: 0.9; }");
            html.append(".divisas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; }");
            html.append(".divisa-card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: all 0.3s ease; position: relative; overflow: hidden; }");
            html.append(".divisa-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }");
            html.append(".divisa-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2); }");
            html.append(".divisa-name { font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }");
            html.append(".divisa-value { font-size: 2.1em; font-weight: bold; color: #2563eb; margin-bottom: 15px; }");
            html.append(".divisa-info { color: #666; margin: 8px 0; font-size: 0.95em; display: flex; justify-content: space-between; }");
            html.append(".divisa-code { background: #f8f9fa; padding: 5px 10px; border-radius: 5px; font-family: monospace; font-size: 0.8em; color: #495057; }");
            html.append(".divisa-date { color: #6c757d; font-size: 0.9em; }");
            html.append(".timestamp { text-align: center; color: rgba(255,255,255,0.9); margin-top: 40px; font-size: 1.1em; }");
            html.append(".no-data { text-align: center; color: white; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; }");
            html.append(".stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap; }");
            html.append(".stat-item { background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 10px; text-align: center; color: white; min-width: 120px; }");
            html.append(".stat-number { font-size: 1.8em; font-weight: bold; }");
            html.append(".stat-label { font-size: 0.9em; opacity: 0.8; }");
            html.append(".refresh-info { text-align: center; color: rgba(255,255,255,0.8); margin-top: 20px; font-size: 0.9em; }");
            html.append("@media (max-width: 768px) { .divisas-grid { grid-template-columns: 1fr; } .header h1 { font-size: 2.5em; } .stats { flex-direction: column; align-items: center; } }");
            html.append("</style>");
            html.append("</head>");
            html.append("<body>");
            html.append("<div class='container'>");
            html.append("<div class='header'>");
            html.append("<h1>💰 Tipos de Cambio</h1>");
            html.append("<p>FerreMax - Información del Banco Central de Chile</p>");
            html.append("</div>");
            
            if (divisas.isEmpty()) {
                html.append("<div class='no-data'>");
                html.append("<h3>📊 No hay datos disponibles</h3>");
                html.append("<p>No se pudieron obtener los datos de divisas en este momento.</p>");
                html.append("<p>Por favor, intente más tarde o verifique la conexión.</p>");
                html.append("</div>");
            } else {
                // Estadísticas
                html.append("<div class='stats'>");
                html.append("<div class='stat-item'>");
                html.append("<div class='stat-number'>").append(divisas.size()).append("</div>");
                html.append("<div class='stat-label'>Divisas disponibles</div>");
                html.append("</div>");
                html.append("<div class='stat-item'>");
                html.append("<div class='stat-number'>").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM"))).append("</div>");
                html.append("<div class='stat-label'>Fecha actual</div>");
                html.append("</div>");
                html.append("<div class='stat-item'>");
                html.append("<div class='stat-number'>CLP</div>");
                html.append("<div class='stat-label'>Moneda base</div>");
                html.append("</div>");
                html.append("</div>");
                
                // Grid de divisas
                html.append("<div class='divisas-grid'>");
                for (DivisaDTO divisa : divisas) {
                    html.append("<div class='divisa-card'>");
                    html.append("<div class='divisa-name'>").append(divisa.getNombre()).append("</div>");
                    html.append("<div class='divisa-value'>$").append(formatearValor(divisa.getValor())).append("</div>");
                    html.append("<div class='divisa-info'>");
                    html.append("<span><strong>📋 Código:</strong></span>");
                    html.append("<span class='divisa-code'>").append(divisa.getCodigo()).append("</span>");
                    html.append("</div>");
                    html.append("<div class='divisa-info'>");
                    html.append("<span><strong>📅 Fecha:</strong></span>");
                    html.append("<span class='divisa-date'>").append(divisa.getFecha()).append("</span>");
                    html.append("</div>");
                    html.append("</div>");
                }
                html.append("</div>");
            }
            
            html.append("<div class='timestamp'>");
            html.append("<p>🕐 Última actualización: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))).append("</p>");
            html.append("</div>");
            
            html.append("<div class='refresh-info'>");
            html.append("<p>💡 Los datos se actualizan automáticamente desde el Banco Central de Chile</p>");
            html.append("</div>");
            
            html.append("</div>");
            html.append("</body>");
            html.append("</html>");
            
            return html.toString();
            
        } catch (Exception e) {
            return "<html><body style='font-family: Arial; padding: 40px; text-align: center; background: #f8f9fa;'>" +
                   "<h1 style='color: #dc3545;'>❌ Error</h1>" +
                   "<p style='color: #6c757d;'>No se pudieron obtener los datos: " + e.getMessage() + "</p>" +
                   "<a href='/api/divisas/ver' style='color: #007bff; text-decoration: none;'>🔄 Reintentar</a>" +
                   "</body></html>";
        }
    }

    @GetMapping("/debug")
    @ResponseBody
    public String debugAPI() {
        try {
            String fechaHoy = LocalDate.now().toString();
            String fechaInicio = LocalDate.now().minusDays(30).toString();
            
            StringBuilder html = new StringBuilder();
            html.append("<html><body style='font-family: monospace; padding: 20px; background: #f8f9fa;'>");
            html.append("<h1 style='color: #333;'>🔍 Debug API Banco Central</h1>");
            html.append("<div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>");
            html.append("<h2>Información de conexión:</h2>");
            html.append("<p><strong>URL Base:</strong> https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx</p>");
            html.append("<p><strong>Usuario:</strong> inachiomella.2008@gmail.com</p>");
            html.append("<p><strong>Fecha inicio:</strong> ").append(fechaInicio).append("</p>");
            html.append("<p><strong>Fecha fin:</strong> ").append(fechaHoy).append("</p>");
            html.append("</div>");
            
            html.append("<div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>");
            html.append("<h2>Resultados de divisas principales:</h2>");
            List<DivisaDTO> divisas = bancoCentralService.obtenerDivisasPrincipales();
            
            if (divisas.isEmpty()) {
                html.append("<p style='color: #dc3545;'>❌ No se obtuvieron divisas</p>");
            } else {
                html.append("<p style='color: #28a745;'>✅ Se obtuvieron ").append(divisas.size()).append(" divisas:</p>");
                html.append("<ul style='line-height: 1.6;'>");
                for (DivisaDTO divisa : divisas) {
                    html.append("<li><strong>").append(divisa.getNombre()).append(":</strong> $")
                        .append(formatearValor(divisa.getValor()))
                        .append(" CLP <em>(").append(divisa.getFecha()).append(")</em></li>");
                }
                html.append("</ul>");
            }
            html.append("</div>");
            
            // Test de conexión simple
            html.append("<div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>");
            html.append("<h2>Test de conexión:</h2>");
            try {
                RestTemplate restTemplate = new RestTemplate();
                String testUrl = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=inachiomella.2008@gmail.com&pass=Blackmist.2&function=GetSeries&timeseries=F073.TCO.PRE.Z.D&firstdate=" + fechaInicio + "&lastdate=" + fechaHoy;
                String response = restTemplate.getForObject(testUrl, String.class);
                
                if (response != null && response.length() > 0) {
                    html.append("<p style='color: #28a745;'>✅ Conexión exitosa</p>");
                    html.append("<p><strong>Tamaño respuesta:</strong> ").append(response.length()).append(" caracteres</p>");
                    html.append("<details><summary>Ver respuesta completa</summary>");
                    html.append("<pre style='background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 0.8em;'>")
                        .append(response.substring(0, Math.min(2000, response.length())))
                        .append(response.length() > 2000 ? "\n... (truncado)" : "")
                        .append("</pre></details>");
                } else {
                    html.append("<p style='color: #dc3545;'>❌ Respuesta vacía</p>");
                }
            } catch (Exception e) {
                html.append("<p style='color: #dc3545;'>❌ Error de conexión: ").append(e.getMessage()).append("</p>");
            }
            html.append("</div>");
            
            html.append("<div style='text-align: center; margin-top: 30px;'>");
            html.append("<a href='/api/divisas/ver' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🔙 Volver a divisas</a>");
            html.append("</div>");
            
            html.append("</body></html>");
            return html.toString();
            
        } catch (Exception e) {
            return "<html><body><h1>Error en Debug</h1><p>" + e.getMessage() + "</p></body></html>";
        }
    }

    // Método auxiliar para formatear valores
    private String formatearValor(double valor) {
        if (valor >= 1000) {
            return String.format("%.2f", valor);
        } else if (valor >= 1) {
            return String.format("%.4f", valor);
        } else {
            return String.format("%.6f", valor);
        }
    }
}