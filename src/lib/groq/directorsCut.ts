import type { Log } from '../supabase/types';

export interface DirectorsCutStats {
  topDirectors: { name: string; watchCount: number; avgRating: number }[];
  topGenres: { name: string; avgRating: number }[];
  decadeDistribution: Record<string, number>;
  avgRuntime: number;
  totalLogs: number;
}
export interface DirectorMatch { name: string; percentage: number; reason: string }
export interface DirectorsCutResult {
  primaryDirector: DirectorMatch;
  secondaryDirector: DirectorMatch;
  thirdDirector: DirectorMatch;
  headline: string;
  deepDive: string;
  blindSpot: string;
}
export const validRating = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10;

export function buildDirectorsCutStats(logs: Log[], credits: Map<number, string[]>): DirectorsCutStats {
  const directors = new Map<string, { count: number; sum: number; rated: number }>();
  const genres = new Map<string, { count: number; sum: number }>();
  const decades: Record<string, number> = {};
  let minutes = 0, knownRuntime = 0;
  for (const log of logs) {
    for (const name of new Set(credits.get(log.tmdb_id) || [])) {
      const director = directors.get(name) || { count: 0, sum: 0, rated: 0 };
      director.count++;
      if (validRating(log.rating)) { director.sum += log.rating; director.rated++; }
      directors.set(name, director);
    }
    if (validRating(log.rating)) for (const name of new Set((log.movie?.genres || []).map(genre => genre.name))) {
      const genre = genres.get(name) || { count: 0, sum: 0 };
      genre.count++; genre.sum += log.rating; genres.set(name, genre);
    }
    const year = Number(log.movie?.release_date?.slice(0, 4));
    if (Number.isInteger(year) && year >= 1880 && year <= 2200) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decades[decade] = (decades[decade] || 0) + 1;
    }
    const runtime = log.movie?.runtime;
    if (typeof runtime === 'number' && Number.isFinite(runtime) && runtime > 0) { minutes += runtime; knownRuntime++; }
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    topDirectors: [...directors].filter(([, d]) => d.rated > 0).map(([name, d]) => ({ name, watchCount: d.count, avgRating: round(d.sum / d.rated) })).sort((a, b) => b.watchCount - a.watchCount || b.avgRating - a.avgRating || a.name.localeCompare(b.name)).slice(0, 15),
    topGenres: [...genres].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0])).slice(0, 20).map(([name, genre]) => ({ name, avgRating: round(genre.sum / genre.count) })),
    decadeDistribution: decades, avgRuntime: knownRuntime ? round(minutes / knownRuntime) : 0, totalLogs: logs.length,
  };
}

export function isDirectorsCutStats(value: unknown): value is DirectorsCutStats {
  if (!value || typeof value !== 'object') return false;
  const s = value as DirectorsCutStats;
  const name = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && v.length <= 150;
  return Number.isInteger(s.totalLogs) && s.totalLogs > 0 && s.totalLogs <= 1000000
    && typeof s.avgRuntime === 'number' && Number.isFinite(s.avgRuntime) && s.avgRuntime >= 0 && s.avgRuntime <= 100000
    && Array.isArray(s.topDirectors) && s.topDirectors.length > 0 && s.topDirectors.length <= 15
    && s.topDirectors.every(d => d && name(d.name) && Number.isInteger(d.watchCount) && d.watchCount > 0 && d.watchCount <= s.totalLogs && validRating(d.avgRating))
    && Array.isArray(s.topGenres) && s.topGenres.length <= 20 && s.topGenres.every(g => g && name(g.name) && validRating(g.avgRating))
    && s.decadeDistribution !== null && typeof s.decadeDistribution === 'object' && !Array.isArray(s.decadeDistribution)
    && Object.keys(s.decadeDistribution).length <= 40
    && Object.entries(s.decadeDistribution).every(([key, count]) => /^(18|19|20|21|22)\d0s$/.test(key) && Number.isInteger(count) && count >= 0)
    && Object.values(s.decadeDistribution).reduce((a, b) => a + b, 0) <= s.totalLogs;
}

export function isDirectorsCutResult(value: unknown): value is DirectorsCutResult {
  if (!value || typeof value !== 'object') return false;
  const data = value as DirectorsCutResult;
  const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  const directors = [data.primaryDirector, data.secondaryDirector, data.thirdDirector];
  return directors.every(d => d && text(d.name, 100) && text(d.reason, 400) && Number.isInteger(d.percentage) && d.percentage > 0 && d.percentage <= 100)
    && new Set(directors.map(d => d.name.trim().toLowerCase())).size === 3
    && directors.reduce((sum, d) => sum + d.percentage, 0) === 100
    && directors[0].percentage >= directors[1].percentage && directors[1].percentage >= directors[2].percentage
    && text(data.headline, 300) && text(data.deepDive, 1000) && text(data.blindSpot, 400);
}
