import { useEffect, useState } from 'react';
import type { UserResponse } from '../api/usersApi';
import { resetUserPassword } from '../api/usersApi';

const MIN_LEN = 4;

export default function ResetUserPasswordModal({
  open,
  user,
  onClose,
  onSuccess,
}: {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  }, [open, user?.id]);

  if (!open || !user) return null;

  function handleClose() {
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < MIN_LEN) {
      setError(`Yeni şifre en az ${MIN_LEN} karakter olmalıdır.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    try {
      await resetUserPassword(user.id, newPassword);
      setSuccess(`${user.displayName} için şifre sıfırlandı. Personel yeni şifreyle giriş yapabilir.`);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlanamadı');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} aria-label="Kapat" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl ring-1 ring-amber-400/15">
        <h2 className="text-lg font-semibold text-white">Şifre Sıfırla</h2>
        <p className="mt-1 text-sm text-slate-300">
          <span className="font-medium text-white">{user.displayName}</span>
          <span className="text-slate-500"> ({user.username})</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Geçici şifre belirleyin; personel ilk girişte bunu kullanır.</p>

        <form autoComplete="off" onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs text-slate-400">Yeni geçici şifre</span>
            <input
              type="password"
              name="mukavim-admin-reset-a"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={MIN_LEN}
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Yeni şifre (tekrar)</span>
            <input
              type="password"
              name="mukavim-admin-reset-b"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={MIN_LEN}
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">{success}</p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              {success ? 'Kapat' : 'İptal'}
            </button>
            {!success ? (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-amber-500/30 px-4 py-2 text-xs font-semibold text-amber-50 ring-1 ring-amber-400/40 hover:bg-amber-500/40 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor…' : 'Sıfırla'}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
