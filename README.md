# Rastrix

API y app móvil para descubrir mercados de antigüedades y próximos eventos.

## Qué es

Rastrix es una aplicación de información sobre mercados de antigüedades y eventos
relacionados: dónde y cuándo se celebran, qué categorías de artículos se
encuentran, qué expositores participan, valoraciones de otros usuarios,
favoritos y notificaciones. El cliente es una app Android (React Native /
Expo); el backend es una API REST en Spring Boot.

Entidades principales: usuarios, mercados, categorías, expositores, imágenes de
mercado, favoritos, valoraciones y notificaciones.

## Estructura del repositorio

```
backend/   API REST (Spring Boot 4, Java 25)
admin/     Panel web de administración (Angular 21 + Tailwind 4)
frontend/  App Android (Expo / React Native) — en desarrollo
db/        seed-demo.sql — catálogo de ejemplo para desarrollo local
deploy/    Script de despliegue y configuración de Nginx para el servidor
```

## Backend

### Stack

- Java 25, Spring Boot 4.1.1 (Web MVC, Data JPA, Validation, Security, Mail)
- Hibernate 7 sobre MySQL / MariaDB
- Autenticación JWT con `jjwt` (access token + refresh token con rotación)
- BCrypt para contraseñas
- springdoc-openapi (Swagger UI) — activo en local, desactivado en producción
- Envío de correo por SMTP de Gmail (código de recuperación de contraseña)
- Lombok, Maven (wrapper `mvnw`)
- Tests: JUnit 6, Mockito 5, AssertJ

### Requisitos

- JDK 25 (completo, no solo JRE)
- MySQL 8 o MariaDB 10.4+
- No hace falta instalar Maven: usa `./mvnw`

### Puesta en marcha (local)

1. Crea la base de datos vacía (las tablas las crea Flyway al arrancar):

   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS rastrix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

   Opcionalmente, para tener un catálogo con el que trabajar en local:

   ```bash
   mysql -u root rastrix < db/seed-demo.sql
   ```

   Carga 12 mercados de ejemplo con categorías, fotos y expositores. Es solo
   para desarrollo: reescribe el catálogo entero cada vez que se ejecuta.

2. Arranca la aplicación:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   Con la configuración por defecto se conecta a `localhost:3306`, base
   `rastrix`, usuario `root` sin contraseña (lo típico de XAMPP). Todo es
   configurable por variable de entorno (ver tabla más abajo).

3. La API queda en `http://localhost:8080`. Documentación interactiva en
   `http://localhost:8080/swagger-ui/index.html`.

### Esquema de la base de datos

Lo gestiona **Flyway**, con las migraciones de
`backend/src/main/resources/db/migration`, que se aplican solas al arrancar la
aplicación. Hibernate va con `ddl-auto=validate`: no crea ni modifica nada,
solo comprueba que el esquema coincide con las entidades.

Para cambiar el esquema, añade un fichero nuevo `V<n>__descripcion.sql`. Nunca
edites una migración ya aplicada: Flyway guarda una suma de comprobación de
cada una y se negará a arrancar si cambia.

Las bases creadas antes de adoptar Flyway (como la de producción) se marcan
automáticamente en la versión 1 y solo reciben las migraciones posteriores, así
que no hay que hacer nada especial al actualizarlas.

### Configuración

Todas las claves de `application.properties` admiten override por variable de
entorno. Las relevantes:

