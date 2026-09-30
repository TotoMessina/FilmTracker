"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Loader2, 
  Feather, 
  Zap, 
  Smile,
  AlertCircle
} from "lucide-react";
import { Profile, Log } from "@/lib/supabase/types";
import { AIBioOption } from "@/lib/groq/types";

interface BioGeneratorProps {
  profile: Profile;
  logs: Log[];
  badges: number;
  watchedInCinema: number;
}

export function BioGenerator({
  profile,
  logs,
  badges,
  watchedInCinema,
}: BioGeneratorProps) {
  const [options, setOptions] = useState<AIBioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Calculate top genre
      const genreCounts: Record<string, number> = {};
      const actorCounts: Record<string, number> = {};
      const platformCounts: Record<string, number> = {};
      const highRatedTitles: string[] = [];
      let totalRating = 0;
      let ratingCount = 0;
      let rewatchCount = 0;

      logs.forEach((log) => {
        // Genres
        const genres = log.movie?.genres || [];
        genres.forEach((g: any) => {
          const gName = typeof g === "string" ? g : g?.name;
          if (gName) genreCounts[gName] = (genreCounts[gName] || 0) + 1;
        });

        // Actors
        const castData = (log.movie as any)?.cast_data;
        if (Array.isArray(castData)) {
          castData.slice(0, 4).forEach((actor: any) => {
            const aName = typeof actor === "string" ? actor : actor?.name;
            if (aName) actorCounts[aName] = (actorCounts[aName] || 0) + 1;
          });
        }

        // Platform
        if (log.platform) {
          platformCounts[log.platform] = (platformCounts[log.platform] || 0) + 1;
        }

        // Rewatch
        if (log.is_rewatch) {
          rewatchCount++;
        }

        // Ratings
        if (typeof log.rating === "number" && log.rating > 0) {
          totalRating += log.rating;
          ratingCount++;
          if (log.rating >= 4) {
            highRatedTitles.push(log.movie?.title || "Película");
          }
        }
      });

      const topGenre =
        Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "Cine de autor";

      const topActors = Object.entries(actorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      const mostUsedPlatform =
        Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "Streaming";

      const favoriteMovies = Array.from(new Set(highRatedTitles)).slice(0, 4);

      const avgRating = ratingCount > 0 ? (totalRating / ratingCount) * 2 : 7.0; // convert to 1-10 scale if needed

      const bodyPayload = {
        username: profile.username || "Cinéfilo",
        totalWatched: logs.length,
        topGenre,
        topActors,
        favoriteMovies,
        mostUsedPlatform,
        watchedInCinema,
        rewatchCount,
        badgesUnlocked: badges,
        avgRating,
      };

      const res = await fetch("/api/ai/bio-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudieron generar las bios.");
      }

      const data = await res.json();
      setOptions(data.options || []);
    } catch (err: any) {
      console.error("Error al generar bio cinéfila:", err);
      setError(err?.message || "Ocurrió un error al contactar con la IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    setSelectedOption(text);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const getStyleConfig = (style: string) => {
    const s = style.toLowerCase();
    if (s.includes("poét") || s.includes("poet")) {
      return {
        badge: "bg-purple-500/15 border-purple-500/30 text-purple-300",
        icon: Feather,
        isItalic: true,
      };
    }
    if (s.includes("humor") || s.includes("irón") || s.includes("iron")) {
      return {
        badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
        icon: Smile,
        isItalic: false,
      };
    }
    return {
      badge: "bg-sky-500/15 border-sky-500/30 text-sky-300",
      icon: Zap,
      isItalic: false,
    };
  };

  return (
    <div className="w-full bg-[#131322] border border-white/5 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Generador de Bio Cinéfila con IA
            </h3>
            <p className="text-xs text-zinc-400">
              Crea biografías originales y personalizadas con tu historial de FilmTracker.
            </p>
          </div>
        </div>

        {/* Trigger or Regenerate Button */}
        {options.length === 0 ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 border border-dashed border-amber-400/40 transition active:scale-95 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creando bios...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ Generar Bio Cinéfila</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Regenerar</span>
          </button>
        )}
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 pt-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-white/5 border border-white/5 animate-pulse space-y-2.5"
            >
              <div className="h-4 w-24 bg-white/10 rounded-full" />
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-3 w-3/4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Options Cards */}
      {!loading && options.length > 0 && (
        <div className="space-y-3 pt-1">
          {options.map((opt, idx) => {
            const config = getStyleConfig(opt.style);
            const Icon = config.icon;
            const isThisCopied = selectedOption === opt.text && copied;

            return (
              <div
                key={idx}
                className="group relative p-4 sm:p-5 rounded-2xl bg-[#171728] border border-white/10 hover:border-amber-500/30 transition-all duration-200 space-y-2.5 shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.badge}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.style}</span>
                  </span>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(opt.text)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border ${
                      isThisCopied
                        ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10"
                        : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                    }`}
                  >
                    {isThisCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>✓ Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <p
                  className={`text-sm leading-relaxed text-zinc-200 ${
                    config.isItalic ? "italic" : "font-normal"
                  }`}
                >
                  &ldquo;{opt.text}&rdquo;
                </p>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-1 text-xs text-zinc-400 px-1">
            <span>💡 Podés usar el texto copiado en tu perfil de redes</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BioGenerator;
