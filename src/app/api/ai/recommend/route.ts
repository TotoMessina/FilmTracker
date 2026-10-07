import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { AIRecommendation } from "@/lib/groq/types";
import { searchMovies } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

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

// Fallback recommendations if Groq is temporarily unavailable or reaches limit
const CURATED_CANDIDATES = [
  { title: "Arrival", year: 2016, genre: "Ciencia ficción", vibe: "Melancolía poética", reason: "Ciencia ficción profunda y reflexiva con un guion magistral sobre el tiempo y la comunicación humana." },
  { title: "Ex Machina", year: 2014, genre: "Ciencia ficción", vibe: "Tensión psicológica", reason: "Un thriller minimalista e hipnótico sobre la inteligencia artificial y el libre albedrío." },
  { title: "Whiplash", year: 2014, genre: "Drama", vibe: "Adrenalina pura", reason: "Una dirección virtuosa y actuaciones deslumbrantes en un relato implacable sobre la obsesión por la perfección." },
  { title: "Mad Max: Fury Road", year: 2015, genre: "Acción", vibe: "Cinética visual", reason: "Una obra maestra de acción continua con ritmo implacable, diseño de arte sobrecogedor y maestría técnica." },
  { title: "Parasite", year: 2019, genre: "Suspense", vibe: "Sátira brillante", reason: "Una comedia negra demoledora con giros imprevistos que radiografía la división social con brillantez." },
  { title: "The Prestige", year: 2006, genre: "Misterio", vibe: "Intriga obsesiva", reason: "Un duelo de obsesiones con narrativa laberíntica y giros brillantes característicos de Christopher Nolan." },
  { title: "Her", year: 2013, genre: "Romance", vibe: "Sensibilidad nostálgica", reason: "Una mirada conmovedora a la soledad urbana contemporánea y las conexiones humanas en la era digital." },
  { title: "Blade Runner 2049", year: 2017, genre: "Ciencia ficción", vibe: "Poesía visual", reason: "Fotografía legendaria de Roger Deakins y atmósfera densa que expande el clásico con reverencia." },
];

