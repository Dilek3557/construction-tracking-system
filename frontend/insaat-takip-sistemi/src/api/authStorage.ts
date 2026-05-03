import type { AppRole, SessionPayload } from '../types';

/** Backend login cevabı ile aynı alanlar */
export type AuthUserDto = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  active: boolean;
};

export function mapBackendRoleToAppRole(r: string): AppRole {
  const key = r.trim().toUpperCase();
  if (
    key === 'ADMIN' ||
    key === 'MANAGER' ||
    key === 'YONETICI' ||
    key === 'YÖNETİCİ'
  ) {
    return 'yonetici';
  }
  if (key === 'PERSONEL' || key === 'PERSONNEL' || key === 'STAFF') {
    return 'personel';
  }
  return 'personel';
}

export function isAuthUser(v: unknown): v is AuthUserDto {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    Number.isFinite(o.id) &&
    typeof o.username === 'string' &&
    typeof o.displayName === 'string' &&
    typeof o.role === 'string' &&
    typeof o.active === 'boolean'
  );
}

export function getToken(): string | null {
  try {
    const t = localStorage.getItem('token');
    return t && t.trim() ? t.trim() : null;
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUserDto | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw?.trim()) return null;
    const j: unknown = JSON.parse(raw);
    return isAuthUser(j) ? j : null;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUserDto): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth(): void {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    /* ignore */
  }
}

/** Token + kullanıcı varsa uygulama oturumu; yoksa login ekranı */
export function readSessionPayload(): SessionPayload | null {
  const token = getToken();
  const user = getAuthUser();
  if (!token || !user) return null;
  if (!user.active) return null;
  return {
    userLabel: user.displayName.trim(),
    role: mapBackendRoleToAppRole(user.role),
    backendUserId: user.id,
  };
}
