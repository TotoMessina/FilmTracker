"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Tv, Check, Sparkles, Plus, ExternalLink } from "lucide-react";
import { 
  POPULAR_STREAMING_PLATFORMS, 
  StreamingPlatformInfo,
  loadUserStreamingPlatforms,
  saveUserStreamingPlatforms 
} from "@/lib/services/streamingPlatforms";
import { getImageUrl } from "@/lib/tmdb/client";

interface StreamingPlatformsSelectorProps {
  userId?: string;
  isMe: boolean;
  username?: string;
  onPlatformsChange?: (platforms: number[]) => void;
}

export function StreamingPlatformsSelector({
  userId,
  isMe,
  username,
  onPlatformsChange,
}: StreamingPlatformsSelectorProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      const platforms = await loadUserStreamingPlatforms(userId);
      if (!isCancelled) {
        setSelectedPlatforms(platforms);
        setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const handleToggle = async (platformId: number) => {
    if (!isMe) return;

    let updated: number[];
    if (selectedPlatforms.includes(platformId)) {
      updated = selectedPlatforms.filter((id) => id !== platformId);
    } else {
      updated = [...selectedPlatforms, platformId];
    }

    setSelectedPlatforms(updated);
    if (onPlatformsChange) {
      onPlatformsChange(updated);
    }

    await saveUserStreamingPlatforms(updated, userId);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!isMe && selectedPlatforms.length === 0) {
    return null; // Don't show empty block on other users' profiles
  }

  return (
    <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-600/15 text-red-500 border border-red-500/20">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              <span>{isMe ? "Mis Plataformas de Streaming" : `Plataformas de ${username || "este usuario"}`}</span>
              {savedSuccess && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-fade-in">
                  ¡Guardado!
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              {isMe 
                ? "Tus servicios activos para filtrar rápidamente qué ver en el buscador" 
                : "Servicios donde este cinéfilo mira películas"}
            </p>
          </div>
        </div>

        {isMe && selectedPlatforms.length > 0 && (
          <span className="text-xs font-semibold text-zinc-400 px-3 py-1 rounded-full bg-white/5 border border-white/10 self-start sm:self-auto">
            {selectedPlatforms.length} {selectedPlatforms.length === 1 ? "activa" : "activas"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex gap-2 animate-pulse py-2">
          <div className="h-10 w-24 bg-white/5 rounded-2xl" />
          <div className="h-10 w-28 bg-white/5 rounded-2xl" />
          <div className="h-10 w-24 bg-white/5 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2.5 pt-1">
          {POPULAR_STREAMING_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);

            // In read-only mode (other user profile), only show their selected platforms
            if (!isMe && !isSelected) {
              return null;
            }

            return (
              <button
                key={platform.id}
                type="button"
                disabled={!isMe}
                onClick={() => handleToggle(platform.id)}
                className={`relative px-3.5 py-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-gradient-to-r from-white/10 to-white/5 border-red-500/60 shadow-lg shadow-red-950/20 text-white"
                    : isMe
                    ? "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.07] hover:border-white/15"
                    : "bg-white/5 border-white/10 text-white cursor-default"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-black/40 flex items-center justify-center p-0.5 border border-white/10">
                    <img
                      src={getImageUrl(platform.logo, "w92")}
                      alt={platform.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-bold text-xs tracking-tight truncate">
                    {platform.name}
                  </span>
                </div>

                {isMe && (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-red-600 text-white shadow-sm shadow-red-600/50"
                        : "border border-zinc-600 text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
