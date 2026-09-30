"use client";

import React from "react";
import Link from "next/link";
import { X, Lock, Film, Sparkles, UserPlus, LogIn, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export function AuthPromptModal() {
  const { isAuthPromptOpen, authPromptReason, closeAuthPrompt } = useApp();

  if (!isAuthPromptOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeAuthPrompt}
    >
      <div
        className="relative w-full max-w-md bg-[#141424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthPrompt}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-600/30">
          <Lock className="w-7 h-7" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
            Función para Miembros
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Únete a FilmTracker
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xs mx-auto">
            {authPromptReason || "Inicia sesión o crea tu cuenta gratuita para acceder a esta función."}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-2 text-left text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✓</span>
            <span>Registra y califica películas en tu propio diario</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✓</span>
            <span>Guarda películas pendientes en tu Watchlist</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✓</span>
            <span>Descubre tus actores fetiche y compite en el mundial</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-1">
          <Link
            href="/auth"
            onClick={closeAuthPrompt}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 active:scale-95 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Cuenta Gratis</span>
          </Link>

          <Link
            href="/auth"
            onClick={closeAuthPrompt}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-semibold text-xs transition"
          >
            <LogIn className="w-4 h-4 text-zinc-400" />
            <span>Ya tengo cuenta • Iniciar Sesión</span>
          </Link>

          <button
            onClick={closeAuthPrompt}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition pt-1"
          >
            Continuar explorando películas
          </button>
        </div>
      </div>
    </div>
  );
}
