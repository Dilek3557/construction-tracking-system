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
import type { MyTaskRow } from './lib/myTasks';
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
  deleteStage,
  fetchStagesByProjectId,
  mergeStagesWithPrevious,
  overlayStageFromAssignments,
} from './api/stagesApi';
import {
  fetchCriticalProjects,
  fetchDeliveredProjectCount,
  fetchWaitingApprovalStageCount,
} from './api/dashboardApi';
import { fetchUsers, type UserResponse } from './api/usersApi';
import { addProjectNote, fetchProjectNotes } from './api/projectNotesApi';
import { addGeneralNote, fetchGeneralNotes } from './api/generalNotesApi';
import {
  acknowledgeAnnouncement,
  fetchAnnouncementAcks,
  fetchAckStatus,
  fetchCurrentAnnouncement,
  type AnnouncementAckRow,
  updateCurrentAnnouncement,
} from './api/announcementsApi';
import { AUTH_LOST_EVENT } from './api/apiClient';
import { clearAuth, readSessionPayload } from './api/authStorage';
import * as apiService from './api/apiService';
import type {
  AppCurrentPage,
  DuyuruAck,
  DuyuruState,
  GenelNot,
  Project,
  SessionPayload,
  YoneticiListe,
} from './types';

function initialSession(): SessionPayload | null {
  return readSessionPayload();
}

