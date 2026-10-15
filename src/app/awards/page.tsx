"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Award,
  Calendar,
  Search,
  Sparkles,
  Check,
  CheckCircle2,
  Film,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  Bookmark,
  Crown,
  Clapperboard,
  Layers,
  Filter,
  Medal,
  RefreshCw,
  Clock
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { fetchAllUserLogs } from "@/lib/services/logs";
import { getImageUrl } from "@/lib/tmdb/client";
import {
  fetchOscarsSummary,
  fetchOscarEdition,
  fetchOscarCategoryHistory,
  searchOscars,
  resolveFilmPoster,
  OscarCategory,
  OscarEditionSummary,
  OscarEditionDetail,
  OscarWinnerHistoryItem,
  OscarAwardCategoryGroup,
  OscarNomineeItem
} from "@/lib/services/oscars";

type ViewMode = "by_year" | "by_category" | "search";

/**
 * Reusable dynamic poster component with automatic on-demand TMDB resolution
 */
function FilmPoster({
  film,
  filmId,
  initialPoster,
  size = "large",
  className = ""
}: {
  film: string;
  filmId?: string;
  initialPoster?: string | null;
  size?: "large" | "medium" | "small";
  className?: string;
}) {
  const [posterPath, setPosterPath] = useState<string | null>(initialPoster || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPoster) {
      setPosterPath(initialPoster);
      return;
    }
    let isCancelled = false;
    async function loadPoster() {
      setLoading(true);
      try {
        const res = await resolveFilmPoster(film, filmId);
        if (!isCancelled && res.poster_path) {
          setPosterPath(res.poster_path);
        }
      } catch (e) {
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadPoster();
    return () => {
      isCancelled = true;
    };
  }, [film, filmId, initialPoster]);

  const sizeStyles = {
    large: "w-28 sm:w-36 aspect-[2/3]",
    medium: "w-16 sm:w-20 aspect-[2/3]",
    small: "w-10 sm:w-12 aspect-[2/3]"
  };

  if (posterPath) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-black/50 border border-white/10 shrink-0 shadow-md ${sizeStyles[size]} ${className}`}>
        <img
          src={getImageUrl(posterPath, size === "large" ? "w500" : "w185")}
          alt={film}
          className="w-full h-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shrink-0 flex flex-col items-center justify-center p-1 text-center ${sizeStyles[size]} ${className}`}
      title={film}
    >
      <Clapperboard className={`${size === "small" ? "w-4 h-4 text-zinc-600" : "w-6 h-6 text-zinc-500"} mb-1`} />
      <span className="text-[9px] text-zinc-400 font-bold line-clamp-2 px-1 leading-tight">
        {film}
      </span>
    </div>
  );
}

function AwardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { openLogModal } = useApp();

  // Navigation mode
  const initialMode = (searchParams.get("mode") as ViewMode) || (searchParams.get("category") ? "by_category" : "by_year");
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  // By Year state
  const initialYear = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : 2026;
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [currentEdition, setCurrentEdition] = useState<OscarEditionDetail | null>(null);
  const [loadingEdition, setLoadingEdition] = useState(false);
  const [filterYearCategory, setFilterYearCategory] = useState<string>("all");

  // By Category state
  const initialCat = searchParams.get("category") || "best_picture";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [categoryHistory, setCategoryHistory] = useState<{
    category: OscarCategory;
    winners: OscarWinnerHistoryItem[];
  } | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Global Search state
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{
    matchedEditions: OscarEditionSummary[];
    matchedWinners: any[];
    totalMatches: number;
  } | null>(null);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  // Metadata: summaries and categories
  const [summaryEditions, setSummaryEditions] = useState<OscarEditionSummary[]>([]);
  const [categoriesList, setCategoriesList] = useState<OscarCategory[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // User Watched Movies tracker
  const [watchedTmdbIds, setWatchedTmdbIds] = useState<Set<number>>(new Set());
  const [watchedTitles, setWatchedTitles] = useState<Set<string>>(new Set());

  // Normalize string helper for matching
  const normalize = (str: string) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // 1. Load User Watched History (from Supabase or Guest LocalStorage)
  useEffect(() => {
    async function loadWatchedData() {
      try {
        if (user) {
          const logsData = await fetchAllUserLogs(user.id, { select: "tmdb_id, movie:movies(title)" });
          if (logsData) {
            const idSet = new Set<number>();
            const titleSet = new Set<string>();
            logsData.forEach((l: any) => {
              if (l.tmdb_id) idSet.add(l.tmdb_id);
              if (l.movie?.title) titleSet.add(normalize(l.movie.title));
            });
            setWatchedTmdbIds(idSet);
            setWatchedTitles(titleSet);
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          const idSet = new Set<number>();
          const titleSet = new Set<string>();
          guestLogs.forEach((l: any) => {
            if (l.tmdb_id) idSet.add(l.tmdb_id);
            if (l.title) titleSet.add(normalize(l.title));
          });
          setWatchedTmdbIds(idSet);
          setWatchedTitles(titleSet);
        }
      } catch (e) {
        console.warn("Error loading user watched logs:", e);
      }
    }
    loadWatchedData();

    const handleLogUpdated = () => loadWatchedData();
    window.addEventListener("filmtracker_log_updated", handleLogUpdated);
    return () => window.removeEventListener("filmtracker_log_updated", handleLogUpdated);
  }, [user, isGuest]);

  // Check if a film has been watched by the user
  const isMovieWatched = (filmTitle: string, tmdbId?: number | null) => {
    if (tmdbId && watchedTmdbIds.has(tmdbId)) return true;
    if (!filmTitle) return false;
    const clean = normalize(filmTitle.split("|")[0]);
    if (watchedTitles.has(clean)) return true;
    return false;
  };

  // 2. Load Initial Summary of 98 Editions & Categories
  useEffect(() => {
    let isCancelled = false;
    async function loadInitialData() {
      setLoadingInitial(true);
      try {
        const data = await fetchOscarsSummary();
        if (!isCancelled) {
          setSummaryEditions(data.editions || []);
          setCategoriesList(data.categories || []);
        }
      } catch (err) {
        console.error("Error loading Oscars summary:", err);
      } finally {
        if (!isCancelled) setLoadingInitial(false);
      }
    }
    loadInitialData();
    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Load Specific Year / Edition
  useEffect(() => {
    if (viewMode !== "by_year") return;
    let isCancelled = false;
    async function loadEdition() {
      setLoadingEdition(true);
      try {
        const data = await fetchOscarEdition(selectedYear);
        if (!isCancelled && data.edition) {
          setCurrentEdition(data.edition);
        }
      } catch (err) {
        console.error("Error loading Oscar edition:", err);
      } finally {
        if (!isCancelled) setLoadingEdition(false);
      }
    }
    loadEdition();
    return () => {
      isCancelled = true;
    };
  }, [selectedYear, viewMode]);

  // 4. Load Specific Category History (Year-by-Year)
  useEffect(() => {
    if (viewMode !== "by_category") return;
    let isCancelled = false;
    async function loadCat() {
      setLoadingCategory(true);
      try {
        const data = await fetchOscarCategoryHistory(selectedCategory);
        if (!isCancelled) {
          setCategoryHistory(data);
        }
      } catch (err) {
        console.error("Error loading category history:", err);
      } finally {
        if (!isCancelled) setLoadingCategory(false);
      }
    }
    loadCat();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, viewMode]);

  // Debounce global search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearchInput);
    }, 350);
    return () => clearTimeout(handler);
  }, [globalSearchInput]);

  // 5. Execute Global Search
  useEffect(() => {
    if (!debouncedGlobalSearch.trim()) {
      setSearchResults(null);
      return;
    }
    let isCancelled = false;
    async function runSearch() {
      setSearchingGlobal(true);
      try {
        const data = await searchOscars(debouncedGlobalSearch);
        if (!isCancelled) {
          setSearchResults(data);
          setViewMode("search");
        }
      } catch (err) {
        console.error("Search Oscars error:", err);
      } finally {
        if (!isCancelled) setSearchingGlobal(false);
      }
    }
    runSearch();
    return () => {
      isCancelled = true;
    };
  }, [debouncedGlobalSearch]);

  // Navigation handlers
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setViewMode("by_year");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setViewMode("by_category");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Next and Previous Year handlers
  const currentIndex = summaryEditions.findIndex((e) => e.year === selectedYear);
  const prevEdition = currentIndex > 0 ? summaryEditions[currentIndex - 1] : null;
  const nextEdition = currentIndex < summaryEditions.length - 1 ? summaryEditions[currentIndex + 1] : null;

  // Filtered categories for selected year
  const displayedCategories = useMemo(() => {
    if (!currentEdition) return [];
    if (filterYearCategory === "all") return currentEdition.categories;
    return currentEdition.categories.filter((c) => c.categoryId === filterYearCategory);
  }, [currentEdition, filterYearCategory]);

  // Filtered category history items
  const filteredCategoryWinners = useMemo(() => {
    if (!categoryHistory) return [];
    if (!categorySearchQuery.trim()) return categoryHistory.winners;
    const q = normalize(categorySearchQuery);
    return categoryHistory.winners.filter(
      (w) =>
        normalize(w.winner?.film).includes(q) ||
        normalize(w.winner?.name).includes(q) ||
        String(w.year).includes(q) ||
        String(w.ceremony) === q ||
        w.nominees?.some((n) => normalize(n.film).includes(q) || normalize(n.name).includes(q))
    );
  }, [categoryHistory, categorySearchQuery]);

  // Category Watched Stats
  const categoryWatchedCount = useMemo(() => {
    if (!categoryHistory) return 0;
    return categoryHistory.winners.filter((w) => isMovieWatched(w.winner?.film, w.winner?.tmdb_id)).length;
  }, [categoryHistory, watchedTmdbIds, watchedTitles]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1c1810] via-[#141420] to-[#0e0e17] border border-amber-500/25 shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
              <Trophy className="w-4 h-4 fill-amber-400" />
              <span>Palmarés Cinematográfico Oficial · Academia de Hollywood</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Premios Oscar</span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                98 Ediciones (1929 – 2026)
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Explora las 98 ceremonias de la historia del cine con todos sus premios competitivos.
              Observa cada película ganadora con su póster y a todas las nominadas que compitieron con ella en esa terna.
            </p>
          </div>

          {/* Quick Stats Counter */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 shrink-0">
            <div className="text-center px-2">
              <span className="block text-2xl sm:text-3xl font-black text-amber-400">98</span>
              <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Ceremonias</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-center px-2">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">100%</span>
              <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Películas</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-center px-2">
              <span className="block text-2xl sm:text-3xl font-black text-purple-400">0</span>
              <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Honorarios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 pointer-events-none" />
          <input
            type="text"
            value={globalSearchInput}
            onChange={(e) => {
              setGlobalSearchInput(e.target.value);
              if (e.target.value.trim()) setViewMode("search");
              else if (viewMode === "search") setViewMode("by_year");
            }}
            placeholder="Buscar por año (ej. 1994, 2024), película (Oppenheimer, El Padrino), director o actor en los 98 Oscars..."
            className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-[#141420] border border-amber-500/20 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-xl transition text-sm sm:text-base font-medium"
          />
          {globalSearchInput && (
            <button
              onClick={() => {
                setGlobalSearchInput("");
                setViewMode("by_year");
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141420] border border-white/5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setViewMode("by_year");
            setGlobalSearchInput("");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            viewMode === "by_year"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Explorar por Año (1929 – 2026)</span>
        </button>

        <button
          onClick={() => {
            setViewMode("by_category");
            setGlobalSearchInput("");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            viewMode === "by_category"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Historial por Premio / Categoría</span>
        </button>

        {globalSearchInput && (
          <button
            onClick={() => setViewMode("search")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
              viewMode === "search"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Resultados de Búsqueda</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODE 1: BY YEAR / EDITION (1929 to 2026)                 */}
      {/* ======================================================== */}
      {viewMode === "by_year" && (
        <div className="space-y-6">
          {/* Year Navigator & Decade Quick Picker */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Previous Edition button */}
              <button
                disabled={!prevEdition}
                onClick={() => prevEdition && handleSelectYear(prevEdition.year)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{prevEdition ? `${prevEdition.year} (${prevEdition.editionLabel})` : "Inicio"}</span>
              </button>

              {/* Central Year Selector Dropdown */}
              <div className="flex items-center gap-3 justify-center">
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Edición:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => handleSelectYear(parseInt(e.target.value, 10))}
                  className="px-4 py-2.5 rounded-2xl bg-black/60 border border-amber-500/40 text-amber-300 text-sm sm:text-base font-extrabold focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner"
                >
                  {summaryEditions.map((ed) => (
                    <option key={ed.ceremony} value={ed.year} className="bg-[#141420] text-white">
                      {ed.year} · {ed.editionLabel} {ed.bestPicture ? `(${ed.bestPicture.film})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next Edition button */}
              <button
                disabled={!nextEdition}
                onClick={() => nextEdition && handleSelectYear(nextEdition.year)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <span>{nextEdition ? `${nextEdition.year} (${nextEdition.editionLabel})` : "Fin"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Decades Navigator Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0">Saltar a:</span>
              {[
                { label: "2026 (98ª)", year: 2026 },
                { label: "2024 (96ª)", year: 2024 },
                { label: "2020s", year: 2020 },
                { label: "2010s", year: 2010 },
                { label: "2000s", year: 2000 },
                { label: "1990s", year: 1994 },
                { label: "1980s", year: 1984 },
                { label: "1970s", year: 1974 },
                { label: "1960s", year: 1964 },
                { label: "1950s", year: 1954 },
                { label: "1940s", year: 1944 },
                { label: "1930s", year: 1934 },
                { label: "1929 (1ª)", year: 1929 },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => handleSelectYear(pill.year)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition shrink-0 ${
                    selectedYear === pill.year
                      ? "bg-amber-500 text-black border-amber-400 font-bold"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Year Best Picture Highlight Banner */}
          {currentEdition?.bestPicture && (
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#181826] to-[#141420] border border-amber-500/30 overflow-hidden shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Poster */}
                <FilmPoster
                  film={currentEdition.bestPicture.film}
                  filmId={currentEdition.bestPicture.filmId}
                  initialPoster={currentEdition.bestPicture.poster_path}
                  size="large"
                />

                {/* Details */}
                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/30">
                      <Trophy className="w-3.5 h-3.5 fill-black" />
                      Mejor Película · {currentEdition.year}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold">
                      {currentEdition.editionLabel} ({currentEdition.yearRaw})
                    </span>
                    {isMovieWatched(currentEdition.bestPicture.film, currentEdition.bestPicture.tmdb_id) && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ¡La viste!
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {currentEdition.bestPicture.title_es || currentEdition.bestPicture.film}
                  </h2>

                  {currentEdition.bestPicture.producer && (
                    <p className="text-xs sm:text-sm text-zinc-400">
                      <span className="text-zinc-500 font-semibold">Producción:</span> {currentEdition.bestPicture.producer}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    {currentEdition.bestPicture.tmdb_id ? (
                      <Link
                        href={`/movie/${currentEdition.bestPicture.tmdb_id}`}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ficha en FilmTracker</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/search?q=${encodeURIComponent(currentEdition.bestPicture.film)}`}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Buscar en Catálogo</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar for this Year */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141420] border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Filtrar categoría:</span>
              <select
                value={filterYearCategory}
                onChange={(e) => setFilterYearCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#191928] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Todas las categorías ({currentEdition?.categories.length || 0})</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.nameEs}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Mostrando {displayedCategories.length} categorías competitivas de {selectedYear}
            </span>
          </div>

          {/* Category Cards: Winner prominent + Nominees smaller & dimmed in the same card */}
          {loadingEdition ? (
            <div className="text-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Cargando premios y nominados de la {selectedYear}...</p>
            </div>
          ) : displayedCategories.length > 0 ? (
            <div className="space-y-6">
              {displayedCategories.map((group) => {
                const winnerWatched = isMovieWatched(group.winner?.film || "", group.winner?.tmdb_id);
                return (
                  <div
                    key={group.category}
                    className="p-5 sm:p-7 rounded-3xl bg-[#141420] border border-white/10 hover:border-amber-500/30 transition shadow-xl space-y-5"
                  >
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 text-amber-400 text-sm sm:text-base font-extrabold tracking-wide">
                        <span className="text-lg">{group.categoryIcon || "🏆"}</span>
                        <span>{group.categoryEs}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                        {1 + group.nominees.length} candidatas
                      </span>
                    </div>

                    {/* Section A: WINNER (Prominent Golden Card) */}
                    {group.winner && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#181826] to-[#141420] border border-amber-500/40 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-lg shadow-amber-950/20">
                        {/* Winner Poster */}
                        <FilmPoster
                          film={group.winner.film}
                          filmId={group.winner.filmId}
                          initialPoster={group.winner.poster_path}
                          size="medium"
                        />

                        {/* Winner Details */}
                        <div className="space-y-1.5 flex-1 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/25">
                              <Crown className="w-3 h-3 fill-black" />
                              Ganadora
                            </span>
                            {winnerWatched && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                ¡Vista!
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-white">
                            {group.winner.film}
                          </h3>

                          {group.winner.name && (
                            <p className="text-xs sm:text-sm font-bold text-amber-300">
                              {group.winner.name}
                            </p>
                          )}

                          {group.winner.detail && (
                            <p className="text-[11px] sm:text-xs text-zinc-300 line-clamp-2">
                              {group.winner.detail}
                            </p>
                          )}
                        </div>

                        {/* Action on Winner */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                          {group.winner.tmdb_id ? (
                            <Link
                              href={`/movie/${group.winner.tmdb_id}`}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Ficha</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/search?q=${encodeURIComponent(group.winner.film)}`}
                              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Buscar</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Section B: NOMINEES (Smaller & Dimmer / Tone Apagado) */}
                    {group.nominees.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-zinc-400" />
                          Películas nominadas que compitieron por este premio ({group.nominees.length}):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                          {group.nominees.map((nominee, idx) => {
                            const nomWatched = isMovieWatched(nominee.film, nominee.tmdb_id);
                            return (
                              <div
                                key={`${nominee.film}-${idx}`}
                                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition flex items-center gap-3 opacity-80 hover:opacity-100 group"
                              >
                                {/* Small Poster */}
                                <FilmPoster
                                  film={nominee.film}
                                  filmId={nominee.filmId}
                                  initialPoster={nominee.poster_path}
                                  size="small"
                                />

                                {/* Info */}
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-semibold text-zinc-300 truncate group-hover:text-white transition" title={nominee.film}>
                                      {nominee.film}
                                    </h4>
                                    {nomWatched && (
                                      <span className="text-emerald-400 shrink-0" title="Película vista">
                                        <CheckCircle2 className="w-3 h-3" />
                                      </span>
                                    )}
                                  </div>
                                  {nominee.name && (
                                    <p className="text-[10px] text-zinc-400 truncate" title={nominee.name}>
                                      {nominee.name}
                                    </p>
                                  )}
                                  {nominee.detail && (
                                    <p className="text-[10px] text-zinc-400 truncate" title={nominee.detail}>
                                      {nominee.detail}
                                    </p>
                                  )}
                                </div>

                                {/* Quick Search link */}
                                <Link
                                  href={nominee.tmdb_id ? `/movie/${nominee.tmdb_id}` : `/search?q=${encodeURIComponent(nominee.film)}`}
                                  className="text-zinc-400 hover:text-white p-1 rounded transition shrink-0"
                                  title="Ver película"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
              <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No hay premios para este filtro</h3>
              <p className="text-sm text-zinc-400 mt-1">Prueba cambiando de categoría.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: BY CATEGORY / AWARD (Year by Year 1929-2026)      */}
      {/* ======================================================== */}
      {viewMode === "by_category" && (
        <div className="space-y-6">
          {/* Categories Selector Carousel / Chips */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Elige una estatuilla para ver todos sus ganadores y nominadas año por año:
            </span>

            <div className="flex flex-wrap gap-2">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                      isSelected
                        ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.nameEs}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Banner & Progress Tracker */}
          {categoryHistory && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/30 via-[#181826] to-[#141420] border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>{categoryHistory.category.icon}</span>
                    <span>Palmarés Histórico de la Academia</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {categoryHistory.category.nameEs}
                  </h2>
                  {categoryHistory.category.description && (
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                      {categoryHistory.category.description}
                    </p>
                  )}
                </div>

                {/* Watched Progress in this Category */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center sm:text-right shrink-0">
                  <span className="block text-xl sm:text-2xl font-black text-emerald-400">
                    {categoryWatchedCount} / {categoryHistory.winners.length}
                  </span>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                    Películas ganadoras vistas ({categoryHistory.winners.length ? Math.round((categoryWatchedCount / categoryHistory.winners.length) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Search inside this category */}
              <div className="pt-2">
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder={`Filtrar ganadores o nominadas de ${categoryHistory.category.nameEs}...`}
                    className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  />
                  {categorySearchQuery && (
                    <button
                      onClick={() => setCategorySearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chronological Year-by-Year Winners Timeline with Nominees */}
          {loadingCategory ? (
            <div className="text-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Cargando ganadores históricos y nominadas...</p>
            </div>
          ) : filteredCategoryWinners.length > 0 ? (
            <div className="space-y-4">
              {filteredCategoryWinners.map((entry, idx) => {
                const watched = isMovieWatched(entry.winner?.film || "", entry.winner?.tmdb_id);
                return (
                  <div
                    key={`${entry.ceremony}-${entry.winner?.film}-${idx}`}
                    className="p-5 sm:p-6 rounded-3xl bg-[#141420] border border-white/10 hover:border-amber-500/30 transition space-y-4 shadow-lg group"
                  >
                    {/* Top Row: Year, Winner Poster & Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Year Badge */}
                        <button
                          onClick={() => handleSelectYear(entry.year)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black transition text-center shrink-0"
                          title={`Ir a la ceremonia completa ${entry.year}`}
                        >
                          <span className="block text-base font-black leading-none">{entry.year}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider">{entry.editionLabel}</span>
                        </button>

                        {/* Winner Poster */}
                        <FilmPoster
                          film={entry.winner?.film || ""}
                          filmId={entry.winner?.filmId}
                          initialPoster={entry.winner?.poster_path}
                          size="medium"
                        />

                        {/* Film & Winner Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Crown className="w-3 h-3 fill-black" />
                              Ganadora
                            </span>
                            {watched && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                ¡Vista!
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition">
                            {entry.winner?.film}
                          </h3>

                          {entry.winner?.name && (
                            <p className="text-xs font-semibold text-amber-300">
                              {entry.winner.name}
                            </p>
                          )}
                          {entry.winner?.detail && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                              {entry.winner.detail}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Link */}
                      <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0">
                        <Link
                          href={entry.winner?.tmdb_id ? `/movie/${entry.winner.tmdb_id}` : `/search?q=${encodeURIComponent(entry.winner?.film || "")}`}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <span>Ficha</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Row: Nominees (Smaller & Dimmer tone) */}
                    {entry.nominees && entry.nominees.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Nominadas ese año ({entry.nominees.length}):
                        </span>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {entry.nominees.map((nom, nIdx) => {
                            const isNomWatched = isMovieWatched(nom.film, nom.tmdb_id);
                            return (
                              <div
                                key={`${nom.film}-${nIdx}`}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 shrink-0 opacity-75 hover:opacity-100 transition"
                              >
                                <FilmPoster
                                  film={nom.film}
                                  filmId={nom.filmId}
                                  initialPoster={nom.poster_path}
                                  size="small"
                                />
                                <div className="space-y-0.5 text-left max-w-[140px]">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] font-semibold text-zinc-300 truncate block">
                                      {nom.film}
                                    </span>
                                    {isNomWatched && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                                  </div>
                                  {nom.name && (
                                    <span className="text-[10px] text-zinc-400 truncate block">
                                      {nom.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
              <Award className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No se encontraron ganadores</h3>
              <p className="text-sm text-zinc-400 mt-1">Prueba con otro término de búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: SEARCH RESULTS ACROSS ALL 98 EDITIONS             */}
      {/* ======================================================== */}
      {viewMode === "search" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              <span>Resultados para &quot;{debouncedGlobalSearch}&quot; ({searchResults?.totalMatches || 0})</span>
            </h2>
            <button
              onClick={() => {
                setGlobalSearchInput("");
                setViewMode("by_year");
              }}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Volver al explorador</span>
            </button>
          </div>

          {searchingGlobal ? (
            <div className="text-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Buscando en las 98 ediciones...</p>
            </div>
          ) : searchResults && searchResults.totalMatches > 0 ? (
            <div className="space-y-6">
              {/* Matched Editions */}
              {searchResults.matchedEditions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Ediciones encontradas:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.matchedEditions.map((ed) => (
                      <button
                        key={ed.ceremony}
                        onClick={() => handleSelectYear(ed.year)}
                        className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black transition flex items-center gap-2 font-bold text-sm"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{ed.year} · {ed.editionLabel}</span>
                        {ed.bestPicture && <span className="text-xs font-normal">({ed.bestPicture.film})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Winners */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Premios y Ganadores coincidentes:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.matchedWinners.map((winner, idx) => {
                    const watched = isMovieWatched(winner.winner?.film || "", winner.winner?.tmdb_id);
                    return (
                      <div
                        key={`${winner.ceremony}-${winner.winner?.film}-${idx}`}
                        className="p-4 rounded-2xl bg-[#141420] border border-white/5 hover:border-amber-500/30 transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                              <span>{winner.categoryIcon || "🏆"}</span>
                              <span>{winner.categoryEs}</span>
                            </span>
                            <button
                              onClick={() => handleSelectYear(winner.year)}
                              className="text-[11px] font-bold text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
                            >
                              {winner.year} · {winner.editionLabel}
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <FilmPoster
                              film={winner.winner?.film || ""}
                              filmId={winner.winner?.filmId}
                              initialPoster={winner.winner?.poster_path}
                              size="medium"
                            />
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className="text-base font-bold text-white truncate">{winner.winner?.film}</h4>
                              {winner.winner?.name && <p className="text-xs font-semibold text-amber-200 truncate">{winner.winner.name}</p>}
                              {winner.winner?.detail && <p className="text-[11px] text-zinc-400 line-clamp-1">{winner.winner.detail}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                          {watched ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Vista</span>
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-500">No registrada</span>
                          )}

                          <button
                            onClick={() => handleSelectYear(winner.year)}
                            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <span>Ver ceremonia completa</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8">
              <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No se encontraron resultados</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Prueba buscando por año (ej: 1999), título en inglés o nombre de una celebridad.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AwardsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Cargando Enciclopedia de los Premios Oscar...</span>
        </div>
      }
    >
      <AwardsContent />
    </Suspense>
  );
}
