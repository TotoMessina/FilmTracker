import { NextResponse } from 'next/server';
import { createAuthenticatedClient, supabase } from '@/lib/supabase/client';
import { getMovieDetails } from '@/lib/tmdb/client';
import { originCountries } from '@/lib/services/cineMap';

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
    // Select * also works before the optional origin-country migration is applied.
    const { data: cached, error: readError } = await db.from('movies').select('*').eq('tmdb_id', Number(id)).maybeSingle();
    if (readError) throw readError;
    const existing = originCountries(cached?.origin_country);
    if (Array.isArray(cached?.origin_country)) return NextResponse.json({ countries: existing, persisted: true }, { headers: { 'Cache-Control': 'no-store' } });
    const movie = await getMovieDetails(Number(id));
    const countries = originCountries(movie.origin_country);
    const origin_country = countries.map(country => country.iso_3166_1);
    let persisted = false;
    if (token) {
      const query = cached
        ? db.from('movies').update({ origin_country }).eq('tmdb_id', Number(id))
        : db.from('movies').upsert({ tmdb_id: movie.id, title: movie.title, origin_country }, { onConflict: 'tmdb_id', ignoreDuplicates: true });
      const { data, error } = await query.select('tmdb_id');
      persisted = !error && Boolean(data?.length);
    }
    return NextResponse.json({ countries, persisted }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo consultar el país de esta película.' }, { status: 502 });
  }
}
