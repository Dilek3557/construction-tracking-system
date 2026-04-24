import { buildApiUrl } from './apiBase';

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
    throw new Error(`Dashboard API ${res.status}`);
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
