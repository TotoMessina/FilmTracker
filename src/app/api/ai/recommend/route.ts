import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { AIRecommendation } from "@/lib/groq/types";
import { searchMovies } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

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
    // 2. Calculate avgRating
    let totalRating = 0;
    let ratingCount = 0;
    // 3. Calculate favoriteActors (actors from cast_data appearing in most logs)
    const actorCounts: Record<string, number> = {};

    logs.forEach((log: any) => {
      // Genres
      const genres: string[] = (
        log.genres ||
        log.movie?.genres ||
        []
      ).map((g: any) => (typeof g === "string" ? g : g?.name)).filter(Boolean);

      genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });

      // Rating
      const rating = typeof log.rating === "number" ? log.rating : null;
      if (rating !== null && !isNaN(rating)) {
        totalRating += rating;
        ratingCount += 1;
      }

      // Actors
      const cast: any[] = log.cast_data || log.movie?.cast_data || [];
      cast.forEach((actor: any) => {
        const actorName = typeof actor === "string" ? actor : actor?.name;
        if (actorName) {
          actorCounts[actorName] = (actorCounts[actorName] || 0) + 1;
        }
      });
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

    // Format watched movies list
    const watchedMoviesList = logs
      .map((l: any) => {
        const title = l.title || l.movie?.title || "Película sin título";
        const rating =
          l.rating !== null && l.rating !== undefined ? `${l.rating}/10` : "sin calificar";
        const rewatch = l.is_rewatch ? " (rewatch)" : "";
        const platform = l.platform ? ` en ${l.platform}` : "";
        return `- ${title} [Rating: ${rating}]${rewatch}${platform}`;
      })
      .join("\n");

    const systemPrompt =
      "Eres CineBot, el asistente de IA de FilmTracker, una app de diario cinematográfico al estilo Letterboxd. Tu misión es actuar como un crítico y curador de cine de nivel experto con un toque personal y cálido. Respondes SIEMPRE en español latinoamericano, tono conversacional pero culto. Eres apasionado del cine, conoces historia del cine, nuevas tendencias y cine de nicho. Tus respuestas son concisas, con personalidad y nunca genéricas. Nunca recomiendas algo que el usuario ya vio. Siempre explicas el POR QUÉ de cada recomendación basándote en el historial específico del usuario.";

    const userPrompt = `Historial de películas vistas del usuario:
${watchedMoviesList}

Estadísticas del perfil:
- Géneros favoritos: ${topGenres.length > 0 ? topGenres.join(", ") : "Diversos"}
- Rating promedio otorgado: ${avgRating}
- Actores más frecuentes en su historial: ${favoriteActors.length > 0 ? favoriteActors.join(", ") : "Varios"}
- Películas en su Watchlist (NO las recomiendes, ya las tiene agendadas): ${
      watchlistTitles.length > 0 ? watchlistTitles.join(", ") : "Ninguna"
    }

Instrucciones:
Recomienda exactamente 5 películas acordes a este gusto cinematográfico que el usuario no haya visto ni tenga en su watchlist.
Responde ÚNICAMENTE con un objeto JSON válido con la propiedad "recommendations", que contenga un array de 5 objetos con la siguiente estructura exacta:
{
  "recommendations": [
    {
      "title": "Nombre de la película",
      "year": 2023,
      "reason": "Explicación detallada y personalizada de por qué encaja con sus gustos o películas que disfrutó",
      "vibe": "Tono o sensación de la película (ej: Melancolía poética, Thriller electrizante, Comedia ácida)",
      "confidence": 95
    }
  ]
}
Asegúrate de que "confidence" sea un número entero entre 1 y 100.`;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
    } catch (modelError: any) {
      if (modelError?.status === 404 || modelError?.code === "model_not_found" || modelError?.message?.includes("does not exist")) {
        console.warn(`[Groq AI] ${GROQ_MODEL_LARGE} no disponible en esta API key. Intentando con modelo alternativo compatible...`);
        completion = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });
      } else {
        throw modelError;
      }
    }

    const rawContent = completion.choices[0]?.message?.content || "";

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("Error al parsear JSON de Groq:", parseError, "Respuesta cruda:", rawContent);
      return NextResponse.json(
        { error: "Error al procesar la respuesta de la IA. Formato JSON inválido." },
        { status: 500 }
      );
    }

    const recommendations: AIRecommendation[] = Array.isArray(parsedData)
      ? parsedData
      : parsedData.recommendations || [];

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron generar recomendaciones estructuradas." },
        { status: 500 }
      );
    }

    // Enrich recommendations with real TMDB movie posters, backdrops, and IDs
    const enrichedRecommendations: AIRecommendation[] = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const searchRes = await searchMovies(rec.title);
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
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error inesperado al generar recomendaciones con IA." },
      { status: 500 }
    );
  }
}
