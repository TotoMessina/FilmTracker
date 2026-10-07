import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { MoviePitchRequest, MoviePitchResponse } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

interface CacheEntry {
  data: MoviePitchResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const pitchCache = new Map<string, CacheEntry>();

function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

function generateFallbackPitch(movie: MoviePitchRequest): MoviePitchResponse {
  const genresStr = (movie.genres || []).join(", ");
  const yearStr = movie.year ? `(${movie.year})` : "";
  const directorStr = movie.director ? ` bajo la dirección de ${movie.director}` : "";

  return {
    pitch: `Una experiencia cinematográfica arrolladora${yearStr}${directorStr} que atrapa desde el primer minuto con una puesta en escena impecable y un pulso narrativo implacable. Las actuaciones entregan una intensidad magnética y la cinematografía eleva cada secuencia creando una atmósfera hipnótica. Es el tipo de película que te deja pegado a los créditos con la mente zumbando y la necesidad urgente de comentarla.`,
    vibeEmoji: genresStr.toLowerCase().includes("terror") ? "🕯️" : genresStr.toLowerCase().includes("ciencia") ? "🪐" : genresStr.toLowerCase().includes("acción") ? "⚡" : "🎬",
    idealMoment: "Ideal para: esta misma noche con luces tenues, sonido envolvente y cero distracciones.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: MoviePitchRequest = await req.json().catch(() => ({ title: "" }));
    const title = String(body.title || "").trim();
    const year = body.year ? String(body.year).trim() : "";
    const director = body.director ? String(body.director).trim() : "";
    const genres = Array.isArray(body.genres) ? body.genres.filter(Boolean) : [];

    if (!title) {
      return NextResponse.json(
        { error: "Se requiere el título de la película ('title')." },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${title.toLowerCase()}_${year}`.trim();
    const cached = pitchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    }

    const systemPrompt = `Eres un cinéfilo apasionado y maestro del pitch cinematográfico.
Tu especialidad es convencer a alguien de ver una película esta misma noche en exactamente 3 oraciones contundentes.
REGLA SUPREMA: 0% spoilers. Jamás reveles giros de trama, finales ni puntos clave de la historia.
Enfócate con entusiasmo en el ritmo, la vibra visual, las actuaciones estelares y la sensación visceral que te deja en el pecho al terminar.`;

    const userPrompt = `Escribe un pitch de 3 oraciones contundentes para convencer a alguien de ver '${title}' ${year ? `(${year})` : ""} ${director ? `dirigida por ${director}` : ""} ${genres.length > 0 ? `(Géneros: ${genres.join(", ")})` : ""} esta misma noche.
REGLA SUPREMA: 0% spoilers. Habla del ritmo, la vibra visual, las actuaciones y la sensación que te deja al terminar. Tono apasionado y conciso.

Responde ÚNICAMENTE con este JSON exacto:
{
  "pitch": "Tres oraciones exactas y apasionadas sin spoilers que vendan la película con fuerza y ritmo.",
  "vibeEmoji": "Un solo emoji que capture la vibra o esencia de la película (ej: ⚡, 🌃, 🔪, 🪐, 🍿)",
  "idealMoment": "Ideal para: un viernes a la medianoche con luces apagadas y sonido envolvente"
}`;

    let result: MoviePitchResponse | null = null;
    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          temperature: 0.7,
          max_tokens: 1500, // Headroom for gpt-oss reasoning tokens
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const rawContent = completion.choices[0]?.message?.content || "";
        if (rawContent) {
          const parsed = cleanAndParseJSON(rawContent);
          if (parsed && parsed.pitch) {
            result = {
              pitch: String(parsed.pitch).trim(),
              vibeEmoji: String(parsed.vibeEmoji || "🎬").trim(),
              idealMoment: String(parsed.idealMoment || "Ideal para: esta misma noche").trim(),
            };
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Movie Pitch] Intento fallido con modelo ${modelToTry}:`, err?.message || err);
      }
    }

    if (!result) {
      result = generateFallbackPitch({ title, year, director, genres });
    }

    // Save to cache
    pitchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/ai/pitch-movie:", error);
    const fallback = generateFallbackPitch({ title: "Película" });
    return NextResponse.json(fallback, { status: 200 });
  }
}
