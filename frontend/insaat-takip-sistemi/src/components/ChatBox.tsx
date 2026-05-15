import { useEffect, useRef } from 'react';
import { normalizePersonName } from '../constants';
import { authorInitials, avatarToneForName, formatNoteTime } from '../lib/chatUi';
import type { ProjectNote } from '../types';

function isCurrentUserNote(
  note: ProjectNote,
  currentUserId: number | null | undefined,
  currentUserLabel: string
): boolean {
  if (currentUserId != null && note.authorUserId != null) {
    return note.authorUserId === currentUserId;
  }
  const a = normalizePersonName(note.yazar) ?? note.yazar.trim();
  const b = normalizePersonName(currentUserLabel) ?? currentUserLabel.trim();
  if (!a || !b) return false;
  return a.toLocaleLowerCase('tr-TR') === b.toLocaleLowerCase('tr-TR');
}

function MessageAvatar({ name, mine }: { name: string; mine: boolean }) {
  const tone = mine
    ? 'bg-emerald-500/25 text-emerald-50 ring-emerald-400/45'
    : avatarToneForName(name);
  return (
    <div
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ring-2 ${tone}`}
      title={name}
      aria-hidden
    >
      {authorInitials(name)}
    </div>
  );
}

export default function ChatBox({
  notes,
  currentUserId,
  currentUserLabel,
  noteDraft,
  onNoteDraftChange,
  onSend,
}: {
  notes: readonly ProjectNote[];
  currentUserId?: number | null;
  currentUserLabel: string;
  noteDraft: string;
  onNoteDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  const sorted = [...(notes ?? [])].sort((a, b) => a.zaman - b.zaman);
  const meLabel = currentUserLabel.trim() || 'Siz';
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [sorted.length, sorted[sorted.length - 1]?.id]);

  return (
    <div className="flex max-h-[min(80vh,560px)] flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-navy-900/80 to-navy-950/90 shadow-soft ring-1 ring-white/10">
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <div className="text-sm font-semibold text-white">İnteraktif Notlar</div>
        <div className="text-xs text-slate-400">Mesajlar alt alta — kim yazdığı ve saat görünür</div>
      </div>

      <div ref={scrollRef} className="min-h-[220px] flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {sorted.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Henüz not yok. İlk mesajı siz yazın.</p>
          ) : (
            sorted.map((n) => {
              const mine = isCurrentUserNote(n, currentUserId, meLabel);
              const author = n.yazar.trim() || 'Bilinmeyen';
              const time = formatNoteTime(n.zaman);

              return (
                <div
                  key={n.id}
                  className={`flex w-full flex-col gap-1.5 ${mine ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-center gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <MessageAvatar name={author} mine={mine} />
                    <span className="max-w-[calc(100%-2.5rem)] truncate text-[11px] font-medium text-slate-500">
                      {author}
                      {mine ? (
                        <span className="ml-1.5 rounded bg-emerald-500/20 px-1 py-0.5 text-[10px] text-emerald-200/90">
                          Siz
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <div
                    className={`w-full max-w-full rounded-2xl border px-3.5 py-2.5 pb-6 shadow-sm sm:max-w-[95%] ${
                      mine
                        ? 'rounded-br-md border-emerald-500/30 bg-emerald-500/15'
                        : 'rounded-bl-md border-white/12 bg-white/[0.08]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100">
                      {n.metin}
                    </p>
                    <span
                      className={`mt-1 block text-[10px] font-medium tabular-nums text-slate-500 ${
                        mine ? 'text-right' : 'text-left'
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm">
          <textarea
            value={noteDraft}
            onChange={(e) => onNoteDraftChange(e.target.value)}
            rows={2}
            placeholder={`${meLabel} olarak not yazın...`}
            className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (noteDraft.trim()) onSend();
              }
            }}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!noteDraft.trim()}
            className="self-end rounded-xl bg-sky-500/25 px-4 py-2 text-xs font-semibold text-sky-50 ring-1 ring-sky-400/35 transition hover:bg-sky-500/35 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
