import type { AppCurrentPage, AppRole } from '../types';

export default function Sidebar({
  sessionRole,
  currentPage,
  onPageChange,
  userLabel,
  onLogout,
  onChangePassword,
}: {
  sessionRole: AppRole;
  currentPage: AppCurrentPage;
  onPageChange: (p: AppCurrentPage) => void;
  userLabel: string;
  onLogout: () => void;
  onChangePassword: () => void;
}) {
  const roleLabel = sessionRole === 'yonetici' ? 'Yönetici' : 'Personel';

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-white/10 bg-navy-950/50 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 shadow-neon ring-1 ring-sky-400/20">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-200" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 21V8l7-4 7 4v13" />
            <path d="M9 21v-8h6v8" />
          </svg>
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-semibold tracking-wide text-white">Mukavim Mühendislik</div>
          <div className="text-xs text-slate-400">İş Takip Sistemi</div>
          <div className="mt-1 truncate text-[11px] text-sky-200/80" title={userLabel}>
            {userLabel}
          </div>
        </div>
      </div>

      <nav className="border-b border-white/10 px-3 py-3">
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Menü</div>
        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={() => onPageChange('dashboard')}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              currentPage === 'dashboard' ? 'bg-white/15 text-white shadow-soft' : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs">⌂</span>
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onPageChange('myTasks')}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              currentPage === 'myTasks' ? 'bg-white/15 text-white shadow-soft' : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs">☑</span>
            Görevlerim
          </button>
          {sessionRole === 'yonetici' ? (
            <button
              type="button"
              onClick={() => onPageChange('staffManagement')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                currentPage === 'staffManagement'
                  ? 'bg-white/15 text-white shadow-soft'
                  : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs">+</span>
              Personel Yönetimi
            </button>
          ) : null}
        </div>
      </nav>

      <div className="flex-1" />

      <div className="border-t border-white/10 p-3">
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Hesap</div>
        <button
          type="button"
          onClick={onChangePassword}
          className="mt-2 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs">🔒</span>
          Şifre Değiştir
        </button>
        <div className="mt-2 text-xs text-slate-500">
          Rol: <span className="font-semibold text-slate-300">{roleLabel}</span>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Çıkış
        </button>
      </div>
    </aside>
  );
}
