import { supabase } from '../supabase/client';

export async function loadWatchedMovieIds(userId: string, signal: AbortSignal): Promise<Set<number>> {
  const ids = new Set<number>();
  for (let offset = 0; ; offset += 500) {
    signal.throwIfAborted();
    const { data, error } = await supabase.from('logs').select('tmdb_id').eq('user_id', userId).order('id').range(offset, offset + 499).abortSignal(signal);
    if (error) throw error;
    for (const row of data || []) ids.add(row.tmdb_id);
    if (!data || data.length < 500) return ids;
  }
}
