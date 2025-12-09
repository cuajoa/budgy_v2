// ARCHIVO DE CONFIGURACIÓN DE KEYCLOAK - DESHABILITADO
// Este archivo se mantiene para referencia futura pero no se usa actualmente

/*
import Keycloak from 'keycloak-js';

const isClient = typeof window !== 'undefined';

// Helper para extraer el realm del issuer
function getRealmFromIssuer(issuer?: string): string | null {
  if (!issuer) return null;
  const match = issuer.match(/\/realms\/([^\/]+)/);
  return match ? match[1] : null;
}

// Helper para extraer la URL base del issuer
function getBaseUrlFromIssuer(issuer?: string): string | null {
  if (!issuer) return null;
  const match = issuer.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : null;
}

export const KEYCLOAK_ISSUER = isClient 
  ? process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER
  : (process.env.KEYCLOAK_ISSUER || process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER);

export const KEYCLOAK_CLIENT_ID = isClient
  ? (process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'BUDGY')
  : (process.env.KEYCLOAK_CLIENT_ID || process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'BUDGY');

export const KEYCLOAK_CLIENT_SECRET = isClient
  ? process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET
  : (process.env.KEYCLOAK_CLIENT_SECRET || process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET);

// Obtener realm y URL desde variables de entorno o desde el issuer
export const KEYCLOAK_REALM = isClient
  ? (process.env.NEXT_PUBLIC_KEYCLOAK_REALM || getRealmFromIssuer(KEYCLOAK_ISSUER) || 'internal')
  : (process.env.KEYCLOAK_REALM || process.env.NEXT_PUBLIC_KEYCLOAK_REALM || getRealmFromIssuer(KEYCLOAK_ISSUER) || 'internal');

export const AUTH_BACKEND_URL = isClient
  ? (process.env.NEXT_PUBLIC_KEYCLOAK_URL || getBaseUrlFromIssuer(KEYCLOAK_ISSUER) || 'https://auth.latinlabs.io')
  : (process.env.KEYCLOAK_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || getBaseUrlFromIssuer(KEYCLOAK_ISSUER) || 'https://auth.latinlabs.io');

// Validar configuración
export function validateConfig(): boolean {
  const hasRealm = !!KEYCLOAK_REALM && KEYCLOAK_REALM !== 'undefined';
  const hasClientId = !!KEYCLOAK_CLIENT_ID && KEYCLOAK_CLIENT_ID !== 'undefined';

  if (!hasRealm || !hasClientId) {
    console.error('Keycloak configuration missing or invalid:', {
      KEYCLOAK_ISSUER: !!KEYCLOAK_ISSUER ? '✓' : '✗',
      KEYCLOAK_REALM: hasRealm ? '✓' : '✗',
      KEYCLOAK_CLIENT_ID: hasClientId ? '✓' : '✗',
      details: {
        KEYCLOAK_ISSUER,
        KEYCLOAK_REALM,
        KEYCLOAK_CLIENT_ID,
        AUTH_BACKEND_URL,
        env: {
          KEYCLOAK_URL: process.env.KEYCLOAK_URL,
          KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
          KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
          KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
          NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
          NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
          NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
          NEXT_PUBLIC_KEYCLOAK_ISSUER: process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER,
        },
      },
    });
    return false;
  }
  return true;
}

// Crear la instancia de Keycloak de forma lazy para evitar problemas de SSR
let _keycloakInstance: Keycloak | null = null;

export const getKeycloakInstance = (): Keycloak | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (_keycloakInstance) return _keycloakInstance;

  if (!validateConfig()) {
    return null;
  }

  try {
    _keycloakInstance = new Keycloak({
      url: AUTH_BACKEND_URL!,
      realm: KEYCLOAK_REALM!,
      clientId: KEYCLOAK_CLIENT_ID!,
    });

    console.log('Keycloak instance created successfully:', {
      url: AUTH_BACKEND_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
    });

    return _keycloakInstance;
  } catch (error) {
    console.error('Error creating Keycloak instance:', error);
    return null;
  }
};

export const keycloakInstance = typeof window !== 'undefined' ? getKeycloakInstance() : null;
*/

// Exportaciones vacías para evitar errores de importación
export const KEYCLOAK_ISSUER = undefined;
export const KEYCLOAK_CLIENT_ID = undefined;
export const KEYCLOAK_CLIENT_SECRET = undefined;
export const KEYCLOAK_REALM = undefined;
export const AUTH_BACKEND_URL = undefined;
export const keycloakInstance = null;
export const getKeycloakInstance = () => null;
export const validateConfig = () => false;
