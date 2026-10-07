import { supabase } from "../supabase/client";
import { Log } from "../supabase/types";

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  icon: string; // Emoji o identificador
  category: "starter" | "activity" | "writing" | "discovery" | "director";
  check: (logs: Log[]) => boolean;
}

// Normalized text helper
function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Helper to check if a log was directed by a given director
function checkDirector(log: Log, directorName: string, knownTitles: string[]): boolean {
  const normTarget = normalize(directorName);
  const movie = log.movie;
  if (!movie) return false;

  // 1. Check cast_data (where director or actor might be stored)
  if (Array.isArray(movie.cast_data)) {
    const foundInCast = movie.cast_data.some((c) => {
      const normCast = normalize(c.name);
      return normCast.includes(normTarget) || normTarget.includes(normCast);
    });
    if (foundInCast) return true;
  }

  // 2. Check title against known filmography
  const normTitle = normalize(movie.title);
  if (knownTitles.some((kt) => normTitle.includes(normalize(kt)) || normalize(kt).includes(normTitle))) {
    return true;
  }

  // 3. Check overview or movie fields if present
  if (movie.overview && normalize(movie.overview).includes(normTarget)) {
    return true;
  }

  return false;
}

// Filmographies for director badges
const NOLAN_TITLES = [
  "oppenheimer",
  "tenet",
  "dunkirk",
  "dunkerque",
  "interstellar",
  "interestelar",
  "the dark knight rises",
  "el caballero de la noche asciende",
  "inception",
  "el origen",
  "the dark knight",
  "el caballero de la noche",
  "the prestige",
  "el gran truco",
  "batman begins",
  "batman inicia",
  "insomnia",
  "insomnio",
  "memento",
  "following",
];

const TARANTINO_TITLES = [
  "once upon a time in hollywood",
  "habia una vez en hollywood",
  "the hateful eight",
  "los 8 mas odiados",
  "los ocho mas odiados",
  "django unchained",
  "django sin cadenas",
  "inglourious basterds",
  "bastardos sin gloria",
  "death proof",
  "a prueba de muerte",
  "kill bill: vol. 1",
  "kill bill: vol. 2",
  "kill bill",
  "jackie brown",
  "pulp fiction",
  "tiempos violentos",
  "reservoir dogs",
  "perros de la calle",
];

const GHIBLI_TITLES = [
  "el nino y la garza",
  "the boy and the heron",
  "se levanta el viento",
  "the wind rises",
  "ponyo",
  "howl's moving castle",
  "el increible castillo vagabundo",
  "el castillo ambulante",
  "spirited away",
  "el viaje de chihiro",
  "princess mononoke",
  "la princesa mononoke",
  "porco rosso",
  "kiki's delivery service",
  "kiki: entregas a domicilio",
  "my neighbor totoro",
  "mi vecino totoro",
  "castle in the sky",
  "el castillo en el cielo",
  "nausicaa",
  "the tale of the princess kaguya",
  "el cuento de la princesa kaguya",
  "when marnie was there",
  "el recuerdo de marnie",
  "grave of the fireflies",
  "la tumba de las luciernagas",
  "whisper of the heart",
  "susurros del corazon",
  "the cat returns",
  "el regreso del gato",
  "arrietty",
  "from up on poppy hill",
  "la colina de las amapolas",
];

const NOIR_TITLES = [
  "the maltese falcon",
  "el halcon maltes",
  "double indemnity",
  "pacto de sangre",
  "chinatown",
  "sunset boulevard",
  "el ocaso de una vida",
  "touch of evil",
  "sed de mal",
  "the big sleep",
  "el sueno eterno",
  "l.a. confidential",
  "laura",
  "out of the past",
  "retorno al pasado",
  "the third man",
  "el tercer hombre",
  "strangers on a train",
  "pacto siniestro",
  "blade runner",
  "se7en",
  "memento",
  "shutter island",
  "zodiac",
];

// The 10 Best Picture nominees for Oscars 2025
const OSCAR_2025_BEST_PICTURE_NOMINEES = [
  ["anora"],
  ["the brutalist", "el brutalista"],
  ["conclave", "conclave"],
  ["a complete unknown", "un completo desconocido"],
  ["emilia perez", "emilia pérez"],
  ["dune: part two", "dune: parte dos", "dune parte dos", "dune 2"],
  ["i'm still here", "im still here", "aun estoy aqui", "ainda estou aqui"],
  ["nickel boys", "los chicos de la nickel"],
  ["the substance", "la sustancia"],
  ["wicked"],
];

