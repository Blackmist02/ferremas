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
- **XAMPP**: Entorno de desarrollo local con Apache y MySQL
- **RestTemplate**: Cliente HTTP para integración con APIs externas
- **Lombok**: Reducción de código boilerplate
- **JUnit 5**: Framework para pruebas unitarias

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**: Tecnologías web modernas
- **Tailwind CSS**: Framework de CSS para diseño responsivo y moderno
- **LocalStorage**: Gestión de carrito de compras y datos temporales
- **Fetch API**: Comunicación asíncrona con el backend
- **Session Management**: Gestión híbrida de sesiones (backend + frontend)
- **Responsive Design**: Interfaz adaptable a dispositivos móviles
- **Error Handling**: Manejo robusto de errores y estados de carga

### Integraciones Externas
- **Transbank Webpay Plus**: Sistema de pagos chileno
- **Banco Central de Chile API**: Tipos de cambio de divisas
- **JSONObject**: Procesamiento de datos JSON

## Funcionalidades Principales

### 🔨 Gestión de Productos
- **CRUD completo** de productos con código único
- **Control de stock** con validación de concurrencia
- **Precios históricos** con fechas y múltiples precios por producto
- **Búsqueda por código** y código de producto
- **Paginación** de resultados con Spring Data
- **Visualización optimizada** con caché en frontend

### 👥 Gestión de Usuarios
- **Registro y login** de usuarios con validación
- **Autenticación HTTP Basic** con Spring Security para administradores
- **Gestión de sesiones** híbrida (backend + frontend)
- **Roles de usuario** (USER, ADMIN)
- **Verificación de sesión** asíncrona sin bloqueo en páginas públicas

### 💱 Sistema de Divisas
- **Integración con Banco Central de Chile**
- **Conversión automática** CLP, USD, EUR
- **Tasas de cambio en tiempo real** con caché optimizado
- **Manejo de errores** con valores de fallback
- **API optimizada** para reducir latencia

### 💳 Sistema de Pagos
- **Integración con Webpay Plus** de Transbank (Sandbox)
- **Procesamiento seguro** de transacciones
- **Manejo completo** de respuestas exitosas, fallidas y canceladas
- **Restauración automática de stock** en caso de error o cancelación
- **URLs de retorno** configurables para diferentes estados

### 🛒 Carrito de Compras
- **Gestión inteligente** en LocalStorage con sincronización
- **Cálculo automático** de totales con múltiples monedas
- **Visualización en tiempo real** de precios convertidos
- **Proceso de checkout** completo con validaciones
- **Manejo de stock insuficiente** y productos no disponibles

### 📋 Sistema de Boletas
- **Generación automática** de boletas post-compra
- **Almacenamiento persistente** en base de datos
- **Listado con autenticación** básica para administradores
- **Detalles completos** de transacciones

### 💬 Sistema de Mensajes
- **Gestión de mensajes** entre usuarios
- **Visualización de mensajes** propios y recibidos
- **Interfaz dedicada** para comunicación interna

### 🏢 Gestión de Sucursales
- **CRUD de sucursales** con información completa
- **Gestión administrativa** con autenticación requerida
- **Datos de contacto** y ubicación

### 🔧 Funcionalidades Administrativas
- **Panel de administración** con autenticación HTTP Basic
- **Limpieza de datos** y mantenimiento
- **Gestión de sesiones** y usuarios
- **Acceso restringido** solo para administradores

## Estructura del Proyecto

