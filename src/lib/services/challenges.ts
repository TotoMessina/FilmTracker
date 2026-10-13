import { supabase } from "@/lib/supabase/client";
import { ChallengeCondition, Log, MonthlyChallenge, UserMonthlyChallenges } from "@/lib/supabase/types";

export const SPANISH_MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function getCurrentMonthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function formatMonthName(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-");
  const monthNum = parseInt(monthStr, 10);
  const name = SPANISH_MONTH_NAMES[monthNum - 1] || "Mes";
  return `${name} ${yearStr}`;
}

/**
 * Checks if a log has an explicit watch date that belongs to the target month (YYYY-MM).
 * Logs where the user marked "No recuerdo la fecha" (watched_at: null) are strictly excluded.
 */
export function isLogEligibleForMonth(
  log: Log,
  targetMonthKey: string = getCurrentMonthKey()
): boolean {
  if (!log || !log.watched_at) return false;
  const datePrefix = log.watched_at.split("T")[0];
  return datePrefix.startsWith(targetMonthKey);
}

/**
 * Evaluates if a given movie log matches a challenge condition.
 */
export function doesLogMatchChallengeCondition(
  log: Log,
  condition: ChallengeCondition
): boolean {
  const movie = log.movie;
  if (!movie) return false;

  const { type, value } = condition;
  switch (type) {
    case "decade": {
      if (movie.release_date) {
        const year = parseInt(movie.release_date.substring(0, 4), 10);
        if (!isNaN(year)) {
          const dec = Math.floor(year / 10) * 10;
          if (dec === value) return true;
          if (value === 1960 && year < 1975) return true;
        }
      }
      return false;
    }
    case "country": {
      if (value === "international") {
        const countries = movie.production_countries?.map((c) => c.name.toLowerCase()) || [];
        const isUsOnly =
          countries.length === 1 &&
          (countries[0].includes("united states") || countries[0].includes("estados unidos"));
        return countries.length > 0 && !isUsOnly;
      } else if (Array.isArray(value)) {
        const valid = value.map((v) => String(v).toLowerCase());
        const countries = movie.production_countries?.map((c) => c.name.toLowerCase()) || [];
        return countries.some((c) => valid.some((v) => c.includes(v)));
      } else if (typeof value === "string") {
        const valLower = value.toLowerCase();
        const countries = movie.production_countries?.map((c) => c.name.toLowerCase()) || [];
        return countries.some((c) => c.includes(valLower));
      }
      return false;
    }
    case "runtime": {
      return typeof movie.runtime === "number" && movie.runtime >= Number(value);
    }
    case "genre": {
      const valLower = String(value).toLowerCase();
      const genres = movie.genres?.map((g) => g.name.toLowerCase()) || [];
      return genres.some((g) => g.includes(valLower));
    }
    case "director": {
      if (!movie.cast_data) return false;
      const valLower = String(value).toLowerCase();
      return movie.cast_data.some(
        (c) => c.character === "Director" && c.name && c.name.toLowerCase().includes(valLower)
      );
    }
    default:
      return false;
  }
}

/**
 * Generates 3 intelligent, personalized monthly challenges based on the user's viewing history
 */
