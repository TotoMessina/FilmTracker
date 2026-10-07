"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Flame, 
  Star, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  Eye, 
  Plus, 
  Sparkles 
} from "lucide-react";
import { getImageUrl } from "@/lib/tmdb/client";
import { CommunityTrendingMovie } from "@/app/api/community/trending/route";
import { useApp } from "@/lib/context/AppContext";

export function CommunityTrendingCarousel() {
  const { openLogModal } = useApp();
  const [movies, setMovies] = useState<CommunityTrendingMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCommunityTrending() {
      try {
        const res = await fetch("/api/community/trending");
        if (res.ok) {
          const data: CommunityTrendingMovie[] = await res.json();
          if (isMounted) {
            setMovies(data);
          }
        }
      } catch (err) {
        console.warn("Error cargando tendencias comunitarias:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCommunityTrending();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -400 : 400;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!loading && movies.length === 0) {
    return null;
  }

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/40 font-black";
      case 2:
        return "bg-gradient-to-r from-slate-200 to-zinc-400 text-black shadow-md shadow-zinc-400/30 font-black";
      case 3:
        return "bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-md shadow-orange-900/40 font-black";
      default:
        return "bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10 font-bold";
    }
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-orange-600/20 text-orange-500 border border-orange-500/30">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>En la pantalla de FilmTracker esta semana</span>
              <span className="text-orange-500">🔥</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Lo más visto y mejor valorado por los miembros de la comunidad en los últimos 7 días
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Desplazar a la izquierda"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Desplazar a la derecha"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-44 sm:w-48 shrink-0 rounded-2xl bg-[#141420] border border-white/5 p-3 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-[2/3] rounded-xl bg-zinc-800" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar scroll-smooth"
        >
          {movies.map((movie) => (
            <div
              key={movie.tmdb_id}
              className="w-40 sm:w-48 shrink-0 group relative flex flex-col rounded-2xl overflow-hidden bg-[#13111f] border border-white/5 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-950/20 transition-all duration-300"
            >
              {/* Poster Container */}
              <Link
                href={`/movie/${movie.tmdb_id}`}
                className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 block"
              >
                {movie.poster_path ? (
                  <img
                    src={getImageUrl(movie.poster_path, "w500")}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                    <Film className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">{movie.title}</span>
                  </div>
                )}

                {/* Rank Badge */}
                <div
                  className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-lg text-xs font-black z-10 ${getRankBadgeClass(
                    movie.rank
                  )}`}
                >
                  #{movie.rank}
                </div>

                {/* Quick Log button overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openLogModal({
                        id: movie.tmdb_id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                      });
                    }}
                    className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar</span>
                  </button>
                </div>
              </Link>

              {/* Movie Meta & Community Stats */}
              <div className="p-3 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/movie/${movie.tmdb_id}`}>
                    <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                      {movie.title}
                    </h3>
                  </Link>
                  {movie.year && (
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {movie.year}
                    </span>
                  )}
                </div>

                {/* Community Highlights: Vistos & Promedio */}
                <div className="pt-1.5 border-t border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Users className="w-3 h-3 text-orange-400" />
                      <span>{movie.watchCount === 1 ? "1 visionado" : `${movie.watchCount} cinéfilos`}</span>
                    </span>

                    {movie.averageRating !== null ? (
                      <span className="flex items-center gap-0.5 font-bold text-amber-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{movie.averageRating}★</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">Sin nota</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CommunityTrendingCarousel;
