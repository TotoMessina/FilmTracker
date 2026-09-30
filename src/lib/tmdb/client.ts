const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "31841cf8ea5ec78f32d856ec6e773ea0";
const TMDB_READ_TOKEN = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN || "";
export const TMDB_IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w500";
export const TMDB_BACKDROP_BASE = process.env.NEXT_PUBLIC_TMDB_BACKDROP_BASE || "https://image.tmdb.org/t/p/original";

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  runtime?: number;
  vote_average: number;
  vote_count?: number;
  overview: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  production_companies?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
  keywords?: {
    keywords?: { id: number; name: string }[];
  };
  "watch/providers"?: {
    results?: {
      [countryCode: string]: {
        link?: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
        rent?: { provider_id: number; provider_name: string; logo_path: string }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string }[];
      };
    };
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
  similar?: {
    results: TMDBMovie[];
  };
}

export interface TMDBPerson {
  id: number;
  name: string;
  original_name?: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  gender?: number;
  known_for?: TMDBMovie[];
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  movie_credits?: {
    cast: (TMDBMovie & { character?: string })[];
    crew: (TMDBMovie & { job: string; department: string })[];
  };
}

export interface TMDBCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
  description?: string;
  headquarters?: string;
  homepage?: string;
}

export type TMDBMultiItem =
  | (TMDBMovie & { media_type: "movie" })
  | (TMDBPerson & { media_type: "person" })
  | {
      id: number;
      name: string;
      media_type: "tv";
      poster_path?: string | null;
      first_air_date?: string;
      vote_average?: number;
      overview?: string;
    };

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export function getImageUrl(path: string | null | undefined, size: string = "w500"): string {
  if (!path) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size: string = "original"): string {
  if (!path) return "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Set default query parameters
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "es-MX");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (TMDB_READ_TOKEN) {
    headers["Authorization"] = `Bearer ${TMDB_READ_TOKEN}`;
  }

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate: 3600 }, // Cache 1 hour in Next.js
  });

  if (!res.ok) {
    throw new Error(`TMDB error (${res.status}): ${res.statusText}`);
  }

  return res.json();
}

export async function searchMovies(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/search/movie", { query, page, include_adult: "false" });
}

export async function searchMulti(query: string, page: number = 1): Promise<TMDBResponse<TMDBMultiItem>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return fetchTMDB<TMDBResponse<TMDBMultiItem>>("/search/multi", { query, page, include_adult: "false" });
}

export async function searchPeople(query: string, page: number = 1): Promise<TMDBResponse<TMDBPerson>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return fetchTMDB<TMDBResponse<TMDBPerson>>("/search/person", { query, page, include_adult: "false" });
}

export async function searchCompanies(query: string, page: number = 1): Promise<TMDBResponse<TMDBCompany>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return fetchTMDB<TMDBResponse<TMDBCompany>>("/search/company", { query, page });
}

export async function getPersonDetails(id: number): Promise<TMDBPerson> {
  return fetchTMDB<TMDBPerson>(`/person/${id}`, {
    append_to_response: "movie_credits",
  });
}

