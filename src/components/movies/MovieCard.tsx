"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Plus, Bookmark, EyeOff, Check, Info, Ticket, Sparkles } from "lucide-react";
import { TMDBMovie, getImageUrl } from "@/lib/tmdb/client";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { getCachedCinemaStatus, getNowPlayingStatusMap, CinemaStatus } from "@/lib/services/cinema";

interface MovieCardProps {
  movie: TMDBMovie | {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average?: number;
    release_date?: string;
    runtime?: number;
    overview?: string;
  };
  onLogClick?: () => void;
  showBlacklistAction?: boolean;
  cinemaStatus?: CinemaStatus | null;
}

export function MovieCard({ movie, onLogClick, showBlacklistAction = true, cinemaStatus }: MovieCardProps) {
  const { openLogModal, addToBlacklist, isBlacklisted, requireAuth } = useApp();
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
  const [detectedCinemaStatus, setDetectedCinemaStatus] = useState<CinemaStatus | null>(
    cinemaStatus ?? getCachedCinemaStatus(movie.id)
  );

  useEffect(() => {
    if (cinemaStatus !== undefined) {
      setDetectedCinemaStatus(cinemaStatus);
      return;
    }
    const cached = getCachedCinemaStatus(movie.id);
    if (cached) {
      setDetectedCinemaStatus(cached);
    } else {
      getNowPlayingStatusMap().then((map) => {
        const s = map.get(movie.id);
        if (s) setDetectedCinemaStatus(s);
      });
    }
  }, [movie.id, cinemaStatus]);

  const year = movie.release_date ? movie.release_date.split("-")[0] : null;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const posterUrl = getImageUrl(movie.poster_path, "w500");

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!requireAuth("guardar películas en tu Watchlist")) {
      return;
    }

    if (inWatchlist) return;

    setIsAddingWatchlist(true);
    try {
      if (user) {
        // Ensure movie exists in db cache
        await supabase.from("movies").upsert({
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date || null,
          vote_average: movie.vote_average || null,
          overview: movie.overview || null,
          runtime: (movie as TMDBMovie).runtime || null,
        });

        const { error } = await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: movie.id,
          title: movie.title,
        });

        if (!error) {
          setInWatchlist(true);
        }
      }
    } catch (err) {
      console.warn("Watchlist add error:", err);
    } finally {
      setIsAddingWatchlist(false);
    }
  };

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth("ocultar películas de tus recomendaciones")) {
      return;
    }
    addToBlacklist(movie.id);
  };

  const handleOpenLog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth("registrar esta película en tu diario")) {
      return;
    }
    if (onLogClick) {
      onLogClick();
    } else {
      openLogModal(movie as TMDBMovie);
    }
  };

  return (
    <div className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#141420] transition-all duration-300 hover:shadow-xl ${
      detectedCinemaStatus === "estreno"
        ? "border border-red-500/30 hover:border-red-500 shadow-md shadow-red-950/20 hover:shadow-red-600/25"
        : detectedCinemaStatus === "reestreno"
        ? "border border-amber-500/30 hover:border-amber-400 shadow-md shadow-amber-950/20 hover:shadow-amber-500/25"
        : "border border-white/5 hover:border-white/20 hover:shadow-black/60"
    }`}>
      {/* Poster image container */}
      <Link href={`/movie/${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 block">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-black/75 backdrop-blur-md text-amber-400 border border-white/10 shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
        )}

        {/* Cinema status badge */}
        {detectedCinemaStatus === "estreno" && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/50 border border-white/20 backdrop-blur-md animate-pulse-slow">
            <Ticket className="w-3 h-3 text-white" />
            <span>Estreno</span>
          </div>
        )}

        {detectedCinemaStatus === "reestreno" && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/50 border border-amber-300/60 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-black" />
            <span>Reestreno</span>
          </div>
        )}

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            {/* Quick Log button */}
            <button
              onClick={handleOpenLog}
              title="Registrar película"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-lg shadow-red-600/30 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>

            {/* Watchlist toggle */}
            <button
              onClick={handleWatchlistToggle}
              title={inWatchlist ? "En tu Watchlist" : "Agregar a Watchlist"}
              className={`p-2 rounded-xl border transition ${
                inWatchlist
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Blacklist button */}
            {showBlacklistAction && (
              <button
                onClick={handleHide}
                title="Ocultar de recomendaciones"
                className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 transition"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center text-[11px] text-zinc-300 gap-1 hover:text-white">
            <Info className="w-3 h-3" />
            <span>Ver detalles</span>
          </div>
        </div>
      </Link>

      {/* Movie info caption */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1 group-hover:text-red-400 transition-colors" title={movie.title}>
            {movie.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-xs text-zinc-500 mt-1.5">
          <span>{year || "—"}</span>
          {detectedCinemaStatus ? (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
              detectedCinemaStatus === "estreno"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              {detectedCinemaStatus === "estreno" ? (
                <>
                  <Ticket className="w-2.5 h-2.5 text-red-400" />
                  <span>En Cines</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Reestreno</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Película</span>
          )}
        </div>
      </div>
    </div>
  );
}
