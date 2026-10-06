"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Film, 
  Star, 
  Award, 
  Trophy, 
  Clapperboard, 
  Calendar, 
  Clock, 
  Tv, 
  Globe2, 
  Heart, 
  Flame, 
  Share2, 
  RefreshCw, 
  Check, 
  ChevronRight,
  TrendingDown,
  User,
  PartyPopper
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";

interface YearStats {
  totalWatched: number;
  totalHours: number;
  bestMonth: string;
  topGenres: string[];
  topActors: string[];
  bestRated: Array<{ title: string; rating: number }>;
  worstRated: Array<{ title: string; rating: number }>;
  rewatches: string[];
  platformBreakdown: Record<string, number>;
  countriesWatched: number;
  cinemaVisits: number;
  avgRating: number;
}

interface WrappedSection {
  title: string;
  content: string;
  type: "apertura" | "cifras" | "genero" | "cumbre" | "tropiezo" | "personalidad" | "cierre" | "general";
}

const SPANISH_MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function CineWrappedPage() {
  const { user, isGuest } = useAuth();
  const { triggerConfetti } = useApp();

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<YearStats | null>(null);
  const [yearLogsCount, setYearLogsCount] = useState(0);
  const [wrappedText, setWrappedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Cycling phrases during generation
  const LOADING_MESSAGES = [
    "Rebobinando las cintas de tu memoria cinéfila...",
    "Calculando horas de pantalla, risas y sobresaltos...",
    "Identificando tus obsesiones cinematográficas...",
    "Examinando tus 10★ indiscutibles y tus placeres culpables...",
    "Redactando tu crónica personalizada del año...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Load and calculate user's year logs
  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        let allLogs: Log[] = [];

        if (user) {
          const { data, error } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id);

          if (error) throw error;
          allLogs = (data as Log[]) || [];
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          allLogs = guestLogs;
        }

        // Filter logs by current year
        const yearLogs = allLogs.filter((log) => {
          const dateStr = log.watched_at || log.created_at;
          if (!dateStr) return false;
          const logYear = new Date(dateStr).getFullYear();
          return logYear === currentYear;
        });

        setYearLogsCount(yearLogs.length);

        if (yearLogs.length === 0) {
          setStats(null);
          setLoading(false);
          return;
        }

        // 1. Total watched
        const totalWatched = yearLogs.length;

        // 2. Total hours
        const totalMinutes = yearLogs.reduce(
          (acc, l) => acc + (l.movie?.runtime && l.movie.runtime > 0 ? l.movie.runtime : 105),
          0
        );
        const totalHours = Math.round(totalMinutes / 60);

        // 3. Best month
        const monthCounts = new Array(12).fill(0);
        yearLogs.forEach((l) => {
          const dateStr = l.watched_at || l.created_at;
          if (dateStr) {
            const m = new Date(dateStr).getMonth();
            if (m >= 0 && m < 12) monthCounts[m]++;
          }
        });
        const maxMonthIndex = monthCounts.reduce(
          (maxI, count, i, arr) => (count > arr[maxI] ? i : maxI),
          0
        );
        const bestMonth = SPANISH_MONTHS[maxMonthIndex];

        // 4. Top Genres
        const genreMap: Record<string, number> = {};
        yearLogs.forEach((l) => {
          l.movie?.genres?.forEach((g) => {
            if (g.name) genreMap[g.name] = (genreMap[g.name] || 0) + 1;
          });
        });
        const topGenres = Object.entries(genreMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);

        // 5. Top Actors
        const actorMap: Record<string, number> = {};
        yearLogs.forEach((l) => {
          l.movie?.cast_data?.slice(0, 6).forEach((c) => {
            if (c.name) actorMap[c.name] = (actorMap[c.name] || 0) + 1;
          });
        });
        const topActors = Object.entries(actorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);

        // 6. Best rated & worst rated
        const ratedLogs = yearLogs.filter(
          (l) => typeof l.rating === "number" && l.rating > 0 && l.movie?.title
        );

        const sortedByRating = [...ratedLogs].sort((a, b) => (b.rating || 0) - (a.rating || 0));

        let bestRated = sortedByRating
          .filter((l) => (l.rating || 0) >= 9)
          .map((l) => ({ title: l.movie!.title, rating: l.rating! }));

        if (bestRated.length === 0 && sortedByRating.length > 0) {
          bestRated = sortedByRating.slice(0, 3).map((l) => ({
            title: l.movie!.title,
            rating: l.rating!,
          }));
        }

        let worstRated = [...sortedByRating]
          .reverse()
          .filter((l) => (l.rating || 0) <= 4)
          .map((l) => ({ title: l.movie!.title, rating: l.rating! }));

        if (worstRated.length === 0 && sortedByRating.length > 0) {
          const lowestRating = sortedByRating[sortedByRating.length - 1].rating || 0;
          if (lowestRating <= 6) {
            worstRated = [
              {
                title: sortedByRating[sortedByRating.length - 1].movie!.title,
                rating: lowestRating,
              },
            ];
          }
        }

        // 7. Rewatches
        const rewatches = yearLogs
          .filter((l) => l.is_rewatch && l.movie?.title)
          .map((l) => l.movie!.title);

        // 8. Platform Breakdown
        const platformBreakdown: Record<string, number> = {};
        let cinemaVisits = 0;
        yearLogs.forEach((l) => {
          const plat = l.platform || "Otros";
          platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;
          if (plat.toLowerCase().includes("cine") || plat.toLowerCase().includes("sala")) {
            cinemaVisits++;
          }
        });

        // 9. Countries watched
        const countriesSet = new Set<string>();
        yearLogs.forEach((l) => {
          l.movie?.production_countries?.forEach((c) => {
            if (c.name) countriesSet.add(c.name);
          });
        });
        const countriesWatched = countriesSet.size || 1;

        // 10. Avg Rating
        const validRatings = ratedLogs.map((l) => l.rating as number);
        const avgRating =
          validRatings.length > 0
            ? Number((validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1))
            : 0;

        setStats({
          totalWatched,
          totalHours,
          bestMonth,
          topGenres,
          topActors,
          bestRated,
          worstRated,
          rewatches,
          platformBreakdown,
          countriesWatched,
          cinemaVisits,
          avgRating,
        });

        // Check local storage for pre-saved wrapped text for this year
        const cachedSaved = localStorage.getItem(`filmtracker_wrapped_${currentYear}`);
        if (cachedSaved) {
          setWrappedText(cachedSaved);
        }
      } catch (err) {
        console.warn("Error cargando estadísticas del Wrapped:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [user, isGuest, currentYear]);

  // Request Wrapped from API
  const generateWrapped = async () => {
    if (!stats) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/year-wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          stats,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo generar el Cine Wrapped");
      }

      const data = await res.json();
      if (data.wrapped) {
        setWrappedText(data.wrapped);
        localStorage.setItem(`filmtracker_wrapped_${currentYear}`, data.wrapped);
        triggerConfetti();
      }
    } catch (err) {
      console.error("Error al generar el Cine Wrapped:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Copy Wrapped to clipboard
  const handleShare = () => {
    if (!wrappedText) return;
    const shareText = `🎬 Mi Cine Wrapped ${currentYear} en FilmTracker:\n\n${wrappedText}\n\n🍿 ¡Descubrí tu año de cine en FilmTracker!`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 3000);
  };

  // Parse markdown into structured sections
  const sections: WrappedSection[] = useMemo(() => {
    if (!wrappedText) return [];

    const blocks = wrappedText.split(/^##\s+/m);
    const parsed: WrappedSection[] = [];

    blocks.forEach((block) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      const firstLineEnd = trimmed.indexOf("\n");
      let title = "";
      let content = "";

      if (firstLineEnd !== -1) {
        title = trimmed.slice(0, firstLineEnd).trim();
        content = trimmed.slice(firstLineEnd + 1).trim();
      } else {
        title = trimmed;
        content = "";
      }

      const lowerTitle = title.toLowerCase();
      let type: WrappedSection["type"] = "general";

      if (lowerTitle.includes("apertura")) type = "apertura";
      else if (lowerTitle.includes("cifras")) type = "cifras";
      else if (lowerTitle.includes("género") || lowerTitle.includes("genero")) type = "genero";
      else if (lowerTitle.includes("cumbre")) type = "cumbre";
      else if (lowerTitle.includes("tropiezo")) type = "tropiezo";
      else if (lowerTitle.includes("personalidad")) type = "personalidad";
      else if (lowerTitle.includes("cierre")) type = "cierre";

      parsed.push({ title, content, type });
    });

    return parsed;
  }, [wrappedText]);

  // Section icon resolver
  const getSectionIcon = (type: WrappedSection["type"]) => {
    switch (type) {
      case "apertura":
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      case "cifras":
        return <Clock className="w-6 h-6 text-red-400" />;
      case "genero":
        return <Flame className="w-6 h-6 text-orange-400" />;
      case "cumbre":
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case "tropiezo":
        return <TrendingDown className="w-6 h-6 text-pink-400" />;
      case "personalidad":
        return <User className="w-6 h-6 text-purple-400" />;
      case "cierre":
        return <PartyPopper className="w-6 h-6 text-emerald-400" />;
      default:
        return <Film className="w-6 h-6 text-amber-400" />;
    }
  };

  const getSectionBorderClass = (type: WrappedSection["type"]) => {
    switch (type) {
      case "apertura":
        return "border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-red-950/20";
      case "cifras":
        return "border-red-500/30 bg-gradient-to-br from-red-950/30 to-purple-950/20";
      case "genero":
        return "border-orange-500/30 bg-gradient-to-br from-orange-950/30 to-amber-950/20";
      case "cumbre":
        return "border-yellow-500/40 bg-gradient-to-br from-yellow-950/40 via-amber-950/20 to-zinc-900";
      case "tropiezo":
        return "border-pink-500/30 bg-gradient-to-br from-pink-950/30 to-purple-950/20";
      case "personalidad":
        return "border-purple-500/40 bg-gradient-to-br from-purple-950/40 to-indigo-950/20";
      case "cierre":
        return "border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-amber-950/20";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  const hasEnoughData = yearLogsCount >= 10;

  return (
    <div className="relative min-h-[85vh] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#200707] via-[#130722] to-[#1d1204] -z-20" />
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(220, 38, 38, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 60%)"
        }}
      />

      {/* Giant Watermark Year */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] sm:text-[22rem] md:text-[28rem] font-black tracking-tighter text-white/[0.025] select-none pointer-events-none -z-10 leading-none">
        {currentYear}
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>Cine Wrapped • Edición Anual {currentYear}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[10px] font-black">IA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-yellow-400 tracking-tight leading-tight">
            Tu Año en Películas
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto">
            Transformamos tus registros, calificaciones y obsesiones del {currentYear} en una crónica narrativa épica.
          </p>
        </div>

        {/* Loading state initial */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <p className="text-sm font-semibold text-zinc-400">Recopilando tus películas del {currentYear}...</p>
          </div>
        )}

        {/* Not enough data banner */}
        {!loading && !hasEnoughData && (
          <div className="p-8 rounded-3xl bg-black/40 border border-amber-500/30 backdrop-blur-xl shadow-2xl text-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Necesitás al menos 10 películas registradas en {currentYear}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Actualmente tenés <strong className="text-amber-400">{yearLogsCount}</strong> {yearLogsCount === 1 ? "película registrada" : "películas registradas"} con fecha de este año. Registrá más títulos en tu diario para desbloquear tu historia cinematográfica con IA.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/search"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>Descubrir y Registrar</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/diary"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white transition border border-white/10"
              >
                Ver Mi Diario
              </Link>
            </div>
          </div>
        )}

        {/* Stats Summary Pills */}
        {!loading && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Películas</span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{stats.totalWatched}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Horas en Pantalla</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">{stats.totalHours}h</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Género Predilecto</span>
              <span className="text-base sm:text-lg font-black text-white mt-2 block truncate">{stats.topGenres[0] || "Variado"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Nota Promedio</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">{stats.avgRating}★</span>
            </div>
          </div>
        )}

        {/* Action Button: Generate / Regenerate */}
        {!loading && hasEnoughData && !generating && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!wrappedText ? (
              <button
                onClick={generateWrapped}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-black animate-spin" style={{ animationDuration: "3s" }} />
                <span>🎬 Generar mi Cine Wrapped {currentYear}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? "¡Copiado al Portapapeles!" : "Compartir Wrapped"}</span>
                </button>
                <button
                  onClick={generateWrapped}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerar Historia</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Epic Loading Animation while generating */}
        {generating && (
          <div className="py-16 p-8 rounded-3xl bg-black/60 border border-amber-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-6 max-w-xl mx-auto">
            {/* Animated Icon Chain */}
            <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600 via-amber-500 to-purple-600 animate-spin blur-lg opacity-60" />
              <div className="relative w-20 h-20 rounded-full bg-[#140b1e] border-2 border-amber-400/50 flex items-center justify-center shadow-inner">
                {loadingStep % 4 === 0 && <Clapperboard className="w-9 h-9 text-amber-400 animate-bounce" />}
                {loadingStep % 4 === 1 && <Film className="w-9 h-9 text-red-400 animate-pulse" />}
                {loadingStep % 4 === 2 && <Star className="w-9 h-9 text-yellow-400 animate-spin" style={{ animationDuration: "2s" }} />}
                {loadingStep % 4 === 3 && <Trophy className="w-9 h-9 text-amber-300 animate-bounce" />}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Creando tu Obra Maestra
              </h3>
              <p className="text-sm sm:text-base text-amber-300 font-medium transition-all duration-300 min-h-[3rem] flex items-center justify-center">
                {LOADING_MESSAGES[loadingStep]}
              </p>
            </div>

            {/* Pulsing bar */}
            <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Wrapped Sections Rendered */}
        {!generating && sections.length > 0 && (
          <div className="space-y-6 pt-4">
            {sections.map((section, idx) => {
              const borderClass = getSectionBorderClass(section.type);
              const icon = getSectionIcon(section.type);

              return (
                <div
                  key={`${section.title}-${idx}`}
                  className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.01] ${borderClass}`}
                >
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 shrink-0">
                      {icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                        Capítulo 0{idx + 1}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <div className="text-zinc-200 text-sm sm:text-base leading-relaxed space-y-2 font-normal pl-1 sm:pl-2">
                    {section.content.split("\n\n").map((para, pIdx) => {
                      // Format bold tokens safely
                      const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>');
                      return (
                        <p
                          key={pIdx}
                          dangerouslySetInnerHTML={{ __html: formatted }}
                          className="leading-relaxed"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Bottom Sharing Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/60 via-purple-950/60 to-amber-950/60 border border-amber-500/30 backdrop-blur-xl text-center space-y-4">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">¿Te gustó tu Cine Wrapped {currentYear}?</h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  Copiá tu historia cinéfila y compartila con amigos, en redes sociales o guardala como recuerdo.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={handleShare}
                  className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? "¡Copiado al Portapapeles!" : "Copiar Resumen Completo"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
