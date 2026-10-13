import { NextResponse } from 'next/server';
import { groq, GROQ_MODEL_SMALL, GROQ_MODEL_FAST } from '@/lib/groq/client';
import { TRIGGER_WARNING_CATEGORIES, TriggerWarningCategory } from '@/lib/types/triggerWarnings';
import { saveTriggerWarning, getMovieTriggerWarnings } from '@/lib/services/triggerWarningsStore';

export const maxDuration = 45;

const SYSTEM_PROMPT = `Eres un detector ético y sumamente riguroso de Trigger Warnings (advertencias de contenido sensible) para una plataforma de cine.
Tu labor es identificar si la película descrita contiene elementos potencialmente perturbadores o detonantes a partir ÚNICAMENTE de la sinopsis oficial, géneros y palabras clave (keywords) provistas.

CATEGORÍAS VÁLIDAS PERMITIDAS:
- 'animal_death': Muerte o daño a animales o mascotas
- 'jump_scares': Sustos repentinos intensos (común en terror/suspenso)
- 'graphic_violence': Violencia gráfica explícita, sangre o gore
- 'sexual_content': Contenido sexual explícito o violencia sexual
- 'suicide_theme': Suicidio o autolesión
- 'child_peril': Menores de edad en peligro grave, secuestro o violencia infantil
- 'substance_abuse': Adicción severa a drogas o alcohol
- 'claustrophobia': Encierro angustiante o claustrofobia
- 'family_unfriendly': Lenguaje o situaciones no aptas para menores

REGLAS ABSOLUTAS:
1. Sé extremadamente conservador. NUNCA inventes nada que no esté claramente implícito en la sinopsis, géneros o palabras clave.
2. Si la película es comedia familiar o infantil y no hay violencia o peligro grave, NO agregues advertencias forzadas.
3. Asigna 'confidence': 'high' solo si la sinopsis o keywords lo mencionan expresamente (ej. 'asesinato sangriento', 'terror', 'suicidio'). Si es una deducción probable por el género, asigna 'medium'.
4. Responde ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "warnings": [
    {
      "category": "animal_death",
      "label": "⚠️ Muerte o daño a animales en pantalla",
      "confidence": "high"
    }
  ]
}
Si la película no tiene elementos sensibles evidentes, retorna: {"warnings": []}.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tmdb_id, title, overview, genres = [], keywords = [] } = body;

    if (!tmdb_id || typeof tmdb_id !== 'number') {
      return NextResponse.json({ error: 'tmdb_id es requerido y debe ser un número.' }, { status: 400 });
    }

    // Check if we already have warnings saved
    const existing = await getMovieTriggerWarnings(tmdb_id);
    const existingAi = existing.filter((w) => w.source === 'ai');
    if (existingAi.length > 0) {
      return NextResponse.json({
        warnings: existingAi.map((w) => ({
          category: w.category,
          label: w.label,
          confidence: w.confidence || 'high',
        })),
        source: 'cached',
      });
    }

    let detectedWarnings: Array<{ category: TriggerWarningCategory; label: string; confidence: 'high' | 'medium' }> = [];

    if (process.env.GROQ_API_KEY) {
      try {
        const userPrompt = `Película: "${title || 'Sin título'}"
Géneros: ${Array.isArray(genres) ? genres.join(', ') : genres}
Palabras clave (Keywords): ${Array.isArray(keywords) ? keywords.join(', ') : keywords}
Sinopsis: "${overview || 'Sinopsis no provista.'}"

Analiza si corresponde alguna de las categorías de Trigger Warnings permitidas y responde en JSON.`;

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL_SMALL || GROQ_MODEL_FAST,
          temperature: 0.1,
          max_tokens: 500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (Array.isArray(parsed.warnings)) {
          const validCategories = new Set(TRIGGER_WARNING_CATEGORIES.map((c) => c.category));
          detectedWarnings = parsed.warnings
            .filter((w: any) => validCategories.has(w.category))
            .map((w: any) => {
              const catDef = TRIGGER_WARNING_CATEGORIES.find((c) => c.category === w.category);
              return {
                category: w.category as TriggerWarningCategory,
                label: w.label || catDef?.label || '⚠️ Contenido sensible',
                confidence: w.confidence === 'medium' ? 'medium' : 'high',
              };
            });
        }
      } catch (aiErr) {
        console.warn('Groq trigger-warnings error, using heuristic fallback:', aiErr);
      }
    }

    // Heuristic fallback if AI returned empty or failed, based on keywords and genres
    if (detectedWarnings.length === 0) {
      const lowerOverview = (overview || '').toLowerCase();
      const lowerKeywords = Array.isArray(keywords) ? keywords.map((k: string) => k.toLowerCase()).join(' ') : '';
      const genreList = Array.isArray(genres) ? genres.map((g: string) => g.toLowerCase()) : [];

      if (lowerKeywords.includes('jump scare') || (genreList.includes('terror') && lowerOverview.includes('susto'))) {
        detectedWarnings.push({ category: 'jump_scares', label: '⚠️ Jump scares intensos', confidence: 'medium' });
      }
      if (lowerKeywords.includes('gore') || lowerOverview.includes('mutila') || lowerOverview.includes('sangriento') || lowerKeywords.includes('graphic violence')) {
        detectedWarnings.push({ category: 'graphic_violence', label: '⚠️ Violencia gráfica / Gore', confidence: 'high' });
      }
      if (lowerKeywords.includes('suicide') || lowerOverview.includes('suicid')) {
        detectedWarnings.push({ category: 'suicide_theme', label: '⚠️ Temáticas de suicidio o autolesión', confidence: 'high' });
      }
      if (lowerKeywords.includes('dog dies') || lowerKeywords.includes('animal death') || lowerOverview.includes('matan a su perro')) {
        detectedWarnings.push({ category: 'animal_death', label: '⚠️ Muerte o daño a animales', confidence: 'high' });
      }
    }

    // Save detected AI warnings to database
    for (const w of detectedWarnings) {
      await saveTriggerWarning({
        tmdb_id,
        category: w.category,
        label: w.label,
        source: 'ai',
        upvotes: 0,
        confidence: w.confidence,
      });
    }

    return NextResponse.json({ warnings: detectedWarnings, source: 'ai' });
  } catch (error: any) {
    console.error('Error in /api/ai/trigger-warnings:', error);
    return NextResponse.json({ error: 'Error procesando advertencias de contenido.' }, { status: 500 });
  }
}
