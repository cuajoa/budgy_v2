'use client';

import { createContext, useContext, useState } from 'react';

export interface Session {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  session: Session | null;
}

const initialContext: AuthContextType = {
  isAuthenticated: true,
  session: null,
};

const AuthContext = createContext<AuthContextType>(initialContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Usuario de desarrollo sin autenticación
  const [session] = useState<Session | null>({
    sub: 'dev-user',
    email: 'dev@example.com',
    name: 'Usuario de Desarrollo',
    preferred_username: 'dev-user',
  });
  const [isAuthenticated] = useState<boolean>(true);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
