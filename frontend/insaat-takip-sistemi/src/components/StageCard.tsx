import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { parseCompletionNoteLines } from '../lib/stageNotes';
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

export type AssignableUser = { id: number; displayName: string };

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a4 4 0 01-4 4H7l-4 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StageCard({
  stage,
  isYonetici,
  isPersonel,
  notePanelOpen,
  stageNoteDraft,
  selected = false,
  dimmed = false,
  onSelect,
  onSorumlularChange,
  onToggleNote,
  onStageNoteDraftChange,
  onSaveStageNote,
  onBitti,
  onOnayla,
  onDelete,
  staffUserLabel,
  assignableUsers,
}: {
  stage: Stage;
  isYonetici: boolean;
  isPersonel: boolean;
  assignableUsers: readonly AssignableUser[];
  staffUserLabel?: string;
  notePanelOpen: boolean;
  stageNoteDraft: string;
  selected?: boolean;
  dimmed?: boolean;
  onSelect?: () => void;
  onSorumlularChange: (stageId: string, userIds: number[]) => void;
  onToggleNote: (stageId: string) => void;
  onStageNoteDraftChange: (v: string) => void;
  onSaveStageNote: (stageId: string) => void;
  onBitti: (stageId: string, completionNote: string) => void;
  onOnayla: (stageId: string) => void;
  onDelete: (stageId: string) => void;
}) {
  const [completionNoteOpen, setCompletionNoteOpen] = useState(false);
  const savedNote = stage.not?.trim() ?? '';
  const hasSavedNote = savedNote.length > 0;
  const completionLines = parseCompletionNoteLines(savedNote);
  const prevSavedNote = useRef(savedNote);

  useEffect(() => {
    if (savedNote && savedNote !== prevSavedNote.current) {
      setCompletionNoteOpen(true);
    }
    prevSavedNote.current = savedNote;
  }, [savedNote]);

  const locked = stage.durum === 'yesil';
  const pending = stage.durum === 'mavi';
  const meta = getStageDurumVisual(stage);
  const sorumlar = getStageAssignees(stage);
  const stageKritik = isKritikStage(stage);

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

  const selectedAccent = selected
    ? locked
      ? 'border-l-4 border-l-emerald-400 shadow-[0_0_36px_-8px_rgba(52,211,153,0.45)] ring-2 ring-emerald-400/25'
      : pending
        ? 'border-l-4 border-l-sky-400 shadow-[0_0_36px_-8px_rgba(56,189,248,0.4)] ring-2 ring-sky-400/30'
        : 'border-l-4 border-l-cyan-400 shadow-[0_0_36px_-8px_rgba(34,211,238,0.35)] ring-2 ring-cyan-400/25'
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

  const selectedUserIds: number[] = Array.isArray(stage.sorumluUserIds)
    ? stage.sorumluUserIds
    : sorumlar
        .map((name) => {
          const hit = assignableUsers.find(
            (u) => (normalizePersonName(u.displayName) ?? u.displayName) === (normalizePersonName(name) ?? name)
          );
          return hit?.id ?? null;
        })
        .filter((x): x is number => x != null);

  function setSorumluCheckbox(userId: number, checked: boolean) {
    const set = new Set(selectedUserIds);
    if (checked) set.add(userId);
    else {
      if (set.size <= 1) return;
      set.delete(userId);
    }
    const next = [...set];
    if (next.length) onSorumlularChange(stage.id, next);
  }

  function stop(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
  }

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 ${borderClass} ${ringClass} ${yoneticiOnayHighlight} ${selectedAccent} ${
        dimmed ? 'opacity-90' : 'opacity-100'
      } ${completionNoteOpen || notePanelOpen ? 'bg-white/[0.07]' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {yoneticiOnayBekliyor && !selected ? (
        <div
          className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-sky-300/90 via-sky-400 to-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
          aria-hidden
        />
      ) : null}
      <div className={`flex flex-wrap items-start justify-between gap-3 ${yoneticiOnayBekliyor && !selected ? 'pl-2' : ''}`}>
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
            {hasSavedNote ? (
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  setCompletionNoteOpen((o) => !o);
                }}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                  completionNoteOpen
                    ? 'border-amber-400/40 bg-amber-500/20 text-amber-100'
                    : 'border-white/10 bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
                title="Tamamlama notunu göster/gizle"
              >
                <NoteIcon className="h-3.5 w-3.5" />
                Not
              </button>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Aşama bitişi: <span className="font-medium text-slate-300">{stage.bitisTarihi || '—'}</span>
          </div>
          {isYonetici ? (
            <div className="mt-2" onClick={stop} onKeyDown={stop}>
              <div className="text-[11px] font-medium text-slate-500">Atama (düzenle)</div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {assignableUsers.map((u) => (
                  <label
                    key={u.id}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs font-medium text-white"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-white/30 bg-navy-900"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={(e) => setSorumluCheckbox(u.id, e.target.checked)}
                    />
                    {u.displayName}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.pill}`}>
            {meta.label}
          </div>

          {hasSavedNote ? (
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                completionNoteOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-2 space-y-2" onClick={stop}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/70">
                    Tamamlama notu{completionLines.length > 1 ? ` (${completionLines.length})` : ''}
                  </div>
                  {completionLines.map((line, idx) => (
                    <div
                      key={`${line.author}-${idx}`}
                      className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2.5"
                    >
                      {line.author ? (
                        <div className="mb-1 text-xs font-semibold text-amber-100/90">{line.author}</div>
                      ) : null}
                      <p className="text-sm leading-relaxed text-amber-50/95">{line.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3 sm:ml-auto" onClick={stop} onKeyDown={stop}>
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
                onClick={() => {
                  const completionNote = (notePanelOpen ? stageNoteDraft : stage.not).trim();
                  onBitti(stage.id, completionNote);
                }}
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

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          notePanelOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        onClick={stop}
        onKeyDown={stop}
      >
        <div className="overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}
