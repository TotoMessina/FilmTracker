"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Sparkles, 
  Users, 
  ThumbsUp, 
  Plus, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  Loader2 
} from "lucide-react";
import { 
  TriggerWarningItem, 
  TRIGGER_WARNING_CATEGORIES, 
  TriggerWarningCategory 
} from "@/lib/types/triggerWarnings";
import { useAuth } from "@/lib/context/AuthContext";

interface TriggerWarningsSectionProps {
  tmdbId: number;
  title: string;
  overview?: string;
  genres?: string[];
  keywords?: string[];
}

export function TriggerWarningsSection({
  tmdbId,
  title,
  overview = "",
  genres = [],
  keywords = [],
}: TriggerWarningsSectionProps) {
  const { user } = useAuth();

  const [warnings, setWarnings] = useState<TriggerWarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingAi, setDetectingAi] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TriggerWarningCategory | "">("");
  const [customLabel, setCustomLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch warnings on mount
  useEffect(() => {
    let isCancelled = false;

    async function loadWarnings() {
      setLoading(true);
      try {
        const url = `/api/movies/${tmdbId}/trigger-warnings${user ? `?userId=${user.id}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!isCancelled && data.warnings) {
          setWarnings(data.warnings);

          // If no warnings exist yet, trigger AI detection automatically
          if (data.warnings.length === 0) {
            triggerAiDetection();
          }
        }
      } catch (err) {
        console.warn("Error fetching trigger warnings:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadWarnings();

    return () => {
      isCancelled = true;
    };
  }, [tmdbId, user]);

  const triggerAiDetection = async () => {
    setDetectingAi(true);
    try {
      const res = await fetch("/api/ai/trigger-warnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdb_id: tmdbId,
          title,
          overview,
          genres,
          keywords,
        }),
      });
      const data = await res.json();
      if (data.warnings && Array.isArray(data.warnings)) {
        // Refresh full warnings list from API
        const refreshRes = await fetch(`/api/movies/${tmdbId}/trigger-warnings${user ? `?userId=${user.id}` : ""}`);
        const refreshData = await refreshRes.json();
        if (refreshData.warnings) {
          setWarnings(refreshData.warnings);
        }
      }
    } catch (err) {
      console.warn("AI detection error:", err);
    } finally {
      setDetectingAi(false);
    }
  };

  const handleUpvote = async (warning: TriggerWarningItem) => {
    if (!user) {
      alert("Iniciá sesión para validar y votar advertencias.");
      return;
    }
    if (warning.user_has_upvoted) return;

    // Optimistic update
    setWarnings((prev) =>
      prev.map((w) =>
        w.id === warning.id
          ? { ...w, upvotes: w.upvotes + 1, user_has_upvoted: true }
          : w
      )
    );

    try {
      const res = await fetch(`/api/movies/${tmdbId}/upvote-warning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warningId: warning.id,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Revert on error
        setWarnings((prev) =>
          prev.map((w) =>
            w.id === warning.id
              ? { ...w, upvotes: warning.upvotes, user_has_upvoted: false }
              : w
          )
        );
      } else if (data.upvotes !== undefined) {
        setWarnings((prev) =>
          prev.map((w) =>
            w.id === warning.id ? { ...w, upvotes: data.upvotes } : w
          )
        );
      }
    } catch (err) {
      console.warn("Upvote error:", err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setReportError("Por favor selecciona una categoría.");
      return;
    }

    setSubmitting(true);
    setReportError("");

    try {
      const catDef = TRIGGER_WARNING_CATEGORIES.find((c) => c.category === selectedCategory);
      const label = customLabel.trim() || catDef?.label || "⚠️ Contenido sensible";

      const res = await fetch(`/api/movies/${tmdbId}/report-warning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          label,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReportError(data.error || "No se pudo registrar la advertencia.");
      } else {
        setReportSuccess(true);
        if (data.warning) {
          setWarnings((prev) => {
            const exists = prev.some((p) => p.id === data.warning.id);
            if (exists) return prev;
            return [...prev, { ...data.warning, user_has_upvoted: true }];
          });
        }
        setTimeout(() => {
          setShowModal(false);
          setReportSuccess(false);
          setSelectedCategory("");
          setCustomLabel("");
        }, 1200);
      }
    } catch (err) {
      setReportError("Error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#141420] border border-amber-500/20 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Advertencias de Contenido</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Trigger Warnings
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Avisos sensibles detectados por IA y verificados por la comunidad de cinéfilos.
            </p>
          </div>
        </div>

        {detectingAi && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Escaneando sinopsis...</span>
          </div>
        )}
      </div>

      {/* Warnings Chip List */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Cargando advertencias de contenido...</span>
        </div>
      ) : warnings.length > 0 ? (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {warnings.map((w) => {
            const isConfirmed = w.source === "community" && w.upvotes >= 5;
            const isAi = w.source === "ai";

            return (
              <div
                key={w.id}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 text-amber-200 text-xs font-semibold shadow-sm transition-all"
              >
                {/* Source Icon */}
                {isAi ? (
                  <span
                    className="p-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    title="Detectado automáticamente por IA"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                  </span>
                ) : (
                  <span
                    className="p-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    title="Reportado por la comunidad"
                  >
                    <Users className="w-3 h-3 text-sky-300" />
                  </span>
                )}

                {/* Warning Label */}
                <span className="text-zinc-100 font-bold">{w.label}</span>

                {/* Confirmed Community Badge */}
                {isConfirmed && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Confirmado</span>
                  </span>
                )}

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(w)}
                  disabled={w.user_has_upvoted}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition ml-1 cursor-pointer ${
                    w.user_has_upvoted
                      ? "bg-amber-500 text-black shadow-sm font-extrabold"
                      : "bg-white/10 hover:bg-amber-500/30 text-amber-300 hover:text-white"
                  }`}
                  title={w.user_has_upvoted ? "Ya votaste a favor" : "Votar a favor de este warning"}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{w.upvotes}</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            No se han registrado advertencias sensibles evidentes para este título. ¡La comunidad puede añadir si detecta alguna!
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-zinc-500 text-[11px]">
          ✨ IA asistida • 👥 Validado por la comunidad (≥5 votos confirman)
        </span>

        <button
          onClick={() => {
            if (!user) {
              alert("Debes iniciar sesión para reportar una advertencia.");
              return;
            }
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold transition active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Reportar contenido sensible</span>
        </button>
      </div>

      {/* Mini Modal: Report Sensitive Content */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#141424] border border-white/10 p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">Reportar Contenido Sensible</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Ayuda a otros cinéfilos identificando temáticas sensibles presentes en{" "}
              <span className="text-white font-bold">{title}</span>.
            </p>

            {reportError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                {reportError}
              </div>
            )}

            {reportSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <h4 className="font-bold text-sm">¡Reporte registrado!</h4>
                <p className="text-xs text-emerald-200">Gracias por cuidar la experiencia de la comunidad.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Selecciona la Categoría</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {TRIGGER_WARNING_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.category;
                      return (
                        <button
                          key={cat.category}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            if (!customLabel) setCustomLabel(cat.label);
                          }}
                          className={`p-2.5 rounded-xl text-left border transition text-xs flex items-center gap-2 ${
                            isSelected
                              ? "bg-amber-500/25 border-amber-400 text-white font-bold shadow-md shadow-amber-500/20"
                              : "bg-[#18182b] border-white/5 text-zinc-300 hover:bg-[#202038]"
                          }`}
                        >
                          <span className="text-base">{cat.emoji}</span>
                          <span className="line-clamp-1">{cat.label.replace('⚠️ ', '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Custom Label or Details */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Descripción corta (opcional)
                  </label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="ej. Muerte de mascotas en pantalla..."
                    className="w-full px-3 py-2 rounded-xl bg-[#18182b] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    maxLength={100}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedCategory}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black shadow-lg shadow-amber-500/30 transition flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirmar Reporte</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
