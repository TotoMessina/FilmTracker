"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Crown, 
  Search, 
  Sparkles, 
  Star, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Layers, 
  Check, 
  X, 
  Filter, 
  ChevronRight, 
  SlidersHorizontal,
  Bookmark,
  Trophy,
  Film,
  LayoutGrid,
  List,
  Eye,
  Award,
  Tv,
  Clapperboard,
  Timer,
  Play
} from "lucide-react";
import { MASTERPIECES_163, MasterpieceMovie } from "@/lib/data/masterpieces162";
import { MOVIE_GENRES, getImageUrl, getBackdropUrl } from "@/lib/tmdb/client";
import { 
  POPULAR_STREAMING_PLATFORMS, 
  loadUserStreamingPlatforms 
} from "@/lib/services/streamingPlatforms";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { fetchAllUserLogs, fetchAllUserWatchlist } from "@/lib/services/logs";

function formatRuntime(mins?: number): string | null {
  if (!mins || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Grandes163Page() {
  const { user } = useAuth();
  const { openLogModal, lastUpdated, triggerConfetti } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<string>("all");
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "watched" | "pending">("all");
  const [selectedProvider, setSelectedProvider] = useState<number | "my_platforms" | "all">("all");
  const [selectedDuration, setSelectedDuration] = useState<"all" | "short" | "standard" | "epic">("all");
  const [selectedDirector, setSelectedDirector] = useState<string>("all");
  const [selectedMinRating, setSelectedMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"rank" | "year_asc" | "year_desc" | "rating" | "runtime_asc" | "runtime_desc" | "title">("rank");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // User Logs Data & Streaming Platforms
  const [userWatchedIds, setUserWatchedIds] = useState<Set<number>>(new Set());
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
  const [userPlatforms, setUserPlatforms] = useState<number[]>([]);
  const [loadingUserLogs, setLoadingUserLogs] = useState(true);

  // Load user logs, watchlist & user streaming preferences
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      // Load user streaming platforms
      loadUserStreamingPlatforms(user?.id).then((plats) => {
        if (!isCancelled && plats) setUserPlatforms(plats);
      });

      if (!user) {
        setUserWatchedIds(new Set());
        setUserRatings(new Map());
        setWatchlistIds(new Set());
        setLoadingUserLogs(false);
        return;
      }

      setLoadingUserLogs(true);
      try {
        const [logsData, watchlistData] = await Promise.all([
          fetchAllUserLogs(user.id, { select: "tmdb_id, rating" }),
          fetchAllUserWatchlist(user.id, { select: "tmdb_id" }),
        ]);

        if (!isCancelled) {
          if (logsData) {
            const watched = new Set<number>();
            const ratings = new Map<number, number>();
            logsData.forEach((l) => {
              if (l.tmdb_id) {
                watched.add(l.tmdb_id);
                if (l.rating) ratings.set(l.tmdb_id, l.rating);
              }
            });
            setUserWatchedIds(watched);
            setUserRatings(ratings);
          }

          if (watchlistData) {
            const wl = new Set<number>();
            watchlistData.forEach((w) => {
              if (w.tmdb_id) wl.add(w.tmdb_id);
            });
            setWatchlistIds(wl);
          }
        }
      } catch (err) {
        console.warn("Error cargando logs para las 163:", err);
      } finally {
        if (!isCancelled) setLoadingUserLogs(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user, lastUpdated]);

  // Handle Watchlist toggle
  const handleToggleWatchlist = async (movie: MasterpieceMovie) => {
    if (!user) return;
    const isSaved = watchlistIds.has(movie.tmdbId);

    if (isSaved) {
      await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", movie.tmdbId);
      setWatchlistIds((prev) => {
        const next = new Set(prev);
        next.delete(movie.tmdbId);
        return next;
      });
    } else {
      await supabase.from("watchlist").insert({
        user_id: user.id,
        tmdb_id: movie.tmdbId,
        movie_title: movie.title,
        poster_path: movie.poster_path,
        release_date: `${movie.year}-01-01`,
        vote_average: movie.vote_average,
      });
      setWatchlistIds((prev) => new Set(prev).add(movie.tmdbId));
    }
  };

  // Compute User Progress
  const totalMasterpieces = MASTERPIECES_163.length;
  const watchedCount = useMemo(() => {
    return MASTERPIECES_163.filter((m) => userWatchedIds.has(m.tmdbId)).length;
  }, [userWatchedIds]);

  const progressPercent = Math.round((watchedCount / totalMasterpieces) * 100);
  const pendingCount = totalMasterpieces - watchedCount;

  // Platform movie counts
  const platformCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    POPULAR_STREAMING_PLATFORMS.forEach((p) => {
      counts[p.id] = MASTERPIECES_163.filter((m) => m.providers?.includes(p.id)).length;
    });
    return counts;
  }, []);

  const myPlatformsCount = useMemo(() => {
    if (userPlatforms.length === 0) return 0;
    return MASTERPIECES_163.filter((m) => m.providers?.some((p) => userPlatforms.includes(p))).length;
  }, [userPlatforms]);

  // Top directors with 2+ masterpieces
  const topDirectors = useMemo(() => {
    const countMap = new Map<string, number>();
    MASTERPIECES_163.forEach((m) => {
      if (m.director) countMap.set(m.director, (countMap.get(m.director) || 0) + 1);
    });
    return Array.from(countMap.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([director, count]) => ({ director, count }));
  }, []);

  // Filter & Sort Movies
  const filteredMovies = useMemo(() => {
    let result = [...MASTERPIECES_163];

    // Search query (title, original title, year, rank, and director!)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesOriginal = m.originalTitle.toLowerCase().includes(q);
        const matchesYear = String(m.year).includes(q);
        const matchesRank = `#${m.rank}`.includes(q) || String(m.rank) === q;
        const matchesDirector = m.director ? m.director.toLowerCase().includes(q) : false;
        return matchesTitle || matchesOriginal || matchesYear || matchesRank || matchesDirector;
      });
    }

    // Streaming Platform filter
    if (selectedProvider === "my_platforms") {
      if (userPlatforms.length > 0) {
        result = result.filter((m) => m.providers?.some((p) => userPlatforms.includes(p)));
      }
    } else if (selectedProvider !== "all") {
      result = result.filter((m) => m.providers?.includes(selectedProvider));
    }

    // Duration filter
    if (selectedDuration === "short") {
      result = result.filter((m) => m.runtime && m.runtime > 0 && m.runtime < 100);
    } else if (selectedDuration === "standard") {
      result = result.filter((m) => m.runtime && m.runtime >= 100 && m.runtime <= 140);
    } else if (selectedDuration === "epic") {
      result = result.filter((m) => m.runtime && m.runtime > 140);
    }

    // Director filter
    if (selectedDirector !== "all") {
      result = result.filter((m) => m.director === selectedDirector);
    }

    // Minimum rating filter
    if (selectedMinRating > 0) {
      result = result.filter((m) => m.vote_average >= selectedMinRating);
    }

    // Decade filter
    if (selectedDecade !== "all") {
      result = result.filter((m) => m.decade === selectedDecade);
    }

    // Genre filter
    if (selectedGenreId !== null) {
      result = result.filter((m) => m.genre_ids.includes(selectedGenreId));
    }

    // Status filter
    if (statusFilter === "watched") {
      result = result.filter((m) => userWatchedIds.has(m.tmdbId));
    } else if (statusFilter === "pending") {
      result = result.filter((m) => !userWatchedIds.has(m.tmdbId));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "rank":
          return a.rank - b.rank;
        case "year_asc":
          return a.year - b.year;
        case "year_desc":
          return b.year - a.year;
        case "rating":
          return b.vote_average - a.vote_average;
        case "runtime_asc":
          return (a.runtime || 0) - (b.runtime || 0);
        case "runtime_desc":
          return (b.runtime || 0) - (a.runtime || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return a.rank - b.rank;
      }
    });

    return result;
  }, [
    searchQuery,
    selectedProvider,
    userPlatforms,
    selectedDuration,
    selectedDirector,
    selectedMinRating,
    selectedDecade,
    selectedGenreId,
    statusFilter,
    sortBy,
    userWatchedIds,
  ]);

  // Available decades
  const decades = useMemo(() => {
    const list = Array.from(new Set(MASTERPIECES_163.map((m) => m.decade)));
    list.sort();
    return list;
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedProvider !== "all" ||
    selectedDuration !== "all" ||
    selectedDirector !== "all" ||
    selectedMinRating > 0 ||
    selectedDecade !== "all" ||
    selectedGenreId !== null ||
    statusFilter !== "all"
  );

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedProvider("all");
    setSelectedDuration("all");
    setSelectedDirector("all");
    setSelectedMinRating(0);
    setSelectedDecade("all");
    setSelectedGenreId(null);
    setStatusFilter("all");
    setSortBy("rank");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1329] via-[#12111d] to-[#0d0c15] p-6 sm:p-10 shadow-2xl">
        {/* Ambient lighting glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/35 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Catálogo Cinematográfico Unificado</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Las Grandes 163</span>
              <span className="text-amber-400">✨</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              La selección integradora definitiva de las 163 obras maestras del cine universal que no te podés perder.
              Fusión consolidada del canon cinematográfico unificado: desde clásicos fundacionales hasta las joyas contemporáneas.
            </p>
          </div>

          {/* User Progress Stats Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shrink-0 sm:min-w-[340px] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Tu Progreso en el Canon
              </span>
              <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                {progressPercent}%
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-white">
                  {watchedCount} <span className="text-sm font-semibold text-zinc-500">/ {totalMasterpieces}</span>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  obras maestras completadas
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-red-400">
                  {pendingCount}
                </div>
                <div className="text-xs text-zinc-500">pendientes por ver</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full transition-all duration-700 shadow-md shadow-amber-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar: Search & Filters */}
      <section className="space-y-4">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, director, año o # (ej. Nolan, Spielberg, 1994, #59, Pulp Fiction, Kubrick...)"
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-12 pr-11 py-3.5 sm:py-4 rounded-2xl bg-[#141424] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner text-base font-medium caret-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Streaming Platforms Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#13121f] border border-white/10 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Plataformas de Streaming</span>
              <span className="text-[11px] font-normal text-zinc-500 hidden sm:inline">• Dónde ver en suscripción</span>
            </span>
            {selectedProvider !== "all" && (
              <button
                onClick={() => setSelectedProvider("all")}
                className="text-amber-400 hover:text-amber-300 transition text-[11px] cursor-pointer"
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedProvider("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedProvider === "all"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Todas ({totalMasterpieces})</span>
            </button>

            {userPlatforms.length > 0 && (
              <button
                onClick={() => setSelectedProvider("my_platforms")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedProvider === "my_platforms"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 border border-purple-500/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>En Mis Plataformas ({myPlatformsCount})</span>
              </button>
            )}

            {POPULAR_STREAMING_PLATFORMS.map((platform) => {
              const isSelected = selectedProvider === platform.id;
              const count = platformCounts[platform.id] || 0;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedProvider(isSelected ? "all" : platform.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30 font-black"
                      : "bg-[#181729] hover:bg-[#222038] text-zinc-300 border-white/10"
                  }`}
                >
                  <img
                    src={getImageUrl(platform.logo, "w92")}
                    alt={platform.name}
                    className="w-4 h-4 rounded object-contain shrink-0"
                  />
                  <span>{platform.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                      isSelected ? "bg-black/20 text-black" : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Row: Status, Decades, Genres, Duration, Directors, Rating & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5 text-xs overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Todas ({totalMasterpieces})
            </button>
            <button
              onClick={() => setStatusFilter("watched")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                statusFilter === "watched"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vistas ({watchedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({pendingCount})</span>
            </button>
          </div>

          {/* Select Dropdowns & View Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Decade Select */}
            <select
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas las Épocas</option>
              {decades.map((dec) => (
                <option key={dec} value={dec}>
                  {dec}
                </option>
              ))}
            </select>

            {/* Genre Select */}
            <select
              value={selectedGenreId ?? ""}
              onChange={(e) => setSelectedGenreId(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="">Todos los Géneros</option>
              {MOVIE_GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Duration Select */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">Cualquier Duración</option>
              <option value="short">Rápidas (&lt; 100 min)</option>
              <option value="standard">Estándar (100 - 140 min)</option>
              <option value="epic">Épicas (&gt; 140 min)</option>
            </select>

            {/* Director Select */}
            <select
              value={selectedDirector}
              onChange={(e) => setSelectedDirector(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Directores</option>
              {topDirectors.map(({ director, count }) => (
                <option key={director} value={director}>
                  {director} ({count})
                </option>
              ))}
            </select>

            {/* Rating Select */}
            <select
              value={selectedMinRating}
              onChange={(e) => setSelectedMinRating(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="0">Cualquier Nota</option>
              <option value="8.0">+8.0★ Impecables</option>
              <option value="8.5">+8.5★ Obras Cumbres</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="rank">Orden en el Canon (#1 - #163)</option>
              <option value="year_asc">Año: Clásicos a Modernos</option>
              <option value="year_desc">Año: Modernos a Clásicos</option>
              <option value="rating">Mejor Calificadas (TMDB)</option>
              <option value="runtime_asc">Duración: Cortas primero</option>
              <option value="runtime_desc">Duración: Épicas primero</option>
              <option value="title">Título Alfabético (A - Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-white"
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "list" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-white"
                }`}
                title="Vista Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Count & Active Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <div>
            Mostrando <span className="font-bold text-white">{filteredMovies.length}</span> de {totalMasterpieces} títulos
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
            {selectedProvider !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                Plataforma: {
                  selectedProvider === "my_platforms"
                    ? "Mis Plataformas"
                    : POPULAR_STREAMING_PLATFORMS.find(p => p.id === selectedProvider)?.name
                }
                <button onClick={() => setSelectedProvider("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDuration !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                Duración: {selectedDuration === "short" ? "< 100m" : selectedDuration === "standard" ? "100-140m" : "> 140m"}
                <button onClick={() => setSelectedDuration("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDirector !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold">
                Director: {selectedDirector}
                <button onClick={() => setSelectedDirector("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedMinRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-semibold">
                Nota: +{selectedMinRating}★
                <button onClick={() => setSelectedMinRating(0)} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDecade !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-zinc-300 font-semibold">
                Época: {selectedDecade}
                <button onClick={() => setSelectedDecade("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedGenreId !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-zinc-300 font-semibold">
                Género: {MOVIE_GENRES.find(g => g.id === selectedGenreId)?.name}
                <button onClick={() => setSelectedGenreId(null)} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                Estado: {statusFilter === "watched" ? "Vistas" : "Pendientes"}
                <button onClick={() => setStatusFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Movies Content Display */}
      {filteredMovies.length > 0 ? (
        viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredMovies.map((movie) => {
              const isWatched = userWatchedIds.has(movie.tmdbId);
              const userRating = userRatings.get(movie.tmdbId);
              const isWatchlisted = watchlistIds.has(movie.tmdbId);
              const runtimeStr = formatRuntime(movie.runtime);
              const streamLogos = POPULAR_STREAMING_PLATFORMS.filter(p => movie.providers?.includes(p.id));

              return (
                <div
                  key={`${movie.rank}-${movie.tmdbId}`}
                  className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#13111f] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isWatched
                      ? "border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20"
                      : "border-white/10 hover:border-amber-500/40 hover:shadow-amber-950/20"
                  }`}
                >
                  {/* Poster Container */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-lg text-xs font-black bg-black/85 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow-lg">
                      #{movie.rank}
                    </div>

                    {/* Runtime pill */}
                    {runtimeStr && (
                      <div className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/80 backdrop-blur-md text-zinc-300 border border-white/10 flex items-center gap-1 shadow">
                        <Clock className="w-2.5 h-2.5 text-zinc-400" />
                        <span>{runtimeStr}</span>
                      </div>
                    )}

                    {/* Watched / Pending Indicator Badge */}
                    {isWatched ? (
                      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-lg text-[11px] font-black bg-emerald-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Vista</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleWatchlist(movie)}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg backdrop-blur-md transition cursor-pointer ${
                          isWatchlisted
                            ? "bg-amber-500 text-black shadow-md"
                            : "bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80"
                        }`}
                        title={isWatchlisted ? "En Watchlist" : "Guardar en Watchlist"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Hover Quick Action Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 space-y-1.5 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          openLogModal({
                            id: movie.tmdbId,
                            title: movie.title,
                            poster_path: movie.poster_path,
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isWatched ? "Editar Nota" : "Registrar"}</span>
                      </button>

                      <Link
                        href={`/movie/${movie.tmdbId}`}
                        className="w-full py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ficha</span>
                      </Link>
                    </div>
                  </div>

                  {/* Card Meta Info */}
                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/movie/${movie.tmdbId}`}>
                        <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {movie.title}
                        </h3>
                      </Link>
                      {movie.director && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 italic mt-0.5">
                          {movie.director}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{movie.vote_average}</span>
                        </span>
                      </div>
                    </div>

                    {/* Streaming Logos in Card */}
                    {streamLogos.length > 0 && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-medium">Streaming:</span>
                        <div className="flex items-center gap-1">
                          {streamLogos.slice(0, 3).map((pl) => (
                            <img
                              key={pl.id}
                              src={getImageUrl(pl.logo, "w92")}
                              alt={pl.name}
                              title={`Disponible en ${pl.name}`}
                              className="w-4 h-4 rounded object-contain bg-black/60 border border-white/10"
                            />
                          ))}
                          {streamLogos.length > 3 && (
                            <span className="text-[9px] text-zinc-400 font-bold px-1 rounded bg-white/5">
                              +{streamLogos.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User Rating pill */}
                    {isWatched && userRating && (
                      <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-semibold">Tu nota:</span>
                        <span className="font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {userRating}★
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2.5">
            {filteredMovies.map((movie) => {
              const isWatched = userWatchedIds.has(movie.tmdbId);
              const userRating = userRatings.get(movie.tmdbId);
              const isWatchlisted = watchlistIds.has(movie.tmdbId);
              const runtimeStr = formatRuntime(movie.runtime);
              const streamLogos = POPULAR_STREAMING_PLATFORMS.filter(p => movie.providers?.includes(p.id));

              return (
                <div
                  key={`${movie.rank}-${movie.tmdbId}`}
                  className={`group p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:gap-4 ${
                    isWatched
                      ? "bg-[#131b1e]/70 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-[#141424]/60 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank */}
                    <div className="w-8 sm:w-10 text-center font-black text-sm sm:text-base text-amber-400 shrink-0">
                      #{movie.rank}
                    </div>

                    {/* Poster */}
                    <Link
                      href={`/movie/${movie.tmdbId}`}
                      className="w-12 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative shadow"
                    >
                      <img
                        src={getImageUrl(movie.poster_path, "w200")}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/movie/${movie.tmdbId}`}
                          className="font-black text-sm sm:text-base text-white hover:text-amber-400 transition truncate"
                        >
                          {movie.title}
                        </Link>
                        {movie.director && (
                          <span className="text-xs text-zinc-400 font-medium">
                            • dir. {movie.director}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-1 mt-1 max-w-xl">
                        {movie.overview}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{movie.year}</span>
                        </span>

                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{movie.vote_average}</span>
                        </span>

                        {runtimeStr && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{runtimeStr}</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-zinc-400">
                          {movie.decade}
                        </span>

                        {streamLogos.length > 0 && (
                          <div className="flex items-center gap-1 ml-1">
                            {streamLogos.slice(0, 4).map(pl => (
                              <img
                                key={pl.id}
                                src={getImageUrl(pl.logo, "w92")}
                                alt={pl.name}
                                title={`Disponible en ${pl.name}`}
                                className="w-4 h-4 rounded object-contain bg-black/60 border border-white/10"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isWatched ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Vista</span>
                          {userRating && (
                            <span className="text-amber-300 ml-1 font-black">
                              ★ {userRating}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/movie/${movie.tmdbId}`}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                          title="Ver Ficha"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleWatchlist(movie)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            isWatchlisted
                              ? "bg-amber-500 text-black border-amber-400"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={isWatchlisted ? "En tu Watchlist" : "Guardar en Watchlist"}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            openLogModal({
                              id: movie.tmdbId,
                              title: movie.title,
                              poster_path: movie.poster_path,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Registrar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              No se encontraron obras maestras con estos filtros
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Intenta cambiar la plataforma, duración, director o término de búsqueda.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
}
