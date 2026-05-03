import { ASAMA_DURUM_META } from '../lib/mukavimRules';
import type { MyTaskRow } from '../lib/myTasks';

export default function MyTasksPage({
  tasks,
  onOpenProject,
}: {
  tasks: readonly MyTaskRow[];
  onOpenProject: (projectId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center ring-1 ring-white/5">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-500">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-300">Size atanmış görev yok</p>
        <p className="mt-2 text-sm text-slate-500">Projelerde sorumlu olarak işaretlendiğiniz aşamalar burada listelenir.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#060b14]/90 shadow-soft backdrop-blur-xl ring-1 ring-blue-500/10">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Görevlerim</h2>
        <p className="text-xs text-slate-400">Size atanan aşamalar — tıklayarak proje detayına gidebilirsiniz.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Proje</th>
              <th className="px-4 py-3 text-left font-semibold">Firma</th>
              <th className="px-4 py-3 text-left font-semibold">Aşama</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Bitiş</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
              <th className="px-4 py-3 text-left font-semibold">Tamamlandı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-navy-950/15">
            {tasks.map((row) => {
              const meta = ASAMA_DURUM_META[row.stage.durum] ?? ASAMA_DURUM_META.bekliyor;
              return (
                <tr
                  key={`${row.projectId}-${row.stage.id}`}
                  className="cursor-pointer transition hover:bg-white/5"
                  onClick={() => onOpenProject(row.projectId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenProject(row.projectId);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td className="px-4 py-3 font-medium text-white">{row.projectName}</td>
                  <td className="px-4 py-3 text-slate-300">{row.firmaAdi}</td>
                  <td className="px-4 py-3 text-slate-200">{row.stage.isim}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.stage.bitisTarihi}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.pill}`}>{meta.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        row.completed
                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-100'
                          : 'border-amber-500/30 bg-amber-500/15 text-amber-100'
                      }`}
                    >
                      {row.completed ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
