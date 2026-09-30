"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Calendar, 
  Film, 
  Star, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  Bookmark, 
  Sparkles,
  MessageSquare,
  Layers,
  BarChart3,
  Users
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Profile, Log, WatchlistItem, UserCollection } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatDate, getRatingColor } from "@/lib/utils/formatting";
import BioGenerator from "@/components/profile/BioGenerator";
import ProfileReviews from "@/components/profile/ProfileReviews";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileCollections from "@/components/profile/ProfileCollections";
import { getUserCollections } from "@/lib/services/collections";
import { StreamingPlatformsSelector } from "@/components/profile/StreamingPlatformsSelector";

export default function UserProfilePage() {
  const params = useParams();
  const targetId = params?.id as string;

  const { user } = useAuth();
  const isMe = user?.id === targetId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [activeTab, setActiveTab] = useState<"diary" | "reviews" | "collections" | "stats" | "watchlist">("diary");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Read URL query params on mount for initial tab or collection deep link
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["diary", "reviews", "collections", "stats", "watchlist"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      } else if (urlParams.get("collection")) {
        setActiveTab("collections");
      }
    }
  }, []);

  useEffect(() => {
    if (!targetId) return;

    async function loadUserProfile() {
      setLoading(true);
      try {
        // 1. Fetch profile
        const { data: profData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", targetId)
          .single();

        if (profData) {
          setProfile(profData as Profile);
        }

        // 2. Fetch user's logs
        const { data: logsData } = await supabase
          .from("logs")
          .select("*, movie:movies(*)")
          .eq("user_id", targetId)
          .order("watched_at", { ascending: false });

        if (logsData) {
          setLogs(logsData as Log[]);
        }

        // 3. Fetch user's watchlist
        const { data: wlData } = await supabase
          .from("watchlist")
          .select("*, movie:movies(*)")
          .eq("user_id", targetId);

        if (wlData) {
          setWatchlist(wlData as WatchlistItem[]);
        }

        // 4. Fetch user's collections
        const colsData = await getUserCollections(targetId);
        setCollections(colsData);

        // 5. Followers & following count
        const { count: fCount } = await supabase
          .from("relationships")
          .select("*", { count: "exact", head: true })
          .eq("following_id", targetId);

        const { count: ingCount } = await supabase
          .from("relationships")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", targetId);

        setFollowerCount(fCount || 0);
        setFollowingCount(ingCount || 0);

        // 6. Check if logged-in user follows this user and vice versa (mutual follow)
        if (user && !isMe) {
          const [relFollowed, relFollower] = await Promise.all([
            supabase
              .from("relationships")
              .select("*")
              .eq("follower_id", user.id)
              .eq("following_id", targetId)
              .maybeSingle(),
            supabase
              .from("relationships")
              .select("*")
              .eq("follower_id", targetId)
              .eq("following_id", user.id)
              .maybeSingle(),
          ]);

          if (relFollowed.data) setIsFollowing(true);
          if (relFollowed.data && relFollower.data) {
            setIsMutualFollow(true);
          }
        }

        // 7. Fetch user's badges count
        const { count: bCount } = await supabase
          .from("user_badges")
          .select("*", { count: "exact", head: true })
          .eq("user_id", targetId);

        setBadgesCount(bCount || 0);
      } catch (err) {
        console.warn("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [targetId, user, isMe]);

  const handleToggleFollow = async () => {
    if (!user) return;

    if (isFollowing) {
      await supabase
        .from("relationships")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);

      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
    } else {
      await supabase.from("relationships").insert({
        follower_id: user.id,
        following_id: targetId,
      });

      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const reviewedLogsCount = useMemo(() => {
    return logs.filter((l) => l.review && l.review.trim().length > 0).length;
  }, [logs]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 gap-2">
        <Film className="w-6 h-6 animate-pulse text-red-500" />
        <span>Cargando perfil...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>Usuario no encontrado.</p>
      </div>
    );
  }

  const watchedInCinemaCount = logs.filter((l) => l.platform === "Cine").length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141420] border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=e50914&color=fff`}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover border-2 border-red-500/40 shadow-xl"
          />

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.username}</h1>
            
            {profile.bio && (
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400 justify-center sm:justify-start pt-1">
              <span><strong className="text-white">{logs.length}</strong> películas vistas</span>
              <span><strong className="text-white">{reviewedLogsCount}</strong> reseñas</span>
              <span><strong className="text-white">{collections.length}</strong> colecciones</span>
              <span><strong className="text-white">{followerCount}</strong> seguidores</span>
              <span><strong className="text-white">{followingCount}</strong> siguiendo</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        {!isMe && user && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Link
              href={`/watchlist?tab=shared&friendId=${profile.id}`}
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition shadow"
              title="Crear o ver Watchlist Compartida con este usuario"
            >
              <Users className="w-4 h-4" />
              <span>Watchlist</span>
            </Link>

            <Link
              href={`/chat?id=${profile.id}`}
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mensaje</span>
            </Link>

            <button
              onClick={handleToggleFollow}
              className={`flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
                isFollowing
                  ? "bg-white/10 text-zinc-300 hover:bg-white/20"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Siguiendo</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Seguir</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Bio Generator (Only for own profile) */}
      {isMe && user && profile && profile.id === user.id && (
        <BioGenerator
          profile={profile}
          logs={logs}
          badges={badgesCount}
          watchedInCinema={watchedInCinemaCount}
        />
      )}

      {/* Streaming Platforms (Configurable by user, viewable by others) */}
      <StreamingPlatformsSelector
        userId={targetId}
        isMe={isMe}
        username={profile?.username}
      />

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("diary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            activeTab === "diary"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Diario ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            activeTab === "reviews"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reseñas ({reviewedLogsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            activeTab === "collections"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Colecciones ({collections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            activeTab === "stats"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Estadísticas</span>
        </button>

        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            activeTab === "watchlist"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({watchlist.length})</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === "diary" && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm rounded-3xl bg-[#141420]/60 border border-white/5">
              Este usuario aún no tiene películas en su diario.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {logs.map((log) => (
                <Link
                  key={log.id}
                  href={`/movie/${log.tmdb_id}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#141420] border border-white/5 hover:border-white/20 transition shadow-lg"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={getImageUrl(log.custom_poster_path || log.movie?.poster_path, "w500")}
                      alt={log.movie?.title || "Película"}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-white truncate">{log.movie?.title}</h4>
                    {log.rating !== null && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 mt-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{log.rating}/10</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <ProfileReviews logs={logs} />
      )}

      {activeTab === "collections" && (
        <ProfileCollections
          userId={targetId}
          isMe={isMe}
          userLogs={logs}
          userWatchlist={watchlist}
        />
      )}

      {activeTab === "stats" && (
        <ProfileStats logs={logs} />
      )}

      {activeTab === "watchlist" && (
        <div className="space-y-3">
          {watchlist.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm rounded-3xl bg-[#141420]/60 border border-white/5">
              La watchlist de este usuario está vacía.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {watchlist.map((item) => (
                <Link
                  key={item.tmdb_id}
                  href={`/movie/${item.tmdb_id}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#141420] border border-white/5 hover:border-white/20 transition shadow-lg"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={getImageUrl(item.movie?.poster_path, "w500")}
                      alt={item.title || "Película"}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
