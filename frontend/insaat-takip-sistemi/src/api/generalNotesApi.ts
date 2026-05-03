import { buildApiUrl } from './apiBase';
import { readApiErrorMessage } from './apiErrors';

export type GeneralNoteResponse = {
  id: number;
  authorUserId: number;
  authorName: string;
  message: string;
  createdAt: string;
};

function isNote(v: unknown): v is GeneralNoteResponse {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    typeof o.authorUserId === 'number' &&
    typeof o.authorName === 'string' &&
    typeof o.message === 'string' &&
    typeof o.createdAt === 'string'
  );
}

export async function fetchGeneralNotes(): Promise<GeneralNoteResponse[]> {
  const url = buildApiUrl('/general-notes');
  const res = await fetch(url);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter(isNote);
}

export async function addGeneralNote(body: { userId: number; message: string }): Promise<void> {
  const url = buildApiUrl('/general-notes');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: body.userId, message: body.message }),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