export async function getCompanyDetails(id: number): Promise<TMDBCompany> {
  return fetchTMDB<TMDBCompany>(`/company/${id}`);
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "day", page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`, { page });
}

export async function getTopRatedMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/top_rated", { page });
}

export async function getNowPlayingMovies(page: number = 1, region?: string): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/now_playing", { page, region: region || undefined });
}

export async function getMovieDetails(id: number): Promise<TMDBMovie> {
  return fetchTMDB<TMDBMovie>(`/movie/${id}`, {
    append_to_response: "credits,watch/providers,keywords,videos,similar",
  });
}

export async function getRecommendations(id: number, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>(`/movie/${id}/recommendations`, { page });
}

export interface DiscoverFilters {
  sortBy?: string;
  year?: number | string;
  decade?: string; // "2020", "2010", "2000", "1990", "1980", "1970", "classic"
  genres?: string; // comma separated IDs
  watchProviders?: string; // comma separated IDs
  watchRegion?: string;
  page?: number;
  withCast?: string | number;
  withCrew?: string | number;
  withCompanies?: string | number;
  minRating?: number | string;
  minVotes?: number | string;
  originalLanguage?: string;
  minRuntime?: number | string;
  maxRuntime?: number | string;
}

export async function discoverMovies(filters: DiscoverFilters = {}): Promise<TMDBResponse<TMDBMovie>> {
  const params: Record<string, string | number | undefined> = {
    sort_by: filters.sortBy || "popularity.desc",
    primary_release_year: filters.year,
    with_genres: filters.genres,
    with_watch_providers: filters.watchProviders,
    watch_region: filters.watchRegion || "MX",
    page: filters.page || 1,
    include_adult: "false",
    with_cast: filters.withCast,
    with_crew: filters.withCrew,
    with_companies: filters.withCompanies,
    with_original_language: filters.originalLanguage,
    "with_runtime.gte": filters.minRuntime,
    "with_runtime.lte": filters.maxRuntime,
  };

  if (filters.minRating && Number(filters.minRating) > 0) {
    params["vote_average.gte"] = filters.minRating;
    // Default to at least 50 votes to prevent noise if filtering by rating
    params["vote_count.gte"] = filters.minVotes || 50;
  } else if (filters.minVotes) {
    params["vote_count.gte"] = filters.minVotes;
  }

  // Handle decade filtering
  if (filters.decade) {
    if (filters.decade === "2020") {
      params["primary_release_date.gte"] = "2020-01-01";
      params["primary_release_date.lte"] = "2029-12-31";
    } else if (filters.decade === "2010") {
      params["primary_release_date.gte"] = "2010-01-01";
      params["primary_release_date.lte"] = "2019-12-31";
    } else if (filters.decade === "2000") {
      params["primary_release_date.gte"] = "2000-01-01";
      params["primary_release_date.lte"] = "2009-12-31";
    } else if (filters.decade === "1990") {
      params["primary_release_date.gte"] = "1990-01-01";
      params["primary_release_date.lte"] = "1999-12-31";
    } else if (filters.decade === "1980") {
      params["primary_release_date.gte"] = "1980-01-01";
      params["primary_release_date.lte"] = "1989-12-31";
    } else if (filters.decade === "1970") {
      params["primary_release_date.gte"] = "1970-01-01";
      params["primary_release_date.lte"] = "1979-12-31";
    } else if (filters.decade === "classic") {
      params["primary_release_date.lte"] = "1969-12-31";
    }
  }

  return fetchTMDB<TMDBResponse<TMDBMovie>>("/discover/movie", params);
}

export async function getMovieImages(id: number): Promise<{
  posters: { file_path: string; vote_average: number; width: number; height: number }[];
  backdrops: { file_path: string; vote_average: number; width: number; height: number }[];
}> {
  return fetchTMDB(`/movie/${id}/images`, {
    include_image_language: "es,en,null",
  });
}

export function hasPostCreditsScene(movie: TMDBMovie): boolean {
  const keywords = movie.keywords?.keywords || [];
  return keywords.some((k) => 
    k.id === 179430 || 
    k.id === 179431 || 
    k.name.toLowerCase().includes("aftercreditsstinger") || 
    k.name.toLowerCase().includes("duringcreditsstinger")
  );
}

// Popular genres reference
export const MOVIE_GENRES = [
  { id: 28, name: "Acción" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 99, name: "Documental" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Familia" },
  { id: 14, name: "Fantasía" },
  { id: 36, name: "Historia" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Misterio" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ciencia Ficción" },
  { id: 10770, name: "Película de TV" },
  { id: 53, name: "Suspenso" },
  { id: 10752, name: "Bélica" },
  { id: 37, name: "Western" },
];

// Popular streaming providers reference
export const STREAMING_PROVIDERS = [
  { id: 8, name: "Netflix", logo: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
  { id: 337, name: "Disney+", logo: "/5eZ872CghnHFLB1j8grszbrx0dx.png" },
  { id: 119, name: "Prime Video", logo: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
  { id: 1899, name: "Max", logo: "/skypuy7SXuugIQeYg0IglmzoKaS.png" },
  { id: 350, name: "Apple TV+", logo: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
  { id: 531, name: "Paramount+", logo: "/pkx3klJlwW5JdtaulvDx6hDNtch.png" },
  { id: 11, name: "MUBI", logo: "/k7iSlvgWzZuO4zU5PcBjhABMuia.png" },
  { id: 63, name: "Filmin", logo: "/8zTqH5i2k5A12q9hV9aK4q3dO2G.jpg" },
];

// Iconic Studios / Production Companies reference
export const POPULAR_STUDIOS = [
  { id: 41077, name: "A24", logo: "/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png", country: "US" },
  { id: 10342, name: "Studio Ghibli", logo: "/uFuxPEZRUcBTEiYIxjHJq62Vr77.png", country: "JP" },
  { id: 174, name: "Warner Bros.", logo: "/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png", country: "US" },
  { id: 33, name: "Universal", logo: "/8lvHyhjr8oUKOOy2dKXoALWKdp0.png", country: "US" },
  { id: 420, name: "Marvel Studios", logo: "/hUzeosd33nzE5MCNsZxCGEKTXaQ.png", country: "US" },
  { id: 3, name: "Pixar", logo: "/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png", country: "US" },
  { id: 4, name: "Paramount", logo: "/jay6WcMgagAklUt7i9Euwj1pzTF.png", country: "US" },
  { id: 5, name: "Columbia Pictures", logo: "/71BqEFAF4V3qjjMPCpLuyJFB9A.png", country: "US" },
  { id: 3172, name: "Blumhouse", logo: "/rzKluDcRkIwHZK2pHsiT667A2Kw.png", country: "US" },
  { id: 90733, name: "NEON", logo: "/3K9wCZTyDgop3ITK1rDi6T2PckE.png", country: "US" },
];

// Languages reference
export const LANGUAGES = [
  { code: "", label: "Todos los idiomas" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "Inglés", flag: "🇺🇸" },
  { code: "ja", label: "Japonés", flag: "🇯🇵" },
  { code: "fr", label: "Francés", flag: "🇫🇷" },
  { code: "ko", label: "Coreano", flag: "🇰🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Alemán", flag: "🇩🇪" },
  { code: "pt", label: "Portugués", flag: "🇧🇷" },
];

// Runtime options reference
export const RUNTIME_RANGES = [
  { id: "all", label: "Cualquier duración", min: undefined, max: undefined },
  { id: "short", label: "< 90 min (Cortas)", min: undefined, max: 89 },
  { id: "medium", label: "90 - 120 min (Estándar)", min: 90, max: 120 },
  { id: "long", label: "120 - 150 min (Largas)", min: 121, max: 150 },
  { id: "epic", label: "> 150 min (Épicas)", min: 151, max: undefined },
];

// Rating options
export const RATING_OPTIONS = [
  { value: 0, label: "Cualquiera" },
  { value: 6, label: "⭐ 6.0+" },
  { value: 7, label: "⭐ 7.0+" },
  { value: 8, label: "⭐ 8.0+" },
  { value: 8.5, label: "⭐ 8.5+ (Obras Maestras)" },
];

// Decades options
export const DECADES = [
  { id: "", label: "Todas las épocas" },
  { id: "2020", label: "2020s" },
  { id: "2010", label: "2010s" },
  { id: "2000", label: "2000s" },
  { id: "1990", label: "90s" },
  { id: "1980", label: "80s" },
  { id: "1970", label: "70s" },
  { id: "classic", label: "Clásicos (< 1970)" },
];
