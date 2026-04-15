import { useMemo, useState } from 'react';
import * as apiService from '../api/apiService';
import type { AppRole, ManagedUser } from '../types';

export default function StaffManagementPage({
  users,
  onUsersChange,
}: {
  users: ManagedUser[];
  onUsersChange: (next: ManagedUser[]) => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('personel');
  const [activeNew, setActiveNew] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.displayName.localeCompare(b.displayName, 'tr')),
    [users]
  );

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const next = apiService.addUser(users, {
      displayName,
      username,
      password,
      role: newRole,
      active: activeNew,
    });
    if (!next) {
      setFormError('Görünen ad ve kullanıcı adı zorunludur; kullanıcı adı benzersiz olmalıdır.');
      return;
    }
    onUsersChange(next);
    setDisplayName('');
    setUsername('');
    setPassword('');
    setNewRole('personel');
    setActiveNew(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-white">Yeni kullanıcı ekle</h2>
        <p className="mt-1 text-xs text-slate-400">Şifre alanı yalnızca kayıt içindir; girişte doğrulanmaz (demo).</p>
        <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Görünen ad</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="Örn. Ayşe Yılmaz"
              autoComplete="name"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Kullanıcı adı</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="ör. ayse.yilmaz"
              autoComplete="username"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>
          <label className="flex flex-col sm:col-span-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Rol</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value === 'yonetici' ? 'yonetici' : 'personel')}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-navy-950/80 px-3 py-2 text-sm text-white focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="personel">Personel</option>
              <option value="yonetici">Yönetici</option>
            </select>
          </label>
          <label className="flex items-end gap-2 sm:col-span-1">
            <input
              type="checkbox"
              checked={activeNew}
              onChange={(e) => setActiveNew(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-sky-500 focus:ring-sky-500/30"
            />
            <span className="pb-2 text-sm text-slate-300">Aktif</span>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/25 ring-1 ring-white/10 hover:from-sky-500 hover:to-indigo-500 sm:w-auto"
            >
              Kullanıcı ekle
            </button>
          </div>
        </form>
        {formError ? <p className="mt-3 text-xs text-amber-300">{formError}</p> : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/5 backdrop-blur-sm">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Mevcut kullanıcılar</h2>
          <p className="mt-0.5 text-xs text-slate-400">{sorted.length} kayıt</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Görünen ad</th>
                <th className="px-5 py-3 font-medium">Kullanıcı adı</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u.id} className="border-b border-white/5 text-slate-200 last:border-0">
                  <td className="px-5 py-3 font-medium text-white">{u.displayName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{u.username}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => {
                        const r = e.target.value === 'yonetici' ? 'yonetici' : 'personel';
                        onUsersChange(apiService.updateUserRole(users, u.id, r));
                      }}
                      className="rounded-lg border border-white/10 bg-navy-950/90 px-2 py-1.5 text-xs text-white focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                      aria-label={`${u.displayName} rolü`}
                    >
                      <option value="personel">Personel</option>
                      <option value="yonetici">Yönetici</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={u.active}
                        onChange={(e) => {
                          onUsersChange(apiService.updateUserStatus(users, u.id, e.target.checked));
                        }}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      <span className="text-xs text-slate-400">{u.active ? 'Aktif' : 'Pasif'}</span>
                    </label>
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
