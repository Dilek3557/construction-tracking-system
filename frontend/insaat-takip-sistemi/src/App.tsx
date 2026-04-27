import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import ProjectTable from './components/ProjectTable';
import OfficeAnnouncement from './components/OfficeAnnouncement';
import GeneralNotesCard from './components/GeneralNotesCard';
import GlobalChart from './components/GlobalChart';
import ProjectDetailModal from './components/ProjectDetailModal';
import NewProjectModal from './components/NewProjectModal';
import LoginScreen from './components/LoginScreen';
import MyTasksPage from './components/MyTasksPage';
import StaffManagementPage from './components/StaffManagementPage';
import { daysUntil } from './lib/date';
import { withComputedProjectStatus } from './lib/stage';
import { buildMyTaskRows } from './lib/myTasks';
import { createId } from './lib/id';
import { NAME_ADMIN, NAME_DILEK, STAFF_LIST, resolveBackendUserIdFromDisplayName } from './constants';
import {
  createProject,
  deliverProject,
  fetchProjectsFromApi,
  setProjectArchived,
} from './api/projectsApi';
import {
  approveStage,
  assignUsersToStage,
  completeStageAssignment,
  createStage,
  fetchStagesByProjectId,
  mergeStagesWithPrevious,
  overlayStageFromAssignments,
} from './api/stagesApi';
import {
  fetchCriticalProjects,
  fetchDeliveredProjectCount,
  fetchWaitingApprovalStageCount,
} from './api/dashboardApi';
import * as apiService from './api/apiService';
import type {
  AppCurrentPage,
  AppRole,
  DuyuruAck,
  DuyuruState,
  GenelNot,
  ManagedUser,
  Project,
  SessionPayload,
  YoneticiListe,
} from './types';

