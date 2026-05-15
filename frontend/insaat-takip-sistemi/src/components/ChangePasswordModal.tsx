import { useState } from 'react';
import { changeMyPassword } from '../api/authApi';

const MIN_LEN = 4;

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function resetForm() {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  }

  function handleClose() {
    resetForm();
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
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (oldPassword === newPassword) {
      setError('Yeni şifre eskisiyle aynı olamaz.');
      return;
    }

    setSubmitting(true);
    try {
      await changeMyPassword(oldPassword, newPassword);
      setSuccess('Şifre başarıyla değiştirildi.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre değiştirilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} aria-label="Kapat" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl ring-1 ring-sky-400/15">
        <h2 className="text-lg font-semibold text-white">Şifre Değiştir</h2>
        <p className="mt-1 text-xs text-slate-400">Mevcut şifrenizi girip yeni şifrenizi belirleyin.</p>

        {/* autoComplete kapalı: tarayıcı "kayıtlı şifreyi güncelle / hangi hesap" kutusunu tetiklemesin */}
        <form autoComplete="off" onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs text-slate-400">Eski şifre</span>
            <input
              type="password"
              name="mukavim-existing-secret"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Yeni şifre</span>
            <input
              type="password"
              name="mukavim-new-secret-a"
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
              name="mukavim-new-secret-b"
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
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              {success}
            </p>
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
                className="rounded-xl bg-sky-500/30 px-4 py-2 text-xs font-semibold text-sky-50 ring-1 ring-sky-400/40 hover:bg-sky-500/40 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
