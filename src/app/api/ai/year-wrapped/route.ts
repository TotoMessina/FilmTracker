import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";

export const dynamic = "force-dynamic";

interface CacheEntry {
  wrapped: string;
  timestamp: number;
}

// 7-day in-memory server cache
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const wrappedCache = new Map<string, CacheEntry>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year = new Date().getFullYear(), stats } = body;

    if (!stats || typeof stats !== "object") {
      return NextResponse.json(
        { error: "Se requieren estadísticas válidas para generar el Cine Wrapped." },
        { status: 400 }
      );
    }

    const {
      totalWatched = 0,
      totalHours = 0,
      bestMonth = "Octubre",
      topGenres = [],
      topActors = [],
      bestRated = [],
      worstRated = [],
      rewatches = [],
      platformBreakdown = {},
      countriesWatched = 0,
      cinemaVisits = 0,
      avgRating = 0,
    } = stats;

    // Cache key based on year, movie count, and top indicators
    const cacheKey = JSON.stringify({
      year,
      totalWatched,
      totalHours,
      avgRating: Number(avgRating).toFixed(1),
      topGenres: topGenres.slice(0, 3),
      bestMovie: bestRated[0]?.title || "",
      worstMovie: worstRated[0]?.title || "",
    });

    const cached = wrappedCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { wrapped: cached.wrapped },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
            "X-Cache": "HIT",
          },
        }
      );
    }

    const systemPrompt =
      "Eres el narrador del 'Cine Wrapped' anual de FilmTracker, similar al Spotify Wrapped pero para cine. Eres un narrador brillante que convierte estadísticas frías en una historia personal épica. Tu tono es celebratorio, cálido, a veces sorprendido. Usas los datos reales para crear momentos de reconocimiento. Hablas en segunda persona, directamente al usuario, en español latinoamericano. El análisis es el regalo de fin de año del usuario: hacelo memorable.";

    const platformText = Object.entries(platformBreakdown)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const bestRatedText = (bestRated as Array<{ title: string; rating: number }>)
      .slice(0, 5)
      .map((m) => `"${m.title}" (${m.rating}★)`)
      .join(", ");

    const worstRatedText = (worstRated as Array<{ title: string; rating: number }>)
      .slice(0, 3)
      .map((m) => `"${m.title}" (${m.rating}★)`)
      .join(", ");

    const userPrompt = `Aquí están las estadísticas cinematográficas del usuario para el año ${year}:

- Películas vistas este año: ${totalWatched}
- Horas totales frente a la pantalla: ${totalHours} horas
- Mes con mayor actividad cinéfila: ${bestMonth}
- Géneros favoritos: ${topGenres.length > 0 ? topGenres.join(", ") : "Variado"}
- Actores/Actrices que más viste: ${topActors.length > 0 ? topActors.join(", ") : "Diversos"}
- Películas mejor calificadas: ${bestRatedText || "No registradas"}
- Películas peor calificadas / decepciones: ${worstRatedText || "Ninguna especialmente baja"}
- Películas repetidas (rewatches): ${rewatches.length > 0 ? rewatches.slice(0, 4).join(", ") : "Ninguna repetición"}
- Desglose por plataformas: ${platformText || "No especificado"}
- Visitas a salas de cine tradicional: ${cinemaVisits}
- Países cinematográficos explorados: ${countriesWatched}
- Calificación promedio del año: ${avgRating} / 10

Genera el Cine Wrapped anual estructurado exactamente con estas 7 secciones en formato Markdown usando títulos '##':

## APERTURA
(Una frase épica, poética e impactante que resuma este año cinéfilo)

## TU AÑO EN CIFRAS
(Un párrafo narrativo vibrante conectando las horas dedicadas, las películas vistas y tu mes más cinéfilo)

## TU GÉNERO DEL ALMA
(Reflexión sobre tu género predilecto, por qué te definió este año y cómo alimentó tu espíritu)

## MOMENTO CUMBRE
(Homenaje a tu mejor película puntuada del año, por qué mereció tu devoción y qué la hizo inolvidable)

## EL TROPIEZO
(Tu película peor puntuada con humor gentil, ironía cariñosa y sin remordimientos)

## PERSONALIDAD CINÉFILA
(Asigna un título creativo y rimbombante a su personalidad cinéfila de este año, ej: "El Arqueólogo del Streaming", "El Devorador de Festivales", "El Romántico Incorregible", etc., con una justificación ingeniosa)

## CIERRE
(Mensaje motivacional cálido de despedida para el año siguiente y un brindis por las historias que vendrán)`;

    let wrappedText = "";

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 2048,
      });

      wrappedText = completion.choices[0]?.message?.content?.trim() || "";
    } catch (groqErr) {
      console.warn("Groq API error en /api/ai/year-wrapped, activando redacción local:", groqErr);
    }

    // High quality fallback if Groq failed
    if (!wrappedText) {
      const topGenre = topGenres[0] || "Cine de Autor";
      const topMovie = bestRated[0]?.title || "tu obra maestra del año";
      const worstMovie = worstRated[0]?.title || "aquel desliz olvidable";

      wrappedText = `## APERTURA
En ${year}, el cine no fue un simple pasatiempo para vos: fue el mapa emocional con el que navegaste cada mes.

## TU AÑO EN CIFRAS
Dedicaste ${totalHours} horas frente a la gran y pequeña pantalla, sumando ${totalWatched} títulos a tu bitácora personal. En ${bestMonth} tu apetito cinéfilo alcanzó su punto más volcánico, demostrando que cuando una buena historia te atrapa, el tiempo se detiene por completo.

## TU GÉNERO DEL ALMA
${topGenre} fue tu refugio indiscutido. Volviste una y otra vez a sus códigos, su atmósfera y sus emociones, confirmando qué historias resuenan de verdad con tu pulso vital.

## MOMENTO CUMBRE
Tu corona del año se la llevó "${topMovie}". Una experiencia que no solo justificó cada minuto invertido, sino que te recordó exactamente por qué amamos el séptimo arte con tanta intensidad.

## EL TROPIEZO
No todo podía ser una obra maestra: "${worstMovie}" fue ese tropiezo con el que el destino puso a prueba tu paciencia. Pero un verdadero cinéfilo sabe que hasta los fiascos tienen su encanto para la sobremesa.

## PERSONALIDAD CINÉFILA
**El Explorador Insaciable del Séptimo Arte**: Tu promedio de ${avgRating}★ revela un criterio exigente pero apasionado, alguien que no consume películas por inercia sino que busca activamente que cada fotograma valga la pena.

## CIERRE
Por otros 365 días de salas a oscuras, créditos finales que erizan la piel y debates apasionados. ¡Que el próximo año el proyector nunca se apague!`;
    }

    // Save to 7-day cache
    wrappedCache.set(cacheKey, {
      wrapped: wrappedText,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      { wrapped: wrappedText },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error: any) {
    console.error("Error en /api/ai/year-wrapped:", error);
    return NextResponse.json(
      { error: "Error interno al generar el Cine Wrapped." },
      { status: 500 }
    );
  }
}
