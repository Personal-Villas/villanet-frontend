import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'ta' | 'pmc';
  status: 'pending' | 'approved' | 'rejected';
  trial_expires_at?: string;
  full_name: string;
}

interface AuthContextType {
  user: User | undefined;
  loading: boolean;
  isAuthenticated: boolean;
  updateAuthState: (user: User | undefined) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  isAuthenticated: false,
  updateAuthState: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    user: User | undefined;
    loading: boolean;
    isAuthenticated: boolean;
  }>({
    user: undefined,
    loading: true,
    isAuthenticated: false
  });

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        setAuthState({
          user: undefined,
          loading: false,
          isAuthenticated: false
        });
        return;
      }

      const userData = await api<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuthState({
        user: userData,
        loading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('access');
      setAuthState({
        user: undefined,
        loading: false,
        isAuthenticated: false
      });
    }
  };

  useEffect(() => {
    fetchUser();

    const handleAuthChange = () => {
      console.log('🔄 AuthContext detected auth state change');
      fetchUser();
    };

    // Escuchar eventos de cambio de autenticación
    window.addEventListener('authStateChange', handleAuthChange);
    
    // Escuchar cambios en localStorage (por si otra pestaña hace login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access') {
        fetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateAuthState = (user: User | undefined) => {
    setAuthState({
      user,
      loading: false,
      isAuthenticated: !!user
    });
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      updateAuthState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);