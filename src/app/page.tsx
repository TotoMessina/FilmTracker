"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Play, 
  Plus, 
  Flame, 
  Clock, 
  Film, 
  Calendar, 
  Star, 
  Info, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Database
} from "lucide-react";
import { 
  TMDBMovie, 
  getTrendingMovies, 
  getTopRatedMovies, 
  getBackdropUrl, 
  getImageUrl 
} from "@/lib/tmdb/client";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { MovieCard } from "@/components/movies/MovieCard";
import { AIRecommendations } from "@/components/movies/AIRecommendations";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { formatRuntime, formatDate, getRatingColor } from "@/lib/utils/formatting";

export default function DashboardPage() {
  const { user, profile, isGuest } = useAuth();
  const { openLogModal, isBlacklisted, lastUpdated } = useApp();

  const [heroMovie, setHeroMovie] = useState<TMDBMovie | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [watchlistTitles, setWatchlistTitles] = useState<string[]>([]);
  const [userStats, setUserStats] = useState({
    watchedCount: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch TMDB Trending & Top Rated
        const [trendingRes, topRatedRes] = await Promise.all([
          getTrendingMovies("day"),
          getTopRatedMovies(1),
        ]);

        if (trendingRes?.results?.length > 0) {
          // Hero movie: first trending with backdrop
          const hero = trendingRes.results.find((m) => m.backdrop_path) || trendingRes.results[0];
          setHeroMovie(hero);
          setTrendingMovies(trendingRes.results);
        }

        if (topRatedRes?.results?.length > 0) {
          setTopRatedMovies(topRatedRes.results);
        }

        // 2. Fetch User Logs, Stats & Watchlist
        if (user) {
          const [logsRes, watchlistRes] = await Promise.all([
            supabase
              .from("logs")
              .select("*, movie:movies(*)")
              .eq("user_id", user.id)
              .order("watched_at", { ascending: false })
              .limit(10),
            supabase
              .from("watchlist")
              .select("title, movie:movies(title)")
              .eq("user_id", user.id),
          ]);

          const logsData = logsRes.data;
          if (logsData) {
            setRecentLogs(logsData as Log[]);
            const count = logsData.length;
            const minutes = logsData.reduce((acc, curr) => acc + (curr.movie?.runtime || 105), 0);

            // Compute streak
            const uniqueDates = Array.from(new Set(logsData.map((l) => l.watched_at))).filter(Boolean);
            setUserStats({
              watchedCount: count,
              totalMinutes: minutes,
              streak: Math.min(uniqueDates.length, 7),
            });
          }

          if (watchlistRes.data) {
            const titles = watchlistRes.data
              .map((item: any) => item.title || item.movie?.title)
              .filter(Boolean);
            setWatchlistTitles(titles);
          }
        } else if (isGuest) {
          // Guest mode from localStorage
          const guestLogs: Log[] = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setRecentLogs(guestLogs.slice(0, 10));
          const count = guestLogs.length;
          const minutes = guestLogs.reduce((acc, curr) => acc + (curr.movie?.runtime || 105), 0);
          setUserStats({
            watchedCount: count,
            totalMinutes: minutes,
            streak: count > 0 ? 1 : 0,
          });
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, isGuest, lastUpdated]);

  return (
    <div className="space-y-10">
      {/* Hero Banner Section */}
      {heroMovie && (
        <section className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0c0c16]">
          {/* Backdrop Image with gradient overlay */}
          <div className="relative h-[420px] sm:h-[460px] lg:h-[520px] w-full overflow-hidden">
            <img
              src={getBackdropUrl(heroMovie.backdrop_path)}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-top filter brightness-75 scale-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-transparent w-full lg:w-2/3" />
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-10 lg:p-14 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Tendencia Hoy
              </span>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{heroMovie.vote_average.toFixed(1)}</span>
              </div>
              {heroMovie.release_date && (
                <span className="text-xs text-zinc-400">
                  {heroMovie.release_date.split("-")[0]}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2 sm:mb-3 drop-shadow-md">
              {heroMovie.title}
            </h1>

            <p className="text-xs sm:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 leading-relaxed max-w-2xl">
              {heroMovie.overview || "Sumérgete en la experiencia cinematográfica más destacada del día."}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => openLogModal(heroMovie)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar en mi Diario</span>
              </button>

              <Link
                href={`/movie/${heroMovie.id}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/15 transition"
              >
                <Info className="w-4 h-4" />
                <span>Más información</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Watched Count */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Películas Vistas
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {userStats.watchedCount}
            </div>
            <span className="text-xs text-zinc-500">en tu registro total</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Film className="w-6 h-6" />
          </div>
        </div>

        {/* Total Time */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tiempo Dedicado
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {formatRuntime(userStats.totalMinutes)}
            </div>
            <span className="text-xs text-zinc-500">horas frente a la pantalla</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Streak */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Racha Activa
            </span>
            <div className="text-3xl font-black text-white mt-1 flex items-center gap-1">
              <span>{userStats.streak}</span>
              <span className="text-sm font-bold text-rose-500">días</span>
            </div>
            <span className="text-xs text-zinc-500">constancia cinematográfica</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Trending Movies Carousel / Horizontal Slider */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Tendencias del Día</h2>
          </div>
          <Link
            href="/search?mode=trending"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {trendingMovies
            .filter((m) => !isBlacklisted(m.id))
            .slice(0, 6)
            .map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
      </section>

      {/* Top Rated Movies Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Obras Maestras Recomendadas</h2>
          </div>
          <Link
            href="/search?mode=top_rated"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <span>Ver más</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {topRatedMovies
            .filter((m) => !isBlacklisted(m.id))
            .slice(0, 6)
            .map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
      </section>

      {/* Recent Activity / Community Hub */}
      {recentLogs.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Tu Actividad Reciente</h2>
            </div>
            <Link
              href="/diary"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              <span>Ver Diario Completo</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#141420] border border-white/5 flex gap-4 hover:border-white/20 transition"
              >
                <div className="w-16 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                  <img
                    src={getImageUrl(log.custom_poster_path || log.movie?.poster_path, "w200")}
                    alt={log.movie?.title || "Película"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white truncate">
                      {log.movie?.title || "Película"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{formatDate(log.watched_at)}</span>
                      {log.platform && <span>• {log.platform}</span>}
                    </div>
                  </div>

                  {log.rating !== null && (
                    <div className="flex items-center gap-1 text-sm font-bold mt-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className={getRatingColor(log.rating)}>{log.rating}/10</span>
                      {log.is_rewatch && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 ml-1">
                          Rewatch
                        </span>
                      )}
                    </div>
                  )}

                  {log.review && (
                    <p className="text-xs text-zinc-400 line-clamp-1 italic mt-1">
                      &ldquo;{log.review}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Recommendations */}
      {!isGuest && user && (
        <AIRecommendations
          logs={recentLogs}
          watchlistTitles={watchlistTitles}
        />
      )}
    </div>
  );
}
