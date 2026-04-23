import { NAME_ADMIN, normalizePersonName } from '../constants';
import { getStageDurumVisual, isKritikStage } from '../lib/mukavimRules';
import {
  adminCanApproveStage,
  adminCanMarkStageDone,
  canOpenStageNote,
  getStageAssignees,
  isStageAssignedToUser,
  staffCanMarkStageDone,
} from '../lib/stage';
import type { Stage } from '../types';
import AssigneeStatusList from './AssigneeStatusList';

export default function StageCard({
  stage,
  isYonetici,
  isPersonel,
  notePanelOpen,
  stageNoteDraft,
  onSorumlularChange,
  onToggleNote,
  onStageNoteDraftChange,
  onSaveStageNote,
  onBitti,
  onOnayla,
  onDelete,
  staffUserLabel,
  assignableNames,
}: {
  stage: Stage;
  isYonetici: boolean;
  isPersonel: boolean;
  /** Aşama ataması için seçilebilir görünen adlar (yönetici). */
  assignableNames: readonly string[];
  /** Personel oturum adı; atanmış aşamada işlem butonları için. */
  staffUserLabel?: string;
  notePanelOpen: boolean;
  stageNoteDraft: string;
  onSorumlularChange: (stageId: string, sorumlular: string[]) => void;
  onToggleNote: (stageId: string) => void;
  onStageNoteDraftChange: (v: string) => void;
  onSaveStageNote: (stageId: string) => void;
  onBitti: (stageId: string) => void;
  onOnayla: (stageId: string) => void;
  onDelete: (stageId: string) => void;
}) {
  const locked = stage.durum === 'yesil';
  const pending = stage.durum === 'mavi';
  const meta = getStageDurumVisual(stage);
  const sorumlar = getStageAssignees(stage);
  const stageKritik = isKritikStage(stage);

  /** Yönetici: onay bekleyen aşamaları listede hızlı seçmek için ek vurgu (personelde eski stil). */
  const yoneticiOnayBekliyor = isYonetici && pending;

  const borderClass = locked
    ? 'border-emerald-500/25 bg-emerald-500/10'
    : yoneticiOnayBekliyor
      ? 'border-sky-400/50 bg-gradient-to-br from-sky-950/45 via-navy-950/30 to-navy-950/20'
      : pending
        ? 'border-sky-500/25 bg-sky-500/10'
        : stageKritik
          ? 'border-red-400/40 bg-red-500/10'
        : 'border-white/10 bg-white/5';

  const assignedToMe =
    isPersonel && staffUserLabel ? isStageAssignedToUser(stage, staffUserLabel) : false;
  const ringClass = assignedToMe
    ? 'shadow-[0_0_24px_-6px_rgba(34,211,238,0.5)] ring-2 ring-cyan-400/50'
    : '';
  const yoneticiOnayHighlight = yoneticiOnayBekliyor
    ? 'shadow-[0_0_44px_-14px_rgba(59,130,246,0.42)] ring-1 ring-sky-400/35'
    : '';

  const showNotYaz = canOpenStageNote(
    { ...stage, sorumlular: sorumlar },
    isYonetici,
    isPersonel ? staffUserLabel : undefined
  );
  const showBitti =
    staffUserLabel?.trim()
      ? isPersonel
        ? staffCanMarkStageDone({ ...stage, sorumlular: sorumlar }, staffUserLabel)
        : adminCanMarkStageDone({ ...stage, sorumlular: sorumlar }, staffUserLabel, isYonetici)
      : false;
  const managerAssigned = isYonetici && sorumlar.some((n) => (normalizePersonName(n) ?? n) === NAME_ADMIN);
  const showOnay = adminCanApproveStage(stage, { isAdmin: isYonetici, isAdminAssigned: managerAssigned });
  const showSil = isYonetici;

  function setSorumluCheckbox(ad: string, checked: boolean) {
    const set = new Set(sorumlar);
    if (checked) set.add(ad);
    else set.delete(ad);
    const next = [...set];
    if (next.length) onSorumlularChange(stage.id, next);
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm ${borderClass} ${ringClass} ${yoneticiOnayHighlight}`}
    >
      {yoneticiOnayBekliyor ? (
        <div
          className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-sky-300/90 via-sky-400 to-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
          aria-hidden
        />
      ) : null}
      <div className={`flex flex-wrap items-start justify-between gap-3 ${yoneticiOnayBekliyor ? 'pl-2' : ''}`}>
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold text-white">{stage.isim}</div>
            {assignedToMe ? (
              <span className="rounded-md bg-cyan-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-100 ring-1 ring-cyan-400/40">
                Size atandı
              </span>
            ) : null}
            {stageKritik ? (
              <span className="rounded-md bg-red-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-100 shadow-[0_0_18px_-4px_rgba(248,113,113,0.65)] ring-1 ring-red-400/45">
                KRİTİK
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Aşama bitişi: <span className="font-medium text-slate-300">{stage.bitisTarihi || '—'}</span>
          </div>
          {isYonetici ? (
            <div className="mt-2">
              <div className="text-[11px] font-medium text-slate-500">Atama (düzenle)</div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {assignableNames.map((ad) => (
                  <label
                    key={ad}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs font-medium text-white"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-white/30 bg-navy-900"
                      checked={sorumlar.includes(ad)}
                      onChange={(e) => setSorumluCheckbox(ad, e.target.checked)}
                    />
                    {ad}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.pill}`}>
            {meta.label}
          </div>
          {stage.not ? (
            <div className="mt-2 text-xs text-slate-400">
              Not: <span className="text-slate-300">{stage.not}</span>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3 sm:ml-auto">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Atananlar</span>
            <AssigneeStatusList assignees={sorumlar} durum={stage.durum} completedBy={stage.completedBy} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {showNotYaz ? (
              <button
                type="button"
                onClick={() => onToggleNote(stage.id)}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                Not Yaz
              </button>
            ) : null}
            {showBitti ? (
              <button
                type="button"
                onClick={() => onBitti(stage.id)}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                BİTTİ
              </button>
            ) : null}
            {showOnay ? (
              <button
                type="button"
                onClick={() => onOnayla(stage.id)}
                className="rounded-xl bg-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-50 ring-1 ring-emerald-400/40 hover:bg-emerald-500/40"
              >
                ONAYLA
              </button>
            ) : null}
            {showSil ? (
              <button
                type="button"
                onClick={() => onDelete(stage.id)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20"
              >
                Aşamayı Sil
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {notePanelOpen ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
          <label className="block text-xs text-slate-400">Aşama Notu</label>
          <textarea
            value={stageNoteDraft}
            onChange={(e) => onStageNoteDraftChange(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            placeholder="Aşama ile ilgili not..."
          />
          <button
            type="button"
            onClick={() => onSaveStageNote(stage.id)}
            className="mt-2 rounded-xl bg-amber-500/30 px-4 py-2 text-xs font-bold text-amber-50 ring-1 ring-amber-400/40 hover:bg-amber-500/45"
          >
            Notu Kaydet
          </button>
        </div>
      ) : null}
    </div>
  );
}

