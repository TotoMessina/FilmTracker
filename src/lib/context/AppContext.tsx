"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import confetti from "canvas-confetti";
import { Log } from "../supabase/types";
import { TMDBMovie } from "../tmdb/client";
import { supabase } from "../supabase/client";
import { useAuth } from "./AuthContext";

interface AppContextType {
  // Auth Prompt
  isAuthPromptOpen: boolean;
  authPromptReason: string;
  openAuthPrompt: (reason?: string) => void;
  closeAuthPrompt: () => void;
  requireAuth: (actionDesc?: string) => boolean;

  // Log Modal
  isLogModalOpen: boolean;
  activeLogMovie: TMDBMovie | null;
  editingLog: Log | null;
  openLogModal: (movie: TMDBMovie | { id: number; title: string; poster_path?: string | null }, existingLog?: Log) => void;
  closeLogModal: () => void;
  onLogSaved: () => void;

  // Cinema Ticket Modal
  activeCinemaTicket: Log | null;
  openCinemaTicket: (log: Log) => void;
  closeCinemaTicket: () => void;

  // Blacklist
  blacklist: Set<number>;
  addToBlacklist: (tmdbId: number) => Promise<void>;
  removeFromBlacklist: (tmdbId: number) => Promise<void>;
  isBlacklisted: (tmdbId: number) => boolean;

  // Realtime & Stats
  unreadMessagesCount: number;
  refreshUnreadCount: () => Promise<void>;
  triggerConfetti: () => void;
  lastUpdated: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Auth prompt state
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState("");

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogMovie, setActiveLogMovie] = useState<TMDBMovie | null>(null);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [activeCinemaTicket, setActiveCinemaTicket] = useState<Log | null>(null);

  // Blacklist state
  const [blacklist, setBlacklist] = useState<Set<number>>(new Set());

  // Unread messages
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const openAuthPrompt = (reason?: string) => {
    setAuthPromptReason(reason || "Inicia sesión o regístrate para usar esta funcionalidad.");
    setIsAuthPromptOpen(true);
  };

  const closeAuthPrompt = () => {
    setIsAuthPromptOpen(false);
    setAuthPromptReason("");
  };

  const requireAuth = (actionDesc?: string): boolean => {
    if (!user) {
      openAuthPrompt(actionDesc ? `Necesitas una cuenta para ${actionDesc}.` : undefined);
      return false;
    }
    return true;
  };

  // Load blacklist
  useEffect(() => {
    const loadBlacklist = async () => {
      if (!user) {
        try {
          const stored = localStorage.getItem("filmtracker_blacklist");
          if (stored) {
            setBlacklist(new Set(JSON.parse(stored)));
          }
        } catch {
          // ignore
        }
        return;
      }

      try {
        const { data } = await supabase
          .from("hidden_items")
          .select("tmdb_id")
          .eq("user_id", user.id);

        if (data) {
          setBlacklist(new Set(data.map((item) => item.tmdb_id)));
        }
      } catch (err) {
        console.warn("Could not load blacklist:", err);
      }
    };

    loadBlacklist();
  }, [user]);

  // Load unread messages count
  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      if (!error && typeof count === "number") {
        setUnreadMessagesCount(count);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [user]);

  const openLogModal = (
    movie: TMDBMovie | { id: number; title: string; poster_path?: string | null },
    existingLog?: Log
  ) => {
    if (!user) {
      openAuthPrompt("Inicia sesión o crea una cuenta para registrar esta película en tu diario personal.");
      return;
    }
    setActiveLogMovie(movie as TMDBMovie);
    setEditingLog(existingLog || null);
    setIsLogModalOpen(true);
  };

  const closeLogModal = () => {
    setIsLogModalOpen(false);
    setActiveLogMovie(null);
    setEditingLog(null);
  };

  const onLogSaved = () => {
    setLastUpdated(Date.now());
  };

  const openCinemaTicket = (log: Log) => {
    setActiveCinemaTicket(log);
  };

  const closeCinemaTicket = () => {
    setActiveCinemaTicket(null);
  };

  const addToBlacklist = async (tmdbId: number) => {
    setBlacklist((prev) => new Set(prev).add(tmdbId));

    if (!user) {
      const nextSet = new Set(blacklist).add(tmdbId);
      localStorage.setItem("filmtracker_blacklist", JSON.stringify(Array.from(nextSet)));
      return;
    }

    try {
      await supabase.from("hidden_items").insert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: "movie",
      });
    } catch (err) {
      console.warn("Error adding to blacklist:", err);
    }
  };

  const removeFromBlacklist = async (tmdbId: number) => {
    setBlacklist((prev) => {
      const next = new Set(prev);
      next.delete(tmdbId);
      return next;
    });

    if (!user) {
      const next = new Set(blacklist);
      next.delete(tmdbId);
      localStorage.setItem("filmtracker_blacklist", JSON.stringify(Array.from(next)));
      return;
    }

    try {
      await supabase
        .from("hidden_items")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId);
    } catch (err) {
      console.warn("Error removing from blacklist:", err);
    }
  };

  const isBlacklisted = (tmdbId: number) => {
    return blacklist.has(tmdbId);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#e50914", "#d4af37", "#ffffff", "#46d369"],
      });
    } catch {
      // fallback
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthPromptOpen,
        authPromptReason,
        openAuthPrompt,
        closeAuthPrompt,
        requireAuth,
        isLogModalOpen,
        activeLogMovie,
        editingLog,
        openLogModal,
        closeLogModal,
        onLogSaved,
        activeCinemaTicket,
        openCinemaTicket,
        closeCinemaTicket,
        blacklist,
        addToBlacklist,
        removeFromBlacklist,
        isBlacklisted,
        unreadMessagesCount,
        refreshUnreadCount,
        triggerConfetti,
        lastUpdated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
