import { supabase } from "@/lib/supabase/client";
import { Profile, Log, WatchlistItem } from "@/lib/supabase/types";
import { POPULAR_STREAMING_PLATFORMS, StreamingPlatformInfo } from "./streamingPlatforms";

export interface ConnectedFriend {
  id: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  streaming_platforms: number[];
  logsCount?: number;
  isDemo?: boolean;
}

export interface ParticipantProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  streaming_platforms: number[];
  logs: Array<{
    tmdb_id: number;
    title?: string;
    rating?: number | null;
    genres?: Array<{ id: number; name: string } | string>;
  }>;
  watchlist: Array<{
    tmdb_id: number;
    title: string;
  }>;
}

export interface WatchlistConsensusMatch {
  tmdb_id: number;
  title: string;
  addedByCount: number;
  addedBy: string[]; // usernames
}

export interface GroupConsensusAnalysis {
  excludedMovieIds: Set<number>;
  excludedMovieTitles: string[];
  sharedHighRatedGenres: string[];
  watchlistMatches: WatchlistConsensusMatch[];
  commonPlatformIds: number[];
  commonPlatforms: StreamingPlatformInfo[];
  totalDiscardedMoviesCount: number;
}

export interface GroupRecommendation {
  tmdb_id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  year?: number;
  overview: string;
  vote_average: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  consensusReason: string;
  keyAppeal?: string;
  genre?: string;
  commonPlatforms: StreamingPlatformInfo[];
  availablePlatforms: StreamingPlatformInfo[];
}

/**
 * 1. Fetch available connected friends for user strictly from Supabase
 */
export async function getConnectedFriends(currentUserId?: string): Promise<ConnectedFriend[]> {
  const result: ConnectedFriend[] = [];
  const existingIds = new Set<string>();

  if (currentUserId) {
    existingIds.add(currentUserId);
  }

  try {
    // 1. Fetch users with follow relationships in Supabase
    if (currentUserId && !currentUserId.startsWith("guest")) {
      const { data: rels, error: relError } = await supabase
        .from("relationships")
        .select("following_id, follower_id")
        .or(`follower_id.eq.${currentUserId},following_id.eq.${currentUserId}`);

      const relatedUserIds = new Set<string>();
      if (!relError && rels) {
        rels.forEach((r) => {
          if (r.following_id && r.following_id !== currentUserId) relatedUserIds.add(r.following_id);
          if (r.follower_id && r.follower_id !== currentUserId) relatedUserIds.add(r.follower_id);
        });
      }

      if (relatedUserIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(relatedUserIds));

        if (profiles) {
          profiles.forEach((p: Profile) => {
            if (!existingIds.has(p.id)) {
              existingIds.add(p.id);
              result.push({
                id: p.id,
                username: p.username || "Amigo",
                avatar_url: p.avatar_url,
                bio: p.bio,
                streaming_platforms: Array.isArray(p.streaming_platforms)
                  ? p.streaming_platforms.map(Number)
                  : [],
                isDemo: false,
              });
            }
          });
        }
      }
    }

    // 2. Fetch other real registered users in Supabase so connections list is populated with community members
    let query = supabase.from("profiles").select("*");
    if (currentUserId && !currentUserId.startsWith("guest")) {
      query = query.neq("id", currentUserId);
    }
    const { data: allProfiles, error: allErr } = await query
      .order("created_at", { ascending: false })
      .limit(20);

    if (!allErr && allProfiles) {
      allProfiles.forEach((p: Profile) => {
        if (!existingIds.has(p.id)) {
          existingIds.add(p.id);
          result.push({
            id: p.id,
            username: p.username || "Cinéfilo",
            avatar_url: p.avatar_url,
            bio: p.bio,
            streaming_platforms: Array.isArray(p.streaming_platforms)
              ? p.streaming_platforms.map(Number)
              : [],
            isDemo: false,
          });
        }
      });
    }
  } catch (err) {
    console.warn("Error fetching real friends from Supabase:", err);
  }

  return result;
}

/**
 * 2. Fetch full participant data (logs, watchlist, platforms) strictly from Supabase
 */
