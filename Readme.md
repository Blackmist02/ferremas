# Documentación del Proyecto Ferremas

## Descripción
Ferremas es una aplicación web completa desarrollada en Java utilizando Spring Boot para el backend y tecnologías web modernas para el frontend. La aplicación gestiona un sistema de ferretería que incluye productos, usuarios, pagos con Webpay, divisas internacionales y generación de boletas.

## Tecnologías Utilizadas

### Backend
- **Java 17**: Lenguaje de programación principal
- **Spring Boot 3.x**: Framework para desarrollo de aplicaciones
- **Spring Data JPA**: Persistencia de datos con JPA/Hibernate
- **Spring Security**: Seguridad y autenticación básica
- **MySQL**: Base de datos relacional principal
- **RestTemplate**: Cliente HTTP para integración con APIs externas
- **Lombok**: Reducción de código boilerplate
- **JUnit 5**: Framework para pruebas unitarias

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**: Tecnologías web modernas
- **Tailwind CSS**: Framework de CSS para diseño responsivo
- **LocalStorage**: Gestión de sesiones y carrito de compras
- **Fetch API**: Comunicación asíncrona con el backend

### Integraciones Externas
- **Transbank Webpay Plus**: Sistema de pagos chileno
- **Banco Central de Chile API**: Tipos de cambio de divisas
- **JSONObject**: Procesamiento de datos JSON

## Funcionalidades Principales

### 🔨 Gestión de Productos
- **CRUD completo** de productos con código único
- **Control de stock** con validación de concurrencia
- **Precios históricos** con fechas
- **Búsqueda por código** y código de producto
- **Paginación** de resultados

### 👥 Gestión de Usuarios
- **Registro y login** de usuarios
- **Autenticación básica** con Spring Security
- **Gestión de sesiones** en frontend
- **Validación de credenciales**

### 💱 Sistema de Divisas
- **Integración con Banco Central de Chile**
- **Conversión automática** CLP, USD, EUR
- **Tasas de cambio en tiempo real**
- **Manejo de errores** con valores de fallback

### 💳 Sistema de Pagos
- **Integración con Webpay Plus** de Transbank
- **Procesamiento seguro** de transacciones
- **Manejo de respuestas** exitosas y fallidas
- **Restauración de stock** en caso de error

### 🛒 Carrito de Compras
- **Gestión de productos** en LocalStorage
- **Cálculo automático** de totales
- **Visualización en múltiples monedas**
- **Proceso de checkout** completo

### 📋 Sistema de Boletas
- **Generación automática** de boletas
- **Almacenamiento persistente** en base de datos
- **Listado con autenticación** básica

## Estructura del Proyecto

```
ferremas/
├── src/
│   ├── main/
│   │   ├── java/cl/duoc/ferremas/
│   │   │   ├── Controller/          # Controladores REST
│   │   │   │   ├── ProductoController.java
│   │   │   │   ├── UsuarioController.java
│   │   │   │   ├── DivisasController.java
│   │   │   │   ├── WebpayController.java
│   │   │   │   └── BoletaController.java
│   │   │   ├── Service/            # Lógica de negocio
│   │   │   │   ├── ProductoService.java
│   │   │   │   ├── BancoCentralService.java
│   │   │   │   ├── WebpayService.java
│   │   │   │   └── UsuarioService.java
│   │   │   ├── Model/              # Entidades JPA
│   │   │   │   ├── Productos.java
│   │   │   │   ├── Usuario.java
│   │   │   │   ├── Boleta.java
│   │   │   │   └── Sucursal.java
│   │   │   ├── Repository/         # Repositorios JPA
│   │   │   │   ├── ProductosRepository.java
│   │   │   │   ├── UsuarioRepository.java
│   │   │   │   └── BoletaRepository.java
│   │   │   ├── config/             # Configuraciones
│   │   │   │   ├── WebpayConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   └── FerremasApplication.java
│   │   └── resources/
│   │       ├── static/             # Frontend
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   │   ├── productos.js
│   │       │   │   ├── carrito.js
│   │       │   │   ├── main.js
│   │       │   │   └── session.js
│   │       │   ├── *.html          # Páginas web
│   │       │   └── img/
│   │       └── application.properties
│   └── test/                       # Pruebas unitarias
├── coleccionP.json                 # Colección Postman completa
├── pruebaPostman.json              # Pruebas de rendimiento
├── ejemplos.json                   # Datos de ejemplo
└── pom.xml                         # Dependencias Maven
```

## Endpoints de la API

