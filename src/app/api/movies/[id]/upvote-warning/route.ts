import { NextResponse } from 'next/server';
import { upvoteTriggerWarning } from '@/lib/services/triggerWarningsStore';

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
    const { warningId, userId } = body;

    if (!warningId) {
      return NextResponse.json({ error: 'warningId es requerido.' }, { status: 400 });
    }

    const effectiveUserId = userId || 'anonymous_voter';
    const result = await upvoteTriggerWarning(warningId, tmdbId, effectiveUserId);

    if (result.alreadyVoted) {
      return NextResponse.json({ error: 'Ya has votado esta advertencia.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, upvotes: result.upvotes });
  } catch (error: any) {
    console.error('Error in /api/movies/[id]/upvote-warning:', error);
    return NextResponse.json({ error: 'Error al registrar el voto.' }, { status: 500 });
  }
}
