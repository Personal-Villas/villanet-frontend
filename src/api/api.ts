const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(opts.headers || {})
  };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers,
      ...opts
    });

    if (res.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (res.status === 401) {
      // 🔥 FIX: No redirigir si estamos en endpoints de autenticación
      const isAuthEndpoint = path.includes('/auth/login') || 
                            path.includes('/auth/register') || 
                            path.includes('/auth/refresh');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('access');
        
        // Solo redirigir si no estamos ya en una página pública
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          window.location.href = '/login';
        }
      }
      
      throw new Error('Authentication required');
    }

    if (!res.ok) {
      let errorMessage = `HTTP error! status: ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear como JSON, usar text
        const errorText = await res.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}