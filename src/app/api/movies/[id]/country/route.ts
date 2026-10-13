import { NextResponse } from 'next/server';
import { createAuthenticatedClient, supabase } from '@/lib/supabase/client';
import { getMovieDetails } from '@/lib/tmdb/client';
import { normaliseCountries } from '@/lib/services/cineMap';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) return NextResponse.json({ error: 'ID de película inválido.' }, { status: 400 });
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  const db = token ? createAuthenticatedClient(token) : supabase;
  if (token) {
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: 'Tu sesión venció.' }, { status: 401 });
  }
  try {
    const { data: cached, error: readError } = await db.from('movies').select('tmdb_id, production_countries').eq('tmdb_id', Number(id)).maybeSingle();
    if (readError) throw readError;
    const existing = normaliseCountries(cached?.production_countries);
    if (existing.length) return NextResponse.json({ countries: existing, persisted: true }, { headers: { 'Cache-Control': 'no-store' } });
    const movie = await getMovieDetails(Number(id));
    const countries = normaliseCountries(movie.production_countries);
    let persisted = false;
    if (token && countries.length) {
      const query = cached
        ? db.from('movies').update({ production_countries: countries }).eq('tmdb_id', Number(id))
        : db.from('movies').upsert({ tmdb_id: movie.id, title: movie.title, production_countries: countries }, { onConflict: 'tmdb_id', ignoreDuplicates: true });
      const { data, error } = await query.select('tmdb_id');
      persisted = !error && Boolean(data?.length);
    }
    return NextResponse.json({ countries, persisted }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo consultar el país de esta película.' }, { status: 502 });
  }
}
