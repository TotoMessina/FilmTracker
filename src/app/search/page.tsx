"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  Users,
  Building2,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Layers,
  Check,
  Ticket,
  Compass,
  Eye,
  EyeOff,
  CheckCircle2
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
  getImageUrl,
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
import {
  POPULAR_ORIGIN_COUNTRIES,
  ACTORS_BY_COUNTRY,
  getCastIdsForCountry,
  getActorsForCountry,
  getAllCountriesOptions,
  CountryActor,
} from "@/lib/data/countryFilters";
import { countryName, countryFlag } from "@/lib/services/cineMap";

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

  const { isBlacklisted, isWatched } = useApp();
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
  const [selectedOriginCountry, setSelectedOriginCountry] = useState<string>(
    searchParams.get("originCountry") || searchParams.get("country") || ""
  );
  const [selectedActorCountry, setSelectedActorCountry] = useState<string>(
    searchParams.get("actorCountry") || ""
  );
  const [selectedActorPerson, setSelectedActorPerson] = useState<CountryActor | null>(null);
  const allCountriesList = useMemo(() => getAllCountriesOptions(), []);
  const [selectedRuntime, setSelectedRuntime] = useState<string>("all");
  const [selectedDecade, setSelectedDecade] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [watchedFilter, setWatchedFilter] = useState<"all" | "unwatched" | "watched">(
    (searchParams.get("watched") as "all" | "unwatched" | "watched") || "all"
  );

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
    const originC = searchParams.get("originCountry") || searchParams.get("country");
    if (originC) {
      setSelectedOriginCountry(originC.toUpperCase());
      setSearchTab("movies");
      setDiscoveryMode("discover");
    }
    const actorC = searchParams.get("actorCountry");
    if (actorC) {
      setSelectedActorCountry(actorC.toUpperCase());
      setSearchTab("movies");
      setDiscoveryMode("discover");
    }
    const watchedParam = searchParams.get("watched") as "all" | "unwatched" | "watched" | null;
    if (watchedParam && ["all", "unwatched", "watched"].includes(watchedParam)) {
      setWatchedFilter(watchedParam);
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
          let res;
          if (queryTrimmed) {
            res = await searchPeople(queryTrimmed, pageNum);
          } else if (selectedActorCountry) {
            const countryActors = getActorsForCountry(selectedActorCountry);
            const tmdbLikePeople: TMDBPerson[] = countryActors.map((a) => ({
              id: a.id,
              name: a.name,
              profile_path: a.profile_path,
              known_for_department: "Acting",
              popularity: 100,
              known_for: a.known_for?.map((title, idx) => ({
                id: idx,
                title,
                poster_path: null,
                vote_average: 8.0,
                vote_count: 100,
                overview: "",
                release_date: "",
                genre_ids: [],
              })) as any,
            }));
            res = { results: tmdbLikePeople, total_pages: 1, total_results: countryActors.length, page: 1 };
          } else {
            res = await searchPeople("a", pageNum); // Initial directory
          }

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
        } else if (discoveryMode === "trending" && !selectedStudio && !selectedPerson && !watchProvidersParam && !selectedOriginCountry && !selectedActorCountry && !selectedActorPerson) {
          movieRes = await getTrendingMovies("week", pageNum);
        } else if (discoveryMode === "top_rated" && !selectedStudio && !selectedPerson && !watchProvidersParam && !selectedOriginCountry && !selectedActorCountry && !selectedActorPerson) {
          movieRes = await getTopRatedMovies(pageNum);
        } else if (discoveryMode === "in_theaters" && !selectedStudio && !selectedPerson && !watchProvidersParam && !selectedOriginCountry && !selectedActorCountry && !selectedActorPerson) {
          movieRes = await getNowPlayingMovies(pageNum);
        } else {
          // Discover with all filters
          const runtimeObj = RUNTIME_RANGES.find((r) => r.id === selectedRuntime);

          let withCastParam: string | number | undefined = undefined;
          if (selectedPerson?.role === "cast") {
            withCastParam = selectedPerson.id;
          } else if (selectedActorPerson) {
            withCastParam = selectedActorPerson.id;
          } else if (selectedActorCountry) {
            withCastParam = getCastIdsForCountry(selectedActorCountry) || undefined;
          }

          movieRes = await discoverMovies({
            page: pageNum,
            sortBy,
            genres: selectedGenre ? String(selectedGenre) : undefined,
            watchProviders: watchProvidersParam,
            year: selectedYear || undefined,
            decade: selectedDecade || undefined,
            minRating: selectedRating > 0 ? selectedRating : undefined,
            originalLanguage: selectedLanguage || undefined,
            originCountry: selectedOriginCountry || undefined,
            minRuntime: runtimeObj?.min,
            maxRuntime: runtimeObj?.max,
            withCompanies: selectedStudio?.id,
            withCast: withCastParam,
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
    selectedOriginCountry,
    selectedActorCountry,
    selectedActorPerson,
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
        } else if (discoveryMode === "trending" && !selectedStudio && !selectedPerson && !watchProvidersParam && !selectedOriginCountry && !selectedActorCountry && !selectedActorPerson) {
          movieRes = await getTrendingMovies("week", nextPage);
        } else if (discoveryMode === "top_rated" && !selectedStudio && !selectedPerson && !watchProvidersParam && !selectedOriginCountry && !selectedActorCountry && !selectedActorPerson) {
          movieRes = await getTopRatedMovies(nextPage);
        } else if (discoveryMode === "in_theaters" && !selectedStudio && !selectedPerson && !watchProvidersParam && !selectedOriginCountry && !selectedActorCountry && !selectedActorPerson) {
          movieRes = await getNowPlayingMovies(nextPage);
        } else {
          const runtimeObj = RUNTIME_RANGES.find((r) => r.id === selectedRuntime);

          let withCastParam: string | number | undefined = undefined;
          if (selectedPerson?.role === "cast") {
            withCastParam = selectedPerson.id;
          } else if (selectedActorPerson) {
            withCastParam = selectedActorPerson.id;
          } else if (selectedActorCountry) {
            withCastParam = getCastIdsForCountry(selectedActorCountry) || undefined;
          }

          movieRes = await discoverMovies({
            page: nextPage,
            sortBy,
            genres: selectedGenre ? String(selectedGenre) : undefined,
            watchProviders: watchProvidersParam,
            year: selectedYear || undefined,
            decade: selectedDecade || undefined,
            minRating: selectedRating > 0 ? selectedRating : undefined,
            originalLanguage: selectedLanguage || undefined,
            originCountry: selectedOriginCountry || undefined,
            minRuntime: runtimeObj?.min,
            maxRuntime: runtimeObj?.max,
            withCompanies: selectedStudio?.id,
            withCast: withCastParam,
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
    setSelectedOriginCountry("");
    setSelectedActorCountry("");
    setSelectedActorPerson(null);
    setSelectedRuntime("all");
    setSelectedDecade("");
    setSelectedYear("");
    setSortBy("popularity.desc");
    setWatchedFilter("all");
  };

  const hasActiveFilters = Boolean(
    watchedFilter !== "all" ||
    selectedGenre ||
    selectedProvider ||
    (onlyMyPlatforms && userPlatforms.length > 0) ||
    selectedStudio ||
    selectedPerson ||
    selectedRating > 0 ||
    selectedLanguage ||
    selectedOriginCountry ||
    selectedActorCountry ||
    selectedActorPerson ||
    selectedRuntime !== "all" ||
    selectedDecade ||
    selectedYear ||
    sortBy !== "popularity.desc"
  );

  const activeFilterCount = [
    watchedFilter !== "all",
    selectedGenre !== null,
    selectedProvider !== null,
    onlyMyPlatforms && userPlatforms.length > 0,
    selectedStudio !== null,
    selectedPerson !== null,
    selectedRating > 0,
    selectedLanguage !== "",
    selectedOriginCountry !== "",
    selectedActorCountry !== "",
    selectedActorPerson !== null,
    selectedRuntime !== "all",
    selectedDecade !== "",
    selectedYear !== "",
  ].filter(Boolean).length;

  const loadedWatchedCount = useMemo(() => {
    return movies.filter((m) => !isBlacklisted(m.id) && isWatched(m.id)).length;
  }, [movies, isBlacklisted, isWatched]);

  const loadedUnwatchedCount = useMemo(() => {
    return movies.filter((m) => !isBlacklisted(m.id) && !isWatched(m.id)).length;
  }, [movies, isBlacklisted, isWatched]);

  const visibleMovies = useMemo(() => {
    return movies.filter((m) => {
      if (isBlacklisted(m.id)) return false;
      if (watchedFilter === "unwatched") return !isWatched(m.id);
      if (watchedFilter === "watched") return isWatched(m.id);
      return true;
    });
  }, [movies, isBlacklisted, watchedFilter, isWatched]);

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

        {/* Search Bar Input & Responsive Action Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar película, director, actor, productora..."
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-12 pr-11 py-3 sm:py-3.5 rounded-2xl bg-[#141420] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner text-base font-medium caret-red-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Borrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Actions & Filters Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0">
            {/* AI Scene Search Button */}
            <button
              type="button"
              onClick={() => setIsSceneModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/25 transition text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 shrink-0 cursor-pointer active:scale-95"
              title="Buscar película por descripción de una escena con IA"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span className="hidden lg:inline">Buscar por Escena (IA)</span>
              <span className="lg:hidden">Escena IA</span>
            </button>

            {/* AI Out of Comfort Zone / El Salto de Fe Button */}
            <button
              type="button"
              onClick={() => setIsComfortModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-amber-500/20 border border-purple-500/35 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-600/30 transition text-xs sm:text-sm font-bold shadow-md shadow-purple-950/20 shrink-0 cursor-pointer active:scale-95"
              title="Fuera de tu Zona de Confort: El Salto de Fe"
            >
              <Compass className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
              <span className="hidden lg:inline">Zona de Confort 🚀</span>
              <span className="lg:hidden">Salto de Fe</span>
            </button>

            {/* Filter Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl border transition text-xs sm:text-sm font-semibold shrink-0 cursor-pointer active:scale-95 ${
                isFilterOpen || hasActiveFilters
                  ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25"
                  : "bg-[#141420] border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-red-600 text-[11px] font-black flex items-center justify-center shrink-0">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Scope Tabs: Todo, Películas, Personas, Estudios */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/5">
        <button
          onClick={() => setSearchTab("all")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "all"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Globe className="w-4 h-4 text-red-500 shrink-0" />
          <span className="hidden sm:inline">Todo (Global)</span>
          <span className="sm:hidden">Todo</span>
        </button>

        <button
          onClick={() => setSearchTab("movies")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "movies"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Film className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Películas</span>
        </button>

        <button
          onClick={() => setSearchTab("people")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "people"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <User className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Personas (Actores / Directores)</span>
          <span className="sm:hidden">Personas</span>
        </button>

        <button
          onClick={() => setSearchTab("studios")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
            searchTab === "studios"
              ? "bg-white text-zinc-950 shadow-md font-bold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Estudios y Productoras</span>
          <span className="sm:hidden">Estudios</span>
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

          {/* Quick filming country shortcut button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedOriginCountry
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold shadow-md shadow-emerald-950/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Filtrar por país donde se filmó / producción"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {selectedOriginCountry
                ? `${countryFlag(selectedOriginCountry)} ${countryName(selectedOriginCountry)}`
                : "País de Rodaje"}
            </span>
          </button>

          {/* Quick actor country shortcut button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedActorCountry
                ? "bg-amber-600/30 text-amber-300 border border-amber-500/50 font-bold shadow-md shadow-amber-950/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Filtrar por país de los actores / elenco"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {selectedActorCountry
                ? `${countryFlag(selectedActorCountry)} Elenco ${countryName(selectedActorCountry)}`
                : "País de Actores"}
            </span>
          </button>
        </div>
      )}

      {/* Quick Watched Status Filter Bar (Vistas / No Vistas) */}
      {(searchTab === "movies" || searchTab === "all") && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#141420]/80 border border-white/5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">¿Qué películas mostrar?</span>
              <span className="sm:hidden">Mostrar:</span>
            </span>
            {watchedFilter !== "all" && (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {watchedFilter === "unwatched" ? "Ocultando vistas" : "Solo ya vistas"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
            <button
              type="button"
              onClick={() => setWatchedFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                watchedFilter === "all"
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Film className="w-3.5 h-3.5 text-rose-500" />
              <span>Todas</span>
            </button>

            <button
              type="button"
              onClick={() => setWatchedFilter("unwatched")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                watchedFilter === "unwatched"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                  : "text-zinc-400 hover:text-amber-300 hover:bg-white/5"
              }`}
              title="Ocultar de la lista las películas que ya registraste como vistas"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Ocultar ya vistas</span>
              {loadedWatchedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    watchedFilter === "unwatched" ? "bg-black/20 text-black" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  -{loadedWatchedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setWatchedFilter("watched")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                watchedFilter === "watched"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-black"
                  : "text-zinc-400 hover:text-emerald-300 hover:bg-white/5"
              }`}
              title="Ver únicamente películas que ya registraste como vistas"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solo ya vistas</span>
              {loadedWatchedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    watchedFilter === "watched" ? "bg-black/20 text-white" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {loadedWatchedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Pill Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-2xl bg-[#141420]/80 border border-white/5">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-red-400" />
            Filtros activos:
          </span>

          {watchedFilter === "unwatched" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium">
              <EyeOff className="w-3 h-3 text-amber-400" />
              <span>Ocultando ya vistas ({loadedWatchedCount})</span>
              <button onClick={() => setWatchedFilter("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {watchedFilter === "watched" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Solo ya vistas ({loadedWatchedCount})</span>
              <button onClick={() => setWatchedFilter("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

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

          {selectedOriginCountry && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Filmada en: {countryFlag(selectedOriginCountry)} {countryName(selectedOriginCountry)}</span>
              <button onClick={() => setSelectedOriginCountry("")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedActorCountry && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium">
              <Users className="w-3 h-3 text-amber-400" />
              <span>
                Actores de: {countryFlag(selectedActorCountry)} {countryName(selectedActorCountry)}
                {selectedActorPerson ? ` (${selectedActorPerson.name})` : ""}
              </span>
              <button
                onClick={() => {
                  setSelectedActorCountry("");
                  setSelectedActorPerson(null);
                }}
                className="hover:text-white"
              >
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
        <div className="p-4 sm:p-6 rounded-3xl bg-[#141420] border border-white/10 space-y-6 shadow-2xl animate-in fade-in duration-200">
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

          {/* 0. Watched Status Filter (Películas Vistas / No Vistas) */}
          <div className="space-y-2.5 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Estado de Visualización en tu Diario
              </span>
              {watchedFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setWatchedFilter("all")}
                  className="text-[11px] text-zinc-400 hover:text-white"
                >
                  Restablecer a &quot;Todas&quot;
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWatchedFilter("all")}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  watchedFilter === "all"
                    ? "bg-white text-zinc-950 border-white shadow-md"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Film className="w-3.5 h-3.5 text-rose-500" />
                <span>Mostrar Todas</span>
              </button>
              <button
                type="button"
                onClick={() => setWatchedFilter("unwatched")}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  watchedFilter === "unwatched"
                    ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-black"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-amber-300 hover:bg-white/10"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                <span>Ocultar ya vistas ({loadedUnwatchedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setWatchedFilter("watched")}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  watchedFilter === "watched"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 font-black"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-emerald-300 hover:bg-white/10"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Solo ya vistas ({loadedWatchedCount})</span>
              </button>
            </div>
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

          {/* 3. Filming Country (País donde se filmó / Producción) */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                País donde se filmó / Producción
              </span>
              {selectedOriginCountry && (
                <button
                  onClick={() => setSelectedOriginCountry("")}
                  className="text-[11px] text-zinc-400 hover:text-white"
                >
                  Deseleccionar ({countryName(selectedOriginCountry)})
                </button>
              )}
            </div>
            {/* Quick popular countries chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_ORIGIN_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() =>
                    setSelectedOriginCountry(selectedOriginCountry === c.code ? "" : c.code)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    selectedOriginCountry === c.code
                      ? "bg-emerald-600/30 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  {selectedOriginCountry === c.code && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
            {/* All countries dropdown */}
            <div className="pt-1 flex items-center gap-2 max-w-sm">
              <select
                value={selectedOriginCountry}
                onChange={(e) => setSelectedOriginCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#191928] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">🌍 Ver todos los países del mundo (A-Z)...</option>
                {allCountriesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Actors' Country (País de los actores / Elenco) */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                País de los actores / Elenco
              </span>
              {selectedActorCountry && (
                <button
                  onClick={() => {
                    setSelectedActorCountry("");
                    setSelectedActorPerson(null);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-white"
                >
                  Deseleccionar ({countryName(selectedActorCountry)})
                </button>
              )}
            </div>
            {/* Country chips */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(ACTORS_BY_COUNTRY).map((code) => {
                const data = ACTORS_BY_COUNTRY[code];
                const isSelected = selectedActorCountry === code;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedActorCountry("");
                        setSelectedActorPerson(null);
                      } else {
                        setSelectedActorCountry(code);
                        setSelectedActorPerson(null);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-600/30 border-amber-500 text-white shadow-md shadow-amber-600/20"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{countryFlag(code)}</span>
                    <span>{data.country}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                );
              })}
            </div>

            {/* If an actor country is selected: Show leading actors & option to filter by all or individual actor */}
            {selectedActorCountry && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Elenco destacado de {countryFlag(selectedActorCountry)} {countryName(selectedActorCountry)}:
                  </span>
                  <button
                    onClick={() => setSelectedActorPerson(null)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                      !selectedActorPerson
                        ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20"
                        : "bg-black/40 text-amber-200 border-amber-500/30 hover:bg-black/60"
                    }`}
                  >
                    ✨ Todos los actores ({getActorsForCountry(selectedActorCountry).length})
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {getActorsForCountry(selectedActorCountry).map((actor) => {
                    const isChosen = selectedActorPerson?.id === actor.id;
                    return (
                      <button
                        key={actor.id}
                        onClick={() => setSelectedActorPerson(isChosen ? null : actor)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition ${
                          isChosen
                            ? "bg-amber-500 border-amber-300 text-black font-bold shadow-md shadow-amber-500/30"
                            : "bg-black/40 border-white/10 text-zinc-300 hover:text-white hover:bg-black/60"
                        }`}
                        title={actor.known_for?.length ? `Conocido por: ${actor.known_for.join(", ")}` : undefined}
                      >
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, "w185")}
                            alt={actor.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-zinc-400" />
                        )}
                        <span>{actor.name}</span>
                        {isChosen && <Check className="w-3 h-3 text-black" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Rating & Runtime & Language Controls */}
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
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>Películas encontradas ({visibleMovies.length})</span>
              </h2>
              {watchedFilter !== "all" && (
                <span className="text-xs text-zinc-400">
                  {watchedFilter === "unwatched" ? `Ocultando ${loadedWatchedCount} ya vistas` : `Mostrando solo ${loadedWatchedCount} ya vistas`}
                </span>
              )}
            </div>
            {visibleMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {visibleMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : !loading ? (
              watchedFilter === "unwatched" && movies.length > 0 ? (
                <div className="p-8 text-center bg-[#141420] border border-amber-500/20 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    ¡Ya has visto todas las {movies.length} películas encontradas en esta búsqueda!
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Puedes desactivar el filtro para volver a verlas o buscar otro término.
                  </p>
                  <button
                    onClick={() => setWatchedFilter("all")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                  >
                    Ver todas las películas
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl text-zinc-400 text-sm">
                  No se encontraron películas para esta búsqueda.
                </div>
              )
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
              <span>
                {selectedActorCountry
                  ? `Actores destacados de ${countryFlag(selectedActorCountry)} ${countryName(selectedActorCountry)}`
                  : "Directores, Actores y Guionistas"}{" "}
                ({people.length})
              </span>
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
            watchedFilter === "unwatched" && movies.length > 0 ? (
              <div className="text-center py-16 bg-[#141420]/80 rounded-3xl border border-amber-500/20 p-8 space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <EyeOff className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    ¡Ya has visto todas las {movies.length} películas cargadas en esta vista!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    Tienes activo el filtro <strong className="text-amber-300 font-semibold">&quot;Ocultar ya vistas&quot;</strong>. Carga más resultados de TMDB para descubrir títulos pendientes o desactiva el filtro.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {page < totalPages && (
                    <button
                      onClick={loadMore}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Cargar más resultados</span>
                    </button>
                  )}
                  <button
                    onClick={() => setWatchedFilter("all")}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    Mostrar todas ({movies.length})
                  </button>
                </div>
              </div>
            ) : watchedFilter === "watched" && movies.length > 0 ? (
              <div className="text-center py-16 bg-[#141420]/80 rounded-3xl border border-emerald-500/20 p-8 space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    Aún no has marcado como vista ninguna de estas {movies.length} películas
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    Puedes marcar las que ya viste haciendo clic en el botón <strong className="text-white">+</strong> de cada película, o cambiar el filtro para ver todo el catálogo.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setWatchedFilter("all")}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    Mostrar todas las películas
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
                <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No se encontraron películas</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                  Prueba relajando algunos filtros aplicados o buscando otro título.
                </p>
              </div>
            )
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
