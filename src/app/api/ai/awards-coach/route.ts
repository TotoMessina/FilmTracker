import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { AIAwardsCoach } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

interface CacheEntry {
  data: AIAwardsCoach;
  timestamp: number;
}

// 6-hour server cache for awards coach responses
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const coachCache = new Map<string, CacheEntry>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      awardsName = "Temporada de Premios Oscars",
      categories = [],
      progressPercent = 0,
      watchlist = [],
    } = body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un listado de categorías para analizar la temporada." },
        { status: 400 }
      );
    }

    // Extract unwatched & watched nominees
    const allNomineesMap = new Map<string, { title: string; count: number; watched: boolean }>();
    categories.forEach((cat: any) => {
      (cat.nominees || []).forEach((n: any) => {
        const title = (n.title || "").trim();
        if (!title) return;
        const existing = allNomineesMap.get(title);
        if (existing) {
          existing.count += 1;
          if (n.watched) existing.watched = true;
        } else {
          allNomineesMap.set(title, {
            title,
            count: 1,
            watched: Boolean(n.watched),
          });
        }
      });
    });

    const watchedTitles = Array.from(allNomineesMap.values())
      .filter((n) => n.watched)
      .map((n) => n.title)
      .sort();

    const unwatchedNominees = Array.from(allNomineesMap.values())
      .filter((n) => !n.watched)
      .sort((a, b) => b.count - a.count);

    // Build Cache Key based on inputs
    const cacheKey = JSON.stringify({
      awardsName,
      progressPercent: Math.round(Number(progressPercent) || 0),
      watchedTitles,
      watchlistSample: Array.isArray(watchlist) ? watchlist.slice(0, 10).sort() : [],
    });

    // Check 6-hour cache
    const cached = coachCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
          "X-Cache": "HIT",
        },
      });
    }

    // Prepare prompt
    const systemPrompt =
      "Eres un experto en temporadas de premios cinematográficos: Oscars, BAFTA, Globos de Oro. Conoces la historia de los premios, las campañas, los favoritos y las sorpresas históricas. Ayudas al usuario a prepararse para la ceremonia con estrategia y contexto. Hablas en español latinoamericano con autoridad y entusiasmo cinéfilo.";

    const categoriesPromptText = categories
      .map((cat: any) => {
        const nomList = (cat.nominees || [])
          .map((n: any) => `  - ${n.title} ${n.watched ? "[VISTA]" : "[PENDIENTE]"}`)
          .join("\n");
        return `* Categoría: ${cat.name}\n${nomList}`;
      })
      .join("\n\n");

    const userPrompt = `Analiza la temporada "${awardsName}" y el progreso de este cinéfilo para darle una estrategia ganadora.

PROGRESO DEL USUARIO:
- Progreso de películas vistas: ${progressPercent}%
- Total de títulos de la temporada ya vistos: ${watchedTitles.length}
${watchedTitles.length > 0 ? `- Títulos vistos: ${watchedTitles.join(", ")}` : "- Aún no ha marcado películas como vistas en esta edición."}
${
  Array.isArray(watchlist) && watchlist.length > 0
    ? `- Títulos actualmente en su Watchlist personal: ${watchlist.slice(0, 15).join(", ")}`
    : "- Su watchlist no tiene títulos registrados."
}

CATEGORÍAS Y NOMINADOS:
${categoriesPromptText}

INSTRUCCIONES DE RESPUESTA:
1. "strategy": Top 3 películas a ver primero para maximizar cobertura y entender la conversación cinéfila.
   - Si tiene películas pendientes, elige las 3 más estratégicas no vistas aún.
   - Para cada una incluye:
     * "title": título exacto de la película
     * "reason": motivo estratégico contundente (por qué conviene verla ya, momentum de campaña, peso crítico)
     * "categories_covered": número entero de categorías en las que compite esa película dentro de esta edición.
2. "personal_prediction":
   - "title": la película que en tu criterio experto realmente merece ganar Mejor Película este año.
   - "reasoning": análisis apasionado y fundamentado de por qué destaca cinematográficamente sobre las demás.
3. "fun_fact":
   - "about": nominado, director, actor o película específica.
   - "fact": un dato curioso, anécdota de rodaje o récord histórico fascinante sobre esa nominación.
4. "goal_assessment":
   - "achievable": boolean (true si con su progreso actual es realista llegar al 100% o completar las categorías clave antes de la ceremonia; false si tiene poco tiempo y debe concentrarse solo en las categorías principales).
   - "tip": consejo accionable y motivador para alcanzar su meta cinéfila sin saturarse.

Responde ÚNICAMENTE con un objeto JSON con este formato exacto:
{
  "strategy": [
    {
      "title": "Nombre de Película",
      "reason": "Explicación estratégica...",
      "categories_covered": 4
    }
  ],
  "personal_prediction": {
    "title": "Nombre de Película Favorita",
    "reasoning": "Por qué merece ganar Mejor Película..."
  },
  "fun_fact": {
    "about": "Nombre del nominado o filme",
    "fact": "Dato curioso o histórico..."
  },
  "goal_assessment": {
    "achievable": true,
    "tip": "Consejo de ritmo y planificación..."
  }
}`;

    let parsedResult: AIAwardsCoach | null = null;

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        temperature: 0.5,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = completion.choices[0]?.message?.content;
      if (rawContent) {
        const parsed = JSON.parse(rawContent);
        if (parsed?.strategy && parsed?.personal_prediction && parsed?.fun_fact && parsed?.goal_assessment) {
          parsedResult = {
            strategy: (parsed.strategy || []).slice(0, 3).map((item: any) => ({
              title: String(item.title || "Película nominada"),
              reason: String(item.reason || "Candidata clave en la temporada."),
              categories_covered: Number(item.categories_covered) || 1,
            })),
            personal_prediction: {
              title: String(parsed.personal_prediction.title || "Película destacada"),
              reasoning: String(
                parsed.personal_prediction.reasoning ||
                  parsed.personal_prediction.reason ||
                  "Gran favorita de la crítica."
              ),
            },
            fun_fact: {
              about: String(parsed.fun_fact.about || "Nominados"),
              fact: String(parsed.fun_fact.fact || parsed.fun_fact.text || "Dato histórico de los premios."),
            },
            goal_assessment: {
              achievable: Boolean(parsed.goal_assessment.achievable ?? true),
              tip: String(
                parsed.goal_assessment.tip ||
                  parsed.goal_assessment.advice ||
                  "Prioriza las películas de Mejor Película y Dirección."
              ),
            },
          };
        }
      }
    } catch (groqErr) {
      console.warn("Groq API error en /api/ai/awards-coach, activando fallback local:", groqErr);
    }

    // Smart Fallback if Groq was unavailable or produced invalid JSON
    if (!parsedResult) {
      const topCandidates = (unwatchedNominees.length > 0 ? unwatchedNominees : Array.from(allNomineesMap.values()))
        .slice(0, 3);

      parsedResult = {
        strategy: topCandidates.map((c) => ({
          title: c.title,
          reason: `Compitiendo con fuerza en ${c.count} ${c.count === 1 ? "categoría crucial" : "categorías cruciales"}, verla te dará un panorama directo de la contienda.`,
          categories_covered: c.count,
        })),
        personal_prediction: {
          title: topCandidates[0]?.title || categories[0]?.nominees?.[0]?.title || "Película Favorita",
          reasoning:
            "Destaca por su ritmo arrollador, guion original incisivo y un consenso crítico unánime que suele enamorar a los votantes de la Academia.",
        },
        fun_fact: {
          about: topCandidates[0]?.title || categories[0]?.nominees?.[0]?.title || "La temporada",
          fact: "Las películas con nominaciones simultáneas en Dirección, Guion y Edición han ganado Mejor Película en más del 80% de las últimas dos décadas.",
        },
        goal_assessment: {
          achievable: progressPercent >= 30,
          tip:
            progressPercent >= 50
              ? "¡Vas con excelente ritmo! Viendo 2 películas por semana llegarás al 100% antes de la gala."
              : "Concéntrate primero en las nominadas a Mejor Película; con eso cubrirás más del 70% de la emoción de la gala.",
        },
      };
    }

    // Save to 6-hour cache
    coachCache.set(cacheKey, {
      data: parsedResult,
      timestamp: Date.now(),
    });

    return NextResponse.json(parsedResult, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Error en POST /api/ai/awards-coach:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error al procesar la asesoría de premios con IA." },
      { status: 500 }
    );
  }
}
