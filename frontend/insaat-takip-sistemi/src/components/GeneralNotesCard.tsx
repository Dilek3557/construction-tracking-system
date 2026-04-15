import type { AppRole, GenelNot } from '../types';

/**
 * Dashboard general office notes — staff writes; admin sees all.
 */
export default function GeneralNotesCard({
  notes,
  role,
  draft,
  onDraftChange,
  onSend,
}: {
  notes: readonly GenelNot[];
  role: AppRole;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
}) {
  const sorted = [...(notes ?? [])].sort((a, b) => b.zaman - a.zaman);
  const isAdmin = role === 'yonetici';

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 shadow-soft backdrop-blur-xl ring-1 ring-sky-400/10 [box-shadow:0_8px_36px_-14px_rgba(56,189,248,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Genel Ofis Notları</div>
          <p className="mt-1 text-xs text-slate-500">
            {isAdmin ? 'Personelin bıraktığı genel notlar burada görünür.' : 'Tüm ofise görünür kısa notlar (proje dışı).'}
          </p>
        </div>
      </div>
      <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz genel not yok.</p>
        ) : (
          sorted.map((n) => (
            <div key={n.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">
              <div className="text-[11px] text-slate-500">
                {new Date(n.zaman).toLocaleString('tr-TR')} • {n.yazar}
              </div>
              <div className="mt-1 whitespace-pre-wrap text-slate-100">{n.metin}</div>
            </div>
          ))
        )}
      </div>
      {!isAdmin ? (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 ring-1 ring-sky-400/15">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={2}
            placeholder="Genel not yaz..."
            className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onSend}
            className="self-end rounded-xl bg-sky-500/30 px-4 py-2 text-xs font-semibold text-sky-50 ring-1 ring-sky-400/40 hover:bg-sky-500/45"
          >
            Gönder
          </button>
        </div>
      ) : null}
    </div>
  );
}

