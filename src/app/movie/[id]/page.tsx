"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Star, 
  Calendar, 
  Clock, 
  Plus, 
  Bookmark, 
  Sparkles, 
  Tv, 
  ArrowLeft, 
  User, 
  Film, 
  Share2,
  Check,
  MessageSquare,
  Building2,
  Clapperboard
} from "lucide-react";
import { 
  TMDBMovie, 
  getMovieDetails, 
  getImageUrl, 
  getBackdropUrl, 
  hasPostCreditsScene 
} from "@/lib/tmdb/client";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";
import { formatRuntime, formatDate, getRatingColor } from "@/lib/utils/formatting";
import { MovieCard } from "@/components/movies/MovieCard";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tmdbId = Number(params?.id);

  const { openLogModal, requireAuth } = useApp();
  const { user } = useAuth();

  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [reviews, setReviews] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (!tmdbId) return;

    setLoading(true);
    // 1. Fetch TMDB Details
    getMovieDetails(tmdbId)
      .then((data) => {
        setMovie(data);
      })
      .catch((err) => {
        console.error("Movie details fetch error:", err);
      })
      .finally(() => setLoading(false));

    // 2. Fetch community reviews from Supabase logs
    supabase
      .from("logs")
      .select("*, profile:profiles(*)")
      .eq("tmdb_id", tmdbId)
      .not("review", "is", null)
      .neq("review", "")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setReviews(data as Log[]);
      });

    // 3. Check if in watchlist
    if (user) {
      supabase
        .from("watchlist")
        .select("tmdb_id")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setInWatchlist(true);
        });
    }
  }, [tmdbId, user]);

  const handleToggleWatchlist = async () => {
    if (!movie) return;
    if (!requireAuth("guardar esta película en tu Watchlist")) return;
    if (inWatchlist) return;

    if (user) {
      // Upsert movie cache
      await supabase.from("movies").upsert({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date || null,
        runtime: movie.runtime || null,
        vote_average: movie.vote_average || null,
      });

      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        tmdb_id: movie.id,
        title: movie.title,
      });

      if (!error) setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        <Film className="w-8 h-8 animate-pulse text-red-500 mr-3" />
        <span>Cargando ficha cinematográfica...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Película no encontrada</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  const hasStinger = hasPostCreditsScene(movie);
  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const streamProviders = movie["watch/providers"]?.results?.MX?.flatrate || 
                          movie["watch/providers"]?.results?.ES?.flatrate || 
                          movie["watch/providers"]?.results?.US?.flatrate || [];

  return (
    <div className="space-y-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Volver</span>
      </button>

      {/* Hero Backdrop Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0e0e18]">
        <div className="relative h-[320px] sm:h-[440px] w-full overflow-hidden">
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e18] via-[#0e0e18]/60 to-transparent" />
        </div>

        {/* Floating Content Box */}
        <div className="relative px-6 sm:px-10 pb-8 -mt-36 sm:-mt-48 flex flex-col md:flex-row gap-6 items-start">
          {/* Main Poster */}
          <div className="w-36 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shrink-0 border-2 border-white/15 bg-zinc-900">
            <img
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {movie.release_date && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-zinc-300">
                    {movie.release_date.split("-")[0]}
                  </span>
                )}
                {movie.runtime ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-zinc-300">
                    {formatRuntime(movie.runtime)}
                  </span>
                ) : null}
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.vote_average.toFixed(1)} TMDB</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>
              {movie.original_title && movie.original_title !== movie.title && (
                <p className="text-sm text-zinc-400 mt-1 italic">
                  Título original: {movie.original_title}
                </p>
              )}

              {director && (
                <div className="pt-2">
                  <Link
                    href={`/search?tab=movies&person=${director.id}&personName=${encodeURIComponent(director.name)}&role=crew`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 hover:bg-red-600/30 hover:border-red-500/50 border border-white/10 text-zinc-200 hover:text-white transition group"
                  >
                    <Clapperboard className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
                    <span>Dirección: <strong className="text-white underline underline-offset-2">{director.name}</strong></span>
                  </Link>
                </div>
              )}
            </div>

            {/* Post-Credits Scene Banner */}
            {hasStinger && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>¡Alerta! Esta película contiene escena post-créditos adicional</span>
              </div>
            )}

            {/* Genres Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-zinc-300"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => openLogModal(movie)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar / Puntuar</span>
              </button>

              <button
                onClick={handleToggleWatchlist}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition active:scale-95 ${
                  inWatchlist
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-white/10 border-white/15 hover:bg-white/20 text-white"
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{inWatchlist ? "En tu Watchlist" : "Agregar a Watchlist"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Synopsis & Streaming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Synopsis & Cast */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white">Sinopsis</h2>
            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
              {movie.overview || "No hay sinopsis disponible en español para este título."}
            </p>
          </div>

          {/* Cast */}
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Reparto Principal</h2>
                <span className="text-xs text-zinc-500">Toca un actor para ver sus películas</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {movie.credits.cast.slice(0, 10).map((actor) => (
                  <Link
                    key={actor.id}
                    href={`/search?tab=movies&person=${actor.id}&personName=${encodeURIComponent(actor.name)}&role=cast`}
                    className="p-3 rounded-2xl bg-[#141420] border border-white/5 flex flex-col items-center text-center space-y-2 hover:border-red-500/40 hover:-translate-y-1 transition group"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10 group-hover:border-red-500/40 transition">
                      {actor.profile_path ? (
                        <img
                          src={getImageUrl(actor.profile_path, "w185")}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {actor.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{actor.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Community Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-white">Reseñas de la Comunidad</h2>
              </div>
              <span className="text-xs text-zinc-400">{reviews.length} opiniones</span>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-[#141420] border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.profile?.avatar_url || `https://ui-avatars.com/api/?name=${rev.profile?.username || "User"}&background=e50914&color=fff`}
                          alt={rev.profile?.username || "Usuario"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{rev.profile?.username || "Cinéfilo"}</p>
                          <p className="text-[11px] text-zinc-500">{formatDate(rev.watched_at)}</p>
                        </div>
                      </div>

                      {rev.rating !== null && (
                        <div className="flex items-center gap-1 font-bold text-sm">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className={getRatingColor(rev.rating)}>{rev.rating}/10</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                      &ldquo;{rev.review}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#141420]/50 border border-white/5 text-center text-sm text-zinc-500">
                Aún no hay reseñas registradas para esta película. ¡Sé el primero en calificarla!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Streaming Providers & Similar */}
        <div className="space-y-6">
          {/* Where to Watch */}
          <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-base">Dónde Verla</h3>
            </div>

            {streamProviders.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs text-zinc-400">Plataformas de streaming:</span>
                <div className="flex flex-wrap gap-2.5">
                  {streamProviders.map((prov) => (
                    <div
                      key={prov.provider_id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10"
                      title={prov.provider_name}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w92${prov.logo_path}`}
                        alt={prov.provider_name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <span className="text-xs font-semibold text-white pr-1">
                        {prov.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                No hay plataformas digitales reportadas actualmente para esta región.
              </p>
            )}
          </div>

          {/* Production Companies / Studios */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Estudios y Productoras</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.production_companies.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/search?tab=movies&company=${comp.id}&companyName=${encodeURIComponent(comp.name)}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition group"
                  >
                    {comp.logo_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${comp.logo_path}`}
                        alt={comp.name}
                        className="h-4 object-contain brightness-90 group-hover:brightness-100"
                      />
                    )}
                    <span>{comp.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar Movies */}
          {movie.similar?.results && movie.similar.results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Películas Similares</h3>
              <div className="grid grid-cols-2 gap-3">
                {movie.similar.results.slice(0, 4).map((sim) => (
                  <MovieCard key={sim.id} movie={sim} showBlacklistAction={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
