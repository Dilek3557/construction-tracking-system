import { apiFetch } from './apiClient';
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
  const res = await apiFetch('/users');
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
  const res = await apiFetch('/users', {
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

export async function updateUserActive(userId: number, active: boolean): Promise<UserResponse> {
  const res = await apiFetch(`/users/${encodeURIComponent(String(userId))}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  if (!isUser(data)) throw new Error('Beklenmeyen kullanıcı yanıtı');
  return data;
}

