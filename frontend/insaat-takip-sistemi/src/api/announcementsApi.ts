import { apiFetch } from './apiClient';
import { readApiErrorMessage } from './apiErrors';

export type OfficeAnnouncementResponse = {
  id: number;
  message: string;
  revision: number;
  createdAt?: string;
  updatedAt?: string;
};

function isAnnouncement(v: unknown): v is OfficeAnnouncementResponse {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    typeof o.message === 'string' &&
    typeof o.revision === 'number'
  );
}

export async function fetchCurrentAnnouncement(): Promise<OfficeAnnouncementResponse | null> {
  const res = await apiFetch('/announcements/current');
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  // backend returns Optional -> either object or null
  if (data === null) return null;
  return isAnnouncement(data) ? data : null;
}

export async function updateCurrentAnnouncement(body: { userId: number; message: string }): Promise<OfficeAnnouncementResponse> {
  const res = await apiFetch('/announcements/current', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: body.userId, message: body.message }),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  if (!isAnnouncement(data)) throw new Error('Beklenmeyen duyuru yanıtı');
  return data;
}

export async function acknowledgeAnnouncement(announcementId: number, body: { userId: number }): Promise<void> {
  const res = await apiFetch(`/announcements/${encodeURIComponent(String(announcementId))}/ack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: body.userId }),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

export async function fetchAckStatus(announcementId: number, userId: number): Promise<boolean> {
  const res = await apiFetch(
    `/announcements/${encodeURIComponent(String(announcementId))}/ack-status?userId=${encodeURIComponent(String(userId))}`
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const data: unknown = await res.json();
  return data === true;
}