async function generateFallbackRecommendations(
  watchedTitlesSet: Set<string>,
  topGenres: string[]
): Promise<AIRecommendation[]> {
  const filtered = CURATED_CANDIDATES.filter(
    (c) => !watchedTitlesSet.has(c.title.toLowerCase())
  );

  const selected = filtered.slice(0, 5);

  const enriched: AIRecommendation[] = await Promise.all(
    selected.map(async (item) => {
      let tmdbId: number | null = null;
      let posterPath: string | null = null;
      let backdropPath: string | null = null;

      try {
        const search = await searchMovies(item.title, 1);
        if (search?.results && search.results.length > 0) {
          const match = search.results[0];
          tmdbId = match.id;
          posterPath = match.poster_path;
          backdropPath = match.backdrop_path;
        }
      } catch {
        // ignore
      }

      return {
        title: item.title,
        year: item.year,
        reason: item.reason,
        vibe: item.vibe,
        confidence: 94,
        tmdb_id: tmdbId,
        poster_path: posterPath,
        backdrop_path: backdropPath,
      };
    })
  );

  return enriched;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logs = [], watchlistTitles = [] } = body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un historial de logs para generar recomendaciones." },
        { status: 400 }
      );
    }

    // 1. Calculate topGenres (top 4 genres by frequency)
    const genreCounts: Record<string, number> = {};
    let totalRating = 0;
    let ratingCount = 0;
    const actorCounts: Record<string, number> = {};
    const watchedTitlesSet = new Set<string>();

    logs.forEach((log: any) => {
      const title = log.title || log.movie?.title;
      if (title) watchedTitlesSet.add(String(title).trim().toLowerCase());

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

      const cast: any[] = log.cast_data || log.movie?.cast_data || [];
      cast.forEach((actor: any) => {
        const actorName = typeof actor === "string" ? actor : actor?.name;
        if (actorName) {
          actorCounts[actorName] = (actorCounts[actorName] || 0) + 1;
        }
      });
    });

    (watchlistTitles || []).forEach((t: string) => {
      if (t) watchedTitlesSet.add(String(t).trim().toLowerCase());
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    const avgRating =
      ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "Sin calificar";

    const favoriteActors = Object.entries(actorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const watchedMoviesList = logs
      .slice(0, 15)
      .map((l: any) => {
        const title = l.title || l.movie?.title || "Película";
        const rating =
          l.rating !== null && l.rating !== undefined ? `${l.rating}/10` : "sin calificar";
        return `- ${title} [Rating: ${rating}]`;
      })
      .join("\n");

    const systemPrompt =
      "Eres CineBot, el curador de cine de FilmTracker. Tu estilo es cálido, apasionado y experto. Respondes SIEMPRE en español en formato JSON. Tus recomendaciones son precisas, concisas y personalizadas. Cada 'reason' debe ser conciso (máximo 1 o 2 oraciones directas) para garantizar una respuesta ágil y completa.";

    const userPrompt = `Historial reciente del usuario:
${watchedMoviesList}

Perfil:
- Géneros favoritos: ${topGenres.length > 0 ? topGenres.join(", ") : "Cine variado"}
- Rating promedio otorgado: ${avgRating}
${favoriteActors.length > 0 ? `- Actores frecuentes: ${favoriteActors.join(", ")}` : ""}
- En Watchlist (no recomendar): ${watchlistTitles.slice(0, 10).join(", ") || "Ninguna"}

Recomienda exactamente 5 películas que no estén en la lista anterior.
Responde ÚNICAMENTE con este JSON:
{
  "recommendations": [
    {
      "title": "Nombre de la película",
      "year": 2019,
      "reason": "Razón concisa de 1 o 2 oraciones conectando con su gusto.",
      "vibe": "Tono (ej: Thriller electrizante)",
      "confidence": 95
    }
  ]
}`;

    let recommendations: AIRecommendation[] = [];
    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          temperature: 0.6,
          max_tokens: 2500, // Sufficient token headroom to avoid max_tokens validation failure
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
            recommendations = list;
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[AI Recommendations] Intento fallido con modelo ${modelToTry}:`, err?.message || err);
      }
    }

    // Fallback if all models failed or empty
    if (!recommendations || recommendations.length === 0) {
      console.info("[AI Recommendations] Usando generador inteligente de respaldo");
      const fallbackList = await generateFallbackRecommendations(watchedTitlesSet, topGenres);
      return NextResponse.json(fallbackList, { status: 200 });
    }

    // Enrich recommendations with real TMDB movie posters, backdrops, and IDs
    const enrichedRecommendations: AIRecommendation[] = await Promise.all(
      recommendations.slice(0, 5).map(async (rec) => {
        try {
          const searchRes = await searchMovies(rec.title, 1);
          const match =
            searchRes?.results?.find((m) => {
              if (!rec.year || !m.release_date) return false;
              return m.release_date.startsWith(String(rec.year));
            }) || searchRes?.results?.[0];

          return {
            ...rec,
            tmdb_id: match?.id ?? null,
            poster_path: match?.poster_path ?? null,
            backdrop_path: match?.backdrop_path ?? null,
          };
        } catch (tmdbErr) {
          console.warn(`No se pudo obtener imagen de TMDB para ${rec.title}:`, tmdbErr);
          return {
            ...rec,
            tmdb_id: null,
            poster_path: null,
            backdrop_path: null,
          };
        }
      })
    );

    return NextResponse.json(enrichedRecommendations, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/ai/recommend:", error);
    // Return friendly curated fallback rather than throwing a raw 400/500 into the UI
    try {
      const fallbackList = await generateFallbackRecommendations(new Set(), []);
      return NextResponse.json(fallbackList, { status: 200 });
    } catch {
      return NextResponse.json(
        { error: "No se pudieron generar recomendaciones en este momento." },
        { status: 500 }
      );
    }
  }
}
