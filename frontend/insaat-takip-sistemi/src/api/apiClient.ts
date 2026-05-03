import { buildApiUrl } from './apiBase';
import { clearAuth, getToken } from './authStorage';

export const AUTH_LOST_EVENT = 'mukavim:auth-lost';

/**
 * Tüm korumalı API çağrıları: Bearer token ekler.
 * `/auth/login` için `authApi.loginApi` içinde düz `fetch` kullanın.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = buildApiUrl(p);
  const hadToken = Boolean(getToken());
  const headers = new Headers(init.headers as HeadersInit | undefined);
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401 && hadToken) {
    clearAuth();
    window.dispatchEvent(new Event(AUTH_LOST_EVENT));
  }
  return res;
}
