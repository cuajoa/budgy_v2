import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions?: Array<{
    type: string;
    companyId?: number;
    costCenterId?: number;
  }>;
}

export function hasPermission(user: AuthUser, permission: string): boolean {
  // AUTENTICACIÓN DESHABILITADA - Retornar true para desarrollo
  return true;
  
  /* CÓDIGO DE AUTENTICACIÓN COMENTADO
  if (permission === 'admin') {
    return user.roles.includes('admin');
  }
  return user.permissions?.some((p) => p.type === permission) || false;
  */
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE PARA DESARROLLO
  // Retornar usuario de desarrollo
  return {
    id: 'dev-user',
    email: 'dev@example.com',
    name: 'Usuario de Desarrollo',
    roles: ['admin'],
    permissions: [{ type: 'admin' }],
  };
}
