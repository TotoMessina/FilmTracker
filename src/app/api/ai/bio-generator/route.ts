import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { AIBioOption } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username = "Cinéfilo",
      totalWatched = 0,
      topGenre = "Cine de autor",
      topActors = [],
      favoriteMovies = [],
      mostUsedPlatform = "Streaming",
      watchedInCinema = 0,
      rewatchCount = 0,
      badgesUnlocked = 0,
      avgRating = 7,
    } = body;

    // Calculate ratingPersonality internally based on avgRating
    let ratingPersonality = "cinéfilo ecléctico y abierto";
    if (avgRating >= 8) {
      ratingPersonality = "crítico exigente que cuando le gusta algo, le encanta";
    } else if (avgRating >= 6) {
      ratingPersonality = "espectador equilibrado con criterio propio";
    } else if (avgRating >= 4) {
      ratingPersonality = "cinéfilo ecléctico y abierto";
    } else {
      ratingPersonality = "crítico implacable que pocas veces se sorprende";
    }

    const systemPrompt =
      "Eres un escritor creativo especializado en bios de usuarios de plataformas de cine como Letterboxd. Escribes bios cortas, memorables, con personalidad y un toque de humor o poesía. La bio captura la esencia del cinéfilo en 2-3 oraciones. Usas los datos reales del usuario para crear algo auténtico y específico, no genérico. Respondes en español latinoamericano.";

    const userPrompt = `Crea 3 opciones de bio para el perfil cinéfilo del siguiente usuario de FilmTracker:

DATOS REALES DEL USUARIO:
- Nombre / Username: ${username}
- Películas vistas: ${totalWatched}
- Género favorito: ${topGenre}
- Actores más vistos: ${topActors.length > 0 ? topActors.join(", ") : "Variados"}
- Películas favoritas / mejor calificadas: ${favoriteMovies.length > 0 ? favoriteMovies.join(", ") : "Diversas joyas del cine"}
- Plataforma donde más mira: ${mostUsedPlatform}
- Vistas en sala de cine: ${watchedInCinema}
- Películas repetidas (rewatches): ${rewatchCount}
- Logros/badges desbloqueados: ${badgesUnlocked}
- Calificación promedio: ${avgRating > 0 ? avgRating.toFixed(1) : "7.0"}/10 (${ratingPersonality})

INSTRUCCIONES:
Genera exactamente 3 opciones de bio, de 2 a 3 oraciones cada una, con estos 3 estilos específicos:
1. "Poética": con metáfora cinematográfica, evocadora y sensible al arte.
2. "Directa": datos reales con personalidad, contundente y sin florituras.
3. "Humor": autoirónica, divertida y con guiños cinéfilos a sus hábitos de consumo.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "options": [
    {
      "style": "Poética",
      "text": "Texto de la bio poética..."
    },
    {
      "style": "Directa",
      "text": "Texto de la bio directa..."
    },
    {
      "style": "Humor",
      "text": "Texto de la bio humorística..."
    }
  ]
}`;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        temperature: 1.0,
        max_tokens: 512,
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
          `[Groq Bio Generator] ${GROQ_MODEL_LARGE} no disponible. Usando qwen/qwen3.8-27b...`
        );
        completion = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          temperature: 1.0,
          max_tokens: 512,
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
      console.error("Error al parsear JSON de bio-generator:", parseErr, rawContent);
      return NextResponse.json(
        { error: "Error al procesar las opciones de bio generadas." },
        { status: 500 }
      );
    }

    const options: AIBioOption[] = Array.isArray(parsed.options)
      ? parsed.options.map((opt: any) => ({
          style: opt.style || "Personalizada",
          text: opt.text || "",
        }))
      : [];

    return NextResponse.json({ options });
  } catch (error: any) {
    console.error("Error en /api/ai/bio-generator:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error inesperado al generar las bios." },
      { status: 500 }
    );
  }
}
