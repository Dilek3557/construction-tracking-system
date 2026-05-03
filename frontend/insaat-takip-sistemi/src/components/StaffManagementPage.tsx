import { useEffect, useMemo, useState } from 'react';
import type { UserResponse } from '../api/usersApi';
import { createUser, type UserCreateApiRole } from '../api/usersApi';

function formatRoleLabel(roleRaw: string): string {
  const k = roleRaw.trim().toUpperCase();
  if (
    k === 'ADMIN' ||
    k === 'MANAGER' ||
    k === 'YONETICI' ||
    k === 'YÖNETİCİ'
  )
    return 'Yönetici';
  return 'Personel';
}

export default function StaffManagementPage({
  users,
  onReload,
}: {
  users: UserResponse[];
  onReload: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState<UserCreateApiRole>('PERSONEL');
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.displayName.localeCompare(b.displayName, 'tr')),
    [users]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setListError(null);
      try {
        await onReload();
      } catch (e) {
        if (!cancelled) setListError(e instanceof Error ? e.message : 'Kullanıcılar yüklenemedi');
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onReload]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitOk(null);
    const u = username.trim();
    const d = displayName.trim();
    if (!u || !d || !password) {
      setFormError('Görünen ad, kullanıcı adı ve şifre zorunludur.');
      return;
    }

    setSubmitting(true);
    try {
      await createUser({
        username: u,
        displayName: d,
        password,
        role: newRole,
      });
      setDisplayName('');
      setUsername('');
      setPassword('');
      setNewRole('PERSONEL');
      setSubmitOk('Personel kaydedildi.');
      setListLoading(true);
      await onReload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSubmitting(false);
      setListLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-md">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-base font-semibold tracking-tight text-white">Yeni personel ekle</h2>
          <p className="mt-1 text-xs text-slate-400">
            Bilgiler backend’e gönderilir. Şifre sunucunun kabul ettiği biçime göre kaydedilir.
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleAdd} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            <label className="block sm:col-span-2 lg:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Görünen ad
              </span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                placeholder="Örn. Ahmet Usta"
                autoComplete="name"
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Kullanıcı adı
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                placeholder="ör. ahmet"
                autoComplete="username"
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Şifre</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                placeholder="Geçici şifre"
                autoComplete="new-password"
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Rol</span>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserCreateApiRole)}
                className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-navy-950/80 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
              >
                <option value="PERSONEL">Personel</option>
                <option value="ADMIN">Yönetici</option>
              </select>
            </label>
            <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-8 lg:flex-row lg:items-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/35 ring-1 ring-white/10 transition hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 lg:w-auto"
              >
                {submitting ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </form>
          {formError ? (
            <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">{formError}</p>
          ) : null}
          {submitOk && !formError ? (
            <p className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">{submitOk}</p>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] ring-1 ring-white/5 backdrop-blur-sm">
        <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Personel listesi</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {listLoading ? 'Yükleniyor…' : `${sorted.length} kayıt • backend`}
            </p>
          </div>
        </div>

        {listError ? (
          <div className="px-6 py-4 text-sm text-amber-200">{listError}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 font-medium">Görünen ad</th>
                <th className="px-6 py-3.5 font-medium">Kullanıcı adı</th>
                <th className="px-6 py-3.5 font-medium">Rol</th>
                <th className="px-6 py-3.5 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {!listLoading && sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    Henüz kayıtlı kullanıcı yok veya liste alınamadı.
                  </td>
                </tr>
              ) : null}
              {sorted.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.06] text-slate-200 transition hover:bg-white/[0.03] last:border-0">
                  <td className="px-6 py-3.5 font-medium text-white">{u.displayName}</td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">{u.username}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200/90">
                      {formatRoleLabel(u.role)}
                      <span className="mx-2 text-slate-600">/</span>
                      <span className="font-normal normal-case tracking-normal text-slate-400">{u.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {u.active ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-[11px] font-semibold text-emerald-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-500/35 bg-white/5 px-3 py-0.5 text-[11px] font-semibold text-slate-400">
                        Pasif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