export async function fetchParticipantData(
  user: { id: string; username: string; avatar_url: string | null; streaming_platforms?: number[] | null },
  isCurrentUser: boolean = false
): Promise<ParticipantProfileData> {
  let userLogs: any[] = [];
  let userWatchlist: any[] = [];

  if (user.id.startsWith("guest") || (typeof window !== "undefined" && isCurrentUser && localStorage.getItem("filmtracker_guest_mode") === "true")) {
    try {
      const rawLogs = localStorage.getItem("filmtracker_guest_logs");
      if (rawLogs) userLogs = JSON.parse(rawLogs);
      const rawWl = localStorage.getItem("filmtracker_guest_watchlist");
      if (rawWl) userWatchlist = JSON.parse(rawWl);
    } catch {
      // ignore
    }
  } else {
    try {
      const [{ data: logsData }, { data: wlData }] = await Promise.all([
        supabase
          .from("logs")
          .select("tmdb_id, rating, movie:movies(title, genres)")
          .eq("user_id", user.id),
        supabase
          .from("watchlist")
          .select("tmdb_id, title, movie:movies(title)")
          .eq("user_id", user.id),
      ]);

      if (logsData) {
        userLogs = logsData.map((l: any) => ({
          tmdb_id: l.tmdb_id,
          title: l.movie?.title || "Película",
          rating: l.rating,
          genres: (l.movie?.genres || []).map((g: any) => (typeof g === "string" ? g : g?.name || "")).filter(Boolean),
        }));
      }

      if (wlData) {
        userWatchlist = wlData.map((w: any) => ({
          tmdb_id: w.tmdb_id,
          title: w.movie?.title || w.title || "Película",
        }));
      }
    } catch (err) {
      console.warn(`Error fetching real participant data for ${user.id}:`, err);
    }
  }

  return {
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    streaming_platforms: user.streaming_platforms || [],
    logs: userLogs,
    watchlist: userWatchlist,
  };
}

/**
 * 3. Algorithm: Calculate consensus across all selected participants
 */
