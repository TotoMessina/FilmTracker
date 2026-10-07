export interface AIRecommendation {
  title: string;
  year: number;
  reason: string;
  vibe: string;
  confidence: number;
  tmdb_id?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
}

export interface AIMoodPick {
  tmdb_id: number;
  title: string;
  reason: string;
  perfect_match: boolean;
  watch_with: string;
  best_moment: string;
  poster_path?: string | null;
}

export interface AIWatchlistPriorityItem {
  position: number;
  tmdb_id: number;
  title: string;
  priority_reason: string;
  urgency_tag: 'VER YA' | 'ESTA SEMANA' | 'CUANDO PUEDAS';
  poster_path?: string | null;
}

export interface AIWatchlistPriority {
  ranking: AIWatchlistPriorityItem[];
  summary: string;
}

export interface AIBioOption {
  style: string;
  text: string;
}

export interface AIAwardsCoachStrategy {
  title: string;
  reason: string;
  categories_covered: number;
}

export interface AIAwardsCoach {
  strategy: Array<{
    title: string;
    reason: string;
    categories_covered: number;
  }>;
  personal_prediction: {
    title: string;
    reasoning: string;
  };
  fun_fact: {
    about: string;
    fact: string;
  };
  goal_assessment: {
    achievable: boolean;
    tip: string;
  };
}

export interface TriviaQuestion {
  id: number;
  movieTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TriviaResponse {
  questions: TriviaQuestion[];
}

export interface MonthlyWrappedStats {
  totalWatched: number;
  totalHours: number;
  topGenre: string;
  bestRated: { title: string; rating?: number } | null;
  worstRated: { title: string; rating?: number } | null;
  cinemaVisits: number;
  topActors?: string[];
  avgRating?: number;
}

export interface MonthlyWrappedResponse {
  titular_del_mes: string;
  destacada_del_mes: string;
  habito_curioso: string;
  veredicto: string;
}

export interface TasteBiasStats {
  genreAverages: Record<string, number>;
  decadeAverages: Record<string, number>;
  runtimeAverages: Record<string, number>;
  totalLogs: number;
}

export interface TasteBiasResponse {
  diagnosis: string;
  overvalued_genre: {
    genre: string;
    comment: string;
  };
  harsh_criticism: {
    target: string;
    comment: string;
  };
  guilty_pleasure_pattern: string;
  advice: string;
}

export interface OutOfComfortZoneRequest {
  favoriteMovies: string[];
  unexploredGenres: string[];
}

export interface OutOfComfortZoneResponse {
  movieTitle: string;
  year: number;
  bridgeExplanation: string;
  whyItWorks: string;
  unexploredGenre?: string;
  tmdb_id?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  genres?: string[];
}

export interface MoviePitchRequest {
  title: string;
  year?: string | number;
  director?: string;
  genres?: string[];
}

export interface MoviePitchResponse {
  pitch: string;
  vibeEmoji: string;
  idealMoment: string;
}

export interface QuickDecisionRequest {
  mood: string;
  duration: string;
  company: string;
  platforms?: string[] | number[];
}

export interface QuickDecisionResponse {
  movieTitle: string;
  year: number;
  reason: string;
  vibe: string;
  recommendedPlatform?: string;
  tmdb_id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  runtime?: number;
  vote_average: number;
  trailerUrl?: string | null;
  providers: Array<{
    provider_id: number;
    provider_name: string;
    logo_path: string;
  }>;
}
