"use client";

import React, { useEffect, useState } from "react";
import { 
  Trophy, 
  Calendar, 
  Globe2, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Award,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { Log, MonthlyChallenge, UserMonthlyChallenges } from "@/lib/supabase/types";
import { 
  getCurrentMonthKey, 
  formatMonthName, 
  getOrLoadMonthlyChallenges 
} from "@/lib/services/challenges";

interface MonthlyChallengesCardProps {
  logs?: Log[];
  className?: string;
}

export function MonthlyChallengesCard({ logs = [], className = "" }: MonthlyChallengesCardProps) {
  const { user } = useAuth();
  const { triggerConfetti } = useApp();

  const [challengeSet, setChallengeSet] = useState<UserMonthlyChallenges | null>(null);
  const [loading, setLoading] = useState(true);

  const monthKey = getCurrentMonthKey();
  const monthTitle = formatMonthName(monthKey);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getOrLoadMonthlyChallenges(user?.id, logs, monthKey);
        if (!isCancelled) {
          setChallengeSet(data);
        }
      } catch (err) {
        console.warn("Error cargando retos mensuales:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    load();

    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.month === monthKey) {
        setChallengeSet(e.detail);
      }
    };

    window.addEventListener("filmtracker_challenges_updated", handleUpdate);
    return () => {
      isCancelled = true;
      window.removeEventListener("filmtracker_challenges_updated", handleUpdate);
    };
  }, [user?.id, logs.length, monthKey]);

  if (loading) {
    return (
      <div className={`p-6 rounded-3xl bg-[#141420] border border-white/5 animate-pulse space-y-4 ${className}`}>
        <div className="h-5 w-40 bg-zinc-800 rounded-lg" />
        <div className="space-y-3">
          <div className="h-16 bg-zinc-800/50 rounded-2xl" />
          <div className="h-16 bg-zinc-800/50 rounded-2xl" />
          <div className="h-16 bg-zinc-800/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!challengeSet || challengeSet.challenges.length === 0) return null;

  const completedCount = challengeSet.challenges.filter((c) => c.completed).length;
  const totalCount = challengeSet.challenges.length;
  const allCompleted = challengeSet.completed || completedCount === totalCount;

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "decade":
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "country":
        return <Globe2 className="w-4 h-4 text-emerald-400" />;
      case "runtime":
        return <Clock className="w-4 h-4 text-purple-400" />;
      case "genre":
      default:
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className={`relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#151422] via-[#12111c] to-[#18111a] border border-amber-500/20 shadow-xl space-y-5 ${className}`}>
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Retos Mensuales • {monthTitle}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Tus Misiones del Mes</span>
          </h3>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-2">
          {allCompleted ? (
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/20">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>¡Mes Completado!</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold">
              <strong className="text-amber-400">{completedCount}</strong> de {totalCount} completados
            </div>
          )}
        </div>
      </div>

      {/* All Completed Season Banner */}
      {allCompleted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-red-500/15 border border-amber-500/40 text-amber-200 flex items-center gap-3.5 shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-amber-300">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-black text-sm text-amber-300 uppercase tracking-wide">
              🏆 Misión Mensual Cumplida
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Completaste los 3 desafíos cinéfilos de este mes. Ampliaste tus horizontes y sumaste puntos de honor cinéfilo.
            </p>
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className="space-y-3">
        {challengeSet.challenges.map((challenge, idx) => {
          const isDone = challenge.completed;
          const percent = Math.min(
            Math.round((challenge.currentCount / challenge.targetCount) * 100),
            100
          );

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                isDone
                  ? "bg-emerald-950/15 border-emerald-500/30"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                    isDone
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-black/30 border-white/10"
                  }`}
                >
                  {getChallengeIcon(challenge.condition.type)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h5
                      className={`font-bold text-sm tracking-tight truncate ${
                        isDone ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-white"
                      }`}
                    >
                      {challenge.title}
                    </h5>
                    {isDone && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Completado ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Progress bar inside card */}
                  {!isDone && (
                    <div className="w-full max-w-xs h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Count Badge */}
              <div className="shrink-0 self-end sm:self-center">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {challenge.currentCount} / {challenge.targetCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default MonthlyChallengesCard;
