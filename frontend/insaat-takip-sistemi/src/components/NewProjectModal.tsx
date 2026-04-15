import { CATEGORIES } from '../constants';

export default function NewProjectModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    isim: string;
    firmaAdi: string;
    nitelik: string;
    baslangicTarihi: string;
    bitisTarihi: string;
  }) => void;
}) {
  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    onSubmit({
      isim: String(fd.get('isim') ?? '').trim(),
      firmaAdi: String(fd.get('firmaAdi') ?? '').trim(),
      nitelik: String(fd.get('nitelik') ?? 'Betonarme'),
      baslangicTarihi: String(fd.get('baslangicTarihi') ?? ''),
      bitisTarihi: String(fd.get('bitisTarihi') ?? ''),
    });
    form.reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Kapat" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl">
        <div className="text-lg font-semibold text-white">Yeni Proje</div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Proje Adı</label>
            <input name="isim" required className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Firma Adı</label>
            <input name="firmaAdi" required className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Nitelik</label>
            <select name="nitelik" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              {CATEGORIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Başlangıç Tarihi</label>
            <input
              name="baslangicTarihi"
              type="date"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Bitiş Tarihi</label>
            <input
              name="bitisTarihi"
              type="date"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
              Vazgeç
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-50 ring-1 ring-emerald-400/30 hover:bg-emerald-500/40"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

