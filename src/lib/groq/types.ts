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
