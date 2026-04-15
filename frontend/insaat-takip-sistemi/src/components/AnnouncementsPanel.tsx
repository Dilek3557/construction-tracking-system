import { useState } from 'react';
import { createId } from '../lib/id';
import type { AppRole } from '../types';

export type AnnouncementItem = {
  id: string;
  text: string;
  createdAt: number;
  readBy: string[];
};

/**
 * Multiple office announcements — admin adds/removes cards; staff acknowledges each...
 */
export default function AnnouncementsPanel({
  items,
  role,
  canEdit,
  currentUserName,
  onAdd,
  onDelete,
  onAcknowledge,
}: {
  items: readonly AnnouncementItem[];
  role: AppRole;
  canEdit: boolean;
  currentUserName: string;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const isAdmin = role === 'yonetici';
  const isStaff = role === 'personel';

  const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);

  function handleAdd() {
    const t = draft.trim();
    if (!t) return;
    onAdd(t);
    setDraft('');
    setComposerOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">Ofis Duyuruları</div>
          <p className="mt-0.5 text-[11px] text-slate-500">Yönetici ekler; personel her biri için onaylar.</p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="shrink-0 rounded-xl border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/25"
          >
            {composerOpen ? 'Kapat' : '+ Yeni'}
          </button>
        ) : null}
      </div>

      {canEdit && composerOpen ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 ring-1 ring-amber-400/20">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Duyuru metni..."
            className="w-full rounded-lg border border-white/10 bg-navy-950/80 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft('');
                setComposerOpen(false);
              }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-50 ring-1 ring-amber-400/40 hover:bg-amber-500/55"
            >
              Yayınla
            </button>
          </div>
        </div>
      ) : null}

      <div className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center text-sm text-slate-500">Henüz duyuru yok.</p>
        ) : (
          sorted.map((a) => {
            const readers = a.readBy ?? [];
            const hasRead = readers.includes(currentUserName);
            const readerLabel = readers.length === 0 ? 'Henüz kimse okumadı' : `${readers.length} kişi okudu`;

            return (
              <article
                key={a.id}
                className="rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-white/[0.03] p-3 shadow-soft ring-1 ring-amber-400/15"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 whitespace-pre-wrap text-[13px] leading-snug text-amber-50/95">{a.text}</p>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => onDelete(a.id)}
                      className="shrink-0 rounded-lg border border-red-400/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-200 hover:bg-red-500/20"
                    >
                      Sil
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-400/15 pt-2">
                  <span className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleString('tr-TR')}</span>
                  {isAdmin ? (
                    <span className="text-[11px] font-medium text-emerald-200/90">{readerLabel}</span>
                  ) : null}
                </div>
                {isStaff ? (
                  <div className="mt-2 flex justify-end">
                    {hasRead ? (
                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                        Okundu
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAcknowledge(a.id)}
                        className="rounded-lg bg-amber-500/35 px-3 py-1 text-[11px] font-bold text-amber-50 ring-1 ring-amber-400/40 hover:bg-amber-500/50"
                      >
                        Okudum
                      </button>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export function createAnnouncementItem(text: string): AnnouncementItem {
  return {
    id: createId('ann'),
    text,
    createdAt: Date.now(),
    readBy: [],
  };
}
/*nouncementsPanel – NOTLAR
🔹 1. Bu sayfa ne?

👉 Duyuru paneli (UI component)
👉 Ekranın küçük bir parçası (tüm sayfa değil)

🔹 2. Ne iş yapar?
Yönetici → duyuru ekler & siler
Personel → duyuruyu görür & “okudum” der

👉 Kısaca: Duyuru sistemi

🔹 3. Veri modeli (çok önemli)

👉 AnnouncementItem

id
text
createdAt
readBy

👉 Backend’de bu = Announcement entity

🔹 4. Dışarıdan gelenler (props)
items → duyurular
role → kullanıcı tipi
onAdd → ekleme
onDelete → silme
onAcknowledge → okudum

👉 Bu component veri üretmez → dışarıdan alır

🔹 5. İç mantık
admin mi → kontrol
personel mi → kontrol

👉 role bazlı davranış

🔹 6. Kullanıcı işlemleri
duyuru ekleme
duyuru silme
okundu işaretleme
🔹 7. Listeleme

👉 map ile duyurular ekrana basılır

🔹 8. Backend karşılığı
GET /announcements
POST /announcements
DELETE /announcements/{id}
POST /announcements/{id}/ack
🎯 KISA ÖZET (tek cümle)

👉 Bu component = duyuruları gösteren ve yönetilen UI parçası

🚀 SENİN İÇİN EN ÖNEMLİ 3 ŞEY

✔ veri modeli (AnnouncementItem)
✔ kullanıcı ne yapıyor
✔ backend karşılığı*/