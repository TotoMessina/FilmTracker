import type { Log } from './supabase/types';

export function watchedDate(log: Log): string | null {
  const value = log.watched_at?.slice(0, 10);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? value : null;
}

export function filterStatsLogs(logs: Log[], year: string) {
  return year === 'all' ? logs : logs.filter(log => watchedDate(log)?.slice(0, 4) === year);
}

export function calculateStats(logs: Log[], year: string, today = new Date()) {
  const ratings = logs.map(log => log.rating).filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 10).sort((a, b) => a - b);
  const runtimes = logs.map(log => log.movie?.runtime).filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0);
  const dates = logs.map(watchedDate).filter((date): date is string => date !== null);
  const days = [...new Set(dates)].sort();
  let streak = 0, longestStreak = 0, previous = 0;
  for (const day of days) {
    const time = Date.parse(`${day}T00:00:00Z`);
    streak = time - previous === 86400000 ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
    previous = time;
  }
  const endYear = year === 'all' ? today.getFullYear() : Number(year);
  const endMonth = year === 'all' ? today.getMonth() : 11;
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(endYear, endMonth - 11 + index, 1));
    const key = date.toISOString().slice(0, 7);
    return { name: date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit', timeZone: 'UTC' }), count: dates.filter(d => d.startsWith(key)).length };
  });
  const weekdayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const weekdays = weekdayNames.map((name, index) => ({ name, count: dates.filter(d => (new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7 === index).length }));
  const histogram = Array.from({ length: 11 }, (_, i) => ({ name: i === 10 ? '10' : `${i}–${i},9`, count: ratings.filter(n => Math.floor(n) === i).length }));
  const rank = (names: (log: Log) => string[]) => {
    const counts = new Map<string, number>();
    logs.forEach(log => new Set(names(log).filter(Boolean)).forEach(name => counts.set(name, (counts.get(name) || 0) + 1)));
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };
  const directors = rank(log => (log.movie?.cast_data || []).filter(p => p.character === 'Director').map(p => p.name));
  const actors = rank(log => (log.movie?.cast_data || []).filter(p => p.character !== 'Director').map(p => p.name));
  const countries = rank(log => (log.movie?.production_countries || []).map(c => c.name));
  const decades = rank(log => {
    const releaseYear = Number(log.movie?.release_date?.slice(0, 4));
    return releaseYear >= 1880 && releaseYear <= 2200 ? [`${Math.floor(releaseYear / 10) * 10}s`] : [];
  }).sort((a, b) => a.name.localeCompare(b.name));
  const movies = new Map<number, { id: number; title: string; sum: number; count: number }>();
  logs.forEach(log => {
    if (typeof log.rating !== 'number' || !Number.isFinite(log.rating) || log.rating < 0 || log.rating > 10) return;
    const entry = movies.get(log.tmdb_id) || { id: log.tmdb_id, title: log.movie?.title || `Película ${log.tmdb_id}`, sum: 0, count: 0 };
    entry.sum += log.rating; entry.count++; movies.set(log.tmdb_id, entry);
  });
  const topMovies = [...movies.values()].map(movie => ({ ...movie, rating: movie.sum / movie.count })).sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title)).slice(0, 5);
  const middle = Math.floor(ratings.length / 2);
  return {
    ratings, totalMinutes: runtimes.reduce((sum, n) => sum + n, 0), knownRuntimes: runtimes.length,
    uniqueMovies: new Set(logs.map(log => log.tmdb_id)).size,
    reviews: logs.filter(log => log.review?.trim()).length,
    unknownDates: logs.length - dates.length, activeDays: days.length, longestStreak,
    median: ratings.length ? (ratings[middle] + ratings[Math.floor((ratings.length - 1) / 2)]) / 2 : null,
    months, weekdays, histogram, directors, actors, countries, decades, topMovies,
  };
}
