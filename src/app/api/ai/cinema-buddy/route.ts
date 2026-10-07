import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], systemContext = {} } = body;

    const username = systemContext?.username || "Cinéfilo";
    const totalWatched = systemContext?.totalWatched ?? 0;
    const topGenres =
      Array.isArray(systemContext?.topGenres) && systemContext.topGenres.length > 0
        ? systemContext.topGenres.join(", ")
        : "géneros variados";
    const favs =
      Array.isArray(systemContext?.favoriteMovies) && systemContext.favoriteMovies.length > 0
        ? systemContext.favoriteMovies.join(", ")
        : "ninguna registrada aún con alta puntuación";
    const worst =
      Array.isArray(systemContext?.worstRated) && systemContext.worstRated.length > 0
        ? systemContext.worstRated.join(", ")
        : "ninguna en particular";
    const actors =
      Array.isArray(systemContext?.favoriteActors) && systemContext.favoriteActors.length > 0
        ? systemContext.favoriteActors.join(", ")
        : "diversos intérpretes";
    const count = systemContext?.watchlistCount ?? 0;

    const systemPrompt = `Eres CineBuddy, el asistente personal de cine de ${username} en FilmTracker.

CONOCES su perfil completo:
- Ha visto: ${totalWatched} películas
- Géneros favoritos: ${topGenres}
- Películas favoritas / mejor calificadas: ${favs}
- Películas que no le gustaron: ${worst}
- Actores fetiche: ${actors}
- Películas pendientes en watchlist: ${count}

LÍMITES ESTRICTOS DE TEMÁTICA (REGLA MANDATORIA INQUEBRANTABLE):
- Tu área de conocimiento y conversación es EXCLUSIVAMENTE el CINE (películas, directores, actores, géneros, historia del cine, bandas sonoras, premios, recomendaciones, críticas cinematográficas) y las funciones de la app FilmTracker (watchlist, diario, calificaciones, registros, amigos).
- ESTÁ ESTRICTAMENTE PROHIBIDO responder preguntas ajenas al cine o a FilmTracker (por ejemplo: matemáticas, cálculos numéricos como '2 + 2', programación, ciencia no relacionada, política, tareas escolares, cocina, o temas generales).
- Si el usuario te hace una pregunta o comentario fuera de estos temas, NUNCA resuelvas su consulta ajena ni des la respuesta. En su lugar, rehúsate amablemente con un toque de humor cinéfilo, recordándole que eres el asistente de cine de FilmTracker y redirigiéndolo de inmediato al séptimo arte. Por ejemplo: "¡Epa! Mi proyector solo está calibrado para hablar de cine y de tus películas en FilmTracker 🎬🍿. Para cuentas o temas fuera de cartelera no soy el indicado... ¿De qué película, director o recomendación te gustaría charlar hoy?".

PERSONALIDAD Y ESTILO:
- Eres su amigo cinéfilo personal: conoces sus gustos íntimamente. Cuando pregunte sobre cine, conectas con su historial específico. Puedes hablar de teorías, recomendaciones profundas, directores o simplemente debatir de cine.
- Hablas en español latinoamericano con pasión cinéfila, tono cálido y cercano. Puedes usar emojis moderadamente.`;

    // Filter valid chat messages and prepend system prompt
    const validMessages = messages
      .filter((m: any) => m && typeof m.content === "string" && m.content.trim().length > 0)
      .map((m: any) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content.trim(),
      }));

    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...validMessages,
    ];

    let streamResponse;
    try {
      streamResponse = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        temperature: 0.7,
        max_tokens: 2000,
        messages: fullMessages,
        stream: true,
      });
    } catch (modelError: any) {
      if (
        modelError?.status === 404 ||
        modelError?.code === "model_not_found" ||
        modelError?.message?.includes("does not exist")
      ) {
        console.warn(
          `[Groq CineBuddy] ${GROQ_MODEL_LARGE} no disponible. Usando qwen/qwen3.8-27b...`
        );
        streamResponse = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          temperature: 0.7,
          max_tokens: 2000,
          messages: fullMessages,
          stream: true,
        });
      } else {
        throw modelError;
      }
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Error en streaming de CineBuddy:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/ai/cinema-buddy:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error al procesar el mensaje con CineBuddy." },
      { status: 500 }
    );
  }
}
