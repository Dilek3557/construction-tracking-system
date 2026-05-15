const MAP: Record<string, string> = {
  betonarme: 'border-sky-400/50 bg-sky-500/25 text-sky-50 shadow-[0_0_16px_-6px_rgba(56,189,248,0.45)]',
  çelik: 'border-amber-400/50 bg-amber-500/25 text-amber-50 shadow-[0_0_16px_-6px_rgba(245,158,11,0.4)]',
  celik: 'border-amber-400/50 bg-amber-500/25 text-amber-50 shadow-[0_0_16px_-6px_rgba(245,158,11,0.4)]',
  ahşap: 'border-orange-400/50 bg-orange-500/25 text-orange-50 shadow-[0_0_16px_-6px_rgba(249,115,22,0.4)]',
  ahsap: 'border-orange-400/50 bg-orange-500/25 text-orange-50 shadow-[0_0_16px_-6px_rgba(249,115,22,0.4)]',
  restorasyon: 'border-violet-400/50 bg-violet-500/25 text-violet-50 shadow-[0_0_16px_-6px_rgba(167,139,250,0.4)]',
  diğer: 'border-fuchsia-400/50 bg-fuchsia-500/25 text-fuchsia-50 shadow-[0_0_16px_-6px_rgba(217,70,239,0.35)]',
  diger: 'border-fuchsia-400/50 bg-fuchsia-500/25 text-fuchsia-50 shadow-[0_0_16px_-6px_rgba(217,70,239,0.35)]',
};

function styleFor(nitelik: string): string {
  const key = nitelik.trim().toLocaleLowerCase('tr-TR');
  return MAP[key] ?? 'border-slate-400/40 bg-slate-500/20 text-slate-100';
}

export default function NitelikTag({ nitelik, large }: { nitelik: string; large?: boolean }) {
  const c = styleFor(nitelik);
  const label = nitelik.trim() || '—';
  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 font-bold tracking-wide ring-1 ring-white/10 ${large ? 'py-1 text-xs' : 'py-0.5 text-[11px]'} ${c}`}
    >
      {label}
    </span>
  );
}
