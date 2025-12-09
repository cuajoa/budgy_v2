# Configuración de Keycloak - Budgy v2

## Autenticación con Keycloak

Este proyecto utiliza `keycloak-js` directamente para la autenticación, similar al patrón del proyecto de referencia.

## Variables de Entorno

Agregar al archivo `.env.local`:

### Opción 1: Usando Issuer completo (Recomendado)
```env
KEYCLOAK_ISSUER=https://auth.latinlabs.io/realms/internal
KEYCLOAK_CLIENT_ID=BUDGY
KEYCLOAK_CLIENT_SECRET=tu-client-secret-aqui
```

### Opción 2: Usando variables separadas
```env
KEYCLOAK_URL=https://auth.latinlabs.io
KEYCLOAK_REALM=internal
KEYCLOAK_CLIENT_ID=BUDGY
KEYCLOAK_CLIENT_SECRET=tu-client-secret-aqui
```

### Opción 3: Variables públicas (para cliente)
Si necesitas que sean accesibles desde el cliente, usa el prefijo `NEXT_PUBLIC_`:
```env
NEXT_PUBLIC_KEYCLOAK_ISSUER=https://auth.latinlabs.io/realms/internal
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=BUDGY
NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET=tu-client-secret-aqui
```

**Nota**: El sistema prioriza las variables sin `NEXT_PUBLIC_` para mayor seguridad. El `KEYCLOAK_CLIENT_SECRET` solo se usa si es necesario para validación en el servidor.

## Configuración del Cliente en Keycloak

1. Acceder a https://auth.latinlabs.io/
2. Iniciar sesión en el realm "internal"
3. Crear un cliente llamado "BUDGY" con las siguientes configuraciones:
   - **Client ID**: `BUDGY`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `public` (para aplicaciones SPA)
   - **Valid Redirect URIs**: 
     - `http://localhost:3000/*`
     - `https://tu-dominio.com/*` (para producción)
   - **Web Origins**: 
     - `http://localhost:3000`
     - `https://tu-dominio.com` (para producción)
   - **Implicit Flow**: Habilitado (si es necesario)
   - **Standard Flow**: Habilitado

## Flujo de Autenticación

1. **Inicialización**: El `AuthProvider` inicializa Keycloak al cargar la aplicación
2. **Login**: Si el usuario no está autenticado, se redirige automáticamente a Keycloak
3. **Token**: El token JWT se almacena en cookies (`access_token`)
4. **Validación**: El middleware valida el token en cada request
5. **Refresh**: El token se refresca automáticamente cuando está cerca de expirar
6. **Logout**: Al cerrar sesión, se limpian las cookies y se redirige a Keycloak

## Estructura

- `src/infrastructure/config/keycloak.ts`: Configuración de la instancia de Keycloak
- `src/presentation/providers/AuthProvider.tsx`: Provider de autenticación con contexto
- `src/middleware.ts`: Middleware que valida tokens en el servidor
- `src/presentation/middleware/auth.ts`: Utilidades para obtener usuario autenticado en API routes

## Uso en Componentes

```tsx
import { useAuth } from '@/presentation/providers/AuthProvider';

function MyComponent() {
  const { session, token, logout, isAuthenticated } = useAuth();
  
  // session contiene: sub, email, name, roles, etc.
  // token es el JWT actual
  // logout() cierra la sesión
}
```

## Uso en API Routes

```tsx
import { getAuthUser } from '@/presentation/middleware/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // user contiene: id, email, name, roles, permissions
}
```

## Diferencias con NextAuth

- **Más control**: Manejo directo del flujo de autenticación
- **Mejor integración**: Keycloak nativo sin capas adicionales
- **Tokens en cookies**: Fácil acceso desde middleware y API routes
- **Refresh automático**: Manejo automático de expiración de tokens

