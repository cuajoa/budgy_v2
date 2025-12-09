# Guía de Instalación - Budgy v2

## Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## Pasos de Instalación

### 1. Clonar e Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budgy
DB_USER=postgres
DB_PASSWORD=tu-password

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-aleatorio-aqui

# Keycloak
KEYCLOAK_ISSUER=https://auth.latinlabs.io/realms/internal
KEYCLOAK_CLIENT_ID=BUDGY
KEYCLOAK_CLIENT_SECRET=tu-client-secret-de-keycloak

# OpenAI
OPENAI_API_KEY=tu-openai-api-key
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Crear Base de Datos

```sql
CREATE DATABASE budgy;
```

### 4. Ejecutar Migraciones

```bash
npm run db:migrate
```

Este comando ejecutará todos los scripts SQL en la carpeta `migration/` en orden:
- `001_create_schema.sql`: Crea todas las tablas
- `002_insert_initial_data.sql`: Inserta datos iniciales (tipos de gasto)
- `003_create_stored_procedures.sql`: Crea procedimientos almacenados para reportes

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Configuración de Keycloak

1. Acceder a https://auth.latinlabs.io/
2. Iniciar sesión en el realm "internal"
3. Crear un cliente llamado "BUDGY"
4. Configurar:
   - Client ID: `BUDGY`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/api/auth/callback/keycloak`
   - Web Origins: `http://localhost:3000`
5. Copiar el Client Secret y agregarlo a `.env.local`

## Estructura de Permisos

Los permisos se gestionan en la tabla `user_permissions` de la base de datos. Los tipos de permisos son:

- **admin**: Acceso completo a todo el sistema
- **company**: Acceso limitado a una compañía específica
- **cost_center**: Acceso limitado a un centro de costo específico
- **viewer**: Solo lectura de estadísticas y reportes

## Próximos Pasos

1. Crear compañías a través de la API o interfaz
2. Crear centros de costo para cada compañía
3. Configurar períodos de presupuesto
4. Cargar proveedores
5. Comenzar a cargar facturas

## Solución de Problemas

### Error de conexión a la base de datos
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env.local`
- Verificar que la base de datos `budgy` exista

### Error de migraciones
- Asegurarse de que PostgreSQL esté corriendo
- Verificar permisos del usuario de base de datos
- Revisar logs en la consola

### Error de autenticación Keycloak
- Verificar que el cliente BUDGY esté configurado correctamente
- Verificar que las URLs de redirección sean correctas
- Verificar el Client Secret

