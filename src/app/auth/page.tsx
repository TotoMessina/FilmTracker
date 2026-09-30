"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Film,
  Lock,
  Mail,
  User,
  AlertCircle,
  Sparkles,
  MailCheck,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, enableGuestMode, resendConfirmationEmail } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Email verification state
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Check URL query param for default mode
  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "register") {
      setMode("register");
    } else if (qMode === "login") {
      setMode("login");
    }
  }, [searchParams]);

  const formatAuthError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("email not confirmed")) {
      return "Tu correo electrónico aún no ha sido verificado. Por favor revisa tu bandeja de entrada o spam para activar tu cuenta antes de iniciar sesión.";
    }
    if (lower.includes("invalid login credentials")) {
      return "Correo o contraseña incorrectos. Si te registraste recientemente, recuerda confirmar tu cuenta mediante el correo que te enviamos.";
    }
    if (lower.includes("user already registered") || lower.includes("already registered")) {
      return "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.";
    }
    if (lower.includes("password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    return msg;
  };

  const handleResendEmail = async (targetEmail: string) => {
    if (!targetEmail) return;
    setResending(true);
    setResendStatus(null);
    try {
      const { error } = await resendConfirmationEmail(targetEmail);
      if (error) {
        setResendStatus(formatAuthError(error.message));
      } else {
        setResendStatus("¡Correo de activación reenviado! Revisa tu bandeja de entrada o carpeta de spam.");
      }
    } catch {
      setResendStatus("Error al intentar reenviar el correo. Intenta nuevamente en unos minutos.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResendStatus(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(formatAuthError(error.message || "Error al iniciar sesión."));
        } else {
          router.push("/");
        }
      } else {
        if (!username.trim()) {
          setErrorMsg("Por favor ingresa un nombre de usuario.");
          setSubmitting(false);
          return;
        }

        const { error, needsEmailConfirmation } = await signUp(
          email,
          password,
          username.trim()
        );

        if (error) {
          setErrorMsg(formatAuthError(error.message || "Error al registrarse."));
        } else if (needsEmailConfirmation) {
          // Show email confirmation screen instead of falsely redirecting
          setRegisteredEmail(email);
          setIsEmailSent(true);
        } else {
          // Immediate login if email confirmation is turned off in Supabase
          router.push("/");
        }
      }
    } catch (err: any) {
      setErrorMsg(formatAuthError(err.message || "Ocurrió un error inesperado."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    enableGuestMode();
    router.push("/");
  };

  // Screen: Email Confirmation Sent Notice
  if (isEmailSent) {
    return (
      <div className="w-full max-w-md bg-[#141424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/10">
          <MailCheck className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          ¡Revisa tu correo!
        </h2>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
          Hemos enviado un enlace de confirmación a:
        </p>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 inline-block max-w-full">
          <span className="font-bold text-white text-xs sm:text-sm break-all">
            {registeredEmail}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs text-left mb-6 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Paso obligatorio para iniciar sesión:</span>
          </p>
          <p className="text-[11px] text-zinc-300 pl-5.5 leading-relaxed">
            Abre el correo que te enviamos y pulsa en <strong>Confirmar tu correo</strong>. Solo podrás acceder a tu cuenta una vez completado este paso.
          </p>
          <p className="text-[11px] text-zinc-400 pl-5.5 pt-1">
            💡 ¿No lo encuentras? Revisa tu carpeta de <strong>Correo no deseado (Spam)</strong> o Promociones.
          </p>
        </div>

        {resendStatus && (
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200 flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              setIsEmailSent(false);
              setMode("login");
              setErrorMsg(null);
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Ya lo confirmé • Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={resending}
            onClick={() => handleResendEmail(registeredEmail)}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{resending ? "Reenviando..." : "¿No recibiste el correo? Reenviar"}</span>
          </button>
        </div>
      </div>
    );
  }

  const isEmailNotConfirmedError =
    errorMsg && errorMsg.toLowerCase().includes("no ha sido verificado");

  return (
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
            setResendStatus(null);
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
            setResendStatus(null);
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
        <div className="mb-4 space-y-2">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>

          {/* Quick Resend button if email is unconfirmed */}
          {isEmailNotConfirmedError && email && (
            <button
              type="button"
              disabled={resending}
              onClick={() => handleResendEmail(email)}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>{resending ? "Reenviando..." : `Reenviar correo de activación a ${email}`}</span>
            </button>
          )}
        </div>
      )}

      {resendStatus && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resendStatus}</span>
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

        {mode === "register" && (
          <p className="text-[11px] text-zinc-400 leading-relaxed px-1">
            ℹ️ Al registrarte, recibirás un correo electrónico de confirmación con un enlace que debes pulsar para activar tu cuenta.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition active:scale-95 disabled:opacity-50 mt-2"
        >
          {submitting
            ? "Procesando..."
            : mode === "login"
            ? "Acceder a FilmTracker"
            : "Registrarme"}
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
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500 text-sm">Cargando...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}

