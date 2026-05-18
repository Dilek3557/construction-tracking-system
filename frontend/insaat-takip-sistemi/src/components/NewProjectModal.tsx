import { useState } from 'react';

const PROJECT_TYPE_OPTIONS = ['Betonarme', 'Çelik', 'Ahşap', 'Restorasyon', 'Diğer'] as const;

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
  }) => void | Promise<void>;
}) {
  const [selectedProjectType, setSelectedProjectType] = useState<(typeof PROJECT_TYPE_OPTIONS)[number]>('Betonarme');
  const [otherProjectType, setOtherProjectType] = useState('');

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const resolvedProjectType =
      selectedProjectType === 'Diğer' ? otherProjectType.trim() : selectedProjectType;
    if (!resolvedProjectType) return;

    try {
      await onSubmit({
        isim: String(fd.get('isim') ?? '').trim(),
        firmaAdi: String(fd.get('firmaAdi') ?? '').trim(),
        nitelik: resolvedProjectType,
        baslangicTarihi: String(fd.get('baslangicTarihi') ?? ''),
        bitisTarihi: String(fd.get('bitisTarihi') ?? ''),
      });
      form.reset();
      setSelectedProjectType('Betonarme');
      setOtherProjectType('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kayıt başarısız';
      window.alert(msg);
    }
  }

  function handleClose() {
    setSelectedProjectType('Betonarme');
    setOtherProjectType('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} aria-label="Kapat" />
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
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Proje niteliği">
              {PROJECT_TYPE_OPTIONS.map((n) => {
                const active = selectedProjectType === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedProjectType(n)}
                    className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                      active
                        ? 'border-emerald-400/50 bg-emerald-500/25 font-semibold text-emerald-50 ring-1 ring-emerald-400/30'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {selectedProjectType === 'Diğer' ? (
              <input
                name="projectTypeOther"
                value={otherProjectType}
                onChange={(e) => setOtherProjectType(e.target.value)}
                required
                placeholder="Proje türünü yazın"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />
            ) : null}
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
            <button type="button" onClick={handleClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
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

