import { supabase } from "@/lib/supabase/client";
import { TMDBMovie, getMovieDetails } from "@/lib/tmdb/client";
import { Log } from "@/lib/supabase/types";
import { checkNewBadges, persistAndNotifyUnlockedBadges } from "@/lib/gamification/badgeChecker";
import { checkAndUpdateMonthlyChallenges } from "@/lib/services/challenges";
import { fetchAllUserLogs } from "@/lib/services/logs";

export interface QuickLogMovieInput {
  id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
  overview?: string | null;
  genres?: any[] | null;
  credits?: any;
  production_countries?: any[] | null;
  production_companies?: any[] | null;
}

export interface QuickLogOptions {
  movie: QuickLogMovieInput | TMDBMovie;
  rating?: number | null;
  watchedAt?: string | null; // "YYYY-MM-DD" or null for "Sin fecha"
  platform?: string | null;
  isRewatch?: boolean;
  existingLogId?: string | null;
  createNewRewatch?: boolean;
  user?: any;
  isGuest?: boolean;
  triggerConfetti?: () => void;
  onLogSaved?: () => void;
}

export interface QuickLogResult {
  success: boolean;
  log?: Log;
  isUpdate?: boolean;
  error?: string;
}

export const POPULAR_PLATFORMS = [
  "Netflix",
  "HBO Max",
  "Disney+",
  "Prime Video",
  "Apple TV+",
  "Cine",
  "Archivo / Físico",
  "Otro",
];

export const LAST_PLATFORM_KEY = "filmtracker_last_platform";

/**
 * Gets the last used platform saved in localStorage (defaults to "Netflix")
 */
export function getLastUsedPlatform(): string {
  if (typeof window === "undefined") return "Netflix";
  try {
    return localStorage.getItem(LAST_PLATFORM_KEY) || "Netflix";
  } catch {
    return "Netflix";
  }
}

/**
 * Saves the last used platform to localStorage
 */
export function setLastUsedPlatform(platform: string): void {
  if (typeof window === "undefined" || !platform) return;
  try {
    localStorage.setItem(LAST_PLATFORM_KEY, platform);
  } catch {
    // ignore
  }
}

/**
 * Finds all logs recorded by the user for this movie (chronological viewings).
 */
