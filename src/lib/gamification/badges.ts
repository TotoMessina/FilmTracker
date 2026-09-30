import { supabase } from "../supabase/client";
import { Log } from "../supabase/types";

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  category: "starter" | "activity" | "writing" | "discovery";
  check: (logs: Log[]) => boolean;
}

export const ALL_BADGES: BadgeDefinition[] = [
  {
    code: "NEWBIE",
    name: "Palomitas Frescas",
    description: "Registraste tu primera película en FilmTracker",
    icon: "🍿",
    category: "starter",
    check: (logs) => logs.length >= 1,
  },
  {
    code: "FAN",
    name: "Cinéfilo Auténtico",
    description: "Alcanzaste 10 películas registradas en tu diario",
    icon: "🎬",
    category: "starter",
    check: (logs) => logs.length >= 10,
  },
  {
    code: "CRITIC",
    name: "La Pluma de Oro",
    description: "Escribiste al menos 3 reseñas detalladas (+10 caracteres)",
    icon: "✍️",
    category: "writing",
    check: (logs) =>
      logs.filter((l) => l.review && l.review.trim().length > 10).length >= 3,
  },
  {
    code: "MARATHON",
    name: "Maratonista de Sofá",
    description: "Viste 3 o más películas en un mismo día",
    icon: "🏃‍♂️",
    category: "activity",
    check: (logs) => {
      const datesCount: Record<string, number> = {};
      for (const log of logs) {
        if (!log.watched_at) continue;
        datesCount[log.watched_at] = (datesCount[log.watched_at] || 0) + 1;
        if (datesCount[log.watched_at] >= 3) return true;
      }
      return false;
    },
  },
  {
    code: "GLOBETROTTER",
    name: "Trotamundos Cinéfilo",
    description: "Viste películas producidas en 5 o más países diferentes",
    icon: "🌍",
    category: "discovery",
    check: (logs) => {
      const countries = new Set<string>();
      logs.forEach((log) => {
        if (log.movie?.production_countries) {
          log.movie.production_countries.forEach((c) => countries.add(c.iso_3166_1));
        }
      });
      return countries.size >= 5;
    },
  },
  {
    code: "NIGHT_OWL",
    name: "Cinefilia Nocturna",
    description: "Viste 25 películas en total, convirtiéndote en maestro de pantalla",
    icon: "🦉",
    category: "activity",
    check: (logs) => logs.length >= 25,
  },
];

export async function checkAndUnlockBadges(userId: string): Promise<BadgeDefinition[]> {
  try {
    // 1. Fetch user logs with movie info
    const { data: logsData, error: logsError } = await supabase
      .from("logs")
      .select("*, movie:movies(*)")
      .eq("user_id", userId);

    if (logsError || !logsData) return [];

    // 2. Fetch existing badges
    const { data: userBadges, error: badgeError } = await supabase
      .from("user_badges")
      .select("badge_code")
      .eq("user_id", userId);

    if (badgeError) return [];

    const existingCodes = new Set((userBadges || []).map((b) => b.badge_code));
    const newlyUnlocked: BadgeDefinition[] = [];

    // 3. Check each badge
    for (const badge of ALL_BADGES) {
      if (!existingCodes.has(badge.code)) {
        if (badge.check(logsData as Log[])) {
          // Unlock
          const { error: insertError } = await supabase.from("user_badges").insert({
            user_id: userId,
            badge_code: badge.code,
            earned_at: new Date().toISOString(),
          });

          if (!insertError) {
            newlyUnlocked.push(badge);
          }
        }
      }
    }

    return newlyUnlocked;
  } catch (err) {
    console.error("Error checking badges:", err);
    return [];
  }
}
