import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../../../types';
import { loginUser, registerUser, logoutUser, type RegisterPayload, type LoginPayload } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT token payload safely without external packages
function parseJwt(token: string): { user_id?: string; role?: UserRole; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('novastore_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('novastore_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and check token expiry on mount
  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Token has expired
          performLogout();
        } else if (decoded.role && user && user.role !== decoded.role) {
          const updatedUser: User = { ...user, role: decoded.role };
          setUser(updatedUser);
          localStorage.setItem('novastore_user', JSON.stringify(updatedUser));
        }
      }
    }

    const handleUnauthorized = () => {
      performLogout();
    };

    window.addEventListener('novastore:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('novastore:unauthorized', handleUnauthorized);
    };
  }, [token]);

  const performLogout = () => {
    localStorage.removeItem('novastore_token');
    localStorage.removeItem('novastore_refreshtoken');
    localStorage.removeItem('novastore_refresh_id');
    localStorage.removeItem('novastore_user');
    setToken(null);
    setUser(null);
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const tokens = await loginUser(payload);
      localStorage.setItem('novastore_token', tokens.accesstoken);
      localStorage.setItem('novastore_refreshtoken', tokens.refreshtoken);
      localStorage.setItem('novastore_refresh_id', tokens.refreshId);

      const decoded = parseJwt(tokens.accesstoken);
      const authenticatedUser: User = {
        id: decoded?.user_id || 'user',
        name: payload.email.split('@')[0],
        email: payload.email,
        role: decoded?.role || 'USER',
      };

      localStorage.setItem('novastore_user', JSON.stringify(authenticatedUser));
      setToken(tokens.accesstoken);
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await registerUser(payload);
      // Automatically log the newly registered user in!
      await login({ email: payload.email, password: payload.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshId = localStorage.getItem('novastore_refresh_id');
    if (refreshId) {
      try {
        await logoutUser(refreshId);
      } catch {
        // Ignore server-side logout errors and proceed with client cleanup
      }
    }
    performLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

