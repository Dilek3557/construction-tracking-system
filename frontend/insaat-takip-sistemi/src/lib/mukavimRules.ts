import { daysUntil } from './date';
import type { Project, Stage } from '../types';

/** Teslime ≤3 gün ve proje henüz kapatılmadıysa kritik (kırmızı alarm). */
export function isKritikProje(project: Pick<Project, 'durum' | 'bitisTarihi'>): boolean {
  if (project.durum === 'yesil') return false;
  const left = daysUntil(project.bitisTarihi);
  if (left === null) return false;
  return left >= 0 && left <= 3;
}

/** Aşama bitişine ≤3 gün (tamamlanmamış aşamalar). */
export function isKritikStage(stage: Pick<Stage, 'bitisTarihi' | 'durum'> | null | undefined): boolean {
  if (!stage || stage.durum === 'yesil') return false;
  const left = daysUntil(stage.bitisTarihi);
  if (left === null || left < 0) return false;
  return left <= 3;
}

export function projectHasKritikStage(project: Pick<Project, 'stages'>): boolean {
  return (project.stages ?? []).some((s) => isKritikStage(s));
}

/** Tablo satırı: yalnızca proje teslim tarihi kritikse kırmızı kabul edilir. */
export function projectIsKritikRow(project: Pick<Project, 'archived' | 'durum' | 'bitisTarihi'>): boolean {
  if (project.archived) return false;
  return isKritikProje(project);
}

export const DURUM_META = {
  sari: {
    label: 'Devam Eden',
    dot: 'bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.65)]',
    pill: 'bg-amber-500/20 text-amber-100 ring-amber-400/35 shadow-[0_0_20px_-8px_rgba(245,158,11,0.4)]',
  },
  mavi: {
    label: 'Onay Bekleyen',
    dot: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.85)]',
    pill: 'bg-blue-500/20 text-blue-300 ring-blue-400/35 shadow-[0_0_24px_-8px_rgba(59,130,246,0.55)]',
  },
  hazir: {
    label: 'Teslime Hazır',
    dot: 'bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.85)]',
    pill: 'bg-cyan-500/20 text-cyan-100 ring-cyan-400/35 shadow-[0_0_24px_-8px_rgba(34,211,238,0.5)]',
  },
  yesil: {
    label: 'Teslim Edilen',
    dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]',
    pill: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40 shadow-[0_0_22px_-8px_rgba(16,185,129,0.5)]',
  },
  kritik: {
    label: 'Kritik',
    dot: 'bg-red-300 shadow-[0_0_10px_rgba(252,165,165,0.9)]',
    pill: 'bg-red-500/25 text-red-100 ring-red-400/45 shadow-[0_0_24px_-8px_rgba(248,113,113,0.58)]',
  },
} as const;

type ProjectVisualKey = 'yesil' | 'mavi' | 'kritik' | 'hazir' | 'normal';

function projectHasWaitingApproval(project: Pick<Project, 'durum' | 'stages'>): boolean {
  if (project.durum === 'mavi') return true;
  return (project.stages ?? []).some((s) => s.durum === 'mavi');
}

/**
 * Proje satırı tek ana durum önceliği:
 * delivered > waiting approval > critical > normal
 */
export function getTableDurumVisual(project: Pick<Project, 'durum' | 'bitisTarihi' | 'stages'>): {
  key: ProjectVisualKey;
  label: string;
  pill: string;
  dot: string;
} {
  if (project.durum === 'yesil') {
    return {
      key: 'yesil',
      label: 'Teslim Edilen',
      pill: DURUM_META.yesil.pill,
      dot: DURUM_META.yesil.dot,
    };
  }
  if (projectHasWaitingApproval(project)) {
    return {
      key: 'mavi',
      label: 'Onay Bekleyen',
      pill: DURUM_META.mavi.pill,
      dot: DURUM_META.mavi.dot,
    };
  }
  if (isKritikProje(project)) {
    return {
      key: 'kritik',
      label: 'Kritik',
      pill: DURUM_META.kritik.pill,
      dot: DURUM_META.kritik.dot,
    };
  }
  if (project.durum === 'hazir') {
    return {
      key: 'hazir',
      label: 'Teslime Hazır',
      pill: DURUM_META.hazir.pill,
      dot: DURUM_META.hazir.dot,
    };
  }
  return {
    key: 'normal',
    label: 'Devam Eden',
    pill: DURUM_META.sari.pill,
    dot: DURUM_META.sari.dot,
  };
}

/** Tablo satırı: duruma göre sol şerit + arka plan tonu */
export function getTableRowAccent(project: Pick<Project, 'durum' | 'bitisTarihi' | 'stages'>): string {
  const v = getTableDurumVisual(project);
  switch (v.key) {
    case 'yesil':
      return 'border-l-[5px] border-l-emerald-400 bg-gradient-to-r from-emerald-950/50 via-emerald-950/20 to-transparent hover:from-emerald-950/65';
    case 'mavi':
      return 'border-l-[5px] border-l-blue-400 bg-gradient-to-r from-blue-950/55 via-blue-950/25 to-transparent hover:from-blue-950/70';
    case 'kritik':
      return 'border-l-[5px] border-l-red-500 bg-gradient-to-r from-red-950/55 via-red-950/30 to-transparent hover:from-red-950/70';
    case 'hazir':
      return 'border-l-[5px] border-l-cyan-400 bg-gradient-to-r from-cyan-950/50 via-cyan-950/22 to-transparent hover:from-cyan-950/65';
    default:
      return 'border-l-[5px] border-l-amber-400/90 bg-gradient-to-r from-amber-950/40 via-amber-950/15 to-transparent hover:from-amber-950/55';
  }
}

export const ASAMA_DURUM_META = {
  bekliyor: {
    label: 'Bekliyor',
    pill: 'bg-slate-500/15 text-slate-200 ring-white/10',
  },
  mavi: {
    label: 'Onay Bekliyor',
    pill: 'bg-sky-500/20 text-sky-100 ring-sky-400/25',
  },
  yesil: {
    label: 'Onaylandı',
    pill: 'bg-emerald-500/15 text-emerald-100 ring-emerald-400/20',
  },
  kritik: {
    label: 'Kritik',
    pill: 'bg-red-500/20 text-red-100 ring-red-400/35',
  },
} as const;

/**
 * Aşama kartı tek ana durum önceliği:
 * approved > waiting approval > critical > normal
 */
export function getStageDurumVisual(stage: Pick<Stage, 'durum' | 'bitisTarihi'>) {
  if (stage.durum === 'yesil') return ASAMA_DURUM_META.yesil;
  if (stage.durum === 'mavi') return ASAMA_DURUM_META.mavi;
  if (isKritikStage(stage)) return ASAMA_DURUM_META.kritik;
  return ASAMA_DURUM_META.bekliyor;
}
