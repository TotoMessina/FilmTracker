"use client";

import React, { useRef } from "react";
import { X, Star, Calendar, Clock, Film, Share2, Ticket } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { getImageUrl } from "@/lib/tmdb/client";
import { formatDate } from "@/lib/utils/formatting";

export function CinemaTicketModal() {
  const { activeCinemaTicket, closeCinemaTicket } = useApp();
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!activeCinemaTicket) return null;

  const movie = activeCinemaTicket.movie;
  const poster = activeCinemaTicket.custom_poster_path || movie?.poster_path;
  const rating = activeCinemaTicket.rating;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Mi entrada de cine: ${movie?.title || "Película"}`,
        text: `Vi ${movie?.title || "esta película"} en el cine y le di un ${rating}/10 en FilmTracker!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      window.print();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeCinemaTicket}
    >
      <div 
        className="relative w-full max-w-md flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeCinemaTicket}
          className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Vintage Ticket Card */}
        <div 
          ref={ticketRef}
          className="w-full bg-gradient-to-b from-[#1c1a17] via-[#161412] to-[#0e0d0c] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-amber-950/40 relative text-zinc-200"
        >
          {/* Top Cinema Stamped Header */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-4 text-center text-zinc-950 font-black tracking-widest text-xs uppercase flex items-center justify-center gap-2 shadow-inner">
            <Ticket className="w-4 h-4 fill-zinc-950" />
            <span>ADMIT ONE • CINEMA TICKET • FILMTRACKER</span>
            <Ticket className="w-4 h-4 fill-zinc-950" />
          </div>

          <div className="p-6 space-y-5">
            {/* Movie Info with Poster */}
            <div className="flex gap-4">
              <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden shrink-0 shadow-lg border border-amber-500/20">
                <img
                  src={getImageUrl(poster, "w300")}
                  alt={movie?.title || "Póster"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    Proyección de Sala
                  </span>
                  <h2 className="text-xl font-black text-white leading-tight mt-0.5 line-clamp-2">
                    {movie?.title}
                  </h2>
                </div>

                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{formatDate(activeCinemaTicket.watched_at)}</span>
                  </div>
                  {movie?.runtime ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{movie.runtime} minutos</span>
                    </div>
                  ) : null}
                  {activeCinemaTicket.format && (
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Film className="w-3.5 h-3.5" />
                      <span>Formato {activeCinemaTicket.format}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Section */}
            {rating !== null && rating !== undefined && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-white text-base">Puntuación Personal</span>
                </div>
                <span className="text-2xl font-black text-amber-400">
                  {rating.toFixed(1)} <span className="text-xs text-zinc-400">/ 10</span>
                </span>
              </div>
            )}

            {/* Review quote if exists */}
            {activeCinemaTicket.review && (
              <div className="relative p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300 italic">
                &ldquo;{activeCinemaTicket.review}&rdquo;
              </div>
            )}

            {/* Perforated separator */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute -left-10 w-8 h-8 rounded-full bg-black/85" />
              <div className="w-full border-t-2 border-dashed border-zinc-700/60" />
              <div className="absolute -right-10 w-8 h-8 rounded-full bg-black/85" />
            </div>

            {/* Simulated barcode */}
            <div className="flex flex-col items-center pt-2">
              <div className="h-10 w-48 flex justify-between items-stretch gap-1 opacity-70">
                {[...Array(34)].map((_, i) => (
                  <div
                    key={i}
                    className={`bg-zinc-300 ${i % 3 === 0 ? "w-1.5" : i % 2 === 0 ? "w-0.5" : "w-1"}`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-zinc-500 tracking-widest mt-1">
                FT-CINEMA-{activeCinemaTicket.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 w-full">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
