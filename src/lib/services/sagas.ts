import { TMDBCollectionDetails, getCollectionDetails } from "../tmdb/client";

export type SagaCategory = 
  | "all" 
  | "sci-fi" 
  | "superheroes" 
  | "action" 
  | "classics" 
  | "horror" 
  | "animation";

export interface CuratedSaga {
  id: number;
  name: string;
  universe: string;
  category: SagaCategory;
  tagline: string;
  approxMovies: number;
  yearRange: string;
  badge?: string;
  accentColor?: string;
}

export const SAGA_CATEGORIES: { id: SagaCategory; label: string }[] = [
  { id: "all", label: "Todas las Sagas" },
  { id: "sci-fi", label: "Ciencia Ficción & Fantasía" },
  { id: "superheroes", label: "Superhéroes & Cómics" },
  { id: "action", label: "Acción & Espionaje" },
  { id: "classics", label: "Clásicos & Culto" },
  { id: "horror", label: "Terror & Suspenso" },
  { id: "animation", label: "Animación & Aventura" },
];

export const CURATED_SAGAS: CuratedSaga[] = [
  // Fantasía & Sci-Fi
  {
    id: 119,
    name: "El Señor de los Anillos",
    universe: "Tierra Media (Tolkien)",
    category: "sci-fi",
    tagline: "La mayor epopeya de fantasía de la historia del cine dirigida por Peter Jackson.",
    approxMovies: 3,
    yearRange: "2001 - 2003",
    badge: "Trilogía Legendaria",
    accentColor: "from-amber-600/30 via-yellow-700/20 to-stone-900",
  },
  {
    id: 1241,
    name: "Harry Potter",
    universe: "Wizarding World",
    category: "sci-fi",
    tagline: "El viaje del niño mago desde Privet Drive hasta la batalla final de Hogwarts.",
    approxMovies: 8,
    yearRange: "2001 - 2011",
    badge: "Saga Mágica",
    accentColor: "from-blue-600/30 via-amber-600/20 to-stone-900",
  },
  {
    id: 10,
    name: "Star Wars (Saga Skywalker)",
    universe: "Universo Star Wars",
    category: "sci-fi",
    tagline: "Tres generaciones de Jedis, Siths y rebeldes en una galaxia muy, muy lejana.",
    approxMovies: 9,
    yearRange: "1977 - 2019",
    badge: "Ópera Espacial",
    accentColor: "from-blue-600/30 via-cyan-700/20 to-black",
  },
  {
    id: 726871,
    name: "Dune",
    universe: "Imperio de Arrakis",
    category: "sci-fi",
    tagline: "La obra maestra de Frank Herbert adaptada a escala titánica por Denis Villeneuve.",
    approxMovies: 2,
    yearRange: "2021 - 2024",
    badge: "Sci-Fi Épico",
    accentColor: "from-orange-600/30 via-amber-700/20 to-stone-900",
  },
  {
    id: 2344,
    name: "Matrix",
    universe: "Ciberpunk / Hermanas Wachowski",
    category: "sci-fi",
    tagline: "¿Pastilla azul o pastilla roja? La revolución filosófica y de efectos visuales.",
    approxMovies: 4,
    yearRange: "1999 - 2021",
    badge: "Ciberpunk Mítico",
    accentColor: "from-emerald-600/30 via-green-800/20 to-black",
  },
  {
    id: 328,
    name: "Parque Jurásico / Jurassic World",
    universe: "Isla Nublar / Michael Crichton",
    category: "sci-fi",
    tagline: "La vida se abre camino. Dinosaurios genéticos que cambiaron el cine de aventuras.",
    approxMovies: 6,
    yearRange: "1993 - 2022",
    badge: "Aventura Jurásica",
    accentColor: "from-amber-600/30 via-red-800/20 to-stone-900",
  },
  {
    id: 173710,
    name: "El Planeta de los Simios (Trilogía de César)",
    universe: "Apes Saga Reboot",
    category: "sci-fi",
    tagline: "El ascenso y la tragedia de César con la deslumbrante captura de Andy Serkis.",
    approxMovies: 3,
    yearRange: "2011 - 2017",
    badge: "Aclamada por la Crítica",
    accentColor: "from-emerald-700/30 via-stone-800/20 to-stone-900",
  },
  {
    id: 131635,
    name: "Los Juegos del Hambre",
    universe: "Panem / Suzanne Collins",
    category: "sci-fi",
    tagline: "La rebelión del Sinsajo liderada por Katniss Everdeen en una distopía brutal.",
    approxMovies: 5,
    yearRange: "2012 - 2023",
    badge: "Distopía Juvenil",
    accentColor: "from-red-600/30 via-amber-700/20 to-stone-900",
  },

  // Superhéroes & Cómics
  {
    id: 86311,
    name: "Avengers (Los Vengadores)",
    universe: "Marvel Cinematic Universe (MCU)",
    category: "superheroes",
    tagline: "El clímax de la Saga del Infinito donde los héroes más poderosos de la Tierra se unen.",
    approxMovies: 4,
    yearRange: "2012 - 2019",
    badge: "Hito del MCU",
    accentColor: "from-red-600/30 via-purple-700/20 to-stone-900",
  },
  {
    id: 263,
    name: "Batman: El Caballero de la Noche",
    universe: "DC / Christopher Nolan",
    category: "superheroes",
    tagline: "La trilogía definitiva que redefinió el cine de superhéroes como drama criminal.",
    approxMovies: 3,
    yearRange: "2005 - 2012",
    badge: "Trilogía de Nolan",
    accentColor: "from-zinc-700/40 via-blue-950/30 to-black",
  },
  {
    id: 556,
    name: "Spider-Man (Trilogía Original)",
    universe: "Marvel / Sam Raimi",
    category: "superheroes",
    tagline: "Tobey Maguire como Peter Parker en la trilogía que forjó el boom moderno del cine de cómics.",
    approxMovies: 3,
    yearRange: "2002 - 2007",
    badge: "Clásico Nostálgico",
    accentColor: "from-red-600/30 via-blue-800/20 to-stone-900",
  },
  {
    id: 573436,
    name: "Spider-Man: Spider-Verse",
    universe: "Multiverso Animado Sony / Marvel",
    category: "superheroes",
    tagline: "Miles Morales y la cúspide de la animación revolucionaria moderna.",
    approxMovies: 2,
    yearRange: "2018 - 2023",
    badge: "Ganadora del Oscar",
    accentColor: "from-pink-600/30 via-cyan-600/20 to-stone-900",
  },
  {
    id: 284433,
    name: "Guardianes de la Galaxia",
    universe: "Marvel / James Gunn",
    category: "superheroes",
    tagline: "La familia de inadaptados intergalácticos con los mejores soundtracks del cine.",
    approxMovies: 3,
    yearRange: "2014 - 2023",
    badge: "Favorita de los Fans",
    accentColor: "from-amber-600/30 via-purple-800/20 to-stone-900",
  },

  // Acción & Espionaje
  {
    id: 404609,
    name: "John Wick",
    universe: "El Continental / Baba Yaga",
    category: "action",
    tagline: "Keanu Reeves en la franquicia cumbre de coreografía de acción y gun-fu moderno.",
    approxMovies: 4,
    yearRange: "2014 - 2023",
    badge: "Acción Pura",
    accentColor: "from-amber-500/30 via-rose-900/20 to-black",
  },
  {
    id: 87359,
    name: "Misión Imposible",
    universe: "IMF / Tom Cruise",
    category: "action",
    tagline: "Acrobacias reales sin dobles, ritmo frenético y espionaje internacional.",
    approxMovies: 7,
    yearRange: "1996 - 2023",
    badge: "Tom Cruise Stunts",
    accentColor: "from-red-600/30 via-zinc-800/20 to-stone-900",
  },
  {
    id: 9485,
    name: "Rápido y Furioso (Fast & Furious)",
    universe: "La Familia Toretto",
    category: "action",
    tagline: "De carreras callejeras ilegales a acrobacias que desafían la física en autos.",
    approxMovies: 10,
    yearRange: "2001 - 2023",
    badge: "Familia y Motores",
    accentColor: "from-orange-600/30 via-red-800/20 to-stone-900",
  },
  {
    id: 295,
    name: "Piratas del Caribe",
    universe: "Jack Sparrow / Gore Verbinski",
    category: "action",
    tagline: "Johnny Depp al mando del Perla Negra con mitología marina y maldiciones aztecas.",
    approxMovies: 5,
    yearRange: "2003 - 2017",
    badge: "Aventura Pirata",
    accentColor: "from-cyan-700/30 via-amber-800/20 to-stone-900",
  },
  {
    id: 84,
    name: "Indiana Jones",
    universe: "Arqueología / Spielberg & Lucas",
    category: "action",
    tagline: "Harrison Ford con el látigo y sombrero buscando las reliquias más sagradas del planeta.",
    approxMovies: 5,
    yearRange: "1981 - 2023",
    badge: "El Héroe Definitivo",
    accentColor: "from-amber-700/30 via-orange-900/20 to-stone-900",
  },
  {
    id: 8945,
    name: "Mad Max",
    universe: "Yermo Postapocalíptico / George Miller",
    category: "action",
    tagline: "Caos vehicular, fuego y ópera mecánica en el páramo más salvaje del cine.",
    approxMovies: 5,
    yearRange: "1979 - 2024",
    badge: "Furia en el Yermo",
    accentColor: "from-amber-600/30 via-orange-800/20 to-black",
  },
  {
    id: 1575,
    name: "Rocky & Creed",
    universe: "Boxeo / Sylvester Stallone",
    category: "action",
    tagline: "El semental italiano y el legado de Apollo: superación, sudor y corazón.",
    approxMovies: 9,
    yearRange: "1976 - 2023",
    badge: "Inspiración Deportiva",
    accentColor: "from-red-600/30 via-blue-900/20 to-stone-900",
  },

  // Clásicos & Culto
  {
    id: 230,
    name: "El Padrino (The Godfather)",
    universe: "Familia Corleone / Coppola",
    category: "classics",
    tagline: "La cúspide del cine criminal y la tragedia dinástica del siglo XX.",
    approxMovies: 3,
    yearRange: "1972 - 1990",
    badge: "Obra Maestra Universal",
    accentColor: "from-amber-700/30 via-stone-800/20 to-black",
  },
  {
    id: 264,
    name: "Volver al Futuro (Back to the Future)",
    universe: "Viajes en el Tiempo / Robert Zemeckis",
    category: "classics",
    tagline: "Marty McFly y el Doc Brown en el DeLorean a 88 millas por hora.",
    approxMovies: 3,
    yearRange: "1985 - 1990",
    badge: "Trilogía Perfecta",
    accentColor: "from-orange-500/30 via-amber-600/20 to-stone-900",
  },
  {
    id: 528,
    name: "Terminator",
    universe: "Skynet / James Cameron",
    category: "classics",
    tagline: "Cyborgs asesinos que viajan en el tiempo para exterminar a la resistencia humana.",
    approxMovies: 6,
    yearRange: "1984 - 2019",
    badge: "Sci-Fi Ochentero",
    accentColor: "from-red-600/30 via-blue-900/20 to-black",
  },

  // Terror & Suspenso
  {
    id: 8091,
    name: "Alien (El Octavo Pasajero)",
    universe: "Xenomorfo / Ridley Scott & Cameron",
    category: "horror",
    tagline: "En el espacio nadie puede oír tus gritos. Ellen Ripley contra la forma de vida perfecta.",
    approxMovies: 7,
    yearRange: "1979 - 2024",
    badge: "Terror Espacial",
    accentColor: "from-emerald-700/30 via-zinc-900/40 to-black",
  },
  {
    id: 2602,
    name: "Scream",
    universe: "Ghostface / Wes Craven",
    category: "horror",
    tagline: "¿Cuál es tu película de terror favorita? El slasher metanarrativo por excelencia.",
    approxMovies: 6,
    yearRange: "1996 - 2023",
    badge: "Rey del Slasher",
    accentColor: "from-red-600/30 via-rose-950/20 to-black",
  },

  // Animación & Aventura
  {
    id: 10194,
    name: "Toy Story",
    universe: "Pixar Animation Studios",
    category: "animation",
    tagline: "Al infinito y más allá: la entrañable amistad de Woody y Buzz a lo largo de las décadas.",
    approxMovies: 4,
    yearRange: "1995 - 2019",
    badge: "Oro de Pixar",
    accentColor: "from-sky-600/30 via-amber-600/20 to-stone-900",
  },
  {
    id: 2150,
    name: "Shrek",
    universe: "DreamWorks Animation",
    category: "animation",
    tagline: "El ogro del pantano que deconstruyó los cuentos de hadas con humor irreverente.",
    approxMovies: 4,
    yearRange: "2001 - 2010",
    badge: "Clásico DreamWorks",
    accentColor: "from-emerald-600/30 via-lime-700/20 to-stone-900",
  },
];

// In-memory cache for saga detail requests during session
const sagaDetailsCache = new Map<number, { data: TMDBCollectionDetails; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getCachedSagaDetails(id: number): Promise<TMDBCollectionDetails | null> {
  const cached = sagaDetailsCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const data = await getCollectionDetails(id);
    if (data && data.parts) {
      // Sort parts chronologically by release_date
      data.parts.sort((a, b) => {
        const dateA = a.release_date || "9999";
        const dateB = b.release_date || "9999";
        return dateA.localeCompare(dateB);
      });
      sagaDetailsCache.set(id, { data, timestamp: Date.now() });
      return data;
    }
    return null;
  } catch (err) {
    console.warn(`Error cargando detalles de saga ${id}:`, err);
    return null;
  }
}
