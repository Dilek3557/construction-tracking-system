import { buildApiUrl } from './apiBase';
import { readApiErrorMessage } from './apiErrors';

export type UserResponse = {
  id: number;
  displayName: string;
  username: string;
  role: string;
  active: boolean;
};

function isUser(v: unknown): v is UserResponse {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    Number.isFinite(o.id) &&
    typeof o.displayName === 'string' &&
    typeof o.username === 'string' &&
    typeof o.role === 'string' &&
    typeof o.active === 'boolean'
  );
}

export async function fetchUsers(): Promise<UserResponse[]> {
  const url = buildApiUrl('/users');
  const res = await fetch(url);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter(isUser);
}

/** Backend uyumu: oluşturma isteğinde beklenen rol sabitleri. */
export type UserCreateApiRole = 'ADMIN' | 'PERSONEL';

export type UserCreateRequest = {
  username: string;
  displayName: string;
  password: string;
  role: UserCreateApiRole;
};

export async function createUser(payload: UserCreateRequest): Promise<void> {
  const url = buildApiUrl('/users');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: payload.username.trim(),
      displayName: payload.displayName.trim(),
      password: payload.password,
      role: payload.role,
    }),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

