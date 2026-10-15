import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { AIRecommendation } from "@/lib/groq/types";
import { searchMovies } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  // Strip reasoning/think tags if model produced them
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip code fences
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
  }
  // Isolate outermost json object or array
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Normalizes movie titles for aggressive, language-agnostic, punctuation-insensitive matching.
 * e.g. "Spider-Man: No Way Home" -> "spidermannowayhome"
 * e.g. "El Secreto de sus Ojos" -> "elsecretodesusojos"
 */
function normalizeTitle(t: string | null | undefined): string {
  if (!t || typeof t !== "string") return "";
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .replace(/[^a-z0-9]/g, "") // remove punctuation, spaces, special chars
    .trim();
}

// Broad curated list of celebrated cinematic masterpieces across multiple genres
const CURATED_CANDIDATES = [
  { tmdb_id: 329865, title: "Arrival", year: 2016, genre: "Ciencia ficción", vibe: "Melancolía poética", reason: "Ciencia ficción profunda y reflexiva sobre el tiempo y la comunicación humana con dirección magistral." },
  { tmdb_id: 264660, title: "Ex Machina", year: 2014, genre: "Ciencia ficción", vibe: "Tensión psicológica", reason: "Un thriller minimalista e hipnótico sobre la inteligencia artificial y los límites de la conciencia." },
  { tmdb_id: 244786, title: "Whiplash", year: 2014, genre: "Drama", vibe: "Adrenalina pura", reason: "Una dirección virtuosa y actuaciones deslumbrantes en un relato implacable sobre la obsesión por la perfección." },
  { tmdb_id: 76341, title: "Mad Max: Fury Road", year: 2015, genre: "Acción", vibe: "Cinética visual", reason: "Una obra cumbre del cine de acción continuo con ritmo implacable y diseño de arte sobrecogedor." },
  { tmdb_id: 496243, title: "Parasite", year: 2019, genre: "Suspense", vibe: "Sátira brillante", reason: "Una comedia negra demoledora con giros imprevistos que radiografía la desigualdad social con maestría." },
  { tmdb_id: 1124, title: "The Prestige", year: 2006, genre: "Misterio", vibe: "Intriga obsesiva", reason: "Un duelo de obsesiones con narrativa laberíntica y giros brillantes característicos de Christopher Nolan." },
  { tmdb_id: 152601, title: "Her", year: 2013, genre: "Romance", vibe: "Sensibilidad nostálgica", reason: "Una mirada conmovedora a la soledad urbana contemporánea y las conexiones afectivas en la era digital." },
  { tmdb_id: 335984, title: "Blade Runner 2049", year: 2017, genre: "Ciencia ficción", vibe: "Poesía visual", reason: "Fotografía legendaria de Roger Deakins y atmósfera densa que expande el clásico de culto con reverencia." },
  { tmdb_id: 531428, title: "Portrait de la jeune fille en feu", year: 2019, genre: "Drama", vibe: "Lirismo pictórico", reason: "Una apasionante historia de amor, mirada y memoria con una composición visual arrebatadora." },
  { tmdb_id: 11423, title: "Memories of Murder", year: 2003, genre: "Crimen", vibe: "Misterio asfixiante", reason: "Un thriller policial fundamental de Bong Joon-ho con maestría en atmósfera y tensión psicológica." },
  { tmdb_id: 37799, title: "The Social Network", year: 2010, genre: "Drama", vibe: "Ritmo vertiginoso", reason: "Dirección quirúrgica de David Fincher y guion afilado de Aaron Sorkin sobre la ambición moderna." },
  { tmdb_id: 1949, title: "Zodiac", year: 2007, genre: "Misterio", vibe: "Obsesión meticulosa", reason: "Un análisis obsesivo del caso del asesino del Zodiaco con un nivel de detalle milimétrico e inquietante." },
  { tmdb_id: 275, title: "Fargo", year: 1996, genre: "Crimen", vibe: "Humor negro gélido", reason: "Una brillante sátira criminal en las nieves de Minnesota con personajes inolvidables de los hermanos Coen." },
  { tmdb_id: 1417, title: "El laberinto del fauno", year: 2006, genre: "Fantasía", vibe: "Fábula oscura", reason: "El cuento de hadas definitivo de Guillermo del Toro entrelazado con la posguerra española." },
  { tmdb_id: 915935, title: "Anatomy of a Fall", year: 2023, genre: "Drama", vibe: "Juicio electrizante", reason: "Un drama judicial implacable que disecciona la verdad, la pareja y la ambigüedad moral." },
  { tmdb_id: 666277, title: "Past Lives", year: 2023, genre: "Romance", vibe: "Delicadeza emotiva", reason: "Un romance melancólico y sincero sobre las vidas que dejamos atrás y los lazos que trascienden el tiempo." },
  { tmdb_id: 976893, title: "Perfect Days", year: 2023, genre: "Drama", vibe: "Paz contemplativa", reason: "Wim Wenders captura la belleza de lo cotidiano y la serenidad interior en las calles de Tokio." },
  { tmdb_id: 242582, title: "Nightcrawler", year: 2014, genre: "Thriller", vibe: "Adrenalina nocturna", reason: "Un retrato perturbador y absorbente del sensacionalismo en las sombras de Los Ángeles." },
  { tmdb_id: 73, title: "American History X", year: 1998, genre: "Drama", vibe: "Impacto visceral", reason: "Un drama contundente sobre el odio, el arrepentimiento y la redención con enorme fuerza dramática." },
  { tmdb_id: 500, title: "Reservoir Dogs", year: 1992, genre: "Crimen", vibe: "Intensidad coral", reason: "El debut fulgurante de Quentin Tarantino con diálogos icónicos y tensión sostenida en tiempo real." },
  { tmdb_id: 694, title: "The Shining", year: 1980, genre: "Terror", vibe: "Terror psicológico", reason: "Una sinfonía visual claustrofóbica y perturbadora sobre el descenso a la locura en el hotel Overlook." },
  { tmdb_id: 598, title: "City of God", year: 2002, genre: "Crimen", vibe: "Energía explosiva", reason: "Un torrente visual hiperquinético sobre el crecimiento de las favelas en Río de Janeiro." },
  { tmdb_id: 129, title: "Spirited Away", year: 2001, genre: "Animación", vibe: "Magia deslumbrante", reason: "La obra cumbre de Hayao Miyazaki, un viaje fantástico repleto de imaginación visual y nostalgia." },
  { tmdb_id: 4935, title: "Howl's Moving Castle", year: 2004, genre: "Animación", vibe: "Fantasía poética", reason: "Un fascinante despliegue visual sobre el amor, la libertad y los estragos de la guerra." },
  { tmdb_id: 389, title: "12 Angry Men", year: 1957, genre: "Drama", vibe: "Tensión dialéctica", reason: "Una cátedra de cine de cámara donde la duda razonable transforma un veredicto crucial." },
  { tmdb_id: 744275, title: "Drive My Car", year: 2021, genre: "Drama", vibe: "Contemplación humana", reason: "Una travesía íntima y catártica sobre el duelo, la creación artística y la reconciliación con uno mismo." },
  { tmdb_id: 467244, title: "The Zone of Interest", year: 2023, genre: "Drama", vibe: "Sobriedad escalofriante", reason: "Jonathan Glazer examina la banalidad del mal con una puesta en escena y diseño sonoro revolucionarios." },
  { tmdb_id: 426, title: "La Haine", year: 1995, genre: "Drama", vibe: "Furia urbana", reason: "Un retrato visceral y electrizante en blanco y negro sobre la marginación en los suburbios de París." },
  { tmdb_id: 11216, title: "Cinema Paradiso", year: 1988, genre: "Drama", vibe: "Nostalgia cinematográfica", reason: "La carta de amor definitiva al poder redentor del cine, la infancia y la memoria de Giuseppe Tornatore." },
  { tmdb_id: 1091, title: "The Thing", year: 1982, genre: "Terror", vibe: "Paranoia helada", reason: "La cumbre de John Carpenter: efectos prácticos legendarios y paranoia asfixiante en la Antártida." },
];

