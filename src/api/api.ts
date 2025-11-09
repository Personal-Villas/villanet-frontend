export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * API call con autenticación (usa token si existe)
 */
export async function api<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access') || undefined;

  // Detectar si body es FormData para no setear Content-Type manualmente
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  // Stringify body si viene un objeto y no es FormData/string
  let body = opts.body as any;
  if (!isFormData && body && typeof body === 'object' && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || 'GET',
    headers,
    body,
    credentials: 'include', // necesario para el refresh_token (SameSite=None; Secure)
    signal: opts.signal,
  });

  // Throttling
  if (res.status === 429) {
    throw new ApiError(429, 'Rate limit exceeded. Please try again later.');
  }

  // 401: sólo redirigir si NO es un endpoint de auth
  if (res.status === 401) {
    const isAuthEndpoint =
      path.startsWith('/auth/') ||
      path.includes('/auth/login') ||
      path.includes('/auth/register') ||
      path.includes('/auth/refresh');

    if (!isAuthEndpoint) {
      // limpiamos access token y mandamos a login si corresponde
      localStorage.removeItem('access');
      const here = window.location.pathname;
      if (here !== '/login' && here !== '/signup') {
        window.location.href = '/login';
      }
    }

    // intentar extraer mensaje de error
    let msg = 'Authentication required';
    try {
      const data = await res.json();
      msg = (data && (data.message || data.error)) || msg;
      throw new ApiError(401, msg, data);
    } catch {
      throw new ApiError(401, msg);
    }
  }

  // Otros errores HTTP
  if (!res.ok) {
    // intenta parsear JSON; si no, usa texto
    let payload: any = undefined;
    let message = `HTTP error ${res.status}`;
    const ct = res.headers.get('content-type') || '';
    try {
      payload = ct.includes('application/json') ? await res.json() : await res.text();
      if (payload && typeof payload === 'object') {
        message = payload.message || payload.error || message;
      } else if (typeof payload === 'string' && payload.trim().length) {
        message = payload;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message, payload);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  // Respuesta JSON (o texto si no es JSON)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  // Si no es JSON, devolvemos texto (tipado como any)
  const text = await res.text();
  return text as unknown as T;
}

/**
 * API call PÚBLICA - Sin autenticación ni redirección en 401
 * Útil para endpoints públicos como /public/listings
 */
export async function publicApi<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  // Detectar si body es FormData para no setear Content-Type manualmente
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(opts.headers || {}),
  };

  // Stringify body si viene un objeto y no es FormData/string
  let body = opts.body as any;
  if (!isFormData && body && typeof body === 'object' && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || 'GET',
    headers,
    body,
    credentials: 'include',
    signal: opts.signal,
  });

  // Throttling
  if (res.status === 429) {
    throw new ApiError(429, 'Rate limit exceeded. Please try again later.');
  }

  // Para endpoints públicos, el 401 es solo un error sin redirección
  if (res.status === 401) {
    let msg = 'Authentication required';
    try {
      const data = await res.json();
      msg = (data && (data.message || data.error)) || msg;
      throw new ApiError(401, msg, data);
    } catch {
      throw new ApiError(401, msg);
    }
  }

  // Otros errores HTTP
  if (!res.ok) {
    let payload: any = undefined;
    let message = `HTTP error ${res.status}`;
    const ct = res.headers.get('content-type') || '';
    try {
      payload = ct.includes('application/json') ? await res.json() : await res.text();
      if (payload && typeof payload === 'object') {
        message = payload.message || payload.error || message;
      } else if (typeof payload === 'string' && payload.trim().length) {
        message = payload;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message, payload);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  // Respuesta JSON (o texto si no es JSON)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  const text = await res.text();
  return text as unknown as T;
}