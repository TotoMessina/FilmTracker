"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Dices, 
  Clock, 
  Users, 
  Smile, 
  Flame, 
  Brain, 
  Heart, 
  Play, 
  Tv, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Check, 
  Bookmark, 
  Film, 
  X,
  Compass
} from "lucide-react";
import { QuickDecisionResponse } from "@/lib/groq/types";
import { getImageUrl, getBackdropUrl, STREAMING_PROVIDERS } from "@/lib/tmdb/client";
import { formatRuntime } from "@/lib/utils/formatting";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { loadUserStreamingPlatforms } from "@/lib/services/streamingPlatforms";

// Step 1: Mood options
const MOOD_OPTIONS = [
  {
    id: "Quiero desconectar",
    title: "Quiero desconectar",
    desc: "Comedia ligera, confort, diversión sin vueltas",
    icon: Smile,
    gradient: "from-amber-500/20 via-orange-500/20 to-yellow-500/10",
    border: "border-amber-500/40 hover:border-amber-400",
    textColor: "text-amber-300",
    emoji: "🛋️",
  },
  {
    id: "Busco adrenalina",
    title: "Busco adrenalina",
    desc: "Acción desenfrenada, suspenso implacable, tensión máxima",
    icon: Flame,
    gradient: "from-red-600/25 via-rose-600/20 to-orange-600/10",
    border: "border-red-500/40 hover:border-red-400",
    textColor: "text-red-400",
    emoji: "⚡",
  },
  {
    id: "Quiero algo que me haga pensar",
    title: "Quiero algo que me haga pensar",
    desc: "Ciencia ficción cerebral, misterio, giros psicológicos",
    icon: Brain,
    gradient: "from-purple-600/25 via-indigo-600/20 to-blue-600/10",
    border: "border-purple-500/40 hover:border-purple-400",
    textColor: "text-purple-300",
    emoji: "🧠",
  },
  {
    id: "Quiero emocionarme/llorar",
    title: "Quiero emocionarme/llorar",
    desc: "Historias conmovedoras, calidez, drama emotivo inolvidable",
    icon: Heart,
    gradient: "from-pink-600/25 via-rose-600/20 to-purple-600/10",
    border: "border-pink-500/40 hover:border-pink-400",
    textColor: "text-pink-300",
    emoji: "🥹",
  },
];

// Step 2: Duration options
const DURATION_OPTIONS = [
  {
    id: "Menos de 90 min",
    title: "Menos de 90 min",
    subtitle: "Rápida y directa",
    desc: "Sin rellenos, directo al clímax para no desvelarte",
    emoji: "⏱️",
  },
  {
    id: "Estándar ~2 horas",
    title: "Estándar ~2 horas",
    subtitle: "El punto justo",
    desc: "El balance perfecto entre desarrollo y ritmo atrapante",
    emoji: "⏳",
  },
  {
    id: "Tengo toda la noche libre",
    title: "Toda la noche libre",
    subtitle: "Inmersión total",
    desc: "Películas de gran aliento, ritmo pausado o épica cinematográfica",
    emoji: "🍿",
  },
];

// Step 3: Company options
const COMPANY_OPTIONS = [
  {
    id: "Solo/a",
    title: "Solo/a",
    subtitle: "Momento íntimo",
    desc: "100% tu gusto, sin compromisos ni concesiones",
    emoji: "👤",
  },
  {
    id: "En pareja",
    title: "En pareja",
    subtitle: "Consenso perfecto",
    desc: "Entretenida para ambos, cero discusiones al elegir",
    emoji: "🍷",
  },
  {
    id: "Con amigos o familia",
    title: "Con amigos o familia",
    subtitle: "Plan colectivo",
    desc: "Ritmo ágil, entretenida y disfrutable para un grupo",
    emoji: "👥",
  },
];

