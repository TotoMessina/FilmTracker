import { NextResponse } from 'next/server';
import { getMovieTriggerWarnings } from '@/lib/services/triggerWarningsStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tmdbId = parseInt(id, 10);
    if (!tmdbId || isNaN(tmdbId)) {
      return NextResponse.json({ error: 'ID de película inválido.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const warnings = await getMovieTriggerWarnings(tmdbId, userId);
    return NextResponse.json({ warnings });
  } catch (error: any) {
    console.error('Error in GET /api/movies/[id]/trigger-warnings:', error);
    return NextResponse.json({ error: 'Error obteniendo advertencias.' }, { status: 500 });
  }
}
