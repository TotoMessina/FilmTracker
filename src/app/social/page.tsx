"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  UserPlus, 
  UserCheck, 
  HeartHandshake, 
  Star, 
  Calendar, 
  Sparkles,
  Film
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Profile, Log } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatDate, getRatingColor } from "@/lib/utils/formatting";
import { useApp } from "@/lib/context/AppContext";
import { ReviewCard } from "@/components/social/ReviewCard";
import { CommunityTrendingCarousel } from "@/components/home/CommunityTrendingCarousel";

interface SoulmateCandidate {
  profile: Profile;
  compatibilityScore: number;
  sharedCount: number;
}

export default function SocialPage() {
  const { user, profile: myProfile, isGuest } = useAuth();
  const { requireAuth } = useApp();

  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [soulmates, setSoulmates] = useState<SoulmateCandidate[]>([]);
  const [activityFeed, setActivityFeed] = useState<Log[]>([]);
  const [userWatchedIds, setUserWatchedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load community feed & soulmates
  useEffect(() => {
    async function loadSocial() {
      setLoading(true);
      try {
        // 1. Fetch public activity feed
        const { data: feedData } = await supabase
          .from("logs")
          .select("*, profile:profiles(*), movie:movies(*)")
          .order("created_at", { ascending: false })
          .limit(15);

        if (feedData) {
          setActivityFeed(feedData as Log[]);
        }

        // 2. Fetch current following
        if (user) {
          const { data: relData } = await supabase
            .from("relationships")
            .select("following_id")
            .eq("follower_id", user.id);

          if (relData) {
            setFollowingIds(new Set(relData.map((r) => r.following_id)));
          }
        }

        // 3. Compute Soulmates with real shared movie data
        if (user) {
          // Get current user's watched tmdb_ids
          const { data: myLogs } = await supabase
            .from("logs")
            .select("tmdb_id")
            .eq("user_id", user.id);

          const myMovieIds = new Set((myLogs || []).map((l: { tmdb_id: number }) => l.tmdb_id));
          setUserWatchedIds(myMovieIds);

          const { data: allProfiles } = await supabase
            .from("profiles")
            .select("*")
            .limit(20);

          if (allProfiles && myMovieIds.size > 0) {
            const others = allProfiles.filter((p) => p.id !== user.id);

            // For each other user, count how many of their movies overlap with ours
            const soulmatesWithData = await Promise.all(
              others.map(async (p) => {
                const { data: theirLogs } = await supabase
                  .from("logs")
                  .select("tmdb_id")
                  .eq("user_id", p.id);

                const theirIds = (theirLogs || []).map((l: { tmdb_id: number }) => l.tmdb_id);
                const shared = theirIds.filter((id: number) => myMovieIds.has(id));
                const sharedCount = shared.length;

                // Only include users who have watched at least 1 movie
                if (theirIds.length === 0) return null;

                // Compatibility: shared / union of both sets
                const unionSize = new Set([...Array.from(myMovieIds), ...theirIds]).size;
                const compatibilityScore = unionSize > 0
                  ? Math.min(99, Math.round((sharedCount / Math.min(unionSize, 50)) * 100))
                  : 0;

                return { profile: p, compatibilityScore, sharedCount };
              })
            );

            const validSoulmates = soulmatesWithData
              .filter((s): s is SoulmateCandidate => s !== null && s.sharedCount >= 0)
              .sort((a, b) => b.sharedCount - a.sharedCount || b.compatibilityScore - a.compatibilityScore)
              .slice(0, 8);

            setSoulmates(validSoulmates);
          } else if (allProfiles) {
            // User has no movies yet — show other users without scores
            const others = allProfiles.filter((p) => p.id !== user.id).slice(0, 8);
            setSoulmates(others.map((p) => ({ profile: p, compatibilityScore: 0, sharedCount: 0 })));
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setUserWatchedIds(new Set(guestLogs.map((l: any) => l.tmdb_id)));

          const { data: allProfiles } = await supabase
            .from("profiles")
            .select("*")
            .limit(4);
          if (allProfiles) {
            setSoulmates(allProfiles.slice(0, 4).map((p) => ({
              profile: p,
              compatibilityScore: 0,
              sharedCount: 0,
            })));
          }
        }
      } catch (err) {
        console.warn("Social load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSocial();
  }, [user, isGuest]);

  // Handle Search Users
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setSearching(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchUsername.trim()}%`)
        .limit(10);

      if (data) {
        setSearchResults(data as Profile[]);
      }
    } catch (err) {
      console.warn("User search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleToggleFollow = async (targetId: string) => {
    if (!requireAuth("seguir a otros usuarios en la comunidad")) return;
    const isCurrentlyFollowing = followingIds.has(targetId);

    if (isCurrentlyFollowing) {
      await supabase
        .from("relationships")
        .delete()
        .eq("follower_id", user!.id)
        .eq("following_id", targetId);

      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    } else {
      await supabase.from("relationships").insert({
        follower_id: user!.id,
        following_id: targetId,
      });

      setFollowingIds((prev) => new Set(prev).add(targetId));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comunidad Cinéfila
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Descubre cinéfilos con gustos similares, busca amigos y mira qué están viendo en tiempo real.
        </p>
      </div>

      {/* User Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Buscar usuarios por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141420] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition"
        >
          {searching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* Search Results if any */}
      {searchResults.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/10 space-y-3">
          <h3 className="font-bold text-white text-sm">Resultados de Búsqueda</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {searchResults.map((p) => {
              const isFollowing = followingIds.has(p.id);
              const isMe = user?.id === p.id;

              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                >
                  <Link href={`/profile/${p.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}&background=e50914&color=fff`}
                      alt={p.username}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <span className="font-semibold text-sm text-white truncate hover:underline">
                      {p.username}
                    </span>
                  </Link>

                  {!isMe && (
                    <button
                      onClick={() => handleToggleFollow(p.id)}
                      className={`p-2 rounded-xl text-xs font-semibold transition ${
                        isFollowing
                          ? "bg-white/10 text-zinc-300 hover:bg-white/20"
                          : "bg-red-600 text-white hover:bg-red-500"
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Trending Carousel */}
      <CommunityTrendingCarousel />

      {/* Cine Soulmates Section */}
      {soulmates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Almas Gemelas del Cine
            </h2>
            <span className="text-xs text-zinc-500">Basado en afinidad de gustos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {soulmates.map((sm) => {
              const isFollowing = followingIds.has(sm.profile.id);

              return (
                <div
                  key={sm.profile.id}
                  className="p-5 rounded-3xl bg-[#141420] border border-white/5 hover:border-white/20 transition flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <Link href={`/profile/${sm.profile.id}`} className="flex items-center gap-3">
                      <img
                        src={sm.profile.avatar_url || `https://ui-avatars.com/api/?name=${sm.profile.username}&background=e50914&color=fff`}
                        alt={sm.profile.username}
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-white truncate hover:text-red-400 transition">
                          {sm.profile.username}
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          {sm.sharedCount > 0
                            ? `${sm.sharedCount} ${sm.sharedCount === 1 ? "título" : "títulos"} en común`
                            : "Sin películas en común aún"}
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600/10 to-amber-500/10 border border-red-500/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Compatibilidad</span>
                    </span>
                    <span className="font-black text-sm text-amber-400">
                      {sm.compatibilityScore > 0 ? `${sm.compatibilityScore}%` : "—"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(sm.profile.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isFollowing
                        ? "bg-white/10 text-zinc-300 hover:bg-white/20"
                        : "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir Cinéfilo</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Activity Feed */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight">Actividad de la Comunidad</h2>

        {activityFeed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityFeed.map((log) => (
              <ReviewCard
                key={log.id}
                log={log}
                currentUserId={user?.id}
                userWatchedIds={userWatchedIds}
                showMoviePoster={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500 text-sm">
            No hay publicaciones en el feed comunitario todavía.
          </div>
        )}
      </div>
    </div>
  );
}