export function generateMonthlyChallenges(
  logs: Log[] = [],
  monthKey: string = getCurrentMonthKey()
): MonthlyChallenge[] {
  // Analyze decades
  const decadeCounts: Record<number, number> = {
    1960: 0,
    1970: 0,
    1980: 0,
    1990: 0,
    2000: 0,
    2010: 0,
    2020: 0,
  };

  // Analyze runtimes
  let longMoviesCount = 0;

  // Analyze countries
  const countryCounts: Record<string, number> = {};

  // Analyze genres
  const genreCounts: Record<string, number> = {};

  logs.forEach((log) => {
    const movie = log.movie;
    if (!movie) return;

    if (movie.release_date) {
      const year = parseInt(movie.release_date.substring(0, 4), 10);
      if (!isNaN(year)) {
        const dec = Math.floor(year / 10) * 10;
        if (decadeCounts[dec] !== undefined) decadeCounts[dec]++;
      }
    }

    if (movie.runtime && movie.runtime >= 140) {
      longMoviesCount++;
    }

    movie.production_countries?.forEach((c) => {
      const name = c.name;
      if (name) countryCounts[name] = (countryCounts[name] || 0) + 1;
    });

    movie.genres?.forEach((g) => {
      if (g.name) genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
    });
  });

  const challenges: MonthlyChallenge[] = [];

  // CHALLENGE 1: Decade Exploration
  if (decadeCounts[1970] < 3) {
    challenges.push({
      id: `${monthKey}-decade-70s`,
      title: "Viaje a los 70s",
      description: "Mirá 2 películas estrenadas entre 1970 y 1979",
      targetCount: 2,
      currentCount: 0,
      condition: { type: "decade", value: 1970 },
      completed: false,
    });
  } else if (decadeCounts[1980] < 4) {
    challenges.push({
      id: `${monthKey}-decade-80s`,
      title: "Nostalgia de los 80s",
      description: "Mirá 2 películas de la década de 1980",
      targetCount: 2,
      currentCount: 0,
      condition: { type: "decade", value: 1980 },
      completed: false,
    });
  } else if (decadeCounts[1990] < 5) {
    challenges.push({
      id: `${monthKey}-decade-90s`,
      title: "Clásicos de los 90s",
      description: "Mirá 2 películas de la década de 1990",
      targetCount: 2,
      currentCount: 0,
      condition: { type: "decade", value: 1990 },
      completed: false,
    });
  } else {
    challenges.push({
      id: `${monthKey}-decade-classic`,
      title: "Cine de Oro",
      description: "Mirá 1 película estrenada antes de 1975",
      targetCount: 1,
      currentCount: 0,
      condition: { type: "decade", value: 1960 },
      completed: false,
    });
  }

  // CHALLENGE 2: International / Cine-Traveler
  const usMovies = countryCounts["United States of America"] || countryCounts["Estados Unidos"] || 0;
  const totalCountries = Object.keys(countryCounts).length;

  if (totalCountries <= 3 || usMovies / Math.max(logs.length, 1) > 0.7) {
    challenges.push({
      id: `${monthKey}-geo-world`,
      title: "Cine sin Fronteras",
      description: "Mirá 2 películas de países fuera de Estados Unidos",
      targetCount: 2,
      currentCount: 0,
      condition: { type: "country", value: "international" },
      completed: false,
    });
  } else {
    challenges.push({
      id: `${monthKey}-geo-asia`,
      title: "Ruta Oriental",
      description: "Mirá 1 película de Asia (Japón, Corea, Hong Kong o Taiwán)",
      targetCount: 1,
      currentCount: 0,
      condition: {
        type: "country",
        value: ["Japón", "Japan", "South Korea", "Corea del Sur", "China", "Hong Kong", "Taiwan", "Taiwán"],
      },
      completed: false,
    });
  }

  // CHALLENGE 3: Format / Runtime / Niche Genre
  if (longMoviesCount <= 2) {
    challenges.push({
      id: `${monthKey}-runtime-epic`,
      title: "La Gran Épica",
      description: "Mirá 1 película de más de 140 minutos de duración",
      targetCount: 1,
      currentCount: 0,
      condition: { type: "runtime", value: 140 },
      completed: false,
    });
  } else {
    // Pick an unexplored genre (Animation, Documentary, Horror, Sci-Fi)
    const genresToCheck = ["Documental", "Animación", "Terror", "Ciencia ficción", "Misterio"];
    const leastSeenGenre = genresToCheck.reduce((prev, curr) => {
      const prevC = genreCounts[prev] || 0;
      const currC = genreCounts[curr] || 0;
      return currC < prevC ? curr : prev;
    }, "Animación");

    challenges.push({
      id: `${monthKey}-genre-${leastSeenGenre.toLowerCase()}`,
      title: `Giro de Género: ${leastSeenGenre}`,
      description: `Mirá 2 películas del género ${leastSeenGenre}`,
      targetCount: 2,
      currentCount: 0,
      condition: { type: "genre", value: leastSeenGenre },
      completed: false,
    });
  }

  return challenges;
}

/**
 * Loads active monthly challenges from Supabase or localStorage, generating them if not yet present.
 * Synchronizes challenge counters strictly against movies watched in the target month (excluding undated logs).
 */