```
ferremas/
├── src/
│   ├── main/
│   │   ├── java/cl/duoc/ferremas/
│   │   │   ├── Controller/          # Controladores REST
│   │   │   │   ├── BoletaController.java
│   │   │   │   ├── CleanupController.java
│   │   │   │   ├── DivisasController.java
│   │   │   │   ├── MensajeController.java
│   │   │   │   ├── ProductoController.java
│   │   │   │   ├── SesionController.java
│   │   │   │   ├── SucursalController.java
│   │   │   │   ├── UsuarioController.java
│   │   │   │   ├── VistaController.java
│   │   │   │   └── WebpayController.java
│   │   │   ├── Service/            # Lógica de negocio
│   │   │   │   ├── BancoCentralService.java
│   │   │   │   ├── BoletaService.java
│   │   │   │   ├── ProductoService.java
│   │   │   │   ├── ProductoServiceImpl.java
│   │   │   │   ├── SucursalService.java
│   │   │   │   ├── UsuarioService.java
│   │   │   │   └── WebpayService.java
│   │   │   ├── Model/              # Entidades JPA
│   │   │   │   ├── Boleta.java
│   │   │   │   ├── Mensaje.java
│   │   │   │   ├── Productos.java
│   │   │   │   ├── Sucursal.java
│   │   │   │   └── Usuario.java
│   │   │   ├── Repository/         # Repositorios JPA
│   │   │   │   ├── BoletaRepository.java
│   │   │   │   ├── MensajeRepository.java
│   │   │   │   ├── ProductosRepository.java
│   │   │   │   ├── SucursalRepository.java
│   │   │   │   └── UsuarioRepository.java
│   │   │   ├── Security/           # Configuración de seguridad
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── UsuarioDetailsServiceImpl.java
│   │   │   ├── config/             # Configuraciones
│   │   │   │   ├── DataInitializer.java
│   │   │   │   └── WebpayConfig.java
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   │   └── WebpayRequestDto.java
│   │   │   └── FerremasApplication.java
│   │   └── resources/
│   │       ├── static/             # Frontend
│   │       │   ├── css/
│   │       │   │   └── styles.css
│   │       │   ├── js/
│   │       │   │   ├── carrito.js
│   │       │   │   ├── include-partials.js
│   │       │   │   ├── main.js
│   │       │   │   ├── productoInd.js
│   │       │   │   ├── productos.js
│   │       │   │   └── session.js
│   │       │   ├── img/
│   │       │   │   ├── logo.png
│   │       │   │   ├── herramienta-destacada.png
│   │       │   │   └── productos/
│   │       │   ├── partials/
│   │       │   │   ├── header.html
│   │       │   │   └── footer.html
│   │       │   ├── Administracion.html
│   │       │   ├── carrito.html
│   │       │   ├── index.html
│   │       │   ├── login.html
│   │       │   ├── mensajes.html
│   │       │   ├── mismensajes.html
│   │       │   ├── productoInd.html
│   │       │   ├── productos.html
│   │       │   ├── registro.html
│   │       │   ├── webpay-cancel.html
│   │       │   ├── webpay-failure.html
│   │       │   └── webpay-success.html
│   │       ├── ejemplos.json
│   │       └── application.properties
│   └── test/                       # Pruebas unitarias
│       └── java/cl/duoc/ferremas/
├── Modelo 4+1/                     # Documentación de arquitectura
│   ├── Escenarios (caso de uso).jpeg
│   ├── Vista de procesos 1.jpeg
│   ├── Vista de procesos 2.jpeg
│   ├── Vista de procesos 3.jpeg
│   ├── Vista de procesos 4.jpeg
│   ├── Vista de procesos 5.jpeg
│   ├── Vista de procesos.pdf
│   └── Vista fisica.pdf
├── coleccionP.json                 # Colección Postman completa
├── pruebaPostman.json              # Pruebas de rendimiento
├── ejemplos.json                   # Datos de ejemplo
├── mvnw                            # Maven Wrapper (Unix)
├── mvnw.cmd                        # Maven Wrapper (Windows)
├── pom.xml                         # Dependencias Maven
└── Readme.md                       # Este archivo
```

## Endpoints de la API

### 🔨 Productos (`ProductoController`)
```http
GET    /api/productos/producto                    # Listar todos los productos (paginado)
GET    /api/productos/{id}                        # Obtener producto por ID
GET    /api/productos/codigo/{codigo}             # Obtener por código interno
GET    /api/productos/codigo-producto/{codigoProducto}  # Obtener por código de producto
POST   /api/productos/producto                    # Crear producto individual
POST   /api/productos/productos                   # Crear múltiples productos
POST   /api/productos/reducir-stock               # Reducir stock masivo (para compras)
POST   /api/productos/restaurar-stock             # Restaurar stock (cancelaciones)
PUT    /api/productos/{id}/stock                  # Actualizar stock individual
```

### 👥 Usuarios (`UsuarioController`)
```http
POST   /api/usuarios/registro                     # Registrar nuevo usuario
POST   /api/usuarios/login                        # Iniciar sesión
POST   /api/usuarios/logout                       # Cerrar sesión
GET    /api/usuarios/session/user                 # Verificar sesión activa (público)
GET    /api/usuarios/usuario                      # Listar usuarios (requiere ADMIN)
GET    /api/usuarios/usuarios                     # Obtener todos los usuarios (requiere ADMIN)
```

### 💱 Divisas (`DivisasController`)
```http
GET    /api/divisas/tasas                         # Obtener tasas optimizadas con caché
GET    /api/divisas/principales                   # Obtener divisas principales (CLP, USD, EUR)
```

### 💳 Webpay (`WebpayController`)
```http
POST   /api/webpay/create                         # Crear transacción de pago
POST   /api/webpay/commit                         # Confirmar transacción exitosa
POST   /api/webpay/cancel                         # Manejar cancelación de transacción
```

### 📋 Boletas (`BoletaController`)
```http
GET    /api/boleta/boleta                         # Listar boletas (requiere auth)
POST   /api/boleta/boletas                        # Crear boleta post-compra
```

### 🏢 Sucursales (`SucursalController`)
```http
GET    /api/suc/sucursales                        # Listar sucursales (requiere ADMIN)
POST   /api/suc/sucursales                        # Crear sucursal (requiere ADMIN)
PUT    /api/suc/sucursales/{id}                   # Actualizar sucursal (requiere ADMIN)
DELETE /api/suc/sucursales/{id}                   # Eliminar sucursal (requiere ADMIN)
```

### 💬 Mensajes (`MensajeController`)
```http
GET    /api/mensajes                              # Obtener mensajes del usuario actual
POST   /api/mensajes                              # Enviar nuevo mensaje
GET    /api/mensajes/{id}                         # Obtener mensaje específico
```

