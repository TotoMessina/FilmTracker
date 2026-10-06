"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Clock, 
  Film, 
  Star, 
  Award, 
  Tv, 
  Sparkles,
  Calendar,
  Layers,
  Clapperboard,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Log, UserBadge } from "@/lib/supabase/types";
import { ALL_BADGES } from "@/lib/gamification/badges";
import { formatRuntime, formatDate, getRatingColor } from "@/lib/utils/formatting";

export default function StatsPage() {
  const { user, isGuest } = useAuth();

  const [logs, setLogs] = useState<Log[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatsData() {
      setLoading(true);
      try {
        if (user) {
          // Fetch logs with movie data
          const { data: logsData } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id);

          if (logsData) {
            setLogs(logsData as Log[]);
          }

          // Fetch user badges
          const { data: badgeData } = await supabase
            .from("user_badges")
            .select("badge_code")
            .eq("user_id", user.id);

          if (badgeData) {
            setUnlockedBadges(new Set(badgeData.map((b) => b.badge_code)));
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setLogs(guestLogs);
          // Unlock default starter badge if has logs
          if (guestLogs.length >= 1) {
            setUnlockedBadges(new Set(["NEWBIE"]));
          }
        }
      } catch (err) {
        console.warn("Stats load error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatsData();
  }, [user, isGuest]);

  // Calculations
  const currentYear = new Date().getFullYear();
  const currentYearLogs = logs.filter((log) => {
    const d = log.watched_at || log.created_at;
    return d && new Date(d).getFullYear() === currentYear;
  });

  const totalWatched = logs.length;
  const totalMinutes = logs.reduce((acc, log) => acc + (log.movie?.runtime || 105), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalDays = (totalMinutes / 1440).toFixed(1);

  // Ratings calculation
  const validRatings = logs.filter((l) => l.rating !== null && l.rating !== undefined).map((l) => l.rating as number);
  const averageRating = validRatings.length > 0 
    ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
    : "—";

  // Genres breakdown
  const genreCounts: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.movie?.genres) {
      log.movie.genres.forEach((g) => {
        genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
      });
    }
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Platforms breakdown
  const platformCounts: Record<string, number> = {};
  logs.forEach((log) => {
    const p = log.platform || "No especificada";
    platformCounts[p] = (platformCounts[p] || 0) + 1;
  });

  const sortedPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Estadísticas Cinéfilas
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Análisis completo de tus hábitos de visualización, gustos y logros alcanzados.
        </p>
      </div>

      {!user && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1c182a] to-[#12111c] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-white text-base">Modo Vista Previa de Estadísticas</h3>
            <p className="text-xs text-zinc-300">
              Inicia sesión o regístrate para registrar tu tiempo de pantalla, calcular tus géneros favoritos y desbloquear insignias.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/auth"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
            >
              Crear Cuenta
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition"
            >
              Acceder
            </Link>
          </div>
        </div>
      )}

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Movies */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Películas Vistas</span>
            <Film className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalWatched}</div>
          <p className="text-xs text-zinc-500 mt-1">en tu historial personal</p>
        </div>

        {/* Total Hours */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Horas de Pantalla</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalHours} <span className="text-sm text-zinc-400">h</span></div>
          <p className="text-xs text-zinc-500 mt-1">equivalente a {totalDays} días enteros</p>
        </div>

        {/* Average Rating */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Puntuación Promedio</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {averageRating} <span className="text-xs text-zinc-500">/ 10</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">sobre {validRatings.length} valoraciones</p>
        </div>

        {/* Rewatches */}
        <div className="p-5 rounded-2xl bg-[#141420] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rewatches</span>
            <Layers className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {logs.filter((l) => l.is_rewatch).length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">películas vueltas a disfrutar</p>
        </div>
      </div>

      {/* Two Column Breakdown: Genres & Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Genres */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Géneros Favoritos</h3>
            <span className="text-xs text-zinc-500">Top 6</span>
          </div>

          {sortedGenres.length > 0 ? (
            <div className="space-y-3">
              {sortedGenres.map(([genre, count]) => {
                const percentage = Math.round((count / totalWatched) * 100);
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-200">{genre}</span>
                      <span className="text-zinc-400">{count} películas ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Registra más películas para ver el desglose de tus géneros más vistos.
            </p>
          )}
        </div>

        {/* Favorite Platforms */}
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Plataformas de Visualización</h3>
            <Tv className="w-4 h-4 text-zinc-400" />
          </div>

          {sortedPlatforms.length > 0 ? (
            <div className="space-y-3">
              {sortedPlatforms.map(([platform, count]) => {
                const percentage = Math.round((count / totalWatched) * 100);
                return (
                  <div key={platform} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-200">{platform}</span>
                      <span className="text-zinc-400">{count} veces ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Aún no has indicado plataformas en tus registros.
            </p>
          )}
        </div>
      </div>

      {/* Gamification Achievements / Badges Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Logros Cinéfilos</h2>
          </div>
          <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            {unlockedBadges.size} de {ALL_BADGES.length} Desbloqueados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.has(badge.code);

            return (
              <div
                key={badge.code}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                  isUnlocked
                    ? "bg-[#161626] border-amber-500/30 shadow-lg shadow-amber-950/20"
                    : "bg-[#101018] border-white/5 opacity-50 grayscale"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? "bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40"
                      : "bg-zinc-800"
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white truncate">{badge.name}</h4>
                    {isUnlocked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cine Wrapped Annual Promo Banner */}
      {currentYearLogs.length > 0 && (
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950 via-[#260e1d] to-amber-950 border border-amber-500/40 shadow-2xl">
          {/* Animated Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[pulse_3s_infinite] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Edición Anual {currentYear} • IA</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                🎬 Tu Cine Wrapped {currentYear} está listo
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Descubrí tu año cinematográfico en una historia personalizada: tus horas, récords, géneros predilectos y momentos cumbre analizados con IA.
              </p>
            </div>

            <Link
              href="/wrapped"
              className="px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-amber-500/25 flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Ver mi Wrapped</span>
              <ChevronRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