export async function getOrLoadMonthlyChallenges(
  userId: string | undefined,
  userLogs: Log[] = [],
  targetMonth: string = getCurrentMonthKey()
): Promise<UserMonthlyChallenges> {
  const localKey = `filmtracker_challenges_${userId || "guest"}_${targetMonth}`;
  let existingSet: UserMonthlyChallenges | null = null;

  // 1. Try Supabase if user is authenticated
  if (userId && userId !== "guest") {
    try {
      const { data, error } = await supabase
        .from("user_monthly_challenges")
        .select("*")
        .eq("user_id", userId)
        .eq("month", targetMonth)
        .maybeSingle();

      if (data && !error) {
        existingSet = {
          id: data.id,
          user_id: data.user_id,
          month: data.month,
          challenges: data.challenges as MonthlyChallenge[],
          completed: data.completed,
          created_at: data.created_at,
        };
      }
    } catch {
      // Supabase table may not exist yet, fallback to localStorage
    }
  }

  // 2. Check localStorage if not found in Supabase
  if (!existingSet && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed: UserMonthlyChallenges = JSON.parse(stored);
        if (parsed.month === targetMonth && Array.isArray(parsed.challenges)) {
          existingSet = parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Otherwise generate fresh challenges
  let activeSet: UserMonthlyChallenges;
  if (existingSet) {
    activeSet = existingSet;
  } else {
    const generated = generateMonthlyChallenges(userLogs, targetMonth);
    activeSet = {
      id: `ch-${targetMonth}-${Date.now()}`,
      user_id: userId || "guest",
      month: targetMonth,
      challenges: generated,
      completed: false,
      created_at: new Date().toISOString(),
    };
  }

  // 4. Fetch all eligible logs for targetMonth (strictly excluding null watched_at and other months)
  let monthLogs: Log[] = [];
  if (userId && userId !== "guest") {
    try {
      const { data: dbLogs } = await supabase
        .from("logs")
        .select("*, movie:movies(*)")
        .eq("user_id", userId)
        .gte("watched_at", `${targetMonth}-01`)
        .lte("watched_at", `${targetMonth}-31T23:59:59.999Z`);
      if (dbLogs) {
        monthLogs = (dbLogs as Log[]).filter((l) => isLogEligibleForMonth(l, targetMonth));
      } else {
        monthLogs = (userLogs || []).filter((l) => isLogEligibleForMonth(l, targetMonth));
      }
    } catch {
      monthLogs = (userLogs || []).filter((l) => isLogEligibleForMonth(l, targetMonth));
    }
  } else {
    if (typeof window !== "undefined") {
      try {
        const guestLogs: Log[] = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
        monthLogs = guestLogs.filter((l) => isLogEligibleForMonth(l, targetMonth));
      } catch {
        monthLogs = (userLogs || []).filter((l) => isLogEligibleForMonth(l, targetMonth));
      }
    } else {
      monthLogs = (userLogs || []).filter((l) => isLogEligibleForMonth(l, targetMonth));
    }
  }

  // If userLogs contains additional logs for this month not yet in DB, include them
  if (userLogs && userLogs.length > 0) {
    for (const l of userLogs) {
      if (isLogEligibleForMonth(l, targetMonth)) {
        const exists = monthLogs.some(
          (m) => (m.id && l.id && m.id === l.id) || (m.tmdb_id === l.tmdb_id && m.watched_at === l.watched_at)
        );
        if (!exists) {
          monthLogs.push(l);
        }
      }
    }
  }

  // 5. Synchronize counters strictly against eligible logs of targetMonth
  let hasChanges = false;
  const syncedChallenges = activeSet.challenges.map((ch) => {
    const matchedCount = monthLogs.filter((l) => doesLogMatchChallengeCondition(l, ch.condition)).length;
    const newCurrentCount = Math.min(matchedCount, ch.targetCount);
    const isCompleted = newCurrentCount >= ch.targetCount;

    if (ch.currentCount !== newCurrentCount || ch.completed !== isCompleted) {
      hasChanges = true;
    }

    return {
      ...ch,
      currentCount: newCurrentCount,
      completed: isCompleted,
      completedAt: isCompleted ? (ch.completedAt || new Date().toISOString()) : null,
    };
  });

  const allCompleted = syncedChallenges.length > 0 && syncedChallenges.every((ch) => ch.completed);
  if (allCompleted !== activeSet.completed) {
    hasChanges = true;
  }

  const finalSet: UserMonthlyChallenges = {
    ...activeSet,
    challenges: syncedChallenges,
    completed: allCompleted,
  };

  // If newly generated or if counts changed (e.g. invalid counts removed), save
  if (!existingSet || hasChanges) {
    await saveMonthlyChallenges(finalSet);
  }

  return finalSet;
}

/**
 * Saves monthly challenges to Supabase and localStorage
 */
export async function saveMonthlyChallenges(
  challengesSet: UserMonthlyChallenges
): Promise<void> {
  const localKey = `filmtracker_challenges_${challengesSet.user_id}_${challengesSet.month}`;

  // Save to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(localKey, JSON.stringify(challengesSet));
      window.dispatchEvent(
        new CustomEvent("filmtracker_challenges_updated", { detail: challengesSet })
      );
    } catch {
      // ignore
    }
  }

  // Save to Supabase if authenticated
  if (challengesSet.user_id && challengesSet.user_id !== "guest") {
    try {
      await supabase.from("user_monthly_challenges").upsert({
        id: challengesSet.id,
        user_id: challengesSet.user_id,
        month: challengesSet.month,
        challenges: challengesSet.challenges,
        completed: challengesSet.completed,
      });
    } catch {
      // ignore if table is not migrated yet
    }
  }
}

