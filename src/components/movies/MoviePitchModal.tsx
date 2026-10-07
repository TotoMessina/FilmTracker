"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  X, 
  Sparkles, 
  Clock, 
  Film, 
  Flame, 
  CheckCircle2,
  Share2
} from "lucide-react";
import { MoviePitchResponse } from "@/lib/groq/types";
import { getImageUrl } from "@/lib/tmdb/client";

interface MoviePitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    title: string;
    year?: string | number;
    director?: string;
    genres?: string[];
    poster_path?: string | null;
  } | null;
}

// Client-side cache for sub-second instant reopenings
const clientPitchCache = new Map<string, MoviePitchResponse>();

export function MoviePitchModal({ isOpen, onClose, movie }: MoviePitchModalProps) {
  const [data, setData] = useState<MoviePitchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !movie?.title) return;

    const cacheKey = `${movie.title.toLowerCase().trim()}_${String(movie.year || "").trim()}`;
    const cached = clientPitchCache.get(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    let isMounted = true;

    async function fetchPitch() {
      try {
        const res = await fetch("/api/ai/pitch-movie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: movie?.title,
            year: movie?.year,
            director: movie?.director,
            genres: movie?.genres,
          }),
        });

        if (!res.ok) {
          throw new Error("No se pudo obtener el pitch.");
        }

        const json: MoviePitchResponse = await res.json();
        if (isMounted) {
          clientPitchCache.set(cacheKey, json);
          setData(json);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Error cargando pitch:", err);
          setError("No pudimos conectar con el asistente de pitch. Intenta nuevamente.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPitch();

    return () => {
      isMounted = false;
    };
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const handleShare = () => {
    if (!data) return;
    const shareText = `🎬 ¿Por qué ver "${movie.title}" hoy? ${data.vibeEmoji}\n\n"${data.pitch}"\n\n${data.idealMoment}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#19152b] via-[#131021] to-[#0d0b17] border border-amber-500/35 shadow-2xl shadow-amber-950/40 overflow-hidden transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600" />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 flex items-start justify-between gap-3 border-b border-white/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>Pitch Sin Spoilers</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{movie.title}</span>
              {movie.year && (
                <span className="text-sm font-semibold text-zinc-400">
                  ({movie.year})
                </span>
              )}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-bounce">
                <Zap className="w-6 h-6 fill-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  Preparando el argumento perfecto...
                </p>
                <p className="text-xs text-zinc-400">
                  Sintetizando ritmo, atmósfera y actuaciones sin spoilers
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Vibe and Pitch Card */}
              <div className="relative rounded-2xl bg-[#1d1733]/60 border border-purple-500/25 p-5 space-y-3.5 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-purple-500/25 border border-amber-500/30 flex items-center justify-center text-2xl shadow-md shrink-0">
                    {data.vibeEmoji || "⚡"}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      ¿Por qué verla hoy?
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      0% spoilers • Máxima convicción
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed italic border-l-2 border-amber-400/80 pl-3.5">
                  &ldquo;{data.pitch}&rdquo;
                </p>
              </div>

              {/* Ideal Moment Chip */}
              {data.idealMoment && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-zinc-300">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-semibold text-purple-200">
                    {data.idealMoment}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={handleShare}
              disabled={!data || loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              title="Copiar pitch para compartir"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copiar Pitch</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:opacity-95 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              ¡Me convenciste! 🍿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
