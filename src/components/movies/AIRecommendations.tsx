"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Search, Film, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Log } from "@/lib/supabase/types";
import { AIRecommendation } from "@/lib/groq/types";
import { getImageUrl } from "@/lib/tmdb/client";

interface AIRecommendationsProps {
  logs: Log[];
  watchlistTitles: string[];
}

export function AIRecommendations({ logs, watchlistTitles }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!logs || logs.length < 5) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        logs: logs.map((l) => ({
          title: l.movie?.title,
          genres: l.movie?.genres?.map((g) => (typeof g === "string" ? g : g.name)) || [],
          rating: l.rating,
          is_rewatch: l.is_rewatch,
          platform: l.platform,
          cast_data: l.movie?.cast_data || [],
        })),
        watchlistTitles: watchlistTitles || [],
      };

      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudieron obtener las recomendaciones.");
      }

      const data: AIRecommendation[] = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      console.error("Error fetching AI recommendations:", err);
      setError(err?.message || "Ocurrió un error al cargar las recomendaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [logs.length]);

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 90) {
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    }
    if (confidence >= 75) {
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    }
    return "text-zinc-400 bg-zinc-800/60 border-zinc-700/40";
  };

  return (
    <section className="space-y-5 pt-6 border-t border-white/5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Para Ti — Selección IA
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse">
                IA
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Basado en tu historial cinematográfico
            </p>
          </div>
        </div>

        {logs && logs.length >= 5 && recommendations.length > 0 && !loading && (
          <button
            onClick={fetchRecommendations}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition active:scale-95"
            title="Regenerar recomendaciones"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerar</span>
          </button>
        )}
      </div>

      {/* Condition 1: Less than 5 logs banner */}
      {(!logs || logs.length < 5) && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/20 via-[#141420] to-[#141420] border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Registrá al menos 5 películas para activar las recomendaciones IA
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Llevas {logs?.length || 0} de 5 películas registradas en tu diario. Cuanto más registres, más precisas serán las sugerencias de CineBot.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <div className="w-32 bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((logs?.length || 0) / 5) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-black text-red-500">
              {logs?.length || 0}/5
            </span>
          </div>
        </div>
      )}

      {/* Condition 2: Error message with retry */}
      {logs && logs.length >= 5 && error && !loading && (
        <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between gap-3 text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRecommendations}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Condition 3: Loading Skeleton UI (5 cards) */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/5 flex flex-col justify-between animate-pulse"
            >
              {/* Poster Skeleton */}
              <div className="w-full aspect-[2/3] bg-zinc-800/60 relative">
                <div className="absolute top-2.5 left-2.5 w-8 h-5 bg-zinc-700/60 rounded-md" />
                <div className="absolute top-2.5 right-2.5 w-16 h-5 bg-zinc-700/60 rounded-full" />
              </div>
              {/* Content Skeleton */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-zinc-800 rounded mt-1" />
                  <div className="w-1/3 h-3 bg-zinc-800/60 rounded" />
                  <div className="w-full h-3 bg-zinc-800/40 rounded mt-3" />
                  <div className="w-4/5 h-3 bg-zinc-800/30 rounded" />
                </div>
                <div className="w-full h-9 bg-zinc-800/60 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Condition 4: Result UI (5 cards) with Posters */}
      {logs && logs.length >= 5 && !loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recommendations.map((rec, index) => {
            const badgeClasses = getConfidenceBadgeColor(rec.confidence);
            const posterSrc = getImageUrl(rec.poster_path, "w500");

            return (
              <div
                key={`${rec.title}-${index}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1.5"
              >
                {/* Poster container with badges & overlays */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-950">
                  <img
                    src={posterSrc}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    loading="lazy"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="font-black text-xs px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-lg">
                      #{index + 1}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-lg ${badgeClasses}`}
                    >
                      {rec.confidence}% match
                    </span>
                  </div>

                  {/* Gradient shadow to blend with card body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Title & Year */}
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-red-400 transition-colors">
                        {rec.title}
                      </h3>
                      <span className="text-xs text-zinc-400 mt-0.5 inline-block">
                        {rec.year}
                      </span>
                    </div>

                    {/* Vibe */}
                    {rec.vibe && (
                      <div className="text-xs text-amber-400 italic flex items-center gap-1.5 bg-amber-400/5 px-2.5 py-1.5 rounded-xl border border-amber-400/10">
                        <span className="not-italic text-sm">🎬</span>
                        <span className="line-clamp-1">{rec.vibe}</span>
                      </div>
                    )}

                    {/* Personalized Reason */}
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/5 flex gap-2">
                    {rec.tmdb_id ? (
                      <Link
                        href={`/movie/${rec.tmdb_id}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Ver Ficha</span>
                      </Link>
                    ) : null}

                    <button
                      onClick={() => {
                        window.location.href = `/search?q=${encodeURIComponent(rec.title)}`;
                      }}
                      className={`py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-sm ${
                        rec.tmdb_id ? "" : "w-full"
                      }`}
                      title="Buscar en FilmTracker"
                    >
                      <Search className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{rec.tmdb_id ? "" : "Buscar en FilmTracker"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AIRecommendations;
