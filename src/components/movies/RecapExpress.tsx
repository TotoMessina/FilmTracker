"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Rewind, X, Zap } from 'lucide-react';
import { getCollectionDetails, getMovieDetails, getImageUrl, type TMDBMovie } from '@/lib/tmdb/client';
import { loadRecap, previousCollectionMovie, type CachedRecap } from '@/lib/groq/recap';

export function RecapExpress({ movie }: { movie: TMDBMovie }) {
  const [previous, setPrevious] = useState<TMDBMovie | null>(null);
  const [result, setResult] = useState<CachedRecap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const generating = useRef(false);
  const collectionId = movie.belongs_to_collection?.id;

  useEffect(() => {
    if (!collectionId) return;
    let cancelled = false;
    async function findPrevious() {
      try {
        const collection = await getCollectionDetails(collectionId!);
        const candidate = previousCollectionMovie(movie, collection.parts);
        if (!candidate || cancelled) return;
        const details = await getMovieDetails(candidate.id);
        if (!cancelled) setPrevious(details);
      } catch { /* Without a verified predecessor there is no recap button. */ }
    }
    void findPrevious();
    return () => { cancelled = true; };
  }, [collectionId, movie]);

  async function generate() {
    if (!previous || result || generating.current) return;
    generating.current = true;
    setLoading(true); setError('');
    try { setResult(await loadRecap(movie, previous)); }
    catch (err) { setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'La generación tardó demasiado. Intentá nuevamente.'); }
    finally { setLoading(false); generating.current = false; }
  }

  if (!previous) return null;
  return <>
    <button type="button" onClick={() => { dialog.current?.showModal(); void generate(); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-violet-500/15 border border-violet-400/35 hover:bg-violet-500/25 text-violet-200 text-xs sm:text-sm font-bold transition">
      <Rewind className="w-4 h-4" aria-hidden="true" /> Recap Express
    </button>
    <dialog ref={dialog} aria-labelledby={`recap-heading-${movie.id}`} className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-xl border-0 border-l border-white/10 bg-[#141420] text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="min-h-full p-5 sm:p-8 space-y-7">
        <header className="flex items-start gap-4">
          {previous.poster_path && <Image src={getImageUrl(previous.poster_path, 'w185')} alt={`Póster de ${previous.title}`} width={64} height={96} className="rounded-xl shrink-0" />}
          <div className="flex-1 min-w-0"><p className="text-xs uppercase tracking-wider text-violet-300 font-bold mb-2">Recap Express</p><h2 id={`recap-heading-${movie.id}`} className="text-xl sm:text-2xl font-bold">Antes de ver {movie.title}…</h2><p className="text-sm text-zinc-400 mt-2">Recordá {previous.title} ({previous.release_date?.slice(0, 4)})</p><p className="text-xs text-zinc-500 mt-1">Entrega anterior por orden de estreno</p></div>
          <button type="button" autoFocus aria-label="Cerrar Recap Express" onClick={() => dialog.current?.close()} className="rounded-lg p-2 bg-white/5 hover:bg-white/10 shrink-0"><X size={20} /></button>
        </header>
        {loading && <div role="status" aria-label="Generando Recap Express" className="space-y-7">
          <p className="text-sm text-violet-200">Rebobinando la historia…</p>
          <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none space-y-7"><div className="flex flex-wrap gap-2">{[1, 2, 3].map(n => <div key={n} className="h-10 w-32 rounded-full bg-violet-500/15" />)}</div>{[1, 2].map(n => <div key={n} className="space-y-3"><div className="h-4 rounded bg-zinc-800" /><div className="h-4 rounded bg-zinc-800" /><div className="h-4 w-3/4 rounded bg-zinc-800" /></div>)}<div className="h-28 rounded-2xl bg-amber-500/10" /></div>
        </div>}
        {error && <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 space-y-3"><p className="text-sm text-red-200">{error}</p><button type="button" onClick={() => void generate()} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold">Reintentar</button></div>}
        {result && <div className="space-y-7" aria-live="polite">
          <section><h3 className="font-bold mb-3">Personajes a recordar</h3><ul className="flex flex-wrap gap-2">{result.data.keyCharacters.map((character, index) => <li key={index} className="rounded-2xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-sm text-violet-100 leading-relaxed">{character}</li>)}</ul></section>
          <section aria-label="Resumen de la película anterior" className="space-y-4 text-base leading-8 text-zinc-200">{result.data.recap.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5"><h3 className="font-bold text-amber-300 mb-2">¿Dónde lo dejamos?</h3><p className="text-sm leading-7 text-amber-100">{result.data.cliffhangerNote}</p></section>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400"><Zap size={14} className="text-amber-400" /> Generado por IA en {result.seconds.toFixed(1)} segundos</span>
        </div>}
      </div>
    </dialog>
  </>;
}
