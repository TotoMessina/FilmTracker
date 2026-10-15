"use client";

import { WatchedBadge } from '@/components/movies/WatchedBadge';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Film, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Share2, 
  Trophy,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { 
  TMDBCollectionDetails, 
  TMDBMovie, 
  getImageUrl, 
  getBackdropUrl 
} from "@/lib/tmdb/client";
import { CuratedSaga, getCachedSagaDetails } from "@/lib/services/sagas";
import { useApp } from "@/lib/context/AppContext";
import { formatRuntime } from "@/lib/utils/formatting";

interface SagaDetailModalProps {
  sagaId: number | null;
  curatedInfo?: CuratedSaga;
  userWatchedIds: Set<number>;
  userRatings?: Map<number, number>;
  onClose: () => void;
}

export function SagaDetailModal({
  sagaId,
  curatedInfo,
  userWatchedIds,
  userRatings,
  onClose,
}: SagaDetailModalProps) {
  const { openLogModal, triggerConfetti } = useApp();
  const [details, setDetails] = useState<TMDBCollectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!sagaId) return;

    let isMounted = true;
    setLoading(true);

    getCachedSagaDetails(sagaId)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sagaId]);

  if (!sagaId) return null;

  // Compute stats
  const movies = details?.parts || [];
  const watchedCount = movies.filter((m) => userWatchedIds.has(m.id)).length;
  const totalCount = movies.length;
  const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const isCompleted = totalCount > 0 && watchedCount === totalCount;

  // Total runtime
  const totalMinutes = movies.reduce((acc, m) => acc + (m.runtime || 110), 0);
  
  // Average TMDB rating
  const avgRating = movies.length > 0 
    ? (movies.reduce((acc, m) => acc + m.vote_average, 0) / movies.length).toFixed(1)
    : null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f0e1a] border border-white/10 shadow-2xl z-10 flex flex-col no-scrollbar animate-in zoom-in-95 duration-200">
        {/* Header / Hero Banner with Backdrop */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full overflow-hidden shrink-0 bg-zinc-950">
          <img
            src={getBackdropUrl(details?.backdrop_path || null, "original")}
            alt={details?.name || "Saga"}
            className="w-full h-full object-cover opacity-60 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e1a] via-[#0f0e1a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e1a]/90 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/10 transition z-20 cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Content Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {curatedInfo?.universe && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[11px] font-black uppercase tracking-wider">
                    {curatedInfo.universe}
                  </span>
                )}
                {curatedInfo?.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    {curatedInfo.badge}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {details?.name || curatedInfo?.name || "Cargando saga..."}
              </h2>

              {curatedInfo?.tagline && (
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl line-clamp-2">
                  {curatedInfo.tagline}
                </p>
              )}
            </div>

            {/* Quick Share Button */}
            <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? "¡Enlace copiado!" : "Compartir"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 space-y-6 flex-1">
          {/* Progress Tracker Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isCompleted 
              ? "bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-[#141424] border-amber-500/40 shadow-lg shadow-amber-950/30"
              : "bg-[#141324] border-white/10"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isCompleted 
                    ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/30"
                    : "bg-red-600/20 text-red-400 border border-red-500/30"
                }`}>
                  {isCompleted ? <Trophy className="w-6 h-6" /> : <Film className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Tu Progreso en la Saga
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40">
                        Completada ✨
                      </span>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white">
                    {watchedCount} de {totalCount} películas vistas ({progressPercent}%)
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 text-xs text-zinc-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                {avgRating && (
                  <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{avgRating}★ media</span>
                  </div>
                )}
                {totalMinutes > 0 && (
                  <div className="flex items-center gap-1 text-zinc-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{formatRuntime(totalMinutes)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5 w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  isCompleted
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-md shadow-amber-500/50"
                    : "bg-gradient-to-r from-red-600 to-rose-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Saga Overview / Synopsis */}
          {details?.overview && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Sobre la Colección
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {details.overview}
              </p>
            </div>
          )}

          {/* List of Movies in Saga */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span>Películas en Orden Cronológico ({movies.length})</span>
              </h3>
              <span className="text-xs text-zinc-500">
                Orden oficial por fecha de estreno
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-zinc-900/60 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {movies.map((movie, index) => {
                  const isWatched = userWatchedIds.has(movie.id);
                  const userRating = userRatings?.get(movie.id);
                  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "—";

                  return (
                    <div
                      key={movie.id}
                      className={`group p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:gap-4 ${
                        isWatched
                          ? "bg-[#121820]/60 border-emerald-500/25 hover:border-emerald-500/50"
                          : "bg-[#141422]/60 border-white/5 hover:border-white/20"
                      }`}
                    >
                      {/* Left: Number + Poster + Info */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Order Number */}
                        <div className="w-6 sm:w-7 text-center font-black text-xs sm:text-sm text-zinc-500 group-hover:text-white transition">
                          #{index + 1}
                        </div>

                        {/* Poster */}
                        <Link
                          href={`/movie/${movie.id}`}
                          onClick={onClose}
                          className="w-12 sm:w-14 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative shadow"
                        >
<WatchedBadge movieId={movie.id ?? 0} className="top-10 left-1" />
                          <img
                            src={getImageUrl(movie.poster_path, "w200")}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </Link>

                        {/* Info */}
                        <div className="min-w-0">
                          <Link
                            href={`/movie/${movie.id}`}
                            onClick={onClose}
                            className="font-bold text-sm sm:text-base text-white hover:text-red-400 transition truncate block"
                          >
                            {movie.title}
                          </Link>

                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              {releaseYear}
                            </span>

                            {movie.vote_average > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {movie.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Watched status / Log Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isWatched ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Vista</span>
                              {userRating && (
                                <span className="text-amber-300 ml-0.5 font-black">
                                  ★ {userRating}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/movie/${movie.id}`}
                              onClick={onClose}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                              title="Ver Ficha"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                openLogModal({
                                  id: movie.id,
                                  title: movie.title,
                                  poster_path: movie.poster_path,
                                });
                              }}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-950/30 active:scale-95 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Registrar</span>
                            </button>

                            <Link
                              href={`/movie/${movie.id}`}
                              onClick={onClose}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SagaDetailModal;