export const ALL_BADGES: BadgeDefinition[] = [
  // 1. Starters
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

  // 2. Writing
  {
    code: "CRITIC",
    name: "La Pluma de Oro",
    description: "Escribiste al menos 3 reseñas detalladas (+10 caracteres)",
    icon: "✍️",
    category: "writing",
    check: (logs) =>
      logs.filter((l) => l.review && l.review.trim().length > 10).length >= 3,
  },

  // 3. Activity & Marathons
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
        const d = log.watched_at.split("T")[0];
        datesCount[d] = (datesCount[d] || 0) + 1;
        if (datesCount[d] >= 3) return true;
      }
      return false;
    },
  },
  {
    code: "MARATON_TRILOGIA",
    name: "Maratón de Trilogía",
    description: "Registró 3 películas en un mismo día",
    icon: "🍕",
    category: "activity",
    check: (logs) => {
      const datesCount: Record<string, number> = {};
      for (const log of logs) {
        const dateStr = log.watched_at || log.created_at;
        if (!dateStr) continue;
        const d = dateStr.split("T")[0];
        datesCount[d] = (datesCount[d] || 0) + 1;
        if (datesCount[d] >= 3) return true;
      }
      return false;
    },
  },
  {
    code: "CINEMA_FIRST",
    name: "Amante de la Gran Pantalla",
    description: "Registró 5 películas en la plataforma 'Cine'",
    icon: "🎟️",
    category: "activity",
    check: (logs) =>
      logs.filter(
        (l) => l.platform && normalize(l.platform).includes("cine")
      ).length >= 5,
  },
  {
    code: "NIGHT_OWL",
    name: "Cinefilia Nocturna",
    description: "Viste 25 películas en total, convirtiéndote en maestro de pantalla",
    icon: "🦉",
    category: "activity",
    check: (logs) => logs.length >= 25,
  },
  {
    code: "OSCAR_COMPLETIST_2025",
    name: "Completista Oscar 2025",
    description: "Vio todas las nominadas a Mejor Película de los Oscars 2025",
    icon: "🏆",
    category: "activity",
    check: (logs) => {
      if (logs.length < 10) return false;
      const watchedTitles = logs.map((l) => normalize(l.movie?.title));
      // Verify every nominee has at least one matching watched log
      return OSCAR_2025_BEST_PICTURE_NOMINEES.every((nomineeVariants) =>
        nomineeVariants.some((variant) =>
          watchedTitles.some((wt) => wt.includes(variant) || variant.includes(wt))
        )
      );
    },
  },

  // 4. Directors
  {
    code: "NOLAN_DEVOTEE",
    name: "Devoto de Nolan",
    description: "Vio al menos 5 películas dirigidas por Christopher Nolan",
    icon: "⏳",
    category: "director",
    check: (logs) => {
      const nolanCount = logs.filter((log) =>
        checkDirector(log, "Christopher Nolan", NOLAN_TITLES)
      ).length;
      return nolanCount >= 5;
    },
  },
  {
    code: "TARANTINO_ROUND",
    name: "Círculo Tarantino",
    description: "Vio al menos 5 películas dirigidas por Quentin Tarantino",
    icon: "🩸",
    category: "director",
    check: (logs) => {
      const tarantinoCount = logs.filter((log) =>
        checkDirector(log, "Quentin Tarantino", TARANTINO_TITLES)
      ).length;
      return tarantinoCount >= 5;
    },
  },

  // 5. Discovery & Genres
  {
    code: "GHIBLI_DREAMER",
    name: "Soñador de Ghibli",
    description: "Vio al menos 4 películas de Studio Ghibli / Hayao Miyazaki",
    icon: "🍃",
    category: "discovery",
    check: (logs) => {
      const ghibliCount = logs.filter((log) => {
        const movie = log.movie;
        if (!movie) return false;

        // Check production companies
        if (Array.isArray(movie.production_companies)) {
          const hasGhibli = movie.production_companies.some((pc) =>
            normalize(pc.name).includes("ghibli")
          );
          if (hasGhibli) return true;
        }

        // Check director or titles
        return checkDirector(log, "Hayao Miyazaki", GHIBLI_TITLES);
      }).length;

      return ghibliCount >= 4;
    },
  },
  {
    code: "RETRO_70S",
    name: "Fiebre de los 70s",
    description: "Vio 5 o más películas estrenadas en los años 70",
    icon: "🕺",
    category: "discovery",
    check: (logs) => {
      const seventiesCount = logs.filter((log) => {
        const release = log.movie?.release_date;
        if (!release) return false;
        const year = parseInt(release.split("-")[0], 10);
        return !isNaN(year) && year >= 1970 && year <= 1979;
      }).length;
      return seventiesCount >= 5;
    },
  },
  {
    code: "NOIR_MASTER",
    name: "Maestro del Noir",
    description: "Vio 3 películas del género Cine Negro / Misterio clásico",
    icon: "🕵️‍♂️",
    category: "discovery",
    check: (logs) => {
      const count = logs.filter((log) => {
        const movie = log.movie;
        if (!movie) return false;

        // 1. Classic titles
        const normTitle = normalize(movie.title);
        if (NOIR_TITLES.some((t) => normTitle.includes(normalize(t)))) {
          return true;
        }

        // 2. Overview or genre keywords
        const overview = normalize(movie.overview);
        if (
          overview.includes("film noir") ||
          overview.includes("cine negro") ||
          overview.includes("detective privado")
        ) {
          return true;
        }

        // 3. Mystery/Crime released before 1970
        const genres = Array.isArray(movie.genres)
          ? movie.genres.map((g) => normalize(g.name))
          : [];
        const isCrimeOrMystery = genres.some(
          (g) => g.includes("misterio") || g.includes("crimen") || g.includes("mystery")
        );
        const year = movie.release_date
          ? parseInt(movie.release_date.split("-")[0], 10)
          : null;

        if (isCrimeOrMystery && year && year < 1970) {
          return true;
        }

        return false;
      }).length;

      return count >= 3;
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
];

export async function checkAndUnlockBadges(userId: string): Promise<BadgeDefinition[]> {
  try {
    const { data: logsData, error: logsError } = await supabase
      .from("logs")
      .select("*, movie:movies(*)")
      .eq("user_id", userId);

    if (logsError || !logsData) return [];

    const { data: userBadges, error: badgeError } = await supabase
      .from("user_badges")
      .select("badge_code")
      .eq("user_id", userId);

    if (badgeError) return [];

    const existingCodes = new Set((userBadges || []).map((b) => b.badge_code));
    const newlyUnlocked: BadgeDefinition[] = [];

    for (const badge of ALL_BADGES) {
      if (!existingCodes.has(badge.code)) {
        if (badge.check(logsData as Log[])) {
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
