type Variant = 'critical' | 'amber' | 'emerald' | 'sky';

const variantStyles: Record<
  Variant,
  { border: string; bg: string; title: string; iconWrap: string; ping: boolean }
> = {
  critical: {
    border: 'border-red-500/25',
    bg: 'bg-gradient-to-br from-red-500/15 to-white/5',
    title: 'text-red-200/90',
    iconWrap: 'bg-red-500/20 ring-red-500/25',
    ping: true,
  },
  amber: {
    border: 'border-amber-500/25',
    bg: 'bg-gradient-to-br from-amber-500/15 to-white/5',
    title: 'text-amber-200/90',
    iconWrap: 'bg-amber-500/20 ring-amber-500/25',
    ping: false,
  },
  emerald: {
    border: 'border-emerald-500/25',
    bg: 'bg-gradient-to-br from-emerald-500/15 to-white/5',
    title: 'text-emerald-200/90',
    iconWrap: 'bg-emerald-500/20 ring-emerald-500/25',
    ping: false,
  },
  sky: {
    border: 'border-sky-500/25',
    bg: 'bg-gradient-to-br from-sky-500/15 to-white/5',
    title: 'text-sky-200/90',
    iconWrap: 'bg-sky-500/20 ring-sky-500/25',
    ping: false,
  },
};

function CriticalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-red-200" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v6" />
      <path d="M12 22v-6" />
      <path d="M4.93 4.93 9.17 9.17" />
      <path d="M14.83 14.83 19.07 19.07" />
      <path d="M2 12h6" />
      <path d="M22 12h-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-200" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function SkyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-200" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}

function pickIcon(variant: Variant) {
  switch (variant) {
    case 'critical':
      return <CriticalIcon />;
    case 'amber':
      return <SpinnerIcon />;
    case 'emerald':
      return <CheckIcon />;
    case 'sky':
    default:
      return <SkyIcon />;
  }
}

export default function StatsCard({
  title,
  value,
  subtitle,
  footerLeft,
  footerRight,
  variant = 'amber',
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  footerLeft?: string;
  footerRight?: string;
  variant?: Variant;
}) {
  const v = variantStyles[variant] ?? variantStyles.amber;

  return (
    <div
      className={`rounded-2xl border ${v.border} ${v.bg} p-3 shadow-soft backdrop-blur-xl ring-1 ring-white/10 transition-all duration-300 [box-shadow:0_10px_40px_-18px_rgba(0,0,0,0.35)] hover:shadow-neon`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-xs font-semibold tracking-wide ${v.title}`}>{title}</div>
          <div className="mt-1.5 text-2xl font-bold text-white">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-200/85">{subtitle}</div> : null}
        </div>
        <div className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-2xl ring-1 ${v.iconWrap}`}>
          {v.ping ? <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-red-500/30" /> : null}
          <span className="relative">{pickIcon(variant)}</span>
        </div>
      </div>
      {footerLeft != null && footerRight != null ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm backdrop-blur-md">
          <span className="text-slate-200">{footerLeft}</span>
          <span className="max-w-[55%] truncate text-right font-semibold text-white">{footerRight}</span>
        </div>
      ) : null}
    </div>
  );
}

