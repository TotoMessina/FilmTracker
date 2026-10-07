import { supabase } from "@/lib/supabase/client";
import {
  Cineclub,
  CineclubMember,
  CineclubPoll,
  CineclubPollOption,
  CineclubMessage,
  Profile,
} from "@/lib/supabase/types";

// Helper to generate UUIDs
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 format
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==========================================
// CINECLUBS CRUD & SUPABASE QUERIES
// ==========================================

export async function getCineclubs(): Promise<Cineclub[]> {
  try {
    const { data, error } = await supabase
      .from("cineclubs")
      .select(`
        *,
        creator:profiles!creator_id(*),
        current_movie:movies!current_movie_tmdb_id(*),
        members:cineclub_members(
          *,
          user:profiles(*)
        ),
        poll:cineclub_polls(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Cineclubs] Error cargando clubes de Supabase:", error.message);
      return [];
    }

    if (Array.isArray(data)) {
      return data.map((c: any) => ({
        ...c,
        poll: Array.isArray(c.poll) ? c.poll[0] || null : c.poll,
        members: Array.isArray(c.members) ? c.members : [],
      })) as Cineclub[];
    }
  } catch (err) {
    console.warn("[Cineclubs] Error general en getCineclubs:", err);
  }

  return [];
}

export async function getCineclubById(id: string): Promise<Cineclub | null> {
  try {
    const { data, error } = await supabase
      .from("cineclubs")
      .select(`
        *,
        creator:profiles!creator_id(*),
        current_movie:movies!current_movie_tmdb_id(*),
        members:cineclub_members(
          *,
          user:profiles(*)
        ),
        poll:cineclub_polls(*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn(`[Cineclubs] Error cargando club ${id}:`, error.message);
      return null;
    }

    if (data) {
      return {
        ...data,
        poll: Array.isArray(data.poll) ? data.poll[0] || null : data.poll,
        members: Array.isArray(data.members) ? data.members : [],
      } as Cineclub;
    }
  } catch (err) {
    console.warn(`[Cineclubs] Excepción cargando club ${id}:`, err);
  }

  return null;
}

export async function createCineclub(
  newClubData: {
    name: string;
    description?: string;
    cover_url?: string;
    current_movie_tmdb_id?: number;
    current_movie?: any;
    voting_deadline?: string;
    discussion_date?: string;
  },
  creator: Profile | { id: string; username: string; avatar_url?: string | null }
): Promise<Cineclub | null> {
  const clubId = generateUUID();

  // 1. Ensure current movie exists in movies table if selected
  if (newClubData.current_movie && newClubData.current_movie_tmdb_id) {
    try {
      await supabase.from("movies").upsert({
        tmdb_id: newClubData.current_movie_tmdb_id,
        title: newClubData.current_movie.title || "Película",
        poster_path: newClubData.current_movie.poster_path || null,
        backdrop_path: newClubData.current_movie.backdrop_path || null,
        release_date: newClubData.current_movie.release_date || null,
        runtime: newClubData.current_movie.runtime || null,
        vote_average: newClubData.current_movie.vote_average || null,
        overview: newClubData.current_movie.overview || null,
      });
    } catch (movieErr) {
      console.warn("[Cineclubs] Advertencia guardando película en BD:", movieErr);
    }
  }

  // 2. Insert into cineclubs table
  try {
    const { error: clubError } = await supabase.from("cineclubs").insert({
      id: clubId,
      name: newClubData.name.trim(),
      description: newClubData.description?.trim() || null,
      cover_url:
        newClubData.cover_url ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
      creator_id: creator.id,
      current_movie_tmdb_id: newClubData.current_movie_tmdb_id || null,
      voting_deadline: newClubData.voting_deadline || null,
      discussion_date: newClubData.discussion_date || null,
    });

    if (clubError) {
      console.error("[Cineclubs] Error insertando cineclub en Supabase:", clubError.message);
      throw new Error(clubError.message);
    }

    // 3. Insert creator as admin member
    await supabase.from("cineclub_members").insert({
      club_id: clubId,
      user_id: creator.id,
      role: "admin",
      has_watched: true,
    });

    // 4. Create initial active poll container
    await supabase.from("cineclub_polls").insert({
      club_id: clubId,
      options: [],
      active: true,
    });

    window.dispatchEvent(new CustomEvent("filmtracker_cineclubs_updated"));

    // 5. Return complete club record
    return await getCineclubById(clubId);
  } catch (err: any) {
    console.error("[Cineclubs] Error general en createCineclub:", err);
    throw err;
  }
}

export async function joinCineclub(
  clubId: string,
  user: Profile | { id: string; username: string; avatar_url?: string | null }
): Promise<Cineclub | null> {
  try {
    const { error } = await supabase.from("cineclub_members").upsert(
      {
        club_id: clubId,
        user_id: user.id,
        role: "member",
        has_watched: false,
      },
      { onConflict: "club_id, user_id" }
    );

    if (error) {
      console.warn("[Cineclubs] Error uniéndose a cineclub:", error.message);
    }

    window.dispatchEvent(new CustomEvent("filmtracker_cineclubs_updated"));
    return await getCineclubById(clubId);
  } catch (err) {
    console.warn("[Cineclubs] Excepción en joinCineclub:", err);
    return null;
  }
}

export async function toggleMemberWatched(
  clubId: string,
  userId: string,
  hasWatched: boolean
): Promise<Cineclub | null> {
  try {
    const { error } = await supabase
      .from("cineclub_members")
      .update({ has_watched: hasWatched })
      .match({ club_id: clubId, user_id: userId });

    if (error) {
      console.warn("[Cineclubs] Error actualizando has_watched:", error.message);
    }

    window.dispatchEvent(new CustomEvent("filmtracker_cineclubs_updated"));
    return await getCineclubById(clubId);
  } catch (err) {
    console.warn("[Cineclubs] Excepción en toggleMemberWatched:", err);
    return null;
  }
}

export async function voteInCineclubPoll(
  clubId: string,
  tmdbId: number,
  userId: string
): Promise<Cineclub | null> {
  try {
    // 1. Fetch current active poll
    const { data: pollData, error: pollErr } = await supabase
      .from("cineclub_polls")
      .select("*")
      .eq("club_id", clubId)
      .eq("active", true)
      .maybeSingle();

    if (pollErr || !pollData) {
      console.warn("[Cineclubs] No se encontró encuesta activa:", pollErr?.message);
      return null;
    }

    const currentOptions: CineclubPollOption[] = Array.isArray(pollData.options)
      ? pollData.options
      : [];

    // 2. Update votes in options
    const updatedOptions = currentOptions.map((opt) => {
      const filteredVotes = (opt.votes || []).filter((uId) => uId !== userId);
      if (opt.tmdb_id === tmdbId) {
        return { ...opt, votes: [...filteredVotes, userId] };
      }
      return { ...opt, votes: filteredVotes };
    });

    await supabase
      .from("cineclub_polls")
      .update({ options: updatedOptions })
      .eq("id", pollData.id);

    window.dispatchEvent(new CustomEvent("filmtracker_cineclubs_updated"));
    return await getCineclubById(clubId);
  } catch (err) {
    console.warn("[Cineclubs] Excepción en voteInCineclubPoll:", err);
    return null;
  }
}

export async function proposePollMovie(
  clubId: string,
  movie: { tmdb_id: number; title: string; poster_path?: string | null },
  userId: string
): Promise<Cineclub | null> {
  try {
    // 1. Ensure movie exists in movies table
    await supabase.from("movies").upsert({
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      poster_path: movie.poster_path || null,
    });

    // 2. Fetch or create poll
    let { data: pollData } = await supabase
      .from("cineclub_polls")
      .select("*")
      .eq("club_id", clubId)
      .eq("active", true)
      .maybeSingle();

    if (!pollData) {
      const { data: newPoll } = await supabase
        .from("cineclub_polls")
        .insert({
          club_id: clubId,
          options: [],
          active: true,
        })
        .select()
        .single();
      pollData = newPoll;
    }

    if (!pollData) return null;

    const currentOptions: CineclubPollOption[] = Array.isArray(pollData.options)
      ? pollData.options
      : [];

    if (!currentOptions.some((o) => o.tmdb_id === movie.tmdb_id)) {
      currentOptions.push({
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        votes: [userId],
      });

      await supabase
        .from("cineclub_polls")
        .update({ options: currentOptions })
        .eq("id", pollData.id);

      window.dispatchEvent(new CustomEvent("filmtracker_cineclubs_updated"));
    }

    return await getCineclubById(clubId);
  } catch (err) {
    console.warn("[Cineclubs] Excepción en proposePollMovie:", err);
    return null;
  }
}

// ==========================================
// CINECLUB MESSAGES (CHAT / MURO DE DEBATE)
// ==========================================

export async function getClubMessages(clubId: string): Promise<CineclubMessage[]> {
  try {
    const { data, error } = await supabase
      .from("cineclub_messages")
      .select("*, user:profiles(*)")
      .eq("club_id", clubId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[Cineclubs] Error cargando mensajes:", error.message);
      return [];
    }

    if (Array.isArray(data)) {
      return data as CineclubMessage[];
    }
  } catch (err) {
    console.warn("[Cineclubs] Excepción en getClubMessages:", err);
  }

  return [];
}

export async function postClubMessage(
  clubId: string,
  payload: { user_id: string; message: string; is_spoiler: boolean },
  userProfile?: Profile | { id: string; username: string; avatar_url?: string | null }
): Promise<CineclubMessage | null> {
  const msgId = generateUUID();

  try {
    const { data, error } = await supabase
      .from("cineclub_messages")
      .insert({
        id: msgId,
        club_id: clubId,
        user_id: payload.user_id,
        message: payload.message.trim(),
        is_spoiler: payload.is_spoiler,
      })
      .select("*, user:profiles(*)")
      .single();

    if (error) {
      console.warn("[Cineclubs] Error enviando mensaje:", error.message);
      return null;
    }

    window.dispatchEvent(new CustomEvent(`filmtracker_club_msgs_updated_${clubId}`));
    return data as CineclubMessage;
  } catch (err) {
    console.warn("[Cineclubs] Excepción en postClubMessage:", err);
    return null;
  }
}

export async function leaveCineclub(clubId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("cineclub_members")
      .delete()
      .match({ club_id: clubId, user_id: userId });

    window.dispatchEvent(new CustomEvent("filmtracker_cineclubs_updated"));
    return !error;
  } catch {
    return false;
  }
}
