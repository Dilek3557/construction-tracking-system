import { apiFetch } from './apiClient';
import { readApiErrorMessage } from './apiErrors';
import type { Stage, StageDurum } from '../types';

export type StageAssignmentApiRow = {
  userId?: number;
  userDisplayName?: string;
  completed?: boolean;
};

function mapBackendStageStatus(status: string): StageDurum {
  switch (status) {
    case 'WAITING_APPROVAL':
      return 'mavi';
    case 'APPROVED':
      return 'yesil';
    case 'PENDING':
    default:
      return 'bekliyor';
  }
}

function parseStageRow(raw: unknown): {
  id: string;
  name: string;
  dueDate: string;
  status: string;
  note: string;
  assignedUsers: StageAssignmentApiRow[];
} | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const id = o.id;
  if (id === undefined || id === null) return null;
  const due = o.dueDate;
  let dueStr = '';
  if (typeof due === 'string') dueStr = due;
  else if (due && typeof due === 'object' && 'toString' in due) dueStr = String(due);
  const assignedRaw = Array.isArray(o.assignedUsers) ? o.assignedUsers : [];
  const assignedUsers: StageAssignmentApiRow[] = assignedRaw
    .filter((v) => typeof v === 'object' && v !== null)
    .map((v) => {
      const a = v as Record<string, unknown>;
      return {
        userId: typeof a.userId === 'number' && Number.isFinite(a.userId) ? a.userId : undefined,
        userDisplayName: typeof a.userDisplayName === 'string' ? a.userDisplayName : undefined,
        completed: typeof a.completed === 'boolean' ? a.completed : undefined,
      };
    });
  return {
    id: String(id),
    name: typeof o.name === 'string' ? o.name : '',
    dueDate: dueStr,
    status: typeof o.status === 'string' ? o.status : 'PENDING',
    note: typeof o.note === 'string' ? o.note : '',
    assignedUsers,
  };
}

/** Tek stage satırı (atama listesi API’de yoksa boş). */
export function stageFromApiRow(raw: unknown): Stage | null {
  const p = parseStageRow(raw);
  if (!p) return null;
  const sorumlular = p.assignedUsers
    .map((a) => (typeof a.userDisplayName === 'string' ? a.userDisplayName.trim() : ''))
    .filter(Boolean);
  const completedBy = p.assignedUsers
    .filter((a) => a.completed)
    .map((a) => a.userDisplayName?.trim() ?? '')
    .filter(Boolean);
  const sorumluUserIds = p.assignedUsers
    .map((a) => (typeof a.userId === 'number' && Number.isFinite(a.userId) ? a.userId : null))
    .filter((x): x is number => x != null);
  const completedUserIds = p.assignedUsers
    .filter((a) => a.completed)
    .map((a) => (typeof a.userId === 'number' && Number.isFinite(a.userId) ? a.userId : null))
    .filter((x): x is number => x != null);
  return {
    id: p.id,
    isim: p.name,
    bitisTarihi: p.dueDate,
    sorumlular: [...new Set(sorumlular)],
    completedBy: [...new Set(completedBy)],
    sorumluUserIds: [...new Set(sorumluUserIds)],
    completedUserIds: [...new Set(completedUserIds)],
    durum: mapBackendStageStatus(p.status),
    not: p.note,
  };
}

export function mergeStagesWithPrevious(fetched: Stage[], previous: readonly Stage[] | undefined): Stage[] {
  return fetched.map((s) => {
    const p = previous?.find((x) => x.id === s.id);
    if (!p) return s;
    const keepAssignees = s.sorumlular.length === 0 && (p.sorumlular?.length ?? 0) > 0;
    if (keepAssignees) {
      return {
        ...s,
        sorumlular: [...p.sorumlular],
        completedBy: [...(p.completedBy ?? [])],
        sorumluUserIds: Array.isArray(p.sorumluUserIds) ? [...p.sorumluUserIds] : p.sorumluUserIds,
        completedUserIds: Array.isArray(p.completedUserIds) ? [...p.completedUserIds] : p.completedUserIds,
        not: s.not || p.not,
      };
    }
    return { ...s, not: s.not || p.not };
  });
}

export function overlayStageFromAssignments(stage: Stage, assignments: readonly StageAssignmentApiRow[]): Stage {
  const names = assignments
    .map((a) => (typeof a.userDisplayName === 'string' ? a.userDisplayName.trim() : ''))
    .filter(Boolean);
  const sorumlular = [...new Set(names)];
  const completedBy = assignments.filter((a) => a.completed).map((a) => a.userDisplayName?.trim() ?? '').filter(Boolean);
  const userIds = assignments
    .map((a) => (typeof a.userId === 'number' && Number.isFinite(a.userId) ? a.userId : null))
    .filter((x): x is number => x != null);
  const completedUserIds = assignments
    .filter((a) => a.completed)
    .map((a) => (typeof a.userId === 'number' && Number.isFinite(a.userId) ? a.userId : null))
    .filter((x): x is number => x != null);

  return {
    ...stage,
    sorumlular,
    completedBy,
    sorumluUserIds: [...new Set(userIds)],
    completedUserIds: [...new Set(completedUserIds)],
  };
}

export async function fetchStagesByProjectId(projectId: string): Promise<Stage[]> {
  const res = await apiFetch(`/stages/project/${encodeURIComponent(projectId)}`);
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  const out: Stage[] = [];
  for (const row of data) {
    const s = stageFromApiRow(row);
    if (s) out.push(s);
  }
  return out;
}

export async function createStage(
  projectId: string,
  body: { name: string; dueDate: string; note: string }
): Promise<Stage> {
  const res = await apiFetch(`/stages/project/${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: body.name,
      dueDate: body.dueDate,
      note: body.note,
    }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  const s = stageFromApiRow(raw);
  if (!s) throw new Error('Beklenmeyen aşama yanıtı');
  return s;
}

export async function deleteStage(stageId: string): Promise<void> {
  const res = await apiFetch(`/stages/${encodeURIComponent(stageId)}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
}

export async function assignUsersToStage(stageId: string, userIds: number[]): Promise<StageAssignmentApiRow[]> {
  const res = await apiFetch(`/stages/${encodeURIComponent(stageId)}/assign-users`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as StageAssignmentApiRow[];
}

export async function completeStageAssignment(
  stageId: string,
  body: { userId: number; completionNote: string }
): Promise<void> {
  const res = await apiFetch(`/stages/${encodeURIComponent(stageId)}/complete`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: body.userId,
      completionNote: body.completionNote,
    }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
}

export async function approveStage(stageId: string): Promise<Stage> {
  const res = await apiFetch(`/stages/${encodeURIComponent(stageId)}/approve`, { method: 'PUT' });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  const s = stageFromApiRow(raw);
  if (!s) throw new Error('Beklenmeyen aşama yanıtı');
  return s;
}
