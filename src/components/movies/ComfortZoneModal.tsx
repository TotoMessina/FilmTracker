"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  Film, 
  Star, 
  Bookmark, 
  Check, 
  ArrowRight,
  Compass,
  RotateCcw,
  Plus,
  Quote,
  Flame,
  HelpCircle,
  Eye
} from "lucide-react";
import { getImageUrl, MOVIE_GENRES } from "@/lib/tmdb/client";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { OutOfComfortZoneResponse } from "@/lib/groq/types";

interface ComfortZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFavorites?: string[];
}

const COMMON_UNEXPLORED_GENRES = [
  "Cine Clásico",
  "Western",
  "Musical",
  "Animación",
  "Documental",
  "Cine Negro",
  "Terror de Culto",
  "Ciencia Ficción Filosófica",
];

const DEFAULT_POPULAR_FAVORITES = [
  "Zodiac",
  "Inception",
  "Pulp Fiction",
  "The Dark Knight",
  "Parasite",
  "Whiplash",
];

export function FaithLeapCard({
  result,
  onReset,
  isInModal = true,
}: {
  result: OutOfComfortZoneResponse;
  onReset?: () => void;
  isInModal?: boolean;
}) {
  const { requireAuth, triggerConfetti } = useApp();
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  const handleAddToWatchlist = async () => {
    if (!result.tmdb_id) return;
    if (!requireAuth("guardar esta película en tu Watchlist")) return;

    setSavingWatchlist(true);
    try {
      if (user) {
        const { error } = await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: result.tmdb_id,
        });
        if (!error) {
          setInWatchlist(true);
          triggerConfetti();
        }
      } else {
        const guestWl = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
        if (!guestWl.some((item: any) => item.tmdb_id === result.tmdb_id)) {
          guestWl.push({
            tmdb_id: result.tmdb_id,
            title: result.movieTitle,
            added_at: new Date().toISOString(),
          });
          localStorage.setItem("filmtracker_guest_watchlist", JSON.stringify(guestWl));
          setInWatchlist(true);
          triggerConfetti();
        }
      }
    } catch (e) {
      console.warn("Error agregando a watchlist:", e);
    } finally {
      setSavingWatchlist(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-[#181126] via-[#120f1e] to-[#0d0b16] shadow-2xl shadow-purple-950/40">
      {/* Background Poster Backdrop Glow */}
      {result.backdrop_path && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none filter blur-xl scale-110"
          style={{ backgroundImage: `url(${getImageUrl(result.backdrop_path, "original")})` }}
        />
      )}

      {/* Card Header Badge */}
      <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-amber-900/20">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-black shadow-md shadow-amber-500/20 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            El Salto de Fe
          </span>
          {result.unexploredGenre && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30">
              Desafío: {result.unexploredGenre}
            </span>
          )}
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Probar otro puente
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Movie Info Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Movie Poster */}
          <div className="w-32 sm:w-44 shrink-0 rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-xl shadow-purple-950/60 bg-black/60 group relative aspect-[2/3] self-center sm:self-start">
            {result.poster_path ? (
              <img
                src={getImageUrl(result.poster_path, "w500")}
                alt={result.movieTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                <Film className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-xs">{result.movieTitle}</span>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{result.vote_average ? result.vote_average.toFixed(1) : "N/D"}</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {result.movieTitle}
                </h3>
                <span className="text-lg sm:text-xl font-bold text-purple-300/80">
                  ({result.year})
                </span>
              </div>
              {result.genres && result.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 text-[11px]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Official Synopsis */}
            {result.overview && (
              <div className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="font-semibold text-zinc-200 block mb-0.5 text-[11px] uppercase tracking-wider">
                  Sinopsis oficial:
                </span>
                {result.overview}
              </div>
            )}
          </div>
        </div>

        {/* The Cinéfilo Bridge / Trojan Horse */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-purple-950/40 via-amber-950/30 to-purple-950/40 border border-purple-500/30 space-y-3 shadow-inner">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Quote className="w-4 h-4 text-amber-400" />
            <span>El Puente Cinéfilo (Tu Caballo de Troya)</span>
          </div>
          <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed italic border-l-2 border-amber-400/70 pl-3">
            "{result.bridgeExplanation}"
          </p>
        </div>

        {/* Why it works */}
        <div className="rounded-2xl p-5 bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Por qué funciona para vos</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {result.whyItWorks}
          </p>
        </div>

        {/* Card CTA Actions */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {result.tmdb_id && (
            <Link
              href={`/movie/${result.tmdb_id}`}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Ficha Completa</span>
            </Link>
          )}

          {result.tmdb_id && (
            <button
              onClick={handleAddToWatchlist}
              disabled={inWatchlist || savingWatchlist}
              className={`px-5 py-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                inWatchlist
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/10 hover:bg-white/15 border-white/20 text-white"
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>En tu Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-zinc-300" />
                  <span>Guardar para Ver</span>
                </>
              )}
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="ml-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Explorar otro género</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ComfortZoneModal({
  isOpen,
  onClose,
  initialFavorites,
}: ComfortZoneModalProps) {
  const { user } = useAuth();

  const [favoriteMovies, setFavoriteMovies] = useState<string[]>(
    initialFavorites && initialFavorites.length > 0 ? initialFavorites : DEFAULT_POPULAR_FAVORITES.slice(0, 4)
  );
  const [newFavoriteInput, setNewFavoriteInput] = useState("");
  const [unexploredGenres, setUnexploredGenres] = useState<string[]>([
    "Cine Clásico",
    "Western",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OutOfComfortZoneResponse | null>(null);

  // Auto-detect user logs to propose actual favorite films and rare genres
  useEffect(() => {
    if (!isOpen || !user) return;

    let isCancelled = false;

    async function loadUserStats() {
      try {
        const { data: logs } = await supabase
          .from("logs")
          .select("*, movie:movies(*)")
          .eq("user_id", user!.id)
          .order("watched_at", { ascending: false })
          .limit(40);

        if (isCancelled || !logs || logs.length === 0) return;

        const genreCounts: Record<string, number> = {};
        const userHighRated: string[] = [];

        logs.forEach((log) => {
          const title = log.movie?.title;
          const rating = typeof log.rating === "number" ? log.rating : null;
          if (title && rating !== null && rating >= 4) {
            userHighRated.push(title);
          } else if (title && !rating && userHighRated.length < 5) {
            userHighRated.push(title);
          }

          const genres = log.movie?.genres || [];
          genres.forEach((g: any) => {
            const gName = typeof g === "string" ? g : g?.name;
            if (gName) {
              genreCounts[gName.toLowerCase()] = (genreCounts[gName.toLowerCase()] || 0) + 1;
            }
          });
        });

        if (userHighRated.length > 0) {
          setFavoriteMovies(Array.from(new Set(userHighRated)).slice(0, 5));
        }

        // Find standard TMDB genres that the user has watched 0 or fewest times
        const rareGenres = MOVIE_GENRES
          .filter((g) => (genreCounts[g.name.toLowerCase()] || 0) <= 1)
          .map((g) => g.name);

        if (rareGenres.length > 0) {
          setUnexploredGenres(rareGenres.slice(0, 3));
        }
      } catch (e) {
        console.warn("No se pudieron cargar logs para ComfortZone:", e);
      }
    }

    loadUserStats();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAddFavorite = () => {
    const val = newFavoriteInput.trim();
    if (val && !favoriteMovies.includes(val)) {
      setFavoriteMovies([...favoriteMovies, val]);
      setNewFavoriteInput("");
    }
  };

  const handleRemoveFavorite = (title: string) => {
    setFavoriteMovies(favoriteMovies.filter((t) => t !== title));
  };

  const toggleGenre = (genre: string) => {
    if (unexploredGenres.includes(genre)) {
      if (unexploredGenres.length > 1) {
        setUnexploredGenres(unexploredGenres.filter((g) => g !== genre));
      }
    } else {
      setUnexploredGenres([...unexploredGenres, genre]);
    }
  };

  const handleExecuteFaithLeap = async () => {
    if (favoriteMovies.length === 0 || unexploredGenres.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/out-of-comfort-zone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favoriteMovies,
          unexploredGenres,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo generar la recomendación.");
      }

      const data: OutOfComfortZoneResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Error en Salto de Fe:", err);
      setError("No pudimos conectar con el curador cinematográfico. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0f0c1a] border border-purple-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-indigo-950/30">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Curador de Vanguardia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Fuera de tu Zona de Confort</span>
              <span className="text-amber-400">🚀</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              El Salto de Fe: encuentra una película de un género que habitualmente evitas, construida como un puente irresistible hacia tus gustos favoritos.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {result ? (
            /* Result Card */
            <FaithLeapCard
              result={result}
              onReset={() => setResult(null)}
              isInModal={true}
            />
          ) : (
            /* Setup Form */
            <div className="space-y-6">
              {/* Step 1: Favorite Movies */}
              <div className="space-y-3 bg-[#141024] p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Películas que Amas (Tu Zona Segura)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {favoriteMovies.length} seleccionadas
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                  {favoriteMovies.map((title) => (
                    <span
                      key={title}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-xs font-medium text-purple-200"
                    >
                      {title}
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(title)}
                        className="hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input to add more */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFavoriteInput}
                    onChange={(e) => setNewFavoriteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFavorite();
                      }
                    }}
                    placeholder="Agregar otra favorita (ej: Blade Runner, Whiplash...)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddFavorite}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Unexplored Genres */}
              <div className="space-y-3 bg-[#141024] p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>Géneros a Desafiar (Fuera de tu radar)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Selecciona al menos uno
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COMMON_UNEXPLORED_GENRES.map((genre) => {
                    const isSelected = unexploredGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-md shadow-purple-600/30"
                            : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        <span>{genre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* Main Submit Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExecuteFaithLeap}
                  disabled={loading || favoriteMovies.length === 0 || unexploredGenres.length === 0}
                  className="w-full py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 active:scale-[0.99] text-white shadow-xl shadow-purple-900/40 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Buscando el Caballo de Troya Perfecto...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>Dar el Salto de Fe 🎲</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  La IA analizará la psicología de tus elecciones para hallar una obra maestra indiscutible.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
