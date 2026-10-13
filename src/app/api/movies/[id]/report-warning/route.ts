import { NextResponse } from 'next/server';
import { 
  saveTriggerWarning, 
  getUserReportCount, 
  incrementUserReportCount 
} from '@/lib/services/triggerWarningsStore';
import { TRIGGER_WARNING_CATEGORIES, TriggerWarningCategory } from '@/lib/types/triggerWarnings';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tmdbId = parseInt(id, 10);
    if (!tmdbId || isNaN(tmdbId)) {
      return NextResponse.json({ error: 'ID de película inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const { category, label, userId } = body;

    if (!category) {
      return NextResponse.json({ error: 'Debes seleccionar una categoría.' }, { status: 400 });
    }

    // Rate limiting: máximo 3 reportes por usuario por película
    const effectiveUserId = userId || 'anonymous_user';
    const currentCount = getUserReportCount(effectiveUserId, tmdbId);
    if (currentCount >= 3) {
      return NextResponse.json(
        { error: 'Límite alcanzado: máximo 3 advertencias reportadas por película por usuario.' },
        { status: 429 }
      );
    }

    const categoryDef = TRIGGER_WARNING_CATEGORIES.find((c) => c.category === category);
    const finalLabel = label?.trim() || categoryDef?.label || '⚠️ Advertencia de contenido';

    const saved = await saveTriggerWarning({
      tmdb_id: tmdbId,
      category: category as TriggerWarningCategory,
      label: finalLabel,
      source: 'community',
      reported_by: userId || null,
      upvotes: 1, // Start with 1 upvote from the reporter
    });

    incrementUserReportCount(effectiveUserId, tmdbId);

    return NextResponse.json({ 
      success: true, 
      warning: saved,
      reportsRemaining: 2 - currentCount
    });
  } catch (error: any) {
    console.error('Error in /api/movies/[id]/report-warning:', error);
    return NextResponse.json({ error: 'Error al registrar el reporte comunitario.' }, { status: 500 });
  }
}
