"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  X, 
  Film, 
  Star, 
  Bookmark, 
  Plus, 
  Check, 
  HelpCircle,
  Clapperboard,
  ArrowRight
} from "lucide-react";
import { getImageUrl } from "@/lib/tmdb/client";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface SceneResult {
  movie: {
    id: number;
    title: string;
    original_title?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    vote_average: number;
    overview: string;
  };
  reason: string;
  confidence: "alta" | "media" | "baja";
  aiTitle: string;
}

interface SceneSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_SCENES = [
  "Un tipo atrapado en un tren con una bomba que explota cada 8 minutos",
  "Juegan al ajedrez con la muerte en una playa en blanco y negro",
  "Una pelea en un pasillo de hotel que gira en gravedad cero",
  "Dos astronautas atrapados en una nave con una IA de ojo rojo psicópata",
  "Un baterista obsesivo y un profesor de jazz implacable que le tira un platillo"
];

export function SceneSearchModal({ isOpen, onClose }: SceneSearchModalProps) {
  const { openLogModal, requireAuth, triggerConfetti } = useApp();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SceneResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watchlist tracker for modal items
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleSearch = async (searchQueryText?: string) => {
    const textToSearch = searchQueryText || query;
    if (!textToSearch.trim() || textToSearch.trim().length < 3) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/ai/scene-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSearch.trim() }),
      });

      if (!res.ok) {
        throw new Error("No se pudo conectar con el detective cinéfilo.");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.warn("Error en búsqueda por escena:", err);
      setError("Ocurrió un problema buscando la película. Probá describiendo más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    handleSearch(sample);
  };

  const handleAddToWatchlist = async (tmdbId: number, title: string) => {
    if (!requireAuth("guardar películas en tu Watchlist")) return;

    try {
      if (user) {
        const { error } = await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: tmdbId,
        });
        if (!error) {
          setWatchlistIds((prev) => new Set(prev).add(tmdbId));
          triggerConfetti();
        }
      } else {
        const guestWl = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
        if (!guestWl.some((item: any) => item.tmdb_id === tmdbId)) {
          guestWl.push({ tmdb_id: tmdbId, title, added_at: new Date().toISOString() });
          localStorage.setItem("filmtracker_guest_watchlist", JSON.stringify(guestWl));
          setWatchlistIds((prev) => new Set(prev).add(tmdbId));
          triggerConfetti();
        }
      }
    } catch (e) {
      console.warn("Error agregando a watchlist:", e);
    }
  };

  const getConfidenceBadge = (confidence: "alta" | "media" | "baja") => {
    switch (confidence) {
      case "alta":
        return {
          label: "Coincidencia 95%",
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        };
      case "media":
        return {
          label: "Coincidencia 75%",
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        };
      case "baja":
      default:
        return {
          label: "Coincidencia 50%",
          bg: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0f0e18] border border-amber-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-r from-red-950/40 via-purple-950/20 to-amber-950/30">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detective Cinéfilo IA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Búsqueda por Descripción de Escena
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              ¿Tenés una escena grabada en la cabeza pero no te acordás el título? Describila con tus palabras.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-5 sm:p-6 space-y-4 border-b border-white/5 bg-[#12111d]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describí una escena que recuerdes (ej: un tren, un reloj de arena...)"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/50 border border-amber-500/20 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm sm:text-base shadow-inner"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || query.trim().length < 3}
              className="px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-black hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-black" />
              <span>Identificar Película</span>
            </button>
          </form>

          {/* Sample Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Pruebas rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_SCENES.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className="px-2.5 py-1 rounded-xl text-[11px] bg-white/5 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-300 border border-white/5 hover:border-amber-500/30 transition text-left cursor-pointer truncate max-w-[280px]"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content / Results Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar">
          {/* Loading Animation: Lupa cinéfila */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 animate-spin blur-md opacity-50" />
                <div className="relative w-16 h-16 rounded-full bg-[#181726] border-2 border-amber-400 flex items-center justify-center shadow-inner">
                  <Search className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Rastreando escenas en la memoria del cine...</h4>
                <p className="text-xs text-zinc-400">La IA está deduciendo los títulos y validando con TMDB.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {/* No results */}
          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="py-12 text-center space-y-3 max-w-md mx-auto">
              <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No encontramos una coincidencia exacta</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Intentá agregar más pistas: ¿quién actuaba? ¿era en blanco y negro o a color? ¿en qué época transcurría la historia?
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Películas Identificadas ({results.length})</span>
                </span>
                <span className="text-xs text-zinc-500">Ordenadas por probabilidad</span>
              </div>

              <div className="space-y-3.5">
                {results.map(({ movie, reason, confidence }) => {
                  const badge = getConfidenceBadge(confidence);
                  const posterUrl = getImageUrl(movie.poster_path, "w342");
                  const year = movie.release_date ? movie.release_date.split("-")[0] : null;
                  const isInWatchlist = watchlistIds.has(movie.id);

                  return (
                    <div
                      key={movie.id}
                      className="p-4 rounded-2xl bg-[#141422] border border-white/5 hover:border-amber-500/30 transition-all duration-200 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Movie Thumbnail */}
                      <Link
                        href={`/movie/${movie.id}`}
                        onClick={onClose}
                        className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10 group relative block"
                      >
                        <img
                          src={posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      </Link>

                      {/* Movie Info & Reason */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <Link
                              href={`/movie/${movie.id}`}
                              onClick={onClose}
                              className="font-bold text-base sm:text-lg text-white hover:text-amber-400 transition truncate max-w-sm block"
                            >
                              {movie.title}
                            </Link>

                            {/* Confidence badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            {year && <span>{year}</span>}
                            {movie.vote_average > 0 && (
                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {movie.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>

                          {/* Reason callout */}
                          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                            <strong className="text-amber-300 font-bold block mb-0.5">Por qué encaja con la escena:</strong>
                            {reason}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <button
                            onClick={() =>
                              openLogModal({
                                id: movie.id,
                                title: movie.title,
                                poster_path: movie.poster_path,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                          >
                            <Clapperboard className="w-3.5 h-3.5" />
                            <span>Registrar en Diario</span>
                          </button>

                          <button
                            onClick={() => handleAddToWatchlist(movie.id, movie.title)}
                            disabled={isInWatchlist}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                              isInWatchlist
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                            }`}
                          >
                            {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            <span>{isInWatchlist ? "En Watchlist" : "Guardar en Watchlist"}</span>
                          </button>

                          <Link
                            href={`/movie/${movie.id}`}
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1 ml-auto"
                          >
                            <span>Ver Ficha</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
