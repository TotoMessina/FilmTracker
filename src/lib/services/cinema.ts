import { TMDBMovie, getNowPlayingMovies } from "@/lib/tmdb/client";

export type CinemaStatus = "estreno" | "reestreno";

export interface NowPlayingCatalog {
  estrenos: TMDBMovie[];
  reestrenos: TMDBMovie[];
  all: TMDBMovie[];
}

// In-memory cache for fast lookups across components
let cachedCatalog: NowPlayingCatalog | null = null;
let cachedStatusMap: Map<number, CinemaStatus> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Classifies a movie as "estreno" or "reestreno" based on its original release year
 */
export function classifyCinemaMovie(movie: { id?: number; release_date?: string }): CinemaStatus {
  if (!movie.release_date) return "estreno";
  const year = parseInt(movie.release_date.split("-")[0], 10);
  const currentYear = new Date().getFullYear();

  // If the movie was originally released more than 1 year before the current year,
  // its current presence in theaters is a re-release (reestreno).
  if (!isNaN(year) && year < currentYear - 1) {
    return "reestreno";
  }
  return "estreno";
}

/**
 * Fetches now-playing movies from TMDB across multiple pages to get both premieres and re-releases
 */
export async function getNowPlayingCatalog(): Promise<NowPlayingCatalog> {
  const now = Date.now();
  if (cachedCatalog && now - lastFetchTime < CACHE_DURATION_MS) {
    return cachedCatalog;
  }

  try {
    // Fetch 3 pages of now_playing to get a robust list of 60 movies currently in theaters
    const [page1, page2, page3] = await Promise.all([
      getNowPlayingMovies(1),
      getNowPlayingMovies(2),
      getNowPlayingMovies(3),
    ]);

    const combinedMovies: TMDBMovie[] = [];
    const seenIds = new Set<number>();

    [...(page1?.results || []), ...(page2?.results || []), ...(page3?.results || [])].forEach((m) => {
      if (m && m.id && !seenIds.has(m.id)) {
        seenIds.add(m.id);
        combinedMovies.push(m);
      }
    });

    const estrenos: TMDBMovie[] = [];
    const reestrenos: TMDBMovie[] = [];
    const statusMap = new Map<number, CinemaStatus>();

    combinedMovies.forEach((m) => {
      const status = classifyCinemaMovie(m);
      statusMap.set(m.id, status);
      if (status === "reestreno") {
        reestrenos.push(m);
      } else {
        estrenos.push(m);
      }
    });

    // If reestrenos has few results from TMDB now_playing, we can supplement with iconic re-released classics
    // that theaters frequently program (Harry Potter, Coraline, Sueño de Fuga, Interstellar, Back to the Future)
    const catalog: NowPlayingCatalog = {
      estrenos,
      reestrenos,
      all: combinedMovies,
    };

    cachedCatalog = catalog;
    cachedStatusMap = statusMap;
    lastFetchTime = now;

    // Notify any listening components
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("filmtracker_cinema_catalog", JSON.stringify({
          ids: Array.from(statusMap.entries()),
          time: now,
        }));
      } catch {
        // Ignore storage errors
      }
    }

    return catalog;
  } catch (err) {
    console.warn("Failed to fetch now playing catalog:", err);
    if (cachedCatalog) return cachedCatalog;
    return { estrenos: [], reestrenos: [], all: [] };
  }
}

/**
 * Returns a Map of movieId -> "estreno" | "reestreno"
 */
export async function getNowPlayingStatusMap(): Promise<Map<number, CinemaStatus>> {
  if (cachedStatusMap) return cachedStatusMap;

  // Try reading from sessionStorage first for instant render
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("filmtracker_cinema_catalog");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.ids && Array.isArray(parsed.ids)) {
          cachedStatusMap = new Map(parsed.ids);
          return cachedStatusMap;
        }
      }
    } catch {
      // Ignore
    }
  }

  await getNowPlayingCatalog();
  return cachedStatusMap || new Map();
}

/**
 * Synchronous check if already cached in memory
 */
export function getCachedCinemaStatus(movieId: number): CinemaStatus | null {
  if (cachedStatusMap) {
    return cachedStatusMap.get(movieId) || null;
  }
  return null;
}
