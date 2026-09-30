"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { LogMovieModal } from "../movies/LogMovieModal";
import { CinemaTicketModal } from "../movies/CinemaTicketModal";
import { AuthPromptModal } from "../auth/AuthPromptModal";
import { QuickRecommenderModal } from "../ai/QuickRecommenderModal";
import { X, Film } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#f1f1f7]">
      {/* Top Navbar */}
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay Drawer with smooth slide animation */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-80 max-w-[85vw] h-full bg-[#0e0e17] z-10 shadow-2xl flex flex-col border-r border-white/10 animate-in slide-in-from-left duration-250">
              <div className="p-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-red-600/10 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md">
                    <Film className="w-4 h-4" />
                  </div>
                  <span className="font-black text-white text-base">Film<span className="text-red-500">Tracker</span></span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom,1rem)]">
                <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-12 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* PWA Install Banner */}
      <PwaInstallPrompt />

      {/* Global Modals & Persistent AI FAB */}
      <QuickRecommenderModal />
      <LogMovieModal />
      <CinemaTicketModal />
      <AuthPromptModal />
    </div>
  );
}

export default AppShell;
