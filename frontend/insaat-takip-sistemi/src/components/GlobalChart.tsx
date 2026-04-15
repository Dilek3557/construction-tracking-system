import { CATEGORIES } from '../constants';
import type { Project } from '../types';

/** Single global chart (English code, Turkish UI). */
const COLORS: Record<string, string> = {
  Betonarme: 'rgba(59, 130, 246, 0.92)',
  Çelik: 'rgba(245, 158, 11, 0.92)',
  Ahşap: 'rgba(16, 185, 129, 0.88)',
  Restorasyon: 'rgba(45, 212, 191, 0.85)',
};

const SWATCH: Record<string, string> = {
  Betonarme: 'bg-blue-500 shadow-[0_0_12px_-2px_rgba(59,130,246,0.7)] ring-2 ring-blue-400/40',
  Çelik: 'bg-amber-400 shadow-[0_0_12px_-2px_rgba(245,158,11,0.65)] ring-2 ring-amber-400/40',
  Ahşap: 'bg-emerald-500 shadow-[0_0_12px_-2px_rgba(16,185,129,0.65)] ring-2 ring-emerald-400/35',
  Restorasyon: 'bg-teal-400 shadow-[0_0_12px_-2px_rgba(45,212,191,0.55)] ring-2 ring-teal-400/35',
};

function buildConicGradient(projects: readonly Project[]): string {
  const total = projects.length;
  if (!total) return 'conic-gradient(from 0deg, rgba(255,255,255,0.06) 0deg 360deg)';
  let acc = 0;
  const parts: string[] = [];
  for (const cat of CATEGORIES) {
    const count = projects.filter((p) => p.nitelik === cat).length;
    if (!count) continue;
    const deg = (count / total) * 360;
    parts.push(`${COLORS[cat]} ${acc}deg ${acc + deg}deg`);
    acc += deg;
  }
  if (!parts.length) return 'conic-gradient(from 0deg, rgba(255,255,255,0.06) 0deg 360deg)';
  return `conic-gradient(from 0deg, ${parts.join(', ')})`;
}

export default function GlobalChart({ projects }: { projects: readonly Project[] }) {
  const style = { background: buildConicGradient(projects) };
  const total = projects.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-950/20 to-navy-950/40 p-3 shadow-soft backdrop-blur-xl ring-1 ring-blue-400/15 [box-shadow:0_12px_48px_-16px_rgba(59,130,246,0.15)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Nitelik Dağılımı</div>
          <div className="text-xs text-slate-400">Tablo ile senkron</div>
        </div>
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-200 ring-1 ring-blue-400/25">
          {total} proje
        </div>
      </div>

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
        {CATEGORIES.map((cat) => {
          const c = projects.filter((p) => p.nitelik === cat).length;
          return (
            <div
              key={cat}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-navy-950/50 px-3 py-2 ring-1 ring-white/5"
            >
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-sm ${SWATCH[cat] ?? 'bg-slate-400'}`} />
                <span className="text-slate-200 text-[13px]">{cat}</span>
              </div>
              <span className="font-semibold text-white">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

