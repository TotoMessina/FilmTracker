import { supabase } from "@/lib/supabase/client";
import type { Log, WatchlistItem } from "@/lib/supabase/types";

export interface FetchLogsOptions {
  select?: string;
  orderByWatched?: boolean;
  signal?: AbortSignal;
}

export interface FetchWatchlistOptions {
  select?: string;
  signal?: AbortSignal;
}

/**
 * Fetches all logs for a user, paginating in 500-item chunks
 * to bypass Supabase PostgREST default 1000-row limit.
 * Ensures 100% exact statistical accuracy.
 */
export async function fetchAllUserLogs(
  userId: string,
  options?: FetchLogsOptions
): Promise<Log[]> {
  if (!userId || userId === "guest") return [];

  const allLogs: Log[] = [];
  const chunkSize = 500;
  const selectQuery = options?.select || "*, movie:movies(*)";

  for (let offset = 0; ; offset += chunkSize) {
    if (options?.signal?.aborted) break;

    let query = supabase
      .from("logs")
      .select(selectQuery)
      .eq("user_id", userId);

    if (options?.orderByWatched) {
      query = query
        .order("watched_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.order("id", { ascending: true });
    }

    if (options?.signal) {
      query = query.abortSignal(options.signal);
    }

    const { data, error } = await query.range(offset, offset + chunkSize - 1);
    if (error) {
      console.warn("Error in fetchAllUserLogs chunk:", error);
      throw error;
    }

    if (options?.signal?.aborted) break;

    if (data && data.length > 0) {
      allLogs.push(...(data as unknown as Log[]));
    }

    if (!data || data.length < chunkSize) {
      break;
    }
  }

  return allLogs;
}

/**
 * Fetches all watchlist items for a user, paginating in 500-item chunks.
 */
export async function fetchAllUserWatchlist(
  userId: string,
  options?: FetchWatchlistOptions
): Promise<WatchlistItem[]> {
  if (!userId || userId === "guest") return [];

  const allItems: WatchlistItem[] = [];
  const chunkSize = 500;
  const selectQuery = options?.select || "*, movie:movies(*)";

  for (let offset = 0; ; offset += chunkSize) {
    if (options?.signal?.aborted) break;

    let query = supabase
      .from("watchlist")
      .select(selectQuery)
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (options?.signal) {
      query = query.abortSignal(options.signal);
    }

    const { data, error } = await query.range(offset, offset + chunkSize - 1);
    if (error) {
      console.warn("Error in fetchAllUserWatchlist chunk:", error);
      throw error;
    }

    if (options?.signal?.aborted) break;

    if (data && data.length > 0) {
      allItems.push(...(data as unknown as WatchlistItem[]));
    }

    if (!data || data.length < chunkSize) {
      break;
    }
  }

  return allItems;
}
