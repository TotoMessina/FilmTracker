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
  ExternalLink,
  Star,
  Film,
  Calendar
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { getMovieDetails, getImageUrl, TMDBMovie } from "@/lib/tmdb/client";

interface Nominee {
  tmdb_id: number;
  title: string;
  nominationDetails?: string;
  isWinner?: boolean;
}

interface AwardCategory {
  name: string;
  nominees: Nominee[];
}

interface SeasonEdition {
  year: number;
  edition: string;
  title: string;
  description: string;
  categories: AwardCategory[];
}

const OSCARS_EDITIONS: Record<number, SeasonEdition> = {
  2026: {
    year: 2026,
    edition: "98ª Edición",
    title: "Temporada de Premios 2026",
    description: "Monitorea tu progreso antes de la gran noche del cine. ¿Cuántas de las candidatas has visto ya?",
    categories: [
      {
        name: "Mejor Película",
        nominees: [
          { tmdb_id: 1064213, title: "Anora", nominationDetails: "Sean Baker" },
          { tmdb_id: 1276843, title: "The Brutalist", nominationDetails: "Brady Corbet" },
          { tmdb_id: 1233413, title: "Nickel Boys", nominationDetails: "RaMell Ross" },
          { tmdb_id: 1225916, title: "A Complete Unknown", nominationDetails: "James Mangold" },
          { tmdb_id: 1197306, title: "A Real Pain", nominationDetails: "Jesse Eisenberg" },
          { tmdb_id: 974576, title: "Conclave", nominationDetails: "Edward Berger" },
          { tmdb_id: 1241982, title: "Emilia Pérez", nominationDetails: "Jacques Audiard" },
          { tmdb_id: 1111873, title: "September 5", nominationDetails: "Tim Fehlbaum" },
          { tmdb_id: 1119494, title: "The Substance", nominationDetails: "Coralie Fargeat" },
          { tmdb_id: 1152748, title: "Wicked", nominationDetails: "Jon M. Chu" },
        ],
      },
      {
        name: "Mejor Dirección",
        nominees: [
          { tmdb_id: 1064213, title: "Sean Baker", nominationDetails: "Anora" },
          { tmdb_id: 1276843, title: "Brady Corbet", nominationDetails: "The Brutalist" },
          { tmdb_id: 1241982, title: "Jacques Audiard", nominationDetails: "Emilia Pérez" },
          { tmdb_id: 1233413, title: "RaMell Ross", nominationDetails: "Nickel Boys" },
          { tmdb_id: 1119494, title: "Coralie Fargeat", nominationDetails: "The Substance" },
        ],
      },
      {
        name: "Mejor Película Animada",
        nominees: [
          { tmdb_id: 1029575, title: "The Wild Robot", nominationDetails: "DreamWorks Animation" },
          { tmdb_id: 823219, title: "Flow", nominationDetails: "Gints Zilbalodis" },
          { tmdb_id: 1195506, title: "Inside Out 2", nominationDetails: "Pixar Animation" },
          { tmdb_id: 1064486, title: "Memoir of a Snail", nominationDetails: "Adam Elliot" },
          { tmdb_id: 762441, title: "Wallace & Gromit: Vengeance Most Fowl", nominationDetails: "Aardman" },
        ],
      },
      {
        name: "Mejor Película Internacional",
        nominees: [
          { tmdb_id: 1241982, title: "Emilia Pérez", nominationDetails: "Francia" },
          { tmdb_id: 823219, title: "Flow", nominationDetails: "Letonia" },
          { tmdb_id: 1156593, title: "I'm Still Here", nominationDetails: "Brasil" },
          { tmdb_id: 1208668, title: "The Girl With the Needle", nominationDetails: "Dinamarca/Polonia" },
          { tmdb_id: 1084199, title: "The Seed of the Sacred Fig", nominationDetails: "Alemania" },
        ],
      },
      {
        name: "Mejor Guion Original",
        nominees: [
          { tmdb_id: 1064213, title: "Anora", nominationDetails: "Sean Baker" },
          { tmdb_id: 1197306, title: "A Real Pain", nominationDetails: "Jesse Eisenberg" },
          { tmdb_id: 1241982, title: "Emilia Pérez", nominationDetails: "Jacques Audiard" },
          { tmdb_id: 1111873, title: "September 5", nominationDetails: "Moritz Binder, Tim Fehlbaum" },
          { tmdb_id: 1119494, title: "The Substance", nominationDetails: "Coralie Fargeat" },
        ],
      },
    ],
  },
  2025: {
    year: 2025,
    edition: "97ª Edición",
    title: "Oscars 2025",
    description: "Revive las grandes nominadas y ganadoras de la temporada 2024-2025.",
    categories: [
      {
        name: "Mejor Película",
        nominees: [
          { tmdb_id: 872585, title: "Oppenheimer", nominationDetails: "Christopher Nolan", isWinner: true },
          { tmdb_id: 792307, title: "Poor Things", nominationDetails: "Yorgos Lanthimos" },
          { tmdb_id: 466420, title: "Killers of the Flower Moon", nominationDetails: "Martin Scorsese" },
          { tmdb_id: 915935, title: "Anatomy of a Fall", nominationDetails: "Justine Triet" },
          { tmdb_id: 93562, title: "The Zone of Interest", nominationDetails: "Jonathan Glazer" },
          { tmdb_id: 346698, title: "Barbie", nominationDetails: "Greta Gerwig" },
          { tmdb_id: 840430, title: "The Holdovers", nominationDetails: "Alexander Payne" },
          { tmdb_id: 666277, title: "Past Lives", nominationDetails: "Celine Song" },
        ],
      },
      {
        name: "Mejor Película Animada",
        nominees: [
          { tmdb_id: 508883, title: "The Boy and the Heron", nominationDetails: "Hayao Miyazaki", isWinner: true },
          { tmdb_id: 569094, title: "Spider-Man: Across the Spider-Verse", nominationDetails: "Sony Pictures Animation" },
          { tmdb_id: 940551, title: "Migration", nominationDetails: "Illumination" },
          { tmdb_id: 745376, title: "Elemental", nominationDetails: "Pixar" },
          { tmdb_id: 969681, title: "Robot Dreams", nominationDetails: "Pablo Berger" },
        ],
      },
      {
        name: "Mejor Película Internacional",
        nominees: [
          { tmdb_id: 93562, title: "The Zone of Interest", nominationDetails: "Reino Unido", isWinner: true },
          { tmdb_id: 976893, title: "Perfect Days", nominationDetails: "Japón" },
          { tmdb_id: 852096, title: "Society of the Snow", nominationDetails: "España" },
          { tmdb_id: 1034587, title: "Io Capitano", nominationDetails: "Italia" },
          { tmdb_id: 998846, title: "The Teachers' Lounge", nominationDetails: "Alemania" },
        ],
      },
    ],
  },
};