### 🔧 Administración (`CleanupController`)
```http
POST   /api/cleanup/limpiar-datos                 # Limpiar datos del sistema (requiere ADMIN)
```

### 🌐 Vistas (`VistaController`)
```http
GET    /                                          # Página principal (index.html)
GET    /productos                                 # Página de productos
GET    /carrito                                   # Página del carrito
GET    /login                                     # Página de login
GET    /registro                                  # Página de registro
GET    /administracion                            # Panel administrativo (requiere ADMIN)
```

### 🔐 Sesiones (`SesionController`)
```http
GET    /api/session/current                       # Obtener sesión actual
POST   /api/session/validate                      # Validar sesión
```

## Características de Seguridad

### 🔐 Autenticación y Autorización
- **Spring Security**: Configuración personalizada con HTTP Basic
- **Páginas públicas**: Acceso libre a index, productos, carrito
- **Páginas administrativas**: Requieren autenticación HTTP Basic
- **APIs públicas**: Productos, divisas, registro, login
- **APIs protegidas**: Administración de usuarios, sucursales, boletas

### 🛡️ Protección de Endpoints
- **Rutas públicas**: `/`, `/productos.html`, `/carrito.html`, `/api/productos/**`
- **Rutas protegidas**: `/Administracion.html`, `/api/usuarios/usuario**`, `/api/suc/**`
- **Gestión de sesiones**: `SessionCreationPolicy.IF_REQUIRED`
- **CSRF**: Deshabilitado para APIs REST

### 👤 Gestión de Usuarios
- **Roles**: USER (por defecto), ADMIN (administradores)
- **Contraseñas**: Encriptadas con BCrypt
- **Sesiones**: Verificación asíncrona sin bloqueo en páginas públicas
- **UserDetailsService**: Implementación personalizada con base de datos

## Configuración de Base de Datos

### application.properties
```properties
# Base de datos MySQL con XAMPP
spring.datasource.url=jdbc:mysql://localhost:3306/ferremas
spring.datasource.username=root
spring.datasource.password=
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

# Configuración de Seguridad
spring.security.user.name=admin
spring.security.user.password=admin123
spring.security.user.roles=ADMIN

# Logging para debugging (opcional)
logging.level.org.springframework.security=DEBUG
```

## Instalación y Ejecución

### Prerrequisitos
- **Java 17** o superior
- **Maven 3.6+**
- **XAMPP** (para Apache y MySQL local)
- **Git**

### Pasos de instalación

1. **Instalar y configurar XAMPP**
```bash
# Descargar XAMPP desde https://www.apachefriends.org/
# Iniciar Apache y MySQL desde el panel de control de XAMPP
# Verificar que MySQL esté ejecutándose en puerto 3306
```

2. **Clonar el repositorio**
2. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd ferremas
```

3. **Configurar base de datos en XAMPP**
```sql
# Acceder a phpMyAdmin: http://localhost/phpmyadmin
# O usar línea de comandos de MySQL desde XAMPP

CREATE DATABASE ferremas;
# Para XAMPP, generalmente no necesitas crear usuario específico
# Usa: usuario 'root' y contraseña vacía (por defecto)
```

4. **Configurar application.properties**
```bash
# Editar src/main/resources/application.properties
# Para XAMPP usar:
# spring.datasource.url=jdbc:mysql://localhost:3306/ferremas
# spring.datasource.username=root
# spring.datasource.password=
```

5. **Compilar y ejecutar**
5. **Compilar y ejecutar**
```bash
mvn clean install
mvn spring-boot:run
```

6. **Acceder a la aplicación**
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

### 1. Problemas con XAMPP
**Problema**: MySQL no inicia en XAMPP
**Solución**: 
```bash
# Verificar que el puerto 3306 no esté ocupado
netstat -ano | findstr :3306
# Reiniciar XAMPP como administrador
# Cambiar puerto MySQL en XAMPP si es necesario
```

**Problema**: Error de conexión a base de datos
**Solución**: Verificar que MySQL esté ejecutándose en el panel de control de XAMPP

### 2. Error de conversión de rutas
**Problema**: `Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'`
**Solución**: Verificar rutas específicas antes que genéricas en controladores

### 3. Stock insuficiente en concurrencia
**Problema**: Errores 400 en pruebas de carga
**Solución**: Implementado manejo de errores detallado y restauración de stock

### 4. API Banco Central lenta
**Problema**: Timeouts en divisas
**Solución**: Valores de fallback y caché implementado

### 5. Webpay en desarrollo
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
- **phpMyAdmin (XAMPP)**: http://localhost/phpmyadmin
- **Banco Central**: https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx
- **Webpay Sandbox**: https://webpay3gint.transbank.cl

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

**Versión**: 3.0.0  
**Última actualización**: Julio 2025  
**Características principales**: Sistema de seguridad optimizado, gestión completa de productos, integración con Webpay, sistema de mensajes  
**Mantenido por**: Equipo Ferremas