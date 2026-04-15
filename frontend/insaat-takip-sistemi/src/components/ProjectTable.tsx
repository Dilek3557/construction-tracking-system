import NitelikTag from './NitelikTag';
import DurumBadge from './DurumBadge';
import { projectIsKritikRow } from '../lib/mukavimRules';
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
  /** Personel: bu isimle eşleşen en az bir aşaması olan projelerde satır vurgusu. */
  staffUserLabel?: string;
}) {
  const isYonetici = role === 'yonetici';
  const isArchive = viewMode === 'archive';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#060b14]/90 shadow-soft backdrop-blur-xl ring-1 ring-blue-500/10 [box-shadow:0_0_48px_-20px_rgba(59,130,246,0.14)]">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{isArchive ? 'Arşivlenen projeler' : 'Proje listesi'}</h2>
        <p className="text-xs text-slate-400">
          {isArchive
            ? 'Tamamlanıp arşive alınmış projeler. Ana liste bu kayıtları göstermez.'
            : role === 'personel'
              ? 'Tüm projeler listelenir. Turkuaz çerçeve ve “Size atandı” rozeti, en az bir aşamada size atanma olduğunu gösterir.'
              : 'Durum: mavi / sarı / yeşil fosforlu rozetler; kritik işlerde firma yanında KRİTİK.'}
        </p>
      </div>
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-full border-collapse text-sm whitespace-nowrap lg:whitespace-normal">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Firma</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Proje</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Nitelik</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Başlangıç</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Bitiş</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Durum</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-navy-950/15">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  {isArchive ? 'Arşivde kayıt yok.' : 'Liste boş.'}
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const kritik = projectIsKritikRow(p);
                const hasMyStage =
                  role === 'personel' && staffUserLabel?.trim()
                    ? projectHasStaffAssignment(p, staffUserLabel)
                    : role === 'personel'
                      ? projectHasDilekAssignment(p)
                      : false;
                const rowClass = [
                  'border-b border-white/10',
                  !isArchive && hasMyStage && role === 'personel'
                    ? 'shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)] bg-cyan-950/20'
                    : '',
                  kritik ? 'shadow-[inset_4px_0_0_0_rgba(248,113,113,0.95)] bg-red-950/25' : '',
                  'hover:bg-white/5',
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
                    <td className="px-4 py-2.5 font-medium text-white">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-50">{p.firmaAdi}</span>
                        {!isArchive && kritik ? (
                          <span
                            className="rounded-md border border-red-400/40 bg-red-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-50 shadow-[0_0_18px_-2px_rgba(248,113,113,0.95)] ring-1 ring-red-400/50"
                            title="Teslime 3 gün veya daha az"
                          >
                            KRİTİK
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-100">{p.isim}</td>
                    <td className="px-4 py-2.5">
                      <NitelikTag nitelik={p.nitelik} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-200 whitespace-nowrap">{p.baslangicTarihi}</td>
                    <td className="px-4 py-2.5 text-slate-200 whitespace-nowrap">{p.bitisTarihi}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <DurumBadge durum={p.durum} project={p} />
                        {role === 'personel' && hasMyStage ? (
                          <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-100 ring-1 ring-cyan-400/40">
                            Size atandı
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(p.id)}
                          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 shadow-soft transition hover:bg-white/15 hover:ring-white/15"
                        >
                          Aç
                        </button>
                        {!isArchive && isYonetici && p.durum === 'hazir' && onMarkDelivered ? (
                          <button
                            type="button"
                            onClick={() => onMarkDelivered(p.id)}
                            className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25"
                          >
                            Teslim Edildi Yap
                          </button>
                        ) : null}
                        {!isArchive && isYonetici && p.durum === 'yesil' && onArchive ? (
                          <button
                            type="button"
                            onClick={() => onArchive(p.id)}
                            className="rounded-xl border border-amber-400/35 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-500/25"
                          >
                            Arşive gönder
                          </button>
                        ) : null}
                        {isArchive && isYonetici && onUnarchive ? (
                          <button
                            type="button"
                            onClick={() => onUnarchive(p.id)}
                            className="rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/15"
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