export default function App() {
  const [session, setSession] = useState<SessionPayload | null>(() => apiService.getSession());
  const [projects, setProjects] = useState<Project[]>([]);
  /** Proje / aşama / dashboard API yenileme tetikleyicisi */
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    kritikCount: 0,
    kritikNearestName: '—',
    maviStageCount: 0,
    yesilDeliveredCount: 0,
  });
  const [role, setRole] = useState<AppRole>(() => apiService.getSession()?.role ?? apiService.getRole());
  const [currentPage, setCurrentPage] = useState<AppCurrentPage>(() => {
    const initialRole = apiService.getSession()?.role ?? apiService.getRole();
    return apiService.getCurrentPage(initialRole);
  });
  const [duyuru, setDuyuru] = useState<DuyuruState>(() => apiService.getDuyuru());
  const [duyuruDraft, setDuyuruDraft] = useState<string>(() => apiService.getDuyuru().text);
  const [duyuruAck, setDuyuruAck] = useState<DuyuruAck | null>(() => apiService.getDuyuruAck());
  const [genelNotlar, setGenelNotlar] = useState<GenelNot[]>(() => apiService.getGenelNotlar());
  const [genelNotDraft, setGenelNotDraft] = useState<string>('');
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => apiService.getUsers());

  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [newProjectOpen, setNewProjectOpen] = useState<boolean>(false);
  const [yoneticiListe, setYoneticiListe] = useState<YoneticiListe>('aktif');

  const loadProjectsFromBackend = useCallback(async () => {
    try {
      const mode = role === 'yonetici' && yoneticiListe === 'arsiv' ? 'archived' : 'active';
      const list = await fetchProjectsFromApi(mode);
      setProjects(list);
    } catch {
      setProjects([]);
    }
  }, [role, yoneticiListe]);

  const loadDashboardStats = useCallback(async () => {
    try {
      const [critical, waiting, delivered] = await Promise.all([
        fetchCriticalProjects(),
        fetchWaitingApprovalStageCount(),
        fetchDeliveredProjectCount(),
      ]);
      const sortedKritik = [...critical].sort(
        (a, b) => (daysUntil(a.bitisTarihi) ?? 99) - (daysUntil(b.bitisTarihi) ?? 99)
      );
      setDashboardStats({
        kritikCount: critical.length,
        kritikNearestName: sortedKritik[0]?.isim ?? '—',
        maviStageCount: waiting,
        yesilDeliveredCount: delivered,
      });
    } catch {
      setDashboardStats({
        kritikCount: 0,
        kritikNearestName: '—',
        maviStageCount: 0,
        yesilDeliveredCount: 0,
      });
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setProjects([]);
      return;
    }
    void loadProjectsFromBackend();
  }, [session, loadProjectsFromBackend]);

  useEffect(() => {
    if (!session || currentPage !== 'dashboard') return;
    void loadDashboardStats();
  }, [session, currentPage, dataRefreshKey, loadDashboardStats]);

  useEffect(() => {
    apiService.setRole(role);
  }, [role]);

  useEffect(() => {
    apiService.setDuyuru(duyuru);
  }, [duyuru]);

  useEffect(() => {
    apiService.setDuyuruAck(duyuruAck);
  }, [duyuruAck]);

  useEffect(() => {
    apiService.setGenelNotlar(genelNotlar);
  }, [genelNotlar]);

  useEffect(() => {
    apiService.saveUsers(managedUsers);
  }, [managedUsers]);

  useEffect(() => {
    const effectiveRole = session?.role ?? role;
    if (effectiveRole !== 'yonetici' && currentPage === 'staffManagement') {
      setCurrentPage('myTasks');
    }
  }, [session?.role, role, currentPage]);

  useEffect(() => {
    setSession((prev) => {
      if (!prev || prev.role === role) return prev;
      const next = { ...prev, role };
      apiService.setSession(next);
      return next;
    });
  }, [role]);

  const handleRoleChange = useCallback(
    (nextRole: AppRole) => {
      setRole(nextRole);
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, role: nextRole };
        apiService.setSession(next);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (!session) return;
    apiService.setCurrentPage(currentPage);
  }, [session, currentPage]);

  const navigatePage = useCallback(
    (p: AppCurrentPage) => {
      if (p === 'staffManagement' && session?.role !== 'yonetici') return;
      setCurrentPage(p);
    },
    [session?.role]
  );

  const handleLogin = useCallback(
    (payload: { userLabel: string; role: AppRole; backendUserId?: number | null }) => {
    const sess: SessionPayload = {
      userLabel: payload.userLabel.trim(),
      role: payload.role,
      backendUserId: payload.backendUserId ?? undefined,
    };
    setSession(sess);
    apiService.setSession(sess);
    setRole(payload.role);
    const page: AppCurrentPage = payload.role === 'yonetici' ? 'dashboard' : 'myTasks';
    setCurrentPage(page);
    apiService.setCurrentPage(page);
  }, []);

  const handleLogout = useCallback(() => {
    apiService.clearSession();
    apiService.clearCurrentPage();
    setSession(null);
    setDetailProjectId(null);
    setNoteDraft('');
    setProjects([]);
  }, []);

  const detailProject = useMemo<Project | null>(
    () => projects.find((p) => p.id === detailProjectId) ?? null,
    [projects, detailProjectId]
  );

  const dashboardProjects = useMemo<Project[]>(() => projects.filter((p) => !p.archived), [projects]);

  const archiveProjects = useMemo<Project[]>(() => projects.filter((p) => p.archived), [projects]);

  const myTaskRows = useMemo(() => {
    if (!session?.userLabel) return [];
    return buildMyTaskRows(projects, session.userLabel);
  }, [projects, session?.userLabel]);

  const assignableDisplayNames = useMemo(() => {
    const list = apiService.getAssignableDisplayNames(managedUsers);
    return list.length > 0 ? list : [...STAFF_LIST];
  }, [managedUsers]);

  const updateProjectById = useCallback((projectId: string, updater: (p: Project) => Project) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return withComputedProjectStatus(updater(p));
      })
    );
  }, []);

  const refreshStagesForOpenProject = useCallback(async (projectId: string) => {
    try {
      const stages = await fetchStagesByProjectId(projectId);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return withComputedProjectStatus({
            ...p,
            stages: mergeStagesWithPrevious(stages, p.stages),
          });
        })
      );
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Aşamalar yenilenemedi');
    }
  }, []);

  const openDetail = useCallback(async (id: string) => {
    setDetailProjectId(id);
    setNoteDraft('');
    try {
      const stages = await fetchStagesByProjectId(id);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return withComputedProjectStatus({
            ...p,
            stages: mergeStagesWithPrevious(stages, p.stages),
          });
        })
      );
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Aşamalar yüklenemedi');
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailProjectId(null);
    setNoteDraft('');
  }, []);

  const handleSorumlularChange = useCallback(
    async (stageId: string, sorumlular: string[]) => {
      if (!detailProjectId) return;
      const userIds = [
        ...new Set(
          sorumlular
            .map((n) => resolveBackendUserIdFromDisplayName(n))
            .filter((x): x is number => x != null)
        ),
      ];
      try {
        const assigns = await assignUsersToStage(stageId, userIds);
        updateProjectById(detailProjectId, (p) => ({
          ...p,
          stages: (p.stages ?? []).map((s) =>
            s.id === stageId ? overlayStageFromAssignments(s, assigns) : s
          ),
        }));
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Atama kaydedilemedi');
      }
    },
    [detailProjectId, updateProjectById]
  );

  const handleStageBitti = useCallback(
    async (stageId: string) => {
      if (!detailProjectId) return;
      if (session?.backendUserId == null) {
        window.alert(
          'Bu oturum için backend kullanıcı ID tanımlı değil. Girişte mustafa / dilek / ahmet kullanın.'
        );
        return;
      }
      try {
        await completeStageAssignment(stageId, {
          userId: session.backendUserId,
          completionNote: '',
        });
        await refreshStagesForOpenProject(detailProjectId);
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Kayıt başarısız');
      }
    },
    [detailProjectId, session?.backendUserId, refreshStagesForOpenProject]
  );

  const handleStageOnayla = useCallback(
    async (stageId: string) => {
      if (!detailProjectId || role !== 'yonetici') return;
      try {
        await approveStage(stageId);
        await refreshStagesForOpenProject(detailProjectId);
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Onay başarısız');
      }
    },
    [detailProjectId, role, refreshStagesForOpenProject]
  );

  const handleDeleteStage = useCallback(
    (_stageId: string) => {
      if (!detailProjectId || role !== 'yonetici') return;
      window.alert('Bu sürümde aşama silme için backend endpoint tanımlı değil.');
    },
    [detailProjectId, role]
  );

  const handleSaveStageNote = useCallback(
    (projectId: string, stageId: string, metin: string) => {
      updateProjectById(projectId, (p) => ({
        ...p,
        stages: (p.stages ?? []).map((s) => (s.id === stageId ? { ...s, not: metin } : s)),
      }));
    },
    [updateProjectById]
  );

  const handleAddStage = useCallback(
    async (projectId: string, payload: { isim: string; bitisTarihi: string; sorumlular: string[] }) => {
      try {
        let stage = await createStage(projectId, {
          name: payload.isim,
          dueDate: payload.bitisTarihi,
          note: '',
        });
        const userIds = [
          ...new Set(
            payload.sorumlular
              .map((n) => resolveBackendUserIdFromDisplayName(n))
              .filter((x): x is number => x != null)
          ),
        ];
        if (userIds.length) {
          const assigns = await assignUsersToStage(stage.id, userIds);
          stage = overlayStageFromAssignments(stage, assigns);
        }
        updateProjectById(projectId, (p) => ({
          ...p,
          stages: [...(p.stages ?? []), stage],
        }));
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Aşama eklenemedi');
      }
    },
    [updateProjectById]
  );

  const handleArchiveProject = useCallback(
    async (projectId: string) => {
      if (role !== 'yonetici') return;
      if (!confirm('Bu projeyi arşive kaldırmak istiyor musunuz?')) return;
      try {
        await setProjectArchived(projectId, true);
        await loadProjectsFromBackend();
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Arşivleme başarısız');
      }
    },
    [role, loadProjectsFromBackend]
  );

  const handleMarkDelivered = useCallback(
    async (projectId: string) => {
      if (role !== 'yonetici') return;
      try {
        await deliverProject(projectId);
        await loadProjectsFromBackend();
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Teslim işlemi başarısız');
      }
    },
    [role, loadProjectsFromBackend]
  );

  const handleUnarchiveProject = useCallback(
    async (projectId: string) => {
      if (role !== 'yonetici') return;
      try {
        await setProjectArchived(projectId, false);
        await loadProjectsFromBackend();
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Arşivden çıkarma başarısız');
      }
    },
    [role, loadProjectsFromBackend]
  );

  const handleAddNote = useCallback(() => {
    if (!detailProjectId || !noteDraft.trim()) return;
    const yazar = role === 'yonetici' ? NAME_ADMIN : session?.userLabel?.trim() || NAME_DILEK;
    updateProjectById(detailProjectId, (p) => ({
      ...p,
      notes: [...(p.notes ?? []), { id: createId('n'), yazar, metin: noteDraft.trim(), zaman: Date.now() }],
    }));
    setNoteDraft('');
  }, [detailProjectId, noteDraft, role, session?.userLabel, updateProjectById]);

  const handleAddProject = useCallback(
    async (payload: { isim: string; firmaAdi: string; nitelik: string; baslangicTarihi: string; bitisTarihi: string }) => {
      if (!payload.isim || !payload.firmaAdi || !payload.baslangicTarihi || !payload.bitisTarihi) return;
      await createProject({
        companyName: payload.firmaAdi,
        name: payload.isim,
        projectType: payload.nitelik,
        startDate: payload.baslangicTarihi,
        endDate: payload.bitisTarihi,
      });
      await loadProjectsFromBackend();
      setDataRefreshKey((k) => k + 1);
    },
    [loadProjectsFromBackend]
  );

  const saveDuyuru = useCallback(() => {
    const trimmed = duyuruDraft.trim();
    setDuyuru((prev) => {
      const nextText = trimmed || prev.text;
      const textChanged = nextText !== prev.text;
      return { text: nextText, revision: textChanged ? prev.revision + 1 : prev.revision };
    });
  }, [duyuruDraft]);

  const handleDuyuruAck = useCallback(() => {
    setDuyuruAck({ revision: duyuru.revision, at: Date.now() });
  }, [duyuru.revision]);

  const handleGenelNotSend = useCallback(() => {
    if ((role !== 'personel' && role !== 'yonetici') || !genelNotDraft.trim()) return;
    const yazar = role === 'yonetici' ? NAME_ADMIN : session?.userLabel?.trim() || NAME_DILEK;
    setGenelNotlar((prev) => [{ id: createId('gn'), yazar, metin: genelNotDraft.trim(), zaman: Date.now() }, ...prev]);
    setGenelNotDraft('');
  }, [role, genelNotDraft, session?.userLabel]);

  const listProjects = role === 'yonetici' ? (yoneticiListe === 'arsiv' ? archiveProjects : dashboardProjects) : dashboardProjects;

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const headerTitle =
    currentPage === 'staffManagement' && session.role === 'yonetici'
      ? 'Personel Yönetimi'
      : currentPage === 'myTasks'
        ? 'Görevlerim'
        : 'Dashboard';
  const headerSubtitle =
    currentPage === 'staffManagement' && session.role === 'yonetici'
      ? 'Kullanıcıları yönetin • Mukavim Mühendislik'
      : currentPage === 'myTasks'
        ? 'Size atanan aşamalar • Mukavim Mühendislik'
        : `Mukavim Mühendislik • ${role === 'yonetici' ? 'Yönetici' : 'Personel'} görünümü`;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-sky-500/25 blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-[90px]" />
      </div>

      <Sidebar
        role={role}
        sessionRole={session.role}
        onRoleChange={handleRoleChange}
        currentPage={currentPage}
        onPageChange={navigatePage}
        userLabel={session.userLabel}
        onLogout={handleLogout}
      />

      <div className="relative z-10 lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/70 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-white">{headerTitle}</h1>
              <p className="text-xs text-slate-400">{headerSubtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentPage === 'dashboard' && role === 'yonetici' ? (
                <button
                  type="button"
                  onClick={() => setNewProjectOpen(true)}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-400/35 hover:bg-emerald-500/30"
                >
                  + Yeni Proje
                </button>
              ) : null}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 backdrop-blur-sm">
                Aşama: Bitti → <span className="font-semibold text-sky-300">Mavi</span> • Onay →{' '}
                <span className="font-semibold text-emerald-300">Yeşil</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6 lg:px-8">
          {currentPage === 'staffManagement' && session.role === 'yonetici' ? (
            <StaffManagementPage users={managedUsers} onUsersChange={setManagedUsers} />
          ) : currentPage === 'dashboard' ? (
            <>
              <OfficeAnnouncement
                text={duyuru.text}
                revision={duyuru.revision}
                canEdit={role === 'yonetici'}
                draft={duyuruDraft}
                onDraftChange={setDuyuruDraft}
                onSave={saveDuyuru}
                role={role}
                ackRevision={duyuruAck?.revision}
                ackAt={duyuruAck?.at}
                onAcknowledge={handleDuyuruAck}
              />

              <section className="grid gap-3 sm:grid-cols-3">
                <StatsCard
                  variant="critical"
                  title="KRİTİK (≤3 GÜN)"
                  value={dashboardStats.kritikCount}
                  subtitle="Proje teslim tarihine ≤3 gün"
                  footerLeft="En yakını"
                  footerRight={dashboardStats.kritikNearestName}
                />
                <StatsCard
                  variant="sky"
                  title="ONAY BEKLEYEN (MAVİ)"
                  value={dashboardStats.maviStageCount}
                  subtitle="Onay bekleyen aşama (backend sayımı)"
                  footerLeft="Bekleyen"
                  footerRight={`${dashboardStats.maviStageCount} aşama`}
                />
                <StatsCard
                  variant="emerald"
                  title="TESLİM EDİLDİ (YEŞİL)"
                  value={dashboardStats.yesilDeliveredCount}
                  subtitle="Teslim edilmiş proje sayısı"
                  footerLeft="Son teslim"
                  footerRight="—"
                />
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="min-w-0 lg:col-span-8 space-y-2">
                  {role === 'yonetici' ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Genel Proje Listesi</div>
                      <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                        <button
                          type="button"
                          onClick={() => setYoneticiListe('aktif')}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                            yoneticiListe === 'aktif'
                              ? 'bg-white/15 text-white shadow-soft'
                              : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                          }`}
                        >
                          Aktif
                        </button>
                        <button
                          type="button"
                          onClick={() => setYoneticiListe('arsiv')}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                            yoneticiListe === 'arsiv'
                              ? 'bg-white/15 text-white shadow-soft'
                              : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                          }`}
                        >
                          Tamamlananlar / Arşiv
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <ProjectTable
                    projects={listProjects}
                    role={role}
                    viewMode={role === 'yonetici' && yoneticiListe === 'arsiv' ? 'archive' : 'dashboard'}
                    onOpenDetail={openDetail}
                    onMarkDelivered={role === 'yonetici' ? handleMarkDelivered : undefined}
                    onArchive={role === 'yonetici' ? handleArchiveProject : undefined}
                    onUnarchive={role === 'yonetici' ? handleUnarchiveProject : undefined}
                    staffUserLabel={role === 'personel' ? session.userLabel : undefined}
                  />
                </div>

                <aside className="min-w-0 lg:col-span-4 lg:self-start">
                  <GlobalChart refreshKey={dataRefreshKey} />
                </aside>
              </section>

              <GeneralNotesCard
                notes={genelNotlar}
                draft={genelNotDraft}
                onDraftChange={setGenelNotDraft}
                onSend={handleGenelNotSend}
              />
            </>
          ) : (
            <MyTasksPage tasks={myTaskRows} onOpenProject={openDetail} />
          )}
        </main>
      </div>

      <ProjectDetailModal
        open={Boolean(detailProjectId && detailProject)}
        project={detailProject}
        role={role}
        assignableNames={assignableDisplayNames}
        staffUserLabel={session.userLabel}
        onClose={closeDetail}
        onSorumlularChange={handleSorumlularChange}
        onStageBitti={handleStageBitti}
        onStageOnayla={handleStageOnayla}
        onDeleteStage={handleDeleteStage}
        onSaveStageNote={handleSaveStageNote}
        onAddStage={handleAddStage}
        onAddNote={handleAddNote}
        noteDraft={noteDraft}
        onNoteDraftChange={setNoteDraft}
      />

      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} onSubmit={handleAddProject} />
    </div>
  );
}

