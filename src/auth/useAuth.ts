import { useEffect, useState } from 'react';
import { api } from '../api';

export interface User { id: string; email: string; role: 'agent'|'admin'; status: 'pending'|'approved'|'rejected'; trial_expires_at?: string; }
type AuthState = { user?: User; accessToken?: string; loading: boolean; };

export function useAuth() {
  const [state, set] = useState<AuthState>({ loading: true });

  async function refresh() {
    try {
      const { accessToken } = await api<{accessToken: string}>('/auth/refresh', { method: 'POST' });
      localStorage.setItem('access', accessToken);
      const me = await api<User>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      set({ user: me, accessToken, loading: false });
    } catch {
      set({ loading: false });
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(email: string, password: string) {
    const data = await api<{ accessToken: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
  }

  async function register(full_name: string, email: string, password: string) {
    const data = await api<{ accessToken: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify({ full_name, email, password }) });
    localStorage.setItem('access', data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, loading: false });
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    localStorage.removeItem('access');
    set({ user: undefined, accessToken: undefined, loading: false });
  }

  return { ...state, login, register, logout, refresh };
}
