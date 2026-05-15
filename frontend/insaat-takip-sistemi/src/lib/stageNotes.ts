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
