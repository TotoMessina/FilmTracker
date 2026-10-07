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
  PartyPopper,
  Copy,
  PlusCircle,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { MonthlyWrappedResponse, MonthlyWrappedStats } from "@/lib/groq/types";

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

function getLogDateInfo(dateStr: string | null | undefined): { year: number; month: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length >= 2) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    if (!isNaN(y) && !isNaN(m)) return { year: y, month: m };
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  return null;
}

export default function CineWrappedPage() {
  const { user, isGuest } = useAuth();
  const { triggerConfetti } = useApp();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonthIndex = useMemo(() => new Date().getMonth(), []);

  // View Mode: "annual" | "monthly"
  const [viewMode, setViewMode] = useState<"annual" | "monthly">("annual");

  // Selected month and year for Monthly Wrapped
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Common logs state
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Annual Wrapped states
  const [annualGenerating, setAnnualGenerating] = useState(false);
  const [annualStats, setAnnualStats] = useState<YearStats | null>(null);
  const [annualLogsCount, setAnnualLogsCount] = useState(0);
  const [annualWrappedText, setAnnualWrappedText] = useState<string | null>(null);
  const [copiedAnnual, setCopiedAnnual] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Monthly Wrapped states
  const [monthlyGenerating, setMonthlyGenerating] = useState(false);
  const [monthlyWrapped, setMonthlyWrapped] = useState<MonthlyWrappedResponse | null>(null);
  const [copiedCardIndex, setCopiedCardIndex] = useState<number | null>(null);
  const [copiedMonthlyAll, setCopiedMonthlyAll] = useState(false);

  // Cycling phrases during generation
  const LOADING_MESSAGES = [
    "Rebobinando las cintas de tu memoria cinéfila...",
    "Calculando horas de pantalla, risas y sobresaltos...",
    "Identificando tus obsesiones cinematográficas...",
    "Examinando tus 10★ indiscutibles y tus placeres culpables...",
    "Redactando tu crónica personalizada...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (annualGenerating || monthlyGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [annualGenerating, monthlyGenerating]);

  // Load all user logs once
  useEffect(() => {
    async function loadLogs() {
      setLoadingLogs(true);
      try {
        let loaded: Log[] = [];

        if (user) {
          const { data, error } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id);

          if (error) throw error;
          loaded = (data as Log[]) || [];
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          loaded = guestLogs;
        }

        setAllLogs(loaded);
      } catch (err) {
        console.warn("Error cargando logs para Wrapped:", err);
      } finally {
        setLoadingLogs(false);
      }
    }

    loadLogs();
  }, [user, isGuest]);

  // Compute Annual Stats when allLogs or currentYear changes
  useEffect(() => {
    if (allLogs.length === 0) {
      setAnnualStats(null);
      setAnnualLogsCount(0);
      return;
    }

    const yearLogs = allLogs.filter((log) => {
      const info = getLogDateInfo(log.watched_at || log.created_at);
      return info && info.year === currentYear;
    });

    setAnnualLogsCount(yearLogs.length);

    if (yearLogs.length === 0) {
      setAnnualStats(null);
      return;
    }

    const totalWatched = yearLogs.length;
    const totalMinutes = yearLogs.reduce(
      (acc, l) => acc + (l.movie?.runtime && l.movie.runtime > 0 ? l.movie.runtime : 105),
      0
    );
    const totalHours = Math.round(totalMinutes / 60);

    const monthCounts = new Array(12).fill(0);
    yearLogs.forEach((l) => {
      const info = getLogDateInfo(l.watched_at || l.created_at);
      if (info && info.month >= 0 && info.month < 12) monthCounts[info.month]++;
    });
    const maxMonthIndex = monthCounts.reduce(
      (maxI, count, i, arr) => (count > arr[maxI] ? i : maxI),
      0
    );
    const bestMonth = SPANISH_MONTHS[maxMonthIndex];

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
      const lowestRating = sortedByRating[sortedByRating.length - 1]?.rating || 0;
      if (lowestRating <= 6) {
        worstRated = [
          {
            title: sortedByRating[sortedByRating.length - 1].movie!.title,
            rating: lowestRating,
          },
        ];
      }
    }

    const rewatches = yearLogs
      .filter((l) => l.is_rewatch && l.movie?.title)
      .map((l) => l.movie!.title);

    const platformBreakdown: Record<string, number> = {};
    let cinemaVisits = 0;
    yearLogs.forEach((l) => {
      const plat = l.platform || "Otros";
      platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;
      if (plat.toLowerCase().includes("cine") || plat.toLowerCase().includes("sala")) {
        cinemaVisits++;
      }
    });

    const countriesSet = new Set<string>();
    yearLogs.forEach((l) => {
      l.movie?.production_countries?.forEach((c) => {
        if (c.name) countriesSet.add(c.name);
      });
    });
    const countriesWatched = countriesSet.size || 1;

    const validRatings = ratedLogs.map((l) => l.rating as number);
    const avgRating =
      validRatings.length > 0
        ? Number((validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1))
        : 0;

    setAnnualStats({
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

    // Check cached annual text
    const cachedSaved = localStorage.getItem(`filmtracker_wrapped_${currentYear}`);
    if (cachedSaved) {
      setAnnualWrappedText(cachedSaved);
    }
  }, [allLogs, currentYear]);

  // Compute Monthly Stats & check cache when selectedMonth or selectedYear changes
  const { monthlyLogs, monthlyStats } = useMemo(() => {
    const filtered = allLogs.filter((log) => {
      const info = getLogDateInfo(log.watched_at || log.created_at);
      return info && info.year === selectedYear && info.month === selectedMonth;
    });

    if (filtered.length === 0) {
      return { monthlyLogs: [], monthlyStats: null };
    }

    const totalWatched = filtered.length;
    const totalMinutes = filtered.reduce(
      (acc, l) => acc + (l.movie?.runtime && l.movie.runtime > 0 ? l.movie.runtime : 105),
      0
    );
    const totalHours = Math.round(totalMinutes / 60);

    const genreMap: Record<string, number> = {};
    filtered.forEach((l) => {
      l.movie?.genres?.forEach((g) => {
        if (g.name) genreMap[g.name] = (genreMap[g.name] || 0) + 1;
      });
    });
    const topGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "Cine Variado";

    const ratedLogs = filtered.filter(
      (l) => typeof l.rating === "number" && l.rating > 0 && l.movie?.title
    );
    const sorted = [...ratedLogs].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const bestRated = sorted[0]
      ? { title: sorted[0].movie!.title, rating: sorted[0].rating! }
      : filtered[0]?.movie?.title
      ? { title: filtered[0].movie.title }
      : null;

    const worstRated = sorted.length > 1
      ? { title: sorted[sorted.length - 1].movie!.title, rating: sorted[sorted.length - 1].rating! }
      : null;

    let cinemaVisits = 0;
    filtered.forEach((l) => {
      if (l.platform && l.platform.toLowerCase().includes("cine")) {
        cinemaVisits++;
      }
    });

    const validRatings = ratedLogs.map((l) => l.rating as number);
    const avgRating =
      validRatings.length > 0
        ? Number((validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1))
        : 7.5;

    const stats: MonthlyWrappedStats = {
      totalWatched,
      totalHours,
      topGenre,
      bestRated,
      worstRated,
      cinemaVisits,
      avgRating,
    };

    return { monthlyLogs: filtered, monthlyStats: stats };
  }, [allLogs, selectedMonth, selectedYear]);

  // Load cached monthly wrapped if present
  useEffect(() => {
    const cacheKey = `filmtracker_monthly_wrapped_${selectedYear}_${selectedMonth + 1}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setMonthlyWrapped(JSON.parse(cached));
      } catch {
        setMonthlyWrapped(null);
      }
    } else {
      setMonthlyWrapped(null);
    }
  }, [selectedMonth, selectedYear]);

  // Generate Annual Wrapped
  const generateAnnualWrapped = async () => {
    if (!annualStats) return;
    setAnnualGenerating(true);
    try {
      const res = await fetch("/api/ai/year-wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          stats: annualStats,
        }),
      });

      if (!res.ok) throw new Error("No se pudo generar el Cine Wrapped");

      const data = await res.json();
      if (data.wrapped) {
        setAnnualWrappedText(data.wrapped);
        localStorage.setItem(`filmtracker_wrapped_${currentYear}`, data.wrapped);
        triggerConfetti();
      }
    } catch (err) {
      console.error("Error al generar el Cine Wrapped anual:", err);
    } finally {
      setAnnualGenerating(false);
    }
  };

  // Generate Monthly Wrapped
  const generateMonthlyWrapped = async () => {
    if (!monthlyStats || monthlyLogs.length < 3) return;
    setMonthlyGenerating(true);
    try {
      const res = await fetch("/api/ai/monthly-wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth + 1,
          year: selectedYear,
          stats: monthlyStats,
        }),
      });

      if (!res.ok) throw new Error("No se pudo generar el Cine Wrapped mensual");

      const data: MonthlyWrappedResponse = await res.json();
      if (data && data.titular_del_mes) {
        setMonthlyWrapped(data);
        localStorage.setItem(
          `filmtracker_monthly_wrapped_${selectedYear}_${selectedMonth + 1}`,
          JSON.stringify(data)
        );
        triggerConfetti();
      }
    } catch (err) {
      console.error("Error al generar Cine Wrapped mensual:", err);
    } finally {
      setMonthlyGenerating(false);
    }
  };

  // Copy Annual Wrapped to clipboard
  const handleShareAnnual = () => {
    if (!annualWrappedText) return;
    const shareText = `🎬 Mi Cine Wrapped ${currentYear} en FilmTracker:\n\n${annualWrappedText}\n\n🍿 ¡Descubrí tu año de cine en FilmTracker!`;
    navigator.clipboard.writeText(shareText);
    setCopiedAnnual(true);
    triggerConfetti();
    setTimeout(() => setCopiedAnnual(false), 3000);
  };

  // Share or copy individual 9:16 card
  const handleShareStoryCard = async (index: number, title: string, text: string) => {
    const monthName = SPANISH_MONTHS[selectedMonth];
    const fullStoryText = `🎬 Cine Wrapped • ${monthName} ${selectedYear}\n${title}\n\n"${text}"\n\n🍿 FilmTracker`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cine Wrapped ${monthName} - FilmTracker`,
          text: fullStoryText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(fullStoryText);
    setCopiedCardIndex(index);
    triggerConfetti();
    setTimeout(() => setCopiedCardIndex(null), 2500);
  };

  // Share all 4 cards
  const handleShareAllMonthly = async () => {
    if (!monthlyWrapped) return;
    const monthName = SPANISH_MONTHS[selectedMonth];
    const fullText = `🎬 Mi Cine Wrapped de ${monthName} ${selectedYear} en FilmTracker:\n\n` +
      `📰 Titular: ${monthlyWrapped.titular_del_mes}\n\n` +
      `⭐ Destacada: ${monthlyWrapped.destacada_del_mes}\n\n` +
      `🔍 Radar Cinéfilo: ${monthlyWrapped.habito_curioso}\n\n` +
      `🏆 Veredicto: ${monthlyWrapped.veredicto}\n\n` +
      `🍿 Descubrí tus historias en FilmTracker!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cine Wrapped ${monthName} ${selectedYear}`,
          text: fullText,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback
      }
    }

    navigator.clipboard.writeText(fullText);
    setCopiedMonthlyAll(true);
    triggerConfetti();
    setTimeout(() => setCopiedMonthlyAll(false), 3000);
  };

  // Parse markdown into structured sections for annual wrapped
  const annualSections: WrappedSection[] = useMemo(() => {
    if (!annualWrappedText) return [];
    const blocks = annualWrappedText.split(/^##\s+/m);
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
  }, [annualWrappedText]);

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

  const hasEnoughAnnualData = annualLogsCount >= 10;
  const hasEnoughMonthlyData = monthlyLogs.length >= 3;

  return (
    <div className="relative min-h-[85vh] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 px-4 sm:px-6 lg:px-8 py-10 overflow-hidden select-none">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#200707] via-[#130722] to-[#1d1204] -z-20" />
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(220, 38, 38, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 60%)"
        }}
      />

      {/* Giant Watermark Year / Month */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] sm:text-[20rem] md:text-[26rem] font-black tracking-tighter text-white/[0.025] select-none pointer-events-none -z-10 leading-none">
        {viewMode === "annual" ? currentYear : SPANISH_MONTHS[selectedMonth].slice(0, 3).toUpperCase()}
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative">
        {/* Top View Mode Tabs: Anual vs Mensual */}
        <div className="flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex items-center gap-1 shadow-2xl">
            <button
              onClick={() => setViewMode("annual")}
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                viewMode === "annual"
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-red-600/30 scale-100"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Resumen Anual {currentYear}</span>
            </button>

            <button
              onClick={() => setViewMode("monthly")}
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                viewMode === "monthly"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30 scale-100"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Cine Wrapped Mensual (9:16)</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>
              {viewMode === "annual"
                ? `Cine Wrapped • Edición Anual ${currentYear}`
                : `Crónica Mensual • ${SPANISH_MONTHS[selectedMonth]} ${selectedYear}`}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[10px] font-black">IA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-yellow-400 tracking-tight leading-tight">
            {viewMode === "annual" ? "Tu Año en Películas" : "Historias del Mes (9:16)"}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto">
            {viewMode === "annual"
              ? `Transformamos tus registros y calificaciones del ${currentYear} en una crónica narrativa épica.`
              : "Tus 4 tarjetas verticales listas para compartir en Instagram Stories con tus obsesiones cinéfilas de cada mes."}
          </p>
        </div>

        {/* Global Loading state */}
        {loadingLogs && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <p className="text-sm font-semibold text-zinc-400">Recopilando tu bitácora cinematográfica...</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: ANUAL                                             */}
        {/* ========================================================= */}
        {!loadingLogs && viewMode === "annual" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Not enough annual data */}
            {!hasEnoughAnnualData && (
              <div className="p-8 rounded-3xl bg-black/40 border border-amber-500/30 backdrop-blur-xl shadow-2xl text-center space-y-5 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Film className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    Necesitás al menos 10 películas registradas en {currentYear}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Actualmente tenés <strong className="text-amber-400">{annualLogsCount}</strong> {annualLogsCount === 1 ? "película registrada" : "películas registradas"} con fecha de este año. Registrá más títulos en tu diario para desbloquear tu historia cinematográfica con IA.
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

            {/* Annual Stats Summary Pills */}
            {annualStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Películas</span>
                  <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{annualStats.totalWatched}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Horas en Pantalla</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">{annualStats.totalHours}h</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Género Predilecto</span>
                  <span className="text-base sm:text-lg font-black text-white mt-2 block truncate">{annualStats.topGenres[0] || "Variado"}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Nota Promedio</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">{annualStats.avgRating}★</span>
                </div>
              </div>
            )}

            {/* Action Buttons: Generate / Share Annual */}
            {hasEnoughAnnualData && !annualGenerating && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {!annualWrappedText ? (
                  <button
                    onClick={generateAnnualWrapped}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-black animate-spin" style={{ animationDuration: "3s" }} />
                    <span>🎬 Generar mi Cine Wrapped {currentYear}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleShareAnnual}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedAnnual ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      <span>{copiedAnnual ? "¡Copiado al Portapapeles!" : "Compartir Wrapped Anual"}</span>
                    </button>
                    <button
                      onClick={generateAnnualWrapped}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerar Historia</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Annual Generating Animation */}
            {annualGenerating && (
              <div className="py-16 p-8 rounded-3xl bg-black/60 border border-amber-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-6 max-w-xl mx-auto">
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

                <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden mx-auto">
                  <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            )}

            {/* Annual Sections */}
            {!annualGenerating && annualSections.length > 0 && (
              <div className="space-y-6 pt-4">
                {annualSections.map((section, idx) => {
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
                      onClick={handleShareAnnual}
                      className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      {copiedAnnual ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      <span>{copiedAnnual ? "¡Copiado al Portapapeles!" : "Copiar Resumen Completo"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: MENSUAL (SELECTOR DE MES & HISTORIAS 9:16)        */}
        {/* ========================================================= */}
        {!loadingLogs && viewMode === "monthly" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Month & Year Selector Control Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl shadow-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Seleccionar Mes a Explorar:
                  </span>
                </div>

                {/* Year Toggle */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-xs text-zinc-400 font-semibold">Año:</span>
                  {[currentYear, currentYear - 1].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                        selectedYear === yr
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Pills Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SPANISH_MONTHS.map((mName, mIdx) => {
                  const isSelected = selectedMonth === mIdx;
                  return (
                    <button
                      key={mName}
                      onClick={() => setSelectedMonth(mIdx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-400 shadow-md shadow-amber-500/20 scale-105"
                          : "bg-white/5 text-zinc-400 border-white/5 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monthly Condition: Minimum 3 movies */}
            {!hasEnoughMonthlyData && (
              <div className="p-8 rounded-3xl bg-black/40 border border-amber-500/25 backdrop-blur-xl shadow-2xl text-center space-y-5 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Film className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    ¡Registrá al menos 3 películas en {SPANISH_MONTHS[selectedMonth]} {selectedYear}!
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Para redactar tus 4 historias de Instagram de este mes, necesitás haber visto como mínimo 3 películas. Actualmente tenés{" "}
                    <strong className="text-amber-400 font-bold">{monthlyLogs.length}</strong> de 3 requeridas.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-xs mx-auto bg-zinc-900 border border-white/10 rounded-2xl p-4">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-zinc-400">Progreso del mes</span>
                    <span className="text-amber-400 font-bold">{monthlyLogs.length} / 3</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((monthlyLogs.length / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/search"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Registrar Películas de {SPANISH_MONTHS[selectedMonth]}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Monthly Ready with >= 3 movies */}
            {hasEnoughMonthlyData && (
              <div className="space-y-8">
                {/* Monthly Quick Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Vistas en {SPANISH_MONTHS[selectedMonth]}</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{monthlyStats?.totalWatched}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Horas del Mes</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">{monthlyStats?.totalHours}h</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Género Predominante</span>
                    <span className="text-base sm:text-lg font-black text-white mt-2 block truncate">{monthlyStats?.topGenre}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Visitas a Salas</span>
                    <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 block">{monthlyStats?.cinemaVisits}</span>
                  </div>
                </div>

                {/* Generate / Regenerate button */}
                {!monthlyGenerating && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {!monthlyWrapped ? (
                      <button
                        onClick={generateMonthlyWrapped}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                        <span>🎬 Crear Historias de {SPANISH_MONTHS[selectedMonth]} con IA</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleShareAllMonthly}
                          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {copiedMonthlyAll ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                          <span>{copiedMonthlyAll ? "¡Historias Copiadas!" : "Compartir Todo el Mes"}</span>
                        </button>

                        <button
                          onClick={generateMonthlyWrapped}
                          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Regenerar Historias</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Monthly Loading State */}
                {monthlyGenerating && (
                  <div className="py-16 p-8 rounded-3xl bg-black/60 border border-amber-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-6 max-w-xl mx-auto">
                    <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 animate-spin blur-lg opacity-60" />
                      <div className="relative w-20 h-20 rounded-full bg-[#140b1e] border-2 border-amber-400/50 flex items-center justify-center shadow-inner">
                        <Clapperboard className="w-9 h-9 text-amber-400 animate-bounce" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Armando tus Historias de {SPANISH_MONTHS[selectedMonth]}
                      </h3>
                      <p className="text-sm sm:text-base text-amber-300 font-medium min-h-[3rem] flex items-center justify-center">
                        {LOADING_MESSAGES[loadingStep]}
                      </p>
                    </div>

                    <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden mx-auto">
                      <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* THE 4 VERTICAL 9:16 INSTAGRAM STORIES CARDS */}
                {!monthlyGenerating && monthlyWrapped && (
                  <div className="space-y-6 pt-2">
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Formato Instagram Stories (9:16)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Tus 4 Tarjetas de {SPANISH_MONTHS[selectedMonth]}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Diseñadas para capturar pantalla o copiar directamente a tus redes sociales.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                      {/* CARD 1: TITULAR DEL MES */}
                      <div
                        id="story-card-1"
                        className="aspect-[9/16] w-full max-w-[320px] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-rose-500/40 bg-gradient-to-b from-[#3b0a1a] via-[#1a0814] to-[#0c050d] transition-transform hover:scale-[1.02]"
                      >
                        {/* Glow ambient */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />

                        {/* Top Story Header */}
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                            <span>01 • CRÓNICA DEL MES</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300">
                              {SPANISH_MONTHS[selectedMonth].toUpperCase()} {selectedYear}
                            </span>
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 to-transparent" />
                        </div>

                        {/* Story Center Body */}
                        <div className="my-auto space-y-4 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                            <Sparkles className="w-6 h-6" />
                          </div>

                          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                            EL TITULAR
                          </span>

                          <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                            "{monthlyWrapped.titular_del_mes}"
                          </h4>

                          <div className="flex items-center gap-2 pt-2">
                            <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-zinc-200">
                              🎬 {monthlyStats?.totalWatched} films
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-amber-300">
                              ⏱️ {monthlyStats?.totalHours} horas
                            </span>
                          </div>
                        </div>

                        {/* Story Bottom Watermark & Action */}
                        <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Film<span className="text-rose-500">Tracker</span>
                          </span>

                          <button
                            onClick={() =>
                              handleShareStoryCard(
                                1,
                                `📰 Titular del Mes (${SPANISH_MONTHS[selectedMonth]})`,
                                monthlyWrapped.titular_del_mes
                              )
                            }
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 font-bold"
                            title="Copiar o compartir esta historia"
                          >
                            {copiedCardIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[10px]">{copiedCardIndex === 1 ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                      </div>

                      {/* CARD 2: DESTACADA DEL MES */}
                      <div
                        id="story-card-2"
                        className="aspect-[9/16] w-full max-w-[320px] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-amber-500/40 bg-gradient-to-b from-[#3b2a0a] via-[#1f1608] to-[#0e0a04] transition-transform hover:scale-[1.02]"
                      >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                            <span>02 • PELÍCULA CUMBRE</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                              TOP 1
                            </span>
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-transparent" />
                        </div>

                        <div className="my-auto space-y-4 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                            <Trophy className="w-6 h-6" />
                          </div>

                          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                            LA DESTACADA
                          </span>

                          <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30">
                            <div className="text-base font-black text-amber-300 truncate">
                              {monthlyStats?.bestRated?.title || "Película del Mes"}
                            </div>
                            {monthlyStats?.bestRated?.rating && (
                              <div className="text-xs text-amber-400 font-bold mt-0.5 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{monthlyStats.bestRated.rating} / 10 puntos</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                            {monthlyWrapped.destacada_del_mes}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Film<span className="text-amber-500">Tracker</span>
                          </span>

                          <button
                            onClick={() =>
                              handleShareStoryCard(
                                2,
                                `⭐ La Destacada de ${SPANISH_MONTHS[selectedMonth]}`,
                                monthlyWrapped.destacada_del_mes
                              )
                            }
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 font-bold"
                          >
                            {copiedCardIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[10px]">{copiedCardIndex === 2 ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                      </div>

                      {/* CARD 3: HÁBITO CURIOSO */}
                      <div
                        id="story-card-3"
                        className="aspect-[9/16] w-full max-w-[320px] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-purple-500/40 bg-gradient-to-b from-[#2d0a3b] via-[#17061f] to-[#0b030e] transition-transform hover:scale-[1.02]"
                      >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                            <span>03 • RADAR CINÉFILO</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
                              HÁBITOS
                            </span>
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-purple-500 to-transparent" />
                        </div>

                        <div className="my-auto space-y-4 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                            <Compass className="w-6 h-6" />
                          </div>

                          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                            TENDENCIA & PATRÓN
                          </span>

                          <div className="inline-block px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                            Género Top: {monthlyStats?.topGenre}
                          </div>

                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                            {monthlyWrapped.habito_curioso}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Film<span className="text-purple-500">Tracker</span>
                          </span>

                          <button
                            onClick={() =>
                              handleShareStoryCard(
                                3,
                                `🔍 Hábito Curioso de ${SPANISH_MONTHS[selectedMonth]}`,
                                monthlyWrapped.habito_curioso
                              )
                            }
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 font-bold"
                          >
                            {copiedCardIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[10px]">{copiedCardIndex === 3 ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                      </div>

                      {/* CARD 4: EL VEREDICTO */}
                      <div
                        id="story-card-4"
                        className="aspect-[9/16] w-full max-w-[320px] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-emerald-500/40 bg-gradient-to-b from-[#0a3b2b] via-[#051f17] to-[#030e0b] transition-transform hover:scale-[1.02]"
                      >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                            <span>04 • EL VEREDICTO</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                              CIERRE
                            </span>
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
                        </div>

                        <div className="my-auto space-y-4 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                            <PartyPopper className="w-6 h-6" />
                          </div>

                          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                            CALIFICACIÓN DEL MES
                          </span>

                          <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-300">Nota Promedio</span>
                            <span className="text-lg font-black text-emerald-300">
                              {monthlyStats?.avgRating || 8}★
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                            {monthlyWrapped.veredicto}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Film<span className="text-emerald-500">Tracker</span>
                          </span>

                          <button
                            onClick={() =>
                              handleShareStoryCard(
                                4,
                                `🏆 Veredicto de ${SPANISH_MONTHS[selectedMonth]}`,
                                monthlyWrapped.veredicto
                              )
                            }
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 font-bold"
                          >
                            {copiedCardIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[10px]">{copiedCardIndex === 4 ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
