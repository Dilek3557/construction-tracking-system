import { withComputedProjectStatus } from '../lib/stage';
import type { Project, ProjectDurum } from '../types';
import { buildApiUrl } from './apiBase';

export type CreateProjectRequestBody = {
  companyName: string;
  name: string;
  projectType: string;
  startDate: string;
  endDate: string;
};

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

function mapOne(raw: unknown): Project | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const id = o.id;
  if (id === undefined || id === null) return null;
  const idStr = String(id);
  return withComputedProjectStatus({
    id: idStr,
    firmaAdi: typeof o.companyName === 'string' ? o.companyName : '',
    isim: typeof o.name === 'string' ? o.name : '',
    nitelik: typeof o.projectType === 'string' ? o.projectType : '',
    baslangicTarihi: typeof o.startDate === 'string' ? o.startDate : undefined,
    bitisTarihi: typeof o.endDate === 'string' ? o.endDate : '',
    durum: mapBackendStatus(String(o.status)),
    archived: Boolean(o.archived),
    stages: [],
    notes: [],
  });
}

export async function createProject(body: CreateProjectRequestBody): Promise<void> {
  const url = buildApiUrl('/projects');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: body.companyName,
      name: body.name,
      projectType: body.projectType,
      startDate: body.startDate,
      endDate: body.endDate,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Proje kaydı başarısız (${res.status})`);
  }
}

export async function fetchProjectsFromApi(): Promise<Project[]> {
  const url = buildApiUrl('/projects');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Proje listesi alınamadı (${res.status})`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }
  const out: Project[] = [];
  for (const item of data) {
    const p = mapOne(item);
    if (p) out.push(p);
  }
  return out;
}
