import { withComputedProjectStatus } from '../lib/stage';
import type { Project, ProjectDurum } from '../types';
import { apiFetch } from './apiClient';
import { readApiErrorMessage } from './apiErrors';

export type CreateProjectRequestBody = {
  companyName: string;
  name: string;
  projectType: string;
  startDate: string;
  endDate: string;
};

export type ProjectsListMode = 'all' | 'active' | 'archived';

function mapBackendStatus(status: string): ProjectDurum {
  switch (status) {
    case 'WAITING_APPROVAL':
      return 'mavi';
    case 'READY_FOR_DELIVERY':
      return 'hazir';
    case 'DELIVERED':
      return 'yesil';
    case 'ACTIVE':
    default:
      return 'sari';
  }
}

export function mapProjectFromApi(raw: unknown): Project | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const id = o.id;
  if (id === undefined || id === null) return null;
  const idStr = String(id);
  let start: string | undefined;
  if (typeof o.startDate === 'string') start = o.startDate;
  else if (o.startDate != null) start = String(o.startDate);
  let end = '';
  if (typeof o.endDate === 'string') end = o.endDate;
  else if (o.endDate != null) end = String(o.endDate);
  return withComputedProjectStatus({
    id: idStr,
    firmaAdi: typeof o.companyName === 'string' ? o.companyName : '',
    isim: typeof o.name === 'string' ? o.name : '',
    nitelik: typeof o.projectType === 'string' ? o.projectType : '',
    baslangicTarihi: start,
    bitisTarihi: end,
    durum: mapBackendStatus(String(o.status)),
    archived: Boolean(o.archived),
    stages: [],
    notes: [],
  });
}

function listPath(mode: ProjectsListMode): string {
  if (mode === 'active') return '/projects/active';
  if (mode === 'archived') return '/projects/archived';
  return '/projects';
}

export async function fetchProjectsFromApi(mode: ProjectsListMode = 'all'): Promise<Project[]> {
  const res = await apiFetch(listPath(mode));
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }
  const out: Project[] = [];
  for (const item of data) {
    const p = mapProjectFromApi(item);
    if (p) out.push(p);
  }
  return out;
}

export async function createProject(body: CreateProjectRequestBody): Promise<void> {
  const payload: Record<string, string> = {
    companyName: body.companyName,
    name: body.name,
    projectType: body.projectType,
    endDate: body.endDate,
  };
  if (body.startDate?.trim()) payload.startDate = body.startDate.trim();
  const res = await apiFetch('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
}

export async function deliverProject(projectId: string): Promise<Project> {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/deliver`, { method: 'PUT' });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  const p = mapProjectFromApi(raw);
  if (!p) throw new Error('Beklenmeyen proje yanıtı');
  return p;
}

export async function setProjectArchived(projectId: string, archived: boolean): Promise<Project> {
  const res = await apiFetch(
    `/projects/${encodeURIComponent(projectId)}/archive?archived=${archived ? 'true' : 'false'}`,
    { method: 'PUT' }
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  const p = mapProjectFromApi(raw);
  if (!p) throw new Error('Beklenmeyen proje yanıtı');
  return p;
}
