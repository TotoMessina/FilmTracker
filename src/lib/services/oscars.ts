export interface OscarCategory {
  id: string;
  nameEs: string;
  icon: string;
  description?: string;
}

export interface OscarNomineeItem {
  film: string;
  filmId: string;
  name: string;
  detail: string;
  tmdb_id?: number | null;
  poster_path?: string | null;
}

export interface BestPictureMeta {
  film: string;
  filmId: string;
  producer: string;
  tmdb_id?: number | null;
  poster_path?: string | null;
  title_es?: string;
}

export interface OscarAwardCategoryGroup {
  category: string;
  categoryEs: string;
  categoryId: string;
  categoryIcon: string;
  order: number;
  winner: OscarNomineeItem;
  nominees: OscarNomineeItem[];
}

export interface OscarEditionSummary {
  ceremony: number;
  year: number;
  yearRaw: string;
  editionLabel: string;
  bestPicture: BestPictureMeta | null;
  totalAwards: number;
}

export interface OscarEditionDetail {
  ceremony: number;
  year: number;
  yearRaw: string;
  editionLabel: string;
  bestPicture: BestPictureMeta | null;
  categories: OscarAwardCategoryGroup[];
}

export interface OscarWinnerHistoryItem {
  ceremony: number;
  year: number;
  yearRaw: string;
  editionLabel: string;
  categoryEs: string;
  categoryIcon: string;
  winner: OscarNomineeItem;
  nominees: OscarNomineeItem[];
}

export interface OscarsSummaryResponse {
  totalEditions: number;
  categories: OscarCategory[];
  editions: OscarEditionSummary[];
}

export interface OscarCategoryHistoryResponse {
  category: OscarCategory;
  totalWinners: number;
  winners: OscarWinnerHistoryItem[];
}

export interface OscarSearchResponse {
  query: string;
  matchedEditions: OscarEditionSummary[];
  matchedWinners: OscarWinnerHistoryItem[];
  totalMatches: number;
}

// Client-side in-memory caches to guarantee lightning-fast transitions
let summaryCache: OscarsSummaryResponse | null = null;
const editionsCache = new Map<number, OscarEditionDetail>();
const categoriesCache = new Map<string, OscarCategoryHistoryResponse>();
const posterCache = new Map<string, { tmdb_id: number | null; poster_path: string | null }>();

export async function fetchOscarsSummary(): Promise<OscarsSummaryResponse> {
  if (summaryCache) return summaryCache;
  const res = await fetch("/api/awards/oscars");
  if (!res.ok) throw new Error("Error al cargar resumen de premios");
  const data = await res.json();
  summaryCache = data;
  return data;
}

export async function fetchOscarEdition(yearOrCeremony: number): Promise<{ edition: OscarEditionDetail; categories: OscarCategory[] }> {
  if (editionsCache.has(yearOrCeremony)) {
    return { edition: editionsCache.get(yearOrCeremony)!, categories: [] };
  }
  const isCeremonyNumber = yearOrCeremony <= 98;
  const param = isCeremonyNumber ? `ceremony=${yearOrCeremony}` : `year=${yearOrCeremony}`;
  const res = await fetch(`/api/awards/oscars?${param}`);
  if (!res.ok) throw new Error("Error al cargar la edición solicitada");
  const data = await res.json();
  if (data.edition) {
    editionsCache.set(yearOrCeremony, data.edition);
  }
  return data;
}

export async function fetchOscarCategoryHistory(categoryId: string): Promise<OscarCategoryHistoryResponse> {
  if (categoriesCache.has(categoryId)) {
    return categoriesCache.get(categoryId)!;
  }
  const res = await fetch(`/api/awards/oscars?category=${encodeURIComponent(categoryId)}`);
  if (!res.ok) throw new Error("Error al cargar historial de categoría");
  const data = await res.json();
  categoriesCache.set(categoryId, data);
  return data;
}

export async function searchOscars(query: string): Promise<OscarSearchResponse> {
  if (!query.trim()) {
    return { query: "", matchedEditions: [], matchedWinners: [], totalMatches: 0 };
  }
  const res = await fetch(`/api/awards/oscars?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Error en la búsqueda de premios");
  return res.json();
}

export async function resolveFilmPoster(film: string, filmId?: string): Promise<{ tmdb_id: number | null; poster_path: string | null }> {
  const key = (filmId || film || "").toLowerCase().trim();
  if (!key) return { tmdb_id: null, poster_path: null };
  if (posterCache.has(key)) return posterCache.get(key)!;

  try {
    const params = new URLSearchParams();
    if (film) params.set("title", film);
    if (filmId) params.set("imdbId", filmId);
    const res = await fetch(`/api/awards/poster?${params.toString()}`);
    if (!res.ok) return { tmdb_id: null, poster_path: null };
    const data = await res.json();
    posterCache.set(key, data);
    return data;
  } catch (e) {
    return { tmdb_id: null, poster_path: null };
  }
}
