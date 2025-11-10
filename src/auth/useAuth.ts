import { useEffect, useState } from 'react';
import { api } from '../api/api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'ta' | 'pmc';
  status: 'pending' | 'approved' | 'rejected';
  trial_expires_at?: string;
  full_name: string;
}

type AuthState = { user?: User; accessToken?: string; loading: boolean; };

// ✅ Interfaces para las respuestas de la API
interface AuthResponse {
  accessToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
}

export function useAuth() {
  const [state, set] = useState<AuthState>({ loading: true });

  async function refresh() {
    try {
      const existingToken = localStorage.getItem('access');
      if (!existingToken) {
        set({ loading: false });
        return;
      }

      const { accessToken } = await api<RefreshResponse>('/auth/refresh', { 
        method: 'POST' 
      });
      
      localStorage.setItem('access', accessToken);
      
      const me = await api<User>('/auth/me', { 
        headers: { Authorization: `Bearer ${accessToken}` } 
      });
      
      set({ user: me, accessToken, loading: false });
    } catch (err) {
      localStorage.removeItem('access');
      set({ loading: false });
    }
  }

  useEffect(() => { 
    refresh(); 
  }, []);

  // ✅ Ahora retorna explícitamente los datos
  async function verifyCode(email: string, code: string, fullName?: string): Promise<AuthResponse> {
    const data = await api<AuthResponse>(
      '/auth/verify-code',
      {
        method: 'POST',
        body: JSON.stringify({ email, code, full_name: fullName }),
      }
    );
    
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
    
    return data; // ✅ Retorna los datos
  }

  // ✅ Ahora retorna explícitamente los datos
  async function login(email: string, password: string): Promise<AuthResponse> {
    const data = await api<AuthResponse>(
      '/auth/login', 
      { 
        method: 'POST', 
        body: JSON.stringify({ email, password }) 
      }
    );
    
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
    
    return data; // ✅ Retorna los datos
  }

  // ✅ Ahora retorna explícitamente los datos
  async function register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const data = await api<AuthResponse>(
      '/auth/register', 
      { 
        method: 'POST', 
        body: JSON.stringify({ email, password, full_name }) 
      }
    );
    
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
    
    return data; // ✅ Retorna los datos
  }

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed, clearing local state anyway');
    } finally {
      localStorage.removeItem('access');
      set({ user: undefined, accessToken: undefined, loading: false });
    }
  }

  return { ...state, verifyCode, login, register, logout, refresh };
}