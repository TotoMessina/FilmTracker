"use client";

import { WatchedBadge } from '@/components/movies/WatchedBadge';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { countryFlag, countryName } from '@/lib/services/cineMap';
import { getImageUrl, STREAMING_PROVIDERS } from '@/lib/tmdb/client';

type Result = { recommendations: { id: number; title: string; posterPath: string | null; year: string; reason: string; platforms?: string[] }[]; notice: string | null };

export default function CountryRecommendations({ code, providerIds, watchRegion, onClose }: { code: string; providerIds: number[]; watchRegion: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Iniciá sesión para descubrir recomendaciones personales.');
        const response = await fetch('/api/ai/country-recommendations', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ countryCode: code, providerIds, watchRegion }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No pudimos obtener recomendaciones.');
        if (!controller.signal.aborted) setResult(data);
      } catch (err) { if (!controller.signal.aborted) setError((err as Error).message); }
    })();
    return () => controller.abort();
  }, [code, attempt, providerIds, watchRegion]);
  return <dialog ref={dialog} onClose={onClose} aria-labelledby="country-recommendations-title" className="m-auto w-[calc(100%-2rem)] max-w-4xl max-h-[90dvh] overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950 p-5 sm:p-8 text-white shadow-2xl backdrop:bg-black/80">
    <header className="flex items-start justify-between gap-4 mb-6"><div><p className="flex items-center gap-2 text-xs text-red-300 font-bold uppercase tracking-widest"><Sparkles size={16} /> CineMap · Curaduría IA</p><h2 id="country-recommendations-title" className="text-2xl font-black mt-2">{countryFlag(code)} Tu próxima parada: {countryName(code)}</h2><p className="text-sm text-zinc-400 mt-2">Tres descubrimientos según tu historial y tus puntajes. Según el país de origen.</p></div><button autoFocus onClick={() => dialog.current?.close()} aria-label="Cerrar recomendaciones" className="rounded-full p-2 hover:bg-white/10"><X /></button></header>
    {!!providerIds.length && <p className="mb-5 rounded-xl bg-white/5 p-3 text-sm text-zinc-300">Suscripciones en {countryName(watchRegion)}: {STREAMING_PROVIDERS.filter(provider => providerIds.includes(provider.id)).map(provider => provider.name).join(' / ')}. Para cambiar los filtros, cerrá esta ventana.</p>}
    {error ? <div role="alert" className="p-5 rounded-xl bg-red-500/10 text-red-200"><p>{error}</p><button className="underline mt-3" onClick={() => { setError(''); setAttempt(n => n + 1); }}>Reintentar</button></div> : !result ? <div role="status" aria-live="polite"><p className="text-zinc-400 mb-4">Buscando películas y conectándolas con tus gustos…</p><div className="grid sm:grid-cols-3 gap-4">{[1, 2, 3].map(n => <div key={n} className="animate-pulse rounded-xl bg-white/5 p-4"><div className="aspect-[2/3] rounded-lg bg-white/10" /><div className="h-5 bg-white/10 rounded mt-4" /><div className="h-16 bg-white/10 rounded mt-3" /></div>)}</div></div> : <>
      {result.notice && <p role="status" className="text-amber-200 bg-amber-500/10 rounded-xl p-4 mb-4 text-sm">{result.notice}</p>}
      <div className="grid sm:grid-cols-3 gap-5">{result.recommendations.map(movie => <article key={movie.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"><Link href={`/movie/${movie.id}`} className="block relative aspect-[2/3]">
<WatchedBadge movieId={movie.id ?? 0} className="top-10 left-1" />{movie.posterPath ? <Image src={getImageUrl(movie.posterPath, 'w500')} alt={`Póster de ${movie.title}`} fill sizes="(max-width: 640px) 85vw, 260px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-zinc-500">Sin póster</span>}</Link><div className="p-4"><Link href={`/movie/${movie.id}`} className="font-bold hover:text-red-300">{movie.title} <span className="text-zinc-400 font-normal">({movie.year})</span></Link><p className="text-sm leading-relaxed text-zinc-300 mt-3">{movie.reason}</p>{!!movie.platforms?.length && <p className="mt-3 text-xs text-emerald-300">Incluida en: {movie.platforms.join(' / ')}</p>}<Link href={`/movie/${movie.id}`} className="inline-block text-sm text-red-300 mt-4 underline">Ver película</Link></div></article>)}</div>
      {!!result.recommendations.length && <p className="mt-5 text-xs text-zinc-500">Selección generada por IA · Películas y país de origen verificados en TMDB.</p>}
    </>}
    {!!providerIds.length && <p className="mt-4 text-xs text-zinc-500">Disponibilidad: TMDB / JustWatch. El catálogo puede cambiar.</p>}
  </dialog>;
}
