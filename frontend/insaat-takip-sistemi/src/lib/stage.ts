import { NAME_DILEK, normalizePersonName } from '../constants';
import type { Project, ProjectDurum, Stage, StageDurum } from '../types';

/**
 * Aşama akışı: bekliyor → (personel) mavi → (yönetici) yeşil.
 * Proje durumu aşamalardan türetilir.
 */
export function computeProjectDurum(project: Pick<Project, 'stages' | 'durum'>): ProjectDurum {
  const stages = project.stages;
  if (!stages?.length) return project.durum ?? 'sari';
  if (stages.every((s) => s.durum === 'yesil')) {
    // Tüm aşamalar onaylıysa proje teslime hazırdır;
    // "Teslim Edildi" yalnızca yönetici tarafından ayrıca işaretlenir.
    return project.durum === 'yesil' ? 'yesil' : 'hazir';
  }
  if (stages.some((s) => s.durum === 'mavi')) return 'mavi';
  return 'sari';
}

export function withComputedProjectStatus(project: Project): Project {
  return { ...project, durum: computeProjectDurum(project) };
}

/** Aşama sorumluları (tekil sorumlu / legacy alanlar için tolerans). */
export function getStageAssignees(stage: Partial<Stage> & { sorumlu?: string }): string[] {
  if (Array.isArray(stage.sorumlular) && stage.sorumlular.length) return stage.sorumlular;
  if (typeof stage.sorumlu === 'string' && stage.sorumlu) return [stage.sorumlu];
  return [];
}

/** İki görünen ad / kullanıcı etiketi aynı kişiyi mi temsil eder (normalize). */
export function assigneeMatchesUser(assignee: string, userLabel: string): boolean {
  const a = (normalizePersonName(assignee) ?? assignee).toLocaleLowerCase('tr-TR');
  const u = (normalizePersonName(userLabel) ?? userLabel).toLocaleLowerCase('tr-TR');
  return a === u;
}

/** Girişteki kullanıcı adı ile aşama sorumluları eşleşiyor mu (normalize edilmiş). */
export function isStageAssignedToUser(stage: Partial<Stage> & { sorumlu?: string }, userLabel: string): boolean {
  const needle = userLabel.trim();
  if (!needle) return false;
  return getStageAssignees(stage).some((a) => assigneeMatchesUser(a, needle));
}

/** Projede bu kullanıcıya atanmış en az bir aşama var mı (tablo satırı vurgusu için). */
export function projectHasStaffAssignment(project: Pick<Project, 'stages'>, userLabel: string): boolean {
  const needle = userLabel.trim();
  if (!needle) return false;
  return (project.stages ?? []).some((s) => isStageAssignedToUser(s, needle));
}

export function projectHasDilekAssignment(project: Pick<Project, 'stages'>): boolean {
  return projectHasStaffAssignment(project, NAME_DILEK);
}

/** Atanan sorumlu sırasında bu kullanıcıya denk gelen görünen ad (sorumlular içinden). */
export function assigneeSlotForUser(
  stage: Partial<Stage> & { sorumlu?: string; completedBy?: string[] },
  userLabel: string
): string | null {
  const needle = userLabel.trim();
  if (!needle) return null;
  const hit = getStageAssignees(stage).find((a) => assigneeMatchesUser(a, needle));
  return hit ?? null;
}

export function hasUserCompletedTheirAssignment(
  stage: Partial<Stage> & { sorumlu?: string },
  userLabel: string
): boolean {
  const slot = assigneeSlotForUser(stage, userLabel);
  if (!slot) return false;
  const cb = stage.completedBy ?? [];
  return cb.some((c) => assigneeMatchesUser(c, slot));
}

/** Tamamlanan / toplam atanmış (bekliyor + kısmi tamamlanma göstergesi için). */
export function countAssigneeCompletion(stage: Partial<Stage> & { sorumlu?: string }): { done: number; total: number } {
  const assignees = getStageAssignees(stage);
  const cb = stage.completedBy ?? [];
  const done = assignees.filter((a) => cb.some((c) => assigneeMatchesUser(a, c))).length;
  return { done, total: assignees.length };
}

