import { DURUM_META, getTableDurumVisual } from '../lib/mukavimRules';
import type { Project, ProjectDurum } from '../types';

/**
 * Table status badge (glow 3-color).
 */
export default function DurumBadge({
  durum,
  project,
  large,
}: {
  durum: ProjectDurum;
  project?: Pick<Project, 'durum' | 'bitisTarihi' | 'stages'>;
  large?: boolean;
}) {
  const m = project ? getTableDurumVisual(project) : (DURUM_META[durum] ?? DURUM_META.sari);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-bold ring-1 ${large ? 'px-3.5 py-2 text-sm' : 'px-3 py-1.5 text-xs'} ${m.pill}`}
    >
      <span className={`shrink-0 rounded-full ${large ? 'h-2.5 w-2.5' : 'h-2 w-2'} ${m.dot}`} />
      {m.label}
    </span>
  );
}

