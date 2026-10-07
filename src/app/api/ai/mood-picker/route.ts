import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_FAST } from "@/lib/groq/client";
import { AIMoodPick } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mood,
      moodLabel,
      timeAvailable = "all",
      watchlistMovies = [],
      recentlyWatched = [],
    } = body;

    if (!Array.isArray(watchlistMovies) || watchlistMovies.length === 0) {
      return NextResponse.json(
        { error: "Tu Watchlist está vacía. Agrega películas primero para usar el selector por estado de ánimo." },
        { status: 400 }
      );
    }

    // Filter by available runtime if applicable
    let candidateMovies = watchlistMovies;
    if (timeAvailable && timeAvailable !== "all") {
      const maxMinutes = parseInt(timeAvailable, 10);
      if (!isNaN(maxMinutes)) {
        const filtered = watchlistMovies.filter(
          (m: any) => m.runtime && m.runtime <= maxMinutes
        );
        if (filtered.length > 0) {
          candidateMovies = filtered;
        }
      }
    }

    // Limit candidates to avoid prompt bloat while giving ample choice
    const sampleCandidates = candidateMovies.slice(0, 30).map((m: any) => ({
      tmdb_id: m.tmdb_id,
      title: m.title,
      genres: Array.isArray(m.genres)
        ? m.genres.map((g: any) => (typeof g === "string" ? g : g?.name)).filter(Boolean)
        : [],
      runtime: m.runtime ? `${m.runtime} min` : "Desconocida",
      vote_average: m.vote_average ? `${m.vote_average}/10` : null,
      poster_path: m.poster_path || m.movie?.poster_path || null,
    }));

    const systemPrompt =
      "Eres un sommelier de películas. Como un sommelier de vinos escoge la botella perfecta para el momento, tú elegís la película perfecta de la watchlist del usuario según su estado de ánimo actual. Conoces profundamente cómo diferentes géneros, tonos y ritmos cinematográficos afectan al espectador. Respondes en español latinoamericano.";

    const userPrompt = `Estado de ánimo actual del usuario: ${moodLabel || mood}
Tiempo disponible: ${
      timeAvailable === "all"
        ? "Cualquier duración"
        : `Menos de ${timeAvailable} minutos`
    }
Películas vistas recientemente (no repetir su mismo tono exacto ni recomendar si ya las vio): ${
      Array.isArray(recentlyWatched) && recentlyWatched.length > 0
        ? recentlyWatched.join(", ")
        : "Ninguna especificada"
    }

Películas candidatas en la Watchlist del usuario:
${sampleCandidates
  .map(
    (c) =>
      `- [ID: ${c.tmdb_id}] "${c.title}" | Géneros: ${
        c.genres.join(", ") || "General"
      } | Duración: ${c.runtime} | Calificación: ${c.vote_average || "S/C"}`
  )
  .join("\n")}

Instrucciones:
Elige exactamente UNA sola película de la lista de candidatas que mejor satisfaga el estado de ánimo solicitado y el tiempo disponible.
Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "tmdb_id": 12345,
  "title": "Título exacto de la película elegida de la lista",
  "reason": "Explicación cálida y convincente de por qué esta película es la cura o maridaje perfecto para su estado de ánimo actual (2 o 3 frases)",
  "perfect_match": true,
  "watch_with": "Recomendación breve de compañía (ej: 'Solo y a oscuras', 'Con amigos y pizza', 'En pareja con manta')",
  "best_moment": "Momento ideal (ej: 'Esta noche para desconectar', 'Tarde de domingo lluviosa')"
}
Nota: Pon perfect_match en true si encaja a la perfección con el mood, o false si es la mejor opción de compromiso dentro de su watchlist.`;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL_FAST,
        temperature: 0.6,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
    } catch (modelError: any) {
      if (
        modelError?.status === 404 ||
        modelError?.code === "model_not_found" ||
        modelError?.message?.includes("does not exist")
      ) {
        console.warn(
          `[Groq Mood Picker] ${GROQ_MODEL_FAST} no disponible en esta API key. Intentando con modelo alternativo compatible...`
        );
        completion = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          temperature: 0.6,
          max_tokens: 1500,
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

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error("Error al parsear respuesta JSON de mood-picker:", parseErr, rawContent);
      return NextResponse.json(
        { error: "Error al procesar la recomendación del sommelier de cine." },
        { status: 500 }
      );
    }

    // Attach poster_path from the candidate movie
    const matchingCandidate = sampleCandidates.find(
      (c) => c.tmdb_id === parsed.tmdb_id || c.title.toLowerCase() === (parsed.title || "").toLowerCase()
    );

    const result: AIMoodPick = {
      tmdb_id: parsed.tmdb_id || matchingCandidate?.tmdb_id || 0,
      title: parsed.title || matchingCandidate?.title || "Película seleccionada",
      reason: parsed.reason || "Excelente opción para tu estado de ánimo.",
      perfect_match: Boolean(parsed.perfect_match),
      watch_with: parsed.watch_with || "Para disfrutar a tu ritmo",
      best_moment: parsed.best_moment || "Esta noche",
      poster_path: matchingCandidate?.poster_path || null,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error en /api/ai/mood-picker:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error al consultar el sommelier de películas." },
      { status: 500 }
    );
  }
}
