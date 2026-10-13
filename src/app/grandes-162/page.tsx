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
  Award
} from "lucide-react";
import { MASTERPIECES_162, MasterpieceMovie } from "@/lib/data/masterpieces162";
import { MOVIE_GENRES, getImageUrl, getBackdropUrl } from "@/lib/tmdb/client";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";

export default function Grandes162Page() {
  const { user } = useAuth();
  const { openLogModal, lastUpdated, triggerConfetti } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<string>("all");
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "watched" | "pending">("all");
  const [sortBy, setSortBy] = useState<"rank" | "year_asc" | "year_desc" | "rating" | "title">("rank");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // User Logs Data
  const [userWatchedIds, setUserWatchedIds] = useState<Set<number>>(new Set());
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
  const [loadingUserLogs, setLoadingUserLogs] = useState(true);

  // Load user logs & watchlist
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (!user) {
        setUserWatchedIds(new Set());
        setUserRatings(new Map());
        setWatchlistIds(new Set());
        setLoadingUserLogs(false);
        return;
      }

      setLoadingUserLogs(true);
      try {
        const [logsRes, watchlistRes] = await Promise.all([
          supabase.from("logs").select("tmdb_id, rating").eq("user_id", user.id),
          supabase.from("watchlist").select("tmdb_id").eq("user_id", user.id),
        ]);

        if (!isCancelled) {
          if (logsRes.data) {
            const watched = new Set<number>();
            const ratings = new Map<number, number>();
            logsRes.data.forEach((l) => {
              if (l.tmdb_id) {
                watched.add(l.tmdb_id);
                if (l.rating) ratings.set(l.tmdb_id, l.rating);
              }
            });
            setUserWatchedIds(watched);
            setUserRatings(ratings);
          }

          if (watchlistRes.data) {
            const wl = new Set<number>();
            watchlistRes.data.forEach((w) => {
              if (w.tmdb_id) wl.add(w.tmdb_id);
            });
            setWatchlistIds(wl);
          }
        }
      } catch (err) {
        console.warn("Error cargando logs para las 162:", err);
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
  const totalMasterpieces = MASTERPIECES_162.length;
  const watchedCount = useMemo(() => {
    return MASTERPIECES_162.filter((m) => userWatchedIds.has(m.tmdbId)).length;
  }, [userWatchedIds]);

  const progressPercent = Math.round((watchedCount / totalMasterpieces) * 100);
  const pendingCount = totalMasterpieces - watchedCount;

  // Filter & Sort Movies
  const filteredMovies = useMemo(() => {
    let result = [...MASTERPIECES_162];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesOriginal = m.originalTitle.toLowerCase().includes(q);
        const matchesYear = String(m.year).includes(q);
        const matchesRank = `#${m.rank}`.includes(q) || String(m.rank) === q;
        return matchesTitle || matchesOriginal || matchesYear || matchesRank;
      });
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
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return a.rank - b.rank;
      }
    });

    return result;
  }, [searchQuery, selectedDecade, selectedGenreId, statusFilter, sortBy, userWatchedIds]);

  // Available decades
  const decades = useMemo(() => {
    const list = Array.from(new Set(MASTERPIECES_162.map((m) => m.decade)));
    list.sort();
    return list;
  }, []);

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
              <span>Las Grandes 162</span>
              <span className="text-amber-400">✨</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              La selección integradora definitiva de las obras maestras que todo amante del cine tiene que ver sí o sí.
              Fusión consolidada del canon cinematográfico universal: desde clásicos fundacionales hasta las joyas modernas.
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
            placeholder="Buscar por título, año o número (ej. El Padrino, 1994, #59, Pulp Fiction, Kurosawa...)"
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-12 pr-11 py-3.5 sm:py-4 rounded-2xl bg-[#141424] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner text-base font-medium caret-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills Row */}
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
              <span>Vistas por ti ({watchedCount})</span>
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

          {/* Decade, Genre, Sort Dropdowns & View Mode */}
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

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#171626] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="rank">Orden en la Lista (#1 - #162)</option>
              <option value="year_asc">Año: Más antiguas primero</option>
              <option value="year_desc">Año: Más recientes primero</option>
              <option value="rating">Mejor Calificadas (TMDB)</option>
              <option value="title">Título Alfabético (A - Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-white"
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition ${
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

      {/* Results Count & Reset Filter */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <div>
          Mostrando <span className="font-bold text-white">{filteredMovies.length}</span> de {totalMasterpieces} títulos
        </div>
        {(searchQuery || selectedDecade !== "all" || selectedGenreId !== null || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDecade("all");
              setSelectedGenreId(null);
              setStatusFilter("all");
              setSortBy("rank");
            }}
            className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
          >
            Restablecer todos los filtros
          </button>
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

                    {/* Watched / Pending Indicator Badge */}
                    {isWatched ? (
                      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-lg text-[11px] font-black bg-emerald-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Vista</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleWatchlist(movie)}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg backdrop-blur-md transition ${
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 space-y-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          openLogModal({
                            id: movie.tmdbId,
                            title: movie.title,
                            poster_path: movie.poster_path,
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
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
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{movie.vote_average}</span>
                        </span>
                      </div>
                    </div>

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
                        {movie.originalTitle && movie.originalTitle !== movie.title && (
                          <span className="text-xs text-zinc-500 italic hidden md:inline truncate">
                            ({movie.originalTitle})
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

                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-zinc-400">
                          {movie.decade}
                        </span>
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
                          className={`p-2 rounded-xl border transition ${
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
                          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-950/30 active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Registrar</span>
                        </button>

                        <Link
                          href={`/movie/${movie.tmdbId}`}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                          title="Ver Ficha"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-20 p-8 rounded-3xl bg-[#141420]/50 border border-white/5 space-y-3">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No se encontraron películas con estos filtros</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Prueba relajando la búsqueda o seleccionando otra década o género.
          </p>
        </div>
      )}
    </div>
  );
}
