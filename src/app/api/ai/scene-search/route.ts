import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";

export const dynamic = "force-dynamic";

interface Candidate {
  title: string;
  year?: number;
  reason: string;
  confidence: "alta" | "media" | "baja";
}

interface SceneSearchResult {
  movie: {
    id: number;
    title: string;
    original_title?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    vote_average: number;
    overview: string;
  };
  reason: string;
  confidence: "alta" | "media" | "baja";
  aiTitle: string;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "31841cf8ea5ec78f32d856ec6e773ea0";
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Por favor describe la escena con al menos 3 caracteres." },
        { status: 400 }
      );
    }

    const systemPrompt =
      "Eres un detective cinéfilo prodigioso. El usuario te describirá una escena, fragmento o recuerdo vago de una película. Tu objetivo es identificar de 3 a 5 películas candidatas más probables que coincidan exactamente con la descripción.";

    const userPrompt = `El usuario recuerda la siguiente escena o detalle de una película:
"${query.trim()}"

Identifica de 3 a 5 películas reales candidatas que encajen con esta escena.
Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "candidates": [
    {
      "title": "Título conocido de la película en español o idioma original",
      "year": 2011,
      "reason": "Por qué coincide exactamente con la escena descrita (menciona los elementos clave)",
      "confidence": "alta"
    }
  ]
}

Reglas:
- Solo incluye películas existentes reales.
- El campo "confidence" debe ser estrictamente "alta", "media" o "baja".
- Ordena las candidatas de mayor a menor probabilidad.`;

    let candidates: Candidate[] = [];

    // Helper to safely parse JSON from LLM response
    const parseCandidates = (raw: string): Candidate[] => {
      try {
        let cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed.candidates)) {
          return parsed.candidates;
        }
      } catch {
        // ignore and return empty
      }
      return [];
    };

    // First attempt with primary models
    const candidateModels = ["openai/gpt-oss-20b", GROQ_MODEL_LARGE, "openai/gpt-oss-120b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          // @ts-ignore
          reasoning_effort: "low",
          temperature: 0.2,
          max_tokens: 1800,
        });

        const content = completion.choices[0]?.message?.content?.trim() || "";
        const parsedList = parseCandidates(content);
        if (parsedList.length > 0) {
          candidates = parsedList;
          break;
        }
      } catch (groqErr: any) {
        console.warn(`Groq model ${modelToTry} falló en /api/ai/scene-search:`, groqErr?.message || groqErr);
      }
    }

    if (candidates.length === 0) {
      // Fallback: search TMDB directly with query terms
      return NextResponse.json({ results: [] });
    }

    // Validate and enrich candidates with TMDB
    const results: SceneSearchResult[] = [];
    const seenTmdbIds = new Set<number>();

    for (const candidate of candidates) {
      if (!candidate.title) continue;

      try {
        // Query TMDB
        const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`);
        searchUrl.searchParams.set("api_key", TMDB_API_KEY);
        searchUrl.searchParams.set("query", candidate.title);
        searchUrl.searchParams.set("language", "es-MX");
        if (candidate.year) {
          searchUrl.searchParams.set("year", String(candidate.year));
        }

        const res = await fetch(searchUrl.toString(), {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const tmdbItem = data.results && data.results[0];

        if (tmdbItem && !seenTmdbIds.has(tmdbItem.id)) {
          seenTmdbIds.add(tmdbItem.id);
          results.push({
            movie: {
              id: tmdbItem.id,
              title: tmdbItem.title,
              original_title: tmdbItem.original_title,
              poster_path: tmdbItem.poster_path,
              backdrop_path: tmdbItem.backdrop_path,
              release_date: tmdbItem.release_date,
              vote_average: tmdbItem.vote_average || 0,
              overview: tmdbItem.overview || "",
            },
            reason: candidate.reason || "Coincide con los elementos descritos en la escena.",
            confidence: candidate.confidence || "media",
            aiTitle: candidate.title,
          });
        }
      } catch (tmdbErr) {
        console.warn(`Error buscando película en TMDB "${candidate.title}":`, tmdbErr);
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Error en /api/ai/scene-search:", error);
    return NextResponse.json(
      { error: "Error interno al buscar por descripción de escena." },
      { status: 500 }
    );
  }
}
