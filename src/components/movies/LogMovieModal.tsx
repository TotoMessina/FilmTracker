"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Star, 
  Calendar, 
  Clock,
  RotateCcw, 
  Film, 
  Tv, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Lock, 
  Users,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { 
  TMDBMovie, 
  getMovieDetails, 
  getMovieImages, 
  getImageUrl, 
  hasPostCreditsScene 
} from "@/lib/tmdb/client";
import { checkAndUnlockBadges } from "@/lib/gamification/badges";
import { Profile } from "@/lib/supabase/types";

const PLATFORMS = [
  "Netflix",
  "HBO Max",
  "Disney+",
  "Prime Video",
  "Apple TV+",
  "Cine",
  "Archivo / Físico",
  "Otro",
];

const FORMATS = ["Normal", "4K HDR", "IMAX", "3D", "DVD / BluRay", "Proyección"];

export function LogMovieModal() {
  const { isLogModalOpen, activeLogMovie, editingLog, closeLogModal, onLogSaved, triggerConfetti } = useApp();
  const { user, isGuest } = useAuth();

  const [movieDetails, setMovieDetails] = useState<TMDBMovie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [watchedAt, setWatchedAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [noExactDate, setNoExactDate] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(7.0);
  const [isRewatch, setIsRewatch] = useState<boolean>(false);
  const [platform, setPlatform] = useState<string>("Netflix");
  const [format, setFormat] = useState<string>("Normal");
  const [review, setReview] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [customPosterPath, setCustomPosterPath] = useState<string | null>(null);

  // Alternative Posters Modal
  const [showPosterPicker, setShowPosterPicker] = useState(false);
  const [availablePosters, setAvailablePosters] = useState<string[]>([]);
  const [loadingPosters, setLoadingPosters] = useState(false);

  // Companions
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [selectedCompanionIds, setSelectedCompanionIds] = useState<string[]>([]);

  // AI Review Assistant
  const [generatingReview, setGeneratingReview] = useState(false);
  const [aiReviewToast, setAiReviewToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load details when modal opens
  useEffect(() => {
    if (!isLogModalOpen || !activeLogMovie) return;

    setErrorMsg(null);
    const tmdbId = activeLogMovie.id;

    // Prefill if editing
    if (editingLog) {
      const hasDate = Boolean(editingLog.watched_at);
      setNoExactDate(!hasDate);
      setWatchedAt(editingLog.watched_at || new Date().toISOString().split("T")[0]);
      setRating(editingLog.rating ?? 7.0);
      setIsRewatch(editingLog.is_rewatch || false);
      setPlatform(editingLog.platform || "Netflix");
      setFormat(editingLog.format || "Normal");
      setReview(editingLog.review || "");
      setNotes(editingLog.notes || "");
      setCustomPosterPath(editingLog.custom_poster_path || null);
    } else {
      // Default new log
      setNoExactDate(false);
      setWatchedAt(new Date().toISOString().split("T")[0]);
      setRating(7.0);
      setIsRewatch(false);
      setPlatform("Netflix");
      setFormat("Normal");
      setReview("");
      setNotes("");
      setCustomPosterPath(null);
      setSelectedCompanionIds([]);
    }

    // Fetch full TMDB movie details
    setLoadingMovie(true);
    getMovieDetails(tmdbId)
      .then((data) => {
        setMovieDetails(data);
      })
      .catch((err) => {
        console.warn("Could not fetch full TMDB movie:", err);
      })
      .finally(() => setLoadingMovie(false));

    // Fetch followers if user logged in
    if (user) {
      supabase
        .from("relationships")
        .select("follower:profiles!relationships_follower_id_fkey(*)")
        .eq("following_id", user.id)
        .then(({ data }) => {
          if (data) {
            const list = data.map((d: any) => d.follower).filter(Boolean);
            setFollowers(list);
          }
        });
    }
  }, [isLogModalOpen, activeLogMovie, editingLog, user]);

  if (!isLogModalOpen || !activeLogMovie) return null;

  const currentPoster = customPosterPath || movieDetails?.poster_path || activeLogMovie.poster_path;
  const hasStinger = movieDetails ? hasPostCreditsScene(movieDetails) : false;

  const handleOpenPosterPicker = async () => {
    setShowPosterPicker(true);
    setLoadingPosters(true);
    try {
      const res = await getMovieImages(activeLogMovie.id);
      if (res?.posters && res.posters.length > 0) {
        setAvailablePosters(res.posters.map((p) => p.file_path));
      }
    } catch (err) {
      console.warn("Error fetching posters:", err);
    } finally {
      setLoadingPosters(false);
    }
  };

  const handleGenerateAiReview = async () => {
    if (!activeLogMovie || generatingReview) return;

    setGeneratingReview(true);
    setAiReviewToast(null);

    try {
      const watchedWith = selectedCompanionIds
        .map((id) => followers.find((f) => f.id === id)?.username)
        .filter(Boolean) as string[];

      const res = await fetch("/api/ai/review-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle: movieDetails?.title || activeLogMovie.title,
          movieYear: movieDetails?.release_date ? movieDetails.release_date.split("-")[0] : null,
          movieGenres: movieDetails?.genres || [],
          movieOverview: movieDetails?.overview || "",
          userRating: rating,
          userDraft: review,
          userNotes: notes,
          platform,
          format,
          isRewatch,
          watchedWith,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo generar la reseña.");
      }

      const data = await res.json();
      if (data?.review) {
        setReview(data.review);
        setAiReviewToast({
          message: review.trim()
            ? "✨ Reseña desarrollada a partir de tus ideas — podés editarla"
            : "✨ Borrador sugerido según tu puntuación — podés editarlo",
          type: "success",
        });
        setTimeout(() => setAiReviewToast(null), 4000);
      }
    } catch (err: any) {
      console.error("Error al generar reseña con IA:", err);
      setAiReviewToast({
        message: err?.message || "Ocurrió un error al generar la reseña.",
        type: "error",
      });
      setTimeout(() => setAiReviewToast(null), 4000);
    } finally {
      setGeneratingReview(false);
    }
  };

  const isFormReadyForAi = rating !== null && rating !== undefined && Boolean(platform);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const tmdbId = activeLogMovie.id;
    const title = movieDetails?.title || activeLogMovie.title;

    const finalWatchedAt = noExactDate ? null : (watchedAt || null);

    try {
      // 1. Guest Mode
      if (isGuest || !user) {
        const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
        const newLog = {
          id: editingLog ? editingLog.id : `guest-log-${Date.now()}`,
          user_id: "guest-user-123",
          tmdb_id: tmdbId,
          watched_at: finalWatchedAt,
          rating,
          review,
          notes,
          platform,
          format,
          is_rewatch: isRewatch,
          custom_poster_path: customPosterPath,
          created_at: new Date().toISOString(),
          movie: {
            tmdb_id: tmdbId,
            title,
            poster_path: currentPoster,
            release_date: movieDetails?.release_date || null,
            runtime: movieDetails?.runtime || null,
            vote_average: movieDetails?.vote_average || null,
            overview: movieDetails?.overview || null,
            genres: movieDetails?.genres || null,
            production_countries: movieDetails?.production_countries || null,
            cast_data: movieDetails?.credits?.cast?.slice(0, 10) || null,
          },
        };

        let updatedLogs;
        if (editingLog) {
          updatedLogs = guestLogs.map((l: any) => (l.id === editingLog.id ? newLog : l));
        } else {
          updatedLogs = [newLog, ...guestLogs];
        }

        localStorage.setItem("filmtracker_guest_logs", JSON.stringify(updatedLogs));
        triggerConfetti();
        onLogSaved();
        closeLogModal();
        return;
      }

      // 2. Supabase Authenticated Mode
      let activeUserId = user?.id;
      if (!isGuest && user) {
        const { data: userData, error: userCheckErr } = await supabase.auth.getUser();
        if (userCheckErr || !userData?.user) {
          throw new Error("Tu sesión ha expirado. Por favor ve a 'Acceder' para iniciar sesión nuevamente.");
        }
        activeUserId = userData.user.id;
      }

      if (!activeUserId) {
        throw new Error("Usuario no autenticado.");
      }

      // Step A: Upsert movie in local cache
      const { error: movieError } = await supabase.from("movies").upsert({
        tmdb_id: tmdbId,
        title,
        poster_path: movieDetails?.poster_path || activeLogMovie.poster_path,
        backdrop_path: movieDetails?.backdrop_path || null,
        release_date: movieDetails?.release_date || null,
        runtime: movieDetails?.runtime || null,
        genres: movieDetails?.genres || [],
        production_countries: movieDetails?.production_countries || [],
        production_companies: movieDetails?.production_companies || [],
        cast_data: movieDetails?.credits?.cast?.slice(0, 10) || [],
        vote_average: movieDetails?.vote_average || null,
        overview: movieDetails?.overview || null,
        updated_at: new Date().toISOString(),
      });

      if (movieError) {
        console.warn("Movie cache warning:", movieError);
      }

      // Step B: Insert or Update Log
      let logId = editingLog?.id;
      if (editingLog) {
        const { error: updateError } = await supabase
          .from("logs")
          .update({
            watched_at: finalWatchedAt,
            rating,
            review,
            notes,
            platform,
            format,
            is_rewatch: isRewatch,
            custom_poster_path: customPosterPath,
          })
          .eq("id", editingLog.id);

        if (updateError) throw updateError;
      } else {
        const { data: newLogData, error: insertError } = await supabase
          .from("logs")
          .insert({
            user_id: activeUserId,
            tmdb_id: tmdbId,
            watched_at: finalWatchedAt,
            rating,
            review,
            notes,
            platform,
            format,
            is_rewatch: isRewatch,
            custom_poster_path: customPosterPath,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        logId = newLogData.id;
      }

      // Step C: Companions handling
      if (logId && selectedCompanionIds.length > 0) {
        // delete previous
        await supabase.from("log_companions").delete().eq("log_id", logId);
        // insert new
        const companionRows = selectedCompanionIds.map((cId) => ({
          log_id: logId,
          user_id: cId,
        }));
        await supabase.from("log_companions").insert(companionRows);
      }

      // Step D: Unlock badges async
      checkAndUnlockBadges(activeUserId).then((newBadges) => {
        if (newBadges.length > 0) {
          triggerConfetti();
        }
      });

      if (rating >= 8) {
        triggerConfetti();
      }

      onLogSaved();
      closeLogModal();
    } catch (err: any) {
      console.error("Save log error:", err);
      let msg = err.message || "Error al guardar el registro en la base de datos.";
      if (err.code === "42501" || msg.includes("row-level security")) {
        msg = "No tienes permiso o tu sesión ha expirado. Por favor inicia sesión nuevamente en Acceder.";
      }
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] bg-[#12121e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {editingLog ? "Editar registro" : "Registrar película en el diario"}
            </h2>
          </div>
          <button
            onClick={closeLogModal}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Movie Preview Header */}
          <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="relative group shrink-0 w-20 aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-zinc-800">
              <img
                src={getImageUrl(currentPoster, "w300")}
                alt={activeLogMovie.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleOpenPosterPicker}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                title="Cambiar póster"
              >
                <ImageIcon className="w-4 h-4 mb-0.5" />
                <span>Póster</span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate">{activeLogMovie.title}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                {movieDetails?.release_date && <span>{movieDetails.release_date.split("-")[0]}</span>}
                {movieDetails?.runtime ? <span>• {movieDetails.runtime} min</span> : null}
                <button
                  type="button"
                  onClick={handleOpenPosterPicker}
                  className="text-red-400 hover:underline flex items-center gap-1 text-[11px] ml-auto"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Cambiar póster</span>
                </button>
              </div>

              {/* Post credits badge alert */}
              {hasStinger && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>¡Tiene escena post-créditos!</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating Slider & Score */}
          <div className="space-y-2 bg-[#171728] p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Tu Calificación</span>
              </label>
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {rating.toFixed(1)} <span className="text-xs text-zinc-500">/ 10</span>
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0 (Desastre)</span>
              <span>5 (Pasable)</span>
              <span>10 (Obra Maestra)</span>
            </div>
          </div>

          {/* Date & Rewatch */}
          <div className="bg-[#171728] p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  <span>Fecha de visualización</span>
                </label>
                {noExactDate ? (
                  <div className="w-full px-3 py-2 rounded-xl bg-white/5 border border-dashed border-zinc-700 text-zinc-400 text-xs italic flex items-center gap-2 h-[38px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sin fecha exacta (vista en el pasado)</span>
                  </div>
                ) : (
                  <input
                    type="date"
                    value={watchedAt}
                    onChange={(e) => setWatchedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 h-[38px]"
                  />
                )}
              </div>

              <div className="space-y-2.5 sm:pt-4">
                {/* No exact date toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-300 hover:text-white transition select-none">
                  <input
                    type="checkbox"
                    checked={noExactDate}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNoExactDate(checked);
                      if (!checked && !watchedAt) {
                        setWatchedAt(new Date().toISOString().split("T")[0]);
                      }
                    }}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-white/10 border-white/20 accent-red-600"
                  />
                  <span>No recuerdo la fecha / Vista hace tiempo</span>
                </label>

                {/* Rewatch toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-300 hover:text-white transition select-none">
                  <input
                    type="checkbox"
                    checked={isRewatch}
                    onChange={(e) => setIsRewatch(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-white/10 border-white/20 accent-red-600"
                  />
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>¿Es un rewatch? (ya la habías visto)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Platform & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-red-500" />
                <span>Plataforma</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1a1a2c] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-500" />
                <span>Formato</span>
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1a1a2c] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Public Review */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                <span>Reseña pública</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateAiReview}
                disabled={generatingReview || !isFormReadyForAi}
                title={
                  !isFormReadyForAi
                    ? "Completá rating y plataforma primero"
                    : review.trim()
                    ? "La IA articulará y expandirá tus ideas respetando tu opinión"
                    : "La IA generará un borrador inicial basado en tu calificación"
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/30 text-violet-300 text-xs font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {generatingReview ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                    <span>{review.trim() ? "Desarrollando..." : "Generando..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>{review.trim() ? "✨ Desarrollar con IA" : "✨ Redactar con IA"}</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Review Toast / Badge */}
            {aiReviewToast && (
              <div
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  aiReviewToast.type === "success"
                    ? "bg-violet-950/60 border-violet-500/40 text-violet-200"
                    : "bg-red-950/60 border-red-500/40 text-red-300"
                }`}
              >
                <span>{aiReviewToast.message}</span>
              </div>
            )}

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Escribe lo que sentiste (incluso palabras sueltas o ideas breves) y usa la IA para articular tu reseña..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Private Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Notas privadas (solo visibles para ti)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles personales, recuerdos, con quién estabas..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Companions list */}
          {followers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-500" />
                <span>¿Con quién la viste? (Etiquetar amigos)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {followers.map((follower) => {
                  const isSelected = selectedCompanionIds.includes(follower.id);
                  return (
                    <button
                      key={follower.id}
                      type="button"
                      onClick={() => {
                        setSelectedCompanionIds((prev) =>
                          isSelected ? prev.filter((id) => id !== follower.id) : [...prev, follower.id]
                        );
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition border ${
                        isSelected
                          ? "bg-red-600/30 border-red-500 text-white font-medium"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <img
                        src={follower.avatar_url || `https://ui-avatars.com/api/?name=${follower.username}&background=e50914&color=fff`}
                        alt={follower.username}
                        className="w-4 h-4 rounded-full"
                      />
                      <span>{follower.username}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={closeLogModal}
              className="px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50 transition text-center"
            >
              {saving ? "Guardando..." : editingLog ? "Actualizar Registro" : "Guardar en el Diario"}
            </button>
          </div>
        </form>

        {/* Poster Picker Submodal */}
        {showPosterPicker && (
          <div className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-lg z-20 p-6 flex flex-col animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Selecciona un póster alternativo</h3>
              <button
                type="button"
                onClick={() => setShowPosterPicker(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingPosters ? (
                <div className="text-center py-12 text-zinc-400 text-sm">Cargando pósters oficiales...</div>
              ) : availablePosters.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">No hay pósters alternativos disponibles.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availablePosters.map((path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => {
                        setCustomPosterPath(path);
                        setShowPosterPicker(false);
                      }}
                      className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 transition ${
                        customPosterPath === path
                          ? "border-red-500 ring-2 ring-red-500/50"
                          : "border-transparent hover:border-white/50"
                      }`}
                    >
                      <img
                        src={getImageUrl(path, "w300")}
                        alt="Poster option"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
