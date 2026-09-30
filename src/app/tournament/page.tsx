"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Swords, 
  Trophy, 
  Crown, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Film,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { getImageUrl, getTrendingMovies, TMDBMovie } from "@/lib/tmdb/client";

interface TournamentMovie {
  id: number;
  title: string;
  poster_path: string | null;
}

export default function TournamentPage() {
  const { user, isGuest } = useAuth();
  const { openLogModal, triggerConfetti } = useApp();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<TournamentMovie[]>([]);

  // Tournament state
  const [currentRoundName, setCurrentRoundName] = useState<string>("Cuartos de Final");
  const [currentMatches, setCurrentMatches] = useState<[TournamentMovie, TournamentMovie][]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [winnersThisRound, setWinnersThisRound] = useState<TournamentMovie[]>([]);
  const [champion, setChampion] = useState<TournamentMovie | null>(null);

  // Initialize tournament
  const initTournament = async () => {
    setLoading(true);
    setChampion(null);
    setCurrentMatchIndex(0);
    setWinnersThisRound([]);

    try {
      let pool: TournamentMovie[] = [];

      // 1. Try to fetch from watchlist
      if (user) {
        const { data } = await supabase
          .from("watchlist")
          .select("tmdb_id, title, movie:movies(poster_path)")
          .eq("user_id", user.id)
          .limit(20);

        if (data && data.length > 0) {
          pool = data.map((d: any) => ({
            id: d.tmdb_id,
            title: d.title || "Película",
            poster_path: d.movie?.poster_path || null,
          }));
        }
      } else if (isGuest) {
        const guestWL = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
        pool = guestWL.map((m: any) => ({
          id: m.tmdb_id || m.id,
          title: m.title,
          poster_path: m.poster_path,
        }));
      }

      // If pool < 8, supplement with trending movies
      if (pool.length < 8) {
        const trendingRes = await getTrendingMovies("week", 1);
        if (trendingRes?.results) {
          const trendingFormatted: TournamentMovie[] = trendingRes.results.map((m) => ({
            id: m.id,
            title: m.title,
            poster_path: m.poster_path,
          }));
          // Merge without duplicates
          const existingIds = new Set(pool.map((p) => p.id));
          for (const tm of trendingFormatted) {
            if (!existingIds.has(tm.id) && pool.length < 8) {
              pool.push(tm);
              existingIds.add(tm.id);
            }
          }
        }
      }

      // Shuffle pool and take 8
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
      setCandidates(shuffled);

      // Create Round of 8 (4 matches)
      const matches: [TournamentMovie, TournamentMovie][] = [
        [shuffled[0], shuffled[1]],
        [shuffled[2], shuffled[3]],
        [shuffled[4], shuffled[5]],
        [shuffled[6], shuffled[7]],
      ];

      setCurrentMatches(matches);
      setCurrentRoundName("Cuartos de Final (1/4)");
    } catch (err) {
      console.warn("Tournament init error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initTournament();
  }, [user, isGuest]);

  const handlePickWinner = (winner: TournamentMovie) => {
    const updatedWinners = [...winnersThisRound, winner];
    setWinnersThisRound(updatedWinners);

    if (currentMatchIndex + 1 < currentMatches.length) {
      // Advance to next match in current round
      setCurrentMatchIndex((prev) => prev + 1);
    } else {
      // Round completed!
      if (updatedWinners.length === 1) {
        // We have a champion!
        setChampion(updatedWinners[0]);
        triggerConfetti();
      } else if (updatedWinners.length === 2) {
        // Grand Final
        setCurrentMatches([[updatedWinners[0], updatedWinners[1]]]);
        setCurrentMatchIndex(0);
        setWinnersThisRound([]);
        setCurrentRoundName("¡GRAN FINAL!");
      } else if (updatedWinners.length === 4) {
        // Semifinals
        setCurrentMatches([
          [updatedWinners[0], updatedWinners[1]],
          [updatedWinners[2], updatedWinners[3]],
        ]);
        setCurrentMatchIndex(0);
        setWinnersThisRound([]);
        setCurrentRoundName("Semifinales");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 gap-2">
        <Swords className="w-6 h-6 animate-pulse text-red-500" />
        <span>Organizando el cuadro del torneo cinéfilo...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Swords className="w-4 h-4" />
          <span>Mundial de Cine Eliminatorio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          ¿Cuál Película Debe Ganar?
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Elige cara a cara entre dos películas en un cuadro de 8 hasta coronar a la ganadora absoluta.
        </p>
      </div>

      {/* Champion Screen */}
      {champion ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#1a1728] to-[#0e0e18] border border-amber-500/40 text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/30">
            <Crown className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              ¡Película Campeona del Torneo!
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              {champion.title}
            </h2>
          </div>

          <div className="w-48 aspect-[2/3] rounded-2xl overflow-hidden mx-auto shadow-2xl border-2 border-amber-500/50 shadow-amber-500/20">
            <img
              src={getImageUrl(champion.poster_path, "w500")}
              alt={champion.title}
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-sm text-zinc-300 max-w-sm mx-auto">
            Superó todos los duelos y se coronó como la opción número uno para tu próxima sesión de cine.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openLogModal(champion)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar en mi Diario</span>
            </button>

            <button
              onClick={initTournament}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar Nuevo Torneo</span>
            </button>
          </div>
        </div>
      ) : currentMatches.length > 0 && currentMatches[currentMatchIndex] ? (
        /* Face to Face Battle */
        <div className="space-y-6">
          {/* Round Header */}
          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[#141420] border border-white/5">
            <span className="text-sm font-bold text-red-400">{currentRoundName}</span>
            <span className="text-xs font-semibold text-zinc-400">
              Duelo {currentMatchIndex + 1} de {currentMatches.length}
            </span>
          </div>

          {/* Duelo Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6 relative">
            {/* VS Badge in center (visible on mobile and desktop) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-red-600 border-4 border-[#0a0a0f] text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xl shadow-red-600/40 pointer-events-none">
              VS
            </div>

            {/* Fighter 1 */}
            {(() => {
              const movieA = currentMatches[currentMatchIndex][0];
              return (
                <button
                  onClick={() => handlePickWinner(movieA)}
                  className="group relative flex flex-col items-center p-5 sm:p-6 rounded-3xl bg-[#141420] border-2 border-white/5 hover:border-red-500 hover:shadow-2xl hover:shadow-red-950/40 transition-all duration-300 active:scale-98 text-center"
                >
                  <div className="w-36 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={getImageUrl(movieA.poster_path, "w500")}
                      alt={movieA.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {movieA.title}
                  </h3>
                  <span className="mt-2.5 sm:mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-zinc-300 group-hover:bg-red-600 group-hover:text-white bg-white/10 transition">
                    Votar por esta
                  </span>
                </button>
              );
            })()}

            {/* Fighter 2 */}
            {(() => {
              const movieB = currentMatches[currentMatchIndex][1];
              return (
                <button
                  onClick={() => handlePickWinner(movieB)}
                  className="group relative flex flex-col items-center p-5 sm:p-6 rounded-3xl bg-[#141420] border-2 border-white/5 hover:border-red-500 hover:shadow-2xl hover:shadow-red-950/40 transition-all duration-300 active:scale-98 text-center"
                >
                  <div className="w-36 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={getImageUrl(movieB.poster_path, "w500")}
                      alt={movieB.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {movieB.title}
                  </h3>
                  <span className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-zinc-300 group-hover:bg-red-600 group-hover:text-white bg-white/10 transition">
                    Votar por esta
                  </span>
                </button>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
