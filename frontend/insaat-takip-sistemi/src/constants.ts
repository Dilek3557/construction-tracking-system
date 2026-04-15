/** Shared constants (English identifiers, Turkish UI values). */

export const NAME_DILEK = 'Dilek';
export const NAME_ADMIN = 'Yönetici';

/** Back-compat for old localStorage names */
export const LEGACY_ADMIN_NAMES = new Set<string>(['Mustafa Abi', 'Mustafa']);
const ADMIN_NAME_ALIASES_TR_LOWER = new Set<string>([
  'mustafa abi',
  'mustafa',
  'yonetici',
  'yönetici',
]);

export function normalizePersonName(name: unknown): string | undefined {
  if (typeof name !== 'string') return undefined;
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  if (LEGACY_ADMIN_NAMES.has(trimmed)) return NAME_ADMIN;
  if (ADMIN_NAME_ALIASES_TR_LOWER.has(trimmed.toLocaleLowerCase('tr-TR'))) return NAME_ADMIN;
  return trimmed;
}

/** Staff list for stage assignment UI (single source of truth). */
export const STAFF_LIST = [NAME_ADMIN, NAME_DILEK, 'Ahmet'] as const;

export const CATEGORIES = ['Betonarme', 'Çelik', 'Ahşap', 'Restorasyon'] as const;

