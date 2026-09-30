"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users2, Film, Star, Sparkles, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/tmdb/client";

interface ActorFrequency {
  id: number;
  name: string;
  profile_path: string | null;
  count: number;
  movies: { id: number; title: string }[];
}

export default function ConnectionsPage() {
  const { user, isGuest } = useAuth();
  const [actors, setActors] = useState<ActorFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConnections() {
      setLoading(true);
      try {
        let logs: Log[] = [];

        if (user) {
          const { data } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id);
          if (data) logs = data as Log[];
        } else if (isGuest) {
          logs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
        }

        // Aggregate actors
        const actorMap: Record<number, ActorFrequency> = {};

        logs.forEach((log) => {
          const cast = log.movie?.cast_data;
          const movieTitle = log.movie?.title || "Película";
          const tmdbId = log.tmdb_id;

          if (Array.isArray(cast)) {
            cast.forEach((actor) => {
              if (!actorMap[actor.id]) {
                actorMap[actor.id] = {
                  id: actor.id,
                  name: actor.name,
                  profile_path: actor.profile_path || null,
                  count: 0,
                  movies: [],
                };
              }
              // Avoid duplicate movie entries for same actor
              if (!actorMap[actor.id].movies.some((m) => m.id === tmdbId)) {
                actorMap[actor.id].count += 1;
                actorMap[actor.id].movies.push({ id: tmdbId, title: movieTitle });
              }
            });
          }
        });

        // Filter actors appearing in >= 2 movies and sort
        const frequent = Object.values(actorMap)
          .filter((a) => a.count >= 2)
          .sort((a, b) => b.count - a.count);

        setActors(frequent);
      } catch (err) {
        console.warn("Connections error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConnections();
  }, [user, isGuest]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users2 className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Conexiones & Actores Fetiche
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Intérpretes que aparecen repetidamente en las películas que has visto en tu diario.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-400 flex items-center justify-center gap-2">
          <Film className="w-5 h-5 animate-spin text-red-500" />
          <span>Analizando conexiones en tu reparto...</span>
        </div>
      ) : actors.length === 0 ? (
        <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto space-y-4">
          <Users2 className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No hay conexiones recurrentes aún</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Cuando registres películas que compartan actores de reparto (al menos 2 apariciones), aparecerán aquí tus actores fetiche.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs transition"
          >
            <span>Ver películas recomendadas</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="p-5 rounded-3xl bg-[#141420] border border-white/5 hover:border-white/20 transition flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 group-hover:border-red-500/50 transition">
                  {actor.profile_path ? (
                    <img
                      src={getImageUrl(actor.profile_path, "w185")}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base truncate group-hover:text-red-400 transition-colors">
                    {actor.name}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600/15 text-red-400 mt-1 border border-red-500/20">
                    <Star className="w-3 h-3 fill-red-400" />
                    <span>{actor.count} películas</span>
                  </div>
                </div>
              </div>

              {/* List of movies */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Visto en:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {actor.movies.map((m) => (
                    <Link
                      key={m.id}
                      href={`/movie/${m.id}`}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 text-[11px] text-zinc-300 hover:text-white transition truncate max-w-full"
                    >
                      {m.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
