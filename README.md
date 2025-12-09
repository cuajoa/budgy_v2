# Budgy v2
Budgy es un proyecto de seguimiento de presupuestos del área de tecnología de una compañia.

## Tecnologías

Usará de tecnologías NEXT.js 16 y React 19 con shadcn como componentes de la parte visual. https://ui.shadcn.com/
Usará de base de datos un postgres local donde se crearán todas las tablas y relaciones.

## Arquitectura

El proyecto sigue los principios de **Clean Architecture** con las siguientes capas:

- **Domain**: Entidades y interfaces de repositorios (sin dependencias externas)
- **Application**: Casos de uso y lógica de negocio
- **Infrastructure**: Implementaciones de repositorios, servicios externos (OpenAI, base de datos)
- **Presentation**: Componentes React, API routes, middleware

## Estructura del Proyecto

```
budgy_v2/
├── migration/              # Scripts de migración de base de datos
│   ├── 001_create_schema.sql
│   ├── 002_insert_initial_data.sql
│   └── 003_create_stored_procedures.sql
├── src/
│   ├── domain/             # Capa de dominio
│   │   ├── entities/       # Entidades del dominio
│   │   └── repositories/   # Interfaces de repositorios
│   ├── application/        # Capa de aplicación
│   │   └── use-cases/      # Casos de uso
│   ├── infrastructure/     # Capa de infraestructura
│   │   ├── database/       # Conexión y migraciones
│   │   ├── repositories/   # Implementaciones de repositorios
│   │   └── services/       # Servicios externos (OpenAI, etc.)
│   └── presentation/       # Capa de presentación
│       ├── components/     # Componentes React
│       ├── middleware/     # Middleware de autenticación
│       └── lib/            # Utilidades
└── scripts/                # Scripts de utilidad
```

## Configuración

### Variables de Entorno

Crear un archivo `.env` basado en `.env.example`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budgy
DB_USER=postgres
DB_PASSWORD=postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui

# Keycloak
KEYCLOAK_ISSUER=https://auth.latinlabs.io/realms/internal
KEYCLOAK_CLIENT_ID=BUDGY
KEYCLOAK_CLIENT_SECRET=tu-client-secret

# OpenAI
OPENAI_API_KEY=tu-openai-api-key
```

### Instalación

```bash
npm install
```

### Base de Datos

1. Crear la base de datos PostgreSQL:
```sql
CREATE DATABASE budgy;
```

2. Ejecutar migraciones:
```bash
npm run db:migrate
```

## Explicación de lo que debemos seguir

Se crea una compañía (pueden ser varias) solo con nombre y cuit (opciona).
Esta compañía tiene períodos de presupuestos activos, son el mismo periodo para todas las compañías.
El período tiene una descripción y una fecha de inicio y una de fin (un año de rango).

Luego cada compañía tiene sus proveedores. Los proveedores pueden tener relacion con mas de una compañía.
Estos proveedores facturan mensualmente (un gasto de la compañía) un monto en una fecha y a un tipo de cambio. Facturan en pesos y se debe guardar el monto en pesos, dolares y tipo de cambio de la fecha.

Cada gasto esta "etiquetado" con un tipo, que es una relación a cada gasto.
Los tipos pueden ser Licencias, staff augmentation, proyecto, infraestructura, etc. (es adaptable a mas gastos, es decir el usuario puede agregar mas.)

Cada compañía tiene centros de costos, que estos centros de costos es donde se imputan estos gastos.
Por el momento son dos, Desarrollo e Infraestructura. Todos los gastos van asociado a un Centro de costo de una de las compañías.

### Seguimiento

Se requiere pantallas de seguimiento del presupuesto por centro de costo, compañía, tipo de gasto y proveedor.
Todos los seguimientos son en dolares.

### Carga de facturas

Las cargas de facturas se hacen de manera automatica arrastrando un PDF directo en la pagina web y procesando el PDF con la api de open AI vía OCR para que tome el texto y lo guarde mas fácil.
La api de open IA debe aprender qué proveedor es y a que gasto asociado va.


La aplicación es multiusuarios usuando keycloak con el realm "internal" de https://auth.latinlabs.io/ y un client que sea BUDGY donde habrá distintos tipos de grupos usuarios de carga y de visualización.

Estos usuarios podran ver todo (si es administrador), una de las compañías o uno de los centros de costos de ambas compañías.

Usuario armin: ve y hace todo
Usuario Compañia 1: solo ve y hace cosas compañia 1
Usuario Centro de costo Desarrollo: solo ve y agrega centro de costo desarrollo
Usuario Visualizador: solo ve estadísticas y avances de presupuestos.

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia el servidor de producción
- `npm run lint`: Ejecuta el linter
- `npm run type-check`: Verifica tipos TypeScript
- `npm run db:migrate`: Ejecuta las migraciones de base de datos

## API Endpoints

### Autenticación
- `GET/POST /api/auth/[...nextauth]`: Endpoints de NextAuth con Keycloak

### Compañías
- `GET /api/companies`: Lista todas las compañías
- `POST /api/companies`: Crea una nueva compañía

### Gastos
- `GET /api/expenses`: Lista gastos (con filtros opcionales)
- `POST /api/expenses`: Crea un nuevo gasto
- `POST /api/expenses/upload`: Procesa y carga una factura PDF

### Reportes
- `GET /api/reports/cost-center`: Reporte de gastos por centro de costo

## Seguridad

- Autenticación mediante Keycloak
- Autorización basada en permisos (admin, company, cost_center, viewer)
- Validación de permisos en todos los endpoints
- Soft delete para mantener integridad referencial
