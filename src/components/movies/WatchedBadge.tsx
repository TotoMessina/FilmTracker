"use client";

import { Check } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

/** Place inside the poster's relative container. Never intercepts poster actions. */
export function WatchedBadge({ movieId, className = 'bottom-2 left-2' }: { movieId: number; className?: string }) {
  const { isWatched } = useApp();
  if (!isWatched(movieId)) return null;
  return <span title="Ya está en tu registro" aria-label="Vista: ya está en tu registro" className={`pointer-events-none absolute z-20 inline-flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-950/95 px-2 py-1 text-[10px] font-bold leading-none text-emerald-100 shadow-md ${className}`}><Check aria-hidden="true" size={12} strokeWidth={3} />Vista</span>;
}
