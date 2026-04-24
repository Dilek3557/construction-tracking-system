import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { fetchProjectTypeDistribution, type ProjectTypeDistributionRow } from '../api/dashboardApi';

/** Single global chart (English code, Turkish UI). */
const COLORS: Record<string, string> = {
  Betonarme: 'rgba(59, 130, 246, 0.92)',
  Çelik: 'rgba(245, 158, 11, 0.92)',
  Ahşap: 'rgba(16, 185, 129, 0.88)',
  Restorasyon: 'rgba(45, 212, 191, 0.85)',
  Diğer: 'rgba(168, 85, 247, 0.9)',
};

const SWATCH: Record<string, string> = {
  Betonarme: 'bg-blue-500 shadow-[0_0_12px_-2px_rgba(59,130,246,0.7)] ring-2 ring-blue-400/40',
  Çelik: 'bg-amber-400 shadow-[0_0_12px_-2px_rgba(245,158,11,0.65)] ring-2 ring-amber-400/40',
  Ahşap: 'bg-emerald-500 shadow-[0_0_12px_-2px_rgba(16,185,129,0.65)] ring-2 ring-emerald-400/35',
  Restorasyon: 'bg-teal-400 shadow-[0_0_12px_-2px_rgba(45,212,191,0.55)] ring-2 ring-teal-400/35',
  Diğer: 'bg-violet-500 shadow-[0_0_12px_-2px_rgba(168,85,247,0.6)] ring-2 ring-violet-400/40',
};

const FALLBACK_PALETTE = [
  'rgba(99, 102, 241, 0.9)',
  'rgba(236, 72, 153, 0.9)',
  'rgba(14, 165, 233, 0.9)',
  'rgba(234, 179, 8, 0.9)',
  'rgba(34, 197, 94, 0.9)',
] as const;

function colorForName(name: string, index: number): string {
  if (name in COLORS) return COLORS[name]!;
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

function buildConicGradient(rows: readonly ProjectTypeDistributionRow[]): string {
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (!total) return 'conic-gradient(from 0deg, rgba(255,255,255,0.06) 0deg 360deg)';
  let acc = 0;
  const parts: string[] = [];
  rows.forEach((row, i) => {
    if (row.count <= 0) return;
    const deg = (row.count / total) * 360;
    const c = colorForName(row.name, i);
    parts.push(`${c} ${acc}deg ${acc + deg}deg`);
    acc += deg;
  });
  if (!parts.length) return 'conic-gradient(from 0deg, rgba(255,255,255,0.06) 0deg 360deg)';
  return `conic-gradient(from 0deg, ${parts.join(', ')})`;
}

export default function GlobalChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<ProjectTypeDistributionRow[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      try {
        const data = await fetchProjectTypeDistribution();
        if (cancelled) return;
        setRows(
          [...data]
            .filter((r) => r.count > 0)
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'tr-TR'))
        );
        setLoadState('ok');
      } catch (e) {
        if (cancelled) return;
        setLoadState('error');
        setErrorMessage(e instanceof Error ? e.message : 'Yükleme hatası');
        setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const style = useMemo(() => ({ background: buildConicGradient(rows) }), [rows]);
  const total = useMemo(() => rows.reduce((s, r) => s + r.count, 0), [rows]);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-950/20 to-navy-950/40 p-3 shadow-soft backdrop-blur-xl ring-1 ring-blue-400/15 [box-shadow:0_12px_48px_-16px_rgba(59,130,246,0.15)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Nitelik Dağılımı</div>
          <div className="text-xs text-slate-400">Backend ile senkron</div>
        </div>
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-200 ring-1 ring-blue-400/25">
          {loadState === 'ok' || loadState === 'error' ? `${total} proje` : '…'}
        </div>
      </div>

      {loadState === 'loading' ? (
        <div className="mt-4 rounded-xl border border-white/5 bg-navy-950/40 py-8 text-center text-sm text-slate-500">Grafik yükleniyor…</div>
      ) : loadState === 'error' ? (
        <div className="mt-3 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
          <div className="mt-1 text-xs text-red-200/80">Backend çalışıyor ve CORS / proxy ayarlı mı kontrol edin.</div>
        </div>
      ) : null}

      {loadState === 'ok' ? (
        <>
          {total === 0 ? (
            <div className="mt-4 text-center text-sm text-slate-500">Nitelik verisi yok.</div>
          ) : null}

          <div className="mt-3 grid place-items-center">
            <div
              className="relative h-44 w-44 rounded-full ring-2 ring-blue-500/20 shadow-[0_0_56px_-10px_rgba(59,130,246,0.35)]"
              style={style}
            >
              <div className="absolute inset-5 grid place-items-center rounded-full bg-navy-950/95 ring-1 ring-white/10 shadow-inner">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{total}</div>
                  <div className="text-xs text-slate-400">Toplam</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            {rows.map((row, i) => {
              const inSwatch = row.name in SWATCH;
              const sw = inSwatch ? SWATCH[row.name]! : '';
              const dotStyle: CSSProperties | undefined = inSwatch
                ? undefined
                : { backgroundColor: colorForName(row.name, i) };
              return (
                <div
                  key={`${row.name}-${i}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-navy-950/50 px-3 py-2 ring-1 ring-white/5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-sm ${inSwatch ? sw : 'ring-1 ring-white/20'}`}
                      style={dotStyle}
                    />
                    <span className="truncate text-[13px] text-slate-200">{row.name}</span>
                  </div>
                  <span className="shrink-0 pl-2 font-semibold text-white">{row.count}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
