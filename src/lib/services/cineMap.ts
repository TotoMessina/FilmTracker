import type { Log, ProductionCountry } from '../supabase/types';

export interface CineMapCountry {
  countryCode: string;
  countryName: string;
  count: number;
  avgRating: number | null;
  movies: { id: number; title: string }[];
}
const names = new Intl.DisplayNames(['es'], { type: 'region' });
// 193 UN member states plus Palestine and the Holy See. Territories remain visible but do not inflate this denominator.
export const PASSPORT_COUNTRIES = new Set('AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VE VN YE ZM ZW PS VA'.split(' '));
const EUROPE = new Set('AL AD AT BY BE BA BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA'.split(' '));
export const countryName = (code: string) => names.of(code) || code;
export const countryFlag = (code: string) => /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map(char => 127397 + char.charCodeAt(0))) : '🌍';

export function normaliseCountries(value: unknown): ProductionCountry[] {
  if (!Array.isArray(value)) return [];
  const countries = new Map<string, ProductionCountry>();
  value.forEach(item => {
    if (!item || typeof item !== 'object' || typeof item.iso_3166_1 !== 'string') return;
    const code = item.iso_3166_1.toUpperCase();
    if (!/^[A-Z]{2}$/.test(code) || ['XX', 'ZZ', 'AA'].includes(code) || names.of(code) === code) return;
    countries.set(code, { iso_3166_1: code, name: countryName(code) });
  });
  return [...countries.values()];
}

export function getCineMapStats(logs: Log[]): CineMapCountry[] {
  const countries = new Map<string, CineMapCountry & { sum: number; rated: number }>();
  for (const log of logs) for (const country of normaliseCountries(log.movie?.production_countries)) {
    const item = countries.get(country.iso_3166_1) || { countryCode: country.iso_3166_1, countryName: country.name, count: 0, avgRating: null, movies: [], sum: 0, rated: 0 };
    item.count++;
    if (typeof log.rating === 'number' && Number.isFinite(log.rating) && log.rating >= 0 && log.rating <= 10) { item.sum += log.rating; item.rated++; }
    if (item.movies.length < 3 && !item.movies.some(movie => movie.id === log.tmdb_id)) item.movies.push({ id: log.tmdb_id, title: log.movie?.title || `Película ${log.tmdb_id}` });
    countries.set(country.iso_3166_1, item);
  }
  return [...countries.values()].map(({ sum, rated, ...country }) => ({ ...country, avgRating: rated ? Math.round(sum / rated * 10) / 10 : null })).sort((a, b) => b.count - a.count || a.countryName.localeCompare(b.countryName));
}

export function getCineMapInsights(logs: Log[], countries = getCineMapStats(logs)) {
  const known = logs.filter(log => normaliseCountries(log.movie?.production_countries).length > 0);
  const outsideUS = known.filter(log => !normaliseCountries(log.movie?.production_countries).some(country => country.iso_3166_1 === 'US')).length;
  const usCount = countries.find(country => country.countryCode === 'US')?.count || 0;
  const dominant = countries[0];
  const suggested = ['JP', 'KR', 'FR', 'AR', 'IN', 'IR', 'BR', 'SN'].filter(code => code !== dominant?.countryCode).sort((a, b) => (countries.find(c => c.countryCode === a)?.count || 0) - (countries.find(c => c.countryCode === b)?.count || 0))[0];
  let suggestion: string | null = null;
  // Unknown origins must not be classified as US or foreign; require complete coverage for this threshold.
  if (logs.length && known.length === logs.length && outsideUS / logs.length < 0.1) {
    suggestion = `🌍 ¿Sabías que el ${Math.round(usCount / logs.length * 100)}% de tu catálogo tiene producción de EE.UU.? Explorá el cine de ${countryName(suggested)} — te puede sorprender.`;
  } else if (dominant && dominant.count / logs.length > 0.6) {
    suggestion = `🌍 El ${Math.round(dominant.count / logs.length * 100)}% de tus visionados tiene producción de ${dominant.countryName}. Explorá el cine de ${countryName(suggested)} para ampliar tu pasaporte.`;
  }
  const visited = countries.filter(country => PASSPORT_COUNTRIES.has(country.countryCode)).length;
  const european = known.filter(log => normaliseCountries(log.movie?.production_countries).some(country => EUROPE.has(country.iso_3166_1))).length;
  const badge = visited >= 15 ? 'Globetrotter Cinematográfico' : logs.length && usCount / logs.length > 0.6 ? 'Cinéfilo Hollywoodense' : countries.filter(country => EUROPE.has(country.countryCode)).length >= 3 && european / logs.length > 0.5 ? 'Explorador Europeo' : visited >= 5 ? 'Explorador de Fronteras' : visited ? 'Viajero en Despegue' : 'Pasaporte por estrenar';
  return { visited, diversity: visited / 195 * 100, unknown: logs.length - known.length, suggestion, badge };
}

export function countryColor(count: number, max: number): string {
  if (!count || !max) return '#27272a';
  const ratio = Math.sqrt(count / max);
  return `rgb(${[39, 39, 42].map((start, i) => Math.round(start + ([220, 38, 38][i] - start) * ratio)).join(',')})`;
}

export async function loadCineMapLogs(userId: string, progress: (text: string) => void, signal: AbortSignal) {
  const { supabase } = await import('../supabase/client');
  const logs: Log[] = [];
  progress('Leyendo tu pasaporte…');
  for (let offset = 0; ; offset += 500) {
    signal.throwIfAborted();
    const { data, error } = await supabase.from('logs').select('*, movie:movies(*)').eq('user_id', userId).order('id').range(offset, offset + 499).abortSignal(signal);
    if (error) throw new Error('No se pudo leer el historial. Intentá nuevamente.');
    logs.push(...(data || []) as Log[]);
    if (!data || data.length < 500) break;
  }
  const missing = [...new Set(logs.filter(log => !normaliseCountries(log.movie?.production_countries).length).map(log => log.tmdb_id))];
  const enriched = new Map<number, ProductionCountry[]>();
  const { data: session } = await supabase.auth.getSession();
  const headers: Record<string, string> = session.session ? { Authorization: `Bearer ${session.session.access_token}` } : {};
  let failures = 0, unsaved = 0;
  for (let i = 0; i < missing.length; i += 4) {
    signal.throwIfAborted();
    progress(`Completando países con TMDB: ${i} de ${missing.length} películas…`);
    await Promise.all(missing.slice(i, i + 4).map(async id => {
      try {
        const response = await fetch(`/api/movies/${id}/country`, { headers, signal });
        if (!response.ok) throw new Error('Country lookup failed');
        const data = await response.json();
        const countries = normaliseCountries(data.countries);
        enriched.set(id, countries);
        if (session.session && countries.length && !data.persisted) unsaved++;
      } catch { if (!signal.aborted) failures++; }
    }));
  }
  signal.throwIfAborted();
  return { failures, unsaved, logs: logs.map(log => {
    const countries = enriched.get(log.tmdb_id);
    if (!countries) return log;
    return { ...log, movie: {
      tmdb_id: log.tmdb_id, title: `Película ${log.tmdb_id}`, poster_path: null, backdrop_path: null, release_date: null,
      runtime: null, genres: null, production_companies: null, cast_data: null, vote_average: null, overview: null,
      ...log.movie, production_countries: countries,
    } };
  }) };
}
