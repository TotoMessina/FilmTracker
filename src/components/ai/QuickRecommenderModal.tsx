"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  Film, 
  Star, 
  RotateCcw, 
  ArrowRight, 
  Plus, 
  HelpCircle,
  Clapperboard,
  Compass
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { getImageUrl } from "@/lib/tmdb/client";
import { QuickRecommendation } from "@/app/api/ai/quick-picks/route";

const QUICK_PROMPTS = [
  "Thriller con giros inesperados que vuelen la cabeza",
  "Comedia ligera e inteligente para desconectar",
  "Ciencia ficción reflexiva estilo Interstellar o Arrival",
  "Terror psicológico con atmósfera inquietante",
  "Película de época cautivadora con gran fotografía",
  "Cine coreano o japonés moderno de culto",
];

export function QuickRecommenderModal() {
  const { openLogModal } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<QuickRecommendation[]>([]);
  const [lastQuery, setLastQuery] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && recommendations.length === 0) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, recommendations.length]);

  const handleSubmit = async (searchPrompt?: string) => {
    const text = (searchPrompt || query).trim();
    if (!text || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setLastQuery(text);

    try {
      const res = await fetch("/api/ai/quick-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudieron obtener recomendaciones.");
      }

      setRecommendations(data.recommendations || []);
      setQuery("");
    } catch (err: any) {
      console.error("Quick recommendations error:", err);
      setErrorMsg(err.message || "Ocurrió un error. Intenta con otra búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendations([]);
    setErrorMsg(null);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Floating Action Button (FAB) that follows the user across all pages */}
      <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full text-white shadow-2xl transition-all duration-300 active:scale-95 border ${
            isOpen
              ? "bg-zinc-800 border-white/20 shadow-black/80"
              : "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 border-red-400/40 shadow-red-600/40 hover:shadow-red-600/60 hover:scale-105"
          }`}
          aria-label="Abrir recomendador rápido con IA"
          title="Recomendador rápido con IA"
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90 text-red-400" : "animate-pulse"}`} />
            {!isOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-tight">
            {isOpen ? "Cerrar CineBot" : "¿Qué ver hoy? (3 films)"}
          </span>
        </button>
      </div>

      {/* Mini Chat / Recommendation Popover Modal */}
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed bottom-16 sm:bottom-24 inset-x-3 sm:inset-auto sm:right-6 sm:w-[440px] max-h-[82vh] sm:max-h-[660px] z-50 bg-[#0e0e18]/95 backdrop-blur-2xl border border-red-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-250"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-red-600/15 via-rose-600/10 to-transparent flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Clapperboard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white tracking-tight">CineBot Express</h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[9px] font-extrabold uppercase">
                    3 Picks
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Dime qué buscas y te daré 3 joyas cinematográficas
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center justify-between gap-2">
                <span>{errorMsg}</span>
                <button onClick={handleReset} className="font-bold underline shrink-0 hover:text-white">
                  Reintentar
                </button>
              </div>
            )}

            {/* State A: Initial suggestions */}
            {recommendations.length === 0 && !loading && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <p className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ¿No sabes qué ver?
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Escribe cualquier género, vibra, premisa o referencias a películas que te hayan gustado.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Ideas para empezar con un toque:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map((promptText, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(promptText);
                          handleSubmit(promptText);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/30 text-left text-xs text-zinc-300 hover:text-white transition flex items-center justify-between group active:scale-98"
                      >
                        <span className="truncate pr-2">{promptText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 shrink-0 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* State B: Loading skeleton */}
            {loading && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-white">Consultando a tu curador de cine...</p>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Analizando el catálogo para darte las 3 mejores películas para: <strong className="text-zinc-200">&ldquo;{lastQuery}&rdquo;</strong>
                  </p>
                </div>
              </div>
            )}

            {/* State C: 3 Recommendations Cards */}
            {recommendations.length > 0 && !loading && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    3 recomendaciones para ti:
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Otra búsqueda</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={rec.tmdb_id || idx}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition flex gap-3 group"
                    >
                      {/* Poster */}
                      <Link
                        href={`/movie/${rec.tmdb_id}`}
                        onClick={() => setIsOpen(false)}
                        className="w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-md relative group-hover:opacity-90 transition"
                      >
                        {rec.poster_path ? (
                          <img
                            src={getImageUrl(rec.poster_path, "w185")}
                            alt={rec.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Film className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-black text-white flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </Link>

                      {/* Info & Reason */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <Link
                              href={`/movie/${rec.tmdb_id}`}
                              onClick={() => setIsOpen(false)}
                              className="font-bold text-sm text-white hover:text-red-400 transition truncate block"
                            >
                              {rec.title}
                            </Link>

                            {rec.vote_average && (
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {rec.vote_average}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                            {rec.year && <span>{rec.year}</span>}
                            {rec.director && (
                              <>
                                <span>•</span>
                                <span className="truncate">Dir. {rec.director}</span>
                              </>
                            )}
                          </div>

                          {/* Match reason */}
                          <p className="text-xs text-zinc-300 mt-1.5 line-clamp-2 leading-relaxed italic bg-white/5 p-2 rounded-xl border border-white/5">
                            &ldquo;{rec.match_reason}&rdquo;
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          <Link
                            href={`/movie/${rec.tmdb_id}`}
                            onClick={() => setIsOpen(false)}
                            className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <span>Ver ficha</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          <button
                            onClick={() =>
                              openLogModal({
                                id: rec.tmdb_id,
                                title: rec.title,
                                poster_path: rec.poster_path,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white font-semibold text-[11px] transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Registrar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="p-3 border-t border-white/10 bg-[#0a0a14] flex gap-2 items-center shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              placeholder="Ej: Thriller psicológico con atmósfera nórdica..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
            />

            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-red-600/30 active:scale-95 shrink-0"
              title="Pedir recomendaciones"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default QuickRecommenderModal;
