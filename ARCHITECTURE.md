# Arquitectura del Proyecto - Budgy v2

## Principios de Clean Architecture

Este proyecto sigue los principios de Clean Architecture, separando el código en capas bien definidas con dependencias unidireccionales.

## Estructura de Capas

### 1. Domain Layer (Capa de Dominio)

**Ubicación:** `src/domain/`

Esta es la capa más interna y no tiene dependencias externas. Contiene:

- **Entidades (`entities/`)**: Modelos de negocio puros
  - `Company.ts`: Entidad de compañía
  - `BudgetPeriod.ts`: Período de presupuesto
  - `Provider.ts`: Proveedor
  - `ExpenseType.ts`: Tipo de gasto
  - `CostCenter.ts`: Centro de costo
  - `Expense.ts`: Gasto/Factura
  - `UserPermission.ts`: Permisos de usuario

- **Interfaces de Repositorios (`repositories/`)**: Contratos que definen cómo acceder a los datos
  - `ICompanyRepository.ts`
  - `IExpenseRepository.ts`
  - Y otros...

### 2. Application Layer (Capa de Aplicación)

**Ubicación:** `src/application/`

Contiene la lógica de casos de uso y reglas de negocio:

- **Casos de Uso (`use-cases/`)**: Implementan la lógica de negocio
  - `expense/CreateExpenseUseCase.ts`: Crear un gasto
  - `expense/ProcessInvoicePDFUseCase.ts`: Procesar factura PDF con OpenAI
  - `reports/GetExpensesByCostCenterUseCase.ts`: Reporte por centro de costo

### 3. Infrastructure Layer (Capa de Infraestructura)

**Ubicación:** `src/infrastructure/`

Implementa las interfaces definidas en Domain y se conecta con servicios externos:

- **Database (`database/`)**: 
  - `connection.ts`: Pool de conexiones PostgreSQL
  - `migrations.ts`: Ejecución de migraciones

- **Repositorios (`repositories/`)**: Implementaciones concretas
  - `CompanyRepository.ts`: Implementa `ICompanyRepository`
  - `ExpenseRepository.ts`: Implementa `IExpenseRepository`
  - Y otros...

- **Servicios (`services/`)**: Servicios externos
  - `OpenAIService.ts`: Integración con OpenAI para OCR
  - `ExchangeRateService.ts`: Servicio de tipo de cambio

### 4. Presentation Layer (Capa de Presentación)

**Ubicación:** `src/presentation/` y `src/app/`

Interfaz de usuario y API:

- **Componentes (`components/`)**: Componentes React reutilizables
  - `ui/`: Componentes de shadcn/ui

- **Middleware (`middleware/`)**: 
  - `auth.ts`: Autenticación y autorización

- **API Routes (`app/api/`)**: Endpoints REST
  - `/api/companies`: CRUD de compañías
  - `/api/expenses`: CRUD de gastos
  - `/api/expenses/upload`: Carga de facturas PDF
  - `/api/reports/*`: Endpoints de reportes

- **Páginas (`app/`)**: Páginas Next.js

## Flujo de Datos

```
Usuario → Presentation (API Route)
         ↓
    Application (Use Case)
         ↓
    Infrastructure (Repository)
         ↓
    Database (PostgreSQL)
```

## Principios Aplicados

### 1. Inversión de Dependencias
- Las capas internas (Domain, Application) no dependen de las externas
- Las interfaces están en Domain, las implementaciones en Infrastructure

### 2. Separación de Responsabilidades
- Cada capa tiene una responsabilidad clara
- Los casos de uso orquestan la lógica de negocio
- Los repositorios solo acceden a datos

### 3. Testabilidad
- Las interfaces permiten fácil mocking
- La lógica de negocio está aislada de frameworks

### 4. Escalabilidad
- Fácil agregar nuevos casos de uso
- Fácil cambiar implementaciones (ej: cambiar de PostgreSQL a MongoDB)
- Fácil agregar nuevos servicios externos

## Patrones Utilizados

### Repository Pattern
- Abstrae el acceso a datos
- Facilita testing y cambios de persistencia

### Use Case Pattern
- Encapsula lógica de negocio
- Un caso de uso = una acción del usuario

### Dependency Injection
- Los casos de uso reciben dependencias por constructor
- Facilita testing y mantenimiento

## Migraciones de Base de Datos

Las migraciones están en `migration/` y se ejecutan en orden numérico:

1. `001_create_schema.sql`: Esquema completo
2. `002_insert_initial_data.sql`: Datos iniciales
3. `003_create_stored_procedures.sql`: Procedimientos almacenados

## Seguridad

- Autenticación: Keycloak (OAuth2/OIDC)
- Autorización: Basada en permisos en base de datos
- Validación: En capa de aplicación y presentación
- Soft Delete: Para mantener integridad referencial

## Extensibilidad

Para agregar nuevas funcionalidades:

1. **Nueva Entidad**: Crear en `domain/entities/`
2. **Nuevo Repositorio**: Crear interfaz en `domain/repositories/` e implementación en `infrastructure/repositories/`
3. **Nuevo Caso de Uso**: Crear en `application/use-cases/`
4. **Nueva API Route**: Crear en `app/api/`
5. **Nueva Migración**: Crear en `migration/` con número secuencial

