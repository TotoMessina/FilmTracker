"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Clapperboard, 
  Film, 
  Star, 
  Filter, 
  RefreshCw 
} from "lucide-react";
import { 
  TMDBPerson, 
  getPersonDetails, 
  getImageUrl 
} from "@/lib/tmdb/client";

interface PersonDetailModalProps {
  personId: number | null;
  onClose: () => void;
  onFilterByPerson?: (person: TMDBPerson, role: "cast" | "crew") => void;
}

export function PersonDetailModal({
  personId,
  onClose,
  onFilterByPerson,
}: PersonDetailModalProps) {
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"directed" | "acted">("directed");

  useEffect(() => {
    if (!personId) return;

    let isCancelled = false;
    async function fetchPerson() {
      setLoading(true);
      try {
        const data = await getPersonDetails(personId!);
        if (!isCancelled) {
          setPerson(data);
          // Set initial tab based on department
          if (data.known_for_department === "Directing") {
            setActiveTab("directed");
          } else {
            setActiveTab("acted");
          }
        }
      } catch (err) {
        console.error("Error fetching person details:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchPerson();
    return () => {
      isCancelled = true;
    };
  }, [personId]);

  if (!personId) return null;

  const directedMovies = (person?.movie_credits?.crew || [])
    .filter((c) => c.job === "Director")
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

  const actedMovies = (person?.movie_credits?.cast || [])
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161622]">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white">Ficha de Cineasta / Artista</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
              <span>Cargando datos y filmografía...</span>
            </div>
          ) : person ? (
            <>
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                <div className="relative w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0 shadow-lg">
                  {person.profile_path ? (
                    <Image
                      src={getImageUrl(person.profile_path, "w300")}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      {person.known_for_department === "Directing"
                        ? "Director / Realizador"
                        : "Actor / Actuación"}
                    </span>
                    {person.birthday && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {person.birthday}
                      </span>
                    )}
                    {person.place_of_birth && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {person.place_of_birth}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-black text-white">{person.name}</h1>

                  {person.biography ? (
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
                      {person.biography}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Sin biografía disponible en español.
                    </p>
                  )}

                  {/* Quick Filter Action Button */}
                  {onFilterByPerson && (
                    <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      {directedMovies.length > 0 && (
                        <button
                          onClick={() => {
                            onFilterByPerson(person, "crew");
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-md shadow-red-600/20"
                        >
                          <Filter className="w-3.5 h-3.5" />
                          <span>Filtrar películas dirigidas ({directedMovies.length})</span>
                        </button>
                      )}
                      {actedMovies.length > 0 && (
                        <button
                          onClick={() => {
                            onFilterByPerson(person, "cast");
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition"
                        >
                          <Film className="w-3.5 h-3.5 text-red-400" />
                          <span>Filtrar como actor ({actedMovies.length})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Filmography Tabs */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  {directedMovies.length > 0 && (
                    <button
                      onClick={() => setActiveTab("directed")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeTab === "directed"
                          ? "bg-red-600 text-white"
                          : "text-zinc-400 hover:text-white bg-white/5"
                      }`}
                    >
                      <Clapperboard className="w-3.5 h-3.5" />
                      <span>Dirección ({directedMovies.length})</span>
                    </button>
                  )}
                  {actedMovies.length > 0 && (
                    <button
                      onClick={() => setActiveTab("acted")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeTab === "acted"
                          ? "bg-red-600 text-white"
                          : "text-zinc-400 hover:text-white bg-white/5"
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Actuación ({actedMovies.length})</span>
                    </button>
                  )}
                </div>

                {/* Filmography Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                  {(activeTab === "directed" ? directedMovies : actedMovies).slice(0, 24).map((movie) => (
                    <Link
                      key={`${movie.id}-${activeTab}`}
                      href={`/movie/${movie.id}`}
                      onClick={onClose}
                      className="group flex flex-col gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-black/40">
                        <Image
                          src={getImageUrl(movie.poster_path, "w185")}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="120px"
                        />
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {movie.vote_average ? movie.vote_average.toFixed(1) : "—"}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {movie.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {movie.release_date ? movie.release_date.slice(0, 4) : "—"}
                          {activeTab === "acted" && (movie as { character?: string }).character
                            ? ` • ${(movie as { character?: string }).character}`
                            : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