/**
 * Evaluates whether a logged movie satisfies any active challenge and updates the counters.
 * If the log is undated (watched_at: null) or from another month, returns immediately with no changes.
 */
export function evaluateLogAgainstChallenges(
  log: Log,
  currentChallenges: MonthlyChallenge[],
  targetMonthKey: string = getCurrentMonthKey()
): {
  updatedChallenges: MonthlyChallenge[];
  newlyCompleted: MonthlyChallenge[];
  allCompleted: boolean;
  hasChanges: boolean;
} {
  // CRITICAL: undated logs and logs from other months are strictly ineligible
  if (!isLogEligibleForMonth(log, targetMonthKey) || !log.movie) {
    return {
      updatedChallenges: currentChallenges,
      newlyCompleted: [],
      allCompleted: currentChallenges.every((ch) => ch.completed),
      hasChanges: false,
    };
  }

  let hasChanges = false;
  const newlyCompleted: MonthlyChallenge[] = [];

  const updatedChallenges = currentChallenges.map((ch) => {
    if (ch.completed) return ch;

    const match = doesLogMatchChallengeCondition(log, ch.condition);

    if (match) {
      hasChanges = true;
      const nextCount = ch.currentCount + 1;
      const isNowCompleted = nextCount >= ch.targetCount;
      if (isNowCompleted && !ch.completed) {
        newlyCompleted.push({
          ...ch,
          currentCount: nextCount,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }
      return {
        ...ch,
        currentCount: Math.min(nextCount, ch.targetCount),
        completed: isNowCompleted,
        completedAt: isNowCompleted ? ch.completedAt || new Date().toISOString() : null,
      };
    }

    return ch;
  });

  const allCompleted = updatedChallenges.every((ch) => ch.completed);

  return {
    updatedChallenges,
    newlyCompleted,
    allCompleted,
    hasChanges,
  };
}

/**
 * Checks a new log against current monthly challenges, updates counts, saves state, and returns if any challenge was newly completed.
 * Guarantees that undated logs (watched_at: null) or logs outside the current month do NOT count.
 */
export async function checkAndUpdateMonthlyChallenges(
  userId: string | undefined,
  log: Log
): Promise<{ newlyCompleted: MonthlyChallenge[]; allCompleted: boolean }> {
  try {
    const activeMonth = getCurrentMonthKey();
    // Ignore immediately if movie was marked as "no recuerdo la fecha" (watched_at: null) or belongs to another month
    if (!isLogEligibleForMonth(log, activeMonth)) {
      return { newlyCompleted: [], allCompleted: false };
    }

    // Capture previous state to detect newly completed challenges accurately
    const localKey = `filmtracker_challenges_${userId || "guest"}_${activeMonth}`;
    let previousChallenges: MonthlyChallenge[] = [];
    if (userId && userId !== "guest") {
      try {
        const { data } = await supabase
          .from("user_monthly_challenges")
          .select("challenges, completed")
          .eq("user_id", userId)
          .eq("month", activeMonth)
          .maybeSingle();
        if (data?.challenges) {
          previousChallenges = data.challenges as MonthlyChallenge[];
        }
      } catch {
        // ignore
      }
    }
    if (previousChallenges.length === 0 && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.month === activeMonth && Array.isArray(parsed.challenges)) {
            previousChallenges = parsed.challenges;
          }
        }
      } catch {
        // ignore
      }
    }

    // Recalculate challenges with the new log included
    const updatedSet = await getOrLoadMonthlyChallenges(userId, [log], activeMonth);

    const newlyCompleted: MonthlyChallenge[] = [];
    updatedSet.challenges.forEach((ch) => {
      const prev = previousChallenges.find((p) => p.id === ch.id);
      if (ch.completed && (!prev || !prev.completed)) {
        newlyCompleted.push(ch);
      }
    });

    return {
      newlyCompleted,
      allCompleted: updatedSet.completed,
    };
  } catch (err) {
    console.warn("Error evaluando retos mensuales en log:", err);
  }
  return { newlyCompleted: [], allCompleted: false };
}


