import NitelikTag from './NitelikTag';
import DataBadge from './DataBadge';
import DurumBadge from './DurumBadge';
import { getTableDurumVisual, getTableRowAccent } from '../lib/mukavimRules';
import { projectHasDilekAssignment, projectHasStaffAssignment } from '../lib/stage';
import type { AppRole, Project } from '../types';

type ViewMode = 'dashboard' | 'archive';

export default function ProjectTable({
  projects,
  onOpenDetail,
  role,
  viewMode = 'dashboard',
  onArchive,
  onUnarchive,
  onMarkDelivered,
  staffUserLabel,
}: {
  projects: readonly Project[];
  onOpenDetail: (projectId: string) => void;
  role: AppRole;
  viewMode?: ViewMode;
  onArchive?: (projectId: string) => void;
  onUnarchive?: (projectId: string) => void;
  onMarkDelivered?: (projectId: string) => void;
  staffUserLabel?: string;
}) {
  const isYonetici = role === 'yonetici';
  const isArchive = viewMode === 'archive';

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-[#070d18]/95 shadow-soft backdrop-blur-xl ring-1 ring-white/10">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-base font-bold text-white">{isArchive ? 'Arşivlenen projeler' : 'Proje listesi'}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {isArchive
            ? 'Tamamlanıp arşive alınmış projeler.'
            : role === 'personel'
              ? 'Turkuaz çerçeve: size atanmış aşama olan projeler.'
              : 'Satır rengi duruma göre değişir — sarı: devam, mavi: onay, turkuaz: teslime hazır, yeşil: teslim, kırmızı: kritik.'}
        </p>
        {!isArchive ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-amber-100">Devam</span>
            <span className="rounded-lg border border-blue-400/40 bg-blue-500/20 px-2.5 py-1 text-blue-100">Onay bekleyen</span>
            <span className="rounded-lg border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-1 text-cyan-100">Teslime hazır</span>
            <span className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1 text-emerald-100">Teslim</span>
            <span className="rounded-lg border border-red-400/40 bg-red-500/20 px-2.5 py-1 text-red-100">Kritik</span>
          </div>
        ) : null}
      </div>
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-full border-collapse text-base whitespace-nowrap lg:whitespace-normal">
          <thead className="bg-white/[0.07] text-sm uppercase tracking-wide text-slate-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Firma</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Proje</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Nitelik</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Başlangıç</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Bitiş</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Durum</th>
              <th className="px-6 py-4 text-right font-bold whitespace-nowrap">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-base text-slate-500">
                  {isArchive ? 'Arşivde kayıt yok.' : 'Liste boş.'}
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const visual = getTableDurumVisual(p);
                const kritik = visual.key === 'kritik';
                const hasMyStage =
                  role === 'personel' && staffUserLabel?.trim()
                    ? projectHasStaffAssignment(p, staffUserLabel)
                    : role === 'personel'
                      ? projectHasDilekAssignment(p)
                      : false;
                const rowAccent = isArchive
                  ? 'border-l-[5px] border-l-slate-500 bg-slate-950/40 hover:bg-slate-900/50'
                  : getTableRowAccent(p);
                const rowClass = [
                  'group border-b border-white/15 transition-all duration-200 cursor-pointer',
                  'hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                  rowAccent,
                  !isArchive && hasMyStage && role === 'personel'
                    ? 'ring-1 ring-inset ring-cyan-400/45'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr
                    key={p.id}
                    className={rowClass}
                    onClick={() => onOpenDetail(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenDetail(p.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <DataBadge size="md">{p.firmaAdi}</DataBadge>
                        {!isArchive && kritik ? (
                          <span
                            className="rounded-md border border-red-400/50 bg-red-500/35 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-red-50 shadow-[0_0_18px_-2px_rgba(248,113,113,0.95)] ring-1 ring-red-400/50"
                            title="Teslime 3 gün veya daha az"
                          >
                            KRİTİK
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DataBadge size="md" className="group-hover:border-white/20">
                        {p.isim}
                      </DataBadge>
                    </td>
                    <td className="px-6 py-4">
                      <NitelikTag nitelik={p.nitelik} large />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap tabular-nums">
                      {p.baslangicTarihi ?? '—'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap tabular-nums">
                      {p.bitisTarihi}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <DurumBadge durum={p.durum} project={p} large />
                        {role === 'personel' && hasMyStage ? (
                          <span className="rounded-md bg-cyan-500/25 px-2.5 py-1 text-xs font-bold uppercase text-cyan-50 ring-1 ring-cyan-400/45">
                            Size atandı
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(p.id)}
                          className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/25"
                        >
                          Aç
                        </button>
                        {!isArchive && isYonetici && p.durum === 'hazir' && onMarkDelivered ? (
                          <button
                            type="button"
                            onClick={() => onMarkDelivered(p.id)}
                            className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-2 text-sm font-semibold text-emerald-50 ring-1 ring-emerald-400/35 hover:bg-emerald-500/30"
                          >
                            Teslim Edildi Yap
                          </button>
                        ) : null}
                        {!isArchive && isYonetici && p.durum === 'yesil' && onArchive ? (
                          <button
                            type="button"
                            onClick={() => onArchive(p.id)}
                            className="rounded-xl border border-amber-400/40 bg-amber-500/20 px-3.5 py-2 text-sm font-semibold text-amber-50 ring-1 ring-amber-400/35 hover:bg-amber-500/30"
                          >
                            Arşive gönder
                          </button>
                        ) : null}
                        {isArchive && isYonetici && onUnarchive ? (
                          <button
                            type="button"
                            onClick={() => onUnarchive(p.id)}
                            className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold text-slate-100 hover:bg-white/15"
                          >
                            Arşivden çıkar
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
