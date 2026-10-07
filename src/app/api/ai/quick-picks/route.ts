import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { searchMovies } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

export interface QuickRecommendation {
  tmdb_id: number;
  title: string;
  year?: number | string;
  director?: string;
  genres: string[];
  match_reason: string;
  poster_path: string | null;
  vote_average?: number | null;
  release_date?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Por favor describe qué tipo de película estás buscando." },
        { status: 400 }
      );
    }

    const systemPrompt = `Eres CineBot Express, el recomendador rápido y experto de FilmTracker.
Tu trabajo es interpretar lo que el usuario está buscando (por género, estado de ánimo, estilo, director, premisa o referencias a otras películas) y sugerirle exactamente 3 películas ideales.

REGLAS OBLIGATORIAS:
1. Recomienda EXACTAMENTE 3 películas reales y accesibles que encajen al 100% con la petición.
2. Cada película debe tener una explicación breve (match_reason) en español latinoamericano de 1 o 2 frases entusiastas y concisas de por qué es la elección perfecta.
3. Responde ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "recommendations": [
    {
      "title": "Título exacto de la película (idealmente el título oficial en español o internacional de TMDB)",
      "year": 2014,
      "director": "Nombre del director",
      "genres": ["Ciencia Ficción", "Drama"],
      "match_reason": "Explicación directa de por qué encaja con lo que busca."
    }
  ]
}`;

    const userPrompt = `El usuario busca: "${query.trim()}"
Por favor genera las 3 mejores recomendaciones.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_LARGE,
      temperature: 0.6,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let rawContent = completion.choices[0]?.message?.content || "{}";
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (rawContent.includes("```")) {
      rawContent = rawContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
    }
    const b1 = rawContent.indexOf("{");
    const b2 = rawContent.lastIndexOf("}");
    if (b1 !== -1 && b2 > b1) {
      rawContent = rawContent.substring(b1, b2 + 1);
    }

    let parsed: { recommendations: any[] } = { recommendations: [] };

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { error: "Error al interpretar la respuesta de la IA." },
        { status: 500 }
      );
    }

    const recs = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [];

    // Enrich recommendations with TMDB posters and IDs
    const enrichedList: QuickRecommendation[] = await Promise.all(
      recs.map(async (rec: any, idx: number) => {
        let tmdbId = 0;
        let posterPath: string | null = null;
        let voteAverage: number | null = null;
        let releaseDate: string | null = null;

        try {
          const searchRes = await searchMovies(rec.title || "", 1);
          if (searchRes?.results && searchRes.results.length > 0) {
            // Find movie matching year if possible, otherwise first result
            const match =
              rec.year
                ? searchRes.results.find((m) => m.release_date?.startsWith(String(rec.year))) ||
                  searchRes.results[0]
                : searchRes.results[0];

            tmdbId = match.id;
            posterPath = match.poster_path;
            voteAverage = match.vote_average ? Number(match.vote_average.toFixed(1)) : null;
            releaseDate = match.release_date || null;
          }
        } catch (tmdbErr) {
          console.warn(`TMDB search error for "${rec.title}":`, tmdbErr);
        }

        return {
          tmdb_id: tmdbId || idx + 1,
          title: rec.title || "Película recomendada",
          year: rec.year || (releaseDate ? releaseDate.split("-")[0] : ""),
          director: rec.director || "",
          genres: Array.isArray(rec.genres) ? rec.genres : [],
          match_reason: rec.match_reason || "Excelente opción para tu búsqueda.",
          poster_path: posterPath,
          vote_average: voteAverage,
          release_date: releaseDate,
        };
      })
    );

    return NextResponse.json({
      recommendations: enrichedList,
      query: query.trim(),
    });
  } catch (error: any) {
    console.error("Error in /api/ai/quick-picks:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudieron obtener recomendaciones en este momento." },
      { status: 500 }
    );
  }
}
