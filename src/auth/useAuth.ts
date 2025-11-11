import { api } from '../api/api';
import { useAuthContext } from './AuthContext';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'ta' | 'pmc';
  status: 'pending' | 'approved' | 'rejected';
  trial_expires_at?: string;
  full_name: string;
}

// ✅ Interfaces para las respuestas de la API
interface AuthResponse {
  accessToken: string;
  user: User;
}

/*interface RefreshResponse {
  accessToken: string;
}*/

export function useAuth() {
  // ✅ Usar el contexto en lugar de estado local
  const { user, loading/*, isAuthenticated, updateAuthState */} = useAuthContext();

  // ✅ Obtener accessToken de localStorage (para compatibilidad)
  const accessToken = localStorage.getItem('access') || undefined;

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
    
    // ✅ Disparar evento para que el contexto se actualice
    window.dispatchEvent(new Event('authStateChange'));
    
    return data;
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
    
    // ✅ Disparar evento para que el contexto se actualice
    window.dispatchEvent(new Event('authStateChange'));
    
    return data;
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
    
    // ✅ Disparar evento para que el contexto se actualice
    window.dispatchEvent(new Event('authStateChange'));
    
    return data;
  }

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed, clearing local state anyway');
    } finally {
      localStorage.removeItem('access');
      
      // ✅ Disparar evento para que el contexto se actualice
      window.dispatchEvent(new Event('authStateChange'));
    }
  }

  // ✅ Función refresh simplificada - ya no es necesaria porque el contexto maneja esto
  async function refresh() {
    // El contexto ya maneja el refresh automáticamente
    window.dispatchEvent(new Event('authStateChange'));
  }

  // ✅ Retornar los datos del contexto + las funciones
  return { 
    user, 
    accessToken, 
    loading, 
    verifyCode, 
    login, 
    register, 
    logout, 
    refresh 
  };
}