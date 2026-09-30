import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_FAST } from "@/lib/groq/client";
import { AIWatchlistPriority } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { watchlist = [], userProfile = {} } = body;

    if (!Array.isArray(watchlist) || watchlist.length === 0) {
      return NextResponse.json(
        { error: "Tu Watchlist está vacía. Agrega películas primero para priorizarlas con IA." },
        { status: 400 }
      );
    }

    const {
      topGenres = [],
      avgRating = 0,
      preferredRuntime = "120",
      recentGenres = [],
    } = userProfile;

    // Format watchlist items for the AI prompt
    const candidateMovies = watchlist.slice(0, 40).map((m: any) => ({
      tmdb_id: m.tmdb_id || m.id,
      title: m.title || m.movie?.title || "Sin título",
      genres: Array.isArray(m.genres)
        ? m.genres.map((g: any) => (typeof g === "string" ? g : g?.name)).filter(Boolean)
        : m.movie?.genres?.map((g: any) => (typeof g === "string" ? g : g?.name)).filter(Boolean) || [],
      runtime: m.runtime || m.movie?.runtime || null,
      vote_average: m.vote_average ?? m.movie?.vote_average ?? null,
      release_date: m.release_date || m.movie?.release_date || null,
      added_at: m.added_at || null,
      poster_path: m.poster_path || m.movie?.poster_path || null,
    }));

    const systemPrompt =
      "Eres un curador de contenido cinematográfico experto. Tu trabajo es analizar la watchlist de un usuario y ordenarla estratégicamente. Priorizas considerando: afinidad con sus gustos históricos, balance de géneros, calidad crítica y antigüedad en la lista. Explicas brevemente cada prioridad.";

    const userPrompt = `Analiza la siguiente watchlist del usuario y prioriza las mejores opciones.

PERFIL DEL USUARIO:
- Géneros favoritos históricos: ${topGenres.length > 0 ? topGenres.join(", ") : "Variados"}
- Calificación promedio otorgada: ${avgRating > 0 ? `${avgRating.toFixed(1)}/10` : "No registrada aún"}
- Duración preferida promedio: ${preferredRuntime === "all" ? "Cualquiera" : `Alrededor de ${preferredRuntime} min`}
- Géneros vistos recientemente: ${recentGenres.length > 0 ? recentGenres.join(", ") : "Ninguno registrado"}

WATCHLIST DEL USUARIO (${candidateMovies.length} películas disponibles):
${JSON.stringify(
  candidateMovies.map((m) => ({
    tmdb_id: m.tmdb_id,
    title: m.title,
    genres: m.genres,
    runtime_mins: m.runtime,
    critic_rating: m.vote_average,
    release_date: m.release_date,
    added_to_watchlist_at: m.added_at,
  })),
  null,
  2
)}

INSTRUCCIONES:
1. Selecciona y ordena un ranking de hasta las primeras 8 películas más convenientes para ver ahora mismo.
2. Asigna a cada una:
   - position: número del 1 al 8
   - tmdb_id: el tmdb_id exacto proporcionado
   - title: título exacto
   - priority_reason: una sola oración concisa en español latinoamericano justificando por qué conviene verla ahora (mencionando afinidad, frescura, calidad o antigüedad en lista).
   - urgency_tag: exactamente uno de estos tres valores: 'VER YA', 'ESTA SEMANA', 'CUANDO PUEDAS'
3. Incluye un summary general de exactamente 2 oraciones resumiendo el criterio estratégico empleado y qué tipo de experiencia cinematográfica le espera al usuario esta semana.

Responde ÚNICAMENTE con un objeto JSON válido con este formato:
{
  "summary": "Texto de 2 oraciones...",
  "ranking": [
    {
      "position": 1,
      "tmdb_id": 12345,
      "title": "Nombre de la película",
      "priority_reason": "Justificación de 1 oración.",
      "urgency_tag": "VER YA"
    }
  ]
}`;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL_FAST,
        temperature: 0.4,
        max_tokens: 700,
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
          `[Groq Watchlist Priority] ${GROQ_MODEL_FAST} no disponible. Usando qwen/qwen3.8-27b...`
        );
        completion = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          temperature: 0.4,
          max_tokens: 700,
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

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error("Error al parsear JSON de watchlist-priority:", parseErr, rawContent);
      return NextResponse.json(
        { error: "Error al procesar el ranking de priorización." },
        { status: 500 }
      );
    }

    const ranking = Array.isArray(parsed.ranking) ? parsed.ranking : [];

    // Enrich ranking with poster_path from candidates
    const enrichedRanking = ranking.slice(0, 8).map((item: any, index: number) => {
      const candidate = candidateMovies.find(
        (c) => c.tmdb_id === item.tmdb_id || c.title.toLowerCase() === (item.title || "").toLowerCase()
      );

      let urgencyTag: 'VER YA' | 'ESTA SEMANA' | 'CUANDO PUEDAS' = 'CUANDO PUEDAS';
      if (item.urgency_tag === 'VER YA' || item.urgency_tag === 'ESTA SEMANA') {
        urgencyTag = item.urgency_tag;
      }

      return {
        position: item.position || index + 1,
        tmdb_id: item.tmdb_id || candidate?.tmdb_id || 0,
        title: item.title || candidate?.title || "Película",
        priority_reason: item.priority_reason || "Recomendada para ver pronto.",
        urgency_tag: urgencyTag,
        poster_path: candidate?.poster_path || null,
      };
    });

    const result: AIWatchlistPriority = {
      summary: parsed.summary || "Priorizamos tu lista para balancear calidad, tus géneros favoritos y títulos pendientes.",
      ranking: enrichedRanking,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en /api/ai/watchlist-priority:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error inesperado al priorizar la watchlist." },
      { status: 500 }
    );
  }
}
