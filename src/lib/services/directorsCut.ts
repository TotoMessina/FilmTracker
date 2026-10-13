import { supabase } from '@/lib/supabase/client';
import { getMovieCredits } from '@/lib/tmdb/client';
import type { Log } from '@/lib/supabase/types';
import { buildDirectorsCutStats, validRating } from '@/lib/groq/directorsCut';

const directorCache = new Map<number, string[]>();

export async function loadDirectorsCutStats(userId: string, onProgress: (message: string) => void) {
  onProgress('Leyendo tu historial completo…');
  const logs: Log[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('logs').select('*, movie:movies(*)').eq('user_id', userId).order('id').range(offset, offset + 499);
    if (error) throw new Error('No se pudo leer tu historial. Intentá nuevamente.');
    logs.push(...(data || []) as Log[]);
    if (!data || data.length < 500) break;
  }
  if (!logs.some(log => validRating(log.rating))) throw new Error('Calificá al menos una película para descubrir tu ADN cinematográfico.');
  const ids = [...new Set(logs.map(log => log.tmdb_id))];
  const credits = new Map<number, string[]>();
  for (let i = 0; i < ids.length; i += 4) {
    onProgress(`Consultando directores en TMDB: ${i} de ${ids.length} películas…`);
    await Promise.all(ids.slice(i, i + 4).map(async id => {
      let names = directorCache.get(id);
      if (!names) {
        try {
          const data = await getMovieCredits(id);
          names = [...new Set(data.crew.filter(person => person.job === 'Director').map(person => person.name))];
          directorCache.set(id, names);
        } catch { throw new Error('No se pudieron consultar todos los directores en TMDB. Reintentá para completar el análisis.'); }
      }
      credits.set(id, names);
    }));
  }
  const stats = buildDirectorsCutStats(logs, credits);
  if (!stats.topDirectors.length) throw new Error('No encontramos directores con películas calificadas en tu historial.');
  return stats;
}