export default function FastPickPage() {
  const { user } = useAuth();
  const { requireAuth, triggerConfetti } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | "result">(1);
  const [selectedMood, setSelectedMood] = useState<string>("Quiero desconectar");
  const [selectedDuration, setSelectedDuration] = useState<string>("Estándar ~2 horas");
  const [selectedCompany, setSelectedCompany] = useState<string>("Solo/a");

  const [userPlatforms, setUserPlatforms] = useState<number[]>([]);
  const [loadingDecision, setLoadingDecision] = useState(false);
  const [result, setResult] = useState<QuickDecisionResponse | null>(null);

  // Trailer modal state
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isWhereToWatchOpen, setIsWhereToWatchOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  // Load user platforms
  useEffect(() => {
    async function loadPlatforms() {
      const list = await loadUserStreamingPlatforms(user?.id);
      if (list && list.length > 0) {
        setUserPlatforms(list);
      }
    }
    loadPlatforms();
  }, [user?.id]);

  const togglePlatform = (id: number) => {
    if (userPlatforms.includes(id)) {
      setUserPlatforms(userPlatforms.filter((p) => p !== id));
    } else {
      setUserPlatforms([...userPlatforms, id]);
    }
  };

  const handleExecuteDecision = async (
    mood = selectedMood,
    duration = selectedDuration,
    company = selectedCompany
  ) => {
    setLoadingDecision(true);
    setStep("result");
    setResult(null);

    try {
      const res = await fetch("/api/ai/quick-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          duration,
          company,
          platforms: userPlatforms,
        }),
      });

      if (!res.ok) {
        throw new Error("Error obteniendo decisión.");
      }

      const data: QuickDecisionResponse = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Error en quick-decision:", e);
    } finally {
      setLoadingDecision(false);
    }
  };

  const handleStep3Click = (companyId: string) => {
    setSelectedCompany(companyId);
    handleExecuteDecision(selectedMood, selectedDuration, companyId);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setIsTrailerOpen(false);
    setIsWhereToWatchOpen(false);
    setInWatchlist(false);
  };

  const handleAddToWatchlist = async () => {
    if (!result?.tmdb_id) return;
    if (!requireAuth("guardar películas en tu Watchlist")) return;

    try {
      if (user) {
        const { error } = await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: result.tmdb_id,
        });
        if (!error) {
          setInWatchlist(true);
          triggerConfetti();
        }
      } else {
        const guestWl = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
        if (!guestWl.some((item: any) => item.tmdb_id === result.tmdb_id)) {
          guestWl.push({
            tmdb_id: result.tmdb_id,
            title: result.movieTitle,
            added_at: new Date().toISOString(),
          });
          localStorage.setItem("filmtracker_guest_watchlist", JSON.stringify(guestWl));
          setInWatchlist(true);
          triggerConfetti();
        }
      }
    } catch (e) {
      console.warn("Error agregando a watchlist:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-red-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-950/20">
          <Dices className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>Decisor en 3 Clics • Cero Parálisis</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          ¿No Sabés Qué Ver?
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
          Respondé 3 preguntas simples y la IA seleccionará <strong className="text-white">exactamente UNA sola película</strong> ideal para ver esta misma noche.
        </p>
      </div>

      {/* Platforms Bar */}
      {step !== "result" && (
        <div className="p-4 rounded-2xl bg-[#12101e] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>Tus servicios de streaming activos:</span>
            <span className="text-[11px] text-zinc-500">
              {userPlatforms.length > 0 ? `${userPlatforms.length} seleccionados` : "Todos"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {STREAMING_PROVIDERS.map((provider) => {
              const active = userPlatforms.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  onClick={() => togglePlatform(provider.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    active
                      ? "bg-red-600/20 border-red-500/50 text-white shadow-sm shadow-red-600/20"
                      : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w92${provider.logo}`}
                    alt={provider.name}
                    className="w-3.5 h-3.5 rounded object-contain"
                  />
                  <span>{provider.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Indicators */}
      {step !== "result" && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s
                  ? "w-10 bg-gradient-to-r from-red-600 to-amber-500"
                  : step > s
                  ? "w-6 bg-red-600/40"
                  : "w-6 bg-white/10"
              }`}
            />
          ))}
        </div>
      )}

      {/* STEP 1: MOOD */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Paso 1 de 3
            </span>
            <h2 className="text-2xl font-black text-white">¿Cómo estás hoy?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = selectedMood === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedMood(opt.id);
                    setStep(2);
                  }}
                  className={`p-5 rounded-3xl border bg-gradient-to-br ${opt.gradient} text-left transition-all duration-200 group relative flex flex-col justify-between min-h-[140px] shadow-lg cursor-pointer ${
                    isSelected ? "border-amber-400 ring-2 ring-amber-400/30 scale-[1.01]" : opt.border
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{opt.emoji}</span>
                    <div className="p-2 rounded-2xl bg-white/10 text-white group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black text-white group-hover:${opt.textColor} transition-colors`}>
                      {opt.title}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: DURATION */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a estado de ánimo</span>
            </button>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Paso 2 de 3
            </span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">¿Cuánto tiempo tenés?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = selectedDuration === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedDuration(opt.id);
                    setStep(3);
                  }}
                  className={`p-5 rounded-3xl border text-left transition-all duration-200 group flex flex-col justify-between min-h-[160px] shadow-lg cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30"
                      : "bg-[#141222] border-white/10 hover:border-amber-500/40 hover:bg-[#1a172c]"
                  }`}
                >
                  <div className="text-3xl mb-2">{opt.emoji}</div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block mb-0.5">
                      {opt.subtitle}
                    </span>
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: COMPANY */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a duración</span>
            </button>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Paso 3 de 3 (Final)
            </span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">¿Con quién mirás?</h2>
            <p className="text-xs text-zinc-400">
              Al tocar una opción la IA elegirá tu película automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {COMPANY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStep3Click(opt.id)}
                className="p-5 rounded-3xl border bg-[#141222] border-white/10 hover:border-purple-500/50 hover:bg-gradient-to-b hover:from-purple-950/30 hover:to-[#141222] text-left transition-all duration-200 group flex flex-col justify-between min-h-[160px] shadow-lg cursor-pointer hover:scale-[1.02]"
              >
                <div className="text-3xl mb-2">{opt.emoji}</div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 block mb-0.5">
                    {opt.subtitle}
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP RESULT: HERO CARD */}
      {step === "result" && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          {loadingDecision ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-red-600/30 animate-bounce">
                <Dices className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  Descartando miles de opciones...
                </h3>
                <p className="text-sm text-zinc-400">
                  Encontrando la única obra perfecta para tu plan de hoy.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-gradient-to-b from-[#18112a] via-[#120e20] to-[#0a0812] shadow-2xl shadow-amber-950/30">
              {/* Backdrop Glow */}
              {result.backdrop_path && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-lg scale-110 pointer-events-none"
                  style={{
                    backgroundImage: `url(${getBackdropUrl(result.backdrop_path)})`,
                  }}
                />
              )}

              {/* Header Badge */}
              <div className="relative px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-purple-950/40">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-red-500 text-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                    Elección Ganadora
                  </span>
                  <span className="text-xs text-zinc-300 font-medium">
                    {result.vibe}
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Probar otra combinación</span>
                </button>
              </div>

              {/* Main Content */}
              <div className="relative p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                  {/* Poster */}
                  <div className="w-40 sm:w-56 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/60 bg-zinc-900 aspect-[2/3] self-center md:self-start">
                    {result.poster_path ? (
                      <img
                        src={getImageUrl(result.poster_path, "w500")}
                        alt={result.movieTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Film className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400">
                          {result.year}
                        </span>
                        {result.runtime ? (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              {formatRuntime(result.runtime)}
                            </span>
                          </>
                        ) : null}
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{result.vote_average.toFixed(1)} TMDB</span>
                        </div>
                      </div>

                      <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        {result.movieTitle}
                      </h2>
                    </div>

                    {/* Verdict */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/30">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block mb-1">
                        Por qué es tu película de hoy:
                      </span>
                      <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed italic">
                        &ldquo;{result.reason}&rdquo;
                      </p>
                    </div>

                    {/* Overview */}
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {result.overview}
                    </p>

                    {/* Recommended Platform Highlight */}
                    {result.recommendedPlatform && (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-bold">
                        <Tv className="w-4 h-4 text-purple-400" />
                        <span>Disponible sugerida en: {result.recommendedPlatform}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* THE TWO GIANT ACTION BUTTONS REQUIRED */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {/* GIANT BUTTON 1: VER TRÁILER */}
                  <button
                    onClick={() => {
                      if (result.trailerUrl) {
                        setIsTrailerOpen(true);
                      } else {
                        window.open(
                          `https://www.youtube.com/results?search_query=${encodeURIComponent(
                            `${result.movieTitle} ${result.year} trailer oficial`
                          )}`,
                          "_blank"
                        );
                      }
                    }}
                    type="button"
                    className="py-5 px-6 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    <span>Ver Tráiler 🎬</span>
                  </button>

                  {/* GIANT BUTTON 2: DÓNDE VERLA */}
                  <button
                    onClick={() => setIsWhereToWatchOpen(true)}
                    type="button"
                    className="py-5 px-6 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition active:scale-95 cursor-pointer"
                  >
                    <Tv className="w-6 h-6" />
                    <span>Dónde Verla 📺</span>
                  </button>
                </div>

                {/* Footer Secondary Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/movie/${result.tmdb_id}`}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition"
                    >
                      Ver Ficha Completa
                    </Link>

                    <button
                      onClick={handleAddToWatchlist}
                      disabled={inWatchlist}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        inWatchlist
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                      }`}
                    >
                      {inWatchlist ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>En tu Watchlist</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Guardar en Lista</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Elegir de nuevo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Trailer Video Player Modal */}
      {isTrailerOpen && result?.trailerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={result.trailerUrl.replace("watch?v=", "embed/") + "?autoplay=1"}
              title={`Tráiler de ${result.movieTitle}`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Dónde Verla Modal */}
      {isWhereToWatchOpen && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsWhereToWatchOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-[#141224] border border-purple-500/30 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">Dónde Ver</h3>
              </div>
              <button
                onClick={() => setIsWhereToWatchOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Plataformas de streaming disponibles para <strong className="text-white">{result.movieTitle}</strong>:
            </p>

            {result.providers && result.providers.length > 0 ? (
              <div className="space-y-2">
                {result.providers.map((p) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                        alt={p.provider_name}
                        className="w-8 h-8 rounded-xl object-contain"
                      />
                      <span className="font-bold text-sm text-white">
                        {p.provider_name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      Incluido en suscripción
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-zinc-400 space-y-2">
                <p>
                  Disponible sugerida en catálogo: <strong className="text-white">{result.recommendedPlatform || "Streaming"}</strong>.
                </p>
                <p className="text-[11px] text-zinc-500">
                  También puedes alquilarla o comprarla en tiendas digitales (Apple TV, Google Play).
                </p>
              </div>
            )}

            <button
              onClick={() => setIsWhereToWatchOpen(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
