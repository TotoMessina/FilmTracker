"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film, Lock, Mail, User, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, enableGuestMode } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || "Error al iniciar sesión.");
        } else {
          router.push("/");
        }
      } else {
        if (!username.trim()) {
          setErrorMsg("Por favor ingresa un nombre de usuario.");
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, username.trim());
        if (error) {
          setErrorMsg(error.message || "Error al registrarse.");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    enableGuestMode();
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Film className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">FilmTracker</h1>
          <p className="text-xs text-zinc-400">
            Tu diario de cine personal, estadísticas y comunidad cinéfila.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === "login"
                ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === "register"
                ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu alias cinéfilo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@cine.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition active:scale-95 disabled:opacity-50 mt-2"
          >
            {submitting ? "Procesando..." : mode === "login" ? "Acceder a FilmTracker" : "Registrarme"}
          </button>
        </form>

        {/* Guest Demo Option */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-zinc-500 mb-3">¿Solo quieres explorar la aplicación?</p>
          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Continuar como Invitado (Modo Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
