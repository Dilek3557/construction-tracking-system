/** Backend GlobalExceptionHandler: { message, status, timestamp } */

export async function readApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  if (!text.trim()) return `İstek başarısız (${res.status})`;
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    const msg = j.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  } catch {
    /* not JSON */
  }
  return text.trim();
}
