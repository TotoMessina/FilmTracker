"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Sparkles, Share, PlusSquare } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("ServiceWorker registration error:", err);
        });
      });
    }

    // 2. Check if already running in standalone mode (PWA installed)
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Check if dismissed recently (24 hours cooldown)
    const lastDismissed = localStorage.getItem("filmtracker_pwa_dismissed");
    const now = Date.now();
    if (lastDismissed && now - Number(lastDismissed) < 24 * 60 * 60 * 1000) {
      return;
    }

    // 5. Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay so user gets initial context
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not dismissed, show iOS installation hint after 5s on mobile screens
    if (isIosDevice && window.innerWidth < 768) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("filmtracker_pwa_dismissed", String(Date.now()));
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-3xl bg-[#141424]/95 backdrop-blur-xl border border-red-500/30 shadow-2xl text-white relative flex flex-col gap-3">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Cerrar sugerencia"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>Instalar FilmTracker</span>
              <span className="px-1.5 py-0.2 rounded-md bg-red-600 text-[10px] font-black uppercase">App</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-snug">
              Úsala a pantalla completa, más rápida y con acceso directo desde tu móvil.
            </p>
          </div>
        </div>

        {/* Action: Chrome / Android prompt button */}
        {deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Instalar en el dispositivo</span>
          </button>
        ) : isIOS ? (
          /* iOS Safari instructions */
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-300 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Share className="w-3.5 h-3.5" />
              <span>Para instalar en iPhone/iPad:</span>
            </div>
            <p className="text-zinc-400 leading-tight">
              Toca el botón <strong className="text-white">Compartir</strong> de Safari y luego <strong className="text-white">&ldquo;Añadir a pantalla de inicio&rdquo;</strong> (<PlusSquare className="w-3 h-3 inline text-zinc-300" />).
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PwaInstallPrompt;
