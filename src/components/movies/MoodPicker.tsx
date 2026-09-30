"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Sparkles, 
  Clock, 
  X, 
  Film, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Loader2,
  Users,
  Compass
} from "lucide-react";
import { WatchlistItem, Log } from "@/lib/supabase/types";
import { AIMoodPick } from "@/lib/groq/types";
import { getImageUrl } from "@/lib/tmdb/client";

interface MoodPickerProps {
  items: WatchlistItem[];
  recentLogs: Log[];
  onMoviePicked: (tmdbId: number, title: string) => void;
}

export const MOODS = [
  { id: "relax", label: "😌 Relajarme", desc: "Algo liviano y reconfortante" },
  { id: "thrill", label: "😱 Adrenalina", desc: "Suspenso o acción intensa" },
  { id: "think", label: "🧠 Reflexionar", desc: "Drama o cine profundo" },
  { id: "laugh", label: "😂 Reírme", desc: "Comedia que saque carcajadas" },
  { id: "cry", label: "😢 Emociones fuertes", desc: "Que me llegue al alma" },
  { id: "discover", label: "🌍 Descubrir", desc: "Algo diferente, de otro país" },
  { id: "nostalgic", label: "🕰️ Nostalgia", desc: "Clásico o película querida" },
  { id: "date", label: "💑 Noche especial", desc: "Para ver en compañía" },
];

const TIME_OPTIONS = [
  { id: "all", label: "Cualquiera" },
  { id: "90", label: "< 90 min" },
  { id: "120", label: "< 2 horas" },
  { id: "180", label: "< 3 horas" },
];

export function MoodPicker({ items, recentLogs, onMoviePicked }: MoodPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIMoodPick | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFindMovie = async () => {
    if (!selectedMood) return;

    setLoading(true);
    setError(null);

    const moodObj = MOODS.find((m) => m.id === selectedMood);

    // Format watchlist candidates
    const watchlistMovies = items.map((i) => ({
      tmdb_id: i.tmdb_id,
      title: i.title || i.movie?.title || "Película",
      genres: i.movie?.genres?.map((g: any) => (typeof g === "string" ? g : g.name)) || [],
      runtime: i.movie?.runtime || null,
      vote_average: i.movie?.vote_average || null,
      poster_path: i.movie?.poster_path || null,
    }));

    // Format recently watched movie titles
    const recentlyWatched = recentLogs
      .map((l) => l.movie?.title)
      .filter(Boolean) as string[];

    try {
      const res = await fetch("/api/ai/mood-picker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          moodLabel: moodObj ? `${moodObj.label} (${moodObj.desc})` : selectedMood,
          timeAvailable: selectedTime,
          watchlistMovies,
          recentlyWatched,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo obtener la recomendación.");
      }

      const data: AIMoodPick = await res.json();

      // If poster_path was not resolved in API, look it up in items
      if (!data.poster_path) {
        const matchItem = items.find((i) => i.tmdb_id === data.tmdb_id);
        data.poster_path = matchItem?.movie?.poster_path || null;
      }

      setResult(data);
    } catch (err: any) {
      console.error("MoodPicker error:", err);
      setError(err?.message || "Ocurrió un error al consultar al sommelier.");
    } finally {
      setLoading(false);
    }
  };

  const portalContainer = mounted ? document.getElementById("mood-picker-container") : null;

  const panelContent = (
    <div className="w-full bg-[#121220] border border-purple-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Sommelier de Watchlist
                </h3>
                <p className="text-xs text-zinc-400">
                  ¿Cómo te sentís hoy? La IA elegirá la obra ideal de tu lista según tu estado de ánimo.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Moods 4x2 Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              1. Seleccioná tu estado de ánimo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-pink-500 text-white shadow-md shadow-pink-500/20 scale-[1.02]"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="font-bold text-sm block leading-tight">{m.label}</span>
                    <span className="text-[11px] text-zinc-400 mt-1 line-clamp-1 block">
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>2. Tiempo disponible</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => {
                const isSelected = selectedTime === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTime(t.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
            <span className="text-xs text-zinc-400">
              {items.length} {items.length === 1 ? "película candidata" : "películas candidatas"} en tu Watchlist
            </span>

            <button
              onClick={handleFindMovie}
              disabled={!selectedMood || loading || items.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando al sommelier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Encontrar mi película</span>
                </>
              )}
            </button>
          </div>
        </div>
  );

  const modalContent = result ? (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setResult(null)}
    >
      <div
        className="relative w-full max-w-md bg-[#131322] border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setResult(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Perfect Match / Best Option Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
              result.perfect_match
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10"
                : "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-amber-500/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{result.perfect_match ? "Coincidencia perfecta" : "Mejor opción disponible"}</span>
          </span>
        </div>

        {/* Poster */}
        <div className="w-40 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative group bg-zinc-900">
          <img
            src={getImageUrl(result.poster_path, "w500")}
            alt={result.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Title & Reason */}
        <div className="space-y-2 max-w-sm">
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {result.title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
            &ldquo;{result.reason}&rdquo;
          </p>
        </div>

        {/* Informative chips: Ver con & Mejor momento */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-1">
          {result.watch_with && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2 text-xs">
              <Users className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Ver con:
                </span>
                <span className="text-zinc-200 font-medium">{result.watch_with}</span>
              </div>
            </div>
          )}

          {result.best_moment && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Mejor momento:
                </span>
                <span className="text-zinc-200 font-medium">{result.best_moment}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 w-full pt-3">
          <button
            onClick={() => {
              const id = result.tmdb_id;
              const title = result.title;
              setResult(null);
              onMoviePicked(id, title);
            }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>✓ Esta la veo</span>
          </button>

          <button
            onClick={() => setResult(null)}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Volver a elegir</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={items.length === 0}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
      >
        <span className="text-base">🎭</span>
        <span>Elegir por mood</span>
      </button>

      {/* Slide-down Panel */}
      {isOpen && (
        portalContainer ? createPortal(panelContent, portalContainer) : panelContent
      )}

      {/* Result Modal / Overlay */}
      {result && (
        mounted ? createPortal(modalContent, document.body) : modalContent
      )}
    </>
  );
}

export default MoodPicker;
