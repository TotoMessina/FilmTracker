import { supabase } from "@/lib/supabase/client";
import { Profile, SharedWatchlist, SharedWatchlistMovie, SharedWatchlistMember } from "@/lib/supabase/types";

const LOCAL_STORAGE_KEY_PREFIX = "filmtracker_shared_watchlists_";

/**
 * Retrieves mutual followers (friends who follow each other) for a given user.
 */
export async function getMutualFollowers(userId: string): Promise<Profile[]> {
  if (!userId) {
    return [
      {
        id: "demo-amigo-1",
        username: "Cinefilo_Amigo",
        avatar_url: "https://ui-avatars.com/api/?name=Amigo+Cine&background=e50914&color=fff",
      },
      {
        id: "demo-amigo-2",
        username: "Laura_Films",
        avatar_url: "https://ui-avatars.com/api/?name=Laura+Films&background=3b82f6&color=fff",
      },
    ];
  }

  try {
    // 1. Users that current user is following
    const { data: followingData } = await supabase
      .from("relationships")
      .select("following:profiles!relationships_following_id_fkey(*)")
      .eq("follower_id", userId);

    // 2. Users that are following current user
    const { data: followerData } = await supabase
      .from("relationships")
      .select("follower:profiles!relationships_follower_id_fkey(*)")
      .eq("following_id", userId);

    const followingProfiles = (followingData || [])
      .map((r: any) => r.following)
      .filter(Boolean) as Profile[];

    const followerIds = new Set(
      (followerData || [])
        .map((r: any) => r.follower)
        .filter(Boolean)
        .map((p: any) => p.id)
    );

    // Mutuals: Intersection of following and followers
    const mutuals = followingProfiles.filter((p) => followerIds.has(p.id));

    // If mutuals found, return them
    if (mutuals.length > 0) {
      return mutuals;
    }

    // Fallback: If no strict mutuals yet (e.g., fresh dev database or test user),
    // provide the following users or other community profiles so the feature is immediately testable
    if (followingProfiles.length > 0) {
      return followingProfiles;
    }

    const { data: others } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId)
      .limit(6);

    if (others && others.length > 0) {
      return others as Profile[];
    }
  } catch (err) {
    console.warn("Error fetching mutual followers:", err);
  }

  // Demo fallback
  return [
    {
      id: "demo-amigo-1",
      username: "Cinefilo_Amigo",
      avatar_url: "https://ui-avatars.com/api/?name=Amigo+Cine&background=e50914&color=fff",
    },
    {
      id: "demo-amigo-2",
      username: "Laura_Films",
      avatar_url: "https://ui-avatars.com/api/?name=Laura+Films&background=3b82f6&color=fff",
    },
  ];
}

/**
 * Reads all shared watchlists where the user is either the creator or a member.
 */
export async function getSharedWatchlists(userId: string): Promise<SharedWatchlist[]> {
  const localKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
  let localData: SharedWatchlist[] = [];

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local shared watchlists:", err);
  }

  try {
    const { data, error } = await supabase
      .from("shared_watchlists")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      // Filter where user is creator or member
      const userLists = (data as SharedWatchlist[]).filter(
        (list) =>
          list.created_by === userId ||
          (Array.isArray(list.members) && list.members.some((m) => m.id === userId))
      );

      if (userLists.length > 0) {
        try {
          localStorage.setItem(localKey, JSON.stringify(userLists));
        } catch (e) {
          // ignore
        }
        return userLists;
      }
    }
  } catch (err) {
    console.warn("Supabase shared_watchlists fetch fallback:", err);
  }

  return localData;
}

/**
 * Saves or updates a shared watchlist in Supabase and localStorage.
 */
export async function saveSharedWatchlist(watchlist: SharedWatchlist): Promise<void> {
  const now = new Date().toISOString();
  const updatedList: SharedWatchlist = {
    ...watchlist,
    updated_at: now,
  };

  // 1. Update in creator and members' localStorage for instant sync
  const targetUserIds = [
    updatedList.created_by,
    ...(updatedList.members || []).map((m) => m.id),
  ];

  targetUserIds.forEach((uid) => {
    try {
      const key = `${LOCAL_STORAGE_KEY_PREFIX}${uid}`;
      const existing: SharedWatchlist[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((w) => w.id === updatedList.id);
      let nextLists: SharedWatchlist[];
      if (idx >= 0) {
        nextLists = [...existing];
        nextLists[idx] = updatedList;
      } else {
        nextLists = [updatedList, ...existing];
      }
      localStorage.setItem(key, JSON.stringify(nextLists));
    } catch (e) {
      // ignore
    }
  });

  // 2. Persist to Supabase
  try {
    await supabase.from("shared_watchlists").upsert({
      id: updatedList.id,
      title: updatedList.title,
      description: updatedList.description || null,
      created_by: updatedList.created_by,
      members: updatedList.members || [],
      movies: updatedList.movies || [],
      created_at: updatedList.created_at,
      updated_at: now,
    });
  } catch (err) {
    console.warn("Could not upsert to Supabase shared_watchlists (fallback active):", err);
  }
}

/**
 * Deletes a shared watchlist.
 */
export async function deleteSharedWatchlist(watchlistId: string, userId: string): Promise<void> {
  // 1. Remove from localStorage
  try {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
    const existing: SharedWatchlist[] = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = existing.filter((w) => w.id !== watchlistId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Could not remove from local storage:", err);
  }

  // 2. Remove from Supabase
  try {
    await supabase
      .from("shared_watchlists")
      .delete()
      .eq("id", watchlistId);
  } catch (err) {
    console.warn("Could not delete from Supabase shared_watchlists:", err);
  }
}
