"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Award, 
  CheckCircle, 
  Circle, 
  Plus, 
  Sparkles,
  ExternalLink 
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";

interface Nominee {
  tmdb_id: number;
  title: string;
  nominationDetails?: string;
  poster?: string;
}

interface AwardCategory {
  name: string;
  nominees: Nominee[];
}

const OSCARS_SEASON: AwardCategory[] = [
  {
    name: "Mejor Película",
    nominees: [
      { tmdb_id: 1064213, title: "Anora", nominationDetails: "Sean Baker" },
      { tmdb_id: 1114894, title: "The Brutalist", nominationDetails: "Brady Corbet" },
      { tmdb_id: 693134, title: "Dune: Part Two", nominationDetails: "Denis Villeneuve" },
      { tmdb_id: 974576, title: "Conclave", nominationDetails: "Edward Berger" },
      { tmdb_id: 1022789, title: "Inside Out 2", nominationDetails: "Kelsey Mann" },
    ],
  },
  {
    name: "Mejor Dirección",
    nominees: [
      { tmdb_id: 1064213, title: "Sean Baker", nominationDetails: "Anora" },
      { tmdb_id: 1114894, title: "Brady Corbet", nominationDetails: "The Brutalist" },
      { tmdb_id: 974576, title: "Edward Berger", nominationDetails: "Conclave" },
      { tmdb_id: 693134, title: "Denis Villeneuve", nominationDetails: "Dune: Part Two" },
    ],
  },
  {
    name: "Mejor Película Animada",
    nominees: [
      { tmdb_id: 1022789, title: "Inside Out 2", nominationDetails: "Pixar Animation" },
      { tmdb_id: 1184918, title: "The Wild Robot", nominationDetails: "DreamWorks Animation" },
      { tmdb_id: 823219, title: "Flow", nominationDetails: "Gints Zilbalodis" },
      { tmdb_id: 1064486, title: "Memoir of a Snail", nominationDetails: "Adam Elliot" },
    ],
  },
  {
    name: "Mejor Película Internacional",
    nominees: [
      { tmdb_id: 974950, title: "Emilia Pérez", nominationDetails: "Francia" },
      { tmdb_id: 823219, title: "Flow", nominationDetails: "Letonia" },
      { tmdb_id: 1084199, title: "The Seed of the Sacred Fig", nominationDetails: "Alemania" },
      { tmdb_id: 1156593, title: "I'm Still Here", nominationDetails: "Brasil" },
    ],
  },
];

export default function AwardsPage() {
  const { user, isGuest } = useAuth();
  const { openLogModal } = useApp();

  const [watchedTmdbIds, setWatchedTmdbIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchedIds() {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("logs")
            .select("tmdb_id")
            .eq("user_id", user.id);

          if (data) {
            setWatchedTmdbIds(new Set(data.map((d) => d.tmdb_id)));
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setWatchedTmdbIds(new Set(guestLogs.map((l: any) => l.tmdb_id)));
        }
      } catch (err) {
        console.warn("Awards error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWatchedIds();
  }, [user, isGuest]);

  // Calculate unique nominees seen
  const allNomineeIds = new Set<number>();
  OSCARS_SEASON.forEach((cat) => {
    cat.nominees.forEach((n) => allNomineeIds.add(n.tmdb_id));
  });

  const totalNominees = allNomineeIds.size;
  const seenNomineesCount = Array.from(allNomineeIds).filter((id) => watchedTmdbIds.has(id)).length;
  const progressPercent = totalNominees > 0 ? Math.round((seenNomineesCount / totalNominees) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Temporada de Premios 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Tracker de Nominaciones de los Oscars
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Monitorea tu progreso antes de la gran noche del cine. ¿Cuántas de las candidatas has visto ya?
        </p>
      </div>

      {/* Progress Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1a1712] via-[#161420] to-[#12111c] border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tu Progreso en la Temporada</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              {seenNomineesCount} de {totalNominees} <span className="text-lg text-zinc-400 font-normal">películas vistas</span>
            </div>
          </div>

          <div className="text-4xl font-black text-amber-400">
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-lg shadow-amber-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {OSCARS_SEASON.map((category) => (
          <div
            key={category.name}
            className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">{category.name}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.nominees.map((nominee) => {
                const isSeen = watchedTmdbIds.has(nominee.tmdb_id);

                return (
                  <div
                    key={`${category.name}-${nominee.tmdb_id}-${nominee.title}`}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSeen
                        ? "bg-[#181710] border-amber-500/40 shadow-md shadow-amber-950/20"
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSeen ? (
                        <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/movie/${nominee.tmdb_id}`}
                          className="font-bold text-sm text-white hover:text-amber-400 transition truncate block"
                        >
                          {nominee.title}
                        </Link>
                        {nominee.nominationDetails && (
                          <span className="text-xs text-zinc-400 block truncate">
                            {nominee.nominationDetails}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSeen ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        VISTA
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          openLogModal({
                            id: nominee.tmdb_id,
                            title: nominee.title,
                          })
                        }
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
