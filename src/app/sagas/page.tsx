"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Film, 
  Search, 
  Sparkles, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Filter, 
  X, 
  ChevronRight, 
  Flame, 
  Play, 
  Clapperboard, 
  Globe, 
  Rocket, 
  Zap, 
  Crown, 
  Ghost, 
  Smile,
  RefreshCw
} from "lucide-react";
import { 
  CURATED_SAGAS, 
  SAGA_CATEGORIES, 
  CuratedSaga, 
  SagaCategory, 
  getCachedSagaDetails 
} from "@/lib/services/sagas";
import { fetchAllUserLogs } from "@/lib/services/logs";
import { 
  TMDBCollectionItem, 
  TMDBCollectionDetails, 
  searchCollections, 
  getImageUrl, 
  getBackdropUrl 
} from "@/lib/tmdb/client";
import { SagaDetailModal } from "@/components/sagas/SagaDetailModal";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";

export default function SagasPage() {
  const { user } = useAuth();
  const { lastUpdated } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SagaCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress" | "not_started">("all");

  // User Watch Data
  const [userWatchedIds, setUserWatchedIds] = useState<Set<number>>(new Set());
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());

  // Sagas Metadata Cache (loaded parts for accurate progress)
  const [loadedSagas, setLoadedSagas] = useState<Map<number, TMDBCollectionDetails>>(new Map());
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Dynamic TMDB Search Results
  const [tmdbSearchResults, setTmdbSearchResults] = useState<TMDBCollectionItem[]>([]);
  const [searchingTMDB, setSearchingTMDB] = useState(false);

  // Modal State
  const [activeSagaId, setActiveSagaId] = useState<number | null>(null);
  const [activeCurated, setActiveCurated] = useState<CuratedSaga | undefined>(undefined);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load user logged movies from Supabase
  useEffect(() => {
    let isCancelled = false;

    async function loadUserLogs() {
      if (!user) {
        setUserWatchedIds(new Set());
        setUserRatings(new Map());
        return;
      }

      try {
        const logs = await fetchAllUserLogs(user.id, { select: "tmdb_id, rating" });

        if (logs && !isCancelled) {
          const ids = new Set<number>();
          const ratings = new Map<number, number>();

          logs.forEach((log) => {
            if (log.tmdb_id) {
              ids.add(log.tmdb_id);
              if (log.rating) ratings.set(log.tmdb_id, log.rating);
            }
          });

          setUserWatchedIds(ids);
          setUserRatings(ratings);
        }
      } catch (err) {
        console.warn("Error cargando logs del usuario:", err);
      }
    }

    loadUserLogs();

    return () => {
      isCancelled = true;
    };
  }, [user, lastUpdated]);

  // Preload curated sagas details in background
  useEffect(() => {
    let isMounted = true;

    async function preloadCurated() {
      const map = new Map<number, TMDBCollectionDetails>();
      
      // Load first 16 immediately for fast visual feedback
      const prioritySagas = CURATED_SAGAS.slice(0, 16);
      await Promise.all(
        prioritySagas.map(async (saga) => {
          const details = await getCachedSagaDetails(saga.id);
          if (details) map.set(saga.id, details);
        })
      );

      if (isMounted) {
        setLoadedSagas(new Map(map));
        setLoadingInitial(false);
      }

      // Load remaining sagas in fast parallel batches of 8
      const remainingSagas = CURATED_SAGAS.slice(16);
      const batchSize = 8;
      for (let i = 0; i < remainingSagas.length; i += batchSize) {
        if (!isMounted) break;
        const batch = remainingSagas.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (saga) => {
            const details = await getCachedSagaDetails(saga.id);
            if (details) map.set(saga.id, details);
          })
        );
        if (isMounted) {
          setLoadedSagas(new Map(map));
        }
      }
    }

    preloadCurated();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search live on TMDB if query is typed
  useEffect(() => {
    let isMounted = true;

    async function executeTMDBSearch() {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setTmdbSearchResults([]);
        setSearchingTMDB(false);
        return;
      }

      setSearchingTMDB(true);
      try {
        const res = await searchCollections(debouncedSearch);
        if (isMounted && res?.results) {
          // Filter out collections that are already in our curated list to avoid duplicates
          const curatedIds = new Set(CURATED_SAGAS.map((s) => s.id));
          const uniqueResults = res.results.filter((item) => !curatedIds.has(item.id));
          setTmdbSearchResults(uniqueResults.slice(0, 8));
        }
      } catch (err) {
        console.warn("Error buscando colecciones en TMDB:", err);
      } finally {
        if (isMounted) setSearchingTMDB(false);
      }
    }

    executeTMDBSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  // Calculate Progress and Stats
  const sagaProgressMap = useMemo(() => {
    const map = new Map<number, { watched: number; total: number; percent: number; isCompleted: boolean }>();

    CURATED_SAGAS.forEach((saga) => {
      const details = loadedSagas.get(saga.id);
      const parts = details?.parts || [];
      const total = parts.length > 0 ? parts.length : saga.approxMovies;
      const watched = parts.filter((p) => userWatchedIds.has(p.id)).length;
      const percent = total > 0 ? Math.round((watched / total) * 100) : 0;
      const isCompleted = total > 0 && watched === total;

      map.set(saga.id, { watched, total, percent, isCompleted });
    });

    return map;
  }, [loadedSagas, userWatchedIds]);

  // Overall User Sagas Stats
  const userStats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let totalWatchedParts = 0;

    sagaProgressMap.forEach((stat) => {
      if (stat.isCompleted) completed++;
      else if (stat.watched > 0) inProgress++;
      totalWatchedParts += stat.watched;
    });

    return { completed, inProgress, totalWatchedParts };
  }, [sagaProgressMap]);

  // Filter curated sagas
  const filteredCuratedSagas = useMemo(() => {
    return CURATED_SAGAS.filter((saga) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cats = Array.isArray(saga.category) ? saga.category : [saga.category];
        if (!cats.includes(selectedCategory)) {
          return false;
        }
      }

      // Search query filter (matches name, universe, tagline, and aliases)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesName = saga.name.toLowerCase().includes(q);
        const matchesUniverse = saga.universe.toLowerCase().includes(q);
        const matchesTagline = saga.tagline.toLowerCase().includes(q);
        const matchesAliases = saga.aliases?.some((a) => a.toLowerCase().includes(q));
        if (!matchesName && !matchesUniverse && !matchesTagline && !matchesAliases) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        const stat = sagaProgressMap.get(saga.id);
        if (!stat) return true;

        if (statusFilter === "completed" && !stat.isCompleted) return false;
        if (statusFilter === "in_progress" && (stat.watched === 0 || stat.isCompleted)) return false;
        if (statusFilter === "not_started" && stat.watched > 0) return false;
      }

      return true;
    });
  }, [selectedCategory, debouncedSearch, statusFilter, sagaProgressMap]);

  const handleOpenSaga = (id: number, curated?: CuratedSaga) => {
    setActiveSagaId(id);
    setActiveCurated(curated);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#181124] via-[#12111c] to-[#0a0a10] p-6 sm:p-10 shadow-2xl">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Universo Cinematográfico & Franquicias</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Sagas y Universos Cinematográficos
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Explorá las franquicias más legendarias de la historia del cine. Hacé maratones en orden cronológico, 
              descubrí películas pendientes y llevá el recuento de tus sagas completadas al 100%.
            </p>
          </div>

          {/* User Progress Stats Card */}
          <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shrink-0 sm:min-w-[340px]">
            <div className="text-center space-y-1">
              <div className="w-9 h-9 mx-auto rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-white">{userStats.completed}</div>
              <div className="text-[11px] font-semibold text-zinc-400">Completadas</div>
            </div>

            <div className="text-center space-y-1 border-x border-white/10">
              <div className="w-9 h-9 mx-auto rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-white">{userStats.inProgress}</div>
              <div className="text-[11px] font-semibold text-zinc-400">En Progreso</div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-9 h-9 mx-auto rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Film className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-white">{userStats.totalWatchedParts}</div>
              <div className="text-[11px] font-semibold text-zinc-400">Vistas en Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar saga o universo (ej. Harry Potter, Star Wars, Alien, Batman, El Padrino...)"
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-12 pr-11 py-3.5 sm:py-4 rounded-2xl bg-[#141422] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner text-base font-medium caret-red-500"
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

        {/* Category Tabs & Status Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SAGA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-white text-zinc-950 font-black shadow-md shadow-white/10"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                statusFilter === "all" ? "bg-red-600 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                statusFilter === "completed" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Completadas (100%)
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                statusFilter === "in_progress" ? "bg-red-600 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              En progreso
            </button>
            <button
              onClick={() => setStatusFilter("not_started")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                statusFilter === "not_started" ? "bg-zinc-700 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sin empezar
            </button>
          </div>
        </div>
      </section>

      {/* Curated Sagas Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Colecciones y Universos Destacados ({filteredCuratedSagas.length})</span>
          </h2>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-xs text-red-400 hover:underline"
            >
              Restablecer filtro de estado
            </button>
          )}
        </div>

        {filteredCuratedSagas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredCuratedSagas.map((saga) => {
              const details = loadedSagas.get(saga.id);
              const progress = sagaProgressMap.get(saga.id) || {
                watched: 0,
                total: saga.approxMovies,
                percent: 0,
                isCompleted: false,
              };

              const backdrop = details?.backdrop_path || saga.backdropPath || null;
              const poster = details?.poster_path || saga.posterPath || null;

              return (
                <div
                  key={saga.id}
                  onClick={() => handleOpenSaga(saga.id, saga)}
                  className={`group relative flex flex-col justify-between rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                    progress.isCompleted
                      ? "bg-[#141220] border-amber-500/40 hover:border-amber-400 shadow-amber-950/20"
                      : "bg-[#11111d] border-white/10 hover:border-red-500/40 hover:shadow-red-950/20"
                  }`}
                >
                  {/* Backdrop Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900 shrink-0">
                    <img
                      src={getBackdropUrl(backdrop, "w500")}
                      alt={saga.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11111d] via-[#11111d]/50 to-transparent" />

                    {/* Universe Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-red-400 border border-red-500/30 shadow-md">
                        {saga.universe}
                      </span>
                    </div>

                    {/* Completion Ribbon */}
                    {progress.isCompleted && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black shadow-lg shadow-amber-500/40">
                        <Trophy className="w-3 h-3" />
                        <span>100%</span>
                      </div>
                    )}

                    {/* Mini Poster Floating Overlay */}
                    <div className="absolute bottom-2 left-3.5 w-12 aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/20 shadow-xl bg-zinc-800 shrink-0">
                      <img
                        src={getImageUrl(poster, "w200")}
                        alt={saga.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-black text-base sm:text-lg text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {saga.name}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {saga.tagline}
                      </p>
                    </div>

                    {/* Meta info & Progress Meter */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">
                          {progress.total} películas
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {saga.yearRange}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden border border-white/5">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            progress.isCompleted
                              ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-500/50"
                              : progress.watched > 0
                              ? "bg-gradient-to-r from-red-600 to-rose-500"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>

                      {/* Progress label */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-bold ${progress.isCompleted ? "text-amber-400" : progress.watched > 0 ? "text-red-400" : "text-zinc-500"}`}>
                          {progress.watched > 0 ? `${progress.watched} de ${progress.total} vistas` : "Sin empezar"}
                        </span>
                        <span className="text-zinc-500 font-semibold">
                          {progress.percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 p-8 rounded-3xl bg-[#141420]/50 border border-white/5 space-y-2">
            <Film className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No se encontraron sagas destacadas</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Prueba cambiando la categoría seleccionada o buscando otro título.
            </p>
          </div>
        )}
      </section>

      {/* Dynamic TMDB Search Results Section (if searching something not in curated list) */}
      {debouncedSearch && tmdbSearchResults.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Otras colecciones encontradas en TMDB para &quot;{debouncedSearch}&quot; ({tmdbSearchResults.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tmdbSearchResults.map((col) => (
              <div
                key={col.id}
                onClick={() => handleOpenSaga(col.id)}
                className="group p-4 rounded-2xl bg-[#141422] border border-white/10 hover:border-blue-500/40 hover:shadow-xl transition cursor-pointer flex items-center gap-3.5"
              >
                <div className="w-12 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={getImageUrl(col.poster_path, "w200")}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition truncate">
                    {col.name}
                  </h4>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Colección Oficial
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal Detail */}
      {activeSagaId && (
        <SagaDetailModal
          sagaId={activeSagaId}
          curatedInfo={activeCurated}
          userWatchedIds={userWatchedIds}
          userRatings={userRatings}
          onClose={() => {
            setActiveSagaId(null);
            setActiveCurated(undefined);
          }}
        />
      )}
    </div>
  );
}
