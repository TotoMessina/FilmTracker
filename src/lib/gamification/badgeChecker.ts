import { ALL_BADGES, BadgeDefinition } from "./badges";
import { Log } from "../supabase/types";
import { supabase } from "../supabase/client";

/**
 * Checks which badges are newly unlocked given the user's logs and already unlocked badges.
 *
 * @param userLogs Array of logs (including movie info)
 * @param currentBadges Set or Array of already unlocked badge codes
 * @returns Array of newly unlocked BadgeDefinitions
 */
export function checkNewBadges(
  userLogs: Log[],
  currentBadges: Set<string> | string[]
): BadgeDefinition[] {
  const existingCodes =
    currentBadges instanceof Set
      ? currentBadges
      : new Set(currentBadges || []);

  const newlyUnlocked: BadgeDefinition[] = [];

  for (const badge of ALL_BADGES) {
    if (!existingCodes.has(badge.code)) {
      if (badge.check(userLogs)) {
        newlyUnlocked.push(badge);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Persists newly unlocked badges to Supabase (if logged in) or localStorage (if guest).
 * Dispatches UI events for live reactivity and celebratory toast/modals.
 */
export async function persistAndNotifyUnlockedBadges(
  newlyUnlocked: BadgeDefinition[],
  userId?: string | null
): Promise<void> {
  if (!newlyUnlocked || newlyUnlocked.length === 0) return;

  // 1. Persist to Supabase if userId is provided
  if (userId) {
    try {
      const rows = newlyUnlocked.map((b) => ({
        user_id: userId,
        badge_code: b.code,
        earned_at: new Date().toISOString(),
      }));

      await supabase.from("user_badges").upsert(rows, { onConflict: "user_id,badge_code" });
    } catch (err) {
      console.warn("Error guardando badges en Supabase:", err);
    }
  }

  // 2. Persist to localStorage (for guest mode or offline backup)
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("filmtracker_guest_badges") || "[]");
      const codeSet = new Set<string>(stored);
      newlyUnlocked.forEach((b) => codeSet.add(b.code));
      localStorage.setItem("filmtracker_guest_badges", JSON.stringify(Array.from(codeSet)));
    } catch {
      // ignore localStorage errors
    }

    // 3. Dispatch global events
    window.dispatchEvent(
      new CustomEvent("filmtracker_badges_updated", {
        detail: { newBadges: newlyUnlocked },
      })
    );

    // Notify first unlocked badge for toast/celebration
    window.dispatchEvent(
      new CustomEvent("filmtracker_new_badge_unlocked", {
        detail: {
          badge: newlyUnlocked[0],
          allBadges: newlyUnlocked,
        },
      })
    );
  }
}
