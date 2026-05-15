import { useEffect, useState } from 'react';
import NitelikTag from './NitelikTag';
import DurumBadge from './DurumBadge';
import ChatBox from './ChatBox';
import StageCard from './StageCard';
import NewStageModal from './NewStageModal';
import { getNoteTextForUser, mergeNoteForUser } from '../lib/stageNotes';
import { daysUntil } from '../lib/date';
import { isKritikProje } from '../lib/mukavimRules';
import type { AppRole, Project } from '../types';
import type { AssignableUser } from './StageCard';
import DataBadge from './DataBadge';

export default function ProjectDetailModal({
  open,
  project,
  role,
  assignableUsers,
  onClose,
  onSorumlularChange,
  onStageBitti,
  onStageOnayla,
  onDeleteStage,
  onSaveStageNote,
  onAddStage,
  onAddNote,
  noteDraft,
  onNoteDraftChange,
  staffUserLabel,
  currentUserId,
}: {
  open: boolean;
  project: Project | null;
  role: AppRole;
  assignableUsers: readonly AssignableUser[];
  staffUserLabel?: string;
  currentUserId?: number | null;
  onClose: () => void;
  onSorumlularChange: (stageId: string, userIds: number[]) => void;
  onStageBitti: (stageId: string, completionNote: string) => void;
  onStageOnayla: (stageId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onSaveStageNote: (projectId: string, stageId: string, note: string) => void;
  onAddStage: (projectId: string, payload: { isim: string; bitisTarihi: string; userIds: number[] }) => void;
  onAddNote: () => void;
  noteDraft: string;
  onNoteDraftChange: (v: string) => void;
}) {
  const [openNoteStageId, setOpenNoteStageId] = useState<string | null>(null);
  const [stageNoteDraft, setStageNoteDraft] = useState('');
  const [newStageOpen, setNewStageOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  useEffect(() => {
    setOpenNoteStageId(null);
    setStageNoteDraft('');
    setSelectedStageId(null);
  }, [project?.id]);

  if (!open || !project) return null;

  const proj = project;

  const isYonetici = role === 'yonetici';
  const isPersonel = role === 'personel';
  const kritik = isKritikProje(proj);
  const left = daysUntil(proj.bitisTarihi);

  function handleToggleNote(stageId: string) {
    if (openNoteStageId === stageId) {
      setOpenNoteStageId(null);
      setStageNoteDraft('');
      return;
    }
    const s = (proj.stages ?? []).find((x) => x.id === stageId);
    setOpenNoteStageId(stageId);
    setStageNoteDraft(staffUserLabel ? getNoteTextForUser(s?.not ?? '', staffUserLabel) : (s?.not ?? ''));
  }

  function handleSaveNoteClick(stageId: string) {
    const s = (proj.stages ?? []).find((x) => x.id === stageId);
    const existing = s?.not ?? '';
    const merged = staffUserLabel
      ? mergeNoteForUser(existing, staffUserLabel, stageNoteDraft)
      : stageNoteDraft.trim();
    onSaveStageNote(proj.id, stageId, merged);
    setOpenNoteStageId(null);
    setStageNoteDraft('');
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
        <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Kapat" />
        <div className="relative z-10 flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 shadow-2xl ring-1 ring-sky-400/20 backdrop-blur-xl">
          <div className="shrink-0 border-b border-white/10 px-5 py-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18" />
                  <path d="M9 18 3 12l6-6" />
                </svg>
                Geri
              </button>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <DataBadge size="lg" className="font-semibold text-white">
                  {proj.isim}
                </DataBadge>
                <DataBadge size="md">{proj.firmaAdi}</DataBadge>
                <NitelikTag nitelik={proj.nitelik} />
                <DurumBadge durum={proj.durum} project={proj} />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              <section className="min-w-0 space-y-4 lg:col-span-8">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-slate-400">PROJE KÜNYESİ</div>
                      <div className="mt-2 text-sm text-slate-300">
                        Başlangıç Tarihi: <span className="font-semibold text-white">{proj.baslangicTarihi ?? '—'}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-300">
                        Bitiş Tarihi: <span className="font-semibold text-white">{proj.bitisTarihi}</span>
                      </div>
                      {kritik && left !== null ? (
                        <div className="mt-2 inline-flex rounded-lg bg-red-500/20 px-2 py-1 text-xs font-bold text-red-100 shadow-[0_0_22px_-6px_rgba(248,113,113,0.55)] ring-1 ring-red-400/30">
                          KRİTİK — Teslime {left} gün kaldı
                        </div>
                      ) : null}
                    </div>
                    {isYonetici ? (
                      <button
                        type="button"
                        onClick={() => setNewStageOpen(true)}
                        className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                      >
                        + Yeni Aşama
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
                  <div className="text-sm font-semibold text-white">Aşamalar</div>
                  <div className="mt-4 space-y-4">
                    {(proj.stages ?? []).length === 0 ? (
                      <p className="text-sm text-slate-400">Aşama yok.</p>
                    ) : (
                      (proj.stages ?? []).map((stage) => (
                        <StageCard
                          key={stage.id}
                          stage={stage}
                          isYonetici={isYonetici}
                          isPersonel={isPersonel}
                          assignableUsers={assignableUsers}
                          staffUserLabel={staffUserLabel}
                          selected={selectedStageId === stage.id}
                          dimmed={selectedStageId != null && selectedStageId !== stage.id}
                          onSelect={() =>
                            setSelectedStageId((prev) => (prev === stage.id ? null : stage.id))
                          }
                          notePanelOpen={openNoteStageId === stage.id}
                          stageNoteDraft={openNoteStageId === stage.id ? stageNoteDraft : ''}
                          onSorumlularChange={(stageId, userIds) => onSorumlularChange(stageId, userIds)}
                          onToggleNote={handleToggleNote}
                          onStageNoteDraftChange={setStageNoteDraft}
                          onSaveStageNote={handleSaveNoteClick}
                          onBitti={onStageBitti}
                          onOnayla={onStageOnayla}
                          onDelete={onDeleteStage}
                        />
                      ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="min-w-0 lg:col-span-4">
                <ChatBox
                  notes={proj.notes ?? []}
                  currentUserId={currentUserId}
                  currentUserLabel={staffUserLabel ?? (role === 'yonetici' ? 'Yönetici' : 'Personel')}
                  noteDraft={noteDraft}
                  onNoteDraftChange={onNoteDraftChange}
                  onSend={onAddNote}
                />
              </aside>
            </div>
          </div>
        </div>
      </div>

      <NewStageModal
        open={newStageOpen}
        assignableUsers={assignableUsers}
        onClose={() => setNewStageOpen(false)}
        onSubmit={(payload) => {
          onAddStage(proj.id, { isim: payload.name, bitisTarihi: payload.dueDate, userIds: payload.userIds });
          setNewStageOpen(false);
        }}
      />
    </>
  );
}

