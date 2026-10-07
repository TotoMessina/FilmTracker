"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2,
  Film,
  Sparkles,
  Check,
  Plus,
  AlertCircle,
  Bookmark,
  Star,
  Tv,
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { getImageUrl, getBackdropUrl } from "@/lib/tmdb/client";
import {
  getConnectedFriends,
  fetchParticipantData,
  calculateGroupConsensus,
  getWatchTogetherRecommendations,
  ConnectedFriend,
  GroupRecommendation,
  GroupConsensusAnalysis,
  ParticipantProfileData,
} from "@/lib/services/watchTogether";
import {
  POPULAR_STREAMING_PLATFORMS,
  StreamingPlatformInfo,
  loadUserStreamingPlatforms,
} from "@/lib/services/streamingPlatforms";
import { supabase } from "@/lib/supabase/client";

export default function WatchTogetherView() {
  const { user, profile, isGuest } = useAuth();
  const { openLogModal, triggerConfetti } = useApp();

  const [friends, setFriends] = useState<ConnectedFriend[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Analysis & Consensus State
  const [analyzingConsensus, setAnalyzingConsensus] = useState(false);
  const [consensusAnalysis, setConsensusAnalysis] = useState<GroupConsensusAnalysis | null>(null);
  const [cachedParticipants, setCachedParticipants] = useState<ParticipantProfileData[]>([]);

  // AI Recommendations State
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [recommendations, setRecommendations] = useState<GroupRecommendation[] | null>(null);
  const [savedWatchlistIds, setSavedWatchlistIds] = useState<Set<number>>(new Set());

  const currentUserId = user?.id || (isGuest ? "guest-user-123" : "guest-user-123");
  const currentUsername = profile?.username || (isGuest ? "Vos" : "Mi Usuario");

  // 1. Load friends list
  useEffect(() => {
    async function loadFriends() {
      setLoadingFriends(true);
      try {
        const list = await getConnectedFriends(currentUserId);
        setFriends(list);
        // Pre-select 1 or 2 friends for a quick delightful first impression
        if (list.length > 0 && selectedFriendIds.length === 0) {
          setSelectedFriendIds([list[0].id]);
        }
      } catch (err) {
        console.warn("Error loading friends:", err);
      } finally {
        setLoadingFriends(false);
      }
    }

    loadFriends();
  }, [currentUserId]);

  // 2. Compute consensus data whenever selection changes
  useEffect(() => {
    let isCancelled = false;

    async function runConsensusAnalysis() {
      if (selectedFriendIds.length === 0) {
        setConsensusAnalysis(null);
        setCachedParticipants([]);
        return;
      }

      setAnalyzingConsensus(true);
      try {
        // Fetch current user platforms
        const myPlatforms = await loadUserStreamingPlatforms(user?.id);

        // Fetch current user data
        const currentUserData = await fetchParticipantData(
          {
            id: currentUserId,
            username: currentUsername,
            avatar_url: profile?.avatar_url || null,
            streaming_platforms: myPlatforms,
          },
          true
        );

        // Fetch selected friends data
        const selectedFriends = friends.filter((f) => selectedFriendIds.includes(f.id));
        const friendsData = await Promise.all(
          selectedFriends.map((f) =>
            fetchParticipantData({
              id: f.id,
              username: f.username,
              avatar_url: f.avatar_url,
              streaming_platforms: f.streaming_platforms,
            })
          )
        );

        const allParticipants: ParticipantProfileData[] = [currentUserData, ...friendsData];
        const analysis = calculateGroupConsensus(allParticipants);

        if (!isCancelled) {
          setCachedParticipants(allParticipants);
          setConsensusAnalysis(analysis);
        }
      } catch (err) {
        console.warn("Error analyzing consensus:", err);
      } finally {
        if (!isCancelled) {
          setAnalyzingConsensus(false);
        }
      }
    }

    runConsensusAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [selectedFriendIds, friends, currentUserId, currentUsername]);

  // Toggle friend selection (1 to 4 friends)
  const handleToggleFriend = (friendId: string) => {
    // Invalidate previous recommendations if user changes group
    setRecommendations(null);

    setSelectedFriendIds((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      }
      if (prev.length >= 4) {
        // Limit to max 4 friends
        return prev;
      }
      return [...prev, friendId];
    });
  };

  // Generate recommendations
  const handleGenerateRecommendations = async () => {
    if (!consensusAnalysis || cachedParticipants.length < 2) return;

    setLoadingRecommendations(true);
    setLoadingStep("Cruzando diarios y excluyendo películas vistas...");

    try {
      setTimeout(() => {
        setLoadingStep("Analizando afinidad de géneros y plataformas en común...");
      }, 700);

      setTimeout(() => {
        setLoadingStep("Consultando a la IA para redactar el consenso perfecto...");
      }, 1400);

      const recs = await getWatchTogetherRecommendations(cachedParticipants, consensusAnalysis);
      setRecommendations(recs);
      triggerConfetti();
    } catch (err: any) {
      console.error("Error generating watch together recommendations:", err);
      alert(err?.message || "Ocurrió un error al buscar recomendaciones de consenso.");
    } finally {
      setLoadingRecommendations(false);
      setLoadingStep("");
    }
  };

  // Add to user's Watchlist
  const handleAddToWatchlist = async (rec: GroupRecommendation) => {
    try {
      if (user) {
        await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: rec.tmdb_id,
          title: rec.title,
        });
      } else if (isGuest) {
        const raw = localStorage.getItem("filmtracker_guest_watchlist") || "[]";
        const wl = JSON.parse(raw);
        if (!wl.some((w: any) => w.tmdb_id === rec.tmdb_id)) {
          wl.push({ tmdb_id: rec.tmdb_id, title: rec.title });
          localStorage.setItem("filmtracker_guest_watchlist", JSON.stringify(wl));
        }
      }
      setSavedWatchlistIds((prev) => new Set([...prev, rec.tmdb_id]));
      triggerConfetti();
    } catch (err) {
      console.warn("Error adding to watchlist:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1a1528] via-[#151422] to-[#12111d] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Algoritmo de Consenso Cinéfilo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ¿Qué Ver Juntos? 🍿
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Elegí con quiénes vas a mirar una película hoy (entre 1 y 4 amigos). El algoritmo
            descarta automáticamente <strong>todo lo que alguno ya vio</strong>, cruza los géneros
            con mayor calificación en común, rescata coincidencias en sus Watchlists y la IA
            propone las <strong>3 mejores opciones de consenso</strong> disponibles en sus
            plataformas de streaming.
          </p>
        </div>
      </div>

      {/* 1. SELECTOR DE AMIGOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-purple-400" />
              <span>1. Seleccioná a tus acompañantes</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Elegí entre 1 y 4 amigos de tu red para cruzar sus perfiles cinéfilos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                selectedFriendIds.length > 0
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-white/5 text-zinc-400 border-white/10"
              }`}
            >
              {selectedFriendIds.length} / 4 amigos seleccionados ({selectedFriendIds.length + 1}{" "}
              personas en total)
            </span>
          </div>
        </div>

        {loadingFriends ? (
          <div className="py-12 text-center text-zinc-400 flex items-center justify-center gap-2 text-xs">
            <Film className="w-4 h-4 animate-spin text-purple-400" />
            <span>Cargando conexiones...</span>
          </div>
        ) : friends.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
            <Users2 className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-sm font-bold text-white">No hay otras conexiones en FilmTracker todavía</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Cuando otros usuarios se registren en la plataforma o interactúes con ellos desde la sección Social, aparecerán acá para buscar qué ver juntos.
            </p>
            <Link
              href="/social"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition mt-2"
            >
              <span>Explorar Comunidad en Social</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {friends.map((friend) => {
              const isSelected = selectedFriendIds.includes(friend.id);

              return (
                <div
                  key={friend.id}
                  onClick={() => handleToggleFriend(friend.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative select-none ${
                    isSelected
                      ? "bg-[#1c162b] border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-950/40"
                      : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={
                          friend.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=7c3aed&color=fff`
                        }
                        alt={friend.username}
                        className={`w-12 h-12 rounded-full object-cover border-2 transition ${
                          isSelected ? "border-purple-400" : "border-white/10"
                        }`}
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-black flex items-center justify-center font-black text-[11px] shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white truncate">{friend.username}</h3>
                      </div>
                      {friend.bio && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{friend.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Platforms Preview */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="text-[10px] text-zinc-500">Plataformas:</span>
                    <div className="flex items-center gap-1">
                      {friend.streaming_platforms?.slice(0, 3).map((platId) => {
                        const plat = POPULAR_STREAMING_PLATFORMS.find((p) => p.id === platId);
                        if (!plat) return null;
                        return (
                          <span
                            key={platId}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-zinc-300 font-bold"
                            title={plat.name}
                          >
                            {plat.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PANEL DE CONSENSO & DIAGNÓSTICO EN VIVO */}
      {selectedFriendIds.length > 0 && consensusAnalysis && (
        <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>2. Diagnóstico del Grupo en Tiempo Real</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Datos calculados cruzando los historiales de los {cachedParticipants.length}{" "}
                participantes.
              </p>
            </div>

            <button
              onClick={handleGenerateRecommendations}
              disabled={loadingRecommendations}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingRecommendations ? (
                <>
                  <Film className="w-4 h-4 animate-spin text-white" />
                  <span>{loadingStep || "Analizando con IA..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Descubrir Qué Ver Juntos 🍿</span>
                </>
              )}
            </button>
          </div>

          {/* Estadísticas de consenso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Películas Excluidas */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Filtro Anti-Repetición
              </span>
              <div className="text-2xl font-black text-rose-400">
                {consensusAnalysis.totalDiscardedMoviesCount}
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                Películas excluidas porque al menos uno de los integrantes ya la vio.
              </p>
            </div>

            {/* Géneros de Consenso */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Géneros Mejor Calificados
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {consensusAnalysis.sharedHighRatedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight pt-1">
                Afinidad cruzada según las calificaciones de sus diarios.
              </p>
            </div>

            {/* Coincidencias en Watchlists */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Watchlists Coincidentes
              </span>
              <div className="text-2xl font-black text-amber-400">
                {consensusAnalysis.watchlistMatches.length}
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {consensusAnalysis.watchlistMatches.length > 0
                  ? `Películas que 2 o más miembros tenían guardadas (ej: "${consensusAnalysis.watchlistMatches[0].title}")`
                  : "Sin coincidencias directas en listas de pendientes."}
              </p>
            </div>

            {/* Plataformas en Común */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Streaming en Común
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {consensusAnalysis.commonPlatforms.length > 0 ? (
                  consensusAnalysis.commonPlatforms.map((plat) => (
                    <span
                      key={plat.id}
                      className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                    >
                      <Tv className="w-3 h-3" />
                      <span>{plat.name}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">Variedad de servicios</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight pt-1">
                Servicios disponibles en los perfiles de los miembros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTADOS DE LA IA (3 RECOMENDACIONES DE CONSENSO) */}
      {recommendations && (
        <div className="space-y-6 pt-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Veredicto del Algoritmo</span>
              </span>
              <h2 className="text-2xl font-black text-white">
                Las 3 Películas de Consenso Perfectas
              </h2>
            </div>

            <button
              onClick={handleGenerateRecommendations}
              disabled={loadingRecommendations}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white transition flex items-center gap-2 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerar opciones</span>
            </button>
          </div>

          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const posterUrl = getImageUrl(rec.poster_path, "w500");
              const backdropUrl = getBackdropUrl(rec.backdrop_path, "original");
              const isSaved = savedWatchlistIds.has(rec.tmdb_id);

              return (
                <div
                  key={rec.tmdb_id}
                  className="rounded-3xl bg-[#141420] border border-white/10 overflow-hidden shadow-2xl relative group hover:border-purple-500/40 transition-all duration-300"
                >
                  {/* Subtle backdrop overlay header */}
                  {rec.backdrop_path && (
                    <div className="h-36 sm:h-48 w-full relative overflow-hidden">
                      <img
                        src={backdropUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover object-top opacity-30 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141420]/70 to-[#141420]" />
                    </div>
                  )}

                  <div className="p-6 sm:p-8 -mt-20 sm:-mt-28 relative z-10 flex flex-col md:flex-row gap-6">
                    {/* Poster */}
                    <div className="w-32 sm:w-44 h-48 sm:h-64 rounded-2xl overflow-hidden shrink-0 bg-black/60 border-2 border-white/15 shadow-2xl relative">
                      <img
                        src={posterUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600 text-white font-black text-xs shadow">
                        #{index + 1} Opción
                      </div>
                    </div>

                    {/* Movie Info & Consensus Explanation */}
                    <div className="flex-1 space-y-4 min-w-0">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl sm:text-2xl font-black text-white hover:text-purple-400 transition">
                            <Link href={`/movie/${rec.tmdb_id}`}>{rec.title}</Link>
                          </h3>
                          {rec.year && (
                            <span className="text-sm font-semibold text-zinc-400">
                              ({rec.year})
                            </span>
                          )}
                          {rec.vote_average ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{rec.vote_average.toFixed(1)}</span>
                            </span>
                          ) : null}
                        </div>

                        {rec.genre && (
                          <span className="text-xs text-purple-300 font-semibold block mt-1">
                            {rec.genre}
                          </span>
                        )}
                      </div>

                      {/* EXPLICACIÓN DE CONSENSO PERSONALIZADA */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border border-purple-500/30 text-xs sm:text-sm text-purple-100 space-y-1.5">
                        <div className="font-bold text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>Por qué es el consenso ideal para ustedes:</span>
                        </div>
                        <p className="leading-relaxed">{rec.consensusReason}</p>
                        {rec.keyAppeal && (
                          <p className="text-[11px] text-zinc-400 italic pt-1">
                            ✨ {rec.keyAppeal}
                          </p>
                        )}
                      </div>

                      {/* Sinopsis */}
                      {rec.overview && (
                        <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2">
                          {rec.overview}
                        </p>
                      )}

                      {/* PLATAFORMAS EN COMÚN */}
                      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Dónde verla juntos:
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {rec.commonPlatforms.length > 0 ? (
                              rec.commonPlatforms.map((plat) => (
                                <span
                                  key={plat.id}
                                  className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5"
                                >
                                  <Tv className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Disponible en {plat.name}</span>
                                </span>
                              ))
                            ) : rec.availablePlatforms.length > 0 ? (
                              rec.availablePlatforms.slice(0, 3).map((plat) => (
                                <span
                                  key={plat.id}
                                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/10 text-zinc-300 border border-white/10 flex items-center gap-1"
                                >
                                  <Tv className="w-3 h-3 text-zinc-400" />
                                  <span>{plat.name}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-zinc-500 italic">
                                Disponible para alquilar o en catálogo digital
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAddToWatchlist(rec)}
                            disabled={isSaved}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              isSaved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>En tu Watchlist</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>+ Watchlist</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              openLogModal({
                                id: rec.tmdb_id,
                                title: rec.title,
                                poster_path: rec.poster_path,
                              })
                            }
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Log</span>
                          </button>

                          <Link
                            href={`/movie/${rec.tmdb_id}`}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow"
                          >
                            <span>Ver ficha</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
