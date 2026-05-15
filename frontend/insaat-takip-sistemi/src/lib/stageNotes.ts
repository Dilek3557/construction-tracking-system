import { assigneeMatchesUser } from './stage';

/** "Dilek: metin · Pınar: metin" gibi birleşik tamamlama notunu satırlara ayırır. */
export function parseCompletionNoteLines(raw: string): { author: string; text: string }[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  return trimmed
    .split(' · ')
    .map((part) => {
      const piece = part.trim();
      if (!piece) return null;
      const colon = piece.indexOf(':');
      if (colon > 0 && colon < piece.length - 1) {
        const author = piece.slice(0, colon).trim();
        const text = piece.slice(colon + 1).trim();
        if (text) return { author, text };
      }
      return { author: '', text: piece };
    })
    .filter((x): x is { author: string; text: string } => x != null && Boolean(x.text));
}

function formatCombinedNoteLine(author: string, text: string): string {
  const a = author.trim();
  const t = text.trim();
  if (!t) return '';
  return a ? `${a}: ${t}` : t;
}

/** Birleşik notu tekrar "A: x · B: y" biçimine çevirir. */
export function rebuildCombinedNote(lines: readonly { author: string; text: string }[]): string {
  return lines
    .map((l) => formatCombinedNoteLine(l.author, l.text))
    .filter(Boolean)
    .join(' · ');
}

/**
 * Giriş yapan kullanıcının birleşik not içindeki kendi satırının metnini döndürür (düzenleme kutusu için).
 * Yalnızca "Yazar: ..." ile ayrılmış parçalar kişiye atanır; yazarsız eski tek parça eşleştirilmez.
 */
export function getNoteTextForUser(raw: string, userLabel: string | undefined): string {
  const needle = userLabel?.trim();
  if (!needle) return raw.trim();
  const lines = parseCompletionNoteLines(raw);
  const mine = lines.find((l) => l.author && assigneeMatchesUser(l.author, needle));
  return mine?.text ?? '';
}

/**
 * Aşama notunu kişi bazında günceller: aynı kişinin eski satırı değiştirilir veya silinir; diğer sorumluların metinleri kalır.
 */
export function mergeNoteForUser(existingRaw: string, userLabel: string, newPiece: string): string {
  const needle = userLabel.trim();
  if (!needle) return newPiece.trim();

  const lines = parseCompletionNoteLines(existingRaw);
  const others = lines.filter((l) => !l.author || !assigneeMatchesUser(l.author, needle));
  const t = newPiece.trim();
  if (!t) {
    return rebuildCombinedNote(others);
  }
  return rebuildCombinedNote([...others, { author: needle, text: t }]);
}
