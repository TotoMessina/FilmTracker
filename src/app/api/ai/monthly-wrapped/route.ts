import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { MonthlyWrappedResponse, MonthlyWrappedStats } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

interface CacheEntry {
  data: MonthlyWrappedResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const monthlyWrappedCache = new Map<string, CacheEntry>();

const SPANISH_MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

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

function generateFallbackMonthlyWrapped(
  monthName: string,
  year: number,
  stats: MonthlyWrappedStats
): MonthlyWrappedResponse {
  const topMovie = stats.bestRated?.title || "tu gran descubrimiento del mes";
  const worstMovie = stats.worstRated?.title;
  const genre = stats.topGenre || "cine variado";
  const visits = stats.cinemaVisits || 0;

  return {
    titular_del_mes: `En ${monthName}, ${genre.toLowerCase()} fue el compás que marcó tus días cinéfilos.`,
    destacada_del_mes: `"${topMovie}" se coronó como la experiencia insuperable del mes, justificando cada minuto de entrega frente a la pantalla.`,
    habito_curioso: visits > 0
      ? `Pisaste las salas de cine tradicional ${visits} veces este mes, defendiendo la magia de la gran pantalla en tiempos de streaming.`
      : stats.totalHours >= 15
      ? `Le dedicaste más de ${stats.totalHours} horas al séptimo arte en apenas 30 días: un ritmo voraz de auténtico devorador de historias.`
      : `Tu selección de ${stats.totalWatched} películas reflejó una búsqueda selectiva y atenta, priorizando calidad por sobre la inercia.`,
    veredicto: worstMovie
      ? `Un sólido ${stats.avgRating || 8}/10 cinéfilo: con "${topMovie}" en la gloria y el tropiezo simpático de "${worstMovie}" para la anécdota.`
      : `Calificación del mes: 9/10 cinéfilo impecable. 30 días de gran pulso narrativo y palomitas bien aprovechadas.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, year = new Date().getFullYear(), stats } = body as {
      month: number | string;
      year: number;
      stats: MonthlyWrappedStats;
    };

    if (!stats || typeof stats !== "object") {
      return NextResponse.json(
        { error: "Se requieren estadísticas del mes para generar el Cine Wrapped mensual." },
        { status: 400 }
      );
    }

    // Normalize month to 1-12 and get name
    const numMonth = typeof month === "string" ? parseInt(month, 10) : month;
    const monthIndex = !isNaN(numMonth) && numMonth >= 1 && numMonth <= 12 ? numMonth - 1 : 0;
    const monthName = SPANISH_MONTH_NAMES[monthIndex] || "este mes";

    // Cache key
    const cacheKey = JSON.stringify({
      year,
      month: monthIndex + 1,
      totalWatched: stats.totalWatched,
      totalHours: stats.totalHours,
      best: stats.bestRated?.title || "",
      worst: stats.worstRated?.title || "",
    });

    const cached = monthlyWrappedCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
          "X-Cache": "HIT",
        },
      });
    }

    const systemPrompt = `Eres el narrador del "Cine Wrapped Mensual" de FilmTracker. Tu estilo es ágil, perspicaz, con chispa cinéfila y tono de crónica mensual entusiasta ("Tu crónica de ${monthName} ${year}"). Hablas directamente al usuario en segunda persona ("viste", "disfrutaste", "maratoneaste"), con toques de humor inteligente y emoción por las historias.`;

    const userPrompt = `Aquí están las estadísticas del mes de ${monthName} de ${year} del usuario:
- Películas vistas este mes: ${stats.totalWatched}
- Horas de pantalla: ${stats.totalHours} horas
- Género predominante: ${stats.topGenre || "Variado"}
- Película mejor calificada: ${stats.bestRated?.title ? `"${stats.bestRated.title}" (${stats.bestRated.rating || 9}★)` : "No registrada"}
- Película peor calificada / decepción: ${stats.worstRated?.title ? `"${stats.worstRated.title}" (${stats.worstRated.rating || 4}★)` : "Ninguna especialmente baja"}
- Visitas a salas de cine: ${stats.cinemaVisits || 0}
${stats.topActors && stats.topActors.length > 0 ? `- Actores frecuentes: ${stats.topActors.join(", ")}` : ""}
${stats.avgRating ? `- Calificación promedio: ${stats.avgRating}/10` : ""}

Genera el resumen mensual estructurado exactamente en 4 tarjetas rápidas en formato JSON:
{
  "titular_del_mes": "Una frase contundente, magnética y memorable que defina la vibra del mes del usuario",
  "destacada_del_mes": "Párrafo breve y apasionado sobre su película cumbre del mes y por qué valió cada minuto",
  "habito_curioso": "Un detalle agudo, divertido o llamativo sobre su comportamiento cinéfilo este mes (maratones, horas acumuladas, visitas al cine o géneros)",
  "veredicto": "El veredicto final: calificación en estrellas o frase de cierre que redondee su mes cinéfilo con estilo"
}

Reglas estrictas:
1. Responde ÚNICAMENTE con el objeto JSON válido.
2. Cada campo debe ser texto conciso (entre 1 y 3 oraciones por tarjeta), ideal para leer en una pantalla vertical móvil tipo Instagram Stories.
3. No inventes títulos de películas; básate en los provistos.`;

    let result: MonthlyWrappedResponse | null = null;

    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.75,
          max_tokens: 800,
        });

        const raw = completion.choices[0]?.message?.content?.trim() || "";
        if (raw) {
          const parsed = cleanAndParseJSON(raw);
          if (
            parsed.titular_del_mes &&
            parsed.destacada_del_mes &&
            parsed.habito_curioso &&
            parsed.veredicto
          ) {
            result = {
              titular_del_mes: String(parsed.titular_del_mes).trim(),
              destacada_del_mes: String(parsed.destacada_del_mes).trim(),
              habito_curioso: String(parsed.habito_curioso).trim(),
              veredicto: String(parsed.veredicto).trim(),
            };
            break;
          }
        }
      } catch (err) {
        console.warn(`Error llamando a modelo ${modelToTry} en monthly-wrapped:`, err);
      }
    }

    if (!result) {
      console.info("Usando generador fallback para Cine Wrapped mensual");
      result = generateFallbackMonthlyWrapped(monthName, year, stats);
    }

    // Save to cache
    monthlyWrappedCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en POST /api/ai/monthly-wrapped:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al generar el Cine Wrapped mensual." },
      { status: 500 }
    );
  }
}