export default function AwardsPage() {
  const { user, isGuest } = useAuth();
  const { openLogModal } = useApp();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [watchedTmdbIds, setWatchedTmdbIds] = useState<Set<number>>(new Set());
  const [movieDetails, setMovieDetails] = useState<Record<number, Partial<TMDBMovie>>>({});
  const [loading, setLoading] = useState(true);

  const activeSeason = OSCARS_EDITIONS[selectedYear] || OSCARS_EDITIONS[2026];

  // 1. Load user logs to know which movies are already watched
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

  // 2. Fetch live TMDB details (posters, ratings, release date) dynamically
  useEffect(() => {
    let isCancelled = false;

    async function fetchNomineesTMDB() {
      const nomineeIds = new Set<number>();
      activeSeason.categories.forEach((cat) => {
        cat.nominees.forEach((n) => nomineeIds.add(n.tmdb_id));
      });

      const promises = Array.from(nomineeIds).map(async (id) => {
        // Skip if already fetched
        if (movieDetails[id]) return null;
        try {
          const details = await getMovieDetails(id);
          return { id, details };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      if (!isCancelled) {
        setMovieDetails((prev) => {
          const next = { ...prev };
          results.forEach((item) => {
            if (item) {
              next[item.id] = item.details;
            }
          });
          return next;
        });
      }
    }

    fetchNomineesTMDB();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear]);

  // Calculate unique nominees seen for the active season
  const allNomineeIds = new Set<number>();
  activeSeason.categories.forEach((cat) => {
    cat.nominees.forEach((n) => allNomineeIds.add(n.tmdb_id));
  });

  const totalNominees = allNomineeIds.size;
  const seenNomineesCount = Array.from(allNomineeIds).filter((id) => watchedTmdbIds.has(id)).length;
  const progressPercent = totalNominees > 0 ? Math.round((seenNomineesCount / totalNominees) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{activeSeason.title} • {activeSeason.edition}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Tracker de Nominaciones a los Oscars
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          {activeSeason.description}
        </p>

        {/* Edition Selector Pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedYear(2026)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              selectedYear === 2026
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oscars 2026 (Actual)</span>
          </button>
          <button
            onClick={() => setSelectedYear(2025)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              selectedYear === 2025
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Oscars 2025</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1a1712] via-[#161420] to-[#12111c] border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tu Progreso en {activeSeason.edition}</span>
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

      {/* Categories Grid */}
      <div className="space-y-6">
        {activeSeason.categories.map((category) => (
          <div
            key={category.name}
            className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">{category.name}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {category.nominees.map((nominee) => {
                const isSeen = watchedTmdbIds.has(nominee.tmdb_id);
                const details = movieDetails[nominee.tmdb_id];
                const posterUrl = getImageUrl(details?.poster_path, "w185");

                return (
                  <div
                    key={`${category.name}-${nominee.tmdb_id}-${nominee.title}`}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSeen
                        ? "bg-[#181710] border-amber-500/40 shadow-md shadow-amber-950/20"
                        : "bg-white/5 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Movie Poster thumbnail */}
                      <Link 
                        href={`/movie/${nominee.tmdb_id}`}
                        className="w-11 h-16 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10 relative group"
                      >
                        <img
                          src={posterUrl}
                          alt={nominee.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      </Link>

                      {/* Movie Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/movie/${nominee.tmdb_id}`}
                            className="font-bold text-sm text-white hover:text-amber-400 transition truncate max-w-[200px] block"
                          >
                            {nominee.title}
                          </Link>
                          {nominee.isWinner && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-black shrink-0">
                              🏆 GANADORA
                            </span>
                          )}
                        </div>

                        {nominee.nominationDetails && (
                          <span className="text-xs text-zinc-400 block truncate">
                            {nominee.nominationDetails}
                          </span>
                        )}

                        {details?.vote_average ? (
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{details.vote_average.toFixed(1)}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isSeen ? (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>VISTA</span>
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            openLogModal({
                              id: nominee.tmdb_id,
                              title: nominee.title,
                              poster_path: details?.poster_path,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log</span>
                        </button>
                      )}
                    </div>
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