async function generateFallbackRecommendations(
  watchedTmdbIdsSet: Set<number>,
  normalizedExclusionSet: Set<string>,
  topGenres: string[],
  neededCount: number = 5
): Promise<AIRecommendation[]> {
  const filtered = CURATED_CANDIDATES.filter((c) => {
    if (watchedTmdbIdsSet.has(c.tmdb_id)) return false;
    const norm = normalizeTitle(c.title);
    if (norm && normalizedExclusionSet.has(norm)) return false;
    return true;
  });

  // Prioritize candidates matching user's top genres
  const prioritized = [...filtered].sort((a, b) => {
    const aMatch = topGenres.some((g) => a.genre.toLowerCase().includes(g.toLowerCase()));
    const bMatch = topGenres.some((g) => b.genre.toLowerCase().includes(g.toLowerCase()));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const selected = prioritized.slice(0, neededCount);

  const enriched: AIRecommendation[] = await Promise.all(
    selected.map(async (item) => {
      let posterPath: string | null = null;
      let backdropPath: string | null = null;

      try {
        const search = await searchMovies(item.title, 1);
        if (search?.results && search.results.length > 0) {
          const match = search.results.find((m) => m.id === item.tmdb_id) || search.results[0];
          posterPath = match.poster_path;
          backdropPath = match.backdrop_path;
        }
      } catch {
        // ignore fallback network issues
      }

      return {
        title: item.title,
        year: item.year,
        reason: item.reason,
        vibe: item.vibe,
        confidence: 93,
        tmdb_id: item.tmdb_id,
        poster_path: posterPath,
        backdrop_path: backdropPath,
      };
    })
  );

  return enriched;
}

export async function POST(req: NextRequest) {
  // Setup exclusion sets at top-level scope so even in catch blocks they protect the user
  const watchedTmdbIdsSet = new Set<number>();
  const allKnownTitlesSet = new Set<string>();
  const normalizedExclusionSet = new Set<string>();
  const genreCounts: Record<string, number> = {};
  const actorCounts: Record<string, number> = {};
  const directorCounts: Record<string, { count: number; totalRating: number; ratedCount: number }> = {};
  const decadeCounts: Record<string, number> = {};

  try {
    const body = await req.json();
    const {
      logs = [],
      watchlistTitles = [],
      watchlistTmdbIds = [],
      watchedTmdbIds = [],
      watchedTitles = [],
    } = body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un historial de logs para generar recomendaciones." },
        { status: 400 }
      );
    }

    // 1. Build universal TMDB ID exclusion set
    [...(watchedTmdbIds || []), ...(watchlistTmdbIds || [])].forEach((id: any) => {
      const num = Number(id);
      if (!isNaN(num) && num > 0) watchedTmdbIdsSet.add(num);
    });

    logs.forEach((log: any) => {
      const id = Number(log.tmdb_id || log.movie?.tmdb_id);
      if (!isNaN(id) && id > 0) watchedTmdbIdsSet.add(id);
    });

    // 2. Build normalized title exclusion set
    const addExclusionTitle = (rawTitle: any) => {
      if (!rawTitle || typeof rawTitle !== "string") return;
      const trimmed = rawTitle.trim();
      if (!trimmed) return;
      allKnownTitlesSet.add(trimmed);
      const norm = normalizeTitle(trimmed);
      if (norm) normalizedExclusionSet.add(norm);
    };

    (watchedTitles || []).forEach(addExclusionTitle);
    (watchlistTitles || []).forEach(addExclusionTitle);

    let totalRating = 0;
    let ratingCount = 0;

    logs.forEach((log: any) => {
      addExclusionTitle(log.title);
      addExclusionTitle(log.movie?.title);
      addExclusionTitle(log.movie?.original_title);

      const genres: string[] = (
        log.genres ||
        log.movie?.genres ||
        []
      ).map((g: any) => (typeof g === "string" ? g : g?.name)).filter(Boolean);

      genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });

      const rating = typeof log.rating === "number" ? log.rating : null;
      if (rating !== null && !isNaN(rating)) {
        totalRating += rating;
        ratingCount += 1;
      }

      // Track decades
      const relYearStr = log.movie?.release_date || (log.watched_at ? log.watched_at.slice(0, 4) : null);
      const parsedYear = relYearStr ? parseInt(relYearStr.slice(0, 4)) : null;
      if (parsedYear && parsedYear >= 1920 && parsedYear <= 2030) {
        const decade = `${Math.floor(parsedYear / 10) * 10}s`;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }

      // Track directors and actors from cast_data
      const cast: any[] = log.cast_data || log.movie?.cast_data || [];
      cast.forEach((person: any) => {
        const isDirector = person?.character === "Director" || person?.job === "Director";
        const name = typeof person === "string" ? person : person?.name;
        if (name && typeof name === "string") {
          const cleanName = name.trim();
          if (cleanName) {
            if (isDirector) {
              if (!directorCounts[cleanName]) {
                directorCounts[cleanName] = { count: 0, totalRating: 0, ratedCount: 0 };
              }
              directorCounts[cleanName].count += 1;
              if (rating !== null) {
                directorCounts[cleanName].totalRating += rating;
                directorCounts[cleanName].ratedCount += 1;
              }
            } else {
              actorCounts[cleanName] = (actorCounts[cleanName] || 0) + 1;
            }
          }
        }
      });
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => `${name} (${count} pelis)`);

    const avgRating =
      ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "Sin calificar";

    const topDirectors = Object.entries(directorCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([name, d]) => {
        const avg = d.ratedCount > 0 ? ` [promedio ${(d.totalRating / d.ratedCount).toFixed(1)}★]` : "";
        return `${name} (${d.count} vistas${avg})`;
      });

    const favoriteActors = Object.entries(actorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => `${name} (${count})`);

    const sortedDecades = Object.entries(decadeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([decade, count]) => `${decade} (${count})`);

    // 3. User favorites (ratings >= 8.5) - defining masterworks
    const masterpieces = [...logs]
      .filter((l: any) => typeof l.rating === "number" && l.rating >= 8.5)
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 25)
      .map((l: any) => {
        const title = l.title || l.movie?.title || "Película";
        const yr = l.movie?.release_date ? ` (${l.movie.release_date.slice(0, 4)})` : "";
        return `• ${title}${yr}: ${l.rating}/10`;
      });

    // 4. Solidly enjoyed films (ratings 7.0 to 8.4)
    const greatMovies = [...logs]
      .filter((l: any) => typeof l.rating === "number" && l.rating >= 7.0 && l.rating < 8.5)
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 25)
      .map((l: any) => {
        const title = l.title || l.movie?.title || "Película";
        const yr = l.movie?.release_date ? ` (${l.movie.release_date.slice(0, 4)})` : "";
        return `• ${title}${yr}: ${l.rating}/10`;
      });

    // 5. Low rated films (ratings <= 5.0) - crucial negative signal
    const lowRatedMovies = [...logs]
      .filter((l: any) => typeof l.rating === "number" && l.rating <= 5.0)
      .sort((a: any, b: any) => (a.rating || 0) - (b.rating || 0))
      .slice(0, 15)
      .map((l: any) => {
        const title = l.title || l.movie?.title || "Película";
        return `• ${title}: ${l.rating}/10`;
      });

    // 6. Rewatches (sacred movies)
    const rewatches = [...logs]
      .filter((l: any) => l.is_rewatch)
      .slice(0, 15)
      .map((l: any) => l.title || l.movie?.title)
      .filter(Boolean);

    // 7. Recent watches for viewing context
    const recentMovies = [...logs]
      .slice(0, 12)
      .map((l: any) => {
        const title = l.title || l.movie?.title || "Película";
        const rating = typeof l.rating === "number" ? `${l.rating}/10` : "sin calificar";
        return `• ${title} [${rating}]`;
      });

    // 8. Expanded exclusion list: raised from 350 to up to 1,500 titles
    // Groq model (128k context) handles 1,500 titles effortlessly in ~6k tokens
    const allTitlesArray = Array.from(allKnownTitlesSet);
    const MAX_EXCLUSION_TITLES = 1500;
    const excludedTitlesPromptText = allTitlesArray.slice(0, MAX_EXCLUSION_TITLES).join(", ");

    const systemPrompt =
      "Eres CineBot, el curador cinematográfico de máxima élite de FilmTracker. Te apasiona el cine mundial, el cine de autor, las joyas de culto, los clásicos atemporales y las sorpresas contemporáneas. Respondes SIEMPRE en español en formato JSON. Tu misión es analizar a fondo el ADN cinéfilo del usuario a partir de su catálogo de más de 500 películas vistas y recomendar exactamente 10 joyas cinematográficas 100% NOVEDOSAS que sintonicen de forma impecable con su gusto personal, garantizando CERO repeticiones.";

    const userPrompt = `ANÁLISIS DE PERFIL Y GUSTOS CINEMATOGRÁFICOS DEL USUARIO:
- Total de películas en su historial: ${logs.length} películas registradas.
- Puntuación promedio otorgada: ${avgRating} / 10
- Géneros predilectos: ${topGenres.length > 0 ? topGenres.join(", ") : "Cine variado"}
${topDirectors.length > 0 ? `- Directores recurrentes / favoritos: ${topDirectors.join(", ")}` : ""}
${favoriteActors.length > 0 ? `- Actores e intérpretes más vistos: ${favoriteActors.join(", ")}` : ""}
${sortedDecades.length > 0 ? `- Épocas más frecuentadas: ${sortedDecades.join(", ")}` : ""}
${rewatches.length > 0 ? `- Películas que ha vuelto a ver (Rewatches sagrados): ${rewatches.join(", ")}` : ""}

1. OBRAS MAESTRAS Y JOYAS DEL USUARIO (Calificadas con 8.5 a 10):
${masterpieces.length > 0 ? masterpieces.join("\n") : "Sin calificaciones de 8.5-10 aún"}

2. PELÍCULAS DESTACADAS Y MUY DISFRUTADAS (Calificadas con 7.0 a 8.4):
${greatMovies.length > 0 ? greatMovies.join("\n") : "Sin calificaciones de 7-8.4 aún"}

${lowRatedMovies.length > 0 ? `3. PELÍCULAS PEOR VALORADAS (Evitar estilos, fórmulas o tonos similares a estas):
${lowRatedMovies.join("\n")}
` : ""}
4. VISIONADOS MÁS RECIENTES (Momento cinéfilo actual):
${recentMovies.join("\n")}

======================================================================
UNIVERSO COMPLETO DE PELÍCULAS DEL USUARIO (${Math.min(allTitlesArray.length, MAX_EXCLUSION_TITLES)} títulos de ${allTitlesArray.length} totales en su historial y watchlist):
${excludedTitlesPromptText || "Ninguna"}
======================================================================

INSTRUCCIONES CLAVE DE CURADURÍA:
1. USA EL UNIVERSO COMPLETO ANTERIOR PARA MAPEAR SUS GUSTOS: Observa el mapa completo de películas que el usuario ha visto. Descubre qué directores de culto conoce, qué movimientos cinematográficos sigue, si prefiere ritmo contemplativo o adrenalina narrativa, tonos existenciales o giros de guion inteligentes.
2. EXCLUSIÓN TOTAL Y ABSOLUTA (REGLA INQUEBRANTABLE): NINGUNA de las películas presentes en el universo anterior ni en su Watchlist puede ser recomendada. Tampoco recomiendes secuelas directas de películas que ya vio ni versiones de la misma película con otro título.
3. VARIEDAD Y DESCUBRIMIENTO REAL: Recomienda exactamente 10 candidatas que expandan sus horizontes: pueden ser obras maestras internacionales (cine europeo, asiático o latinoamericano), joyas de autor, clásicos imperdibles o cine independiente que se alinee con su nivel de sofisticación cinéfila.

Responde ÚNICAMENTE con este JSON:
{
  "recommendations": [
    {
      "title": "Nombre de la película",
      "year": 2019,
      "reason": "Explicación concisa y persuasiva (1 o 2 oraciones) conectando directamente con su estilo y gustos.",
      "vibe": "Tono cinematográfico (ej: Thriller psicológico implacable, Odisea melancólica, Tensión visceral)",
      "confidence": 95
    }
  ]
}`;

    let candidateRecommendations: any[] = [];
    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          temperature: 0.7,
          max_tokens: 2500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const rawContent = completion.choices[0]?.message?.content || "";
        if (rawContent) {
          const parsedData = cleanAndParseJSON(rawContent);
          const list = Array.isArray(parsedData)
            ? parsedData
            : parsedData.recommendations || [];

          if (Array.isArray(list) && list.length > 0) {
            candidateRecommendations = list;
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[AI Recommendations] Intento fallido con modelo ${modelToTry}:`, err?.message || err);
      }
    }

    // 6. Strict Multi-Layer Post-Filtering Pipeline
    const finalRecommendations: AIRecommendation[] = [];
    const seenTmdbIds = new Set<number>();

    for (const rec of candidateRecommendations) {
      if (finalRecommendations.length >= 5) break;
      if (!rec || !rec.title) continue;

      // 6a. Direct normalized title check against diary & watchlist
      const normRecTitle = normalizeTitle(rec.title);
      if (normRecTitle && normalizedExclusionSet.has(normRecTitle)) {
        console.log(`[AI Rec Filter] Excluyendo por título exacto ya visto/en watchlist: "${rec.title}"`);
        continue;
      }

      try {
        const searchRes = await searchMovies(rec.title, 1);
        if (!searchRes?.results || searchRes.results.length === 0) {
          continue;
        }

        const match =
          searchRes.results.find((m) => {
            if (!rec.year || !m.release_date) return false;
            return m.release_date.startsWith(String(rec.year));
          }) || searchRes.results[0];

        if (!match || !match.id) continue;

        // 6b. Strict TMDB ID check (protects against title translations / localized titles)
        if (watchedTmdbIdsSet.has(match.id)) {
          console.log(`[AI Rec Filter] Excluyendo por TMDB ID ${match.id} ya visto/en watchlist: "${match.title || rec.title}"`);
          continue;
        }

        // 6c. TMDB Title and Original Title check
        const normMatchTitle = normalizeTitle(match.title);
        const normMatchOriginal = normalizeTitle(match.original_title);

        if (normMatchTitle && normalizedExclusionSet.has(normMatchTitle)) {
          console.log(`[AI Rec Filter] Excluyendo por título TMDB ya visto: "${match.title}"`);
          continue;
        }

        if (normMatchOriginal && normalizedExclusionSet.has(normMatchOriginal)) {
          console.log(`[AI Rec Filter] Excluyendo por título original TMDB ya visto: "${match.original_title}"`);
          continue;
        }

        // 6d. Deduplicate within recommendations list
        if (seenTmdbIds.has(match.id)) {
          continue;
        }
        seenTmdbIds.add(match.id);

        const releaseYear = match.release_date ? parseInt(match.release_date.substring(0, 4)) : rec.year;

        finalRecommendations.push({
          title: match.title || rec.title,
          year: releaseYear || rec.year || 2020,
          reason: rec.reason || "Recomendada especialmente para ti según tus gustos cinematográficos.",
          vibe: rec.vibe || "Cine selecto",
          confidence: typeof rec.confidence === "number" ? Math.min(Math.max(rec.confidence, 60), 99) : 92,
          tmdb_id: match.id,
          poster_path: match.poster_path ?? null,
          backdrop_path: match.backdrop_path ?? null,
        });
      } catch (tmdbErr) {
        console.warn(`[AI Rec Filter] Error consultando TMDB para ${rec.title}:`, tmdbErr);
      }
    }

    // 7. If model failed or filtered candidates resulted in fewer than 5, complete with safe curated catalog
    if (finalRecommendations.length < 5) {
      const needed = 5 - finalRecommendations.length;
      console.info(`[AI Rec] Completando con ${needed} recomendaciones de catálogo seguro.`);

      const combinedWatchedIds = new Set(watchedTmdbIdsSet);
      finalRecommendations.forEach((r) => {
        if (r.tmdb_id) combinedWatchedIds.add(r.tmdb_id);
      });

      const fallbackItems = await generateFallbackRecommendations(
        combinedWatchedIds,
        normalizedExclusionSet,
        topGenres,
        needed
      );
      finalRecommendations.push(...fallbackItems);
    }

    return NextResponse.json(finalRecommendations, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/ai/recommend:", error);
    try {
      const fallbackList = await generateFallbackRecommendations(
        watchedTmdbIdsSet,
        normalizedExclusionSet,
        Object.keys(genreCounts),
        5
      );
      return NextResponse.json(fallbackList, {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    } catch {
      return NextResponse.json(
        { error: "No se pudieron generar recomendaciones en este momento." },
        { status: 500 }
      );
    }
  }
}
