const MAP: Record<string, string> = {
  Betonarme: 'border-sky-500/40 bg-sky-500/15 text-sky-100',
  Çelik: 'border-amber-500/40 bg-amber-500/15 text-amber-100',
  Ahşap: 'border-orange-500/40 bg-orange-500/15 text-orange-100',
  Restorasyon: 'border-violet-500/40 bg-violet-500/15 text-violet-100',
};

export default function NitelikTag({ nitelik }: { nitelik: string }) {
  const c = MAP[nitelik] ?? 'border-white/20 bg-white/10 text-slate-100';
  return (
    <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-bold tracking-wide ${c}`}>
      [{String(nitelik).toUpperCase()}]
    </span>
  );
}