export async function getAllUserMovieLogs(
  tmdbId: number,
  userId?: string | null,
  isGuest?: boolean
): Promise<Log[]> {
  if (!tmdbId) return [];

  // Guest Mode
  if (isGuest || !userId) {
    if (typeof window === "undefined") return [];
    try {
      const guestLogs: any[] = JSON.parse(
        localStorage.getItem("filmtracker_guest_logs") || "[]"
      );
      return guestLogs
        .filter((l: any) => l.tmdb_id === tmdbId)
        .sort((a: any, b: any) => {
          const dateA = a.watched_at || a.created_at || "";
          const dateB = b.watched_at || b.created_at || "";
          return dateB.localeCompare(dateA);
        });
    } catch {
      return [];
    }
  }

  // Authenticated Mode
  try {
    const { data } = await supabase
      .from("logs")
      .select("*, movie:movies(*)")
      .eq("user_id", userId)
      .eq("tmdb_id", tmdbId)
      .order("watched_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    return (data as Log[]) || [];
  } catch (err) {
    console.warn("Error fetching user movie logs:", err);
    return [];
  }
}

/**
 * Finds if the user already has a log recorded for this movie.
 * Returns the most recent viewing if multiple exist.
 */
export async function getExistingUserLog(
  tmdbId: number,
  userId?: string | null,
  isGuest?: boolean
): Promise<Log | null> {
  const allLogs = await getAllUserMovieLogs(tmdbId, userId, isGuest);
  return allLogs[0] || null;
}

/**
 * Executes a fast, streamlined movie log without requiring the user
 * to open the heavy multi-field modal.
 * If createNewRewatch is true, it inserts a new rewatch log with its own date.
 * If editing, it updates the targeted existing log.
 */
export async function performQuickLog(options: QuickLogOptions): Promise<QuickLogResult> {
  const {
    movie,
    rating = 7.0,
    watchedAt = new Date().toISOString().split("T")[0],
    platform = getLastUsedPlatform(),
    isRewatch = false,
    existingLogId,
    createNewRewatch = false,
    user,
    isGuest,
    triggerConfetti,
    onLogSaved,
  } = options;

  if (!movie || !movie.id) {
    return { success: false, error: "Película inválida." };
  }

  // Persist platform choice for next quick logs
  if (platform) {
    setLastUsedPlatform(platform);
  }

  const tmdbId = movie.id;
  const title = movie.title;
  const finalRating = typeof rating === "number" && rating > 0 ? rating : null;
  const finalWatchedAt = watchedAt ? watchedAt.trim() : null;

  try {
    // 1. Guest Mode
    if (isGuest || !user) {
      const guestLogs: any[] = JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem("filmtracker_guest_logs") || "[]"
          : "[]"
      );

      const directorMember = movie.credits?.crew?.find(
        (c: any) => c.job === "Director" || c.department === "Directing"
      );
      let guestCast = movie.credits?.cast?.slice(0, 10) || [];
      if (directorMember && !guestCast.some((c: any) => c.name === directorMember.name)) {
        guestCast = [
          ...guestCast,
          {
            id: directorMember.id,
            name: directorMember.name,
            character: "Director",
            profile_path: (directorMember as any).profile_path || null,
          },
        ];
      }

      // Check if this movie was already logged
      const shouldCreateNew = Boolean(createNewRewatch);
      const existingIndex = guestLogs.findIndex(
        (l: any) => (existingLogId && l.id === existingLogId) || (!shouldCreateNew && l.tmdb_id === tmdbId)
      );
      const isExisting = !shouldCreateNew && existingIndex !== -1;
      const existingItem = isExisting ? guestLogs[existingIndex] : null;

      const logToSave: Log = {
        id: isExisting ? existingItem.id : `guest-log-${Date.now()}`,
        user_id: "guest-user-123",
        tmdb_id: tmdbId,
        watched_at: finalWatchedAt,
        rating: finalRating,
        review: isExisting ? (existingItem?.review || null) : null,
        notes: isExisting ? (existingItem?.notes || null) : null,
        platform: platform || existingItem?.platform || "Netflix",
        format: existingItem?.format || "Normal",
        is_rewatch: Boolean(isRewatch || shouldCreateNew),
        contains_spoilers: isExisting ? (existingItem?.contains_spoilers || false) : false,
        custom_poster_path: isExisting ? (existingItem?.custom_poster_path || null) : null,
        created_at: isExisting ? (existingItem?.created_at || new Date().toISOString()) : new Date().toISOString(),
        movie: {
          tmdb_id: tmdbId,
          title,
          poster_path: movie.poster_path || null,
          backdrop_path: movie.backdrop_path || null,
          release_date: movie.release_date || null,
          runtime: movie.runtime || null,
          vote_average: movie.vote_average || null,
          overview: movie.overview || null,
          genres: movie.genres || null,
          production_countries: movie.production_countries || null,
          production_companies: movie.production_companies || null,
          cast_data: guestCast.length > 0 ? guestCast : null,
        },
      };

      let updatedLogs: any[];
      if (isExisting) {
        // Update in-place only if user is specifically editing that viewing
        updatedLogs = guestLogs.map((l: any, idx: number) =>
          idx === existingIndex ? logToSave : l
        );
      } else {
        // Prepend new viewing to preserve all viewing dates in the diary
        updatedLogs = [logToSave, ...guestLogs];
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("filmtracker_guest_logs", JSON.stringify(updatedLogs));
      }

      // Challenges & Badges evaluation
      checkAndUpdateMonthlyChallenges("guest", logToSave).then(({ newlyCompleted, allCompleted }) => {
        if ((newlyCompleted.length > 0 || allCompleted) && triggerConfetti) {
          triggerConfetti();
        }
      });

      const currentGuestBadges = JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem("filmtracker_guest_badges") || "[]"
          : "[]"
      );
      const newlyUnlockedBadges = checkNewBadges(updatedLogs, currentGuestBadges);
      if (newlyUnlockedBadges.length > 0) {
        persistAndNotifyUnlockedBadges(newlyUnlockedBadges, null);
      } else if (finalRating && finalRating >= 8 && triggerConfetti) {
        triggerConfetti();
      }

      if (onLogSaved) onLogSaved();
      return { success: true, log: logToSave, isUpdate: isExisting };
    }

    // 2. Authenticated User Mode
    let activeUserId = user.id;
    const { data: userData, error: userCheckErr } = await supabase.auth.getUser();
    if (userCheckErr || !userData?.user) {
      throw new Error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
    }
    activeUserId = userData.user.id;

    // Fetch full TMDB movie details if essential metadata is missing
    let fullMovie: any = movie;
    if (!movie.overview || !movie.genres || !movie.credits) {
      try {
        const fetched = await getMovieDetails(tmdbId);
        if (fetched) {
          fullMovie = fetched;
        }
      } catch (err) {
        console.warn("Could not fetch extra TMDB details for quick log:", err);
      }
    }

    const directorMember = fullMovie.credits?.crew?.find(
      (c: any) => c.job === "Director" || c.department === "Directing"
    );
    let userCast = fullMovie.credits?.cast?.slice(0, 10) || [];
    if (directorMember && !userCast.some((c: any) => c.name === directorMember.name)) {
      userCast = [
        ...userCast,
        {
          id: directorMember.id,
          name: directorMember.name,
          character: "Director",
          profile_path: (directorMember as any).profile_path || null,
        },
      ];
    }

    // Step A: Upsert movie in local cache
    const { error: movieError } = await supabase.from("movies").upsert({
      tmdb_id: tmdbId,
      title,
      poster_path: fullMovie.poster_path || movie.poster_path || null,
      backdrop_path: fullMovie.backdrop_path || movie.backdrop_path || null,
      release_date: fullMovie.release_date || movie.release_date || null,
      runtime: fullMovie.runtime || movie.runtime || null,
      genres: fullMovie.genres || movie.genres || [],
      production_countries: fullMovie.production_countries || movie.production_countries || [],
      production_companies: fullMovie.production_companies || movie.production_companies || [],
      cast_data: userCast,
      vote_average: fullMovie.vote_average || movie.vote_average || null,
      overview: fullMovie.overview || movie.overview || null,
      updated_at: new Date().toISOString(),
    });

    if (movieError) {
      console.warn("QuickLog movie cache warning:", movieError);
    }

    // Step B: Target log determination
    const shouldCreateNew = Boolean(createNewRewatch);
    let targetLogId: string | null = (!shouldCreateNew && existingLogId) ? existingLogId : null;
    let existingLogData: any = null;

    if (!shouldCreateNew && !targetLogId) {
      // If NOT a new rewatch and no specific log id passed, find latest log to update
      const { data: existingLogs } = await supabase
        .from("logs")
        .select("id, rating, review, notes, platform, format, is_rewatch, contains_spoilers, custom_poster_path, watched_at, created_at")
        .eq("user_id", activeUserId)
        .eq("tmdb_id", tmdbId)
        .order("created_at", { ascending: false });

      if (existingLogs && existingLogs.length > 0) {
        existingLogData = existingLogs[0];
        targetLogId = existingLogs[0].id;
      }
    } else if (targetLogId) {
      const { data: specificLog } = await supabase
        .from("logs")
        .select("id, rating, review, notes, platform, format, is_rewatch, contains_spoilers, custom_poster_path, watched_at, created_at")
        .eq("id", targetLogId)
        .maybeSingle();
      if (specificLog) existingLogData = specificLog;
    }

    const isUpdate = !shouldCreateNew && Boolean(targetLogId);
    let savedLogId = targetLogId;

    if (isUpdate && targetLogId) {
      // UPDATE existing log record
      const { error: updateError } = await supabase
        .from("logs")
        .update({
          watched_at: finalWatchedAt,
          rating: finalRating,
          platform: platform || existingLogData?.platform || "Netflix",
          is_rewatch: Boolean(isRewatch),
        })
        .eq("id", targetLogId);

      if (updateError) throw updateError;
    } else {
      // INSERT new log record (New viewing / Rewatch)
      const { data: newLogData, error: insertError } = await supabase
        .from("logs")
        .insert({
          user_id: activeUserId,
          tmdb_id: tmdbId,
          watched_at: finalWatchedAt,
          rating: finalRating,
          review: null,
          notes: null,
          platform: platform || "Netflix",
          format: "Normal",
          is_rewatch: Boolean(isRewatch || shouldCreateNew),
          contains_spoilers: false,
          custom_poster_path: null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      savedLogId = newLogData.id;
    }

    const savedLogObj: Log = {
      id: savedLogId || `log-${Date.now()}`,
      user_id: activeUserId,
      tmdb_id: tmdbId,
      watched_at: finalWatchedAt,
      rating: finalRating,
      review: existingLogData?.review || null,
      notes: existingLogData?.notes || null,
      platform: platform || existingLogData?.platform || "Netflix",
      format: existingLogData?.format || "Normal",
      is_rewatch: isRewatch,
      contains_spoilers: existingLogData?.contains_spoilers || false,
      custom_poster_path: existingLogData?.custom_poster_path || null,
      movie: {
        tmdb_id: tmdbId,
        title,
        poster_path: fullMovie.poster_path || movie.poster_path || null,
        backdrop_path: fullMovie.backdrop_path || movie.backdrop_path || null,
        release_date: fullMovie.release_date || movie.release_date || null,
        runtime: fullMovie.runtime || movie.runtime || null,
        genres: fullMovie.genres || movie.genres || [],
        production_countries: fullMovie.production_countries || movie.production_countries || [],
        production_companies: fullMovie.production_companies || movie.production_companies || [],
        cast_data: userCast,
        vote_average: fullMovie.vote_average || movie.vote_average || null,
        overview: fullMovie.overview || movie.overview || null,
      },
    };

    // Step C: Badges check async
    supabase
      .from("user_badges")
      .select("badge_code")
      .eq("user_id", activeUserId)
      .then(({ data: userBadges }) => {
        const existing = new Set((userBadges || []).map((b: any) => b.badge_code));
        fetchAllUserLogs(activeUserId).then((allUserLogs) => {
          const fullLogs = allUserLogs && allUserLogs.length > 0 ? allUserLogs : [savedLogObj];
          const unlocked = checkNewBadges(fullLogs, existing);
          if (unlocked.length > 0) {
            persistAndNotifyUnlockedBadges(unlocked, activeUserId);
          }
        });
      });

    // Step D: Challenges check async
    checkAndUpdateMonthlyChallenges(activeUserId, savedLogObj).then(
      ({ newlyCompleted, allCompleted }) => {
        if ((newlyCompleted.length > 0 || allCompleted) && triggerConfetti) {
          triggerConfetti();
        }
      }
    );

    if (finalRating && finalRating >= 8 && triggerConfetti) {
      triggerConfetti();
    }

    if (onLogSaved) {
      onLogSaved();
    }

    return { success: true, log: savedLogObj, isUpdate };
  } catch (err: any) {
    console.error("Error in performQuickLog:", err);
    return { success: false, error: err?.message || "Ocurrió un error al registrar la película." };
  }
}
