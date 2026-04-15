import { useEffect, useMemo, useState } from 'react';

export default function NewStageModal({
  open,
  onClose,
  onSubmit,
  assignableNames,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; dueDate: string; assignees: string[] }) => void;
  assignableNames: readonly string[];
}) {
  const defaultAssignee = assignableNames[0] ?? '';
  const [assignees, setAssignees] = useState<Set<string>>(() => new Set(defaultAssignee ? [defaultAssignee] : []));
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const first = assignableNames[0];
    setAssignees(new Set(first ? [first] : []));
  }, [open, assignableNames]);

  const filteredStaff = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    const pool = [...assignableNames];
    if (!q) return pool;
    return pool.filter((name) => name.toLocaleLowerCase('tr-TR').includes(q));
  }, [query, assignableNames]);

  if (!open) return null;

  function toggle(name: string) {
    setAssignees((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size <= 1) return next;
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get('name') ?? '').trim();
    const dueDate = String(fd.get('dueDate') ?? '').trim();
    const list = [...assignees];
    if (!name || !dueDate || !list.length) return;
    onSubmit({ name, dueDate, assignees: list });
    form.reset();
    const first = assignableNames[0];
    setAssignees(new Set(first ? [first] : []));
    setQuery('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Kapat" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
        <div className="text-lg font-semibold text-white">Yeni Aşama</div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-slate-400">Aşama Adı</label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              placeholder="Örn. Kurul Onayı"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Bitiş Tarihi</label>
            <input
              name="dueDate"
              type="date"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </div>
          <div>
            <div className="text-xs text-slate-400">Sorumlular</div>
            <p className="mt-0.5 text-[11px] text-slate-500">Birden fazla seçebilirsiniz. Liste Personel Yönetimi kayıtlarından gelir.</p>
            {assignableNames.length === 0 ? (
              <p className="mt-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                Atanabilir aktif kullanıcı yok. Önce Personel Yönetimi üzerinden kullanıcı ekleyin.
              </p>
            ) : (
              <>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Personel ara..."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  autoComplete="off"
                />
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-2 pr-1 shadow-inner ring-1 ring-white/5 [scrollbar-width:thin]">
                  <div className="flex flex-col gap-1.5 pr-1">
                    {filteredStaff.length === 0 ? (
                      <p className="py-3 text-center text-xs text-slate-500">Eşleşen personel yok.</p>
                    ) : (
                      filteredStaff.map((name) => (
                        <label
                          key={name}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-200 hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-white/20 bg-navy-900 text-sky-500 focus:ring-sky-400/40"
                            checked={assignees.has(name)}
                            onChange={() => toggle(name)}
                          />
                          {name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={assignableNames.length === 0}
              className="rounded-xl bg-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-50 ring-1 ring-emerald-400/30 hover:bg-emerald-500/40 disabled:pointer-events-none disabled:opacity-40"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
