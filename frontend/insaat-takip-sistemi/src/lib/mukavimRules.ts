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

/** Tablo satırı: proje veya herhangi bir aşama kritik */
export function projectIsKritikRow(project: Pick<Project, 'archived' | 'durum' | 'bitisTarihi' | 'stages'>): boolean {
  if (project.archived) return false;
  return isKritikProje(project) || projectHasKritikStage(project);
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
} as const;

/**
 * demo2 tablo — yalnızca 3 ana renk (MAVİ / SARI / YEŞİL). Kritik ayrıca firma yanında rozette.
 */
export function getTableDurumVisual(project: Pick<Project, 'durum'>) {
  if (project.durum === 'yesil') {
    return {
      label: 'Teslim Edilen',
      pill: DURUM_META.yesil.pill,
      dot: DURUM_META.yesil.dot,
    };
  }
  if (project.durum === 'hazir') {
    return {
      label: 'Teslime Hazır',
      pill: DURUM_META.hazir.pill,
      dot: DURUM_META.hazir.dot,
    };
  }
  if (project.durum === 'mavi') {
    return {
      label: 'Onay Bekleyen',
      pill: DURUM_META.mavi.pill,
      dot: DURUM_META.mavi.dot,
    };
  }
  return {
    label: 'Devam Eden',
    pill: DURUM_META.sari.pill,
    dot: DURUM_META.sari.dot,
  };
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
} as const;
