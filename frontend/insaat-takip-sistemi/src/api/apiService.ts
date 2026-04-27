import { createInitialProjects, migrateProject } from '../data/initialProjects';
import { createId } from '../lib/id';
import type {
  AppCurrentPage,
  AppRole,
  DuyuruAck,
  DuyuruState,
  GenelNot,
  ManagedUser,
  Project,
  SessionPayload,
} from '../types';

/** Aşama ataması: aktif kullanıcıların görünen adları (benzersiz, sıralı). */
export function getAssignableDisplayNames(users: ManagedUser[]): string[] {
  const active = users.filter((u) => u.active);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of active) {
    const d = u.displayName.trim();
    if (!d) continue;
    const key = d.toLocaleLowerCase('tr-TR');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out.sort((a, b) => a.localeCompare(b, 'tr'));
}

const LS_PROJECTS = 'mukavim_react_projects_v1';
const LS_ROLE = 'mukavim_react_role_v1';
const LS_DUYURU = 'mukavim_react_duyuru_v1';
const LS_DUYURU_ACK = 'mukavim_react_duyuru_ack_v1';
const LS_GENEL_NOTLAR = 'mukavim_react_genel_notlar_v1';
const LS_SESSION = 'mukavim_react_session_v1';
const LS_CURRENT_PAGE = 'mukavim_react_current_page_v1';
const LS_MANAGED_USERS = 'mukavim_react_managed_users_v1';

const DEFAULT_DUYURU_TEXT = 'Ofis genel duyurusu: Haftalık toplantı cuma 09:00.';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function createDefaultManagedUsers(): ManagedUser[] {
  return [
    {
      id: 'u-seed-yonetici',
      displayName: 'Yönetici',
      username: 'mustafa',
      password: '',
      role: 'yonetici',
      active: true,
    },
    {
      id: 'u-seed-dilek',
      displayName: 'Dilek',
      username: 'dilek',
      password: '',
      role: 'personel',
      active: true,
    },
    {
      id: 'u-seed-ahmet',
      displayName: 'Ahmet',
      username: 'ahmet',
      password: '',
      role: 'personel',
      active: true,
    },
  ];
}

function migrateManagedUser(raw: unknown): ManagedUser | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : createId('u');
  const displayName = typeof raw.displayName === 'string' ? raw.displayName.trim() : '';
  const usernameRaw = typeof raw.username === 'string' ? raw.username.trim().toLowerCase() : '';
  const password = typeof raw.password === 'string' ? raw.password : '';
  const role: AppRole = raw.role === 'personel' ? 'personel' : 'yonetici';
  const active = typeof raw.active === 'boolean' ? raw.active : true;
  if (!displayName || !usernameRaw) return null;
  return { id, displayName, username: usernameRaw, password, role, active };
}

function readJson(key: string): unknown {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as unknown;
}

export function getProjects(): Project[] {
  try {
    const parsed = readJson(LS_PROJECTS);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((p) => migrateProject(p));
    }
  } catch {
    /* ignore and return demo seed */
  }
  return createInitialProjects();
}

export function setProjects(projects: Project[]): void {
  localStorage.setItem(LS_PROJECTS, JSON.stringify(projects));
}

export function getRole(): AppRole {
  try {
    return localStorage.getItem(LS_ROLE) === 'personel' ? 'personel' : 'yonetici';
  } catch {
    return 'yonetici';
  }
}

export function setRole(role: AppRole): void {
  localStorage.setItem(LS_ROLE, role);
}

export function getSession(): SessionPayload | null {
  try {
    const parsed = readJson(LS_SESSION);
    if (!isRecord(parsed)) return null;
    const userLabel = typeof parsed.userLabel === 'string' ? parsed.userLabel.trim() : '';
    const role: AppRole = parsed.role === 'personel' ? 'personel' : 'yonetici';
    if (!userLabel) return null;
    const backendUserId =
      typeof parsed.backendUserId === 'number' && Number.isFinite(parsed.backendUserId)
        ? parsed.backendUserId
        : undefined;
    return { userLabel, role, backendUserId };
  } catch {
    return null;
  }
}

