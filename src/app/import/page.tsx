"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Download, 
  Upload, 
  Loader2, 
  FileText, 
  Sparkles, 
  ClipboardPaste, 
  X, 
  Film,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Star,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useApp } from '@/lib/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import { getMovieDetails, searchMovies, getImageUrl } from '@/lib/tmdb/client';
import { downloadTemplate, IMPORT_ACCEPT, readImportFile, validateMovie, type MatchedMovie } from '@/lib/import/movies';

type ReviewRow = MatchedMovie & { id: string; status?: string; done?: boolean };
const inputClass = 'rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm w-full text-white placeholder-zinc-500 focus:outline-none focus:border-red-500';

function MovieReview({ 
  item, 
  disabled, 
  update, 
  forceExpanded 
}: { 
  item: ReviewRow; 
  disabled: boolean; 
  update: (patch: Partial<ReviewRow>) => void;
  forceExpanded?: boolean;
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [query, setQuery] = useState(item.row.title);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Use forceExpanded if specified, otherwise local toggle state
  const isExpanded = forceExpanded !== undefined ? forceExpanded : localExpanded;

  const selectedCandidate = item.candidates.find(c => c.id === item.selectedId);
  const displayCandidate = selectedCandidate || item.candidates[0];
  const posterUrl = displayCandidate?.poster_path 
    ? getImageUrl(displayCandidate.poster_path, 'w185') 
    : null;

  async function search() {
    setSearching(true); 
    setError('');
    try {
      const result = await searchMovies(query);
      const candidates = [...new Map([...item.candidates, ...result.results].map(movie => [movie.id, movie])).values()];
      update({ candidates });
      if (!result.results.length) setError('No se encontraron películas. Probá otro título.');
    } catch { 
      setError('No se pudo buscar. Intentá nuevamente.'); 
    } finally { 
      setSearching(false); 
    }
  }

  const isOmitted = item.selectedId === null;

  return (
    <div 
      className={`rounded-2xl border transition shadow-lg overflow-hidden ${
        item.done 
          ? 'bg-zinc-900/40 border-zinc-800 opacity-60' 
          : isOmitted 
          ? 'bg-[#12121a]/60 border-zinc-800/80 hover:border-zinc-700' 
          : 'bg-[#141420] border-white/10 hover:border-red-500/30'
      }`}
    >
      {/* Main Compact Row: Poster + Title + Rating + Associated Movie + (+) Button */}
      <div className="p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
        {/* Poster Image */}
        <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden border border-white/10 shadow-md shrink-0 bg-zinc-900 flex items-center justify-center">
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt={displayCandidate?.title || item.row.title} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 gap-1 p-1 text-center">
              <Film className="w-5 h-5 text-zinc-600" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Sin foto</span>
            </div>
          )}
          {item.done && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title and Rating Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white truncate">
                {item.row.title}
              </h3>
              {item.row.year && (
                <span className="text-xs text-zinc-400 font-semibold shrink-0">
                  ({item.row.year})
                </span>
              )}
            </div>

            {/* Rating Badge */}
            {item.row.rating !== null ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs shrink-0 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.row.rating} / 10</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-zinc-500 italic shrink-0">
                Sin puntaje
              </span>
            )}
          </div>

          {/* Associated Movie Tag */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedCandidate ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold max-w-full truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Asociada a: <strong className="text-white font-bold">{selectedCandidate.title}</strong> {selectedCandidate.release_date ? `(${selectedCandidate.release_date.slice(0, 4)})` : ''}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pendiente de asociar ({item.candidates.length} sugeridas)</span>
              </div>
            )}

            {/* Watched Date Tag if present */}
            {item.row.watched_at && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 text-zinc-400 text-[11px] font-medium">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span>{item.row.watched_at}</span>
              </span>
            )}

            {/* Excerpt of review if not expanded */}
            {item.row.review && !isExpanded && (
              <span className="hidden md:inline text-xs text-zinc-400 italic truncate max-w-xs">
                &ldquo;{item.row.review}&rdquo;
              </span>
            )}
          </div>

          {/* Status feedback (e.g. Omitida, Importada, Error) */}
          {item.status && (
            <p className="text-xs font-bold text-amber-300 pt-0.5">{item.status}</p>
          )}
        </div>

        {/* Right Action: Expand/Collapse (+) Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLocalExpanded(!isExpanded)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isExpanded
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
            }`}
            title={isExpanded ? 'Ocultar detalles' : 'Ver y editar detalles (+)'}
          >
            {isExpanded ? (
              <>
                <Minus className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Menos</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Detalles</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Drawer with Extra Details (Opened via + button) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-white/5 bg-black/30 space-y-4 animate-in fade-in duration-150">
          {/* Row 1: Candidate Selection & TMDB Search */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-500" />
                <span>Película de TMDB para asociar</span>
              </label>
              {item.reason && (
                <span className="text-[11px] text-zinc-400 italic">
                  💡 {item.reason}
                </span>
              )}
            </div>

            <select 
              className={inputClass} 
              value={item.selectedId ?? ''} 
              disabled={disabled || item.done}
              onChange={e => update({ selectedId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Omitir esta película (no importar en diario)</option>
              {item.candidates.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title} — {movie.release_date?.slice(0, 4) || 'Sin año'}{movie.original_title ? ` · ${movie.original_title}` : ''} (ID {movie.id})
                </option>
              ))}
            </select>

            {/* Alternative Search Bar */}
            <div className="flex gap-2 pt-1">
              <input 
                aria-label={`Buscar alternativa para ${item.row.title}`} 
                className={inputClass} 
                value={query} 
                disabled={disabled || item.done}
                onChange={e => setQuery(e.target.value)} 
                placeholder="Buscar otro título en la base de datos TMDB..."
              />
              <button 
                type="button" 
                onClick={search} 
                disabled={searching || !query.trim() || disabled || item.done} 
                className="text-xs font-bold border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-2 shrink-0 transition"
              >
                {searching ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
            {error && <p role="alert" className="text-xs text-amber-400 font-medium">{error}</p>}
          </div>

          {/* Row 2: Puntaje y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <label className="block text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 mb-1 text-zinc-300">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Puntaje (0 a 10)
              </span>
              <input 
                type="number" 
                min="0" 
                max="10" 
                step="0.1" 
                disabled={disabled || item.done}
                className={inputClass} 
                value={item.row.rating ?? ''} 
                placeholder="Ej. 8.5"
                onChange={e => update({ row: { ...item.row, rating: e.target.value === '' ? null : Number(e.target.value) } })} 
              />
            </label>

            <label className="block text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 mb-1 text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Fecha en que la viste
              </span>
              <input 
                type="date" 
                disabled={disabled || item.done}
                className={inputClass} 
                value={item.row.watched_at ?? ''} 
                onChange={e => update({ row: { ...item.row, watched_at: e.target.value || null } })} 
              />
            </label>
          </div>

          {/* Row 3: Reseña y Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <label className="block text-xs font-semibold text-zinc-300">
              <span className="mb-1 block">Reseña u opinión (pública)</span>
              <textarea 
                className={`${inputClass} h-20 resize-y`} 
                maxLength={5000} 
                disabled={disabled || item.done}
                value={item.row.review} 
                onChange={e => update({ row: { ...item.row, review: e.target.value } })} 
                placeholder="Escribe tu opinión sobre la película..."
              />
            </label>

            <label className="block text-xs font-semibold text-zinc-300">
              <span className="mb-1 block">Notas personales (privadas)</span>
              <textarea 
                className={`${inputClass} h-20 resize-y`} 
                maxLength={5000} 
                disabled={disabled || item.done}
                value={item.row.notes} 
                onChange={e => update({ row: { ...item.row, notes: e.target.value } })} 
                placeholder="Notas privadas (cine donde la viste, compañía, etc.)..."
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImportMoviesPage() {
  const { user } = useAuth();
  const { onLogSaved, setImportNotice } = useApp();
  const router = useRouter();
  const totals = useRef({ saved: 0, skipped: 0 });

  // Mode: "text" (Notas / Cuadro de texto) or "file" (Excel / CSV / Archivos)
  const [importMode, setImportMode] = useState<'text' | 'file'>('text');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(10);

  const [allExpanded, setAllExpanded] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [downloading, setDownloading] = useState(false);

  const update = (id: string, patch: Partial<ReviewRow>) => 
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));

  const handleLoadExample = () => {
    setRawText(
      `1. Inception (2010) - 9/10 - Una obra maestra de ciencia ficción\n` +
      `2. El Padrino (1972) - 10/10 - Clásico indiscutible\n` +
      `3. Oppenheimer - 9.5 vista el 2024-03-10\n` +
      `4. Parasite (2019) 10/10 - Excelente guion y giros\n` +
      `5. La La Land - me encantaron las canciones y el final agridulce`
    );
    setError('');
    setSummary('');
    setItems([]);
  };

  const handleClearText = () => {
    setRawText('');
    setError('');
    setSummary('');
    setItems([]);
  };

  async function analyze() {
    if (!user || busy) return;
    if (importMode === 'file' && !file) return;
    if (importMode === 'text' && !rawText.trim()) return;

    setBusy(true); 
    setError(''); 
    setSummary(''); 
    setItems([]);
    setAnalysisComplete(false);
    setImportNotice(null);
    totals.current = { saved: 0, skipped: 0 };

    try {
      const api = async (body: unknown) => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('Volvé a iniciar sesión.');
        const response = await fetch('/api/import/movies', { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${data.session.access_token}` 
          }, 
          body: JSON.stringify(body) 
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo procesar la solicitud.');
        return result;
      };

      let rows: any[] = [];

      if (importMode === 'file') {
        setProgress('Leyendo el archivo…');
        const parsed = await readImportFile(file!, scale);
        rows = parsed.rows ?? (await api({ action: 'extract', text: parsed.text, scale })).rows;
      } else {
        if (rawText.trim().length < 3) throw new Error('Ingresá al menos el nombre de una película.');
        if (rawText.trim().length > 40000) throw new Error('El texto supera el límite de 40.000 caracteres.');
        setProgress('Analizando tus notas con IA (Groq)…');
        const extractResult = await api({ action: 'extract', text: rawText.trim(), scale });
        rows = extractResult.rows;
      }

      if (!rows || !rows.length) {
        throw new Error('No se detectaron películas en el texto o archivo. Verificá los títulos.');
      }

      for (let i = 0; i < rows.length; i += 5) {
        setProgress(`Asociando películas con TMDB e IA: ${Math.min(i + 5, rows.length)} de ${rows.length}…`);
        const result = await api({ action: 'match', rows: rows.slice(i, i + 5) });
        setItems(prev => [...prev, ...result.results.map((item: MatchedMovie) => ({ ...item, id: crypto.randomUUID() }))]);
      }

      setAnalysisComplete(true);
      setSummary(`¡Éxito! ${rows.length} películas analizadas por la IA. Revisá las coincidencias antes de guardar.`);
    } catch (err) { 
      setError(`${(err as Error).message} Si hay resultados parciales, podés revisar y guardar esos registros.`); 
    } finally { 
      setBusy(false); 
      setProgress(''); 
    }
  }

  async function save() {
    if (!user || busy) return;
    const pending = items.filter(item => item.selectedId && !item.done);
    if (!pending.length) return;

    try { 
      pending.forEach(item => validateMovie(item.row)); 
    } catch (err) { 
      setError((err as Error).message); 
      return; 
    }

    setBusy(true); 
    setError(''); 
    setSummary('');
    let saved = 0, skipped = 0, failed = 0;

    for (const [index, item] of pending.entries()) {
      setProgress(`Guardando en tu diario ${index + 1} de ${pending.length}…`);
      try {
        const tmdbId = item.selectedId!;
        const { data: existing, error: queryError } = await supabase
          .from('logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('tmdb_id', tmdbId)
          .limit(1);

        if (queryError) throw queryError;
        if (existing?.length) { 
          skipped++; 
          update(item.id, { done: true, status: 'Omitida: ya estaba en tu diario.' }); 
          continue; 
        }

        const movie = await getMovieDetails(tmdbId);
        const { error: movieError } = await supabase.from('movies').upsert({
          tmdb_id: movie.id, 
          title: movie.title, 
          poster_path: movie.poster_path, 
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date || null, 
          runtime: movie.runtime || null, 
          genres: movie.genres || [],
          production_countries: movie.production_countries || [], 
          production_companies: movie.production_companies || [],
          cast_data: [
            ...(movie.credits?.cast || []).slice(0, 10), 
            ...(movie.credits?.crew || [])
              .filter(person => person.job === 'Director')
              .map(person => ({ ...person, character: 'Director' }))
          ],
          vote_average: movie.vote_average, 
          overview: movie.overview, 
          updated_at: new Date().toISOString(),
        });

        if (movieError) throw movieError;

        const { error: logError } = await supabase.from('logs').insert({ 
          id: item.id, 
          user_id: user.id, 
          tmdb_id: tmdbId, 
          rating: item.row.rating, 
          watched_at: item.row.watched_at, 
          review: item.row.review || null, 
          notes: item.row.notes || null 
        });

        if (logError) throw logError;
        saved++; 
        update(item.id, { done: true, status: 'Importada correctamente.' });
      } catch { 
        failed++; 
        update(item.id, { status: 'No se pudo guardar. Podés reintentar sin duplicar los registros guardados.' }); 
      }
    }

    if (saved) onLogSaved();
    totals.current.saved += saved;
    totals.current.skipped += skipped;
    const unresolved = items.filter(item => !item.selectedId && !item.done).length;

    if (failed === 0 && unresolved === 0 && analysisComplete) {
      setImportNotice({ userId: user.id, ...totals.current });
      setProgress('Importación completada con éxito. Redirigiendo al inicio…');
      router.replace('/');
      return;
    }

    setSummary(`${saved} importadas con éxito · ${skipped} ya existentes · ${failed} con error.`);
    if (unresolved > 0) {
      setError(`Quedan ${unresolved} películas sin asociar. Revisalas antes de finalizar o volvé al inicio para dejarlas sin importar.`);
    } else if (!analysisComplete && failed === 0) {
      setError('Se guardaron los resultados parciales. Volvé a analizar para procesar las películas restantes.');
    }
    setBusy(false); 
    setProgress('');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href="/profile" className="text-sm text-zinc-400 hover:text-white transition flex items-center gap-1.5">
        ← Volver a mi perfil
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <span>Importar películas</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">
            Masivo & IA
          </span>
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Cargá tus películas vistas en lote. Podés pegar directamente tus notas personales en texto libre o subir archivos de Excel, CSV, TSV, ODS, TXT, Markdown o JSON.
        </p>
      </div>

      {/* Main Mode Tabs & Input Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#12121a] p-5 sm:p-6 space-y-6 shadow-xl">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 gap-1">
          <button
            type="button"
            onClick={() => { setImportMode('text'); setItems([]); setError(''); setSummary(''); }}
            disabled={busy}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              importMode === 'text'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Pegar Notas en Texto (IA)</span>
          </button>

          <button
            type="button"
            onClick={() => { setImportMode('file'); setItems([]); setError(''); setSummary(''); }}
            disabled={busy}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              importMode === 'file'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Subir Archivo (Excel, CSV...)</span>
          </button>
        </div>

        {!user ? (
          <div className="p-6 text-center rounded-xl bg-white/5 border border-white/10 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm text-zinc-300">Necesitás iniciar sesión en FilmTracker para importar películas a tu historial.</p>
            <Link 
              className="inline-block px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition" 
              href="/auth"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            {/* MODE 1: FREE-FORM TEXT / NOTES INPUT */}
            {importMode === 'text' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label htmlFor="notes-textarea" className="block text-sm font-bold text-white flex items-center gap-1.5">
                      <ClipboardPaste className="w-4 h-4 text-red-500" />
                      <span>Cuadro de texto para tus notas</span>
                    </label>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Copia y pega la lista de películas que tengas guardada en Apple Notes, Keep, Notion, WhatsApp o Word.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleLoadExample}
                      disabled={busy}
                      className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Cargar ejemplo</span>
                    </button>
                    {rawText && (
                      <button
                        type="button"
                        onClick={handleClearText}
                        disabled={busy}
                        className="text-xs text-zinc-400 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Borrar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    id="notes-textarea"
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      setItems([]);
                      setError('');
                      setSummary('');
                    }}
                    disabled={busy}
                    rows={8}
                    maxLength={40000}
                    placeholder={`Pegá aquí tus notas, por ejemplo:\n\n- Inception (2010) - 9/10\n- El Padrino - 10/10 - Obra maestra absoluta\n- Oppenheimer 9.5 vista el 2024-03-10\n- Parasite (2019) 10\n- La La Land - me encantó la música\n\nLa IA detectará automáticamente los títulos, años, puntajes, fechas y opiniones.`}
                    className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white placeholder-zinc-500 text-sm font-mono leading-relaxed transition resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                    <span>💡 La IA extrae títulos aunque tengan guiones, números de lista o faltas de ortografía menores.</span>
                    <span className="font-mono">{rawText.length} / 40.000 caracteres</span>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: FILE UPLOAD */}
            {importMode === 'file' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm text-zinc-300">
                    Solo el título es obligatorio. Año, puntaje, fecha, reseña y notas son opcionales.
                  </p>
                  <button 
                    disabled={downloading || busy} 
                    className="flex gap-1.5 items-center text-xs text-red-400 hover:text-red-300 font-semibold disabled:opacity-50 shrink-0" 
                    onClick={async () => { 
                      setDownloading(true); 
                      setError(''); 
                      try { 
                        await downloadTemplate(); 
                      } catch { 
                        setError('No se pudo descargar la plantilla.'); 
                      } finally { 
                        setDownloading(false); 
                      } 
                    }}
                  >
                    <Download size={14} /> 
                    {downloading ? 'Preparando…' : 'Descargar plantilla Excel'}
                  </button>
                </div>

                <label className="block text-sm font-medium text-white">
                  Seleccionar archivo de tu dispositivo
                  <input 
                    type="file" 
                    accept={IMPORT_ACCEPT} 
                    disabled={busy} 
                    className="block mt-2 w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2.5 file:text-white file:font-semibold hover:file:bg-zinc-700 transition cursor-pointer" 
                    onChange={e => { 
                      setFile(e.target.files?.[0] || null); 
                      setItems([]); 
                      setSummary(''); 
                      setError(''); 
                    }} 
                  />
                </label>
                <p className="text-xs text-zinc-500">
                  Formatos soportados: .xlsx, .xls, .ods, .csv, .tsv, .txt, .md, .json (hasta 100 películas y 2 MB).
                </p>
              </div>
            )}

            {/* COMMON: SCALE SELECTOR & ACTION BUTTON */}
            <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <label className="block text-sm text-zinc-300 max-w-xs">
                Escala de puntajes usada en tus notas/archivo
                <select 
                  className={`${inputClass} mt-1`} 
                  value={scale} 
                  disabled={busy} 
                  onChange={e => { 
                    setScale(Number(e.target.value)); 
                    setItems([]); 
                    setSummary(''); 
                  }}
                >
                  <option value={10}>0 a 10 (ej. 8.5 o 9/10)</option>
                  <option value={5}>0 a 5 estrellas (se multiplica × 2)</option>
                  <option value={100}>0 a 100 puntos (se divide ÷ 10)</option>
                </select>
              </label>

              <button 
                onClick={analyze} 
                disabled={busy || (importMode === 'file' ? !file : !rawText.trim())} 
                className="flex gap-2 items-center justify-center rounded-xl bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 font-bold text-sm shadow-lg shadow-red-600/30 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {importMode === 'text' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Analizar notas con IA</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Analizar archivo con IA</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Progress & Feedback State */}
      {busy && (
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3 text-sm text-zinc-300 animate-pulse">
          <Loader2 className="w-5 h-5 text-red-500 animate-spin shrink-0" />
          <span>{progress}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{summary}</p>
            {!busy && (
              <Link href="/" className="inline-block text-xs text-emerald-400 hover:underline">
                Ir al Dashboard para ver tu historial actualizado →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Review & Associations Table */}
      {items.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Películas analizadas</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600/20 text-red-400 border border-red-500/30">
                  {items.length} detectadas
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Cada tarjeta muestra la película, su póster, puntaje y película asociada. Usá el botón <strong className="text-white">+</strong> para ver o editar reseñas, fechas y notas.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAllExpanded(!allExpanded)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {allExpanded ? (
                  <>
                    <Minus className="w-3.5 h-3.5" />
                    <span>Colapsar todas</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-red-400" />
                    <span>Expandir todas (+)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {items.map(item => (
              <MovieReview 
                key={item.id} 
                item={item} 
                disabled={busy} 
                update={patch => update(item.id, patch)} 
                forceExpanded={allExpanded ? true : undefined}
              />
            ))}
          </div>

          {/* Bottom Confirmation Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#141420] border border-white/10 shadow-lg">
            <div className="text-xs text-zinc-400">
              <span className="font-bold text-emerald-400 text-sm">
                {items.filter(item => item.selectedId && !item.done).length}
              </span> de {items.length} películas listas para importar
            </div>

            <button 
              disabled={busy || !user || !items.some(item => item.selectedId && !item.done)} 
              onClick={save} 
              className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-500 text-white px-7 py-3 font-bold text-sm shadow-xl shadow-red-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e importar {items.filter(item => item.selectedId && !item.done).length} películas en mi diario</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
