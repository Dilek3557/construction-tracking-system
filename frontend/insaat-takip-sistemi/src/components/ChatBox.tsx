import { LEGACY_ADMIN_NAMES, NAME_ADMIN, NAME_DILEK } from '../constants';
import type { ProjectNote, UserRole } from '../types';

/**
 * demo2-style chat: admin on left, Dilek on right bubbles.
 */
function isAdminAuthor(author: string): boolean {
  if (author === NAME_ADMIN) return true;
  return LEGACY_ADMIN_NAMES.has(author);
}

export default function ChatBox({
  notes,
  role,
  staffDisplayName,
  noteDraft,
  onNoteDraftChange,
  onSend,
}: {
  notes: readonly ProjectNote[];
  role: UserRole;
  /** Personel oturum adı; balon hizalaması için (varsayılan: Dilek). */
  staffDisplayName?: string;
  noteDraft: string;
  onNoteDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  const sorted = [...(notes ?? [])].sort((a, b) => a.zaman - b.zaman);

  const staffName = staffDisplayName?.trim() || NAME_DILEK;
  const isMine = (yazar: string) => (role === 'staff' ? yazar === staffName : isAdminAuthor(yazar));

  return (
    <div className="flex max-h-[min(80vh,560px)] flex-col rounded-2xl border border-white/10 bg-white/5 shadow-soft">
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <div className="text-sm font-semibold text-white">İnteraktif Notlar</div>
        <div className="text-xs text-slate-400">Bu projeye özel sohbet</div>
      </div>
      <div className="min-h-[200px] flex-1 space-y-3 overflow-y-auto p-4">
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-500">Henüz not yok.</p>
        ) : (
          sorted.map((n) => {
            const mine = isMine(n.yazar);
            return (
              <div key={n.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : ''}`}>
                {!mine ? (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-semibold ring-1 ring-white/10">
                    {n.yazar.charAt(0)}
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl border px-3 py-2 ${
                    mine ? 'rounded-br-md border-emerald-500/25 bg-emerald-500/15' : 'rounded-bl-md border-white/10 bg-white/10'
                  }`}
                >
                  <div className="text-[11px] text-slate-400">
                    {new Date(n.zaman).toLocaleString('tr-TR')} • {n.yazar}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-white">{n.metin}</div>
                </div>
                {mine ? (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-xs font-semibold ring-1 ring-emerald-500/30">
                    D
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
          <textarea
            value={noteDraft}
            onChange={(e) => onNoteDraftChange(e.target.value)}
            rows={2}
            placeholder="Not yaz..."
            className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onSend}
            className="self-end rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/15"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

