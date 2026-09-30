"use client";

import React, { useMemo } from "react";
import { 
  Film, 
  Clock, 
  Star, 
  Tv, 
  RotateCcw, 
  Ticket, 
  TrendingUp, 
  Award,
  Sparkles,
  PieChart,
  BarChart3,
  Users
} from "lucide-react";
import { Log } from "@/lib/supabase/types";
import { getPlatformBadge, getRatingColor } from "@/lib/utils/formatting";

interface ProfileStatsProps {
  logs: Log[];
}

export function ProfileStats({ logs }: ProfileStatsProps) {
  const stats = useMemo(() => {
    const totalMovies = logs.length;
    let totalMinutes = 0;
    let ratedCount = 0;
    let sumRating = 0;
    let rewatchCount = 0;
    let cinemaCount = 0;

    const genreCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    const actorCounts: Record<string, { count: number; character?: string }> = {};
    const ratingBuckets = {
      masterpiece: 0, // 10
      excellent: 0,   // 8 - 9.5
      good: 0,        // 6 - 7.5
      average: 0,     // 4 - 5.5
      bad: 0,         // 1 - 3.5
    };
    const decadeCounts: Record<string, number> = {};

    logs.forEach((log) => {
      // Runtime
      if (log.movie?.runtime && log.movie.runtime > 0) {
        totalMinutes += log.movie.runtime;
      }

      // Ratings
      if (log.rating !== null && log.rating !== undefined) {
        ratedCount++;
        sumRating += log.rating;

        if (log.rating === 10) ratingBuckets.masterpiece++;
        else if (log.rating >= 8) ratingBuckets.excellent++;
        else if (log.rating >= 6) ratingBuckets.good++;
        else if (log.rating >= 4) ratingBuckets.average++;
        else if (log.rating > 0) ratingBuckets.bad++;
      }

      // Rewatches
      if (log.is_rewatch) {
        rewatchCount++;
      }

      // Cinema
      if (log.platform?.toLowerCase() === "cine") {
        cinemaCount++;
      }

      // Platforms
      if (log.platform) {
        platformCounts[log.platform] = (platformCounts[log.platform] || 0) + 1;
      }

      // Genres
      const genres = log.movie?.genres || [];
      genres.forEach((g: any) => {
        const name = typeof g === "string" ? g : g?.name;
        if (name) {
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        }
      });

      // Actors
      const cast = (log.movie as any)?.cast_data;
      if (Array.isArray(cast)) {
        cast.slice(0, 4).forEach((member: any) => {
          const actorName = typeof member === "string" ? member : member?.name;
          if (actorName) {
            if (!actorCounts[actorName]) {
              actorCounts[actorName] = { count: 0, character: member?.character };
            }
            actorCounts[actorName].count += 1;
          }
        });
      }

      // Decades
      if (log.movie?.release_date) {
        try {
          const year = new Date(log.movie.release_date).getFullYear();
          if (!isNaN(year)) {
            let decadeLabel = "Clásicos (<1980)";
            if (year >= 2020) decadeLabel = "2020s";
            else if (year >= 2010) decadeLabel = "2010s";
            else if (year >= 2000) decadeLabel = "2000s";
            else if (year >= 1990) decadeLabel = "1990s";
            else if (year >= 1980) decadeLabel = "1980s";
            decadeCounts[decadeLabel] = (decadeCounts[decadeLabel] || 0) + 1;
          }
        } catch {
          // ignore date parse error
        }
      }
    });

    const avgRating = ratedCount > 0 ? (sumRating / ratedCount).toFixed(1) : null;
    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalMinutes / (60 * 24)).toFixed(1);
    const rewatchPercent = totalMovies > 0 ? Math.round((rewatchCount / totalMovies) * 100) : 0;
    const cinemaPercent = totalMovies > 0 ? Math.round((cinemaCount / totalMovies) * 100) : 0;

    // Sort Top Genres
    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Sort Top Platforms
    const topPlatforms = Object.entries(platformCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort Top Actors
    const topActors = Object.entries(actorCounts)
      .map(([name, data]) => ({ name, count: data.count, character: data.character }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort Decades
    const decadesOrder = ["2020s", "2010s", "2000s", "1990s", "1980s", "Clásicos (<1980)"];
    const decades = decadesOrder
      .filter((d) => decadeCounts[d] > 0)
      .map((d) => ({ decade: d, count: decadeCounts[d] }));

    return {
      totalMovies,
      totalHours,
      totalDays,
      avgRating,
      ratedCount,
      rewatchCount,
      rewatchPercent,
      cinemaCount,
      cinemaPercent,
      ratingBuckets,
      topGenres,
      topPlatforms,
      topActors,
      decades,
    };
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="py-16 px-6 text-center rounded-3xl bg-[#141420]/60 border border-white/5 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-500">
          <BarChart3 className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Sin estadísticas disponibles</h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Cuando este usuario registre películas en su diario, aquí se generarán gráficos detallados de sus hábitos cinéfilos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Main Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Movies */}
        <div className="p-5 rounded-3xl bg-[#141420] border border-white/5 relative overflow-hidden group hover:border-white/15 transition shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition duration-500" />
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
            <Film className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-400">Total Películas</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">{stats.totalMovies}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Registradas en el diario</div>
        </div>

        {/* Total Hours */}
        <div className="p-5 rounded-3xl bg-[#141420] border border-white/5 relative overflow-hidden group hover:border-white/15 transition shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition duration-500" />
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-400">Tiempo Visto</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">{stats.totalHours} <span className="text-sm font-normal text-zinc-400">horas</span></div>
          <div className="text-[11px] text-zinc-500 mt-1">Aprox. {stats.totalDays} días enteros</div>
        </div>

        {/* Avg Rating */}
        <div className="p-5 rounded-3xl bg-[#141420] border border-white/5 relative overflow-hidden group hover:border-white/15 transition shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-600/20 transition duration-500" />
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <span className="text-xs font-semibold text-zinc-400">Calificación Media</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            {stats.avgRating ? `${stats.avgRating} ` : "—"}
            <span className="text-sm font-normal text-zinc-400">/ 10</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">{stats.ratedCount} películas calificadas</div>
        </div>

        {/* Cinema Experience */}
        <div className="p-5 rounded-3xl bg-[#141420] border border-white/5 relative overflow-hidden group hover:border-white/15 transition shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition duration-500" />
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <Ticket className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-400">En Sala de Cine</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">{stats.cinemaCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">{stats.cinemaPercent}% de sus funciones</div>
        </div>
      </div>

      {/* 2. Rating Distribution & Top Genres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Distribución de Notas</h3>
            </div>
            <span className="text-xs text-zinc-400">{stats.ratedCount} valoraciones</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "10 • Obra Maestra", count: stats.ratingBuckets.masterpiece, color: "bg-emerald-400" },
              { label: "8-9 • Excelente", count: stats.ratingBuckets.excellent, color: "bg-emerald-500/80" },
              { label: "6-7 • Buena", count: stats.ratingBuckets.good, color: "bg-amber-400" },
              { label: "4-5 • Regular", count: stats.ratingBuckets.average, color: "bg-orange-500" },
              { label: "1-3 • Decepcionante", count: stats.ratingBuckets.bad, color: "bg-rose-500" },
            ].map((bucket) => {
              const percent = stats.ratedCount > 0 ? Math.round((bucket.count / stats.ratedCount) * 100) : 0;
              return (
                <div key={bucket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">{bucket.label}</span>
                    <span className="font-bold text-zinc-400">
                      {bucket.count} <span className="text-zinc-500 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bucket.color} rounded-full transition-all duration-700`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Géneros Favoritos</h3>
            </div>
            <span className="text-xs text-zinc-400">Top preferencias</span>
          </div>

          {stats.topGenres.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No hay suficientes datos de géneros.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {stats.topGenres.map((g, idx) => {
                const maxCount = stats.topGenres[0]?.count || 1;
                const barWidth = Math.round((g.count / maxCount) * 100);
                const colors = [
                  "bg-red-500",
                  "bg-rose-500",
                  "bg-amber-500",
                  "bg-blue-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                ];
                return (
                  <div key={g.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300 flex items-center gap-2">
                        <span className="text-[10px] w-4 text-zinc-500 font-mono">#{idx + 1}</span>
                        {g.name}
                      </span>
                      <span className="font-bold text-zinc-400">
                        {g.count} <span className="text-zinc-500 font-normal">películas</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-700`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Top Platforms & Decades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Used Platforms */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dónde Mira Cine</h3>
          </div>

          {stats.topPlatforms.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 text-xs">
              Sin registros de plataformas
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.topPlatforms.map((p) => {
                const badge = getPlatformBadge(p.name);
                const pct = Math.round((p.count / stats.totalMovies) * 100);
                return (
                  <div
                    key={p.name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${badge.bg}`}>
                      {badge.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-black text-white">{p.count}</span>
                      <span className="text-[10px] text-zinc-500 ml-1">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Cast / Actors */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Actores Más Frecuentes</h3>
          </div>

          {stats.topActors.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 text-xs">
              No hay datos de reparto aún
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.topActors.map((actor, idx) => (
                <div
                  key={actor.name}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center border border-red-500/30">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-zinc-200 truncate max-w-[130px]">
                      {actor.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                    {actor.count} pelis
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decades Distribution */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Épocas de Estreno</h3>
          </div>

          {stats.decades.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 text-xs">
              Sin datos de fechas de estreno
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.decades.map((d) => {
                const pct = Math.round((d.count / stats.totalMovies) * 100);
                return (
                  <div
                    key={d.decade}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <span className="text-xs font-semibold text-zinc-300">{d.decade}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{d.count}</span>
                      <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileStats;
