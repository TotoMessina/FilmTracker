"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Star, 
  Check, 
  Calendar, 
  Tv, 
  RotateCcw, 
  Loader2, 
  X, 
  ExternalLink,
  Edit3,
  Pencil
} from "lucide-react";
import { TMDBMovie } from "@/lib/tmdb/client";
import { Log } from "@/lib/supabase/types";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  performQuickLog, 
  getExistingUserLog,
  getAllUserMovieLogs,
  POPULAR_PLATFORMS, 
  getLastUsedPlatform, 
  setLastUsedPlatform 
} from "@/lib/services/quickLog";

interface MovieQuickLogInlineProps {
  movie: TMDBMovie;
  userWatched?: boolean;
  existingLog?: Log | null;
  onClose?: () => void;
  onLogged?: () => void;
}

export function MovieQuickLogInline({
  movie,
  userWatched = false,
  existingLog = null,
  onClose,
  onLogged,
}: MovieQuickLogInlineProps) {
  const { openLogModal, triggerConfetti, onLogSaved } = useApp();
  const { user, isGuest } = useAuth();

  const [currentLog, setCurrentLog] = useState<Log | null>(existingLog);
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [mode, setMode] = useState<"rewatch" | "edit">("rewatch");
  const [rating, setRating] = useState<number>(existingLog?.rating ?? 7.0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [dateOption, setDateOption] = useState<"today" | "yesterday" | "none" | "custom">("today");
  const [customDate, setCustomDate] = useState<string>(
    existingLog?.watched_at || new Date().toISOString().split("T")[0]
  );
  const [platform, setPlatform] = useState<string>(
    existingLog?.platform || getLastUsedPlatform()
  );
  const [isRewatch, setIsRewatch] = useState<boolean>(
    existingLog?.is_rewatch || userWatched
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync / fetch existing logs on mount or when props update
  useEffect(() => {
    if (existingLog) {
      setCurrentLog(existingLog);
      setAllLogs([existingLog]);
      setMode("rewatch");
      setIsRewatch(true);
      setDateOption("today");
    }

    // Auto-fetch all logs for movie
    getAllUserMovieLogs(movie.id, user?.id, Boolean(isGuest || !user)).then((logs) => {
      if (logs && logs.length > 0) {
        setAllLogs(logs);
        setCurrentLog(logs[0]);
        // Default to registering a new rewatch with today's date
        setMode("rewatch");
        setIsRewatch(true);
        setDateOption("today");
        if (typeof logs[0].rating === "number") {
          setRating(logs[0].rating);
        }
        if (logs[0].platform) {
          setPlatform(logs[0].platform);
        }
      } else {
        setAllLogs([]);
        setCurrentLog(null);
        setMode("rewatch");
        setIsRewatch(false);
      }
    });
  }, [movie.id, existingLog, user, isGuest]);

  const applyLogToForm = (logItem: Log) => {
    if (typeof logItem.rating === "number") {
      setRating(logItem.rating);
    }
    if (logItem.platform) {
      setPlatform(logItem.platform);
    }
    if (typeof logItem.is_rewatch === "boolean") {
      setIsRewatch(logItem.is_rewatch);
    }

    if (!logItem.watched_at) {
      setDateOption("none");
    } else {
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

      if (logItem.watched_at === todayStr) {
        setDateOption("today");
      } else if (logItem.watched_at === yesterdayStr) {
        setDateOption("yesterday");
      } else {
        setDateOption("custom");
        setCustomDate(logItem.watched_at);
      }
    }
  };

  const getComputedWatchedAt = (): string | null => {
    if (dateOption === "none") return null;
    if (dateOption === "today") return new Date().toISOString().split("T")[0];
    if (dateOption === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    }
    return customDate || new Date().toISOString().split("T")[0];
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setErrorMsg(null);

    const watchedAt = getComputedWatchedAt();

    const isRewatchMode = mode === "rewatch" && (allLogs.length > 0 || userWatched || currentLog !== null);

    try {
      const result = await performQuickLog({
        movie,
        rating,
        watchedAt,
        platform,
        isRewatch: isRewatchMode || isRewatch,
        existingLogId: isRewatchMode ? null : (currentLog?.id || null),
        createNewRewatch: isRewatchMode,
        user,
        isGuest: Boolean(isGuest || !user),
        triggerConfetti,
        onLogSaved,
      });

      if (!result.success) {
        throw new Error(result.error || "No se pudo registrar la película.");
      }

      if (result.log) {
        setCurrentLog(result.log);
        setAllLogs((prev) =>
          isRewatchMode
            ? [result.log!, ...prev]
            : prev.map((l) => (l.id === result.log!.id ? result.log! : l))
        );
      }

      setSavedSuccess(true);
      if (onLogged) {
        onLogged();
      }
      if (triggerConfetti) {
        triggerConfetti();
      }
    } catch (err: any) {
      console.error("Inline quick log save error:", err);
      setErrorMsg(err?.message || "Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const getRatingLabel = (val: number): { text: string; color: string } => {
    if (val >= 9.5) return { text: "Obra Maestra 🏆", color: "text-amber-400" };
    if (val >= 8.5) return { text: "Excelente ✨", color: "text-emerald-400" };
    if (val >= 7.0) return { text: "Muy Buena 👍", color: "text-blue-400" };
    if (val >= 5.5) return { text: "Entretenida / Pasable 🍿", color: "text-zinc-300" };
    if (val >= 4.0) return { text: "Regular / Floja 😐", color: "text-zinc-400" };
    return { text: "Mala / Decepcionante 🥱", color: "text-rose-400" };
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = getRatingLabel(currentDisplayRating);

  if (savedSuccess) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-white space-y-3 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-300">
                {mode === "rewatch" && (allLogs.length > 1 || userWatched)
                  ? "¡Nuevo Rewatch registrado con éxito! 🔄"
                  : currentLog
                  ? "¡Registro actualizado con éxito!"
                  : "¡Registrada con éxito en tu Diario!"}
              </h4>
              <p className="text-xs text-zinc-300">
                {movie.title} • {rating}★ • {platform} •{" "}
                {dateOption === "none" ? "Sin fecha" : getComputedWatchedAt()}
                {mode === "rewatch" && " • Sumado a tus estadísticas"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSavedSuccess(false)}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
            >
              Seguir editando
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0c16]/95 border border-amber-500/35 backdrop-blur-xl shadow-2xl space-y-4 text-white">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
            {currentLog ? <Edit3 className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-white">
                {allLogs.length > 0 || currentLog
                  ? mode === "rewatch"
                    ? "Registrar nuevo Rewatch"
                    : "Editar registro existente"
                  : "Carga Rápida en 1 Clic"}
              </h4>
              <span className={`px-2 py-0.2 rounded-full border text-[9px] font-extrabold uppercase ${
                allLogs.length > 0 || currentLog
                  ? mode === "rewatch"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                {allLogs.length > 0 || currentLog
                  ? mode === "rewatch"
                    ? "🔄 Nuevo Rewatch"
                    : "✏️ Modo Edición"
                  : "⚡ Instantáneo"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {allLogs.length > 0 || currentLog
                ? mode === "rewatch"
                  ? "Registrá una nueva fecha de visualización sin borrar tu historial anterior."
                  : "Modificá la calificación, fecha o plataforma de tu registro anterior."
                : "Puntuá y guardá directamente sin abrir formularios pesados"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Cerrar panel de carga rápida"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {(currentLog || allLogs.length > 0) && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {allLogs.length > 1 ? `Vista ${allLogs.length} veces` : "Ya registrada"}
              </span>
              <span className="text-xs font-bold text-white">
                {mode === "rewatch" ? "Nuevo Rewatch (Nueva fecha)" : "Editar anterior"}
              </span>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-black/50 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMode("rewatch");
                  setIsRewatch(true);
                  setDateOption("today");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  mode === "rewatch"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>+ Rewatch</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("edit");
                  if (currentLog) applyLogToForm(currentLog);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                  mode === "edit"
                    ? "bg-white/15 text-white border border-white/10"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Pencil className="w-3 h-3" />
                <span>Editar anterior</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-300">
            {mode === "rewatch"
              ? "Se guardará con la fecha elegida en tu diario y sumará tiempo a tus estadísticas sin borrar las anteriores."
              : `Modificando la visualización del ${currentLog?.watched_at || "sin fecha"}.`}
          </p>
        </div>
      )}

      {/* 1. Rating Selector */}
      <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Puntuación (0 a 10)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black text-amber-300">
              {currentDisplayRating.toFixed(1)}
            </span>
            <span className={`text-[11px] font-semibold ${ratingInfo.color}`}>
              ({ratingInfo.text})
            </span>
          </div>
        </div>

        {/* 10 Stars row */}
        <div className="flex items-center justify-between py-1 px-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
            const isFilled = currentDisplayRating >= starVal;
            const isHalf = !isFilled && currentDisplayRating >= starVal - 0.5;
            return (
              <button
                key={starVal}
                type="button"
                onClick={() => setRating(starVal)}
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer"
                title={`${starVal}/10`}
              >
                <Star
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                    isFilled
                      ? "text-amber-400 fill-amber-400"
                      : isHalf
                      ? "text-amber-400 fill-amber-400/40"
                      : "text-zinc-600 hover:text-amber-400/50"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={rating}
          onChange={(e) => setRating(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
        />

        {/* Quick Presets */}
        <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
          {[
            { val: 5, label: "5 🍿" },
            { val: 6, label: "6" },
            { val: 7, label: "7 ⭐" },
            { val: 8, label: "8" },
            { val: 9, label: "9 ✨" },
            { val: 10, label: "10 🏆" },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setRating(preset.val)}
              className={`flex-1 py-1 rounded-lg border text-center transition cursor-pointer font-bold ${
                rating === preset.val
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Date and Platform grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Fecha</span>
          </label>

          <div className="grid grid-cols-4 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setDateOption("today")}
              className={`py-1.5 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                dateOption === "today"
                  ? "bg-red-600/20 border-red-500 text-red-300"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setDateOption("yesterday")}
              className={`py-1.5 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                dateOption === "yesterday"
                  ? "bg-red-600/20 border-red-500 text-red-300"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              Ayer
            </button>
            <button
              type="button"
              onClick={() => setDateOption("none")}
              className={`py-1.5 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                dateOption === "none"
                  ? "bg-red-600/20 border-red-500 text-red-300"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
              }`}
              title="Sin fecha exacta"
            >
              Sin fecha
            </button>
            <button
              type="button"
              onClick={() => setDateOption("custom")}
              className={`py-1.5 px-1 rounded-xl border font-bold text-center transition cursor-pointer ${
                dateOption === "custom"
                  ? "bg-red-600/20 border-red-500 text-red-300"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              Elegir...
            </button>
          </div>

          {dateOption === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
          )}
        </div>

        {/* Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-zinc-400" />
              <span>Plataforma</span>
            </div>
            <span className="text-[10px] text-zinc-500">Última: {platform}</span>
          </label>

          <div className="flex flex-wrap gap-1">
            {POPULAR_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  platform === p
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rewatch Toggle */}
      <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition">
        <input
          type="checkbox"
          checked={isRewatch}
          onChange={(e) => setIsRewatch(e.target.checked)}
          className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
        />
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Ya la había visto antes (Rewatch)</span>
        </div>
      </label>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:via-orange-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-orange-600/30 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === "rewatch" && (currentLog || allLogs.length > 0) ? "Guardando nuevo rewatch..." : currentLog ? "Actualizando registro..." : "Guardando en tu diario..."}</span>
            </>
          ) : (
            <>
              {mode === "rewatch" && (currentLog || allLogs.length > 0) ? (
                <>
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>Guardar nuevo Rewatch (+1 vista) ⚡</span>
                </>
              ) : currentLog ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios (Actualizar Registro) ⚡</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Guardar en mi Diario (1 Clic) ⚡</span>
                </>
              )}
            </>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              openLogModal(movie, mode === "edit" ? (currentLog || undefined) : undefined);
            }}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 transition inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>
              {mode === "rewatch" && (currentLog || allLogs.length > 0)
                ? "¿Querés escribir reseña completa para este rewatch o notas privadas? Abrir editor completo"
                : currentLog
                ? "¿Querés editar reseña completa, notas privadas o acompañantes? Abrir editor completo"
                : "¿Querés escribir reseña o agregar acompañantes? Abrir editor completo"}
            </span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieQuickLogInline;
