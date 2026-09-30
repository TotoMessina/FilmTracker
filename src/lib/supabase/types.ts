export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  updated_at?: string | null;
  created_at?: string;
  streaming_platforms?: number[] | null;
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface Movie {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  runtime: number | null;
  genres: MovieGenre[] | null;
  production_countries: ProductionCountry[] | null;
  production_companies: ProductionCompany[] | null;
  cast_data: CastMember[] | null;
  vote_average: number | null;
  overview: string | null;
  updated_at?: string | null;
}

export interface Log {
  id: string;
  user_id: string;
  tmdb_id: number;
  watched_at: string | null;
  rating: number | null;
  review: string | null;
  notes: string | null;
  platform: string | null;
  format: string | null;
  company?: string | null;
  is_rewatch: boolean;
  custom_poster_path: string | null;
  created_at?: string;
  movie?: Movie;
  profile?: Profile;
  companions?: Profile[];
}

export interface WatchlistItem {
  user_id: string;
  tmdb_id: number;
  title: string | null;
  added_at: string;
  movie?: Movie;
}

export interface Relationship {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface UserBadge {
  user_id: string;
  badge_code: string;
  earned_at: string;
}

export interface HiddenItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: string;
  created_at?: string;
}

export interface CollectionMovie {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
}

export interface UserCollection {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  cover_poster_path?: string | null;
  movies: CollectionMovie[];
  created_at: string;
  updated_at?: string;
}

export interface SharedWatchlistMember {
  id: string;
  username: string;
  avatar_url?: string | null;
}

export interface SharedWatchlistMovie {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
  genres?: string[] | null;
  added_by_id: string;
  added_by_name: string;
  added_at: string;
  watched?: boolean;
}

export interface SharedWatchlist {
  id: string;
  title: string;
  description?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string;
  members: SharedWatchlistMember[];
  movies: SharedWatchlistMovie[];
}
