"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Download, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useApp } from '@/lib/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import { getMovieDetails, searchMovies } from '@/lib/tmdb/client';
import { downloadTemplate, IMPORT_ACCEPT, readImportFile, validateMovie, type MatchedMovie } from '@/lib/import/movies';

type ReviewRow = MatchedMovie & { id: string; status?: string; done?: boolean };
const inputClass = 'rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm w-full';

function MovieReview({ item, disabled, update }: { item: ReviewRow; disabled: boolean; update: (patch: Partial<ReviewRow>) => void }) {
  const [query, setQuery] = useState(item.row.title);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  async function search() {
    setSearching(true); setError('');
    try {
      const result = await searchMovies(query);
      const candidates = [...new Map([...item.candidates, ...result.results].map(movie => [movie.id, movie])).values()];
      update({ candidates });
      if (!result.results.length) setError('No se encontraron películas. Probá otro título.');
    } catch { setError('No se pudo buscar. Intentá nuevamente.'); }
    finally { setSearching(false); }
  }
  return <fieldset disabled={disabled || item.done} className="rounded-xl border border-zinc-800 p-4 space-y-3 disabled:opacity-60">
    <legend className="px-2 font-semibold">{item.row.title}{item.row.year ? ` (${item.row.year})` : ''}</legend>
    <p className="text-sm text-zinc-400">{item.reason}</p>
    <label className="block text-sm">Película asociada
      <select className={inputClass} value={item.selectedId ?? ''} onChange={e => update({ selectedId: e.target.value ? Number(e.target.value) : null })}>
        <option value="">Omitir / pendiente de revisión</option>
        {item.candidates.map(movie => <option key={movie.id} value={movie.id}>{movie.title} — {movie.release_date?.slice(0, 4) || 'Sin año'}{movie.original_title ? ` · ${movie.original_title}` : ''} (TMDB {movie.id})</option>)}
      </select>
    </label>
    <div className="flex gap-2"><input aria-label={`Buscar alternativa para ${item.row.title}`} className={inputClass} value={query} onChange={e => setQuery(e.target.value)} /><button type="button" onClick={search} disabled={searching || !query.trim()} className="text-sm border border-zinc-700 rounded-lg px-3">{searching ? 'Buscando…' : 'Buscar'}</button></div>
    {error && <p role="alert" className="text-sm text-amber-400">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Puntaje (0–10, opcional)<input type="number" min="0" max="10" step="0.1" className={inputClass} value={item.row.rating ?? ''} onChange={e => update({ row: { ...item.row, rating: e.target.value === '' ? null : Number(e.target.value) } })} /></label>
      <label className="text-sm">Fecha vista (opcional)<input type="date" className={inputClass} value={item.row.watched_at ?? ''} onChange={e => update({ row: { ...item.row, watched_at: e.target.value || null } })} /></label>
      <label className="text-sm">Reseña pública<textarea className={inputClass} maxLength={5000} value={item.row.review} onChange={e => update({ row: { ...item.row, review: e.target.value } })} /></label>
      <label className="text-sm">Notas personales<textarea className={inputClass} maxLength={5000} value={item.row.notes} onChange={e => update({ row: { ...item.row, notes: e.target.value } })} /></label>
    </div>
    {item.status && <p role="status" className="text-sm text-amber-300">{item.status}</p>}
  </fieldset>;
}

export default function ImportMoviesPage() {
  const { user } = useAuth();
  const { onLogSaved } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(10);
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [downloading, setDownloading] = useState(false);
  const update = (id: string, patch: Partial<ReviewRow>) => setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));

  async function analyze() {
    if (!file || !user || busy) return;
    setBusy(true); setError(''); setSummary(''); setItems([]);
    try {
      const api = async (body: unknown) => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('Volvé a iniciar sesión.');
        const response = await fetch('/api/import/movies', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify(body) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo analizar el archivo.');
        return result;
      };
      setProgress('Leyendo el archivo…');
      const parsed = await readImportFile(file, scale);
      const rows = parsed.rows ?? (await api({ action: 'extract', text: parsed.text, scale })).rows;
      if (!rows.length) throw new Error('Completá al menos una película.');
      for (let i = 0; i < rows.length; i += 5) {
        setProgress(`Asociando películas con Groq y TMDB: ${i} de ${rows.length}…`);
        const result = await api({ action: 'match', rows: rows.slice(i, i + 5) });
        setItems(prev => [...prev, ...result.results.map((item: MatchedMovie) => ({ ...item, id: crypto.randomUUID() }))]);
      }
      setSummary(`${rows.length} películas analizadas. Revisá las asociaciones y los datos antes de guardar.`);
    } catch (err) { setError(`${(err as Error).message} Si hay resultados parciales, podés revisar y guardar esos registros.`); }
    finally { setBusy(false); setProgress(''); }
  }

  async function save() {
    if (!user || busy) return;
    const pending = items.filter(item => item.selectedId && !item.done);
    try { pending.forEach(item => validateMovie(item.row)); }
    catch (err) { setError((err as Error).message); return; }
    setBusy(true); setError(''); setSummary('');
    let saved = 0, skipped = 0, failed = 0;
    for (const [index, item] of pending.entries()) {
      setProgress(`Guardando ${index + 1} de ${pending.length}…`);
      try {
        const tmdbId = item.selectedId!;
        const { data: existing, error: queryError } = await supabase.from('logs').select('id').eq('user_id', user.id).eq('tmdb_id', tmdbId).limit(1);
        if (queryError) throw queryError;
        if (existing?.length) { skipped++; update(item.id, { done: true, status: 'Omitida: ya está en tu diario.' }); continue; }
        const movie = await getMovieDetails(tmdbId);
        const { error: movieError } = await supabase.from('movies').upsert({
          tmdb_id: movie.id, title: movie.title, poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
          release_date: movie.release_date || null, runtime: movie.runtime || null, genres: movie.genres || [],
          production_countries: movie.production_countries || [], production_companies: movie.production_companies || [],
          cast_data: [...(movie.credits?.cast || []).slice(0, 10), ...(movie.credits?.crew || []).filter(person => person.job === 'Director').map(person => ({ ...person, character: 'Director' }))],
          vote_average: movie.vote_average, overview: movie.overview, updated_at: new Date().toISOString(),
        });
        if (movieError) throw movieError;
        const { error: logError } = await supabase.from('logs').insert({ id: item.id, user_id: user.id, tmdb_id: tmdbId, rating: item.row.rating, watched_at: item.row.watched_at, review: item.row.review || null, notes: item.row.notes || null });
        if (logError) throw logError;
        saved++; update(item.id, { done: true, status: 'Importada correctamente.' });
      } catch { failed++; update(item.id, { status: 'No se pudo guardar. Podés reintentar sin duplicar los registros guardados.' }); }
    }
    if (saved) onLogSaved();
    setSummary(`${saved} importadas · ${skipped} ya existentes · ${failed} con error.`);
    setBusy(false); setProgress('');
  }

  return <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <Link href="/profile" className="text-sm text-zinc-400 hover:text-white">← Volver a mi perfil</Link>
    <h1 className="text-3xl font-bold">Importar películas</h1>
    <p className="text-zinc-400">Traé tus películas y puntajes desde Excel, CSV, TSV, ODS, TXT, Markdown o JSON. Hasta 100 películas y 2 MB por archivo. En Excel se lee la hoja Peliculas, o la primera hoja.</p>
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
      <p>Solo el título es obligatorio. Año, puntaje, fecha, reseña y notas son opcionales.</p>
      <button disabled={downloading} className="flex gap-2 items-center text-red-400 disabled:opacity-50" onClick={async () => { setDownloading(true); setError(''); try { await downloadTemplate(); } catch { setError('No se pudo descargar la plantilla.'); } finally { setDownloading(false); } }}><Download size={18} /> {downloading ? 'Preparando…' : 'Descargar plantilla Excel'}</button>
      {!user ? <Link className="block text-red-400" href="/auth">Iniciá sesión para importar tu historial</Link> : <>
        <label className="block text-sm">Archivo<input type="file" accept={IMPORT_ACCEPT} disabled={busy} className="block mt-2 w-full text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-white" onChange={e => { setFile(e.target.files?.[0] || null); setItems([]); setSummary(''); setError(''); }} /></label>
        <label className="block text-sm max-w-xs">Escala de puntajes del archivo<select className={inputClass} value={scale} disabled={busy} onChange={e => { setScale(Number(e.target.value)); setItems([]); setSummary(''); }}><option value={10}>0 a 10</option><option value={5}>0 a 5 (se multiplica por 2)</option><option value={100}>0 a 100 (se divide por 10)</option></select></label>
        <p className="text-xs text-zinc-400">Groq recibe los títulos para asociarlos con TMDB. En TXT, Markdown y JSON también recibe el texto para extraer los datos. La IA puede equivocarse: revisá el resultado. Las reseñas se publicarán en tu diario.</p>
        <button onClick={analyze} disabled={!file || busy} className="flex gap-2 items-center rounded-lg bg-red-600 px-4 py-2 font-semibold disabled:opacity-50"><Upload size={18} /> Analizar archivo</button>
      </>}
    </div>
    {busy && <p role="status" className="flex gap-2 items-center"><Loader2 size={18} className="animate-spin" />{progress}</p>}
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {summary && <p role="status" className="text-emerald-400">{summary}</p>}
    {items.length > 0 && <section className="space-y-4">
      <h2 className="text-xl font-semibold">Revisar asociaciones</h2>
      <p className="text-sm text-zinc-400">Las coincidencias dudosas quedan sin seleccionar. Elegí la película correcta o dejala pendiente para omitirla. Las películas ya registradas se omiten sin modificar sus puntajes. Las fechas vacías quedan como desconocidas.</p>
      {items.map(item => <MovieReview key={item.id} item={item} disabled={busy} update={patch => update(item.id, patch)} />)}
      <button disabled={busy || !user || !items.some(item => item.selectedId && !item.done)} onClick={save} className="rounded-lg bg-red-600 px-5 py-3 font-semibold disabled:opacity-50">Confirmar e importar {items.filter(item => item.selectedId && !item.done).length} películas</button>
    </section>}
  </div>;
}
