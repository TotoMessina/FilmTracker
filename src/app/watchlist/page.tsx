"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  Dices, 
  Clock, 
  Trash2, 
  Plus, 
  Swords, 
  Sparkles,
  Film,
  X,
  Brain,
  Loader2,
  Users
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { WatchlistItem, Movie, Log } from "@/lib/supabase/types";
import { AIWatchlistPriority } from "@/lib/groq/types";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatRuntime } from "@/lib/utils/formatting";
import MoodPicker from "@/components/movies/MoodPicker";
import SharedWatchlistsSection from "@/components/watchlist/SharedWatchlistsSection";

type RuntimeFilter = "all" | "90" | "120" | "180" | "240";

export default function WatchlistPage() {
  const { user, isGuest } = useAuth();
  const { openLogModal, triggerConfetti } = useApp();

  const [watchlistTab, setWatchlistTab] = useState<"personal" | "shared">("personal");
  const [preselectedFriendId, setPreselectedFriendId] = useState<string | null>(null);

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [runtimeFilter, setRuntimeFilter] = useState<RuntimeFilter>("all");

  // Read URL query params on mount for initial tab or preselected friend
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "shared" || params.get("friendId") || params.get("listId")) {
        setWatchlistTab("shared");
      }
      if (params.get("friendId")) {
        setPreselectedFriendId(params.get("friendId"));
      }
    }
  }, []);

  // AI Priority View State
  const [priorityRanking, setPriorityRanking] = useState<AIWatchlistPriority | null>(null);
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [showPriorityView, setShowPriorityView] = useState(false);

  // Random Picked Movie Modal
  const [pickedMovie, setPickedMovie] = useState<WatchlistItem | null>(null);

  useEffect(() => {
    async function fetchWatchlist() {
      setLoading(true);
      try {
        if (user) {
          const [wlRes, logsRes] = await Promise.all([
            supabase
              .from("watchlist")
              .select("*, movie:movies(*)")
              .eq("user_id", user.id)
              .order("added_at", { ascending: false }),
            supabase
              .from("logs")
              .select("*, movie:movies(*)")
              .eq("user_id", user.id)
              .order("watched_at", { ascending: false })
              .limit(5),
          ]);

          if (!wlRes.error && wlRes.data) {
            setItems(wlRes.data as WatchlistItem[]);
          }
          if (!logsRes.error && logsRes.data) {
            setRecentLogs(logsRes.data as Log[]);
          }
        } else if (isGuest) {
          const guestWL = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
          const formatted = guestWL.map((item: any) => ({
            user_id: "guest-user-123",
            tmdb_id: item.tmdb_id || item.id,
            title: item.title,
            added_at: item.added_at || new Date().toISOString(),
            movie: item,
          }));
          setItems(formatted);

          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setRecentLogs(guestLogs.slice(0, 5));
        }
      } catch (err) {
        console.warn("Watchlist fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, [user, isGuest]);

  const handleRemove = async (tmdbId: number) => {
    if (user) {
      await supabase.from("watchlist").delete().eq("user_id", user.id).eq("tmdb_id", tmdbId);
    } else {
      const guestWL = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
      const updated = guestWL.filter((i: any) => (i.tmdb_id || i.id) !== tmdbId);
      localStorage.setItem("filmtracker_guest_watchlist", JSON.stringify(updated));
    }
    setItems((prev) => prev.filter((i) => i.tmdb_id !== tmdbId));
  };

  // Filter by runtime
  const filteredItems = items.filter((item) => {
    const runtime = item.movie?.runtime;
    if (runtimeFilter === "all") return true;
    if (!runtime) return false;
    const maxMinutes = parseInt(runtimeFilter, 10);
    return runtime <= maxMinutes;
  });

  const handlePickRandom = () => {
    if (filteredItems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    const chosen = filteredItems[randomIndex];
    setPickedMovie(chosen);
    triggerConfetti();
  };

  const handleMoviePicked = (tmdbId: number, title: string) => {
    const match = items.find((i) => i.tmdb_id === tmdbId);
    if (match) {
      setPickedMovie(match);
    } else {
      setPickedMovie({
        user_id: user?.id || "guest-user-123",
        tmdb_id: tmdbId,
        title: title,
        added_at: new Date().toISOString(),
        movie: {
          id: tmdbId,
          title: title,
        } as any,
      });
    }
    triggerConfetti();
  };

  const handlePrioritize = async () => {
    if (items.length === 0) return;
    setLoadingPriority(true);
    try {
      let allLogs: any[] = recentLogs;
      if (user) {
        const { data: logsData } = await supabase
          .from("logs")
          .select("*, movie:movies(*)")
          .eq("user_id", user.id);
        if (logsData && logsData.length > 0) {
          allLogs = logsData;
        }
      } else if (isGuest) {
        const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
        if (guestLogs && guestLogs.length > 0) {
          allLogs = guestLogs;
        }
      }

      // Calculate topGenres and avgRating
      const genreCounts: Record<string, number> = {};
      let totalRating = 0;
      let ratingCount = 0;

      allLogs.forEach((log) => {
        const genres = log.movie?.genres || [];
        genres.forEach((g: any) => {
          const gName = typeof g === "string" ? g : g?.name;
          if (gName) {
            genreCounts[gName] = (genreCounts[gName] || 0) + 1;
          }
        });
        if (typeof log.rating === "number" && log.rating > 0) {
          totalRating += log.rating;
          ratingCount++;
        }
      });

      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([genre]) => genre);

      const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Recent genres from recent logs
      const recentGenresSet = new Set<string>();
      recentLogs.forEach((l) => {
        (l.movie?.genres || []).forEach((g: any) => {
          const name = typeof g === "string" ? g : g?.name;
          if (name) recentGenresSet.add(name);
        });
      });

      const userProfile = {
        topGenres,
        avgRating,
        preferredRuntime: runtimeFilter !== "all" ? runtimeFilter : "120",
        recentGenres: Array.from(recentGenresSet),
      };

      const res = await fetch("/api/ai/watchlist-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchlist: items,
          userProfile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo obtener la priorización.");
      }

      const result: AIWatchlistPriority = await res.json();
      setPriorityRanking(result);
      setShowPriorityView(true);
    } catch (err: any) {
      console.error("Error en handlePrioritize:", err);
      alert(err.message || "Error al priorizar la watchlist con IA.");
    } finally {
      setLoadingPriority(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141420] border border-white/5 w-full sm:w-fit">
        <button
          onClick={() => setWatchlistTab("personal")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            watchlistTab === "personal"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Mi Watchlist ({items.length})</span>
        </button>

        <button
          onClick={() => setWatchlistTab("shared")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            watchlistTab === "shared"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Compartidas</span>
        </button>
      </div>

      {watchlistTab === "shared" ? (
        <SharedWatchlistsSection
          currentUserId={user?.id || "guest-user-123"}
          currentUsername={user?.user_metadata?.username || user?.email?.split("@")[0] || "Tú"}
          currentUserAvatar={user?.user_metadata?.avatar_url || null}
          personalWatchlist={items}
          preselectedFriendId={preselectedFriendId}
        />
      ) : (
        <>
          {/* Top Banner and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tu Watchlist ({items.length})
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Películas pendientes que planeas ver próximamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tournament shortcut button */}
          <Link
            href="/tournament"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs sm:text-sm border border-amber-500/30 transition shadow-sm"
          >
            <Swords className="w-4 h-4" />
            <span>Mundial de Watchlist</span>
          </Link>

          {/* Random Picker Button */}
          <button
            onClick={handlePickRandom}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <Dices className="w-4 h-4" />
            <span>¿Qué veo hoy?</span>
          </button>

          {/* AI Mood Picker */}
          <MoodPicker
            items={items}
            recentLogs={recentLogs}
            onMoviePicked={handleMoviePicked}
          />
        </div>
      </div>

      {/* Mood Picker Portal Container */}
      <div id="mood-picker-container" className="w-full" />

      {/* Runtime Filter Tabs and AI Priority Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Tiempo:</span>
          </span>

          {[
            { id: "all", label: "Todas" },
            { id: "90", label: "< 90 min" },
            { id: "120", label: "< 2 horas" },
            { id: "180", label: "< 3 horas" },
            { id: "240", label: "< 4 horas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setRuntimeFilter(tab.id as RuntimeFilter);
                if (showPriorityView) setShowPriorityView(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                runtimeFilter === tab.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Priority Button */}
        <button
          onClick={handlePrioritize}
          disabled={loadingPriority || items.length === 0}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          {loadingPriority ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <Brain className="w-3.5 h-3.5" />
              <span>🧠 Ordenar con IA</span>
            </>
          )}
        </button>
      </div>

      {/* Content Grid or Priority View */}
      {!user && !isGuest ? (
        <div className="text-center py-16 bg-[#141424] rounded-3xl border border-white/10 p-8 max-w-xl mx-auto space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
            <Bookmark className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Tu Watchlist Personal</h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              Inicia sesión o regístrate para guardar las películas que planeas ver, organizarlas por duración y elegir qué ver con la ruleta de la suerte.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/auth"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/10 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-zinc-400 flex items-center justify-center gap-2">
          <Film className="w-5 h-5 animate-spin text-red-500" />
          <span>Cargando tu watchlist...</span>
        </div>
      ) : showPriorityView && priorityRanking ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Banner dismissible en la parte superior con el summary de la IA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#16152e] via-[#1a1738] to-[#121124] border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                      Curaduría Estratégica con IA
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      Top {priorityRanking.ranking.length}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    Tu Orden de Visualización Recomendado
                  </h2>
                </div>
              </div>

              {/* Botón Volver a vista normal */}
              <button
                onClick={() => setShowPriorityView(false)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>✕ Volver a vista normal</span>
              </button>
            </div>

            {/* Summary de la IA */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic bg-white/5 border border-white/5 rounded-2xl p-4">
              &ldquo;{priorityRanking.summary}&rdquo;
            </p>
          </div>

          {/* Las 8 películas priorizadas como lista numerada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {priorityRanking.ranking.map((item) => {
              const matchWatchlistItem = items.find((i) => i.tmdb_id === item.tmdb_id);
              const poster = item.poster_path || matchWatchlistItem?.movie?.poster_path;

              let urgencyBadgeClass = "bg-zinc-500/15 border-zinc-500/30 text-zinc-400";
              if (item.urgency_tag === "VER YA") {
                urgencyBadgeClass = "bg-red-500/15 border-red-500/30 text-red-400 shadow-sm shadow-red-500/10";
              } else if (item.urgency_tag === "ESTA SEMANA") {
                urgencyBadgeClass = "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10";
              }

              return (
                <div
                  key={item.tmdb_id || item.position}
                  className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#141424] border border-white/10 hover:border-indigo-500/40 transition-all duration-200 shadow-lg hover:shadow-indigo-500/5"
                >
                  {/* Número de posición grande (#1-#8) en color degradado */}
                  <span className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent w-9 text-center shrink-0">
                    #{item.position}
                  </span>

                  {/* Poster thumbnail pequeño */}
                  <Link
                    href={`/movie/${item.tmdb_id}`}
                    className="w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                  >
                    <img
                      src={getImageUrl(poster, "w200")}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Título + priority_reason en texto pequeño */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${urgencyBadgeClass}`}>
                        {item.urgency_tag}
                      </span>
                    </div>

                    <Link
                      href={`/movie/${item.tmdb_id}`}
                      className="font-bold text-white text-sm sm:text-base hover:text-indigo-400 transition truncate block"
                    >
                      {item.title}
                    </Link>

                    <p className="text-xs text-zinc-400 leading-snug line-clamp-2 mt-0.5">
                      {item.priority_reason}
                    </p>
                  </div>

                  {/* Botón rápido para elegir/ver */}
                  <button
                    onClick={() => {
                      if (matchWatchlistItem) {
                        setPickedMovie(matchWatchlistItem);
                      } else {
                        handleMoviePicked(item.tmdb_id, item.title);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-zinc-400 hover:text-indigo-300 border border-white/5 transition shrink-0 self-center"
                    title="Ver detalles o registrar"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto space-y-4">
          <Bookmark className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">
            {items.length === 0 ? "No tienes películas en tu Watchlist" : "Ninguna película coincide con este filtro de tiempo"}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Explora el catálogo o las tendencias para guardar las películas que deseas ver más adelante.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Descubrir películas</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const movie = item.movie;
            const poster = movie?.poster_path;
            const runtime = movie?.runtime;

            return (
              <div
                key={item.tmdb_id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#141420] border border-white/5 hover:border-white/20 transition-all duration-300"
              >
                {/* Poster container */}
                <Link
                  href={`/movie/${item.tmdb_id}`}
                  className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 block"
                >
                  <img
                    src={getImageUrl(poster, "w500")}
                    alt={item.title || "Póster"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {runtime && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatRuntime(runtime)}</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLogModal({
                            id: item.tmdb_id,
                            title: item.title || "Película",
                            poster_path: poster,
                          });
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.tmdb_id);
                        }}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 border border-white/10 transition"
                        title="Quitar de watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>

                <div className="p-3">
                  <Link href={`/movie/${item.tmdb_id}`}>
                    <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1 hover:text-red-400 transition">
                      {item.title || "Película"}
                    </h3>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "¿Qué veo hoy?" Result Modal */}
      {pickedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPickedMovie(null)}
        >
          <div
            className="relative w-full max-w-sm bg-[#141424] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPickedMovie(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                La suerte ha hablado
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {pickedMovie.title}
              </h3>
            </div>

            <div className="w-40 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <img
                src={getImageUrl(pickedMovie.movie?.poster_path, "w500")}
                alt={pickedMovie.title || "Póster"}
                className="w-full h-full object-cover"
              />
            </div>

            {pickedMovie.movie?.runtime ? (
              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Duración: {formatRuntime(pickedMovie.movie.runtime)}</span>
              </p>
            ) : null}

            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  const m = pickedMovie;
                  setPickedMovie(null);
                  openLogModal({
                    id: m.tmdb_id,
                    title: m.title || "Película",
                    poster_path: m.movie?.poster_path,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
              >
                ¡Ya la vi! Registrar
              </button>

              <button
                onClick={handlePickRandom}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition"
              >
                Otra
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