| Variable | Por defecto | Descripción |
|---|---|---|
| `SERVER_PORT` | `8080` | Puerto HTTP |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3306` / `rastrix` | Conexión a la base de datos |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / *(vacío)* | Credenciales de la base de datos |
| `JWT_SECRET` | *(clave de dev)* | Secreto de firma HS256 (Base64). **Debe cambiarse en producción** |
| `JWT_EXPIRATION_MS` | `1800000` (30 min) | Vida del access token |
| `JWT_REFRESH_EXPIRATION_MS` | `2592000000` (30 días) | Vida del refresh token |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | *(vacío)* | Si se informan, al arrancar se crea (o asciende a `ADMIN`) ese usuario |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | `devepsdev@gmail.com` / *(vacío)* | Cuenta de Gmail y contraseña de aplicación para enviar correos |
| `LOGIN_MAX_ATTEMPTS_PER_EMAIL` / `LOGIN_MAX_ATTEMPTS_PER_IP` | `5` / `20` | Límite de intentos de login por ventana |
| `LOGIN_RATE_LIMIT_WINDOW_MINUTES` | `15` | Ventana del rate limiting de login |
| `PASSWORD_RESET_EXPIRATION_MINUTES` | `15` | Caducidad del código de recuperación |

**Perfil `prod`** (`SPRING_PROFILES_ACTIVE=prod`): desactiva Swagger, silencia el
log de SQL y activa `server.forward-headers-strategy=framework` para resolver la
IP real del cliente detrás de Nginx.

### Modelo de autenticación

- **Registro / login** devuelven un `accessToken` (JWT, 30 min) y un
  `refreshToken` (opaco, 30 días, guardado hasheado en BD).
- `POST /api/auth/refresh` cambia el refresh token por uno nuevo y revoca el
  anterior (rotación). `POST /api/auth/logout` lo revoca.
- Cambiar o recuperar la contraseña revoca todos los refresh tokens del usuario.
- **Recuperación de contraseña**: `POST /api/auth/forgot-password` envía un
  código de 6 dígitos por email (responde siempre igual, exista o no la cuenta);
  `POST /api/auth/reset-password` lo canjea. El código caduca a los 15 min, es de
  un solo uso y se bloquea tras 5 intentos.
- **Rate limiting**: máx. 5 intentos de login fallidos por email y 20 por IP cada
  15 min → `429` con cabecera `Retry-After`.
- **401 frente a 403**: sin token, con token manipulado o **caducado** la API
  responde `401`; con una sesión válida pero sin permiso, `403`. Los clientes
  renuevan el access token automáticamente solo ante un `401`.

### Mercados publicados y ocultos

Un mercado con `active: false` está **oculto**: pendiente de revisión o
retirado a mano. La API pública (`/api/markets/**`, la que usa la app) solo
devuelve mercados publicados; pedir uno oculto por id da `404`.

El panel de administración usa `GET /api/admin/markets` (`?active=&q=`, con
búsqueda por nombre, ciudad o provincia) y `GET /api/admin/markets/{id}`, que sí
incluyen los ocultos. Es la bandeja de revisión.

### Importación de mercados

Un mercado queda identificado por **nombre + ciudad**, con un `UNIQUE` en la
base de datos. Crear uno repetido con `POST /api/markets` devuelve `409`.

Para cargas automáticas repetidas existe `PUT /api/markets/import` (solo
`ADMIN`), que es idempotente: da de alta el mercado si no existe (`201`,
`created: true`) o actualiza el que ya había (`200`, `created: false`). Repetir
la misma importación no duplica nada.

Al actualizar, **no toca el estado de publicación**: si un administrador ha
ocultado un mercado (`active: false`), una importación posterior no vuelve a
publicarlo. El campo `active` solo se aplica en el alta, así que un importador
puede crear los mercados sin publicar y dejar que se revisen antes.

La comparación ignora mayúsculas y espacios sobrantes, pero **no los acentos**:
"Antigüitats" y "Antiguitats" se consideran mercados distintos.

Para operar contra este endpoint hace falta una cuenta `ADMIN`; se crea al
arrancar informando `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### Sugerencias de usuarios

Cualquier usuario registrado puede proponer un mercado desde la app con
`POST /api/suggestions`, y consultar las suyas en `GET /api/suggestions/me`. Las
sugerencias **no escriben en el catálogo**: quedan `PENDIENTE` hasta que un
administrador las revisa en el panel.

Desde ahí se aprueban (`PUT /api/admin/suggestions/{id}/approve` con el
`marketId` del mercado creado a partir de ella) o se rechazan
(`PUT /api/admin/suggestions/{id}/reject`, con motivo opcional que el usuario ve
en la app). Una sugerencia resuelta no se puede volver a tocar. Para frenar el
spam, cada usuario puede tener como máximo 10 pendientes a la vez.

### Roles y permisos

Dos roles: `USER` (por defecto al registrarse) y `ADMIN`.

| Recurso | Lectura | Escritura |
|---|---|---|
| `auth/*` | pública | pública |
| markets, categories, exhibitors, market-images, market-categories | pública (GET/HEAD) | solo `ADMIN` |
| ratings | pública | el propio usuario (solo sus valoraciones) |
| favorites | el propio usuario | el propio usuario |
| notifications | el propio usuario | crear: solo `ADMIN` |
| users (`/me`) | el propio usuario | el propio usuario |
| users (listado, por id, rol, borrar) | solo `ADMIN` | solo `ADMIN` |
| suggestions (`/me` y alta) | el propio usuario | el propio usuario |
| `admin/*` (stats, markets, suggestions) | solo `ADMIN` | solo `ADMIN` |

Los endpoints de listado (`markets`, `exhibitors`, `users`) aceptan
`?page=&size=&sort=`; tamaño por defecto 20, máximo 100. La especificación
completa está en Swagger (`/swagger-ui/index.html` en local).

### Tests

```bash
cd backend
./mvnw test
```

Necesita la base de datos accesible (un test carga el contexto completo de
Spring). Cubre reglas de negocio de los servicios (duplicados, propiedad de
recursos, hash de contraseñas), el rate limiter, el flujo de recuperación de
contraseña y la política de seguridad HTTP.

## Panel de administración

Web interna en `admin/` (Angular 21 zoneless + Tailwind 4, mismo stack que
Pedidai y misma identidad visual que la app). Solo entran cuentas `ADMIN`: el
login acepta cualquier cuenta, pero si no es administradora se cierra la sesión
en el acto y se revoca su refresh token.

Pantallas: resumen con tareas pendientes, mercados (listado con búsqueda,
filtro publicados/ocultos, alta y edición completa con categorías y galería),
sugerencias (revisión, alta del mercado precargada y rechazo), categorías y
usuarios (roles y bajas).

En local, con el backend en el puerto 8080:

```bash
cd admin
npm install
npm start
```

Queda en `http://localhost:4200`; `proxy.conf.json` reenvía `/api` al backend,
así que no hace falta CORS. Para tener una cuenta de administrador en local,
regístrate desde la app y asciéndela:

```bash
mysql -u root rastrix -e "UPDATE usuarios SET role='ADMIN' WHERE email='tu@correo';"
```

## Despliegue

El backend corre en producción en **https://rastrix.deveps.dev**, como servicio
systemd detrás de Nginx con certificado Let's Encrypt, instalado en
`/opt/apps/rastrix/`. El panel se sirve en **https://rastrix.deveps.dev/admin/**
desde `/var/www/rastrix-admin`, en el mismo dominio que la API.

- `deploy/deploy.sh` — despliegue completo interactivo: pide y guarda las
  credenciales en `/opt/apps/rastrix/rastrix.env` (permisos `640`), compila
  backend y panel, los instala y configura el servicio. Necesita Node 20.19+
  en el servidor para compilar el panel.
- `deploy/deploy.sh --redeploy` — redespliegue rápido: sin preguntas, reutiliza
  la configuración ya guardada; recompila, reinstala y reinicia.
- `deploy/nginx-rastrix.conf` — configuración de Nginx para `rastrix.deveps.dev`:
  el panel en `/admin/` y el resto como proxy al backend. En un servidor ya
  configurado por Certbot no se sustituye el fichero; se copian los bloques
  `location` del panel dentro del server 443. `deploy.sh` avisa si faltan.

El backup de la base de datos se gestiona de forma centralizada en el servidor,
fuera de este repositorio.

## Frontend

App Android con Expo (SDK 57) / React Native 0.86 / expo-router, en `frontend/`.

```bash
cd frontend
npm install
npx expo start
```

Por defecto apunta al backend de producción. Para desarrollar contra el backend
local, crea un `frontend/.env.local` (ignorado por git) con la IP de tu equipo
en la red wifi, para que el móvil pueda alcanzarlo:

```
EXPO_PUBLIC_API_URL=http://192.168.1.50:8080
```

### Estructura

```
src/api/         Un módulo por recurso de la API + cliente HTTP (client.ts)
src/auth/        Sesión: almacén de tokens, contexto de React y persistencia segura
src/types/       Tipos espejo de los DTOs del backend
src/theme/       Paleta, tipografía y escalas de espaciado
src/components/  Componentes de interfaz (ui/ para los genéricos)
src/app/         Pantallas y navegación (expo-router)
```

### Diseño

Identidad "editorial vintage": fondo papel, tipografía Fraunces para titulares
e Inter para texto, acentos terracota y verde inglés. Soporta modo claro y
oscuro siguiendo el ajuste del sistema.

Pantallas: Descubrir, Buscar, Favoritos y Perfil (pestañas), más detalle de
mercado, acceso (login/registro) y notificaciones.
