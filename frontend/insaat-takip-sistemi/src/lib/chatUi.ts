/** Mesaj balonu avatarı için baş harfler (ör. Mustafa Karaca → MK). */
export function authorInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]![0] ?? '';
    const last = parts[parts.length - 1]![0] ?? '';
    return (first + last).toLocaleUpperCase('tr-TR');
  }
  const t = displayName.trim();
  return t.length >= 2 ? t.slice(0, 2).toLocaleUpperCase('tr-TR') : t.toLocaleUpperCase('tr-TR') || '?';
}

const AVATAR_PALETTE = [
  'bg-sky-500/30 text-sky-100 ring-sky-400/40',
  'bg-violet-500/30 text-violet-100 ring-violet-400/40',
  'bg-amber-500/30 text-amber-100 ring-amber-400/40',
  'bg-emerald-500/30 text-emerald-100 ring-emerald-400/40',
  'bg-rose-500/30 text-rose-100 ring-rose-400/40',
  'bg-cyan-500/30 text-cyan-100 ring-cyan-400/40',
] as const;

export function avatarToneForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % 9973;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]!;
}

export function formatNoteTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
