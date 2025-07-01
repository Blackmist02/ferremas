# Documentación del Proyecto Ferremas

## Descripción
Ferremas es una aplicación desarrollada en Java utilizando el framework Spring Boot. Su objetivo es gestionar información relacionada con productos, usuarios, sucursales y boletas en una ferretería. La aplicación incluye funcionalidades para realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) sobre las entidades principales del sistema.

## Tecnologías Utilizadas
- **Java 17**: Lenguaje de programación utilizado para desarrollar la aplicación.
- **Spring Boot**: Framework para simplificar el desarrollo de aplicaciones basadas en Java.
- **Spring Data JPA**: Para la interacción con la base de datos utilizando el estándar JPA.
- **Spring Security**: Para la configuración de seguridad básica.
- **MySQL**: Base de datos relacional utilizada para almacenar la información.
- **Lombok**: Biblioteca para reducir el código boilerplate en las clases de modelo.
- **JUnit**: Framework para pruebas unitarias.

## Estructura del Proyecto
El proyecto está organizado en los siguientes paquetes:

### 1. **Controller**
Contiene las clases encargadas de manejar las solicitudes HTTP y enviar respuestas al cliente. Cada controlador está asociado a una entidad específica:
- `BoletaController`: Gestión de boletas.
- `UsuarioController`: Gestión de usuarios.
- `SucursalController`: Gestión de sucursales.
- `ProductoController`: Gestión de productos.

### 2. **Service**
Contiene la lógica de negocio de la aplicación. Las clases de este paquete interactúan con los repositorios para realizar operaciones sobre la base de datos:
- `BoletaService`: Lógica de negocio para boletas.
- `UsuarioService`: Lógica de negocio para usuarios.
- `SucursalService`: Lógica de negocio para sucursales.
- `ProductoService`: Lógica de negocio para productos.

### 3. **Repository**
Contiene las interfaces que extienden `JpaRepository` para interactuar con la base de datos:
- `BoletaRepository`: Repositorio para boletas.
- `UsuarioRepository`: Repositorio para usuarios.
- `SucursalRepository`: Repositorio para sucursales.
- `ProductosRepository`: Repositorio para productos.

### 4. **Model**
Contiene las clases que representan las entidades del sistema. Estas clases están anotadas con `@Entity` para ser mapeadas a tablas en la base de datos:
- `Boleta`: Representa una boleta de compra.
- `Usuario`: Representa un usuario del sistema.
- `Sucursal`: Representa una sucursal de la ferretería.
- `Productos`: Representa un producto disponible en la ferretería.

### 5. **Security**
Contiene la configuración de seguridad de la aplicación:
- `SecurityConfig`: Clase para configurar la seguridad básica de la aplicación.

## Configuración
La configuración de la aplicación se encuentra en el archivo `application.properties`. Este archivo incluye parámetros como:
- URL de la base de datos.
- Credenciales de acceso a la base de datos.
- Configuración de seguridad.
- Configuración de Hibernate.

## Endpoints
La aplicación expone los siguientes endpoints para interactuar con las entidades:

### Boletas
- `GET /api/boleta/boleta`: Listar todas las boletas.
- `POST /api/boleta/boletas`: Crear una nueva boleta.
- `POST /api/boleta/lBoletas`: Crear una lista de boletas.
- `DELETE /api/boleta/{id}`: Eliminar una boleta por ID.

### Usuarios
- `GET /api/usuarios/usuario`: Listar todos los usuarios.
- `POST /api/usuarios/usuario`: Crear un nuevo usuario.
- `POST /api/usuarios/usuarios`: Crear una lista de usuarios.

### Sucursales
- `GET /api/suc/sucursal`: Listar todas las sucursales.
- `POST /api/suc/sucursal`: Crear una nueva sucursal.
- `POST /api/suc/sucursales`: Crear una lista de sucursales.
- `DELETE /api/suc/sucursal/{id}`: Eliminar una sucursal por ID.

### Productos
- `GET /api/productos/producto`: Listar todos los productos.
- `POST /api/productos/producto`: Crear un nuevo producto.
- `POST /api/productos/productos`: Crear una lista de productos.
- `POST /api/productos/producto/{id}/precios`: Agregar precios a un producto existente.

## Ejemplo de Datos
El archivo `ejemplos.json` contiene ejemplos de datos para productos, incluyendo información como código, marca, modelo, stock y precios.

## Pruebas
La clase `FerremasApplicationTests` incluye pruebas unitarias para verificar que el contexto de la aplicación se carga correctamente.

## Instalación y Ejecución
1. Clonar el repositorio.
2. Configurar la base de datos MySQL y actualizar las credenciales en `application.properties`.
3. Ejecutar el comando `mvn spring-boot:run` para iniciar la aplicación.
4. Acceder a la aplicación en `http://localhost:8081`.



datos trajeta 
4051885600446623 
123
06 26

11.111.111-1
123