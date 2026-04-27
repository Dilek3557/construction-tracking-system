import { useState } from 'react';
import type { AppRole } from '../types';
import { resolveBackendUserIdFromLoginUsername } from '../constants';

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (payload: { userLabel: string; role: AppRole; backendUserId?: number | null }) => void;
}) {
  const [userLabel, setUserLabel] = useState('mustafa');
  const [role, setRole] = useState<AppRole>('yonetici');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = userLabel.trim();
    if (!trimmed) return;
    const backendUserId = resolveBackendUserIdFromLoginUsername(trimmed);
    onLogin({ userLabel: trimmed, role, backendUserId });
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-sky-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_-8px_rgba(56,189,248,0.35)] ring-1 ring-sky-500/20">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 21h18" />
              <path d="M5 21V8l7-4 7 4v13" />
              <path d="M9 21v-8h6v8" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Mukavim Mühendislik</h1>
          <p className="mt-2 text-sm text-slate-400">İş Takip Sistemi — Kurumsal giriş</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-navy-950/80 p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/5 backdrop-blur-xl"
        >
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Kullanıcı adı veya e-posta</span>
            <input
              type="text"
              autoComplete="username"
              value={userLabel}
              onChange={(e) => setUserLabel(e.target.value)}
              placeholder="ör. Dilek veya ad.soyad@firma.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </label>

          <div className="mt-6">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Rol</span>
            <div className="mt-2 flex rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => {
                  setRole('yonetici');
                  setUserLabel('mustafa');
                }}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  role === 'yonetici' ? 'bg-white/15 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                Yönetici
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('personel');
                  setUserLabel('dilek');
                }}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  role === 'personel' ? 'bg-white/15 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                Personel
              </button>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Şifre</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </label>

          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 ring-1 ring-white/10 transition hover:from-sky-500 hover:to-indigo-500"
          >
            Giriş Yap
          </button>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
            Demo ortamıdır; şifre doğrulaması yapılmaz. Görevlerinizde isim eşleşmesi için sahadaki isimle aynı giriş kullanın.
          </p>
        </form>
      </div>
    </div>
  );
}
