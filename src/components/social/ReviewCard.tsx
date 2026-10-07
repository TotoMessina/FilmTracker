"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, AlertTriangle, Eye, EyeOff, Calendar } from "lucide-react";
import { Log } from "@/lib/supabase/types";
import { formatDate, getRatingColor } from "@/lib/utils/formatting";
import { getImageUrl } from "@/lib/tmdb/client";

export interface ReviewCardProps {
  log: Log;
  currentUserId?: string;
  userWatchedIds?: Set<number>;
  showMoviePoster?: boolean;
}

export function ReviewCard({
  log,
  currentUserId,
  userWatchedIds,
  showMoviePoster = false,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);

  const profile = log.profile;
  const movie = log.movie;

  // Determine if current user has watched this movie
  const hasWatched = userWatchedIds ? userWatchedIds.has(log.tmdb_id) : false;
  const isAuthor = currentUserId ? log.user_id === currentUserId : false;
  const hasSpoilers = Boolean(log.contains_spoilers);

  // If it has spoilers and the user hasn't watched it (and isn't the author), protect with blur
  const shouldHideSpoiler = hasSpoilers && !hasWatched && !isAuthor && !revealed;

  return (
    <div className="p-5 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl flex flex-col justify-between hover:border-white/15 transition-all">
      {/* Header: User Profile & Rating */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={profile?.id ? `/profile/${profile.id}` : "#"}>
            <img
              src={
                profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile?.username || "User"
                )}&background=e50914&color=fff`
              }
              alt={profile?.username || "Usuario"}
              className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
            />
          </Link>
          <div className="min-w-0">
            <Link
              href={profile?.id ? `/profile/${profile.id}` : "#"}
              className="font-bold text-sm text-white hover:underline truncate block"
            >
              {profile?.username || "Cinéfilo"}
            </Link>
            <span className="text-[11px] text-zinc-500 block">
              {formatDate(log.watched_at)}
            </span>
          </div>
        </div>

        {log.rating !== null && log.rating !== undefined && (
          <div className="flex items-center gap-1 font-bold text-xs shrink-0 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className={getRatingColor(log.rating)}>{log.rating}/10</span>
          </div>
        )}
      </div>

      {/* Optional Movie Poster & Title (for social feed) */}
      {showMoviePoster && (
        <div className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
          <Link
            href={`/movie/${log.tmdb_id}`}
            className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-zinc-800"
          >
            <img
              src={getImageUrl(log.custom_poster_path || movie?.poster_path, "w185")}
              alt={movie?.title || "Película"}
              className="w-full h-full object-cover"
            />
          </Link>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <Link
              href={`/movie/${log.tmdb_id}`}
              className="font-bold text-sm text-white truncate hover:text-red-400 transition"
            >
              {movie?.title || "Película"}
            </Link>
            <span className="text-[11px] text-zinc-500">
              {log.platform || "Cine"}
            </span>
          </div>
        </div>
      )}

      {/* Review Content with Intelligent Spoiler Control */}
      {log.review && (
        <div className="relative pt-1">
          {/* Badge: User has watched it or is author */}
          {hasSpoilers && (hasWatched || isAuthor) && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>
                  {isAuthor ? "Tu reseña con Spoilers" : "Spoilers (Visto por ti)"}
                </span>
              </span>
            </div>
          )}

          {/* Spoiler Protection Active: Blur filter & Overlay Card */}
          {shouldHideSpoiler ? (
            <div className="relative overflow-hidden rounded-2xl">
              {/* Blurred background preview */}
              <p className="text-xs text-zinc-400 italic line-clamp-3 leading-relaxed filter blur-md select-none opacity-30 pointer-events-none py-3">
                &ldquo;{log.review}&rdquo;
              </p>

              {/* Spoiler overlay warning */}
              <div
                onClick={() => setRevealed(true)}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center cursor-pointer bg-black/60 backdrop-blur-sm rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition group select-none"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:scale-105 transition">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>⚠️ Esta reseña contiene spoilers</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Hacé clic para leer bajo tu propio riesgo
                </p>
                <span className="text-[10px] text-amber-300 font-bold underline mt-1.5 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Revelar reseña</span>
                </span>
              </div>
            </div>
          ) : (
            <div>
              {/* If user explicitly revealed spoiler without having watched it */}
              {hasSpoilers && !hasWatched && !isAuthor && revealed && (
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>Spoiler Revelado</span>
                  </span>
                  <button
                    onClick={() => setRevealed(false)}
                    className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Ocultar de nuevo</span>
                  </button>
                </div>
              )}

              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                &ldquo;{log.review}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewCard;
