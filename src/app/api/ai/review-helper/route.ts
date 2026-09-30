import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      movieTitle,
      movieYear,
      movieGenres = [],
      movieOverview,
      userRating,
      userDraft,
      review,
      userNotes,
      platform,
      format,
      isRewatch = false,
      watchedWith = [],
    } = body;

    const rawDraft = typeof userDraft === "string" ? userDraft.trim() : (typeof review === "string" ? review.trim() : "");

    if (!movieTitle) {
      return NextResponse.json(
        { error: "Se requiere el título de la película para generar la reseña." },
        { status: 400 }
      );
    }

    const r =
      userRating !== null && userRating !== undefined
        ? typeof userRating === "number"
          ? userRating
          : parseFloat(userRating)
        : null;

    let toneInstruction = "Tono sincero, reflexivo y personal sobre la experiencia cinematográfica.";
    if (r !== null && !isNaN(r)) {
      if (r >= 8) {
        toneInstruction =
          "Tono entusiasta y apasionado. Enfatiza los aciertos memorables y lo que realmente valió la pena.";
      } else if (r >= 6) {
        toneInstruction =
          "Tono equilibrado y honesto. Reconoce los puntos positivos pero mantén la mirada lúcida sobre los altibajos o limitaciones.";
      } else if (r >= 4) {
        toneInstruction =
          "Tono decepcionado pero respetuoso. Explica qué prometía o qué elementos no terminaron de cuajar.";
      } else {
        toneInstruction =
          "Tono directo, sincero y crítico. No tengas miedo a señalar con ironía o contundencia los puntos fallidos.";
      }
    }

    const rewatchInstruction = isRewatch
      ? "- El visionado fue un rewatch (ya la había visto antes). Menciona de forma natural la experiencia de revisitarla y cómo se sostiene con el tiempo."
      : "";

    const companionInstruction =
      Array.isArray(watchedWith) && watchedWith.length > 0
        ? `- Se vio en compañía de: ${watchedWith.map((w: string) => `@${w}`).join(", ")}. Menciónalo brevemente de forma cotidiana.`
        : "";

    const viewingContext = [
      platform ? `Plataforma: ${platform}` : null,
      format ? `Formato: ${format}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const systemPrompt =
      "Eres un co-escritor y asistente de redacción cinematográfica para FilmTracker (app al estilo Letterboxd). Tu labor no es inventar opiniones genéricas ni generar clichés de la nada. Tu misión es tomar la calificación asignada por el cinéfilo y las ideas, palabras clave, frases o sensaciones que él/ella haya escrito (por breves, informales o fragmentadas que sean), y ayudarle a articularlas en una reseña auténtica, personal y bien redactada que siga sonando fiel a su propia voz.\n\nPrincipios de autenticidad:\n1. Si el usuario escribió un borrador o ideas, ese texto es la verdad absoluta: desarróllalo, ordénalo y dale vuelo literario sin cambiar su opinión ni inventar escenas o reacciones ficticias que no expresó.\n2. Si el usuario no escribió nada, básate con sobriedad en la calificación numérica y el contexto sin exagerar.\n3. Escribe en primera persona, español latinoamericano natural, tono conversacional pero cinéfilo.";

    const genresFormatted = Array.isArray(movieGenres)
      ? movieGenres
          .map((g: any) => (typeof g === "string" ? g : g?.name))
          .filter(Boolean)
          .join(", ")
      : movieGenres;

    let userThoughtsSection = "";
    if (rawDraft || (userNotes && userNotes.trim())) {
      userThoughtsSection = `
IDEAS Y SENSACIONES APUNTADAS POR EL USUARIO (EJE CENTRAL OBLIGATORIO A DESARROLLAR):
${rawDraft ? `- Lo que escribió el usuario: "${rawDraft}"` : ""}
${userNotes && userNotes.trim() ? `- Notas privadas adicionales: "${userNotes.trim()}"` : ""}

INSTRUCCIÓN VITAL:
El texto generado DEBE partir directamente de las palabras y sensaciones anteriores del usuario. Ayúdale a hilvanar, argumentar y enriquecer esas mismas ideas con prosa fluida y natural, sin contradecir su postura ni añadir anécdotas inventadas.`;
    } else {
      userThoughtsSection = `
El usuario no dejó notas escritas, únicamente la calificación (${r !== null && !isNaN(r) ? `${r}/10` : "Sin puntuación"}).
Escribe una reseña honesta y reflexiva que justifique esa calificación de forma natural, sin clichés vacíos.`;
    }

    const userPrompt = `Película: ${movieTitle} (${movieYear || "Año no especificado"})
Géneros: ${genresFormatted || "No especificados"}
${movieOverview ? `Sinopsis de referencia: ${movieOverview}` : ""}
${viewingContext ? `Contexto: ${viewingContext}` : ""}
Calificación otorgada: ${r !== null && !isNaN(r) ? `${r}/10` : "Sin puntuación"}
${userThoughtsSection}

Pautas de redacción:
- ${toneInstruction}
${rewatchInstruction ? `${rewatchInstruction}\n` : ""}${companionInstruction ? `${companionInstruction}\n` : ""}
- Redacta en primera persona ("Sentí...", "Me pareció...", "La experiencia...").
- Longitud concisa: entre 70 y 130 palabras (1 o 2 párrafos).
- Responde ÚNICAMENTE con el texto de la reseña, sin títulos, sin saludos ni comillas envolventes.`;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        temperature: 0.85,
        max_tokens: 400,
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
          `[Groq Review Helper] ${GROQ_MODEL_LARGE} no disponible en esta API key. Intentando con modelo alternativo compatible...`
        );
        completion = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          temperature: 0.85,
          max_tokens: 400,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });
      } else {
        throw modelError;
      }
    }

    let rawContent = completion?.choices?.[0]?.message?.content || "";

    // If content was empty due to reasoning exhaustion or model behavior, retry with qwen
    if (!rawContent.trim()) {
      const retryCompletion = await groq.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        temperature: 0.85,
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      rawContent = retryCompletion?.choices?.[0]?.message?.content || "";
    }
    let reviewText = rawContent.trim();

    // Unwrap if LLM wrapped in JSON or quotes
    if (reviewText.startsWith("{") && reviewText.endsWith("}")) {
      try {
        const parsed = JSON.parse(reviewText);
        reviewText = parsed.review || parsed.reseña || parsed.text || reviewText;
      } catch {
        // use rawContent
      }
    }

    if (
      (reviewText.startsWith('"') && reviewText.endsWith('"')) ||
      (reviewText.startsWith('“') && reviewText.endsWith('”'))
    ) {
      reviewText = reviewText.slice(1, -1).trim();
    }

    if (!reviewText) {
      return NextResponse.json(
        { error: "No se pudo generar el texto de la reseña." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { review: reviewText.trim() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Error en /api/ai/review-helper:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error inesperado al generar la reseña con IA." },
      { status: 500 }
    );
  }
}