/** Bekleyen aşamada kullanıcı "BİTTİ" der: completedBy güncellenir; herkes tamamladıysa mavi olur. */
export function appendStageCompletion(stage: Stage, userLabel: string): Stage | null {
  if (stage.durum !== 'bekliyor') return null;
  const assignees = getStageAssignees(stage);
  const slot = assigneeSlotForUser(stage, userLabel);
  if (!slot) return null;
  if (hasUserCompletedTheirAssignment(stage, userLabel)) return null;
  const merged = [...(stage.completedBy ?? []), slot];
  const completedBy = assignees.filter((a) => merged.some((c) => assigneeMatchesUser(a, c)));
  const allDone = assignees.length > 0 && assignees.every((a) => completedBy.some((c) => assigneeMatchesUser(a, c)));
  return { ...stage, completedBy, durum: allDone ? 'mavi' : 'bekliyor' };
}

/** Yönetici atamayı değiştirince tamamlanma listesi ve durum tutarlı kalsın. */
export function reconcileStageAssignees(stage: Stage, newSorumlular: string[]): Stage {
  const normalized = [...new Set(newSorumlular.map((x) => normalizePersonName(x)).filter((x): x is string => Boolean(x)))];
  const cb = (stage.completedBy ?? []).filter((c) => normalized.some((a) => assigneeMatchesUser(a, c)));
  let durum = stage.durum;
  if (durum === 'mavi') {
    const allDone =
      normalized.length > 0 && normalized.every((a) => cb.some((c) => assigneeMatchesUser(a, c)));
    if (!allDone) durum = 'bekliyor';
  }
  return { ...stage, sorumlular: normalized, completedBy: cb, durum };
}

export function staffCanMarkStageDone(
  stage: Pick<Stage, 'durum' | 'sorumlular' | 'completedBy'> & { sorumlu?: string },
  userLabel: string
): boolean {
  if (stage.durum !== 'bekliyor') return false;
  if (!isStageAssignedToUser(stage, userLabel)) return false;
  return !hasUserCompletedTheirAssignment(stage, userLabel);
}

export function adminCanMarkStageDone(
  stage: Pick<Stage, 'durum' | 'sorumlular' | 'completedBy'> & { sorumlu?: string },
  userLabel: string,
  isAdmin: boolean
): boolean {
  if (!isAdmin) return false;
  if (stage.durum !== 'bekliyor') return false;
  return isStageAssignedToUser(stage, userLabel) && !hasUserCompletedTheirAssignment(stage, userLabel);
}

export function canOpenStageNote(
  stage: Pick<Stage, 'durum' | 'sorumlular' | 'completedBy'> & { sorumlu?: string },
  isAdmin: boolean,
  userLabel?: string
): boolean {
  if (stage.durum === 'yesil') return false;
  if (isAdmin) return true;
  if (!userLabel?.trim()) return false;
  return isStageAssignedToUser(stage, userLabel);
}

export function adminCanApproveStage(
  stage: Pick<Stage, 'durum'>,
  opts?: { isAdmin?: boolean; isAdminAssigned?: boolean }
): boolean {
  if (opts?.isAdmin === false) return false;
  // Yönetici onayı atama bazlı bloklanmaz; kendi atadığı/kendine atadığı stage dahil
  // mavi aşamaları onaylayabilmelidir.
  return stage.durum === 'mavi';
}

/** Eski kayıtlardaki bilinmeyen durum değerlerini aşama durumuna çevirir. */
export function mapLegacyStageStatus(status: unknown): StageDurum {
  if (status === 'yesil' || status === 'green') return 'yesil';
  if (status === 'mavi' || status === 'blue') return 'mavi';
  if (status === 'bekliyor' || status === 'pending') return 'bekliyor';
  return 'bekliyor';
}
