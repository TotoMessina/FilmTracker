"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Star, 
  RotateCcw, 
  Edit3, 
  Ticket, 
  Trash2, 
  Plus, 
  Calendar,
  Clock,
  Tv,
  Film,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Filter,
  Check
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatDate, formatRuntime, getRatingColor, getPlatformBadge } from "@/lib/utils/formatting";

type SortOption = 
  | "watched_desc" 
  | "watched_asc" 
  | "rating_desc" 
  | "rating_asc" 
  | "title_asc" 
  | "title_desc" 
  | "release_desc" 
  | "release_asc" 
  | "runtime_desc";

export default function DiaryPage() {
  const { user, isGuest } = useAuth();
  const { openLogModal, openCinemaTicket, lastUpdated, onLogSaved } = useApp();

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("watched_desc");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "rewatch" | "first_watch" | "cinema" | "reviewed">("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    async function fetchDiary() {
      setLoading(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id)
            .order("watched_at", { ascending: false, nullsFirst: false });

          if (!error && data) {
            setLogs(data as Log[]);
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setLogs(guestLogs);
        }
      } catch (err) {
        console.warn("Error fetching diary logs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDiary();
  }, [user, isGuest, lastUpdated]);

  const handleDelete = async (logId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta entrada del diario?")) return;

    if (user) {
      await supabase.from("logs").delete().eq("id", logId);
    } else {
      const updated = logs.filter((l) => l.id !== logId);
      localStorage.setItem("filmtracker_guest_logs", JSON.stringify(updated));
    }
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    onLogSaved();
  };

  // Dynamic filter options extracted from user logs
  const availablePlatforms = useMemo(() => {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.platform && log.platform.trim()) {
        const plat = log.platform.trim();
        counts.set(plat, (counts.get(plat) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [logs]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    logs.forEach((log) => {
      if (log.watched_at && log.watched_at.length >= 4) {
        years.add(log.watched_at.slice(0, 4));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [logs]);

  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    logs.forEach((log) => {
      const genres = log.movie?.genres || [];
      genres.forEach((g: any) => {
        const name = typeof g === "string" ? g : g?.name;
        if (name) genreSet.add(name);
      });
    });
    return Array.from(genreSet).sort((a, b) => a.localeCompare(b, "es"));
  }, [logs]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedPlatform !== "all") count++;
    if (selectedRating !== "all") count++;
    if (selectedType !== "all") count++;
    if (selectedYear !== "all") count++;
    if (selectedGenre !== "all") count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedPlatform, selectedRating, selectedType, selectedYear, selectedGenre, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("all");
    setSelectedRating("all");
    setSelectedType("all");
    setSelectedYear("all");
    setSelectedGenre("all");
    setSortBy("watched_desc");
  };

  // Filtered & Sorted logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      result = result.filter((log) => {
        const title = (log.movie?.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const review = (log.review || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const notes = (log.notes || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const format = (log.format || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return title.includes(q) || review.includes(q) || notes.includes(q) || format.includes(q);
      });
    }

    // 2. Platform Filter
    if (selectedPlatform !== "all") {
      result = result.filter((log) => {
        if (!log.platform) return false;
        return log.platform.toLowerCase() === selectedPlatform.toLowerCase();
      });
    }

    // 3. Rating Filter
    if (selectedRating !== "all") {
      result = result.filter((log) => {
        const r = log.rating;
        if (selectedRating === "unrated") return r === null || r === undefined;
        if (r === null || r === undefined) return false;
        if (selectedRating === "masterpiece") return r >= 9;
        if (selectedRating === "great") return r >= 7 && r < 9;
        if (selectedRating === "regular") return r >= 5 && r < 7;
        if (selectedRating === "low") return r < 5;
        return true;
      });
    }

    // 4. Type Filter
    if (selectedType !== "all") {
      result = result.filter((log) => {
        if (selectedType === "rewatch") return !!log.is_rewatch;
        if (selectedType === "first_watch") return !log.is_rewatch;
        if (selectedType === "cinema") return log.platform?.toLowerCase() === "cine";
        if (selectedType === "reviewed") return !!log.review && log.review.trim().length > 0;
        return true;
      });
    }

    // 5. Watched Year Filter
    if (selectedYear !== "all") {
      result = result.filter((log) => {
        if (!log.watched_at) return false;
        return log.watched_at.slice(0, 4) === selectedYear;
      });
    }

    // 6. Genre Filter
    if (selectedGenre !== "all") {
      result = result.filter((log) => {
        const genres = log.movie?.genres || [];
        return genres.some((g: any) => {
          const name = typeof g === "string" ? g : g?.name;
          return name?.toLowerCase() === selectedGenre.toLowerCase();
        });
      });
    }

    // 7. Sorting
    result.sort((a, b) => {
      if (sortBy === "watched_desc") {
        const dateA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
        const dateB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "watched_asc") {
        const dateA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
        const dateB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "rating_desc") {
        const rA = a.rating ?? -1;
        const rB = b.rating ?? -1;
        return rB - rA;
      }
      if (sortBy === "rating_asc") {
        const rA = a.rating ?? 999;
        const rB = b.rating ?? 999;
        return rA - rB;
      }
      if (sortBy === "title_asc") {
        const tA = (a.movie?.title || "").toLowerCase();
        const tB = (b.movie?.title || "").toLowerCase();
        return tA.localeCompare(tB, "es");
      }
      if (sortBy === "title_desc") {
        const tA = (a.movie?.title || "").toLowerCase();
        const tB = (b.movie?.title || "").toLowerCase();
        return tB.localeCompare(tA, "es");
      }
      if (sortBy === "release_desc") {
        const rA = a.movie?.release_date ? new Date(a.movie.release_date).getTime() : 0;
        const rB = b.movie?.release_date ? new Date(b.movie.release_date).getTime() : 0;
        return rB - rA;
      }
      if (sortBy === "release_asc") {
        const rA = a.movie?.release_date ? new Date(a.movie.release_date).getTime() : 9999999999999;
        const rB = b.movie?.release_date ? new Date(b.movie.release_date).getTime() : 9999999999999;
        return rA - rB;
      }
      if (sortBy === "runtime_desc") {
        const runA = a.movie?.runtime ?? 0;
        const runB = b.movie?.runtime ?? 0;
        return runB - runA;
      }
      return 0;
    });

    return result;
  }, [logs, searchQuery, selectedPlatform, selectedRating, selectedType, selectedYear, selectedGenre, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Diario de Películas
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
              {logs.length}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Tu registro cronológico de todas las películas que has visto.
          </p>
        </div>

        <Link
          href="/search"
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Película</span>
        </Link>
      </div>

      {!user ? (
        <div className="text-center py-16 bg-[#141424] rounded-3xl border border-white/10 p-8 max-w-xl mx-auto space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Tu Diario de Cine Personal</h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              Inicia sesión o crea tu cuenta gratuita para comenzar a registrar las películas que ves, calificarlas de 0 a 10, escribir reseñas y coleccionar tickets de cine retro.
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
          <span>Cargando tu diario cinéfilo...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto space-y-4">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Tu diario está vacío</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Comienza a registrar las películas que ves con tus calificaciones, reseñas y recuerdos personales.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buscar una película para registrar</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar: Search, Sort & View Mode */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141420] p-3 rounded-2xl border border-white/5 shadow-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, reseña, notas o formato..."
                className="w-full pl-10 pr-9 py-2.5 bg-black/40 border border-white/10 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 transition outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-full transition"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Sort Dropdown */}
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-red-500 mr-2 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer pr-1"
                >
                  <option value="watched_desc" className="bg-[#141420] text-white">📅 Vistas: Más recientes</option>
                  <option value="watched_asc" className="bg-[#141420] text-white">📅 Vistas: Más antiguas</option>
                  <option value="rating_desc" className="bg-[#141420] text-white">⭐ Nota: Más alta primero</option>
                  <option value="rating_asc" className="bg-[#141420] text-white">⭐ Nota: Más baja primero</option>
                  <option value="title_asc" className="bg-[#141420] text-white">🔤 Título: A → Z</option>
                  <option value="title_desc" className="bg-[#141420] text-white">🔤 Título: Z → A</option>
                  <option value="release_desc" className="bg-[#141420] text-white">🎬 Estreno: Más nuevas</option>
                  <option value="release_asc" className="bg-[#141420] text-white">🎬 Estreno: Más clásicas</option>
                  <option value="runtime_desc" className="bg-[#141420] text-white">⏱️ Duración: Más largas</option>
                </select>
              </div>

              {/* Advanced Filters Toggle Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  showAdvancedFilters || activeFiltersCount > 0
                    ? "bg-red-600/20 text-red-300 border-red-500/40"
                    : "bg-black/40 text-zinc-300 border-white/10 hover:border-white/20"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-red-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Vista Lista detallada"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-red-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Vista Cuadrícula de pósters"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Chips (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", label: "Todas" },
              { id: "cinema", label: "🎟️ En Cine" },
              { id: "rewatch", label: "🔁 Rewatches" },
              { id: "first_watch", label: "👁️ Primeras Vistas" },
              { id: "reviewed", label: "✍️ Con Reseña" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedType(chip.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  selectedType === chip.id
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "bg-[#141420] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {chip.label}
              </button>
            ))}

            <button
              onClick={() => setSelectedRating(selectedRating === "masterpiece" ? "all" : "masterpiece")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                selectedRating === "masterpiece"
                  ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20"
                  : "bg-[#141420] text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Obras Maestras (9+)</span>
            </button>
          </div>

          {/* Advanced Filter Panel (Collapsible) */}
          {showAdvancedFilters && (
            <div className="p-4 rounded-2xl bg-[#141420] border border-white/10 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
              {/* Platform Selector */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tv className="w-3 h-3 text-red-500" />
                  <span>Plataforma</span>
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#141420]">Todas las plataformas</option>
                  {availablePlatforms.map((plat) => (
                    <option key={plat} value={plat} className="bg-[#141420]">
                      {plat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Calificación</span>
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#141420]">Todas las calificaciones</option>
                  <option value="masterpiece" className="bg-[#141420]">⭐⭐⭐⭐⭐ Obras Maestras (9.0 - 10)</option>
                  <option value="great" className="bg-[#141420]">⭐⭐⭐⭐ Muy Buenas (7.0 - 8.9)</option>
                  <option value="regular" className="bg-[#141420]">⭐⭐⭐ Regulares (5.0 - 6.9)</option>
                  <option value="low" className="bg-[#141420]">⭐⭐ Bajas (&lt; 5.0)</option>
                  <option value="unrated" className="bg-[#141420]">Sin calificar</option>
                </select>
              </div>

              {/* Watched Year Selector */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>Año de visualización</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#141420]">Todos los años</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year} className="bg-[#141420]">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre Selector */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Film className="w-3 h-3 text-purple-400" />
                  <span>Género</span>
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#141420]">Todos los géneros</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre} className="bg-[#141420]">
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Summary Bar */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 py-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Mostrando <strong className="text-white">{filteredLogs.length}</strong> de{" "}
                <strong className="text-zinc-300">{logs.length}</strong> películas registradas
              </span>

              {/* Active Filter Pills */}
              {selectedPlatform !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  <span>Plataforma: {selectedPlatform}</span>
                  <button onClick={() => setSelectedPlatform("all")} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRating !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  <span>Nota: {selectedRating}</span>
                  <button onClick={() => setSelectedRating("all")} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  <span>Tipo: {selectedType}</span>
                  <button onClick={() => setSelectedType("all")} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedYear !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  <span>Año: {selectedYear}</span>
                  <button onClick={() => setSelectedYear("all")} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedGenre !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  <span>Género: {selectedGenre}</span>
                  <button onClick={() => setSelectedGenre("all")} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-300 font-medium border border-red-500/30">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => setSearchQuery("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-400 hover:text-red-300 font-semibold underline transition cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>

          {/* Diary Results */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-[#141420]/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">No se encontraron películas</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Ningún registro de tu diario coincide con los filtros o término de búsqueda aplicados.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs transition active:scale-95 shadow-md shadow-red-600/25"
              >
                <span>Restablecer filtros</span>
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* List View */
            <div className="bg-[#141420] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="divide-y divide-white/5">
                {filteredLogs.map((log) => {
                  const movie = log.movie;
                  const poster = log.custom_poster_path || movie?.poster_path;
                  const platformBadge = getPlatformBadge(log.platform);
                  const isCinema = log.platform?.toLowerCase() === "cine";

                  return (
                    <div
                      key={log.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                    >
                      {/* Left: Poster + Movie Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/movie/${log.tmdb_id}`}
                          className="w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 hover:border-white/30 transition shadow-md"
                        >
                          <img
                            src={getImageUrl(poster, "w200")}
                            alt={movie?.title || "Póster"}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/movie/${log.tmdb_id}`}
                              className="font-bold text-white hover:text-red-400 transition text-base truncate"
                            >
                              {movie?.title || "Película"}
                            </Link>
                            {movie?.release_date && (
                              <span className="text-xs text-zinc-500">
                                ({movie.release_date.slice(0, 4)})
                              </span>
                            )}
                            {log.is_rewatch && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-rose-300">
                                <RotateCcw className="w-3 h-3" />
                                <span>Rewatch</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              {log.watched_at ? (
                                <>
                                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>{formatDate(log.watched_at)}</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                  <span className="text-zinc-500 italic">Sin fecha específica</span>
                                </>
                              )}
                            </span>
                            {log.platform && (
                              <span className={`px-2 py-0.5 rounded-lg border text-[11px] ${platformBadge.bg}`}>
                                {platformBadge.name}
                              </span>
                            )}
                            {log.format && (
                              <span className="text-zinc-500 text-[11px]">• {log.format}</span>
                            )}
                            {movie?.runtime ? (
                              <span className="text-zinc-500 text-[11px]">• {formatRuntime(movie.runtime)}</span>
                            ) : null}
                          </div>

                          {log.review && (
                            <p className="text-xs text-zinc-300 italic line-clamp-1 max-w-xl">
                              &ldquo;{log.review}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Rating + Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5 shrink-0 border-t border-white/5 pt-2.5 sm:border-0 sm:pt-0">
                        {/* Rating display */}
                        {log.rating !== null && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className={`font-black text-sm ${getRatingColor(log.rating)}`}>
                              {log.rating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        {/* Cinema Ticket Button */}
                        {isCinema && (
                          <button
                            onClick={() => openCinemaTicket(log)}
                            title="Ver Ticket de Cine Retro"
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition shadow-sm"
                          >
                            <Ticket className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          onClick={() =>
                            openLogModal(
                              { id: log.tmdb_id, title: movie?.title || "Película", poster_path: poster },
                              log
                            )
                          }
                          title="Editar registro"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(log.id)}
                          title="Eliminar registro"
                          className="p-2 rounded-xl bg-white/5 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredLogs.map((log) => {
                const movie = log.movie;
                const poster = log.custom_poster_path || movie?.poster_path;
                const isCinema = log.platform?.toLowerCase() === "cine";

                return (
                  <div
                    key={log.id}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#141420] border border-white/5 hover:border-white/20 transition-all duration-300"
                  >
                    {/* Poster container */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 block">
                      <img
                        src={getImageUrl(poster, "w500")}
                        alt={movie?.title || "Póster"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {log.is_rewatch && (
                          <span className="p-1 rounded-md bg-black/80 backdrop-blur-md text-rose-300 border border-white/10" title="Rewatch">
                            <RotateCcw className="w-3 h-3" />
                          </span>
                        )}
                        {isCinema && (
                          <span className="p-1 rounded-md bg-amber-500/80 backdrop-blur-md text-black font-black" title="En Cine">
                            <Ticket className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Top Right Rating Badge */}
                      {log.rating !== null && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-black/80 backdrop-blur-md border border-white/10 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{log.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Bottom Date Badge */}
                      {log.watched_at && (
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-semibold text-zinc-300 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10">
                          <span className="truncate">{formatDate(log.watched_at)}</span>
                          {log.platform && <span className="text-zinc-400 shrink-0 capitalize ml-1">{log.platform}</span>}
                        </div>
                      )}

                      {/* Hover Overlay with Action Buttons */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 z-20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <button
                            onClick={() =>
                              openLogModal(
                                { id: log.tmdb_id, title: movie?.title || "Película", poster_path: poster },
                                log
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition"
                            title="Editar registro"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {isCinema && (
                            <button
                              onClick={() => openCinemaTicket(log)}
                              className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
                              title="Ver Ticket de Cine"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 border border-white/10 transition"
                            title="Eliminar de mi diario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Movie Title Header */}
                    <div className="p-2.5">
                      <Link
                        href={`/movie/${log.tmdb_id}`}
                        className="font-bold text-xs sm:text-sm text-white line-clamp-1 hover:text-red-400 transition"
                      >
                        {movie?.title || "Película"}
                      </Link>
                      {movie?.release_date && (
                        <span className="text-[10px] text-zinc-500 block">
                          {movie.release_date.slice(0, 4)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
