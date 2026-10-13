import { supabase } from "@/lib/supabase/client";
import { Profile, SharedWatchlist } from "@/lib/supabase/types";



/**
 * Retrieves mutual followers (friends who follow each other) for a given user strictly from Supabase.
 */
export async function getMutualFollowers(userId: string): Promise<Profile[]> {
  if (!userId || userId.startsWith("guest")) {
    return [];
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
      .map((r) => r.following as unknown as Profile)
      .filter(Boolean) as Profile[];

    const followerIds = new Set(
      (followerData || [])
        .map((r) => r.follower as unknown as Profile)
        .filter(Boolean)
        .map((p) => p.id)
    );

    // Mutuals: Intersection of following and followers
    const mutuals = followingProfiles.filter((p) => followerIds.has(p.id));

    if (mutuals.length > 0) {
      return mutuals;
    }

    if (followingProfiles.length > 0) {
      return followingProfiles;
    }

    // Community profiles from database
    const { data: others } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId)
      .limit(10);

    if (others && others.length > 0) {
      return others as Profile[];
    }
  } catch (err) {
    console.warn("Error fetching mutual followers from Supabase:", err);
  }

  return [];
}

/** The shared database row is authoritative for every participant. */
export async function getSharedWatchlists(userId: string): Promise<SharedWatchlist[]> {
  if (!userId || userId.startsWith('guest')) return [];
  const { data, error } = await supabase.from('shared_watchlists').select('*')
    .or(`created_by.eq.${userId},members.cs.${JSON.stringify([{ id: userId }])}`)
    .order('updated_at', { ascending: false });
  if (error) throw new Error('No se pudieron cargar las listas compartidas. Intentá nuevamente.');
  return (data || []) as SharedWatchlist[];
}

/** Creation and edition must be separate: upsert requires creator-only INSERT permission. */
export async function saveSharedWatchlist(watchlist: SharedWatchlist, create = false): Promise<SharedWatchlist> {
  const now = new Date(Math.max(Date.now(), (Date.parse(watchlist.updated_at || '') || 0) + 1)).toISOString();
  const table = supabase.from('shared_watchlists');
  let query;
  if (create) {
    query = table.insert({ ...watchlist, updated_at: now });
  } else {
    // Compare the version we read so simultaneous edits cannot erase another member's movies.
    if (!watchlist.updated_at) throw new Error('Recargá la lista antes de modificarla.');
    query = table.update({ movies: watchlist.movies, updated_at: now })
      .eq('id', watchlist.id).eq('updated_at', watchlist.updated_at);
  }
  const { data, error } = await query.select('*').maybeSingle();
  if (error) throw new Error('No se pudo guardar la lista compartida. Revisá tu conexión y tus permisos e intentá nuevamente.');
  if (!data) throw new Error('La lista cambió o ya no tenés acceso. Se actualizará para que puedas reintentar.');
  return data as SharedWatchlist;
}

export async function deleteSharedWatchlist(watchlistId: string, userId: string): Promise<void> {
  const { data, error } = await supabase.from('shared_watchlists').delete()
    .eq('id', watchlistId).eq('created_by', userId).select('id').maybeSingle();
  if (error || !data) throw new Error('No se pudo eliminar la lista. Solo su creador puede borrarla.');
}
