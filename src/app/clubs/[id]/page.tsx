"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users2,
  Film,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  Vote,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
  Send,
  Plus,
  Search,
  Check,
  ChevronLeft,
  Shield,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import {
  Cineclub,
  CineclubMember,
  CineclubPollOption,
  CineclubMessage,
} from "@/lib/supabase/types";
import {
  getCineclubById,
  toggleMemberWatched,
  voteInCineclubPoll,
  proposePollMovie,
  getClubMessages,
  postClubMessage,
  joinCineclub,
} from "@/lib/services/cineclubs";
import { getBackdropUrl, getImageUrl, searchMovies, TMDBMovie } from "@/lib/tmdb/client";

export default function CineclubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const clubId = resolvedParams.id;

  const { user, profile, isGuest } = useAuth();
  const { openLogModal, triggerConfetti } = useApp();

  const currentUserId = user?.id || (isGuest ? "guest-user-123" : "");
  const currentUsername = profile?.username || (isGuest ? "Invitado" : "Usuario");

  const [club, setClub] = useState<Cineclub | null>(null);
  const [messages, setMessages] = useState<CineclubMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // New message input
  const [newComment, setNewComment] = useState("");
  const [isSpoilerComment, setIsSpoilerComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Revealed spoiler message IDs for user session
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Propose movie modal
  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);

  const loadData = async () => {
    try {
      const data = await getCineclubById(clubId);
      if (data) {
        setClub(data);
      }
      const msgs = await getClubMessages(clubId);
      setMessages(msgs);
    } catch (err) {
      console.warn("Error cargando detalles de club:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleClubsUpdate = () => loadData();
    const handleMsgsUpdate = () => loadData();

    window.addEventListener("filmtracker_cineclubs_updated", handleClubsUpdate);
    window.addEventListener(`filmtracker_club_msgs_updated_${clubId}`, handleMsgsUpdate);

    return () => {
      window.removeEventListener("filmtracker_cineclubs_updated", handleClubsUpdate);
      window.removeEventListener(`filmtracker_club_msgs_updated_${clubId}`, handleMsgsUpdate);
    };
  }, [clubId]);

  // Check if current user is member and if they have watched current movie
  const currentMember = club?.members?.find((m) => m.user_id === currentUserId);
  const isMember = Boolean(currentMember || club?.creator_id === currentUserId);
  const userHasWatched = Boolean(currentMember?.has_watched);

  // Member stats
  const totalMembers = club?.members?.length || 1;
  const watchedMembersCount = club?.members?.filter((m) => m.has_watched).length || 0;
  const watchedPercentage = Math.round((watchedMembersCount / totalMembers) * 100);

  // Toggle "Ya la vi" status
  const handleToggleWatched = async () => {
    const nextWatched = !userHasWatched;
    await toggleMemberWatched(clubId, currentUserId, nextWatched);
    if (nextWatched) {
      triggerConfetti();
    }
    loadData();
  };

  // Join club
  const handleJoin = async () => {
    const creatorProfile = profile
      ? {
          id: profile.id,
          username: profile.username || currentUsername,
          avatar_url: profile.avatar_url || null,
        }
      : {
          id: currentUserId,
          username: currentUsername,
          avatar_url: null,
        };
    await joinCineclub(clubId, creatorProfile);
    triggerConfetti();
    loadData();
  };

  // Vote in poll
  const handleVote = async (tmdbId: number) => {
    await voteInCineclubPoll(clubId, tmdbId, currentUserId);
    triggerConfetti();
    loadData();
  };

  // Search TMDB for proposal
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchMovies(searchQuery.trim());
        setSearchResults((res.results || []).slice(0, 5));
      } catch (err) {
        console.warn("Error buscando en TMDB:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Propose movie submit
  const handleProposeMovie = async (movie: TMDBMovie) => {
    await proposePollMovie(
      clubId,
      {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      },
      currentUserId
    );
    triggerConfetti();
    setIsProposeOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    loadData();
  };

  // Post discussion message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await postClubMessage(
        clubId,
        {
          user_id: currentUserId,
          message: newComment.trim(),
          is_spoiler: isSpoilerComment,
        },
        profile || { id: currentUserId, username: currentUsername }
      );
      setNewComment("");
      setIsSpoilerComment(false);
      loadData();
    } catch (err) {
      console.warn("Error enviando mensaje:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleRevealSpoiler = (msgId: string) => {
    setRevealedSpoilers((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
        <p className="text-sm font-semibold text-zinc-400">Cargando club de cine...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-12 rounded-3xl bg-[#11111a] border border-white/5 text-center space-y-4 max-w-md mx-auto my-12">
        <h3 className="text-xl font-bold text-white">Cineclub no encontrado</h3>
        <p className="text-xs text-zinc-400">El club que buscás no existe o fue eliminado.</p>
        <Link
          href="/clubs"
          className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a Clubes</span>
        </Link>
      </div>
    );
  }

  const pollOptions = club.poll?.options || [];
  const totalVotes = pollOptions.reduce((acc, opt) => acc + (opt.votes?.length || 0), 0);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16 select-none">
      {/* Top Back Nav & Quick Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a Clubes</span>
        </Link>

        {!isMember && (
          <button
            onClick={handleJoin}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Unirme al Club</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. HERO: PELÍCULA DE LA SEMANA / DEL MES                  */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#181528] via-[#100f1c] to-[#0c0c14] shadow-2xl">
        {/* Backdrop Ambient Image */}
        {club.current_movie?.backdrop_path && (
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none">
            <Image
              src={getBackdropUrl(club.current_movie.backdrop_path, "original")}
              alt={club.current_movie.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 p-6 sm:p-10 space-y-8">
          {/* Top Club Pill & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5" />
                {club.name}
              </span>

              {club.discussion_date && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Debate: {new Date(club.discussion_date).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "long" })}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {club.description}
            </p>
          </div>

          {/* Current Movie Showcase */}
          {club.current_movie && (
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 shadow-2xl">
              {/* Poster */}
              <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/20 shadow-2xl shrink-0">
                {club.current_movie.poster_path ? (
                  <Image
                    src={getImageUrl(club.current_movie.poster_path, "w500")}
                    alt={club.current_movie.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Film className="w-12 h-12 text-zinc-600 m-auto" />
                )}
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block">
                    ★ PELÍCULA SELECCIONADA DE LA SEMANA
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {club.current_movie.title}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-zinc-400 font-medium">
                    {club.current_movie.release_date && (
                      <span>{club.current_movie.release_date.split("-")[0]}</span>
                    )}
                    {club.current_movie.runtime && (
                      <span>• {club.current_movie.runtime} minutos</span>
                    )}
                    {club.current_movie.vote_average && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {club.current_movie.vote_average.toFixed(1)} / 10 TMDB
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal line-clamp-3">
                  {club.current_movie.overview}
                </p>

                {/* Watched Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleToggleWatched}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                      userHasWatched
                        ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 shadow-emerald-500/20"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-105 active:scale-95 shadow-amber-500/20"
                    }`}
                  >
                    {userHasWatched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>¡Ya la viste! (Click para desmarcar)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Marcar como "Ya la vi" ✓</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (club.current_movie) {
                        openLogModal({
                          id: club.current_movie.tmdb_id,
                          title: club.current_movie.title,
                          poster_path: club.current_movie.poster_path,
                        });
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Film className="w-4 h-4 text-zinc-300" />
                    <span>Registrar con Reseña en mi Diario</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CONTADOR DE MIEMBROS QUE YA LA VIERON                   */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#12121d] border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-red-500" />
              <span>Avance del Club</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Seguimiento en tiempo real de quiénes ya completaron el visionado para abrir el debate.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-white">
              {watchedMembersCount} <span className="text-zinc-500 text-base">/ {totalMembers}</span>
            </span>
            <span className="text-xs font-bold text-amber-400 block">
              {watchedPercentage}% miembros listos
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${watchedPercentage}%` }}
          />
        </div>

        {/* Member Avatars and Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {(club.members || []).map((m) => (
            <div
              key={m.user_id}
              className={`p-3 rounded-2xl border transition flex flex-col items-center text-center gap-2 ${
                m.has_watched
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/[0.02] border-white/5 text-zinc-400"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/15 flex items-center justify-center font-bold text-white text-xs">
                  {m.user?.avatar_url ? (
                    <Image
                      src={m.user.avatar_url}
                      alt={m.user.username}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>{(m.user?.username || "U")[0].toUpperCase()}</span>
                  )}
                </div>

                {/* Status Dot Badge */}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shadow ${
                    m.has_watched ? "bg-emerald-500 text-black font-black" : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {m.has_watched ? "✓" : "⏱"}
                </div>
              </div>

              <div className="min-w-0 w-full">
                <span className="text-xs font-bold text-white block truncate">
                  @{m.user?.username || "Usuario"}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {m.has_watched ? "Lista para debatir" : "Pendiente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SECCIÓN DE VOTACIÓN PARA LA PRÓXIMA PELÍCULA           */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#131122] border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
              <Vote className="w-3.5 h-3.5" />
              <span>Votación de la Próxima Película</span>
            </div>
            <h3 className="text-xl font-black text-white">Elegí la siguiente historia del Club</h3>
            <p className="text-xs text-zinc-400">
              Los miembros proponen títulos y votan democráticamente antes de la fecha límite.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {club.voting_deadline && (
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Cierra: {new Date(club.voting_deadline).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
              </span>
            )}

            <button
              onClick={() => setIsProposeOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Proponer Película</span>
            </button>
          </div>
        </div>

        {/* Poll Options Grid */}
        {pollOptions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/40 border border-white/5 text-center space-y-3">
            <p className="text-xs text-zinc-400">Todavía no hay películas propuestas en la encuesta.</p>
            <button
              onClick={() => setIsProposeOpen(true)}
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Proponer la primera opción</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pollOptions.map((opt) => {
              const voteCount = (opt.votes || []).length;
              const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const hasVotedForThis = (opt.votes || []).includes(currentUserId);

              return (
                <div
                  key={opt.tmdb_id}
                  className={`relative rounded-2xl p-4 border transition flex flex-col justify-between gap-4 overflow-hidden ${
                    hasVotedForThis
                      ? "bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/20"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                      {opt.poster_path ? (
                        <Image
                          src={getImageUrl(opt.poster_path, "w185")}
                          alt={opt.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Film className="w-4 h-4 text-zinc-500 m-auto" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-white truncate">{opt.title}</h4>
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span>{voteCount} {voteCount === 1 ? "voto" : "votos"}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVote(opt.tmdb_id)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      hasVotedForThis
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                        : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                    }`}
                  >
                    {hasVotedForThis ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Votada por ti</span>
                      </>
                    ) : (
                      <span>Votar por esta película</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. MURO DE DISCUSIÓN (DEBATE SIN SPOILERS)                */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#11111a] border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-black text-white">Muro de Debate Cinéfilo</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Zona libre de spoilers. Los comentarios reveladores quedan difuminados para quienes aún no vieron la película.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                userHasWatched
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{userHasWatched ? "Modo Spoiler: Desbloqueado" : "Filtro Anti-Spoiler: Activo"}</span>
            </span>
          </div>
        </div>

        {/* Comment Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Compartí tu análisis, teoría, escena preferida o debate..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
            {/* Spoiler Checkbox Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={isSpoilerComment}
                onChange={(e) => setIsSpoilerComment(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-0 focus:ring-offset-0 bg-zinc-800"
              />
              <span className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Este comentario contiene spoilers
              </span>
            </label>

            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </form>

        {/* Messages Feed */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center">
              Todavía no hay comentarios en este club. ¡Sé el primero en iniciar el debate!
            </p>
          ) : (
            messages.map((msg) => {
              // Spoiler logic: If user hasn't watched the movie AND message is a spoiler AND user hasn't manually revealed this specific comment
              const isHiddenSpoiler = msg.is_spoiler && !userHasWatched && !revealedSpoilers.has(msg.id);

              return (
                <div
                  key={msg.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition space-y-2 relative ${
                    msg.is_spoiler
                      ? "bg-red-950/10 border-red-900/30"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {msg.user?.avatar_url ? (
                          <Image
                            src={msg.user.avatar_url}
                            alt={msg.user.username}
                            width={28}
                            height={28}
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{(msg.user?.username || "U")[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white">
                        @{msg.user?.username || "Usuario"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {msg.is_spoiler && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Spoiler
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500">
                        {new Date(msg.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Comment Body with anti-spoiler protection */}
                  {isHiddenSpoiler ? (
                    <div className="relative p-5 rounded-xl bg-black/60 border border-red-500/30 text-center space-y-2.5 my-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Advertencia de Spoiler</span>
                      </div>
                      <p className="text-xs text-zinc-300 max-w-md mx-auto">
                        Este comentario contiene detalles clave de la trama de{" "}
                        <strong className="text-white font-bold">{club.current_movie?.title}</strong>.
                      </p>
                      <button
                        onClick={() => toggleRevealSpoiler(msg.id)}
                        className="px-4 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Revelar comentario bajo mi responsabilidad</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal pt-1">
                      {msg.message}

                      {/* If user revealed manually, offer button to re-hide */}
                      {msg.is_spoiler && !userHasWatched && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleRevealSpoiler(msg.id)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Ocultar spoiler nuevamente</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal: Propose Movie */}
      {isProposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setIsProposeOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#181524] to-[#0f0e17] p-6 shadow-2xl z-10 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Vote className="w-4 h-4 text-amber-400" />
                <span>Proponer Película para la Encuesta</span>
              </h4>
              <button
                onClick={() => setIsProposeOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar película por título..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {searching && (
              <p className="text-xs text-zinc-400 text-center py-4">Buscando en TMDB...</p>
            )}

            <div className="max-h-64 overflow-y-auto space-y-2 no-scrollbar">
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleProposeMovie(m)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 cursor-pointer transition hover:border-amber-500/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {m.poster_path ? (
                        <Image
                          src={getImageUrl(m.poster_path, "w185")}
                          alt={m.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Film className="w-4 h-4 text-zinc-500 m-auto" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-white truncate">{m.title}</h5>
                      <span className="text-[10px] text-zinc-400">
                        {m.release_date ? m.release_date.split("-")[0] : ""}
                      </span>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-[11px] shrink-0">
                    Proponer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