export default function App() {
  const [session, setSession] = useState<SessionPayload | null>(() => initialSession());
  const [projects, setProjects] = useState<Project[]>([]);
  /** Proje / aşama / dashboard API yenileme tetikleyicisi */
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    kritikCount: 0,
    kritikNearestName: '—',
    maviStageCount: 0,
    yesilDeliveredCount: 0,
  });
  const [currentPage, setCurrentPage] = useState<AppCurrentPage>(() => {
    const s = initialSession();
    return apiService.getCurrentPage(s?.role ?? 'personel');
  });
  const [duyuru, setDuyuru] = useState<DuyuruState>({ text: '', revision: 1 });
  const [duyuruDraft, setDuyuruDraft] = useState<string>('');
  const [duyuruAck, setDuyuruAck] = useState<DuyuruAck | null>(null);
  const [genelNotlar, setGenelNotlar] = useState<GenelNot[]>([]);
  const [genelNotDraft, setGenelNotDraft] = useState<string>('');
  const [backendUsers, setBackendUsers] = useState<UserResponse[]>([]);

  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [newProjectOpen, setNewProjectOpen] = useState<boolean>(false);
  const [yoneticiListe, setYoneticiListe] = useState<YoneticiListe>('aktif');
  const [announcementId, setAnnouncementId] = useState<number | null>(null);
  const [announcementReaders, setAnnouncementReaders] = useState<AnnouncementAckRow[]>([]);
  const [myTasksRows, setMyTasksRows] = useState<MyTaskRow[]>([]);

  const loadProjectsFromBackend = useCallback(async () => {
    try {
      const r = session?.role ?? 'personel';
      const mode = r === 'yonetici' && yoneticiListe === 'arsiv' ? 'archived' : 'active';
      const list = await fetchProjectsFromApi(mode);
      setProjects(list);
    } catch {
      setProjects([]);
    }
  }, [session?.role, yoneticiListe]);

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

  const loadUsersFromBackend = useCallback(async () => {
    try {
      const list = await fetchUsers();
      setBackendUsers(list);
    } catch (e) {
      setBackendUsers([]);
      console.warn(e);
    }
  }, []);

  /** Personel sayfası: hata kullanıcıya gösterilsin */
  const reloadUsersFromBackendStrict = useCallback(async () => {
    const list = await fetchUsers();
    setBackendUsers(list);
  }, []);

  const loadMyTasksFromBackend = useCallback(async () => {
    if (!session || session.backendUserId == null) {
      setMyTasksRows([]);
      return;
    }
    try {
      const activeProjects = await fetchProjectsFromApi('active');
      const stagesByProject = await Promise.all(
        activeProjects.map(async (p) => {
          const stages = await fetchStagesByProjectId(p.id);
          return { project: p, stages };
        })
      );

      const out: MyTaskRow[] = [];
      for (const item of stagesByProject) {
        for (const stage of item.stages) {
          const assigned = stage.sorumluUserIds ?? [];
          if (!assigned.includes(session.backendUserId)) continue;
          out.push({
            projectId: item.project.id,
            projectName: item.project.isim,
            firmaAdi: item.project.firmaAdi,
            stage,
            completed: (stage.completedUserIds ?? []).includes(session.backendUserId),
          });
        }
      }
      out.sort((a, b) => a.stage.bitisTarihi.localeCompare(b.stage.bitisTarihi));
      setMyTasksRows(out);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Görevlerim yüklenemedi');
      setMyTasksRows([]);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      setProjects([]);
      return;
    }
    void loadProjectsFromBackend();
    void (async () => {
      await loadUsersFromBackend();
    })();
  }, [session, loadProjectsFromBackend, loadUsersFromBackend]);

  useEffect(() => {
    const onAuthLost = () => {
      clearAuth();
      apiService.clearSession();
      apiService.clearCurrentPage();
      setSession(null);
      setDetailProjectId(null);
      setNoteDraft('');
      setProjects([]);
    };
    window.addEventListener(AUTH_LOST_EVENT, onAuthLost);
    return () => window.removeEventListener(AUTH_LOST_EVENT, onAuthLost);
  }, []);

  const loadAnnouncementFromBackend = useCallback(async () => {
    try {
      const current = await fetchCurrentAnnouncement();
      if (!current) {
        setAnnouncementId(null);
        setDuyuru({ text: '', revision: 1 });
        setDuyuruDraft('');
        setDuyuruAck(null);
        setAnnouncementReaders([]);
        return;
      }
      setAnnouncementId(current.id);
      setDuyuru({ text: current.message, revision: current.revision });
      setDuyuruDraft(current.message);
      const ok = await fetchAckStatus(current.id);
      setDuyuruAck(ok ? { revision: current.revision, at: Date.now() } : null);
      if (session?.role === 'yonetici') {
        const readers = await fetchAnnouncementAcks(current.id);
        setAnnouncementReaders(readers);
      } else {
        setAnnouncementReaders([]);
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Duyuru yüklenemedi');
    }
  }, [session?.role]);

  const loadGeneralNotesFromBackend = useCallback(async () => {
    try {
      const rows = await fetchGeneralNotes();
      setGenelNotlar(
        rows.map((r) => ({
          id: String(r.id),
          yazar: r.authorName,
          metin: r.message,
          zaman: Number.isFinite(Date.parse(r.createdAt)) ? Date.parse(r.createdAt) : Date.now(),
        }))
      );
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Genel notlar yüklenemedi');
      setGenelNotlar([]);
    }
  }, []);

  useEffect(() => {
    if (!session || currentPage !== 'dashboard') return;
    void loadDashboardStats();
  }, [session, currentPage, dataRefreshKey, loadDashboardStats]);

  useEffect(() => {
    if (!session || currentPage !== 'dashboard') return;
    void loadAnnouncementFromBackend();
    void loadGeneralNotesFromBackend();
  }, [session, currentPage, dataRefreshKey, loadAnnouncementFromBackend, loadGeneralNotesFromBackend]);

  useEffect(() => {
    if (!session || currentPage !== 'myTasks') return;
    void loadMyTasksFromBackend();
  }, [session, currentPage, dataRefreshKey, loadMyTasksFromBackend]);

  // duyuru / genel notlar artık backend üzerinden senkron; localStorage'a yazma.

  useEffect(() => {
    if (session?.role !== 'yonetici' && currentPage === 'staffManagement') {
      setCurrentPage('myTasks');
    }
  }, [session?.role, currentPage]);

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

  const handleJwtLoggedIn = useCallback(() => {
    const sess = readSessionPayload();
    if (!sess) return;
    setSession(sess);
    const page: AppCurrentPage = sess.role === 'yonetici' ? 'dashboard' : 'myTasks';
    setCurrentPage(page);
    apiService.setCurrentPage(page);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
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

  const assignableUsers = useMemo(() => {
    return backendUsers
      .filter((u) => u.active)
      .slice()
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'tr'))
      .map((u) => ({ id: u.id, displayName: u.displayName }));
  }, [backendUsers]);

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

    try {
      const notes = await fetchProjectNotes(id);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            notes: notes.map((n) => ({
              id: String(n.id),
              yazar: n.authorName,
              metin: n.message,
              zaman: Number.isFinite(Date.parse(n.createdAt)) ? Date.parse(n.createdAt) : Date.now(),
            })),
          };
        })
      );
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Notlar yüklenemedi');
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailProjectId(null);
    setNoteDraft('');
  }, []);

  const handleSorumlularChange = useCallback(
    async (stageId: string, userIds: number[]) => {
      if (!detailProjectId) return;
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
      if (!detailProjectId || session?.role !== 'yonetici') return;
      try {
        await approveStage(stageId);
        await refreshStagesForOpenProject(detailProjectId);
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Onay başarısız');
      }
    },
    [detailProjectId, session?.role, refreshStagesForOpenProject]
  );

  const handleDeleteStage = useCallback(
    async (stageId: string) => {
      if (!detailProjectId || session?.role !== 'yonetici') return;
      if (!confirm('Bu asamayi silmek istiyor musunuz?')) return;
      try {
        await deleteStage(stageId);
        await refreshStagesForOpenProject(detailProjectId);
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Asama silinemedi');
      }
    },
    [detailProjectId, refreshStagesForOpenProject, session?.role]
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
    async (projectId: string, payload: { isim: string; bitisTarihi: string; userIds: number[] }) => {
      try {
        let stage = await createStage(projectId, {
          name: payload.isim,
          dueDate: payload.bitisTarihi,
          note: '',
        });
        const uniqIds = [...new Set(payload.userIds)].filter((x) => Number.isFinite(x));
        if (uniqIds.length) {
          const assigns = await assignUsersToStage(stage.id, uniqIds);
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
      if (session?.role !== 'yonetici') return;
      if (!confirm('Bu projeyi arşive kaldırmak istiyor musunuz?')) return;
      try {
        await setProjectArchived(projectId, true);
        await loadProjectsFromBackend();
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Arşivleme başarısız');
      }
    },
    [session?.role, loadProjectsFromBackend]
  );

  const handleMarkDelivered = useCallback(
    async (projectId: string) => {
      if (session?.role !== 'yonetici') return;
      try {
        await deliverProject(projectId);
        await loadProjectsFromBackend();
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Teslim işlemi başarısız');
      }
    },
    [session?.role, loadProjectsFromBackend]
  );

  const handleUnarchiveProject = useCallback(
    async (projectId: string) => {
      if (session?.role !== 'yonetici') return;
      try {
        await setProjectArchived(projectId, false);
        await loadProjectsFromBackend();
        setDataRefreshKey((k) => k + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Arşivden çıkarma başarısız');
      }
    },
    [session?.role, loadProjectsFromBackend]
  );

  const handleAddNote = useCallback(async () => {
    if (!detailProjectId || !noteDraft.trim()) return;
    if (session?.backendUserId == null) {
      window.alert('Bu işlem için backend kullanıcı ID gerekli. Önce kullanıcıyı /users üzerinden oluşturun.');
      return;
    }
    try {
      await addProjectNote(detailProjectId, { userId: session.backendUserId, message: noteDraft.trim() });
      const notes = await fetchProjectNotes(detailProjectId);
      updateProjectById(detailProjectId, (p) => ({
        ...p,
        notes: notes.map((n) => ({
          id: String(n.id),
          yazar: n.authorName,
          metin: n.message,
          zaman: Number.isFinite(Date.parse(n.createdAt)) ? Date.parse(n.createdAt) : Date.now(),
        })),
      }));
      setNoteDraft('');
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Not eklenemedi');
    }
  }, [detailProjectId, noteDraft, session?.backendUserId, updateProjectById]);

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

  const saveDuyuru = useCallback(async () => {
    const trimmed = duyuruDraft.trim();
    if (!trimmed) return;
    if (session?.role !== 'yonetici') return;
    try {
      await updateCurrentAnnouncement({ message: trimmed });
      await loadAnnouncementFromBackend();
      setDataRefreshKey((k) => k + 1);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Duyuru güncellenemedi');
    }
  }, [duyuruDraft, loadAnnouncementFromBackend, session?.role]);

  const handleDuyuruAck = useCallback(async () => {
    if (announcementId == null) return;
    try {
      await acknowledgeAnnouncement(announcementId);
      const ok = await fetchAckStatus(announcementId);
      setDuyuruAck(ok ? { revision: duyuru.revision, at: Date.now() } : null);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Okundu bilgisi gönderilemedi');
    }
  }, [announcementId, duyuru.revision]);

  const handleGenelNotSend = useCallback(async () => {
    if ((session?.role !== 'personel' && session?.role !== 'yonetici') || !genelNotDraft.trim()) return;
    if (session?.backendUserId == null) {
      window.alert('Bu işlem için backend kullanıcı ID gerekli.');
      return;
    }
    try {
      await addGeneralNote({ userId: session.backendUserId, message: genelNotDraft.trim() });
      await loadGeneralNotesFromBackend();
      setGenelNotDraft('');
      setDataRefreshKey((k) => k + 1);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Genel not eklenemedi');
    }
  }, [genelNotDraft, loadGeneralNotesFromBackend, session?.role, session?.backendUserId]);

  const listProjects =
    session?.role === 'yonetici' ? (yoneticiListe === 'arsiv' ? archiveProjects : dashboardProjects) : dashboardProjects;

  if (!session) {
    return <LoginScreen onLoggedIn={handleJwtLoggedIn} />;
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
        : `Mukavim Mühendislik • ${session.role === 'yonetici' ? 'Yönetici' : 'Personel'} görünümü`;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-sky-500/25 blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-[90px]" />
      </div>

      <Sidebar
        sessionRole={session.role}
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
              {currentPage === 'dashboard' && session.role === 'yonetici' ? (
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
            <StaffManagementPage
              users={backendUsers}
              onReload={reloadUsersFromBackendStrict}
              currentUserId={session?.backendUserId ?? null}
            />
          ) : currentPage === 'dashboard' ? (
            <>
              <OfficeAnnouncement
                text={duyuru.text}
                revision={duyuru.revision}
                canEdit={session.role === 'yonetici'}
                draft={duyuruDraft}
                onDraftChange={setDuyuruDraft}
                onSave={saveDuyuru}
                role={session.role}
                ackRevision={duyuruAck?.revision}
                ackAt={duyuruAck?.at}
                onAcknowledge={handleDuyuruAck}
                readers={announcementReaders}
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
                  {session.role === 'yonetici' ? (
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
                    role={session.role}
                    viewMode={session.role === 'yonetici' && yoneticiListe === 'arsiv' ? 'archive' : 'dashboard'}
                    onOpenDetail={openDetail}
                    onMarkDelivered={session.role === 'yonetici' ? handleMarkDelivered : undefined}
                    onArchive={session.role === 'yonetici' ? handleArchiveProject : undefined}
                    onUnarchive={session.role === 'yonetici' ? handleUnarchiveProject : undefined}
                    staffUserLabel={session.role === 'personel' ? session.userLabel : undefined}
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
            <MyTasksPage tasks={myTasksRows} onOpenProject={openDetail} />
          )}
        </main>
      </div>

      <ProjectDetailModal
        open={Boolean(detailProjectId && detailProject)}
        project={detailProject}
        role={session.role}
        assignableUsers={assignableUsers}
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

