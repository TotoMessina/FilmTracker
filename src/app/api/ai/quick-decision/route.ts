import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { QuickDecisionRequest, QuickDecisionResponse } from "@/lib/groq/types";
import { searchMovies, getMovieDetails, STREAMING_PROVIDERS } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

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

const CURATED_QUICK_PICKS = [
  {
    movieTitle: "Palm Springs",
    year: 2020,
    mood: "Quiero desconectar",
    reason: "Una comedia romántica con bucle temporal ingeniosa, ligera y adictiva que te saca sonrisas inmediatas sin requerir esfuerzo mental.",
    vibe: "Comedia fresca e inteligente",
    recommendedPlatform: "Prime Video",
  },
  {
    movieTitle: "Mad Max: Fury Road",
    year: 2015,
    mood: "Busco adrenalina",
    reason: "Pura energía cinética cinematográfica con dos horas de persecución implacable, diseño sonoro ensordecedor y acción visual insuperable.",
    vibe: "Adrenalina pura",
    recommendedPlatform: "Max",
  },
  {
    movieTitle: "Arrival",
    year: 2016,
    mood: "Quiero algo que me haga pensar",
    reason: "Una joya de ciencia ficción poética y reflexiva sobre el lenguaje y el tiempo que te dejará procesando su desenlace durante días.",
    vibe: "Misterio cerebral y poético",
    recommendedPlatform: "Netflix",
  },
  {
    movieTitle: "About Time",
    year: 2013,
    mood: "Quiero emocionarme/llorar",
    reason: "Un relato conmovedor sobre la familia, el amor y la fragilidad del tiempo que te tocará las fibras más sensibles y te dejará con ganas de abrazar a tus seres queridos.",
    vibe: "Catarsis emocional y calidez",
    recommendedPlatform: "Prime Video",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body: QuickDecisionRequest = await req.json().catch(() => ({
      mood: "Quiero desconectar",
      duration: "Estándar ~2 horas",
      company: "Solo/a",
    }));

    const mood = body.mood || "Quiero desconectar";
    const duration = body.duration || "Estándar ~2 horas";
    const company = body.company || "Solo/a";

    // Format platforms
    let platformsList: string[] = [];
    if (Array.isArray(body.platforms)) {
      platformsList = body.platforms.map((p) => {
        if (typeof p === "number") {
          return STREAMING_PROVIDERS.find((sp) => sp.id === p)?.name || String(p);
        }
        return String(p);
      });
    }

    const platformsStr = platformsList.length > 0 ? platformsList.join(", ") : "";

    const systemPrompt = `Eres el decisor cinematográfico definitivo. Tu misión es erradicar la parálisis por elección.
Recomienda EXACTAMENTE UNA SOLA película extraordinaria que encaje como un guante con las necesidades del espectador.
Sé asertivo, apasionado y directo.`;

    const userPrompt = `El usuario necesita decidir QUÉ VER YA con estos parámetros:
1. Estado de ánimo: "${mood}"
2. Tiempo disponible: "${duration}"
3. Compañía: "${company}"
${platformsStr ? `4. Plataformas de streaming activas del usuario: "${platformsStr}"` : ""}

Selecciona EXACTAMENTE UNA SOLA película ganadora indiscutible (preferentemente disponible en sus plataformas de streaming o de fácil acceso).
Responde ÚNICAMENTE con este JSON:
{
  "movieTitle": "Título oficial de la película",
  "year": 2019,
  "reason": "Explicación contundente de 2 oraciones de por qué esta y solo esta es la película perfecta para este momento",
  "vibe": "Tono de la película (ej: Adrenalina frenética, Risa catártica, Misterio hipnótico)",
  "recommendedPlatform": "Nombre de la plataforma principal (ej: Netflix, Max, Prime Video, Disney+)"
}`;

    let aiSelection: any = null;
    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          temperature: 0.6,
          max_tokens: 2000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const rawContent = completion.choices[0]?.message?.content || "";
        if (rawContent) {
          const parsed = cleanAndParseJSON(rawContent);
          if (parsed && parsed.movieTitle) {
            aiSelection = parsed;
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Quick Decision] Intento fallido con modelo ${modelToTry}:`, err?.message || err);
      }
    }

    if (!aiSelection) {
      // Pick matching fallback
      const fallback =
        CURATED_QUICK_PICKS.find((p) => p.mood === mood) || CURATED_QUICK_PICKS[0];
      aiSelection = fallback;
    }

    // Enrich with TMDB
    let tmdbMovieId: number | null = null;
    let posterPath: string | null = null;
    let backdropPath: string | null = null;
    let overview: string = "";
    let runtime: number = 110;
    let voteAverage: number = 8.0;
    let trailerUrl: string | null = null;
    let streamingProviders: Array<{ provider_id: number; provider_name: string; logo_path: string }> = [];

    try {
      const searchRes = await searchMovies(aiSelection.movieTitle, 1);
      if (searchRes?.results && searchRes.results.length > 0) {
        const match = searchRes.results[0];
        tmdbMovieId = match.id;

        // Fetch full movie details with videos and watch providers
        const details = await getMovieDetails(match.id);
        if (details) {
          posterPath = details.poster_path;
          backdropPath = details.backdrop_path;
          overview = details.overview || match.overview;
          runtime = details.runtime || 110;
          voteAverage = details.vote_average ? Number(details.vote_average.toFixed(1)) : 7.8;

          // Find YouTube trailer
          const videos = details.videos?.results || [];
          const trailer =
            videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
            videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
            videos.find((v) => v.site === "YouTube");

          if (trailer?.key) {
            trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          }

          // Flatrate providers in MX, ES, US or AR
          const wpResults = details["watch/providers"]?.results;
          const flatrate =
            wpResults?.MX?.flatrate ||
            wpResults?.ES?.flatrate ||
            wpResults?.AR?.flatrate ||
            wpResults?.US?.flatrate ||
            [];

          if (Array.isArray(flatrate)) {
            streamingProviders = flatrate.map((fp) => ({
              provider_id: fp.provider_id,
              provider_name: fp.provider_name,
              logo_path: fp.logo_path,
            }));
          }
        }
      }
    } catch (tmdbErr) {
      console.warn("[Quick Decision] Error al enriquecer con TMDB:", tmdbErr);
    }

    const response: QuickDecisionResponse = {
      movieTitle: aiSelection.movieTitle,
      year: Number(aiSelection.year) || 2020,
      reason: aiSelection.reason || "La elección definitiva para tu momento de hoy.",
      vibe: aiSelection.vibe || "Cine de autor y entretenimiento de alto nivel",
      recommendedPlatform: aiSelection.recommendedPlatform,
      tmdb_id: tmdbMovieId || 550,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      overview: overview || "Una historia inolvidable seleccionada por FilmTracker.",
      runtime,
      vote_average: voteAverage,
      trailerUrl,
      providers: streamingProviders,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/ai/quick-decision:", error);
    return NextResponse.json(
      {
        movieTitle: "Palm Springs",
        year: 2020,
        reason: "Una comedia romántica ingeniosa y perfecta para desconectar y pasar un gran momento sin complicaciones.",
        vibe: "Comedia fresca",
        recommendedPlatform: "Prime Video",
        tmdb_id: 587792,
        poster_path: "/1q8q7e6PGv1kP99990.jpg",
        backdrop_path: null,
        overview: "Dos invitados a una boda se quedan atrapados en un bucle temporal.",
        runtime: 90,
        vote_average: 7.4,
        providers: [],
      },
      { status: 200 }
    );
  }
}
