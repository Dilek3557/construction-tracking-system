import { apiFetch } from './apiClient';
import { readApiErrorMessage } from './apiErrors';

export type ProjectNoteResponse = {
  id: number;
  projectId: number;
  authorUserId: number;
  authorName: string;
  message: string;
  createdAt: string;
};

function isNote(v: unknown): v is ProjectNoteResponse {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    typeof o.projectId === 'number' &&
    typeof o.authorUserId === 'number' &&
    typeof o.authorName === 'string' &&
    typeof o.message === 'string' &&
    typeof o.createdAt === 'string'
  );
}

export async function fetchProjectNotes(projectId: string): Promise<ProjectNoteResponse[]> {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/notes`);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter(isNote);
}

export async function addProjectNote(projectId: string, body: { userId: number; message: string }): Promise<void> {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: body.userId, message: body.message }),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

