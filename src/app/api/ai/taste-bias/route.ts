import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { TasteBiasStats, TasteBiasResponse } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

interface CacheEntry {
  data: TasteBiasResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const tasteBiasCache = new Map<string, CacheEntry>();

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

function generateFallbackTasteBias(stats: TasteBiasStats): TasteBiasResponse {
  const genres = Object.entries(stats.genreAverages || {});
  const decades = Object.entries(stats.decadeAverages || {});
  const runtimes = Object.entries(stats.runtimeAverages || {});

  // Sort genres
  genres.sort((a, b) => b[1] - a[1]);
  const topGenre = genres[0] || ["Cine en general", 8];
  const lowGenre = genres[genres.length - 1] || ["Dramas experimentales", 5];

  // Sort decades
  decades.sort((a, b) => b[1] - a[1]);
  const topDecade = decades[0] || ["2010s", 7.5];
  const lowDecade = decades[decades.length - 1] || ["2020s", 6.0];

  // Long runtime check
  const longFilmsAvg = stats.runtimeAverages?.["> 120 min"] || 7.5;
  const shortFilmsAvg = stats.runtimeAverages?.["< 90 min"] || 6.5;

  return {
    diagnosis: `Presentás un cuadro clínico fascinante: pretendés ser un cinéfilo riguroso y sobrio de festival, pero ante ${topGenre[0]} bajás todas tus defensas críticas con un generoso ${topGenre[1]}★ de promedio. Sos de los que justifican dos horas de explosiones alegando "valor estético y ritmo".`,
    overvalued_genre: {
      genre: topGenre[0],
      comment: `Tenés una indulgencia descarada con ${topGenre[0]} (promedio de ${topGenre[1]}★). Te basta una premisa ingeniosa o un póster bonito para regalar calificaciones de obra maestra.`,
    },
    harsh_criticism: {
      target: lowGenre[0] !== topGenre[0] ? lowGenre[0] : `Estrenos de los ${lowDecade[0]}`,
      comment: `Con ${lowGenre[0]} no perdonás un tropiezo narrativo (promedio implacable de ${lowGenre[1]}★). Si no te deslumbra en los primeros quince minutos, tu veredicto desciende sin piedad.`,
    },
    guilty_pleasure_pattern: longFilmsAvg > shortFilmsAvg + 1
      ? `Asociás duración con prestigio: si una película supera las dos horas le sumás un punto automático por pura resistencia de butaca.`
      : `Sospechosa predilección por películas de ${topDecade[0]}: la nostalgia nubla tu juicio analítico más de lo que te animás a admitir en una charla de café.`,
    advice: `Dejá de exigirle a cada película que redefina el lenguaje cinematográfico para darle un 7. Y sobre todo: aceptá públicamente tu debilidad por ${topGenre[0]} sin buscar justificaciones académicas deconstruidas.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stats: TasteBiasStats = body?.stats;

    if (!stats || typeof stats !== "object") {
      return NextResponse.json(
        { error: "Se requiere el objeto 'stats' con genreAverages, decadeAverages, runtimeAverages y totalLogs." },
        { status: 400 }
      );
    }

    const genreEntries = Object.entries(stats.genreAverages || {});
    const decadeEntries = Object.entries(stats.decadeAverages || {});
    const runtimeEntries = Object.entries(stats.runtimeAverages || {});

    // Cache key based on input stats
    const cacheKey = JSON.stringify({
      total: stats.totalLogs || 0,
      genres: genreEntries.sort(),
      decades: decadeEntries.sort(),
      runtimes: runtimeEntries.sort(),
    });

    const cached = tasteBiasCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
          "X-Cache": "HIT",
        },
      });
    }

    const systemPrompt = `Eres un crítico de cine ingenioso, observador y con humor sutil. Analizas las estadísticas de calificaciones de un cinéfilo para revelar sus contradicciones, sesgos y placeres culposos con ironía afectuosa.`;

    const statsSummary = [
      `Total de películas analizadas en su diario: ${stats.totalLogs || 0}`,
      genreEntries.length > 0
        ? `Promedios por género:\n${genreEntries.map(([g, avg]) => `  - ${g}: ${avg}/10`).join("\n")}`
        : "Sin datos específicos de géneros.",
      decadeEntries.length > 0
        ? `Promedios por década de estreno:\n${decadeEntries.map(([d, avg]) => `  - Década ${d}: ${avg}/10`).join("\n")}`
        : "Sin datos específicos de décadas.",
      runtimeEntries.length > 0
        ? `Promedios por duración de metraje:\n${runtimeEntries.map(([r, avg]) => `  - Duración ${r}: ${avg}/10`).join("\n")}`
        : "Sin datos específicos de duración.",
    ].join("\n\n");

    const userPrompt = `A continuación tienes las estadísticas de calificaciones del usuario:

${statsSummary}

Analiza sus sesgos, patrones contradictorios y gustos culposos.
Devuelve EXACTAMENTE un objeto JSON con la siguiente estructura:
{
  "diagnosis": "Diagnóstico general ingenioso, divertido y afectuoso sobre su personalidad cinéfila (1 a 2 párrafos concisos)",
  "overvalued_genre": {
    "genre": "Nombre del género o subgénero que más sobrevalora / infla de nota",
    "comment": "Comentario mordaz y divertido sobre por qué le regala nota tan fácilmente a este género"
  },
  "harsh_criticism": {
    "target": "Género, década o formato con el que es implacable y no perdona nada",
    "comment": "Comentario con humor sobre su falta de piedad ante este tipo de obras"
  },
  "guilty_pleasure_pattern": "Un patrón revelador o placer culposo descubierto en los números (ej. adicción a duraciones cortas, devoción ciega a una década específica, o fobia a las películas largas)",
  "advice": "Un consejo final sarcástico pero lleno de amor por el cine para 'curar' o abrazar sus sesgos"
}

Reglas estrictas:
1. Responde ÚNICAMENTE con el objeto JSON válido.
2. Sé específico con los números y categorías provistos en sus estadísticas.
3. El humor debe ser sutil, irónico y empático (roast cinéfilo amistoso).`;

    let result: TasteBiasResponse | null = null;
    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 900,
          response_format: { type: "json_object" },
        });

        const raw = completion.choices[0]?.message?.content?.trim() || "";
        if (raw) {
          const parsed = cleanAndParseJSON(raw);
          if (
            parsed.diagnosis &&
            parsed.overvalued_genre?.genre &&
            parsed.overvalued_genre?.comment &&
            parsed.harsh_criticism?.target &&
            parsed.harsh_criticism?.comment &&
            parsed.guilty_pleasure_pattern &&
            parsed.advice
          ) {
            result = {
              diagnosis: String(parsed.diagnosis).trim(),
              overvalued_genre: {
                genre: String(parsed.overvalued_genre.genre).trim(),
                comment: String(parsed.overvalued_genre.comment).trim(),
              },
              harsh_criticism: {
                target: String(parsed.harsh_criticism.target).trim(),
                comment: String(parsed.harsh_criticism.comment).trim(),
              },
              guilty_pleasure_pattern: String(parsed.guilty_pleasure_pattern).trim(),
              advice: String(parsed.advice).trim(),
            };
            break;
          }
        }
      } catch (err) {
        console.warn(`[TasteBias] Error con modelo ${modelToTry}:`, err);
      }
    }

    if (!result) {
      console.info("[TasteBias] Usando generador inteligente fallback para análisis de sesgos");
      result = generateFallbackTasteBias(stats);
    }

    tasteBiasCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("[TasteBias] Error general:", error);
    return NextResponse.json(
      { error: "Error procesando el análisis de sesgos cinéfilos." },
      { status: 500 }
    );
  }
}
