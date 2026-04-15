import { createId } from '../lib/id';
import { NAME_ADMIN, NAME_DILEK, normalizePersonName } from '../constants';
import { assigneeMatchesUser, withComputedProjectStatus } from '../lib/stage';
import type { Project, ProjectNote, Stage } from '../types';

function fmtOffset(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeStage(s: unknown, projectDueFallback: string): Stage {
  const raw = (s ?? {}) as Record<string, unknown>;
  const note = typeof raw.not === 'string' ? raw.not : '';

  const assignees: string[] = Array.isArray(raw.sorumlular)
    ? [...new Set(raw.sorumlular.map((x) => normalizePersonName(x)).filter((x): x is string => Boolean(x)))]
    : typeof raw.sorumlu === 'string'
      ? [normalizePersonName(raw.sorumlu) ?? raw.sorumlu]
      : [];

  const dueDate =
    typeof raw.bitisTarihi === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.bitisTarihi) ? raw.bitisTarihi : projectDueFallback;

  const id = typeof raw.id === 'string' ? raw.id : createId('s');
  const name = typeof raw.isim === 'string' ? raw.isim : 'Genel Aşama';
  const durum =
    raw.durum === 'yesil' || raw.durum === 'mavi' || raw.durum === 'bekliyor' ? raw.durum : 'bekliyor';

  const rawCb = Array.isArray(raw.completedBy)
    ? raw.completedBy.map((x) => normalizePersonName(x)).filter((x): x is string => Boolean(x))
    : [];
  let completedBy = assignees.filter((a) => rawCb.some((c) => assigneeMatchesUser(a, c)));

  if (!rawCb.length) {
    if (durum === 'mavi' || durum === 'yesil') {
      completedBy = [...assignees];
    }
  }

  return {
    id,
    isim: name,
    sorumlular: assignees,
    bitisTarihi: dueDate,
    completedBy,
    durum,
    not: note,
  };
}

function stagesPlaza(): Stage[] {
  return [
    {
      id: createId('s'),
      isim: 'Temel Kazısı',
      sorumlular: [NAME_DILEK],
      completedBy: [NAME_DILEK],
      bitisTarihi: fmtOffset(2),
      durum: 'yesil',
      not: 'Zemin etüdü onaylandı.',
    },
    {
      id: createId('s'),
      isim: 'Tesisat İşleri',
      sorumlular: [NAME_DILEK],
      completedBy: [],
      bitisTarihi: fmtOffset(3),
      durum: 'bekliyor',
      not: '',
    },
    {
      id: createId('s'),
      isim: 'Kaba İnşaat',
      sorumlular: ['Ahmet'],
      completedBy: [],
      bitisTarihi: fmtOffset(14),
      durum: 'bekliyor',
      not: '',
    },
  ];
}

function stagesHavalimani(): Stage[] {
  return [
    {
      id: createId('s'),
      isim: 'Çatı Statik',
      sorumlular: [NAME_DILEK],
      completedBy: [NAME_DILEK],
      bitisTarihi: fmtOffset(5),
      durum: 'mavi',
      not: '',
    },
    {
      id: createId('s'),
      isim: 'Deprem Parametreleri',
      sorumlular: [NAME_ADMIN],
      completedBy: [],
      bitisTarihi: fmtOffset(12),
      durum: 'bekliyor',
      not: '',
    },
  ];
}

function stagesOfis(): Stage[] {
  return [
    {
      id: createId('s'),
      isim: 'Keşif',
      sorumlular: [NAME_ADMIN],
      completedBy: [NAME_ADMIN],
      bitisTarihi: fmtOffset(20),
      durum: 'yesil',
      not: '',
    },
    {
      id: createId('s'),
      isim: 'Rapor Teslimi',
      sorumlular: [NAME_ADMIN, NAME_DILEK],
      completedBy: [NAME_ADMIN, NAME_DILEK],
      bitisTarihi: fmtOffset(25),
      durum: 'yesil',
      not: '',
    },
  ];
}

export function createInitialProjects(): Project[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const raw: Project[] = [
    {
      id: createId('p'),
      firmaAdi: 'ABC İnşaat',
      isim: 'Plaza Projesi',
      nitelik: 'Betonarme',
      baslangicTarihi: todayStr,
      bitisTarihi: fmtOffset(30),
      durum: 'sari',
      archived: false,
      stages: stagesPlaza(),
      notes: [],
    },
    {
      id: createId('p'),
      firmaAdi: 'Havalimanı A.Ş.',
      isim: 'Terminal Genişletme',
      nitelik: 'Çelik',
      baslangicTarihi: todayStr,
      bitisTarihi: fmtOffset(45),
      durum: 'sari',
      archived: false,
      stages: stagesHavalimani(),
      notes: [],
    },
    {
      id: createId('p'),
      firmaAdi: 'Ofis Yapı',
      isim: 'Ofis Renovasyon',
      nitelik: 'Restorasyon',
      baslangicTarihi: todayStr,
      bitisTarihi: fmtOffset(60),
      durum: 'sari',
      archived: false,
      stages: stagesOfis(),
      notes: [],
    },
  ];

  return raw.map((p) => withComputedProjectStatus(p));
}

/** Migrates older localStorage records into the current schema. */
export function migrateProject(p: unknown): Project {
  const raw = (p ?? {}) as Record<string, unknown>;
  const archived = Boolean(raw.archived);

  const startDate = typeof raw.baslangicTarihi === 'string' ? raw.baslangicTarihi : new Date().toISOString().slice(0, 10);
  const dueDate = typeof raw.bitisTarihi === 'string' ? raw.bitisTarihi : startDate;

  const stagesIn = Array.isArray(raw.stages) ? raw.stages : [];
  const notesIn = Array.isArray(raw.notes) ? raw.notes : [];

  const stages = stagesIn.map((s) => normalizeStage(s, dueDate));
  const notes: ProjectNote[] = notesIn
    .map((n) => (n ?? {}) as Record<string, unknown>)
    .map((n) => ({
      id: typeof n.id === 'string' ? n.id : createId('n'),
      yazar: (normalizePersonName(n.yazar) ?? (typeof n.yazar === 'string' ? n.yazar : NAME_ADMIN)) as string,
      metin: typeof n.metin === 'string' ? n.metin : '',
      zaman: typeof n.zaman === 'number' ? n.zaman : Date.now(),
    }));

  const project: Project = {
    id: typeof raw.id === 'string' ? raw.id : createId('p'),
    firmaAdi: typeof raw.firmaAdi === 'string' ? raw.firmaAdi : '—',
    isim: typeof raw.isim === 'string' ? raw.isim : '—',
    nitelik: typeof raw.nitelik === 'string' ? raw.nitelik : 'Betonarme',
    baslangicTarihi: startDate,
    bitisTarihi: dueDate,
    durum: (raw.durum === 'yesil' || raw.durum === 'hazir' || raw.durum === 'mavi' || raw.durum === 'sari' ? raw.durum : 'sari') as Project['durum'],
    archived,
    stages,
    notes,
  };

  return withComputedProjectStatus(project);
}