### 🔨 Productos
```http
GET    /api/productos/producto           # Listar todos los productos
GET    /api/productos/{id}               # Obtener producto por ID
GET    /api/productos/codigo/{codigo}    # Obtener por código
GET    /api/productos/codigo-producto/{codigoProducto}  # Obtener por código de producto
POST   /api/productos/producto           # Crear producto
POST   /api/productos/productos          # Crear múltiples productos
POST   /api/productos/reducir-stock      # Reducir stock masivo
POST   /api/productos/restaurar-stock    # Restaurar stock
PUT    /api/productos/{id}/stock         # Actualizar stock individual
```

### 👥 Usuarios
```http
POST   /api/usuarios/registro            # Registrar usuario
POST   /api/usuarios/login               # Iniciar sesión
GET    /api/usuarios/usuario             # Listar usuarios
```

### 💱 Divisas
```http
GET    /api/divisas/tasas                # Obtener tasas optimizadas
GET    /api/divisas/principales          # Obtener divisas principales
```

### 💳 Webpay
```http
POST   /api/webpay/create                # Crear transacción
POST   /api/webpay/commit                # Confirmar transacción
```

### 📋 Boletas
```http
GET    /api/boleta/boleta                # Listar boletas (requiere auth)
POST   /api/boleta/boletas               # Crear boleta
```

## Configuración de Base de Datos

### application.properties
```properties
# Base de datos MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/ferremas_db
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Configuración del servidor
server.port=8081

# Configuración Webpay (Sandbox)
transbank.webpay.commerce-code=597055555532
transbank.webpay.api-key-id=597055555532
transbank.webpay.api-key-secret=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
transbank.webpay.integration-url=https://webpay3gint.transbank.cl

# Banco Central de Chile
banco-central.user=tu_email@ejemplo.com
banco-central.password=tu_password
```

## Instalación y Ejecución

### Prerrequisitos
- **Java 17** o superior
- **Maven 3.6+**
- **MySQL 8.0+**
- **Git**

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd ferremas
```

2. **Configurar base de datos**
```sql
CREATE DATABASE ferremas_db;
CREATE USER 'ferremas_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON ferremas_db.* TO 'ferremas_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configurar application.properties**
```bash
# Editar src/main/resources/application.properties
# Actualizar credenciales de BD, Webpay y Banco Central
```

4. **Compilar y ejecutar**
```bash
mvn clean install
mvn spring-boot:run
```

5. **Acceder a la aplicación**
```
http://localhost:8081
```

## Pruebas de la API

### Postman Collections
- **coleccionP.json**: Colección completa con todos los endpoints
- **pruebaPostman.json**: Pruebas de rendimiento y carga

### Datos de Prueba
- **ejemplos.json**: Productos de ejemplo para cargar
- **Tarjeta de prueba Webpay**: 4051885600446623, CVV: 123, Exp: 06/26

### Ejecutar pruebas
```bash
# Pruebas unitarias
mvn test

# Importar colecciones en Postman y ejecutar
```

## Monitoreo y Logs

### Logs importantes
```bash
# Ver logs en tiempo real
tail -f logs/spring.log

# Logs de divisas
grep "BancoCentralService" logs/spring.log

# Logs de Webpay
grep "WebpayService" logs/spring.log
```

### Métricas de rendimiento
- **Productos**: < 500ms promedio
- **Divisas**: < 2000ms (API externa)
- **Webpay**: < 5000ms (API externa)
- **Stock concurrente**: Validado con pruebas

## Problemas Comunes y Soluciones

### 1. Error de conversión de rutas
**Problema**: `Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'`
**Solución**: Verificar rutas específicas antes que genéricas en controladores

### 2. Stock insuficiente en concurrencia
**Problema**: Errores 400 en pruebas de carga
**Solución**: Implementado manejo de errores detallado y restauración de stock

### 3. API Banco Central lenta
**Problema**: Timeouts en divisas
**Solución**: Valores de fallback y caché implementado

### 4. Webpay en desarrollo
**Problema**: URLs locales no accesibles
**Solución**: Usar ngrok o URLs públicas para callbacks

## Datos de Contacto y Prueba

### Credenciales de prueba
```
# Usuario admin
Email: admin@ferremas.cl
Password: admin123

# Tarjeta Webpay (Sandbox)
Número: 4051885600446623
CVV: 123
Vencimiento: 06/26
RUT: 11.111.111-1
```

### URLs importantes
- **Aplicación**: http://localhost:8081
- **API Base**: http://localhost:8081/api
- **Banco Central**: https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx
- **Webpay Sandbox**: https://webpay3gint.transbank.cl

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

**Versión**: 2.3.0  
**Última actualización**: Enero 2025  
**Mantenido por**: Equipo Ferremas