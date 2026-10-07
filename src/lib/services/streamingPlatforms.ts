import { supabase } from "@/lib/supabase/client";
import { STREAMING_PROVIDERS } from "@/lib/tmdb/client";

export interface StreamingPlatformInfo {
  id: number;
  name: string;
  logo: string;
  badgeBg?: string;
  textColor?: string;
}

export const POPULAR_STREAMING_PLATFORMS: StreamingPlatformInfo[] = [
  { id: 8, name: "Netflix", logo: "/rK1KljqmbvO9HQa1PBFLILWah72.png", badgeBg: "bg-red-600/20 text-red-400 border-red-500/30" },
  { id: 337, name: "Disney+", logo: "/5eZ872CghnHFLB1j8grszbrx0dx.png", badgeBg: "bg-blue-600/20 text-blue-400 border-blue-500/30" },
  { id: 119, name: "Prime Video", logo: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png", badgeBg: "bg-sky-600/20 text-sky-400 border-sky-500/30" },
  { id: 1899, name: "Max", logo: "/skypuy7SXuugIQeYg0IglmzoKaS.png", badgeBg: "bg-purple-600/20 text-purple-400 border-purple-500/30" },
  { id: 350, name: "Apple TV+", logo: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png", badgeBg: "bg-zinc-600/20 text-zinc-300 border-zinc-500/30" },
  { id: 531, name: "Paramount+", logo: "/pkx3klJlwW5JdtaulvDx6hDNtch.png", badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/30" },
  { id: 11, name: "MUBI", logo: "/k7iSlvgWzZuO4zU5PcBjhABMuia.png", badgeBg: "bg-amber-600/20 text-amber-400 border-amber-500/30" },
  { id: 63, name: "Filmin", logo: "/8zTqH5i2k5A12q9hV9aK4q3dO2G.jpg", badgeBg: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" },
];

const STORAGE_KEY_PREFIX = "filmtracker_user_platforms_";

export function getStoredPlatforms(userId?: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId || "guest"}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(Number);
    }
  } catch (err) {
    console.warn("Error reading local streaming platforms:", err);
  }
  return [];
}

export function setStoredPlatforms(platforms: number[], userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId || "guest"}`;
    localStorage.setItem(key, JSON.stringify(platforms));
    // Dispatch custom event so listeners on the same tab update immediately
    window.dispatchEvent(new CustomEvent("filmtracker_platforms_changed", { detail: platforms }));
  } catch (err) {
    console.warn("Error saving local streaming platforms:", err);
  }
}

/**
 * Loads platforms from Supabase profile or local storage fallback
 */
export async function loadUserStreamingPlatforms(userId?: string): Promise<number[]> {
  const local = getStoredPlatforms(userId);
  if (!userId || userId.startsWith("guest")) return local;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("streaming_platforms")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data && data.streaming_platforms !== undefined && data.streaming_platforms !== null) {
      const raw = data.streaming_platforms;
      const dbPlatforms: number[] = Array.isArray(raw)
        ? raw.map(Number)
        : typeof raw === "string"
        ? JSON.parse(raw).map(Number)
        : [];
      setStoredPlatforms(dbPlatforms, userId);
      return dbPlatforms;
    }
  } catch (err) {
    console.warn("Error leyendo streaming_platforms de Supabase:", err);
  }

  return local;
}

/**
 * Saves platforms to Supabase profile and local storage
 */
export async function saveUserStreamingPlatforms(platforms: number[], userId?: string): Promise<boolean> {
  setStoredPlatforms(platforms, userId);

  if (userId && !userId.startsWith("guest")) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ streaming_platforms: platforms })
        .eq("id", userId)
        .select("streaming_platforms");

      if (error) {
        console.warn("Supabase streaming_platforms update error:", error.message || error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Supabase streaming_platforms update warning (fallback to localStorage):", err);
      return false;
    }
  }
  return true;
}
