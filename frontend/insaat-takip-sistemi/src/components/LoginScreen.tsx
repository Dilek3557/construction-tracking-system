import { useState } from 'react';
import { loginApi } from '../api/authApi';
import * as apiService from '../api/apiService';

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const u = username.trim();
    if (!u || !password) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }

    setSubmitting(true);
    try {
      const { token, user } = await loginApi(u, password);
      apiService.clearSession();
      apiService.clearCurrentPage();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-slate-950 px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-sky-500/25 blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/10 shadow-neon ring-1 ring-sky-400/20">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-sky-200" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18" />
              <path d="M5 21V8l7-4 7 4v13" />
              <path d="M9 21v-8h6v8" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Mukavim Mühendislik</h1>
          <p className="mt-2 text-sm text-slate-400">İş Takip Sistemi — Giriş</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-navy-950/60 p-8 shadow-soft ring-1 ring-white/5 backdrop-blur-xl"
        >
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Kullanıcı adı</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="ör. mustafa"
            />
          </label>

          <label className="mt-6 block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 w-full rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 py-3 text-sm font-semibold text-emerald-50 shadow-lg ring-1 ring-emerald-400/25 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
          >
            {submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
            Kimlik bilgileri backend üzerinden doğrulanır. Oturum güvenliği için token kullanılır.
          </p>
        </form>
      </div>
    </div>
  );
}
