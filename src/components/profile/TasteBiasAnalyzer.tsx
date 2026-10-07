"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Sparkles,
  TrendingUp,
  Gavel,
  Compass,
  Copy,
  Check,
  RefreshCw,
  Film,
  Star,
  Info,
  Clock,
  Calendar,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { Log } from "@/lib/supabase/types";
import { TasteBiasResponse, TasteBiasStats } from "@/lib/groq/types";

interface TasteBiasAnalyzerProps {
  logs: Log[];
  userId: string;
  isMe: boolean;
  username?: string;
}

export default function TasteBiasAnalyzer({
  logs,
  userId,
  isMe,
  username = "este cinéfilo",
}: TasteBiasAnalyzerProps) {
  const [result, setResult] = useState<TasteBiasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);

  // Compute calculated statistics from logs
  const computedStats = useMemo<TasteBiasStats>(() => {
    if (useDemoData) {
      return {
        genreAverages: {
          "Ciencia Ficción": 8.8,
          "Acción": 8.1,
          "Drama": 6.2,
          "Comedia Romántica": 4.5,
          "Terror": 7.0,
          "Animación": 8.4,
        },
        decadeAverages: {
          "1980s": 7.9,
          "1990s": 8.5,
          "2000s": 7.2,
          "2010s": 7.8,
          "2020s": 5.9,
        },
        runtimeAverages: {
          "< 90 min": 6.1,
          "90 - 120 min": 7.4,
          "> 120 min": 8.6,
        },
        totalLogs: 24,
      };
    }

    const ratedLogs = logs.filter(
      (l) => l.rating !== null && l.rating !== undefined && Number(l.rating) > 0
    );

    const genreSums: Record<string, { sum: number; count: number }> = {};
    const decadeSums: Record<string, { sum: number; count: number }> = {};
    const runtimeSums: Record<string, { sum: number; count: number }> = {
      "< 90 min": { sum: 0, count: 0 },
      "90 - 120 min": { sum: 0, count: 0 },
      "> 120 min": { sum: 0, count: 0 },
    };

    ratedLogs.forEach((l) => {
      const rating = Number(l.rating);

      // Genres
      const genres = l.movie?.genres || [];
      genres.forEach((g: any) => {
        const name = typeof g === "string" ? g : g?.name;
        if (name) {
          if (!genreSums[name]) genreSums[name] = { sum: 0, count: 0 };
          genreSums[name].sum += rating;
          genreSums[name].count += 1;
        }
      });

      // Decades
      if (l.movie?.release_date) {
        const year = parseInt(l.movie.release_date.slice(0, 4), 10);
        if (!isNaN(year)) {
          let decadeKey = "";
          if (year < 1970) decadeKey = "Pre-70s";
          else if (year < 1980) decadeKey = "1970s";
          else if (year < 1990) decadeKey = "1980s";
          else if (year < 2000) decadeKey = "1990s";
          else if (year < 2010) decadeKey = "2000s";
          else if (year < 2020) decadeKey = "2010s";
          else decadeKey = "2020s";

          if (!decadeSums[decadeKey]) decadeSums[decadeKey] = { sum: 0, count: 0 };
          decadeSums[decadeKey].sum += rating;
          decadeSums[decadeKey].count += 1;
        }
      }

      // Runtimes
      const runtime = l.movie?.runtime;
      if (runtime && runtime > 0) {
        if (runtime < 90) {
          runtimeSums["< 90 min"].sum += rating;
          runtimeSums["< 90 min"].count += 1;
        } else if (runtime <= 120) {
          runtimeSums["90 - 120 min"].sum += rating;
          runtimeSums["90 - 120 min"].count += 1;
        } else {
          runtimeSums["> 120 min"].sum += rating;
          runtimeSums["> 120 min"].count += 1;
        }
      }
    });

    const genreAverages: Record<string, number> = {};
    Object.entries(genreSums).forEach(([g, val]) => {
      if (val.count >= 1) {
        genreAverages[g] = Math.round((val.sum / val.count) * 10) / 10;
      }
    });

    const decadeAverages: Record<string, number> = {};
    Object.entries(decadeSums).forEach(([d, val]) => {
      if (val.count >= 1) {
        decadeAverages[d] = Math.round((val.sum / val.count) * 10) / 10;
      }
    });

    const runtimeAverages: Record<string, number> = {};
    Object.entries(runtimeSums).forEach(([r, val]) => {
      if (val.count > 0) {
        runtimeAverages[r] = Math.round((val.sum / val.count) * 10) / 10;
      }
    });

    return {
      genreAverages,
      decadeAverages,
      runtimeAverages,
      totalLogs: ratedLogs.length,
    };
  }, [logs, useDemoData]);

  // Load cached bias roast on mount if available
  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const cacheKey = `filmtracker_taste_bias_${userId}`;
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.data) {
          setResult(parsed.data);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [userId]);

  const handleAnalyze = async (forceRefresh = false) => {
    if (computedStats.totalLogs === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/taste-bias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: computedStats }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo completar el análisis de sesgos.");
      }

      const data: TasteBiasResponse = await res.json();
      setResult(data);

      if (typeof window !== "undefined" && userId && !useDemoData) {
        try {
          localStorage.setItem(
            `filmtracker_taste_bias_${userId}`,
            JSON.stringify({
              data,
              totalLogs: computedStats.totalLogs,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          // Ignore
        }
      }
    } catch (err: any) {
      console.error("Taste Bias analysis failed:", err);
      setError(err.message || "Error conectando con la IA de análisis cinéfilo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const shareText = `🎭 Mi Roast Cinéfilo en FilmTracker:

🩺 Diagnóstico:
${result.diagnosis}

📈 Lo que inflo de nota (${result.overvalued_genre.genre}):
${result.overvalued_genre.comment}

🔨 Con lo que no perdono nada (${result.harsh_criticism.target}):
${result.harsh_criticism.comment}

🍿 Placer culposo:
${result.guilty_pleasure_pattern}

💡 Consejo del crítico:
${result.advice}

Descubrí tus propios sesgos cinéfilos en FilmTracker!`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const hasEnoughData = computedStats.totalLogs >= 3 || useDemoData;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#181216] to-[#12121e] border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Taste Roast & Bias Analyzer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Analizador de Sesgos Cinéfilos 🎭
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
              Un crítico implacable pero de humor afectuoso analiza tus calificaciones en el diario para revelar qué géneros inflás, con qué épocas no tenés piedad y tus contradicciones más inconfesables.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {hasEnoughData ? (
              <button
                onClick={() => handleAnalyze(true)}
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm shadow-xl shadow-red-900/40 transition flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Roasteando criterio...</span>
                  </>
                ) : result ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white" />
                    <span>Volver a Analizar Sesgos</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>Analizar mis Sesgos Cinéfilos</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  setUseDemoData(true);
                }}
                className="px-5 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Simular con Datos Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              <strong className="text-white">{computedStats.totalLogs}</strong> películas calificadas
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>
              <strong className="text-white">
                {Object.keys(computedStats.genreAverages).length}
              </strong> géneros con promedio
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              <strong className="text-white">
                {Object.keys(computedStats.decadeAverages).length}
              </strong> décadas registradas
            </span>
          </div>
          {useDemoData && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">
              Modo Demostración Activo
            </span>
          )}
        </div>
      </div>

      {/* Insufficient data warning */}
      {!hasEnoughData && (
        <div className="rounded-3xl bg-[#141420] border border-amber-500/20 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Se necesitan al menos 3 películas calificadas
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Para que la IA pueda detectar patrones reales de sesgo, indulgencias y placeres culposos, calificá al menos 3 películas en tu diario.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setUseDemoData(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Probar demostración con perfil cinéfilo</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-3xl bg-[#141420] border border-white/5 p-12 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Flame className="w-16 h-16 text-amber-500 animate-bounce" />
            <Sparkles className="w-6 h-6 text-red-500 absolute -top-1 -right-1 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">
              Consultando al crítico más mordaz...
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              Analizando tus 10/10 sospechosos, contrastando tus promedios por década y buscando tus contradicciones más graciosas.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-3xl bg-red-950/20 border border-red-500/20 p-5 flex items-center gap-3 text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && !loading && (
        <div className="space-y-5 animate-in fade-in duration-500">
          {/* Top Actions: Copy and Re-analyze */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnóstico completado</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/5 cursor-pointer"
                title="Copiar resultado para compartir"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Roast</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 1: Diagnosis (Hero card) */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1a131b] via-[#141420] to-[#121218] border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90">
                  Cuadro Clínico
                </span>
                <h3 className="text-xl font-black text-white">Diagnóstico General</h3>
              </div>
            </div>
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal pt-1">
              {result.diagnosis}
            </p>
          </div>

          {/* Cards 2 & 3: Overvalued & Harsh Criticism (2 columns on tablet/desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Overvalued Genre */}
            <div className="rounded-3xl bg-[#141420] border border-emerald-500/20 p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        Indulgencia Absoluta
                      </span>
                      <h4 className="text-base font-bold text-white">Lo que inflás de nota</h4>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                    {result.overvalued_genre.genre}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                  {result.overvalued_genre.comment}
                </p>
              </div>
            </div>

            {/* Harsh Criticism */}
            <div className="rounded-3xl bg-[#141420] border border-rose-500/20 p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow">
                      <Gavel className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                        Cero Tolerancia
                      </span>
                      <h4 className="text-base font-bold text-white">Con lo que sos implacable</h4>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-black">
                    {result.harsh_criticism.target}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                  {result.harsh_criticism.comment}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Guilty Pleasure Pattern */}
          <div className="rounded-3xl bg-[#141420] border border-purple-500/20 p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                  Revelación Inconfesable
                </span>
                <h4 className="text-base font-bold text-white">Patrón de Placer Culposo</h4>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
              {result.guilty_pleasure_pattern}
            </p>
          </div>

          {/* Card 5: Advice from Critic */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-950/20 via-[#18151f] to-amber-950/20 border border-amber-500/20 p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Prescripción Cinéfila
                </span>
                <h4 className="text-base font-bold text-white">Consejo del Crítico</h4>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed italic pt-1">
              "{result.advice}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
