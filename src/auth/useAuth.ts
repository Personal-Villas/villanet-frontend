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

export function useAuth() {
  const [state, set] = useState<AuthState>({ loading: true });

  async function refresh() {
    try {
      const existingToken = localStorage.getItem('access');
      if (!existingToken) {
        set({ loading: false });
        return;
      }

      const { accessToken } = await api<{accessToken: string}>('/auth/refresh', { 
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

  async function verifyCode(email: string, code: string, fullName?: string) {
    const data = await api<{ accessToken: string; user: User }>(
      '/auth/verify-code',
      {
        method: 'POST',
        body: JSON.stringify({ email, code, full_name: fullName }),
      }
    );
    
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
  }

  async function login(email: string, password: string) {
    const data = await api<{ accessToken: string; user: User }>(
      '/auth/login', 
      { 
        method: 'POST', 
        body: JSON.stringify({ email, password }) 
      }
    );
    
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
  }

  async function register(email: string, password: string, full_name: string) {
    const data = await api<{ accessToken: string; user: User }>(
      '/auth/register', 
      { 
        method: 'POST', 
        body: JSON.stringify({ email, password, full_name }) 
      }
    );
    
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
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