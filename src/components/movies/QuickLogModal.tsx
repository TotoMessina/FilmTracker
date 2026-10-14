"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  X, 
  Search, 
  Star, 
  Check, 
  Loader2, 
  Calendar, 
  Film, 
  RotateCcw, 
  ArrowLeft,
  Tv,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  TMDBMovie, 
  searchMovies, 
  getImageUrl, 
  getTrendingMovies 
} from "@/lib/tmdb/client";
import { 
  performQuickLog, 
  getExistingUserLog,
  POPULAR_PLATFORMS, 
  getLastUsedPlatform, 
  setLastUsedPlatform 
} from "@/lib/services/quickLog";
import { Log } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";

export function QuickLogModal() {
  const { 
    isQuickLogOpen, 
    quickLogMovie, 
    openQuickLogModal, 
    closeQuickLogModal, 
    openLogModal,
    triggerConfetti,
    onLogSaved,
    requireAuth
  } = useApp();
  const { user, isGuest } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const [watchlistSuggestions, setWatchlistSuggestions] = useState<any[]>([]);

  // Selected movie for quick logging
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [existingLog, setExistingLog] = useState<Log | null>(null);

  // Form state
  const [rating, setRating] = useState<number>(7.0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [dateOption, setDateOption] = useState<"today" | "yesterday" | "none" | "custom">("today");
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [platform, setPlatform] = useState<string>("Netflix");
  const [isRewatch, setIsRewatch] = useState<boolean>(false);

  // Status state
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync initial movie if opened with a movie pre-selected
  useEffect(() => {
    if (isQuickLogOpen) {
      if (quickLogMovie) {
        setSelectedMovie(quickLogMovie);
      } else {
        setSelectedMovie(null);
      }
      setRating(7.0);
      setHoverRating(null);
      setDateOption("today");
      setCustomDate(new Date().toISOString().split("T")[0]);
      setPlatform(getLastUsedPlatform());
      setIsRewatch(false);
      setSavedSuccess(false);
      setExistingLog(null);
      setErrorMsg(null);
      setSearchQuery("");
      setSearchResults([]);

      // Load quick suggestions from user's watchlist or trending
      loadQuickSuggestions();

      // Focus search if no movie selected
      if (!quickLogMovie) {
        setTimeout(() => searchInputRef.current?.focus(), 150);
      }
    }
  }, [isQuickLogOpen, quickLogMovie]);

  // When selectedMovie changes, detect if user already logged it
  useEffect(() => {
    if (!selectedMovie) {
      setExistingLog(null);
      return;
    }

    getExistingUserLog(selectedMovie.id, user?.id, Boolean(isGuest || !user)).then((found) => {
      if (found) {
        setExistingLog(found);
        if (typeof found.rating === "number") setRating(found.rating);
        if (found.platform) setPlatform(found.platform);
        if (typeof found.is_rewatch === "boolean") setIsRewatch(found.is_rewatch);
        if (!found.watched_at) {
          setDateOption("none");
        } else {
          const todayStr = new Date().toISOString().split("T")[0];
          const yesterdayDate = new Date();
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
          if (found.watched_at === todayStr) {
            setDateOption("today");
          } else if (found.watched_at === yesterdayStr) {
            setDateOption("yesterday");
          } else {
            setDateOption("custom");
            setCustomDate(found.watched_at);
          }
        }
      } else {
        setExistingLog(null);
      }
    });
  }, [selectedMovie, user, isGuest]);

  const loadQuickSuggestions = async () => {
    if (user && !isGuest) {
      try {
        const { data } = await supabase
          .from("watchlist")
          .select("tmdb_id, title, movie:movies(poster_path, release_date)")
          .eq("user_id", user.id)
          .order("added_at", { ascending: false })
          .limit(6);

        if (data && data.length > 0) {
          setWatchlistSuggestions(
            data.map((item: any) => ({
              id: item.tmdb_id,
              title: item.title,
              poster_path: item.movie?.poster_path || null,
              release_date: item.movie?.release_date || null,
            }))
          );
          return;
        }
      } catch (err) {
        console.warn("Could not load watchlist suggestions for quick log:", err);
      }
    }

    // Fallback: trending movies
    try {
      const res = await getTrendingMovies("day", 1);
      if (res?.results) {
        setWatchlistSuggestions(res.results.slice(0, 6));
      }
    } catch {
      // ignore
    }
  };

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim() || selectedMovie) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchMovies(searchQuery.trim(), 1);
        setSearchResults(res.results || []);
      } catch (err) {
        console.warn("Error searching movies for quick log:", err);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedMovie]);

  const getComputedWatchedAt = (): string | null => {
    if (dateOption === "none") return null;
    if (dateOption === "today") return new Date().toISOString().split("T")[0];
    if (dateOption === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    }
    return customDate || new Date().toISOString().split("T")[0];
  };

  const handleSave = async () => {
    if (!selectedMovie || saving) return;
    setSaving(true);
    setErrorMsg(null);

    const watchedAt = getComputedWatchedAt();

    try {
      const result = await performQuickLog({
        movie: selectedMovie,
        rating,
        watchedAt,
        platform,
        isRewatch,
        existingLogId: existingLog?.id || null,
        user,
        isGuest: Boolean(isGuest || !user),
        triggerConfetti,
        onLogSaved,
      });

      if (!result.success) {
        throw new Error(result.error || "No se pudo registrar la película.");
      }

      if (result.log) {
        setExistingLog(result.log);
      }

      setSavedSuccess(true);
      if (triggerConfetti) {
        triggerConfetti();
      }
    } catch (err: any) {
      console.error("Quick log save error:", err);
      setErrorMsg(err?.message || "Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogAnother = () => {
    setSelectedMovie(null);
    setExistingLog(null);
    setSavedSuccess(false);
    setSearchQuery("");
    setSearchResults([]);
    setRating(7.0);
    setErrorMsg(null);
    setTimeout(() => searchInputRef.current?.focus(), 150);
  };

  const handleOpenFullEditor = () => {
    if (!selectedMovie) return;
    const movieToLog = selectedMovie;
    const currentEditLog = existingLog;
    closeQuickLogModal();
    openLogModal(movieToLog, currentEditLog || undefined);
  };

  const getRatingLabel = (val: number): { text: string; color: string } => {
    if (val >= 9.5) return { text: "Obra Maestra 🏆", color: "text-amber-400" };
    if (val >= 8.5) return { text: "Excelente ✨", color: "text-emerald-400" };
    if (val >= 7.0) return { text: "Muy Buena 👍", color: "text-blue-400" };
    if (val >= 5.5) return { text: "Entretenida / Pasable 🍿", color: "text-zinc-300" };
    if (val >= 4.0) return { text: "Regular / Floja 😐", color: "text-zinc-400" };
    return { text: "Mala / Decepcionante 🥱", color: "text-rose-400" };
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = getRatingLabel(currentDisplayRating);

  return (
    <>
      {/* Global Floating Action Button (FAB) - Opción 3 */}
      <div className="fixed bottom-[136px] sm:bottom-[140px] lg:bottom-24 right-4 lg:right-8 z-40 select-none">
        <button
          onClick={() => {
            if (!requireAuth("registrar películas en tu diario")) return;
            openQuickLogModal();
          }}
          className="group flex items-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:via-orange-500 hover:to-red-500 text-white font-bold text-xs shadow-2xl shadow-orange-600/40 hover:shadow-orange-600/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-300/35 cursor-pointer"
          aria-label="Registro Rápido: Acabo de ver..."
          title="Registro Rápido: Acabo de ver... (⚡ en 5 seg)"
        >
          <div className="relative flex items-center justify-center">
            <Zap className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-amber-200 fill-amber-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          </div>
          <span className="hidden sm:inline tracking-tight font-extrabold text-xs">
            Acabo de ver...
          </span>
        </button>
      </div>

      {/* Quick Log Modal Overlay */}
      {isQuickLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-[#0e0e18] border border-amber-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-amber-500/15 via-rose-600/15 to-transparent flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white tracking-tight">
                      {savedSuccess 
                        ? (existingLog ? "¡Registro Actualizado!" : "¡Película Registrada!")
                        : (existingLog ? "Editando tu Registro" : "Registro Rápido")}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${
                      existingLog 
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      {existingLog ? "✏️ Modo Edición" : "5 seg ⚡"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {savedSuccess 
                      ? "Guardado en tu diario cinematográfico" 
                      : existingLog
                      ? "Esta película ya está registrada. Modificá tu nota o fecha sin duplicarla."
                      : "Sin rodeos: elegí la peli, puntuala y listo"}
                  </p>
                </div>
              </div>

              <button
                onClick={closeQuickLogModal}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* SUCCESS VIEW */}
              {savedSuccess ? (
                <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-250">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">
                      ¡{selectedMovie?.title || "Película"} guardada!
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Ya figura en tu diario personal, estadísticas y actividad cinéfila.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {rating} / 10
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300 font-medium">{platform}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">
                      {dateOption === "none" ? "Sin fecha" : getComputedWatchedAt()}
                    </span>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={closeQuickLogModal}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition active:scale-95 cursor-pointer"
                    >
                      Listo, cerrar
                    </button>
                    <button
                      onClick={handleLogAnother}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Registrar otra película ⚡</span>
                    </button>
                  </div>
                </div>
              ) : selectedMovie ? (
                /* MOVIE SELECTED: QUICK RATE & SAVE */
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Movie Header / Switcher */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                        {selectedMovie.poster_path ? (
                          <img
                            src={getImageUrl(selectedMovie.poster_path, "w500")}
                            alt={selectedMovie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate" title={selectedMovie.title}>
                          {selectedMovie.title}
                        </h4>
                        <p className="text-xs text-zinc-400">
                          {selectedMovie.release_date?.split("-")[0] || "Año desconocido"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMovie(null)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-amber-400/10 transition shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Existing log notice */}
                  {existingLog && (
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 font-bold">✓ Registro previo:</span>
                        <span>
                          {existingLog.rating ? `${existingLog.rating}★` : "Sin nota"} • {existingLog.platform || "Sin plataforma"} •{" "}
                          {existingLog.watched_at || "Sin fecha"}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-400/80 font-mono">No se duplicará</span>
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-[#131322] border border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>Tu Puntuación (Escala 0 a 10)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-amber-300">
                          {currentDisplayRating.toFixed(1)}
                        </span>
                        <span className={`text-[11px] font-semibold ${ratingInfo.color}`}>
                          ({ratingInfo.text})
                        </span>
                      </div>
                    </div>

                    {/* Interactive 10-Star Bar */}
                    <div className="flex items-center justify-between py-1 px-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
                        const isFilled = currentDisplayRating >= starVal;
                        const isHalf = !isFilled && currentDisplayRating >= starVal - 0.5;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer"
                            title={`${starVal}/10`}
                          >
                            <Star
                              className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                                isFilled
                                  ? "text-amber-400 fill-amber-400"
                                  : isHalf
                                  ? "text-amber-400 fill-amber-400/40"
                                  : "text-zinc-600 hover:text-amber-400/50"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Precise Range Slider */}
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                    />

                    {/* Quick Rating Preset Pills */}
                    <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
                      {[
                        { val: 5, label: "5 🍿" },
                        { val: 6, label: "6" },
                        { val: 7, label: "7 ⭐" },
                        { val: 8, label: "8" },
                        { val: 9, label: "9 ✨" },
                        { val: 10, label: "10 🏆" },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setRating(preset.val)}
                          className={`flex-1 py-1 rounded-lg border text-center transition cursor-pointer font-bold ${
                            rating === preset.val
                              ? "bg-amber-500/20 border-amber-500 text-amber-300"
                              : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>¿Cuándo la viste?</span>
                    </label>

                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setDateOption("today")}
                        className={`py-2 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                          dateOption === "today"
                            ? "bg-red-600/20 border-red-500 text-red-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOption("yesterday")}
                        className={`py-2 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                          dateOption === "yesterday"
                            ? "bg-red-600/20 border-red-500 text-red-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Ayer
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOption("none")}
                        className={`py-2 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                          dateOption === "none"
                            ? "bg-red-600/20 border-red-500 text-red-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                        title="Guardar como vista sin fecha exacta"
                      >
                        Sin fecha
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOption("custom")}
                        className={`py-2 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                          dateOption === "custom"
                            ? "bg-red-600/20 border-red-500 text-red-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Elegir...
                      </button>
                    </div>

                    {dateOption === "custom" && (
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                      />
                    )}
                  </div>

                  {/* Platform Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-zinc-400" />
                        <span>¿Dónde la viste?</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Última usada: {platform}</span>
                    </label>

                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_PLATFORMS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            platform === p
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rewatch Toggle */}
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={isRewatch}
                      onChange={(e) => setIsRewatch(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ya la había visto antes (Rewatch)</span>
                    </div>
                  </label>

                  {/* Error display */}
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:via-orange-500 hover:to-red-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{existingLog ? "Actualizando registro..." : "Guardando al instante..."}</span>
                        </>
                      ) : (
                        <>
                          {existingLog ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Guardar Cambios (Actualizar Registro) ⚡</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 fill-white text-white" />
                              <span>Guardar en mi Diario (1 clic) ⚡</span>
                            </>
                          )}
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleOpenFullEditor}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 transition inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                      >
                        <span>
                          {existingLog
                            ? "¿Querés editar reseña completa o notas privadas? Abrir editor completo"
                            : "¿Querés escribir reseña o agregar acompañantes? Abrir editor completo"}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* NO MOVIE SELECTED: SEARCH & WATCHLIST */
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Escribí el nombre de la peli que acabás de ver..."
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 focus:bg-white/10 focus:ring-1 focus:ring-amber-500/40 transition"
                    />
                    {searching ? (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      </div>
                    ) : searchQuery ? (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  {/* Search Results List */}
                  {searchResults.length > 0 ? (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                        Resultados encontrados ({searchResults.length})
                      </p>
                      {searchResults.slice(0, 10).map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => setSelectedMovie(movie)}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 transition cursor-pointer group active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-14 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                              {movie.poster_path ? (
                                <img
                                  src={getImageUrl(movie.poster_path, "w500")}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Film className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-amber-400 transition-colors">
                                {movie.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                <span>{movie.release_date?.split("-")[0] || "—"}</span>
                                {movie.vote_average ? (
                                  <span className="flex items-center gap-0.5 text-amber-400">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {movie.vote_average.toFixed(1)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold group-hover:bg-amber-500 group-hover:text-black transition shrink-0">
                            Puntuar ⚡
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() && !searching ? (
                    <div className="py-8 text-center text-zinc-400 text-xs">
                      No encontramos ninguna película con &quot;{searchQuery}&quot;. Probá con otro título.
                    </div>
                  ) : (
                    /* Default Quick Suggestions (Watchlist or Trending) */
                    watchlistSuggestions.length > 0 && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{user ? "Sugerencias directas de tu Watchlist" : "Películas destacadas"}</span>
                          </p>
                          <span className="text-[10px] text-zinc-500">Tap para registrar</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {watchlistSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedMovie(item)}
                              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 text-left transition group active:scale-95 cursor-pointer"
                            >
                              <div className="w-8 h-11 rounded bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                                {item.poster_path ? (
                                  <img
                                    src={getImageUrl(item.poster_path, "w500")}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    <Film className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition-colors">
                                  {item.title}
                                </h5>
                                <p className="text-[10px] text-zinc-500">
                                  {item.release_date?.split("-")[0] || "—"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickLogModal;
