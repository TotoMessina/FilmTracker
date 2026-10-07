"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Sparkles, X, ChevronRight } from "lucide-react";
import { BadgeDefinition } from "@/lib/gamification/badges";
import { useApp } from "@/lib/context/AppContext";

export function BadgeCelebrationModal() {
  const { triggerConfetti } = useApp();
  const [activeBadge, setActiveBadge] = useState<BadgeDefinition | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBadgeUnlocked = (event: Event) => {
      const customEvent = event as CustomEvent<{
        badge: BadgeDefinition;
        allBadges: BadgeDefinition[];
      }>;
      if (customEvent.detail?.badge) {
        setActiveBadge(customEvent.detail.badge);
        setVisible(true);
        triggerConfetti();
      }
    };

    window.addEventListener("filmtracker_new_badge_unlocked", handleBadgeUnlocked);
    return () => {
      window.removeEventListener("filmtracker_new_badge_unlocked", handleBadgeUnlocked);
    };
  }, [triggerConfetti]);

  if (!visible || !activeBadge) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setActiveBadge(null), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#1c1828] via-[#141220] to-[#0d0c15] p-6 sm:p-8 shadow-2xl z-10 text-center animate-in zoom-in-95 duration-250 overflow-hidden">
        {/* Ambient golden glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badge Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡Logro Desbloqueado!</span>
        </div>

        {/* Badge Icon */}
        <div className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/30 to-red-600/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-amber-600/30 border-2 border-amber-400/60 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
            {activeBadge.icon}
          </div>
        </div>

        {/* Toast / Modal Header */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          ¡Nuevo Logro Desbloqueado: {activeBadge.name} 🏆!
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-300 leading-relaxed max-w-xs mx-auto mb-6">
          {activeBadge.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
          >
            ¡Genial! 🍿
          </button>

          <Link
            href="/stats"
            onClick={handleClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold text-xs transition"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Mis Logros</span>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
