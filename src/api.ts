const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}