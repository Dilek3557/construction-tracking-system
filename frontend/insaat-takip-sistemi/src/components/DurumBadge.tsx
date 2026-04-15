import { DURUM_META, getTableDurumVisual } from '../lib/mukavimRules';
import type { Project, ProjectDurum } from '../types';

/**
 * Table status badge (glow 3-color).
 */
export default function DurumBadge({
  durum,
  project,
}: {
  durum: ProjectDurum;
  project?: Pick<Project, 'durum'>;
}) {
  const m = project ? getTableDurumVisual(project) : (DURUM_META[durum] ?? DURUM_META.sari);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${m.pill}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

