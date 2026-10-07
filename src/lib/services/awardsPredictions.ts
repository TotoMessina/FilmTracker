import { supabase } from "@/lib/supabase/client";
import { AwardsPrediction, Profile } from "@/lib/supabase/types";

export interface CategoryWinnerInfo {
  categoryName: string;
  winnerTmdbId?: number;
  winnerTitle?: string;
  isAnnounced: boolean;
}

export interface ScoreBreakdown {
  score: number;
  hits: number;
  misses: number;
  pending: number;
  totalCategories: number;
  categoryResults: Record<
    string,
    {
      predictedTmdbId?: number;
      winnerTmdbId?: number;
      status: "hit" | "miss" | "pending";
    }
  >;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  score: number;
  hits: number;
  predictionsCount: number;
  submittedAt: string;
  isCurrentUser: boolean;
}

const STORAGE_PREFIX = "filmtracker_awards_prediction_";

// Helper to get local storage key
function getStorageKey(seasonYear: number, userId?: string) {
  return `${STORAGE_PREFIX}${seasonYear}_${userId || "guest"}`;
}

// Compute score against the known edition winners
export function calculatePredictionScore(
  predictions: Record<string, number>,
  categories: Array<{ name: string; nominees: Array<{ tmdb_id: number; isWinner?: boolean }> }>
): ScoreBreakdown {
  let score = 0;
  let hits = 0;
  let misses = 0;
  let pending = 0;
  const categoryResults: ScoreBreakdown["categoryResults"] = {};

  categories.forEach((cat) => {
    const predictedId = predictions[cat.name];
    const winner = cat.nominees.find((n) => n.isWinner);

    if (!winner) {
      // Winner not announced yet
      if (predictedId) {
        pending++;
        categoryResults[cat.name] = {
          predictedTmdbId: predictedId,
          status: "pending",
        };
      }
    } else {
      // Winner announced
      if (predictedId && predictedId === winner.tmdb_id) {
        score += 10;
        hits++;
        categoryResults[cat.name] = {
          predictedTmdbId: predictedId,
          winnerTmdbId: winner.tmdb_id,
          status: "hit",
        };
      } else {
        misses++;
        categoryResults[cat.name] = {
          predictedTmdbId: predictedId,
          winnerTmdbId: winner.tmdb_id,
          status: "miss",
        };
      }
    }
  });

  return {
    score,
    hits,
    misses,
    pending,
    totalCategories: categories.length,
    categoryResults,
  };
}

// Fetch user prediction
export async function getUserAwardsPrediction(
  seasonYear: number,
  userId?: string
): Promise<AwardsPrediction | null> {
  // 1. Try Supabase if authenticated
  if (userId && userId !== "guest-user-123" && !userId.startsWith("guest")) {
    try {
      const { data, error } = await supabase
        .from("awards_predictions")
        .select("*, user:profiles(*)")
        .eq("user_id", userId)
        .eq("season_year", seasonYear)
        .maybeSingle();

      if (!error && data) {
        return data as AwardsPrediction;
      }
    } catch {
      // Fallback to local storage
    }
  }

  // 2. Fallback to LocalStorage
  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(seasonYear, userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      return null;
    }
  }

  return null;
}

// Save user prediction
export async function saveUserAwardsPrediction(
  seasonYear: number,
  predictions: Record<string, number>,
  score: number,
  userProfile?: { id: string; username: string; avatar_url: string | null }
): Promise<AwardsPrediction> {
  const userId = userProfile?.id || "guest-user-123";
  const now = new Date().toISOString();

  const record: AwardsPrediction = {
    id: `pred_${seasonYear}_${userId}`,
    user_id: userId,
    season_year: seasonYear,
    predictions,
    score,
    submitted_at: now,
    user: userProfile
      ? {
          id: userProfile.id,
          username: userProfile.username,
          avatar_url: userProfile.avatar_url,
          created_at: now,
          updated_at: now,
        }
      : undefined,
  };

  // 1. Save to Supabase if authenticated
  if (userId && !userId.startsWith("guest")) {
    try {
      await supabase.from("awards_predictions").upsert(
        {
          user_id: userId,
          season_year: seasonYear,
          predictions,
          score,
          submitted_at: now,
        },
        { onConflict: "user_id, season_year" }
      );
    } catch (err) {
      console.warn("Error guardando predicción en Supabase:", err);
    }
  }

  // 2. Always persist locally for offline resilience and immediate UI sync
  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(seasonYear, userId);
      localStorage.setItem(key, JSON.stringify(record));
      window.dispatchEvent(new CustomEvent("filmtracker_prediction_saved", { detail: { seasonYear } }));
    } catch (err) {
      console.warn("Error guardando en localStorage:", err);
    }
  }

  return record;
}

// Fetch season leaderboard strictly from Supabase community predictions
export async function getSeasonLeaderboard(
  seasonYear: number,
  categories: Array<{ name: string; nominees: Array<{ tmdb_id: number; isWinner?: boolean }> }>,
  currentUserId?: string,
  currentUserPrediction?: AwardsPrediction | null
): Promise<LeaderboardEntry[]> {
  const entries: LeaderboardEntry[] = [];

  // 1. Fetch real community entries from Supabase
  try {
    const { data, error } = await supabase
      .from("awards_predictions")
      .select("*, user:profiles(*)")
      .eq("season_year", seasonYear);

    if (!error && Array.isArray(data) && data.length > 0) {
      data.forEach((p: any) => {
        const breakdown = calculatePredictionScore(p.predictions || {}, categories);
        const isCurrent = Boolean(currentUserId && p.user_id === currentUserId);

        entries.push({
          rank: 0,
          userId: p.user_id,
          username: p.user?.username || (isCurrent ? "Vos" : "Cinéfilo"),
          avatarUrl: p.user?.avatar_url || null,
          score: breakdown.score,
          hits: breakdown.hits,
          predictionsCount: Object.keys(p.predictions || {}).length,
          submittedAt: p.submitted_at || new Date().toISOString(),
          isCurrentUser: isCurrent,
        });
      });
    }
  } catch (err) {
    console.warn("[AwardsPredictions] Error cargando tabla de posiciones:", err);
  }

  // 2. If current user has a local prediction and is not in entries yet, add them
  const currentUserInEntries = entries.some(
    (e) => (currentUserId && e.userId === currentUserId) || e.isCurrentUser
  );

  if (!currentUserInEntries && currentUserPrediction) {
    const breakdown = calculatePredictionScore(currentUserPrediction.predictions, categories);
    entries.push({
      rank: 0,
      userId: currentUserPrediction.user_id,
      username: currentUserPrediction.user?.username || "Vos (Tu Quiniela)",
      avatarUrl: currentUserPrediction.user?.avatar_url || null,
      score: breakdown.score,
      hits: breakdown.hits,
      predictionsCount: Object.keys(currentUserPrediction.predictions || {}).length,
      submittedAt: currentUserPrediction.submitted_at,
      isCurrentUser: true,
    });
  }

  // 3. Sort by score descending, then hits, then time
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.hits !== a.hits) return b.hits - a.hits;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  // 4. Assign 1-indexed ranks
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
