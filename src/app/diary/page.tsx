"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Star, 
  RotateCcw, 
  Edit3, 
  Ticket, 
  Trash2, 
  Plus, 
  Calendar,
  Clock,
  Tv,
  Film
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatDate, getRatingColor, getPlatformBadge } from "@/lib/utils/formatting";

export default function DiaryPage() {
  const { user, isGuest } = useAuth();
  const { openLogModal, openCinemaTicket, lastUpdated, onLogSaved } = useApp();

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiary() {
      setLoading(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id)
            .order("watched_at", { ascending: false, nullsFirst: false });

          if (!error && data) {
            setLogs(data as Log[]);
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setLogs(guestLogs);
        }
      } catch (err) {
        console.warn("Error fetching diary logs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDiary();
  }, [user, isGuest, lastUpdated]);

  const handleDelete = async (logId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta entrada del diario?")) return;

    if (user) {
      await supabase.from("logs").delete().eq("id", logId);
    } else {
      const updated = logs.filter((l) => l.id !== logId);
      localStorage.setItem("filmtracker_guest_logs", JSON.stringify(updated));
    }
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    onLogSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Diario de Películas
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Tu registro cronológico de todas las películas que has visto.
          </p>
        </div>

        <Link
          href="/search"
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Película</span>
        </Link>
      </div>

      {/* Diary List */}
      {!user ? (
        <div className="text-center py-16 bg-[#141424] rounded-3xl border border-white/10 p-8 max-w-xl mx-auto space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Tu Diario de Cine Personal</h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              Inicia sesión o crea tu cuenta gratuita para comenzar a registrar las películas que ves, calificarlas de 0 a 10, escribir reseñas y coleccionar tickets de cine retro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/auth"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/10 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-zinc-400 flex items-center justify-center gap-2">
          <Film className="w-5 h-5 animate-spin text-red-500" />
          <span>Cargando tu diario cinéfilo...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto space-y-4">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Tu diario está vacío</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Comienza a registrar las películas que ves con tus calificaciones, reseñas y recuerdos personales.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buscar una película para registrar</span>
          </Link>
        </div>
      ) : (
        <div className="bg-[#141420] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const movie = log.movie;
              const poster = log.custom_poster_path || movie?.poster_path;
              const platformBadge = getPlatformBadge(log.platform);
              const isCinema = log.platform?.toLowerCase() === "cine";

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                >
                  {/* Left: Poster + Movie Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Link
                      href={`/movie/${log.tmdb_id}`}
                      className="w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 hover:border-white/30 transition shadow-md"
                    >
                      <img
                        src={getImageUrl(poster, "w200")}
                        alt={movie?.title || "Póster"}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/movie/${log.tmdb_id}`}
                          className="font-bold text-white hover:text-red-400 transition text-base truncate"
                        >
                          {movie?.title || "Película"}
                        </Link>
                        {log.is_rewatch && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-rose-300">
                            <RotateCcw className="w-3 h-3" />
                            <span>Rewatch</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          {log.watched_at ? (
                            <>
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{formatDate(log.watched_at)}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-zinc-500 italic">Sin fecha específica</span>
                            </>
                          )}
                        </span>
                        {log.platform && (
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] ${platformBadge.bg}`}>
                            {platformBadge.name}
                          </span>
                        )}
                        {log.format && (
                          <span className="text-zinc-500 text-[11px]">• {log.format}</span>
                        )}
                      </div>

                      {log.review && (
                        <p className="text-xs text-zinc-300 italic line-clamp-1 max-w-xl">
                          &ldquo;{log.review}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Rating + Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5 shrink-0 border-t border-white/5 pt-2.5 sm:border-0 sm:pt-0">
                    {/* Rating display */}
                    {log.rating !== null && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className={`font-black text-sm ${getRatingColor(log.rating)}`}>
                          {log.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Cinema Ticket Button */}
                    {isCinema && (
                      <button
                        onClick={() => openCinemaTicket(log)}
                        title="Ver Ticket de Cine Retro"
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition shadow-sm"
                      >
                        <Ticket className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() =>
                        openLogModal(
                          { id: log.tmdb_id, title: movie?.title || "Película", poster_path: poster },
                          log
                        )
                      }
                      title="Editar registro"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(log.id)}
                      title="Eliminar registro"
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
