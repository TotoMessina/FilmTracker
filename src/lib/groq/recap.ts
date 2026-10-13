import type { TMDBMovie } from '../tmdb/client';

export interface RecapResponse {
  recap: string;
  keyCharacters: string[];
  cliffhangerNote: string;
}

export function isRecap(value: unknown): value is RecapResponse {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return typeof data.recap === 'string' && data.recap.trim().length > 0 && data.recap.length <= 6000
    && data.recap.trim().split(/\n\s*\n/).length >= 2 && data.recap.trim().split(/\n\s*\n/).length <= 3
    && Array.isArray(data.keyCharacters) && data.keyCharacters.length > 0 && data.keyCharacters.length <= 8
    && data.keyCharacters.every(character => typeof character === 'string' && character.trim().length > 0 && character.length <= 400)
    && typeof data.cliffhangerNote === 'string' && data.cliffhangerNote.trim().length > 0 && data.cliffhangerNote.length <= 1000;
}

export function previousCollectionMovie(movie: TMDBMovie, parts: TMDBMovie[], today = new Date().toISOString().slice(0, 10)): TMDBMovie | null {
  const validDate = (date?: string): date is string => Boolean(date && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date);
  if (!validDate(movie.release_date)) return null;
  const candidates = parts.filter(part => part.id !== movie.id && validDate(part.release_date) && part.release_date < movie.release_date! && part.release_date <= today)
    .sort((a, b) => b.release_date!.localeCompare(a.release_date!));
  // Same-day releases do not establish a reliable order.
  if (candidates.length > 1 && candidates[0].release_date === candidates[1].release_date) return null;
  return candidates[0] || null;
}

export interface CachedRecap { data: RecapResponse; seconds: number; previousId: number }
const pending = new Map<string, Promise<CachedRecap>>();

export async function loadRecap(movie: TMDBMovie, previous: TMDBMovie): Promise<CachedRecap> {
  const key = `recap_${movie.id}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached?.previousId === previous.id && isRecap(cached.data) && Number.isFinite(cached.seconds) && cached.seconds >= 0) return cached;
  } catch { /* Storage can be unavailable or contain an older response. */ }
  const requestKey = `${key}_${previous.id}`;
  const running = pending.get(requestKey);
  if (running) return running;
  const request = (async () => {
    const started = performance.now();
    const response = await fetch('/api/ai/recap-express', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: previous.title, year: previous.release_date?.slice(0, 4) || '', sequelTitle: movie.title, genres: (previous.genres || []).map(genre => genre.name) }),
      signal: AbortSignal.timeout(60000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo generar el recap.');
    if (!isRecap(data)) throw new Error('La IA devolvió un recap incompleto. Intentá nuevamente.');
    const result = { data, seconds: Math.round((performance.now() - started) / 100) / 10, previousId: previous.id };
    try { sessionStorage.setItem(key, JSON.stringify(result)); } catch { /* Keep the result in the open component. */ }
    return result;
  })();
  pending.set(requestKey, request);
  try { return await request; } finally { pending.delete(requestKey); }
}