export function setSession(session: SessionPayload): void {
  localStorage.setItem(LS_SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(LS_SESSION);
}

export function getCurrentPage(roleForDefault: AppRole): AppCurrentPage {
  try {
    const raw = localStorage.getItem(LS_CURRENT_PAGE);
    if (raw === 'dashboard' || raw === 'myTasks') return raw;
    if (raw === 'staffManagement' && roleForDefault === 'yonetici') return 'staffManagement';
  } catch {
    /* ignore */
  }
  return roleForDefault === 'personel' ? 'myTasks' : 'dashboard';
}

export function setCurrentPage(page: AppCurrentPage): void {
  localStorage.setItem(LS_CURRENT_PAGE, page);
}

export function clearCurrentPage(): void {
  localStorage.removeItem(LS_CURRENT_PAGE);
}

export function getDuyuru(): DuyuruState {
  try {
    const parsed = readJson(LS_DUYURU);
    if (isRecord(parsed) && typeof parsed.text === 'string') {
      const revision = typeof parsed.revision === 'number' && parsed.revision >= 1 ? parsed.revision : 1;
      return { text: parsed.text, revision };
    }
  } catch {
    /* ignore */
  }
  return { text: DEFAULT_DUYURU_TEXT, revision: 1 };
}

export function setDuyuru(duyuru: DuyuruState): void {
  localStorage.setItem(LS_DUYURU, JSON.stringify(duyuru));
}

export function getDuyuruAck(): DuyuruAck | null {
  try {
    const parsed = readJson(LS_DUYURU_ACK);
    if (isRecord(parsed) && typeof parsed.revision === 'number' && typeof parsed.at === 'number') {
      return { revision: parsed.revision, at: parsed.at };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setDuyuruAck(ack: DuyuruAck | null): void {
  if (!ack) {
    localStorage.removeItem(LS_DUYURU_ACK);
    return;
  }
  localStorage.setItem(LS_DUYURU_ACK, JSON.stringify(ack));
}

export function getGenelNotlar(): GenelNot[] {
  try {
    const parsed = readJson(LS_GENEL_NOTLAR);
    if (Array.isArray(parsed)) return parsed as GenelNot[];
  } catch {
    /* ignore */
  }
  return [];
}

export function setGenelNotlar(notes: GenelNot[]): void {
  localStorage.setItem(LS_GENEL_NOTLAR, JSON.stringify(notes));
}

export function getUsers(): ManagedUser[] {
  try {
    const parsed = readJson(LS_MANAGED_USERS);
    if (Array.isArray(parsed) && parsed.length) {
      const list = parsed.map(migrateManagedUser).filter((u): u is ManagedUser => Boolean(u));
      if (list.length) return list;
    }
  } catch {
    /* ignore */
  }
  const seed = createDefaultManagedUsers();
  localStorage.setItem(LS_MANAGED_USERS, JSON.stringify(seed));
  return seed;
}

export function saveUsers(users: ManagedUser[]): void {
  localStorage.setItem(LS_MANAGED_USERS, JSON.stringify(users));
}

export type NewManagedUserInput = {
  displayName: string;
  username: string;
  password: string;
  role: AppRole;
  active: boolean;
};

/** Yeni kullanıcı ekler; kullanıcı adı (büyük/küçük harf yok sayılır) tekil olmalıdır. */
export function addUser(users: ManagedUser[], input: NewManagedUserInput): ManagedUser[] | null {
  const displayName = input.displayName.trim();
  const username = input.username.trim().toLowerCase();
  if (!displayName || !username) return null;
  if (users.some((u) => u.username.toLowerCase() === username)) return null;
  const next: ManagedUser = {
    id: createId('u'),
    displayName,
    username,
    password: input.password,
    role: input.role,
    active: input.active,
  };
  return [...users, next];
}

export function updateUserStatus(users: ManagedUser[], userId: string, active: boolean): ManagedUser[] {
  return users.map((u) => (u.id === userId ? { ...u, active } : u));
}

export function updateUserRole(users: ManagedUser[], userId: string, role: AppRole): ManagedUser[] {
  return users.map((u) => (u.id === userId ? { ...u, role } : u));
}
