"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  RotateCcw, 
  Search, 
  SlidersHorizontal,
  Film,
  Quote,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Log } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatDate, formatRuntime, getPlatformBadge, getRatingColor } from "@/lib/utils/formatting";

interface ProfileReviewsProps {
  logs: Log[];
}

export function ProfileReviews({ logs }: ProfileReviewsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<"all" | "high" | "mid" | "low">("all");
  const [sortBy, setSortBy] = useState<"recent" | "best" | "worst">("recent");
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // Filter logs with actual reviews
  const reviewedLogs = useMemo(() => {
    return logs.filter((log) => log.review && log.review.trim().length > 0);
  }, [logs]);

  // Apply search, rating filter, and sorting
  const filteredReviews = useMemo(() => {
    let result = reviewedLogs.filter((log) => {
      const title = log.movie?.title?.toLowerCase() || "";
      const reviewText = log.review?.toLowerCase() || "";
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = query === "" || title.includes(query) || reviewText.includes(query);

      const rating = log.rating ?? 0;
      let matchesRating = true;
      if (filterRating === "high") matchesRating = rating >= 8;
      else if (filterRating === "mid") matchesRating = rating >= 5 && rating < 8;
      else if (filterRating === "low") matchesRating = rating > 0 && rating < 5;

      return matchesSearch && matchesRating;
    });

    result.sort((a, b) => {
      if (sortBy === "best") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      if (sortBy === "worst") {
        return (a.rating ?? 0) - (b.rating ?? 0);
      }
      // "recent" by watched_at or created_at
      const dateA = new Date(a.watched_at || a.created_at || 0).getTime();
      const dateB = new Date(b.watched_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [reviewedLogs, searchQuery, filterRating, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (reviewedLogs.length === 0) {
    return (
      <div className="py-16 px-6 text-center rounded-3xl bg-[#141420]/60 border border-white/5 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-500">
          <MessageSquare className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Sin reseñas todavía</h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Este usuario aún no ha escrito reseñas o análisis de las películas que ha visto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141420] border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título de película o texto de la reseña..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-red-500/50 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rating filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterRating("all")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                filterRating === "all" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Todas ({reviewedLogs.length})
            </button>
            <button
              onClick={() => setFilterRating("high")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                filterRating === "high" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-emerald-400">★</span> 8-10
            </button>
            <button
              onClick={() => setFilterRating("mid")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                filterRating === "mid" ? "bg-amber-500/20 text-amber-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-amber-400">★</span> 5-7
            </button>
            <button
              onClick={() => setFilterRating("low")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                filterRating === "low" ? "bg-rose-500/20 text-rose-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-rose-400">★</span> 1-4
            </button>
          </div>

          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/5 border border-white/10 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500/50"
          >
            <option value="recent" className="bg-[#141420] text-white">Más recientes</option>
            <option value="best" className="bg-[#141420] text-white">Mejor valoradas</option>
            <option value="worst" className="bg-[#141420] text-white">Peor valoradas</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          No se encontraron reseñas con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((log) => {
            const isLong = (log.review?.length || 0) > 280;
            const isExpanded = !!expandedReviews[log.id];
            const platformBadge = getPlatformBadge(log.platform);
            const releaseYear = log.movie?.release_date ? new Date(log.movie.release_date).getFullYear() : null;

            return (
              <div
                key={log.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#141420] border border-white/5 hover:border-white/15 transition-all duration-300 shadow-xl flex flex-col sm:flex-row gap-5"
              >
                {/* Poster column */}
                <Link
                  href={`/movie/${log.tmdb_id}`}
                  className="w-24 sm:w-28 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-md"
                >
                  <img
                    src={getImageUrl(log.custom_poster_path || log.movie?.poster_path, "w342")}
                    alt={log.movie?.title || "Póster"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>

                {/* Content column */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Header: Title, Year, Rating */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                      <div className="space-y-0.5">
                        <Link
                          href={`/movie/${log.tmdb_id}`}
                          className="text-base sm:text-lg font-black text-white hover:text-red-400 transition"
                        >
                          {log.movie?.title || "Película sin título"}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          {releaseYear && <span>{releaseYear}</span>}
                          {log.movie?.runtime && (
                            <>
                              <span>•</span>
                              <span>{formatRuntime(log.movie.runtime)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Rating pill */}
                      {log.rating !== null && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black">
                          <Star className={`w-3.5 h-3.5 fill-current ${getRatingColor(log.rating)}`} />
                          <span className={getRatingColor(log.rating)}>{log.rating}</span>
                          <span className="text-zinc-500 font-normal">/10</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 my-2 text-[11px]">
                      {log.watched_at && (
                        <div className="flex items-center gap-1 text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{formatDate(log.watched_at)}</span>
                        </div>
                      )}

                      {log.platform && (
                        <span className={`px-2.5 py-1 rounded-lg border text-[11px] ${platformBadge.bg}`}>
                          {platformBadge.name}
                        </span>
                      )}

                      {log.is_rewatch && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 font-medium">
                          <RotateCcw className="w-3 h-3" /> Rewatch
                        </span>
                      )}
                    </div>

                    {/* Review text block */}
                    <div className="relative mt-3 p-4 rounded-2xl bg-white/[0.02] border-l-2 border-red-500/60 pl-4">
                      <Quote className="w-4 h-4 text-red-500/40 mb-1" />
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                        {isLong && !isExpanded
                          ? `${log.review!.slice(0, 260)}...`
                          : log.review}
                      </p>

                      {isLong && (
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="mt-2 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                        >
                          {isExpanded ? (
                            <>
                              <span>Mostrar menos</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Leer reseña completa</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Extra notes if present */}
                    {log.notes && (
                      <div className="mt-2 text-[11px] text-zinc-400 italic bg-white/[0.01] px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="font-semibold text-zinc-300 not-italic">Nota:</span> {log.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProfileReviews;