export function calculateGroupConsensus(participants: ParticipantProfileData[]): GroupConsensusAnalysis {
  const excludedMovieIds = new Set<number>();
  const excludedMovieTitles: string[] = [];

  // A. EXCLUDING SET: all movies watched by at least one participant
  participants.forEach((p) => {
    p.logs.forEach((log) => {
      if (log.tmdb_id) {
        excludedMovieIds.add(log.tmdb_id);
        if (log.title && !excludedMovieTitles.includes(log.title)) {
          excludedMovieTitles.push(log.title);
        }
      }
    });
  });

  // B. CROSS-CHECK WATCHLISTS: Movies present in 2 or more participants' watchlists
  const watchlistFrequency: Record<number, { title: string; addedBy: string[] }> = {};

  participants.forEach((p) => {
    p.watchlist.forEach((item) => {
      if (item.tmdb_id && !excludedMovieIds.has(item.tmdb_id)) {
        if (!watchlistFrequency[item.tmdb_id]) {
          watchlistFrequency[item.tmdb_id] = {
            title: item.title,
            addedBy: [],
          };
        }
        if (!watchlistFrequency[item.tmdb_id].addedBy.includes(p.username)) {
          watchlistFrequency[item.tmdb_id].addedBy.push(p.username);
        }
      }
    });
  });

  const watchlistMatches: WatchlistConsensusMatch[] = Object.entries(watchlistFrequency)
    .filter(([_, data]) => data.addedBy.length >= 2)
    .map(([tmdbId, data]) => ({
      tmdb_id: Number(tmdbId),
      title: data.title,
      addedByCount: data.addedBy.length,
      addedBy: data.addedBy,
    }))
    .sort((a, b) => b.addedByCount - a.addedByCount);

  // C. CROSS-CHECK GENRES WITH HIGHEST JOINT AVERAGE RATING
  const genreStats: Record<string, { totalRating: number; count: number; userAvgSum: number; userCount: number }> = {};

  participants.forEach((p) => {
    const userGenreRatings: Record<string, { total: number; count: number }> = {};

    p.logs.forEach((log) => {
      const rating = typeof log.rating === "number" ? log.rating : 3.5; // Neutral rating default
      const genresList = (log.genres || []).map((g: any) =>
        typeof g === "string" ? g : g?.name
      ).filter(Boolean);

      genresList.forEach((genre) => {
        if (!userGenreRatings[genre]) {
          userGenreRatings[genre] = { total: 0, count: 0 };
        }
        userGenreRatings[genre].total += rating;
        userGenreRatings[genre].count += 1;
      });
    });

    // Add this user's average for each genre to group stats
    Object.entries(userGenreRatings).forEach(([genre, stats]) => {
      const avg = stats.total / stats.count;
      if (!genreStats[genre]) {
        genreStats[genre] = { totalRating: 0, count: 0, userAvgSum: 0, userCount: 0 };
      }
      genreStats[genre].userAvgSum += avg;
      genreStats[genre].userCount += 1;
      genreStats[genre].count += stats.count;
    });
  });

  // Sort genres by how many users like it and the joint average rating
  const sharedHighRatedGenres = Object.entries(genreStats)
    .filter(([_, stats]) => stats.userCount >= Math.min(2, participants.length))
    .sort((a, b) => {
      const scoreA = (a[1].userAvgSum / a[1].userCount) * 0.7 + (a[1].userCount / participants.length) * 1.5;
      const scoreB = (b[1].userAvgSum / b[1].userCount) * 0.7 + (b[1].userCount / participants.length) * 1.5;
      return scoreB - scoreA;
    })
    .slice(0, 4)
    .map(([genre]) => genre);

  // Fallback genres if users have few logs
  if (sharedHighRatedGenres.length === 0) {
    sharedHighRatedGenres.push("Thriller", "Drama", "Ciencia ficción", "Misterio");
  }

  // D. CROSS-CHECK COMMON STREAMING PLATFORMS
  let commonPlatformIds: number[] = [];
  if (participants.length > 0) {
    const allPlatforms = participants.map((p) => new Set(p.streaming_platforms || []));
    // Find intersection
    const firstUserPlatforms = Array.from(allPlatforms[0] || []);
    commonPlatformIds = firstUserPlatforms.filter((platId) =>
      allPlatforms.every((userSet) => userSet.has(platId))
    );

    // If exact intersection is empty, find platforms shared by majority
    if (commonPlatformIds.length === 0) {
      const platformCounts: Record<number, number> = {};
      participants.forEach((p) => {
        (p.streaming_platforms || []).forEach((id) => {
          platformCounts[id] = (platformCounts[id] || 0) + 1;
        });
      });
      commonPlatformIds = Object.entries(platformCounts)
        .filter(([_, count]) => count >= 2)
        .map(([id]) => Number(id));
    }
  }

  const commonPlatforms = POPULAR_STREAMING_PLATFORMS.filter((plat) =>
    commonPlatformIds.includes(plat.id)
  );

  return {
    excludedMovieIds,
    excludedMovieTitles,
    sharedHighRatedGenres,
    watchlistMatches,
    commonPlatformIds,
    commonPlatforms,
    totalDiscardedMoviesCount: excludedMovieIds.size,
  };
}

/**
 * 4. Call /api/ai/recommend-group to generate the 3 consensus recommendations
 */
export async function getWatchTogetherRecommendations(
  participants: ParticipantProfileData[],
  consensus: GroupConsensusAnalysis
): Promise<GroupRecommendation[]> {
  const participantsSummary = participants.map((p) => {
    // Top 3 rated movies
    const topRated = [...p.logs]
      .filter((l) => typeof l.rating === "number")
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4)
      .map((l) => l.title || "Película")
      .filter(Boolean);

    // Top genres
    const genreCounts: Record<string, number> = {};
    p.logs.forEach((l) => {
      (l.genres || []).forEach((g: any) => {
        const name = typeof g === "string" ? g : g?.name;
        if (name) genreCounts[name] = (genreCounts[name] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return {
      id: p.id,
      username: p.username,
      topGenres: topGenres.length > 0 ? topGenres : ["Cine de autor", "Drama"],
      topRatedMovies: topRated,
      streamingPlatforms: p.streaming_platforms,
    };
  });

  const res = await fetch("/api/ai/recommend-group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participants: participantsSummary,
      sharedHighRatedGenres: consensus.sharedHighRatedGenres,
      watchlistMatches: consensus.watchlistMatches,
      excludedMovieTitles: consensus.excludedMovieTitles.slice(0, 35),
      excludedTmdbIds: Array.from(consensus.excludedMovieIds),
      commonPlatformIds: consensus.commonPlatformIds,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "No se pudieron obtener las recomendaciones de consenso.");
  }

  const data = await res.json();
  return data.recommendations || [];
}
