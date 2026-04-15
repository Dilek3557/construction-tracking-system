import type { Project, Stage } from '../types';
import { isStageAssignedToUser } from './stage';

export type MyTaskRow = {
  projectId: string;
  projectName: string;
  firmaAdi: string;
  stage: Stage;
};

/** Aktif projelerde, kullanıcı adına atanmış aşamalar (liste için). */
export function buildMyTaskRows(projects: readonly Project[], userLabel: string): MyTaskRow[] {
  const needle = userLabel.trim();
  if (!needle) return [];

  const rows: MyTaskRow[] = [];
  for (const p of projects) {
    if (p.archived) continue;
    for (const stage of p.stages ?? []) {
      if (isStageAssignedToUser(stage, needle)) {
        rows.push({ projectId: p.id, projectName: p.isim, firmaAdi: p.firmaAdi, stage });
      }
    }
  }
  return rows.sort((a, b) => a.stage.bitisTarihi.localeCompare(b.stage.bitisTarihi));
}
