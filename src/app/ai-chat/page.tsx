"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Send, 
  Sparkles, 
  Bot, 
  Film, 
  User, 
  Lock, 
  Loader2, 
  Compass, 
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SystemContext {
  username: string;
  totalWatched: number;
  topGenres: string[];
  favoriteMovies: string[];
  worstRated: string[];
  favoriteActors: string[];
  watchlistCount: number;
}

const STARTER_SUGGESTIONS = [
  "¿Qué debería ver este fin de semana?",
  "Analizá mi perfil cinematográfico",
  "¿Tenemos gustos similares?",
  "Recomendate tu película favorita",
];

export default function CineBuddyChatPage() {
  const { user, profile, isGuest } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemContext, setSystemContext] = useState<SystemContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages or stream chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load user profile and cinema context
  useEffect(() => {
    if (!user) {
      setLoadingContext(false);
      return;
    }

    async function loadCinemaProfile() {
      setLoadingContext(true);
      try {
        const [logsRes, wlRes] = await Promise.all([
          supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user!.id)
            .order("watched_at", { ascending: false })
            .limit(50),
          supabase
            .from("watchlist")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id),
        ]);

        const logs: Log[] = (logsRes.data as Log[]) || [];
        const watchlistCount = wlRes.count || 0;

        const genreCounts: Record<string, number> = {};
        const actorCounts: Record<string, number> = {};
        const ratedHigh: string[] = [];
        const ratedLow: string[] = [];

        logs.forEach((log) => {
          // Genres
          const genres = log.movie?.genres || [];
          genres.forEach((g: any) => {
            const gName = typeof g === "string" ? g : g?.name;
            if (gName) genreCounts[gName] = (genreCounts[gName] || 0) + 1;
          });

          // Ratings
          const rating = typeof log.rating === "number" ? log.rating : null;
          const title = log.movie?.title || "Película";
          if (rating !== null) {
            if (rating >= 4) {
              ratedHigh.push(title);
            } else if (rating <= 2.5) {
              ratedLow.push(title);
            }
          }

          // Actors from cast_data
          const castData = (log.movie as any)?.cast_data;
          if (Array.isArray(castData)) {
            castData.slice(0, 5).forEach((actor: any) => {
              const actorName = typeof actor === "string" ? actor : actor?.name;
              if (actorName) {
                actorCounts[actorName] = (actorCounts[actorName] || 0) + 1;
              }
            });
          }
        });

        const topGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([g]) => g);

        const favoriteActors = Object.entries(actorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([a]) => a);

        const favoriteMovies = Array.from(new Set(ratedHigh)).slice(0, 5);
        const worstRated = Array.from(new Set(ratedLow)).slice(0, 3);
        const username =
          profile?.username ||
          user!.user_metadata?.username ||
          user!.email?.split("@")[0] ||
          "Cinéfilo";

        const context: SystemContext = {
          username,
          totalWatched: logs.length,
          topGenres,
          favoriteMovies,
          worstRated,
          favoriteActors,
          watchlistCount,
        };

        setSystemContext(context);

        // Welcome message mentioning username and watch count
        const welcome = `¡Hola, ${username}! 🎬 Soy CineBuddy, tu asistente cinéfilo personal en FilmTracker.

Conozco tu historial: llevas ${logs.length} ${
          logs.length === 1 ? "película registrada" : "películas registradas"
        }${
          topGenres.length > 0 ? ` y tus gustos se inclinan hacia ${topGenres.join(", ")}` : ""
        }. Además, tienes ${watchlistCount} en tu watchlist pendientes por ver.

¿De qué charlamos hoy? ¿Buscamos qué ver esta noche, analizamos un director o debatimos sobre alguna joya cinematográfica?`;

        setMessages([{ role: "assistant", content: welcome }]);
      } catch (err) {
        console.error("Error al cargar contexto de CineBuddy:", err);
      } finally {
        setLoadingContext(false);
      }
    }

    loadCinemaProfile();
  }, [user, profile]);

  const sendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Placeholder message for assistant streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/cinema-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          systemContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo conectar con CineBuddy.");
      }

      if (!res.body) {
        throw new Error("No se recibió flujo de respuesta (ReadableStream).");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: accumulatedText,
          };
          return next;
        });
      }
    } catch (err: any) {
      console.error("Error al recibir respuesta de CineBuddy:", err);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content:
            "Se interrumpió la señal del proyector 🎞️. ¿Podrías reenviarme tu mensaje o probar con otra consulta?",
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user && !isGuest) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white mx-auto shadow-2xl shadow-red-600/30">
          <Bot className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Inicia sesión para usar CineBuddy
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            CineBuddy necesita acceder a tu historial de películas vistas, calificaciones y watchlist para ser tu compañero cinéfilo 100% personalizado.
          </p>
        </div>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition active:scale-95"
        >
          <span>Iniciar Sesión o Registrarse</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#11111e] border border-white/10 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-red-600/30 shrink-0">
            🎬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CineBuddy
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                BETA
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tu asistente cinéfilo personal con streaming</span>
            </p>
          </div>
        </div>

        {systemContext && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-2xl">
            <Film className="w-3.5 h-3.5 text-red-500" />
            <span>{systemContext.totalWatched} vistas</span>
            <span className="text-zinc-600">•</span>
            <span>{systemContext.watchlistCount} en lista</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex flex-col h-[52vh] sm:h-[62vh] overflow-y-auto p-3 sm:p-6 bg-[#0e0e18] border border-white/5 rounded-3xl space-y-4 shadow-inner">
        {loadingContext ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-red-500" />
            <p className="text-xs">Cargando tu perfil cinéfilo...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isAssistantEmpty = !isUser && msg.content === "" && isLoading;

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in duration-200 max-w-full`}
                >
                  {/* Sender Name */}
                  <div
                    className={`text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1.5 ${
                      isUser ? "mr-1" : "ml-1"
                    }`}
                  >
                    {!isUser && <Sparkles className="w-3 h-3 text-red-400" />}
                    <span>{isUser ? "Tú" : "CineBuddy"}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md break-words overflow-hidden ${
                      isUser
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-tr-sm max-w-[88%] sm:max-w-[75%]"
                        : "bg-zinc-800 text-zinc-200 border border-white/5 rounded-tl-sm max-w-[95%] sm:max-w-[80%]"
                    }`}
                  >
                    {isAssistantEmpty ? (
                      <div className="flex items-center gap-1.5 py-1 px-1">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" />
                      </div>
                    ) : (
                      <MarkdownRenderer
                        content={msg.content}
                        className={isUser ? "text-white" : "text-zinc-200"}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Starter Suggestions Chips */}
      {messages.length <= 1 && !loadingContext && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block px-1">
            Sugerencias para empezar:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(suggestion)}
                disabled={isLoading}
                className="p-2.5 rounded-2xl bg-[#141424] hover:bg-[#1a1a30] border border-white/5 hover:border-red-500/30 text-left text-xs text-zinc-300 hover:text-white transition shadow-sm flex items-center justify-between group active:scale-98"
              >
                <span>{suggestion}</span>
                <Sparkles className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="relative bg-[#11111e] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-red-500/50 transition">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || loadingContext}
            placeholder="Preguntale a CineBuddy lo que quieras sobre cine..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 resize-none max-h-32 min-h-[44px] p-2.5 outline-none"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || loadingContext}
            className="p-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            title="Enviar mensaje"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
