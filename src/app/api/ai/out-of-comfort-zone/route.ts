import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { OutOfComfortZoneResponse } from "@/lib/groq/types";
import { searchMovies, MOVIE_GENRES } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  // Strip reasoning / think tags if model produced them
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip code fences
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

// Curated fallbacks in case of Groq outage or rate limits
const CURATED_COMFORT_BRIDGES = [
  {
    movieTitle: "12 Angry Men",
    year: 1957,
    unexploredGenre: "Cine Clásico / Drama Judicial",
    bridgeExplanation: "Si te fascinó el suspenso meticuloso y la paranoia psicológica de Zodiac, deberías ver 12 Angry Men (1957) porque condensa toda la tensión detectivesca en una sola habitación asfixiante donde cada argumento desmonta la certeza humana.",
    whyItWorks: "Elimina la barrera del blanco y negro en menos de diez minutos gracias a un ritmo implacable, diálogos afilados y actuaciones legendarias que superan a la gran mayoría de thrillers modernos.",
  },
  {
    movieTitle: "Unforgiven",
    year: 1992,
    unexploredGenre: "Western",
    bridgeExplanation: "Si te atraen los dilemas morales oscuros y la brutalidad de Sicario o No Country for Old Men, deberías ver Los Imperdonables (1992) porque deconstruye por completo el mito heroico con un retrato implacable de la violencia y sus secuelas.",
    whyItWorks: "No es una fantasía de vaqueros y duelos superficiales, sino una tragedia crepuscular con tensión narrativa asfixiante y actuaciones descomunales que atrapan a cualquier amante del cine sombrío.",
  },
  {
    movieTitle: "Spirited Away",
    year: 2001,
    unexploredGenre: "Animación",
    bridgeExplanation: "Si te cautivó la atmósfera envolvente y el misterio fascinante de El Laberinto del Fauno o Blade Runner, deberías ver El Viaje de Chihiro (2001) porque ofrece una inmersión visual y mitológica con una madurez poética que desafía cualquier prejuicio sobre los dibujos animados.",
    whyItWorks: "El nivel de detalle artesanal, el simbolismo social y la prodigiosa banda sonora de Joe Hisaishi la convierten en una obra de arte universal imposible de ignorar.",
  },
  {
    movieTitle: "Sunset Boulevard",
    year: 1950,
    unexploredGenre: "Cine Negro / Clásico",
    bridgeExplanation: "Si disfrutaste la acidez satírica y el descenso a la obsesión de Parasite o Nightcrawler, deberías ver Sunset Boulevard (1950) porque es una radiografía brutal, cínica y adictiva de la locura por la fama en Hollywood.",
    whyItWorks: "Su humor negro corrosivo y su atmósfera gótica moderna se sienten tan actuales hoy como hace siete décadas.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let favoriteMovies: string[] = Array.isArray(body?.favoriteMovies)
      ? body.favoriteMovies.filter((m: any) => typeof m === "string" && m.trim().length > 0)
      : [];
    let unexploredGenres: string[] = Array.isArray(body?.unexploredGenres)
      ? body.unexploredGenres.filter((g: any) => typeof g === "string" && g.trim().length > 0)
      : [];

    if (favoriteMovies.length === 0) {
      favoriteMovies = ["Zodiac", "Inception", "Pulp Fiction", "The Dark Knight"];
    }
    if (unexploredGenres.length === 0) {
      unexploredGenres = ["Western", "Cine Clásico", "Animación", "Musical", "Documental"];
    }

    const favsList = favoriteMovies.slice(0, 8).join(", ");
    const unexplList = unexploredGenres.join(", ");

    const systemPrompt = `Eres un curador cinematográfico de élite y experto en psicología del espectador.
Tu especialidad es 'El Salto de Fe': desafiar a los cinéfilos recomendando UNA sola película extraordinaria de un género que habitualmente no consumen o ignoran.
Tu objetivo es actuar como 'caballo de Troya' o puente perfecto hacia sus gustos habituales, encontrando paralelismos insospechados de tono, ritmo, temas o dirección.
Debes estructurar una analogía contundente con la fórmula: 'Si te fascinó [aspecto distintivo] de [película favorita], deberías ver esta película clásica o de culto porque...'`;

    const userPrompt = `El usuario ama estas películas: [${favsList}], pero prácticamente nunca mira películas de [${unexplList}].
Encuentra UNA película extraordinaria del género inexplorado que funcione como caballo de Troya o puente perfecto hacia sus gustos.
Explica la analogía: 'Si te fascinó el suspenso y la paranoia de Zodiac, deberías ver esta película clásica de 1957 porque...'

Responde ÚNICAMENTE con un objeto JSON válido con este esquema exacto:
{
  "movieTitle": "Título oficial o internacional de la película",
  "year": 1957,
  "unexploredGenre": "Nombre del género al que pertenece",
  "bridgeExplanation": "Si te fascinó el suspenso y la paranoia de Zodiac, deberías ver esta película clásica de 1957 porque...",
  "whyItWorks": "Explicación detallada de por qué esta propuesta es irresistible para un fan de su zona de confort habitual."
}`;

    let aiResult: Partial<OutOfComfortZoneResponse> | null = null;
    const candidateModels = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const modelToTry of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToTry,
          temperature: 0.7,
          max_tokens: 2200,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const rawContent = completion.choices[0]?.message?.content || "";
        if (rawContent) {
          const parsed = cleanAndParseJSON(rawContent);
          if (parsed && parsed.movieTitle && parsed.bridgeExplanation) {
            aiResult = {
              movieTitle: String(parsed.movieTitle).trim(),
              year: Number(parsed.year) || 1990,
              unexploredGenre: parsed.unexploredGenre || unexploredGenres[0] || "Cine Inexplorado",
              bridgeExplanation: String(parsed.bridgeExplanation).trim(),
              whyItWorks: String(parsed.whyItWorks || "").trim(),
            };
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Out of Comfort Zone] Intento fallido con modelo ${modelToTry}:`, err?.message || err);
      }
    }

    // Fallback if Groq was unavailable or returned invalid output
    if (!aiResult) {
      const fallbackChoice =
        CURATED_COMFORT_BRIDGES[Math.floor(Math.random() * CURATED_COMFORT_BRIDGES.length)];
      aiResult = { ...fallbackChoice };
    }

    // Validate and enrich with TMDB (fetch official poster, backdrop, synopsis, and rating)
    let tmdbId: number | null = null;
    let posterPath: string | null = null;
    let backdropPath: string | null = null;
    let officialOverview: string | null = null;
    let voteAverage: number | null = null;
    let movieGenres: string[] = [];

    try {
      const searchRes = await searchMovies(aiResult.movieTitle!, 1);
      if (searchRes?.results && searchRes.results.length > 0) {
        // Find best match by year or take first result
        const match =
          searchRes.results.find((m) => {
            if (!aiResult?.year || !m.release_date) return false;
            return m.release_date.startsWith(String(aiResult.year));
          }) || searchRes.results[0];

        if (match) {
          tmdbId = match.id;
          posterPath = match.poster_path;
          backdropPath = match.backdrop_path;
          officialOverview = match.overview;
          voteAverage = match.vote_average ? Number(match.vote_average.toFixed(1)) : null;

          if (Array.isArray(match.genre_ids)) {
            movieGenres = match.genre_ids
              .map((id) => MOVIE_GENRES.find((g) => g.id === id)?.name)
              .filter(Boolean) as string[];
          }
        }
      }
    } catch (tmdbErr) {
      console.warn("[Out of Comfort Zone] No se pudo enriquecer con TMDB:", tmdbErr);
    }

    const finalResponse: OutOfComfortZoneResponse = {
      movieTitle: aiResult.movieTitle!,
      year: aiResult.year!,
      bridgeExplanation: aiResult.bridgeExplanation!,
      whyItWorks: aiResult.whyItWorks!,
      unexploredGenre: aiResult.unexploredGenre || unexploredGenres[0] || "Inexplorado",
      tmdb_id: tmdbId,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      overview: officialOverview || undefined,
      vote_average: voteAverage ?? undefined,
      genres: movieGenres.length > 0 ? movieGenres : undefined,
    };

    return NextResponse.json(finalResponse, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("Error en /api/ai/out-of-comfort-zone:", error);
    const fallbackChoice = CURATED_COMFORT_BRIDGES[0];
    return NextResponse.json(fallbackChoice, { status: 200 });
  }
}
