"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Film, Star, Clapperboard, ExternalLink } from "lucide-react";
import { TMDBPerson, getImageUrl } from "@/lib/tmdb/client";

interface PersonCardProps {
  person: TMDBPerson;
  onSelectPerson?: (person: TMDBPerson) => void;
  onViewDetails?: (person: TMDBPerson) => void;
}

export function PersonCard({ person, onSelectPerson, onViewDetails }: PersonCardProps) {
  const getDepartmentLabel = (dep: string) => {
    switch (dep?.toLowerCase()) {
      case "acting":
        return "Actuación";
      case "directing":
        return "Dirección";
      case "writing":
        return "Guion";
      case "production":
        return "Producción";
      case "camera":
        return "Fotografía";
      default:
        return dep || "Cineasta";
    }
  };

  const knownWorks = (person.known_for || []).filter(
    (w) => w.poster_path && (w.title || (w as unknown as { name?: string }).name)
  ).slice(0, 3);

  return (
    <div className="group relative flex flex-col justify-between bg-[#141420] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20 hover:-translate-y-1">
      {/* Top Section: Avatar and Info */}
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
          {person.profile_path ? (
            <Image
              src={getImageUrl(person.profile_path, "w185")}
              alt={person.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-white/5">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <Clapperboard className="w-2.5 h-2.5" />
              {getDepartmentLabel(person.known_for_department)}
            </span>
            {person.popularity > 10 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {Math.round(person.popularity)}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white mt-1 group-hover:text-red-400 transition-colors truncate">
            {person.name}
          </h3>

          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
            {person.known_for_department === "Directing"
              ? "Director cinematográfico"
              : "Actor / Intérprete"}
          </p>
        </div>
      </div>

      {/* Middle Section: Known-for works thumbnails */}
      {knownWorks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
            <Film className="w-3 h-3 text-zinc-400" />
            <span>Trabajos destacados</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {knownWorks.map((work) => {
              const title = work.title || (work as unknown as { name?: string }).name || "Película";
              return (
                <Link
                  key={work.id}
                  href={`/movie/${work.id}`}
                  className="group/work relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-red-500/50 transition-all"
                  title={title}
                >
                  <Image
                    src={getImageUrl(work.poster_path, "w185")}
                    alt={title}
                    fill
                    className="object-cover group-hover/work:scale-110 transition-transform duration-300"
                    sizes="60px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/work:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-[9px] text-white font-medium truncate leading-tight">
                      {title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        {onSelectPerson && (
          <button
            onClick={() => onSelectPerson(person)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-red-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Ver películas</span>
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(person)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition"
            title="Ver biografía completa"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
