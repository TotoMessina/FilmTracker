import { supabase } from "@/lib/supabase/client";
import { UserCollection } from "@/lib/supabase/types";

const LOCAL_STORAGE_PREFIX = "filmtracker_collections_";

/**
 * Retrieves all collections created by a user, querying Supabase with localStorage fallback.
 */
export async function getUserCollections(userId: string): Promise<UserCollection[]> {
  if (!userId) return [];

  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
  let localData: UserCollection[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Error reading local collections:", e);
  }

  try {
    const { data, error } = await supabase
      .from("user_collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Sync local storage with remote
      try {
        localStorage.setItem(localKey, JSON.stringify(data));
      } catch (err) {
        console.warn("Could not cache collections to localStorage:", err);
      }
      return data as UserCollection[];
    }
  } catch (err) {
    // If Supabase table is not yet created, fallback smoothly to local storage
    console.warn("Supabase collections fetch skipped or table missing, using local storage:", err);
  }

  return localData;
}

/**
 * Saves or updates a user collection in Supabase and localStorage.
 */
export async function saveUserCollection(collection: UserCollection): Promise<void> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${collection.user_id}`;

  // 1. Update localStorage immediately for responsive UI
  try {
    const existing = await getUserCollections(collection.user_id);
    const index = existing.findIndex((c) => c.id === collection.id);
    let updated: UserCollection[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = collection;
    } else {
      updated = [collection, ...existing];
    }
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (err) {
    console.warn("Error saving collection to local storage:", err);
  }

  // 2. Try persisting to Supabase
  try {
    await supabase.from("user_collections").upsert({
      id: collection.id,
      user_id: collection.user_id,
      title: collection.title,
      description: collection.description || null,
      cover_poster_path: collection.cover_poster_path || null,
      movies: collection.movies || [],
      created_at: collection.created_at,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not upsert collection to Supabase table (fallback active):", err);
  }
}

/**
 * Deletes a collection by ID.
 */
export async function deleteUserCollection(collectionId: string, userId: string): Promise<void> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}`;

  // 1. Delete from localStorage
  try {
    const existing = await getUserCollections(userId);
    const filtered = existing.filter((c) => c.id !== collectionId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Error removing collection from local storage:", err);
  }

  // 2. Delete from Supabase
  try {
    await supabase
      .from("user_collections")
      .delete()
      .eq("id", collectionId)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("Could not delete collection from Supabase:", err);
  }
}
