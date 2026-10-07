"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  Flame, 
  Star, 
  Tv, 
  Sparkles, 
  X, 
  Filter,
  RefreshCw,
  Film,
  User,
  Building2,
  Globe,
  Clock,
  Calendar,
  Layers,
  Check,
  Ticket,
  Compass
} from "lucide-react";
import { 
  TMDBMovie, 
  TMDBPerson,
  TMDBCompany,
  searchMovies, 
  searchPeople,
  searchCompanies,
  getTrendingMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies,
  discoverMovies,
  MOVIE_GENRES,
  STREAMING_PROVIDERS,
  POPULAR_STUDIOS,
  LANGUAGES,
  RUNTIME_RANGES,
  RATING_OPTIONS,
  DECADES
} from "@/lib/tmdb/client";
import { MovieCard } from "@/components/movies/MovieCard";
import { PersonCard } from "@/components/search/PersonCard";
import { CompanyCard } from "@/components/search/CompanyCard";
import { PersonDetailModal } from "@/components/search/PersonDetailModal";
import { SceneSearchModal } from "@/components/search/SceneSearchModal";
import { ComfortZoneModal } from "@/components/movies/ComfortZoneModal";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { loadUserStreamingPlatforms } from "@/lib/services/streamingPlatforms";

type SearchTab = "all" | "movies" | "people" | "studios";
type DiscoveryMode = "search" | "discover" | "trending" | "top_rated" | "in_theaters";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") as SearchTab) || "all";
  const initialCompany = searchParams.get("company") ? Number(searchParams.get("company")) : null;
  const initialCompanyName = searchParams.get("companyName") || "";
  const initialPerson = searchParams.get("person") ? Number(searchParams.get("person")) : null;
  const initialPersonName = searchParams.get("personName") || "";
  const initialPersonRole = (searchParams.get("role") as "cast" | "crew") || "crew";

  const { isBlacklisted } = useApp();
  const { user } = useAuth();

  // User's configured streaming platforms
  const [userPlatforms, setUserPlatforms] = useState<number[]>([]);
  const [onlyMyPlatforms, setOnlyMyPlatforms] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function fetchPlatforms() {
      const list = await loadUserStreamingPlatforms(user?.id);
      if (!isCancelled) {
        setUserPlatforms(list);
      }
    }
    fetchPlatforms();

    const handlePlatformsChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setUserPlatforms(e.detail);
      }
    };
    window.addEventListener("filmtracker_platforms_changed", handlePlatformsChange);
    return () => {
      isCancelled = true;
      window.removeEventListener("filmtracker_platforms_changed", handlePlatformsChange);
    };
  }, [user?.id]);

  // Mode and query
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchTab, setSearchTab] = useState<SearchTab>(initialTab);
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>(
    initialQuery ? "search" : "discover"
  );

  // Advanced Filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [isComfortModalOpen, setIsComfortModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<{ id: number; name: string } | null>(
    initialCompany ? { id: initialCompany, name: initialCompanyName || "Estudio" } : null
  );
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string; role: "cast" | "crew" } | null>(
    initialPerson ? { id: initialPerson, name: initialPersonName || "Cineasta", role: initialPersonRole } : null
  );
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedRuntime, setSelectedRuntime] = useState<string>("all");
  const [selectedDecade, setSelectedDecade] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");

  // Results State
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [people, setPeople] = useState<TMDBPerson[]>([]);
  const [studios, setStudios] = useState<TMDBCompany[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [inspectPersonId, setInspectPersonId] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Synchronize state if URL query params change (e.g. from navbar or movie detail links)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
      if (q.trim()) setDiscoveryMode("search");
    }
    const tab = searchParams.get("tab") as SearchTab | null;
    if (tab) {
      setSearchTab(tab);
    }
    const compId = searchParams.get("company");
    const compName = searchParams.get("companyName");
    if (compId) {
      setSelectedStudio({ id: Number(compId), name: compName || "Estudio" });
      setSearchTab("movies");
      setDiscoveryMode("discover");
    }
    const persId = searchParams.get("person");
    const persName = searchParams.get("personName");
    const role = (searchParams.get("role") as "cast" | "crew") || "crew";
    if (persId) {
      setSelectedPerson({ id: Number(persId), name: persName || "Cineasta", role });
      setSearchTab("movies");
      setDiscoveryMode("discover");
    }
  }, [searchParams]);

  // Main search / discover fetcher
  useEffect(() => {
    let isCancelled = false;

    async function executeSearch(pageNum: number, append: boolean = false) {
      setLoading(true);
      try {
        const queryTrimmed = debouncedQuery.trim();

        // 1. GLOBAL MULTI-SEARCH MODE
        if (queryTrimmed && searchTab === "all") {
          const [movieRes, peopleRes, studioRes] = await Promise.all([
            searchMovies(queryTrimmed, pageNum),
            searchPeople(queryTrimmed, pageNum),
            searchCompanies(queryTrimmed, pageNum),
          ]);

          if (!isCancelled) {
            if (append) {
              setMovies((prev) => [...prev, ...movieRes.results]);
            } else {
              setMovies(movieRes.results);
              setPeople(peopleRes.results);
              setStudios(studioRes.results);
            }
            setTotalPages(movieRes.total_pages || 1);
          }
          return;
        }

        // 2. DEDICATED PEOPLE SEARCH
        if (searchTab === "people") {
          const res = queryTrimmed 
            ? await searchPeople(queryTrimmed, pageNum)
            : await searchPeople("a", pageNum); // Initial directory

          if (!isCancelled) {
            if (append) {
              setPeople((prev) => [...prev, ...res.results]);
            } else {
              setPeople(res.results);
            }
            setTotalPages(res.total_pages || 1);
          }
          return;
        }

        // 3. DEDICATED STUDIOS SEARCH
        if (searchTab === "studios") {
          const res = queryTrimmed
            ? await searchCompanies(queryTrimmed, pageNum)
            : { results: POPULAR_STUDIOS.map(s => ({ id: s.id, name: s.name, logo_path: s.logo, origin_country: s.country })), total_pages: 1, total_results: 10, page: 1 };

          if (!isCancelled) {
            if (append) {
              setStudios((prev) => [...prev, ...res.results]);
            } else {
              setStudios(res.results);
            }
            setTotalPages(res.total_pages || 1);
          }
          return;
        }

        // 4. MOVIES MODE (Search, Discover, Trending, Top-Rated)
        let movieRes;
        const watchProvidersParam = selectedProvider
          ? String(selectedProvider)
          : onlyMyPlatforms && userPlatforms.length > 0
          ? userPlatforms.join("|")
          : undefined;

        if (queryTrimmed && searchTab === "movies") {
          movieRes = await searchMovies(queryTrimmed, pageNum);
        } else if (discoveryMode === "trending" && !selectedStudio && !selectedPerson && !watchProvidersParam) {
          movieRes = await getTrendingMovies("week", pageNum);
        } else if (discoveryMode === "top_rated" && !selectedStudio && !selectedPerson && !watchProvidersParam) {
          movieRes = await getTopRatedMovies(pageNum);
        } else if (discoveryMode === "in_theaters" && !selectedStudio && !selectedPerson && !watchProvidersParam) {
          movieRes = await getNowPlayingMovies(pageNum);
        } else {
          // Discover with all filters
          const runtimeObj = RUNTIME_RANGES.find((r) => r.id === selectedRuntime);
          movieRes = await discoverMovies({
            page: pageNum,
            sortBy,
            genres: selectedGenre ? String(selectedGenre) : undefined,
            watchProviders: watchProvidersParam,
            year: selectedYear || undefined,
            decade: selectedDecade || undefined,
            minRating: selectedRating > 0 ? selectedRating : undefined,
            originalLanguage: selectedLanguage || undefined,
            minRuntime: runtimeObj?.min,
            maxRuntime: runtimeObj?.max,
            withCompanies: selectedStudio?.id,
            withCast: selectedPerson?.role === "cast" ? selectedPerson.id : undefined,
            withCrew: selectedPerson?.role === "crew" ? selectedPerson.id : undefined,
          });
        }

        if (!isCancelled && movieRes) {
          if (append) {
            setMovies((prev) => [...prev, ...movieRes.results]);
          } else {
            setMovies(movieRes.results);
          }
          setTotalPages(movieRes.total_pages || 1);
        }
      } catch (err) {
        console.warn("Search/Discover error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    setPage(1);
    executeSearch(1, false);

    return () => {
      isCancelled = true;
    };
  }, [
    debouncedQuery,
    searchTab,
    discoveryMode,
    selectedGenre,
    selectedProvider,
    onlyMyPlatforms,
    userPlatforms,
    selectedStudio,
    selectedPerson,
    selectedRating,
    selectedLanguage,
    selectedRuntime,
    selectedDecade,
    selectedYear,
    sortBy,
  ]);

  // Handle Load More
  const loadMore = async () => {
    if (page >= totalPages || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);

    setLoading(true);
    try {
      const queryTrimmed = debouncedQuery.trim();

      if (queryTrimmed && searchTab === "all") {
        const movieRes = await searchMovies(queryTrimmed, nextPage);
        if (movieRes?.results) {
          setMovies((prev) => [...prev, ...movieRes.results]);
        }
      } else if (searchTab === "people") {
        const res = await searchPeople(queryTrimmed || "a", nextPage);
        if (res?.results) {
          setPeople((prev) => [...prev, ...res.results]);
        }
      } else if (searchTab === "studios") {
        if (queryTrimmed) {
          const res = await searchCompanies(queryTrimmed, nextPage);
          if (res?.results) {
            setStudios((prev) => [...prev, ...res.results]);
          }
        }
      } else {
        // Movies
        let movieRes;
        const watchProvidersParam = selectedProvider
          ? String(selectedProvider)
          : onlyMyPlatforms && userPlatforms.length > 0
          ? userPlatforms.join("|")
          : undefined;

        if (queryTrimmed && searchTab === "movies") {
          movieRes = await searchMovies(queryTrimmed, nextPage);
        } else if (discoveryMode === "trending" && !selectedStudio && !selectedPerson && !watchProvidersParam) {
          movieRes = await getTrendingMovies("week", nextPage);
        } else if (discoveryMode === "top_rated" && !selectedStudio && !selectedPerson && !watchProvidersParam) {
          movieRes = await getTopRatedMovies(nextPage);
        } else if (discoveryMode === "in_theaters" && !selectedStudio && !selectedPerson && !watchProvidersParam) {
          movieRes = await getNowPlayingMovies(nextPage);
        } else {
          const runtimeObj = RUNTIME_RANGES.find((r) => r.id === selectedRuntime);
          movieRes = await discoverMovies({
            page: nextPage,
            sortBy,
            genres: selectedGenre ? String(selectedGenre) : undefined,
            watchProviders: watchProvidersParam,
            year: selectedYear || undefined,
            decade: selectedDecade || undefined,
            minRating: selectedRating > 0 ? selectedRating : undefined,
            originalLanguage: selectedLanguage || undefined,
            minRuntime: runtimeObj?.min,
            maxRuntime: runtimeObj?.max,
            withCompanies: selectedStudio?.id,
            withCast: selectedPerson?.role === "cast" ? selectedPerson.id : undefined,
            withCrew: selectedPerson?.role === "crew" ? selectedPerson.id : undefined,
          });
        }

        if (movieRes?.results) {
          setMovies((prev) => [...prev, ...movieRes.results]);
        }
      }
    } catch (err) {
      console.warn("Load more error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedProvider(null);
    setOnlyMyPlatforms(false);
    setSelectedStudio(null);
    setSelectedPerson(null);
    setSelectedRating(0);
    setSelectedLanguage("");
    setSelectedRuntime("all");
    setSelectedDecade("");
    setSelectedYear("");
    setSortBy("popularity.desc");
  };

  const hasActiveFilters = Boolean(
    selectedGenre ||
    selectedProvider ||
    (onlyMyPlatforms && userPlatforms.length > 0) ||
    selectedStudio ||
    selectedPerson ||
    selectedRating > 0 ||
    selectedLanguage ||
    selectedRuntime !== "all" ||
    selectedDecade ||
    selectedYear ||
    sortBy !== "popularity.desc"
  );

  const activeFilterCount = [
    selectedGenre !== null,
    selectedProvider !== null,
    onlyMyPlatforms && userPlatforms.length > 0,
    selectedStudio !== null,
    selectedPerson !== null,
    selectedRating > 0,
    selectedLanguage !== "",
    selectedRuntime !== "all",
    selectedDecade !== "",
    selectedYear !== "",
  ].filter(Boolean).length;

  const visibleMovies = movies.filter((m) => !isBlacklisted(m.id));

  // Handler when clicking a Studio
  const handleSelectStudio = (studio: { id: number; name: string }) => {
    setSelectedStudio(studio);
    setSearchTab("movies");
    setDiscoveryMode("discover");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler when filtering by a Person
  const handleFilterByPerson = (person: TMDBPerson, role: "cast" | "crew") => {
    setSelectedPerson({ id: person.id, name: person.name, role });
    setSearchTab("movies");
    setDiscoveryMode("discover");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Header and Global Search Bar */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Buscador y Explorador Global</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Encuentra películas, directores, actores, estudios de cine y productoras con filtros avanzados.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar película, director, actor, productora..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#141420] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Scene Search Button */}
          <button
            onClick={() => setIsSceneModalOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/25 transition text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 shrink-0 cursor-pointer"
            title="Buscar película por descripción de una escena con IA"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">Buscar por Escena (IA)</span>
            <span className="md:hidden">Escena IA</span>
          </button>

          {/* AI Out of Comfort Zone / El Salto de Fe Button */}
          <button
            onClick={() => setIsComfortModalOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-amber-500/20 border border-purple-500/35 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-600/30 transition text-xs sm:text-sm font-bold shadow-md shadow-purple-950/20 shrink-0 cursor-pointer"
            title="Fuera de tu Zona de Confort: El Salto de Fe"
          >
            <Compass className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="hidden md:inline">Zona de Confort 🚀</span>
            <span className="md:hidden">Salto de Fe</span>
          </button>

          {/* Filter Drawer Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border transition text-sm font-semibold shrink-0 ${
              isFilterOpen || hasActiveFilters
                ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25"
                : "bg-[#141420] border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-red-600 text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary Scope Tabs: Todo, Películas, Personas, Estudios */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/5">
        <button
          onClick={() => setSearchTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "all"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Globe className="w-4 h-4 text-red-500" />
          <span>Todo (Global)</span>
        </button>

        <button
          onClick={() => setSearchTab("movies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "movies"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Film className="w-4 h-4 text-rose-500" />
          <span>Películas</span>
        </button>

        <button
          onClick={() => setSearchTab("people")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "people"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <User className="w-4 h-4 text-amber-400" />
          <span>Personas (Actores / Directores)</span>
        </button>

        <button
          onClick={() => setSearchTab("studios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "studios"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>Estudios y Productoras</span>
        </button>
      </div>

      {/* Discovery Mode Sub-Tabs (when in movies mode and not searching a specific query) */}
      {(searchTab === "movies" || (searchTab === "all" && !debouncedQuery.trim())) && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setDiscoveryMode("discover")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              discoveryMode === "discover"
                ? "bg-red-600/30 text-red-300 border border-red-500/40"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explorar Catálogo</span>
          </button>

          <button
            onClick={() => setDiscoveryMode("trending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              discoveryMode === "trending"
                ? "bg-red-600/30 text-red-300 border border-red-500/40"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Tendencias</span>
          </button>

          <button
            onClick={() => setDiscoveryMode("top_rated")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              discoveryMode === "top_rated"
                ? "bg-red-600/30 text-red-300 border border-red-500/40"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Mejor Calificadas</span>
          </button>

          <button
            onClick={() => {
              setDiscoveryMode("in_theaters");
              setOnlyMyPlatforms(false);
              setSelectedProvider(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              discoveryMode === "in_theaters"
                ? "bg-red-600/30 text-red-300 border border-red-500/40 font-bold shadow-md shadow-red-950/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-red-400" />
            <span>En Cines</span>
          </button>

          <button
            onClick={() => {
              if (userPlatforms.length === 0) {
                if (user) {
                  router.push(`/profile/${user.id}`);
                } else {
                  setIsFilterOpen(true);
                }
                return;
              }
              setOnlyMyPlatforms((prev) => !prev);
              setSelectedProvider(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              onlyMyPlatforms
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-950/40 font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-purple-400" />
            <span>Mis Plataformas {userPlatforms.length > 0 ? `(${userPlatforms.length})` : ""}</span>
          </button>
        </div>
      )}

      {/* Active Filters Pill Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-2xl bg-[#141420]/80 border border-white/5">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-red-400" />
            Filtros activos:
          </span>

          {onlyMyPlatforms && userPlatforms.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-medium">
              <Tv className="w-3 h-3 text-purple-400" />
              <span>En mis plataformas ({userPlatforms.length})</span>
              <button onClick={() => setOnlyMyPlatforms(false)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedStudio && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-medium">
              <Building2 className="w-3 h-3" />
              <span>Estudio: {selectedStudio.name}</span>
              <button onClick={() => setSelectedStudio(null)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedPerson && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium">
              <User className="w-3 h-3" />
              <span>{selectedPerson.role === "crew" ? "Director" : "Actor"}: {selectedPerson.name}</span>
              <button onClick={() => setSelectedPerson(null)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedGenre && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-medium">
              <span>Género: {MOVIE_GENRES.find((g) => g.id === selectedGenre)?.name}</span>
              <button onClick={() => setSelectedGenre(null)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedProvider && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-medium">
              <Tv className="w-3 h-3" />
              <span>Plataforma: {STREAMING_PROVIDERS.find((p) => p.id === selectedProvider)?.name}</span>
              <button onClick={() => setSelectedProvider(null)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>Mínimo: {selectedRating}+</span>
              <button onClick={() => setSelectedRating(0)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLanguage && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
              <Globe className="w-3 h-3" />
              <span>Idioma: {LANGUAGES.find((l) => l.code === selectedLanguage)?.label}</span>
              <button onClick={() => setSelectedLanguage("")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRuntime !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-medium">
              <Clock className="w-3 h-3" />
              <span>{RUNTIME_RANGES.find((r) => r.id === selectedRuntime)?.label}</span>
              <button onClick={() => setSelectedRuntime("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedDecade && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
              <Calendar className="w-3 h-3" />
              <span>Época: {DECADES.find((d) => d.id === selectedDecade)?.label}</span>
              <button onClick={() => setSelectedDecade("")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedYear && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
              <span>Año: {selectedYear}</span>
              <button onClick={() => setSelectedYear("")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="ml-auto text-xs text-red-400 hover:text-red-300 underline font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Advanced Filters Expandable Drawer */}
      {isFilterOpen && (
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/10 space-y-6 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Filter className="w-4 h-4 text-red-500" />
              <span>Filtros Cinematográficos Avanzados</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restablecer todo</span>
              </button>
            )}
          </div>

          {/* 1. Studios / Iconic Production Companies */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Estudios y Productoras Icónicas
              </span>
              {selectedStudio && (
                <button
                  onClick={() => setSelectedStudio(null)}
                  className="text-[11px] text-zinc-400 hover:text-white"
                >
                  Deseleccionar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_STUDIOS.map((studio) => (
                <button
                  key={studio.id}
                  onClick={() =>
                    setSelectedStudio(selectedStudio?.id === studio.id ? null : { id: studio.id, name: studio.name })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    selectedStudio?.id === studio.id
                      ? "bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-600/20"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{studio.name}</span>
                  {selectedStudio?.id === studio.id && <Check className="w-3 h-3 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Streaming Platforms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-red-400" />
                Plataformas de Streaming
              </span>
              {userPlatforms.length > 0 && (
                <button
                  onClick={() => {
                    setOnlyMyPlatforms((prev) => !prev);
                    setSelectedProvider(null);
                  }}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition ${
                    onlyMyPlatforms
                      ? "bg-purple-600 text-white"
                      : "text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20"
                  }`}
                >
                  {onlyMyPlatforms ? "Desactivar mis plataformas" : `Filtrar por mis plataformas (${userPlatforms.length})`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {STREAMING_PROVIDERS.map((provider) => {
                const isUserPlatform = userPlatforms.includes(provider.id);
                return (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setOnlyMyPlatforms(false);
                      setSelectedProvider(selectedProvider === provider.id ? null : provider.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                      selectedProvider === provider.id
                        ? "bg-red-600/30 border-red-500 text-white"
                        : isUserPlatform
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>{provider.name}</span>
                    {isUserPlatform && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="En tus suscripciones" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Rating & Runtime & Language Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            {/* Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Calificación mínima
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedRating(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedRating === opt.value
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Idioma Original
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#191928] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag ? `${lang.flag} ` : ""}{lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Runtime Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Duración
              </label>
              <select
                value={selectedRuntime}
                onChange={(e) => setSelectedRuntime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#191928] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
              >
                {RUNTIME_RANGES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Genres */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Géneros Cinematográficos
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MOVIE_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition ${
                    selectedGenre === genre.id
                      ? "bg-red-600 text-white font-semibold"
                      : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Decades, Specific Year and Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Épocas / Décadas
              </label>
              <select
                value={selectedDecade}
                onChange={(e) => {
                  setSelectedDecade(e.target.value);
                  if (e.target.value) setSelectedYear("");
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#191928] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
              >
                {DECADES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Año exacto
              </label>
              <input
                type="number"
                min="1900"
                max="2035"
                placeholder="Ej. 1999"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  if (e.target.value) setSelectedDecade("");
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
              >
              </input>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Criterio de orden
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#191928] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
              >
                <option value="popularity.desc">Mayor Popularidad</option>
                <option value="vote_average.desc">Mejor Calificadas</option>
                <option value="primary_release_date.desc">Más Recientes</option>
                <option value="revenue.desc">Mayor Taquilla</option>
                <option value="vote_count.desc">Más Votadas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY SECTION */}

      {/* Section 1: "Todo" Global View with Groups */}
      {searchTab === "all" && debouncedQuery.trim() && (
        <div className="space-y-8">
          {/* People Highlights */}
          {people.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  <span>Personas encontradas ({people.length})</span>
                </h2>
                <button
                  onClick={() => setSearchTab("people")}
                  className="text-xs text-red-400 hover:underline font-semibold"
                >
                  Ver todas las personas
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {people.slice(0, 3).map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onSelectPerson={(p) =>
                      handleFilterByPerson(p, p.known_for_department === "Directing" ? "crew" : "cast")
                    }
                    onViewDetails={(p) => setInspectPersonId(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Studio Highlights */}
          {studios.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Estudios y Productoras ({studios.length})</span>
                </h2>
                <button
                  onClick={() => setSearchTab("studios")}
                  className="text-xs text-red-400 hover:underline font-semibold"
                >
                  Ver todos los estudios
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {studios.slice(0, 4).map((studio) => (
                  <CompanyCard
                    key={studio.id}
                    company={studio}
                    onSelectCompany={(c) => handleSelectStudio({ id: c.id, name: c.name })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Movies Section in All View */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              <span>Películas encontradas ({visibleMovies.length})</span>
            </h2>
            {visibleMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {visibleMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : !loading ? (
              <div className="p-8 text-center bg-white/5 rounded-2xl text-zinc-400 text-sm">
                No se encontraron películas para esta búsqueda.
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Section 2: Dedicated "Personas" Tab */}
      {searchTab === "people" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>Directores, Actores y Guionistas ({people.length})</span>
            </h2>
          </div>

          {people.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onSelectPerson={(p) =>
                    handleFilterByPerson(p, p.known_for_department === "Directing" ? "crew" : "cast")
                  }
                  onViewDetails={(p) => setInspectPersonId(p.id)}
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
              <User className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No se encontraron personas</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Prueba buscando por nombre completo o apellido (ej. Tarantino, Scorsese, Margot Robbie).
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Section 3: Dedicated "Estudios y Productoras" Tab */}
      {searchTab === "studios" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Estudios Cinematográficos ({studios.length})</span>
            </h2>
          </div>

          {studios.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {studios.map((studio) => (
                <CompanyCard
                  key={studio.id}
                  company={studio}
                  onSelectCompany={(c) => handleSelectStudio({ id: c.id, name: c.name })}
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
              <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No se encontraron estudios</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Prueba buscando por el nombre de la productora (ej. A24, Ghibli, Warner, Pixar).
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Section 4: Dedicated "Películas" Tab or Default Discover View */}
      {(searchTab === "movies" || (searchTab === "all" && !debouncedQuery.trim())) && (
        <div className="space-y-6">
          {visibleMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
              {visibleMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
              <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No se encontraron películas</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                Prueba relajando algunos filtros aplicados o buscando otro título.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-12 text-zinc-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
          <span>Buscando en la base de datos cinematográfica...</span>
        </div>
      )}

      {/* Load More Button */}
      {page < totalPages && !loading && (
        <div className="flex justify-center pt-6">
          <button
            onClick={loadMore}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition active:scale-95"
          >
            <span>Cargar más resultados</span>
          </button>
        </div>
      )}

      {/* Person Detail & Filmography Modal */}
      {inspectPersonId && (
        <PersonDetailModal
          personId={inspectPersonId}
          onClose={() => setInspectPersonId(null)}
          onFilterByPerson={handleFilterByPerson}
        />
      )}

      {/* AI Scene Search Modal */}
      <SceneSearchModal
        isOpen={isSceneModalOpen}
        onClose={() => setIsSceneModalOpen(false)}
      />

      {/* AI Out of Comfort Zone Modal */}
      <ComfortZoneModal
        isOpen={isComfortModalOpen}
        onClose={() => setIsComfortModalOpen(false)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Cargando buscador global...</div>}>
      <SearchContent />
    </Suspense>
  );
}
