"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Film, 
  Check, 
  CheckCircle2, 
  Trash2, 
  Share2, 
  Sparkles, 
  Dices, 
  Search, 
  X, 
  Clock, 
  Star, 
  UserCheck, 
  Eye, 
  Bookmark,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { 
  SharedWatchlist, 
  SharedWatchlistMember, 
  SharedWatchlistMovie, 
  Profile, 
  WatchlistItem 
} from "@/lib/supabase/types";
import { 
  getMutualFollowers, 
  getSharedWatchlists, 
  saveSharedWatchlist, 
  deleteSharedWatchlist 
} from "@/lib/services/sharedWatchlists";
import { getImageUrl, searchMovies } from "@/lib/tmdb/client";
import { formatRuntime } from "@/lib/utils/formatting";

interface SharedWatchlistsSectionProps {
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar?: string | null;
  personalWatchlist: WatchlistItem[];
  preselectedFriendId?: string | null;
}

export function SharedWatchlistsSection({
  currentUserId,
  currentUsername,
  currentUserAvatar,
  personalWatchlist,
  preselectedFriendId,
}: SharedWatchlistsSectionProps) {
  const { openLogModal, triggerConfetti } = useApp();

  const [watchlists, setWatchlists] = useState<SharedWatchlist[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isDeciderOpen, setIsDeciderOpen] = useState(false);
  const [decidedMovie, setDecidedMovie] = useState<SharedWatchlistMovie | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Create Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [mutualFollowers, setMutualFollowers] = useState<Profile[]>([]);
  const [loadingMutuals, setLoadingMutuals] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  // Add Movie Form State
  const [addSourceTab, setAddSourceTab] = useState<"personal" | "search">("personal");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<SharedWatchlistMovie[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  // Filter within active watchlist
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "watched">("all");

  // Load user's shared watchlists
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSharedWatchlists(currentUserId);
        setWatchlists(data);
        if (data.length > 0 && !activeListId) {
          setActiveListId(data[0].id);
        }
      } catch (err) {
        console.warn("Error loading shared watchlists:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUserId]);

  // If preselectedFriendId is passed, open create modal automatically
  useEffect(() => {
    if (preselectedFriendId) {
      handleOpenCreateModal(preselectedFriendId);
    }
  }, [preselectedFriendId]);

  // Open Create Modal and fetch mutual followers
  const handleOpenCreateModal = async (initialFriendId?: string) => {
    setIsCreateOpen(true);
    setNewTitle("");
    setNewDescription("");
    setSelectedFriendIds(initialFriendId ? [initialFriendId] : []);
    setLoadingMutuals(true);

    try {
      const mutuals = await getMutualFollowers(currentUserId);
      setMutualFollowers(mutuals);
      if (initialFriendId && !selectedFriendIds.includes(initialFriendId)) {
        setSelectedFriendIds([initialFriendId]);
      }
    } catch (e) {
      console.warn("Error fetching mutuals:", e);
    } finally {
      setLoadingMutuals(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Submit Create Shared Watchlist
  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || selectedFriendIds.length === 0) return;

    const selectedFriends = mutualFollowers.filter((f) =>
      selectedFriendIds.includes(f.id)
    );

    const members: SharedWatchlistMember[] = [
      {
        id: currentUserId,
        username: currentUsername || "Tú",
        avatar_url: currentUserAvatar || null,
      },
      ...selectedFriends.map((f) => ({
        id: f.id,
        username: f.username,
        avatar_url: f.avatar_url,
      })),
    ];

    const newListId = `swl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newWatchlist: SharedWatchlist = {
      id: newListId,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      members,
      movies: [],
    };

    await saveSharedWatchlist(newWatchlist);
    setWatchlists((prev) => [newWatchlist, ...prev]);
    setActiveListId(newListId);
    setIsCreateOpen(false);
    triggerConfetti();
  };

  // Active Shared Watchlist
  const activeList = useMemo(() => {
    return watchlists.find((w) => w.id === activeListId) || null;
  }, [watchlists, activeListId]);

  // Filtered movies in active watchlist
  const filteredMovies = useMemo(() => {
    if (!activeList) return [];
    if (filterStatus === "pending") return activeList.movies.filter((m) => !m.watched);
    if (filterStatus === "watched") return activeList.movies.filter((m) => m.watched);
    return activeList.movies;
  }, [activeList, filterStatus]);

  // Toggle Watched state of a movie
  const handleToggleWatched = async (tmdbId: number) => {
    if (!activeList) return;

    let justWatched = false;
    const updatedMovies = activeList.movies.map((m) => {
      if (m.tmdb_id === tmdbId) {
        const nextState = !m.watched;
        if (nextState) justWatched = true;
        return { ...m, watched: nextState };
      }
      return m;
    });

    const updatedList: SharedWatchlist = {
      ...activeList,
      movies: updatedMovies,
    };

    setWatchlists((prev) =>
      prev.map((w) => (w.id === activeList.id ? updatedList : w))
    );

    await saveSharedWatchlist(updatedList);
    if (justWatched) {
      triggerConfetti();
    }
  };

  // Remove movie from active watchlist
  const handleRemoveMovie = async (tmdbId: number) => {
    if (!activeList) return;
    const updatedMovies = activeList.movies.filter((m) => m.tmdb_id !== tmdbId);
    const updatedList: SharedWatchlist = {
      ...activeList,
      movies: updatedMovies,
    };
    setWatchlists((prev) =>
      prev.map((w) => (w.id === activeList.id ? updatedList : w))
    );
    await saveSharedWatchlist(updatedList);
  };

  // Add movie to active watchlist
  const handleAddMovieToList = async (movieData: {
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    release_date?: string | null;
    runtime?: number | null;
    vote_average?: number | null;
  }) => {
    if (!activeList) return;
    if (activeList.movies.some((m) => m.tmdb_id === movieData.tmdb_id)) return;

    const newMovie: SharedWatchlistMovie = {
      ...movieData,
      added_by_id: currentUserId,
      added_by_name: currentUsername || "Tú",
      added_at: new Date().toISOString(),
      watched: false,
    };

    const updatedList: SharedWatchlist = {
      ...activeList,
      movies: [newMovie, ...activeList.movies],
    };

    setWatchlists((prev) =>
      prev.map((w) => (w.id === activeList.id ? updatedList : w))
    );

    await saveSharedWatchlist(updatedList);
  };

  // Search TMDB live
  const handleTmdbSearch = async () => {
    if (!tmdbQuery.trim()) return;
    setIsSearchingTmdb(true);
    try {
      const res = await searchMovies(tmdbQuery.trim(), 1);
      const mapped: SharedWatchlistMovie[] = (res.results || []).slice(0, 10).map((m) => ({
        tmdb_id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
        vote_average: m.vote_average,
        added_by_id: currentUserId,
        added_by_name: currentUsername,
        added_at: new Date().toISOString(),
        watched: false,
      }));
      setTmdbResults(mapped);
    } catch (e) {
      console.warn("TMDB search error:", e);
    } finally {
      setIsSearchingTmdb(false);
    }
  };

  // Delete shared watchlist
  const handleDeleteWatchlist = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar esta watchlist compartida? Se borrará para todos los participantes.")) return;
    await deleteSharedWatchlist(id, currentUserId);
    setWatchlists((prev) => {
      const next = prev.filter((w) => w.id !== id);
      if (activeListId === id) {
        setActiveListId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  // "🎲 ¿Qué vemos hoy?" Random Movie Picker
  const handleRandomDecide = () => {
    if (!activeList) return;
    const pending = activeList.movies.filter((m) => !m.watched);
    if (pending.length === 0) {
      alert("No hay películas pendientes en esta lista. ¡Agreguen algunas o desmarquen una!");
      return;
    }

    setIsDeciderOpen(true);
    setIsDeciding(true);
    setDecidedMovie(null);

    // Suspense roulette delay
    setTimeout(() => {
      const randomChoice = pending[Math.floor(Math.random() * pending.length)];
      setDecidedMovie(randomChoice);
      setIsDeciding(false);
      triggerConfetti();
    }, 1200);
  };

  // Share link
  const handleShare = () => {
    if (typeof window !== "undefined" && activeList) {
      const url = `${window.location.origin}/watchlist?tab=shared&listId=${activeList.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-zinc-400 flex items-center justify-center gap-2">
        <Users className="w-5 h-5 animate-pulse text-red-500" />
        <span className="text-sm">Cargando watchlists compartidas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Watchlists selector */}
      <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Watchlists Compartidas</h2>
              <p className="text-xs text-zinc-400">
                Listas colaborativas con amigos y personas que se siguen mutuamente.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Watchlist Compartida</span>
        </button>
      </div>

      {/* Watchlists Pill List (if user has watchlists) */}
      {watchlists.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {watchlists.map((w) => {
            const isActive = w.id === activeListId;
            const pendingCount = w.movies.filter((m) => !m.watched).length;
            return (
              <button
                key={w.id}
                onClick={() => setActiveListId(w.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition border shrink-0 text-left ${
                  isActive
                    ? "bg-red-600/15 border-red-500/40 text-white shadow-lg shadow-red-600/10"
                    : "bg-[#141420] border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                }`}
              >
                {/* Stacked Avatars */}
                <div className="flex -space-x-2 shrink-0">
                  {w.members.slice(0, 3).map((m, idx) => (
                    <img
                      key={idx}
                      src={m.avatar_url || `https://ui-avatars.com/api/?name=${m.username}&background=random`}
                      alt={m.username}
                      className="w-6 h-6 rounded-full border border-black object-cover"
                      title={m.username}
                    />
                  ))}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white truncate max-w-[140px]">{w.title}</h4>
                  <span className="text-[10px] text-zinc-400">
                    {pendingCount} pendientes • {w.movies.length} total
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      {watchlists.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center rounded-3xl bg-[#141420]/60 border border-white/5 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-500">
            <Users className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Sin watchlists compartidas todavía</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Crea una lista compartida con amigos cinéfilos o tu pareja con quienes se sigan mutuamente para planear qué películas ver juntos.
          </p>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xl shadow-red-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear mi primera watchlist compartida</span>
          </button>
        </div>
      ) : activeList ? (
        /* Active Watchlist View */
        <div className="space-y-6">
          {/* Active Watchlist Header Card */}
          <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl font-black text-white">{activeList.title}</h3>
                  <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                    {activeList.movies.length} películas
                  </span>
                </div>
                {activeList.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                    {activeList.description}
                  </p>
                )}

                {/* Mutual Participants Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400 font-medium">Participantes:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeList.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 text-xs text-zinc-200"
                      >
                        <img
                          src={m.avatar_url || `https://ui-avatars.com/api/?name=${m.username}&background=random`}
                          alt={m.username}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="font-semibold">{m.id === currentUserId ? "Tú" : `@${m.username}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRandomDecide}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition shadow"
                  title="Elegir una película pendiente al azar para ver hoy"
                >
                  <Dices className="w-4 h-4 text-amber-400" />
                  <span>¿Qué vemos hoy?</span>
                </button>

                <button
                  onClick={() => setIsAddMovieOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-red-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Película</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition"
                  title="Copiar enlace"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDeleteWatchlist(activeList.id)}
                  className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                  title="Eliminar watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs (All / Pending / Watched) */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === "all"
                    ? "bg-white/15 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Todas ({activeList.movies.length})
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  filterStatus === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Pendientes</span>
                <span>({activeList.movies.filter((m) => !m.watched).length})</span>
              </button>
              <button
                onClick={() => setFilterStatus("watched")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  filterStatus === "watched"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Vistas juntos</span>
                <span>({activeList.movies.filter((m) => m.watched).length})</span>
              </button>
            </div>
          </div>

          {/* Movies Grid */}
          {filteredMovies.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm rounded-3xl bg-[#141420]/60 border border-white/5">
              {filterStatus === "watched"
                ? "Aún no han marcado ninguna película como vista juntos."
                : filterStatus === "pending"
                ? "¡Han visto todas las películas de esta lista! Agreguen más con el botón '+ Añadir Película'."
                : "Esta lista compartida aún no tiene películas agregadas."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMovies.map((movie) => {
                const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
                return (
                  <div
                    key={movie.tmdb_id}
                    className={`p-4 rounded-3xl bg-[#141420] border transition-all duration-200 flex gap-4 relative overflow-hidden group shadow-lg ${
                      movie.watched
                        ? "border-emerald-500/30 bg-emerald-950/[0.08]"
                        : "border-white/5 hover:border-white/15"
                    }`}
                  >
                    {/* Poster */}
                    <Link
                      href={`/movie/${movie.tmdb_id}`}
                      className="w-20 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 relative"
                    >
                      <img
                        src={getImageUrl(movie.poster_path, "w342")}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {movie.watched && (
                        <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[1px] flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        </div>
                      )}
                    </Link>

                    {/* Movie Info & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <Link
                            href={`/movie/${movie.tmdb_id}`}
                            className="font-bold text-sm text-white group-hover:text-red-400 transition line-clamp-1"
                          >
                            {movie.title}
                          </Link>
                          <button
                            onClick={() => handleRemoveMovie(movie.tmdb_id)}
                            className="text-zinc-500 hover:text-rose-400 p-1 transition"
                            title="Quitar de la lista"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          {year && <span>{year}</span>}
                          {movie.runtime && (
                            <>
                              <span>•</span>
                              <span>{formatRuntime(movie.runtime)}</span>
                            </>
                          )}
                          {movie.vote_average ? (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{movie.vote_average.toFixed(1)}</span>
                              </div>
                            </>
                          ) : null}
                        </div>

                        {/* Added by badge */}
                        <div className="text-[11px] text-zinc-400">
                          <span className="text-zinc-500">Agregada por: </span>
                          <span className="text-zinc-300 font-medium">@{movie.added_by_name}</span>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-2">
                        {/* Toggle Watched */}
                        <button
                          onClick={() => handleToggleWatched(movie.tmdb_id)}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                            movie.watched
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5"
                          }`}
                        >
                          {movie.watched ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Vista</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Marcar vista</span>
                            </>
                          )}
                        </button>

                        {/* Log in Diary */}
                        <button
                          onClick={() =>
                            openLogModal({
                              id: movie.tmdb_id,
                              title: movie.title,
                              poster_path: movie.poster_path,
                            })
                          }
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition"
                          title="Registrar en mi diario de películas"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* MODAL: Nueva Watchlist Compartida */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141420] border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-black text-white">Nueva Watchlist Compartida</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWatchlist} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nombre de la Watchlist *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Películas pendientes con @amigo, Noches de cine..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ej. Para ver los fines de semana cuando no sabemos qué poner..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500/50 transition"
                />
              </div>

              {/* Selector de Amigos Mutuos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Invitar Amigos Mutuos *
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {selectedFriendIds.length} seleccionados
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Solo puedes compartir watchlists con usuarios que se sigan mutuamente para garantizar una experiencia privada y cercana.
                  </span>
                </div>

                {loadingMutuals ? (
                  <div className="py-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 animate-pulse text-red-500" />
                    <span>Buscando personas que se siguen mutuamente...</span>
                  </div>
                ) : mutualFollowers.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    Aún no tienes seguidores mutuos. ¡Sigue a otros cinéfilos y cuando ellos te sigan podrán compartir listas!
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {mutualFollowers.map((friend) => {
                      const isSelected = selectedFriendIds.includes(friend.id);
                      return (
                        <div
                          key={friend.id}
                          onClick={() => toggleFriendSelection(friend.id)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                            isSelected
                              ? "bg-red-600/15 border-red-500/40 text-white"
                              : "bg-white/[0.02] border-white/5 hover:border-white/10 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.username}&background=random`}
                              alt={friend.username}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <h4 className="font-bold text-xs">{friend.username}</h4>
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" /> Amigo mutuo
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                              isSelected
                                ? "bg-red-600 border-red-500 text-white"
                                : "border-white/20 bg-white/5"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || selectedFriendIds.length === 0}
                  className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Crear Watchlist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Añadir Película a la Watchlist Activa */}
      {isAddMovieOpen && activeList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141420] border border-white/10 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Añadir a &ldquo;{activeList.title}&rdquo;
                </h3>
              </div>
              <button
                onClick={() => setIsAddMovieOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setAddSourceTab("personal")}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    addSourceTab === "personal"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  De mi Watchlist Personal ({personalWatchlist.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAddSourceTab("search")}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    addSourceTab === "search"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Buscar en TMDB
                </button>
              </div>

              {/* Option 1: Personal Watchlist */}
              {addSourceTab === "personal" && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {personalWatchlist.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 text-xs">
                      Tu watchlist personal está vacía. Puedes buscar cualquier película en TMDB arriba.
                    </div>
                  ) : (
                    personalWatchlist.map((item) => {
                      const isAdded = activeList.movies.some((m) => m.tmdb_id === item.tmdb_id);
                      return (
                        <div
                          key={item.tmdb_id}
                          className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(item.movie?.poster_path, "w92")}
                              alt={item.title || "Película"}
                              className="w-10 h-14 object-cover rounded-xl bg-zinc-900"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                              <span className="text-[11px] text-zinc-400">
                                {item.movie?.release_date ? item.movie.release_date.split("-")[0] : ""}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddMovieToList({
                                tmdb_id: item.tmdb_id,
                                title: item.title || item.movie?.title || "Película",
                                poster_path: item.movie?.poster_path || null,
                                release_date: item.movie?.release_date || null,
                                runtime: item.movie?.runtime || null,
                                vote_average: item.movie?.vote_average || null,
                              })
                            }
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                              isAdded
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                : "bg-red-600 hover:bg-red-500 text-white shadow-sm"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>En la lista</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Añadir</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Option 2: Search TMDB */}
              {addSourceTab === "search" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={tmdbQuery}
                        onChange={(e) => setTmdbQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleTmdbSearch();
                          }
                        }}
                        placeholder="Buscar título en el catálogo global de TMDB..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTmdbSearch}
                      disabled={isSearchingTmdb}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition disabled:opacity-50"
                    >
                      {isSearchingTmdb ? "..." : "Buscar"}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {tmdbResults.map((movie) => {
                      const isAdded = activeList.movies.some((m) => m.tmdb_id === movie.tmdb_id);
                      return (
                        <div
                          key={movie.tmdb_id}
                          className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(movie.poster_path, "w92")}
                              alt={movie.title}
                              className="w-10 h-14 object-cover rounded-xl bg-zinc-900"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{movie.title}</h4>
                              <span className="text-[11px] text-zinc-400">
                                {movie.release_date ? movie.release_date.split("-")[0] : ""}
                                {movie.vote_average ? ` • ★ ${movie.vote_average.toFixed(1)}` : ""}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddMovieToList({
                                tmdb_id: movie.tmdb_id,
                                title: movie.title,
                                poster_path: movie.poster_path,
                                release_date: movie.release_date,
                                vote_average: movie.vote_average,
                              })
                            }
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                              isAdded
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                : "bg-red-600 hover:bg-red-500 text-white shadow-sm"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>En la lista</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Añadir</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: "🎲 ¿Qué vemos hoy?" Random Movie Decider */}
      {isDeciderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141420] border border-amber-500/30 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-center space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Dices className="w-5 h-5 text-amber-400 animate-spin" />
                <h3 className="text-base font-black text-white">¿Qué vemos hoy juntos?</h3>
              </div>
              <button
                onClick={() => setIsDeciderOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isDeciding ? (
              <div className="py-12 space-y-3">
                <Dices className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-zinc-300">
                  Girando la ruleta entre sus películas pendientes...
                </p>
              </div>
            ) : decidedMovie ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-32 aspect-[2/3] mx-auto rounded-2xl overflow-hidden bg-zinc-900 border-2 border-amber-400/40 shadow-2xl">
                  <img
                    src={getImageUrl(decidedMovie.poster_path, "w342")}
                    alt={decidedMovie.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>¡La película elegida es!</span>
                  </div>
                  <h4 className="text-xl font-black text-white">{decidedMovie.title}</h4>
                  <p className="text-xs text-zinc-400">
                    Sugerida originalmente por @{decidedMovie.added_by_name}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRandomDecide}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 font-bold text-xs transition"
                  >
                    Girar de nuevo
                  </button>

                  <Link
                    href={`/movie/${decidedMovie.tmdb_id}`}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg transition"
                  >
                    Ver Ficha
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedWatchlistsSection;
