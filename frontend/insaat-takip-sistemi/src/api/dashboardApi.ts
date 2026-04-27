import { buildApiUrl } from './apiBase';
import { readApiErrorMessage } from './apiErrors';
import type { Project } from '../types';
import { mapProjectFromApi } from './projectsApi';

export type ProjectTypeDistributionRow = {
  name: string;
  count: number;
};

function isRow(v: unknown): v is ProjectTypeDistributionRow {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.name === 'string' && typeof o.count === 'number' && Number.isFinite(o.count);
}

export async function fetchProjectTypeDistribution(): Promise<ProjectTypeDistributionRow[]> {
  const url = buildApiUrl('/dashboard/project-type-distribution');

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Beklenmeyen yanıt');
  }
  return data.filter(isRow).map((r) => ({
    name: r.name || 'Belirtilmemiş',
    count: Math.max(0, Math.floor(r.count)),
  }));
}

export async function fetchCriticalProjects(): Promise<Project[]> {
  const url = buildApiUrl('/dashboard/critical-projects');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  const out: Project[] = [];
  for (const item of data) {
    const p = mapProjectFromApi(item);
    if (p) out.push(p);
  }
  return out;
}

export async function fetchWaitingApprovalStageCount(): Promise<number> {
  const url = buildApiUrl('/dashboard/waiting-approval-stage-count');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const n: unknown = await res.json();
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export async function fetchDeliveredProjectCount(): Promise<number> {
  const url = buildApiUrl('/dashboard/delivered-project-count');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const n: unknown = await res.json();
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
