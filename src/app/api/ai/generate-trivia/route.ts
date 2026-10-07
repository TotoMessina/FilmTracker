import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL_LARGE } from "@/lib/groq/client";
import { TriviaQuestion, TriviaResponse } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

interface WatchedMovieInput {
  title: string;
  year?: string | number;
  director?: string;
}

function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  // Strip reasoning/think tags if model produced them
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip code fences
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
  }
  // Isolate outermost json object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

// Resilient fallback generator if Groq is offline or quota reached
function generateFallbackTrivia(movies: WatchedMovieInput[]): TriviaQuestion[] {
  const sample = [...movies].sort(() => Math.random() - 0.5).slice(0, 5);

  const templates = [
    {
      q: (m: WatchedMovieInput) => `¿En qué año se estrenó la aclamada película "${m.title}"?`,
      makeOpts: (m: WatchedMovieInput) => {
        const yr = parseInt(String(m.year || 2020), 10) || 2020;
        const options = [
          `${yr}`,
          `${yr - 2}`,
          `${yr + 3}`,
          `${yr - 5}`,
        ];
        return {
          options,
          correctIndex: 0,
          explanation: `"${m.title}" llegó a los cines en ${m.year || yr}, convirtiéndose en una obra recordada por los cinéfilos.`,
        };
      },
    },
    {
      q: (m: WatchedMovieInput) => m.director 
        ? `¿Quién dirigió la obra cinematográfica "${m.title}"?`
        : `¿Cuál es uno de los temas centrales abordados en "${m.title}"?`,
      makeOpts: (m: WatchedMovieInput) => {
        if (m.director) {
          return {
            options: [
              "Christopher Nolan",
              m.director,
              "Denis Villeneuve",
              "Quentin Tarantino",
            ],
            correctIndex: 1,
            explanation: `${m.director} estuvo al mando de la visión creativa y dirección de "${m.title}".`,
          };
        }
        return {
          options: [
            "La tensión moral y las consecuencias de las decisiones humanas",
            "Una persecución espacial interestelar en el siglo XXX",
            "Un documental biográfico sobre la revolución industrial",
            "Un torneo medieval de justa cósmica",
          ],
          correctIndex: 0,
          explanation: `"${m.title}" destaca especialmente por profundizar en los dilemas y emociones de sus protagonistas.`,
        };
      },
    },
    {
      q: (m: WatchedMovieInput) => `En el universo narrativo de "${m.title}", ¿qué elemento define el tono de su historia?`,
      makeOpts: (m: WatchedMovieInput) => ({
        options: [
          "Un musical animado de marionetas",
          "Una comedia slapstick muda",
          "Una cuidada puesta en escena dramática con atmósfera inmersiva",
          "Un reality show sin guión",
        ],
        correctIndex: 2,
        explanation: `La identidad visual y el tratamiento dramático de "${m.title}" construyen su atmósfera distintiva.`,
      }),
    },
    {
      q: (m: WatchedMovieInput) => `¿Qué galardón o reconocimiento suele destacar al hablar del legado de "${m.title}"?`,
      makeOpts: (m: WatchedMovieInput) => ({
        options: [
          "El aplauso unánime del público y la crítica especializada",
          "El premio al peor guión del año",
          "Haber sido filmada enteramente con teléfonos de 1998",
          "Nunca haberse estrenado comercialmente",
        ],
        correctIndex: 0,
        explanation: `"${m.title}" ha dejado una marca sólida entre las películas favoritas de quienes aprecian el buen cine.`,
      }),
    },
    {
      q: (m: WatchedMovieInput) => `Si recordás el clímax de "${m.title}", ¿hacia qué desenlace conducen sus conflictos?`,
      makeOpts: (m: WatchedMovieInput) => ({
        options: [
          "Una resolución abrupta sin consecuencias",
          "Un desenlace que resignifica el viaje emocional de sus personajes",
          "Un corte a negro de 30 minutos sin audio",
          "Un comercial publicitario dentro de la trama",
        ],
        correctIndex: 1,
        explanation: `El cierre narrativo de "${m.title}" otorga sentido al desarrollo de los personajes a lo largo del film.`,
      }),
    },
  ];

  return sample.map((movie, idx) => {
    const template = templates[idx % templates.length];
    const { options, correctIndex, explanation } = template.makeOpts(movie);
    // Shuffle options so correctIndex varies
    const indexed = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }));
    const shuffled = indexed.sort(() => Math.random() - 0.5);
    const newCorrect = shuffled.findIndex((item) => item.isCorrect);

    return {
      id: idx + 1,
      movieTitle: movie.title,
      question: template.q(movie),
      options: shuffled.map((s) => s.opt),
      correctIndex: newCorrect,
      explanation,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { watchedMovies } = body as { watchedMovies?: WatchedMovieInput[] };

    if (!Array.isArray(watchedMovies) || watchedMovies.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un listado de películas vistas para generar la trivia." },
        { status: 400 }
      );
    }

    // Filter valid titles and take between 5 and 10 random sample movies
    const validMovies = watchedMovies
      .filter((m) => m && typeof m.title === "string" && m.title.trim().length > 0)
      .map((m) => ({
        title: m.title.trim(),
        year: m.year ? String(m.year).trim() : "",
        director: m.director ? String(m.director).trim() : undefined,
      }));

    if (validMovies.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron películas válidas con títulos legibles." },
        { status: 400 }
      );
    }

    // Sample 5 to 10 movies
    const sampleSize = Math.min(Math.max(5, validMovies.length), 10);
    const sampledMovies = [...validMovies]
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize);

    const moviesListText = sampledMovies
      .map((m, i) => `${i + 1}. "${m.title}"${m.year ? ` (${m.year})` : ""}${m.director ? ` - Dir: ${m.director}` : ""}`)
      .join("\n");

    const systemPrompt = `Eres un creador de trivias cinematográficas de élite para FilmTracker. Tu objetivo es generar preguntas de opción múltiple ingeniosas, divertidas y precisas basadas EXCLUSIVAMENTE en las películas provistas por el usuario. Desafía la memoria cinematográfica del usuario sobre tramas, personajes, escenas icónicas, directores o bandas sonoras. Hablas en español neutro/latinoamericano con entusiasmo cinéfilo.`;

    const userPrompt = `El usuario ha visto y registrado estas películas en su diario:
${moviesListText}

Genera exactamente 5 preguntas de opción múltiple sobre estas películas.
Distribuye las 5 preguntas entre diferentes películas de la lista.

Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "questions": [
    {
      "id": 1,
      "movieTitle": "Nombre exacto de la película",
      "question": "¿Pregunta desafiante y atractiva sobre la película?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "explanation": "Explicación cinéfila concisa y entretenida de por qué es la respuesta correcta."
    }
  ]
}

Reglas estrictas:
1. "options" debe contener exactamente 4 opciones en texto.
2. "correctIndex" debe ser un número entero entre 0 y 3 indicando cuál de las 4 opciones es la correcta.
3. Varía la posición de "correctIndex" entre las 5 preguntas (no pongas siempre la misma opción).
4. No inventes tramas inexistentes; usa datos reales y conocidos de la película.
5. Responde estrictamente con el JSON, sin texto introductorio ni explicaciones fuera de la estructura.`;

    let parsedQuestions: TriviaQuestion[] = [];

    // Try primary Groq models with temperature 0.7 and max_tokens 1024
    const modelsToTry = [GROQ_MODEL_LARGE, "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

    for (const model of modelsToTry) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });

        const rawContent = completion.choices[0]?.message?.content?.trim() || "";
        if (rawContent) {
          const parsed = cleanAndParseJSON(rawContent);
          if (Array.isArray(parsed?.questions) && parsed.questions.length >= 3) {
            // Validate and normalize questions
            parsedQuestions = parsed.questions.slice(0, 5).map((q: any, idx: number) => ({
              id: idx + 1,
              movieTitle: String(q.movieTitle || sampledMovies[idx % sampledMovies.length].title),
              question: String(q.question || `¿Qué recordás de ${q.movieTitle}?`),
              options: Array.isArray(q.options) && q.options.length === 4
                ? q.options.map((opt: any) => String(opt))
                : ["Opción A", "Opción B", "Opción C", "Opción D"],
              correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex <= 3
                ? q.correctIndex
                : 0,
              explanation: String(q.explanation || "Dato cinéfilo curioso sobre la película."),
            }));
            break;
          }
        }
      } catch (err) {
        console.warn(`Error llamando a modelo ${model} en /api/ai/generate-trivia:`, err);
      }
    }

    // Fallback if Groq models failed or produced empty list
    if (parsedQuestions.length === 0) {
      console.info("Usando generador de fallback para trivia");
      parsedQuestions = generateFallbackTrivia(sampledMovies);
    }

    const responseData: TriviaResponse = {
      questions: parsedQuestions,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error general en POST /api/ai/generate-trivia:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al generar la trivia." },
      { status: 500 }
    );
  }
}
