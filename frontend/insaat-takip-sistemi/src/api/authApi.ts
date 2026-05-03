import { buildApiUrl } from './apiBase';
import { readApiErrorMessage } from './apiErrors';
import type { AuthUserDto } from './authStorage';
import { isAuthUser } from './authStorage';

export type LoginResponseDto = {
  token: string;
  user: AuthUserDto;
};

export async function loginApi(username: string, password: string): Promise<LoginResponseDto> {
  const res = await fetch(buildApiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const data: unknown = await res.json();
  if (typeof data !== 'object' || data === null) throw new Error('Geçersiz giriş yanıtı');
  const o = data as Record<string, unknown>;
  const token = o.token;
  if (typeof token !== 'string' || !token.trim()) throw new Error('Geçersiz giriş yanıtı');
  if (!isAuthUser(o.user)) throw new Error('Geçersiz kullanıcı yanıtı');
  return { token: token.trim(), user: o.user };
}
