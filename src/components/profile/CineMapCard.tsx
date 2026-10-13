"use client";

import { lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Globe2, Loader2 } from 'lucide-react';
import { countryFlag, getCineMapInsights, getCineMapStats, loadCineMapLogs, type CineMapCountry } from '@/lib/services/cineMap';
import type { Log } from '@/lib/supabase/types';
import { useApp } from '@/lib/context/AppContext';

const WorldMap = lazy(() => import('./CineMapWorld'));
const subscribe = (callback: () => void) => {
  const query = window.matchMedia('(min-width: 768px)'); query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};

function CountryList({ countries }: { countries: CineMapCountry[] }) {
  return <ul className="grid sm:grid-cols-2 gap-3">{countries.map(country => <li key={country.countryCode} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
    <div className="flex items-center justify-between gap-2"><h3 className="font-bold text-sm text-white">{countryFlag(country.countryCode)} {country.countryName}</h3><span className="text-red-300 text-sm shrink-0">{country.count} vistas</span></div>
    <p className="text-xs text-zinc-400">Nota promedio: {country.avgRating === null ? 'sin puntaje' : `${country.avgRating.toFixed(1)}/10`}</p>
    <ul className="space-y-1">{country.movies.map(movie => <li key={movie.id}><Link href={`/movie/${movie.id}`} className="text-xs text-zinc-300 hover:text-white hover:underline">{movie.title}</Link></li>)}</ul>
  </li>)}</ul>;
}

export default function CineMapCard({ userId }: { userId: string }) {
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia('(min-width: 768px)').matches, () => false);
  const { lastUpdated } = useApp();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState('Preparando el pasaporte…');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(async () => {
      if (controller.signal.aborted) return;
      setLoading(true); setError(''); setWarning('');
      try {
        const data = await loadCineMapLogs(userId, text => { if (!controller.signal.aborted) setProgress(text); }, controller.signal);
        if (controller.signal.aborted) return;
        setLogs(data.logs);
        setWarning([data.failures ? `${data.failures} películas no se pudieron consultar en TMDB.` : '', data.unsaved ? `${data.unsaved} países consultados se muestran, pero no se pudieron guardar.` : ''].filter(Boolean).join(' '));
      } catch (err) { if (!controller.signal.aborted) setError((err as Error).message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    });
    return () => controller.abort();
  }, [userId, attempt, lastUpdated]);
  const countries = useMemo(() => getCineMapStats(logs), [logs]);
  const insights = useMemo(() => getCineMapInsights(logs, countries), [logs, countries]);
  return <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#171420] to-[#100d16] p-5 sm:p-7 space-y-6">
    <header><p className="text-xs uppercase tracking-widest text-red-400 font-bold flex gap-2 items-center"><Globe2 size={18} /> CineMap</p><h2 className="mt-2 text-2xl font-black text-white">Pasaporte Cinematográfico Mundial</h2><p className="text-sm text-zinc-400 mt-2">Cada película es un sello. Descubrí de dónde vienen las historias de tu diario.</p></header>
    {loading ? <p role="status" className="flex gap-2 items-center text-zinc-400 py-12"><Loader2 className="animate-spin" size={20} />{progress}</p> : error ? <div role="alert" className="space-y-3 text-red-300"><p>{error}</p><button onClick={() => setAttempt(n => n + 1)} className="underline">Reintentar</button></div> : <>
      {warning && <p role="status" className="text-sm text-amber-300">{warning} <button onClick={() => setAttempt(n => n + 1)} className="underline">Reintentar</button></p>}
      {!logs.length && <p className="text-zinc-400">Registrá tu primera película para empezar a llenar este pasaporte.</p>}
      {insights.suggestion && <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200 leading-relaxed">{insights.suggestion}</p>}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">
        <div className="min-w-0 space-y-3">{desktop ? <><Suspense fallback={<p className="p-10 text-zinc-400">Cargando mapa…</p>}><WorldMap countries={countries} /></Suspense><div className="flex items-center justify-center gap-3 text-xs text-zinc-500"><span>Sin visitas</span><span className="h-2 w-32 rounded-full bg-gradient-to-r from-zinc-800 to-red-600" /><span>Más visitas</span></div><p className="text-xs text-zinc-500">Pasá el cursor o usá Tab para explorar cada país.</p></> : <CountryList countries={countries} />}
          {!countries.length && logs.length > 0 && <p className="text-sm text-zinc-400">Todavía no hay países disponibles para este historial.</p>}
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
          <div><p className="text-xs text-zinc-400">Diversidad mundial</p><p className="text-3xl font-black text-white mt-1">{insights.diversity.toFixed(1)}%</p><p className="text-xs text-zinc-500">{insights.visited} de 195 países</p></div>
          <span className="inline-block rounded-full bg-red-500/15 border border-red-500/25 px-3 py-2 text-xs font-bold text-red-200">{insights.badge}</span>
          <div><h3 className="font-bold text-white text-sm mb-3">Top 5 países visitados</h3><ol className="space-y-3">{countries.slice(0, 5).map(country => <li key={country.countryCode} className="flex justify-between gap-3 text-xs text-zinc-300"><span>{countryFlag(country.countryCode)} {country.countryName}</span><strong>{country.count}</strong></li>)}</ol></div>
        </aside>
      </div>
      {desktop && countries.length > 0 && <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm text-zinc-300 font-semibold">Todos los países y territorios ({countries.length})</summary><div className="mt-4"><CountryList countries={countries} /></div></details>}
      <p className="text-xs text-zinc-500 leading-relaxed">{logs.length} visionados · {insights.unknown} sin país conocido. Las coproducciones suman una visita en cada país y las revisitas cuentan. El promedio excluye puntajes vacíos. La diversidad usa 193 miembros de la ONU y 2 observadores; los territorios se muestran aparte del cálculo. Algunos países pequeños solo aparecen en el listado.</p>
      <p className="text-xs text-zinc-600">Países de producción: TMDB · Cartografía: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer" className="underline">Natural Earth</a></p>
    </>}
  </section>;
}
