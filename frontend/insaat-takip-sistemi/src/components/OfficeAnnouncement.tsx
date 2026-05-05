import { useState } from 'react';
import type { AppRole } from '../types';

/**
 * Office-wide announcement — only admin edits; staff reads & acknowledges.
 */
export default function OfficeAnnouncement({
  text,
  revision,
  canEdit,
  onSave,
  draft,
  onDraftChange,
  role,
  ackRevision,
  ackAt,
  onAcknowledge,
  readers,
}: {
  text: string;
  revision: number;
  canEdit: boolean;
  onSave: () => void;
  draft: string;
  onDraftChange: (v: string) => void;
  role: AppRole;
  ackRevision?: number;
  ackAt?: number;
  onAcknowledge: () => void;
  readers?: Array<{ userDisplayName: string; readAt?: string }>;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const isAdmin = role === 'yonetici';
  const isStaff = role === 'personel';
  const upToDate = typeof ackRevision === 'number' && ackRevision === revision;
  const readersCount = readers?.length ?? 0;

  function formatReadAt(value?: string): string {
    if (!value) return '';
    const t = Date.parse(value);
    if (!Number.isFinite(t)) return '';
    const d = new Date(t);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm} ${hh}:${mi}`;
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-white/[0.04] px-4 py-2 shadow-soft backdrop-blur-xl ring-1 ring-amber-400/25 [box-shadow:0_8px_40px_-12px_rgba(251,191,36,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-[11px] font-semibold tracking-wide text-amber-200/90">DUYURU</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-amber-300/80" aria-hidden />
            <p className="min-w-0 flex-1 truncate text-[13px] text-amber-50/95">{text || 'Henüz duyuru yok.'}</p>
          </div>
          {isAdmin ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {readersCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" />
                  {readersCount} kisi okudu
                </span>
              ) : (
                <span className="text-[11px] text-amber-200/70">Guncel duyuru henuz okunmadi.</span>
              )}
            </div>
          ) : null}
          {isAdmin && (readers?.length ?? 0) > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-200/85">
              <span className="text-amber-200/80">Okuyanlar:</span>
              {readers!.map((r) => (
                <span
                  key={`${r.userDisplayName}-${r.readAt ?? ''}`}
                  className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5"
                >
                  {r.userDisplayName}
                  {formatReadAt(r.readAt) ? ` - ${formatReadAt(r.readAt)}` : ''}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isStaff ? (
            upToDate ? (
              <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                Okundu
              </span>
            ) : (
              <button
                type="button"
                onClick={onAcknowledge}
                className="shrink-0 rounded-xl bg-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-50 ring-1 ring-amber-400/40 shadow-[0_0_18px_-6px_rgba(251,191,36,0.55)] hover:bg-amber-500/40"
              >
                Okudum
              </button>
            )
          ) : null}

          {canEdit ? (
            <button
              type="button"
              onClick={() => setEditorOpen((v) => !v)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10"
            >
              {editorOpen ? 'Kapat' : 'Düzenle'}
            </button>
          ) : null}
        </div>
      </div>

      {canEdit && editorOpen ? (
        <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={2}
            placeholder="Yeni duyuru metni..."
            className="w-full rounded-xl border border-white/10 bg-navy-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-amber-500/35 px-4 py-2 text-xs font-semibold text-amber-50 ring-1 ring-amber-400/40 hover:bg-amber-500/45"
            >
              Kaydet
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

