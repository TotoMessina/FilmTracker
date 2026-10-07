import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { searchMovies, getMovieDetails, getImageUrl, getBackdropUrl } from "@/lib/tmdb/client";
import { POPULAR_STREAMING_PLATFORMS } from "@/lib/services/streamingPlatforms";

export const dynamic = "force-dynamic";

interface GroupParticipantSummary {
  id: string;
  username: string;
  topGenres: string[];
  topRatedMovies: string[];
  streamingPlatforms?: number[];
}

interface WatchlistMatch {
  tmdb_id: number;
  title: string;
  addedBy: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      participants = [],
      sharedHighRatedGenres = [],
      watchlistMatches = [],
      excludedMovieTitles = [],
      excludedTmdbIds = [],
      commonPlatformIds = [],
    } = body;

    if (!Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json(
        { error: "Se necesitan al menos 2 participantes para encontrar qué ver juntos." },
        { status: 400 }
      );
    }

    const participantNames = participants.map((p: GroupParticipantSummary) => p.username);
    const excludedIdsSet = new Set<number>((excludedTmdbIds || []).map(Number));

    // Construct AI prompt
    const systemPrompt = `Eres un mediador cinéfilo y curador extraordinario de FilmTracker especializado en la herramienta "Qué Ver Juntos".
Tu misión es encontrar EXACTAMENTE 3 películas perfectas que generen un consenso absoluto entre un grupo de amigos cinéfilos.

REGLAS CRÍTICAS:
1. Ninguno de los miembros debe haber visto la película sugerida. NO sugieras ninguna película listada en películas excluidas.
2. Si hay películas en la "Lista de Watchlists coincidentes", dale prioridad a una o dos de ellas si encajan con las sensibilidades comunes.
3. Para cada recomendación, redacta una explicación de consenso humana, cálida y analítica, nombrando específicamente a los participantes por su nombre y explicando cómo conecta con el gusto o historial de cada uno (ejemplo: "Para ${participantNames[0]} y ${participantNames[1] || "tu amigo"}: combina el gusto de ${participantNames[0]} por el thriller psicológico con la preferencia de ${participantNames[1] || "tu amigo"} por relatos de alta tensión").
4. Asegúrate de que las películas sean reales y aclamadas.
5. Devuelve ÚNICAMENTE un objeto JSON válido con la estructura:
{
  "recommendations": [
    {
      "title": "Título en español o internacional",
      "originalTitle": "Original title",
      "year": 2019,
      "consensusReason": "Explicación personalizada citando a los participantes...",
      "keyAppeal": "Por qué es la opción perfecta para esta noche...",
      "genre": "Género principal"
    }
  ]
}`;

    const userPrompt = `GRUPO DE AMIGOS:
${participants
  .map(
    (p: GroupParticipantSummary) =>
      `• ${p.username}: Géneros favoritos: [${p.topGenres.join(", ")}]. Películas que mejor calificó: [${p.topRatedMovies.slice(0, 4).join(", ")}].`
  )
  .join("\n")}

GÉNEROS CON MEJOR PROMEDIO DE CALIFICACIÓN COMPARTIDO:
${sharedHighRatedGenres.length > 0 ? sharedHighRatedGenres.join(", ") : "Cine de autor, Thriller, Drama, Aventura"}

PELÍCULAS EN COMÚN EN SUS WATCHLISTS (Pendientes de ver por 2 o más miembros):
${
  watchlistMatches.length > 0
    ? watchlistMatches
        .slice(0, 6)
        .map((w: WatchlistMatch) => `- "${w.title}" (deseada por: ${w.addedBy.join(", ")})`)
        .join("\n")
    : "Sin coincidencias directas en Watchlist."
}

PELÍCULAS EXCLUIDAS (YA VISTAS POR AL MENOS UNO - PROHIBIDO REPETIR):
${excludedMovieTitles.slice(0, 30).join(", ") || "Ninguna"}

Por favor, devuélveme las 3 películas de consenso ideales en formato JSON estricto.`;

    let rawOutput = "";
    try {
      const response = await groq.chat.completions.create({
        model: GROQ_MODEL_LARGE,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.65,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      rawOutput = response.choices[0]?.message?.content || "";
    } catch (groqErr) {
      console.warn("Groq request failed, using intelligent fallback consensus:", groqErr);
    }

    interface AIRec {
      title: string;
      originalTitle?: string;
      year?: number;
      consensusReason: string;
      keyAppeal?: string;
      genre?: string;
    }

    let parsedList: AIRec[] = [];

    if (rawOutput) {
      try {
        const parsed = JSON.parse(rawOutput);
        if (Array.isArray(parsed.recommendations)) {
          parsedList = parsed.recommendations;
        } else if (Array.isArray(parsed)) {
          parsedList = parsed;
        }
      } catch (err) {
        console.warn("Error parsing Groq JSON:", err);
      }
    }

    // Fallback if AI was unavailable or returned empty
    if (parsedList.length === 0) {
      // Prioritize watchlist candidates if available
      if (watchlistMatches.length > 0) {
        watchlistMatches.slice(0, 3).forEach((w: WatchlistMatch) => {
          parsedList.push({
            title: w.title,
            consensusReason: `Para ${participantNames.join(" y ")}: Coincide exactamente en las listas de pendientes que ambos tenían guardadas.`,
            keyAppeal: "Un título que ambos deseaban ver hace tiempo.",
          });
        });
      }

      // Fill up to 3 with acclaimed cinema gems
      const defaultGems = [
        {
          title: "Prisoners",
          year: 2013,
          consensusReason: `Para ${participantNames.join(" y ")}: La dirección quirúrgica de Denis Villeneuve equilibra la intriga moral y el ritmo absorbente para mantener a todos al borde del asiento.`,
          keyAppeal: "Un thriller psicológico absorbente de primer nivel.",
        },
        {
          title: "Knives Out",
          year: 2019,
          consensusReason: `Para ${participantNames.join(" y ")}: Un misterio 'whodunit' ingenioso, divertido y ágil que funciona como consenso unánime sin fisuras.`,
          keyAppeal: "Intriga inteligente, humor ácido y un elenco estelar.",
        },
        {
          title: "Drive My Car",
          year: 2021,
          consensusReason: `Para ${participantNames.join(" y ")}: Una experiencia cinematográfica profunda que conecta con el aprecio mutuo por grandes actuaciones y dirección emotiva.`,
          keyAppeal: "Poesía visual y una narrativa madura de gran calado.",
        },
      ];

      for (const gem of defaultGems) {
        if (parsedList.length < 3) {
          parsedList.push(gem);
        }
      }
    }

    // Now validate and enrich with real TMDB details and streaming providers
    const enrichedResults = [];

    for (const rec of parsedList.slice(0, 4)) {
      if (enrichedResults.length >= 3) break;

      try {
        const searchRes = await searchMovies(rec.title);
        const candidate = searchRes.results?.find((m) => !excludedIdsSet.has(m.id)) || searchRes.results?.[0];

        if (candidate && !excludedIdsSet.has(candidate.id)) {
          // Fetch full movie details to get watch/providers
          let movieDetail = null;
          try {
            movieDetail = await getMovieDetails(candidate.id);
          } catch {
            movieDetail = null;
          }

          // Extract streaming platforms for Latin America / Spain / US
          const watchProviders = (movieDetail as any)?.["watch/providers"]?.results;
          const detectedPlatformIds = new Set<number>();

          if (watchProviders) {
            // Check common regions: AR, MX, ES, US
            ["AR", "MX", "ES", "US"].forEach((region) => {
              const regionData = watchProviders[region];
              if (regionData && Array.isArray(regionData.flatrate)) {
                regionData.flatrate.forEach((prov: any) => {
                  detectedPlatformIds.add(prov.provider_id);
                });
              }
            });
          }

          // Filter platforms that are in commonPlatformIds or popular
          const commonPlatforms = POPULAR_STREAMING_PLATFORMS.filter((plat) => {
            const isMovieOnPlatform = detectedPlatformIds.has(plat.id);
            const isGroupHasPlatform =
              commonPlatformIds.length === 0 || commonPlatformIds.includes(plat.id);
            return isMovieOnPlatform && isGroupHasPlatform;
          });

          // All available platforms for this movie
          const availablePlatforms = POPULAR_STREAMING_PLATFORMS.filter((plat) =>
            detectedPlatformIds.has(plat.id)
          );

          enrichedResults.push({
            tmdb_id: candidate.id,
            title: candidate.title,
            original_title: candidate.original_title,
            release_date: candidate.release_date,
            year: candidate.release_date ? parseInt(candidate.release_date.split("-")[0], 10) : rec.year,
            overview: candidate.overview || movieDetail?.overview || "",
            vote_average: candidate.vote_average || 0,
            poster_path: candidate.poster_path,
            backdrop_path: candidate.backdrop_path,
            consensusReason: rec.consensusReason,
            keyAppeal: rec.keyAppeal,
            genre: rec.genre,
            commonPlatforms,
            availablePlatforms,
          });
        }
      } catch (err) {
        console.warn(`Error resolving movie details for "${rec.title}":`, err);
      }
    }

    return NextResponse.json({
      recommendations: enrichedResults,
      participants: participantNames,
      sharedGenres: sharedHighRatedGenres,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/recommend-group:", error);
    return NextResponse.json(
      { error: error?.message || "Error procesando las recomendaciones de consenso." },
      { status: 500 }
    );
  }
}
