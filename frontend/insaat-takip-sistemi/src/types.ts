/** Chat UI: admin vs staff (Dilek). */
export type UserRole = 'admin' | 'staff';

/** Dashboard role (Turkish UI strings in storage). */
export type AppRole = 'yonetici' | 'personel';

/** Ana içerik alanı: dashboard, görev listesi veya personel yönetimi (yalnız yönetici). */
export type AppCurrentPage = 'dashboard' | 'myTasks' | 'staffManagement';

/** Login oturumu (şifresiz demo). */
export interface SessionPayload {
  userLabel: string;
  role: AppRole;
  /** Backend `CompleteAssignmentRequest.userId` vb. için (demo eşleme). */
  backendUserId?: number | null;
}

export type YoneticiListe = 'aktif' | 'arsiv';

export type ProjectDurum = 'sari' | 'mavi' | 'hazir' | 'yesil';
export type StageDurum = 'bekliyor' | 'mavi' | 'yesil';

export interface ProjectNote {
  id: string;
  yazar: string;
  metin: string;
  zaman: number;
}

export interface Stage {
  id: string;
  isim: string;
  bitisTarihi: string;
  sorumlular: string[];
  /** Bu aşamada "BİTTİ" demiş sorumlular (sorumlular dizisindeki görünen adlarla eşleşirr). */
  completedBy: string[];
  durum: StageDurum;
  not: string;
}

export interface Project {
  id: string;
  firmaAdi: string;
  isim: string;
  nitelik: string;
  baslangicTarihi?: string;
  bitisTarihi: string;
  durum: ProjectDurum;
  archived: boolean;
  stages: Stage[];
  notes: ProjectNote[];
}

export interface DuyuruState {
  text: string;
  revision: number;
}

export interface DuyuruAck {
  revision: number;
  at: number;
}

export interface GenelNot {
  id: string;
  yazar: string;
  metin: string;
  zaman: number;
}

/** localStorage: yönetici tarafından tanımlanan kullanıcılar (demo; şifre doğrulanmaz). */
export interface ManagedUser {
  id: string;
  displayName: string;
  username: string;
  password: string;
  role: AppRole;
  active: boolean;
}
