"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Share2,
  RotateCcw,
  ArrowRight,
  Film,
  Volume2,
  VolumeX,
  PlusCircle,
  Clapperboard,
  Flame,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { TriviaQuestion } from "@/lib/groq/types";

// Sound synthesizer using Web Audio API
function playQuizSound(type: "correct" | "wrong" | "tick") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // Audio playback blocked or unsupported
  }
}

// Sample fallback classic movies for test mode
const SAMPLE_CLASSIC_MOVIES = [
  { title: "El Padrino", year: "1972", director: "Francis Ford Coppola" },
  { title: "Pulp Fiction", year: "1994", director: "Quentin Tarantino" },
  { title: "Interstellar", year: "2014", director: "Christopher Nolan" },
  { title: "El Viaje de Chihiro", year: "2001", director: "Hayao Miyazaki" },
  { title: "Parasite", year: "2019", director: "Bong Joon-ho" },
  { title: "Casablanca", year: "1942", director: "Michael Curtiz" },
  { title: "Matrix", year: "1999", director: "Lana y Lilly Wachowski" },
];

export default function TriviaPage() {
  const { user, isGuest } = useAuth();
  const { triggerConfetti } = useApp();

  const [loadingLogs, setLoadingLogs] = useState(true);
  const [userMovies, setUserMovies] = useState<Array<{ title: string; year: string; director?: string }>>([]);
  
  // Game states
  const [gameState, setGameState] = useState<"lobby" | "loading_trivia" | "playing" | "results">("lobby");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<{ questionId: number; selected: number; correct: number }>>([]);
  
  // Game settings
  const [useTimer, setUseTimer] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);
  const [copiedShare, setCopiedShare] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user watched movies from logs
  useEffect(() => {
    async function loadLogs() {
      setLoadingLogs(true);
      try {
        let loadedLogs: Log[] = [];
        if (user) {
          const { data } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id);
          if (data) loadedLogs = data as Log[];
        } else if (isGuest) {
          loadedLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
        }

        // Map and deduplicate movies
        const movieMap = new Map<string, { title: string; year: string; director?: string }>();
        loadedLogs.forEach((log) => {
          const title = log.movie?.title?.trim();
          if (title && !movieMap.has(title.toLowerCase())) {
            const year = log.movie?.release_date
              ? new Date(log.movie.release_date).getFullYear().toString()
              : "";
            
            // Try extracting director from cast/crew if available
            movieMap.set(title.toLowerCase(), {
              title,
              year,
            });
          }
        });

        setUserMovies(Array.from(movieMap.values()));
      } catch (err) {
        console.warn("Error cargando películas para trivia:", err);
      } finally {
        setLoadingLogs(false);
      }
    }

    loadLogs();
  }, [user, isGuest]);

  // Timer effect during active question
  useEffect(() => {
    if (gameState !== "playing" || !useTimer || hasAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(20);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 6 && soundEnabled) {
          playQuizSound("tick");
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, hasAnswered, useTimer, soundEnabled]);

  // Handle timeout (counts as wrong answer, shows correct answer)
  const handleTimeOut = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedOption(-1); // -1 indicates time out

    if (soundEnabled) {
      playQuizSound("wrong");
    }

    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, selected: -1, correct: currentQ.correctIndex },
    ]);
  };

  // Start trivia session
  const startTrivia = async (customMovies?: Array<{ title: string; year: string; director?: string }>) => {
    const moviesToUse = customMovies || userMovies;
    if (moviesToUse.length === 0) return;

    setGameState("loading_trivia");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/generate-trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedMovies: moviesToUse }),
      });

      if (!res.ok) {
        throw new Error("No se pudo generar la trivia en este momento.");
      }

      const data = await res.json();
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("La IA no devolvió preguntas válidas.");
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setHasAnswered(false);
      setGameState("playing");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el servicio de IA.");
      setGameState("lobby");
    }
  };

  // Handle option selection
  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const currentQ = questions[currentIndex];
    setSelectedOption(index);
    setHasAnswered(true);

    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playQuizSound("correct");
      triggerConfetti();
    } else {
      if (soundEnabled) playQuizSound("wrong");
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, selected: index, correct: currentQ.correctIndex },
    ]);
  };

  // Move to next question or show results
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setGameState("results");
      if (score >= 4) {
        setTimeout(() => triggerConfetti(), 300);
      }
    }
  };

  // Titles based on score
  const getCinephileTitle = (points: number, total: number) => {
    const ratio = points / (total || 5);
    if (ratio === 1) {
      return {
        title: "👑 Maestro del Celuloide",
        badge: "Nivel Dios Cinéfilo",
        description: "¡Memoria fotográfica y devoción total! No se te escapa un solo fotograma de tus películas.",
        color: "from-amber-400 to-yellow-500",
      };
    }
    if (ratio >= 0.8) {
      return {
        title: "🎬 Erudito del Celuloide",
        badge: "Cinéfilo de Élite",
        description: "¡Excelente ojo cinematográfico! Dominás con soltura los secretos y detalles de tu diario.",
        color: "from-red-500 to-rose-600",
      };
    }
    if (ratio >= 0.6) {
      return {
        title: "🍿 Crítico de Primera Fila",
        badge: "Gran Aficionado",
        description: "Buen conocimiento cinéfilo, aunque algunos giros sutiles o directores te jugaron una pasada.",
        color: "from-blue-500 to-indigo-600",
      };
    }
    if (ratio >= 0.4) {
      return {
        title: "🎟️ Espectador Entusiasta",
        badge: "En Entrenamiento",
        description: "Disfrutás del cine a pleno, pero te convendría un rewatch atento para afilar los detalles.",
        color: "from-purple-500 to-violet-600",
      };
    }
    return {
      title: "☕ Amante del Pochoclo",
      badge: "Espectador Distraído",
      description: "¡Estabas más concentrado en el pochoclo que en la pantalla! Ideal para volver a ver tus clásicos.",
      color: "from-zinc-500 to-zinc-700",
    };
  };

  // Share result to clipboard or Web Share API
  const handleShare = async () => {
    const awarded = getCinephileTitle(score, questions.length);
    const shareText = `🎬 ¡Acabo de jugar al CineQuiz en FilmTracker!\n\n🏆 Puntaje: ${score}/${questions.length}\n🎖️ Rango: ${awarded.title} (${awarded.badge})\n\n¿Cuánto te acordás de las películas que viste? Ponete a prueba en FilmTracker!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi resultado en CineQuiz - FilmTracker",
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    } catch {
      alert("No se pudo copiar el resultado.");
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-[#07070b] text-white px-4 py-8 sm:py-12 max-w-4xl mx-auto selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                CineQuiz
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                IA Personalizada
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Trivias desafiantes generadas a partir de tus películas vistas
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition ${
              soundEnabled
                ? "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                : "bg-red-950/20 border-red-900/30 text-zinc-500"
            }`}
            title={soundEnabled ? "Silenciar efectos" : "Activar sonido"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Loading state for initial logs */}
      {loadingLogs && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
          <p className="text-sm text-zinc-400">Consultando tu diario cinematográfico...</p>
        </div>
      )}

      {/* STATE 1: Insufficient movies (< 5) */}
      {!loadingLogs && userMovies.length < 5 && gameState === "lobby" && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#131320] to-[#0d0d17] p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-inner">
            <Film className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            ¡Tu diario necesita más historias!
          </h2>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Registrá al menos 5 películas en tu diario para jugar tu trivia personalizada
          </div>

          <p className="text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed mb-8">
            Para que la IA pueda diseñar preguntas únicas sobre giros de trama, personajes y curiosidades sobre lo que viste, necesitamos que tengas registradas al menos 5 películas en tu cuenta.
          </p>

          {/* Progress bar to 5 movies */}
          <div className="max-w-xs mx-auto mb-8 bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-zinc-400">Progreso requerido</span>
              <span className="text-amber-400 font-bold">{userMovies.length} / 5</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min((userMovies.length / 5) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <PlusCircle className="w-4 h-4" />
              Explorar y Registrar Películas
            </Link>

            {/* Test button for instant play */}
            <button
              onClick={() => startTrivia(SAMPLE_CLASSIC_MOVIES)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 font-semibold text-sm transition"
            >
              <Clapperboard className="w-4 h-4 text-amber-400" />
              Probar Trivia con Clásicos del Cine
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: Lobby Ready (>= 5 movies) */}
      {!loadingLogs && userMovies.length >= 5 && gameState === "lobby" && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#11111c] to-[#0c0c14] p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Flame className="w-3.5 h-3.5" />
              Tu Diario está listo
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              ¿Cuánto recordás de tus películas?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              La IA elegirá un grupo al azar de tus <strong className="text-white">{userMovies.length} películas vistas</strong> y redactará 5 preguntas de opción múltiple hechas a tu medida.
            </p>
          </div>

          {/* Sample of user's movies */}
          <div className="mb-8 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
              <Film className="w-3.5 h-3.5" />
              Candidatas de tu diario (muestra):
            </div>
            <div className="flex flex-wrap gap-2">
              {userMovies.slice(0, 8).map((m, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium"
                >
                  {m.title} {m.year && <span className="text-zinc-500">({m.year})</span>}
                </span>
              ))}
              {userMovies.length > 8 && (
                <span className="px-2.5 py-1 rounded-xl bg-red-950/30 border border-red-800/30 text-xs text-red-400 font-semibold">
                  +{userMovies.length - 8} más
                </span>
              )}
            </div>
          </div>

          {/* Options & Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div
              onClick={() => setUseTimer(!useTimer)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                useTimer
                  ? "bg-red-500/10 border-red-500/40 text-white"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <Timer className={`w-5 h-5 ${useTimer ? "text-red-400" : "text-zinc-500"}`} />
                <div>
                  <div className="text-sm font-bold">Temporizador de 20s</div>
                  <div className="text-xs text-zinc-400">Contrarreloj para mayor emoción</div>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                  useTimer ? "bg-red-600 border-red-500" : "border-zinc-600"
                }`}
              >
                {useTimer && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
            </div>

            <div
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                soundEnabled
                  ? "bg-amber-500/10 border-amber-500/40 text-white"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <Volume2 className={`w-5 h-5 ${soundEnabled ? "text-amber-400" : "text-zinc-500"}`} />
                <div>
                  <div className="text-sm font-bold">Efectos de Sonido</div>
                  <div className="text-xs text-zinc-400">Retroalimentación acústica</div>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                  soundEnabled ? "bg-amber-600 border-amber-500" : "border-zinc-600"
                }`}
              >
                {soundEnabled && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => startTrivia()}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-extrabold text-base shadow-xl shadow-red-600/30 hover:scale-[1.03] active:scale-[0.98] transition inline-flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Comenzar CineQuiz Personalizado
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Generating Trivia with AI */}
      {gameState === "loading_trivia" && (
        <div className="rounded-3xl border border-white/10 bg-[#0e0e18] p-12 text-center max-w-lg mx-auto shadow-2xl">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">Creando tu CineQuiz...</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Nuestra IA está analizando las tramas, personajes y secretos de tus películas registradas para redactar 5 preguntas que desafíen tu memoria.
          </p>
        </div>
      )}

      {/* STATE 4: Playing Quiz */}
      {gameState === "playing" && questions.length > 0 && (
        <div className="space-y-6">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Pregunta <span className="text-white text-sm font-black">{currentIndex + 1}</span> de {questions.length}
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>{score} pts</span>
              </div>
            </div>

            {/* Timer Widget */}
            {useTimer && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm transition ${
                  timeLeft <= 5
                    ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                    : timeLeft <= 10
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                    : "bg-white/5 border-white/10 text-zinc-200"
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Main Question Card */}
          {(() => {
            const currentQ = questions[currentIndex];
            return (
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#131322] to-[#0c0c16] p-6 sm:p-8 shadow-2xl relative">
                {/* Movie Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 mb-4">
                  <Film className="w-3.5 h-3.5 text-red-400" />
                  <span>Sobre:</span>
                  <strong className="text-white font-bold">{currentQ.movieTitle}</strong>
                </div>

                {/* Question Title */}
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug mb-8">
                  {currentQ.question}
                </h2>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {currentQ.options.map((option, optIdx) => {
                    const isCorrect = optIdx === currentQ.correctIndex;
                    const isSelected = selectedOption === optIdx;

                    let btnStyles =
                      "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10 hover:border-white/20";
                    let letterStyles = "bg-white/10 text-zinc-400";

                    if (hasAnswered) {
                      if (isCorrect) {
                        btnStyles =
                          "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10";
                        letterStyles = "bg-emerald-500 text-black font-extrabold";
                      } else if (isSelected) {
                        btnStyles =
                          "bg-red-500/20 border-red-500 text-red-300 font-bold shadow-lg shadow-red-500/10";
                        letterStyles = "bg-red-500 text-white font-extrabold";
                      } else {
                        btnStyles = "bg-white/[0.02] border-white/5 text-zinc-500 opacity-40";
                        letterStyles = "bg-white/5 text-zinc-600";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 ${btnStyles} ${
                          !hasAnswered ? "hover:scale-[1.01] active:scale-[0.99]" : ""
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${letterStyles}`}
                        >
                          {optionLetters[optIdx]}
                        </div>

                        <div className="flex-1 text-sm pt-0.5 leading-snug">
                          {option}
                        </div>

                        {hasAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Next Button after user answered */}
                {hasAnswered && (
                  <div className="p-5 rounded-2xl bg-black/50 border border-white/10 mt-6 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedOption === currentQ.correctIndex ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          ¡Respuesta Correcta!
                        </div>
                      ) : selectedOption === -1 ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                          <Timer className="w-4 h-4" />
                          ¡Se agotó el tiempo!
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                          <XCircle className="w-4 h-4" />
                          Respuesta Incorrecta
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                      {currentQ.explanation}
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition"
                      >
                        <span>
                          {currentIndex + 1 < questions.length ? "Siguiente Pregunta" : "Ver Resultados"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* STATE 5: Final Results Screen */}
      {gameState === "results" && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#131324] to-[#0a0a14] p-6 sm:p-10 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Trophy Header */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-6 text-black shadow-xl shadow-amber-500/20">
            <Trophy className="w-10 h-10" />
          </div>

          {/* Title Awarded */}
          {(() => {
            const cinephile = getCinephileTitle(score, questions.length);
            return (
              <div className="mb-6">
                <div className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
                  {cinephile.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                  {cinephile.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {cinephile.description}
                </p>
              </div>
            );
          })()}

          {/* Score Circle */}
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-black/40 border border-white/10 mb-8">
            <div className="text-3xl font-black text-white">{score}</div>
            <div className="text-zinc-500 font-bold text-lg">/</div>
            <div className="text-lg font-bold text-zinc-400">{questions.length}</div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-2 border-l border-white/10">
              {Math.round((score / (questions.length || 5)) * 100)}% aciertos
            </div>
          </div>

          {/* Breakdown of questions */}
          <div className="text-left mb-8 max-w-xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Resumen de respuestas:
            </div>
            {questions.map((q, idx) => {
              const ans = userAnswers.find((a) => a.questionId === q.id);
              const isHit = ans && ans.selected === q.correctIndex;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate pr-3">
                    {isHit ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="font-semibold text-zinc-300 truncate">{q.movieTitle}:</span>
                    <span className="text-zinc-400 truncate">{q.question}</span>
                  </div>
                  <span
                    className={`font-bold shrink-0 ${
                      isHit ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isHit ? "+1 pt" : "0 pts"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleShare}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare ? "¡Copiado al Portapapeles!" : "Compartir Resultado"}
            </button>

            <button
              onClick={() => {
                setGameState("lobby");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 font-semibold text-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
              Jugar Otra Trivia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
