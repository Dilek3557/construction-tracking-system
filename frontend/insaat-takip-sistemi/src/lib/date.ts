/** YYYY-MM-DD -> days until target date (integer). Negative if past. */
export function daysUntil(ymd: string): number | null {
  if (!ymd || typeof ymd !== 'string') return null;
  const parts = ymd.split('-').map((x) => Number(x));
  if (parts.length !== 3 || parts.some((x) => Number.isNaN(x))) return null;
  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

