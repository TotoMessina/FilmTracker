"use client";

import React, { useEffect, useState } from "react";
import { 
  Trophy, 
  Sparkles, 
  Compass, 
  Lightbulb, 
  Target, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Film,
  CheckCircle2
} from "lucide-react";
import { AIAwardsCoach } from "@/lib/groq/types";

interface AICoachProps {
  awardsName: string;
  categories: any[];
  userWatchedIds: Set<number>;
  watchlistTitles: string[];
  progressPercent: number;
}

export default function AICoach({
  awardsName,
  categories,
  userWatchedIds,
  watchlistTitles,
  progressPercent,
}: AICoachProps) {
  const [advice, setAdvice] = useState<AIAwardsCoach | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const processedCategories = categories.map((cat) => ({
        name: cat.name,
        nominees: (cat.nominees || []).map((n: any) => ({
          title: n.title,
          watched: userWatchedIds.has(n.tmdb_id),
        })),
      }));

      const res = await fetch("/api/ai/awards-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awardsName,
          categories: processedCategories,
          progressPercent,
          watchlist: watchlistTitles,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo obtener la asesoría de la IA.");
      }

      const data: AIAwardsCoach = await res.json();
      setAdvice(data);
    } catch (err: any) {
      console.warn("Error cargando el Coach de Premios:", err);
      setError("No se pudo conectar con el Coach de Premios en este momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories && categories.length > 0) {
      fetchAdvice();
    }
    // Re-fetch only if season or significant watch changes occur
  }, [awardsName, userWatchedIds.size, progressPercent]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1713] via-[#141420] to-[#12111c] border border-amber-500/30 shadow-2xl p-6 sm:p-8 space-y-6">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tu Coach de Premios
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" />
                IA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Estrategia personalizada, predicciones y datos clave para la gala
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchAdvice}
          disabled={loading}
          title="Actualizar análisis de la IA"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 relative z-10 animate-pulse pt-2">
          <div className="h-6 w-48 bg-white/5 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="h-28 bg-white/5 rounded-2xl border border-white/5" />
            <div className="h-28 bg-white/5 rounded-2xl border border-white/5" />
            <div className="h-28 bg-white/5 rounded-2xl border border-white/5" />
          </div>
          <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-300 text-sm flex items-center justify-between gap-3 relative z-10">
          <span>{error}</span>
          <button
            onClick={fetchAdvice}
            className="px-3 py-1 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-white text-xs font-semibold transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && advice && (
        <div className="space-y-6 relative z-10">
          {/* Section 1: Estrategia de Visualización */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Compass className="w-4 h-4" />
              <span>Estrategia: Top 3 Películas a Ver Primero</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {advice.strategy.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition line-clamp-1">
                        {item.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        {item.categories_covered === 1
                          ? "cubre 1 cat"
                          : `cubre ${item.categories_covered} cats`}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-4">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Mi Predicción IA (Visible always or in expanded mode) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Mi Predicción IA para Mejor Película</span>
              </span>
              <h4 className="text-lg font-black text-white">
                {advice.personal_prediction.title}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {advice.personal_prediction.reasoning}
              </p>
            </div>
          </div>

          {/* Collapsible Lower Sections */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-fade-in">
              {/* Section 3: ¿Sabías que...? */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-400">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span>¿Sabías que...?</span>
                </div>
                {advice.fun_fact.about && (
                  <span className="text-xs font-bold text-white block">
                    Sobre: {advice.fun_fact.about}
                  </span>
                )}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {advice.fun_fact.fact}
                </p>
              </div>

              {/* Section 4: Tu Meta */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${
                  advice.goal_assessment.achievable
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-amber-500/5 border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                      advice.goal_assessment.achievable ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Tu Meta de la Temporada</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      advice.goal_assessment.achievable
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {advice.goal_assessment.achievable ? "100% Alcanzable" : "Ritmo Estratégico"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {advice.goal_assessment.tip}
                </p>
              </div>
            </div>
          )}

          {/* Toggle "Ver más / Ver menos" */}
          <div className="pt-1 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white border border-white/10 transition"
            >
              <span>{isExpanded ? "Ver menos" : "Ver más detalles y meta"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
