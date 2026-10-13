"use client";

import { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps/core';
import type { FeatureCollection } from 'geojson';
import { countryColor, countryName, type CineMapCountry } from '@/lib/services/cineMap';

export default function CineMapWorld({ countries }: { countries: CineMapCountry[] }) {
  const [map, setMap] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<{ code: string; name: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/maps/world-countries.json', { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Map unavailable');
      return response.json();
    }).then(setMap).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  const selected = countries.find(country => country.countryCode === active?.code);
  const maximum = Math.max(1, ...countries.map(country => country.count));
  if (error) return <p role="alert" className="p-6 text-zinc-400">No se pudo cargar el mapa. Podés consultar todos los países en el listado de abajo.</p>;
  if (!map) return <p role="status" className="p-10 text-zinc-400 animate-pulse">Desplegando el planisferio…</p>;
  return <div className="relative rounded-2xl border border-white/5 bg-zinc-950/40 overflow-hidden" onMouseLeave={() => setActive(null)}>
    <ComposableMap width={800} height={450} projectionConfig={{ scale: 135, center: [0, 5] }} aria-label="Pasaporte cinematográfico mundial: países por cantidad de visionados">
      <Geographies geography={map}>{({ geographies }) => geographies.filter(geo => (geo.properties as any)?.countryCode !== 'AQ').map(geo => {
        const props = (geo.properties as any) || {};
        const code = String(props.countryCode || '');
        const stat = countries.find(country => country.countryCode === code);
        const name = /^[A-Z]{2}$/.test(code) ? countryName(code) : String(props.name || '');
        const label = `${name}: ${stat?.count || 0} visionados, promedio ${stat?.avgRating === null || !stat ? 'sin puntaje' : stat.avgRating.toFixed(1)}`;
        return <Geography key={geo.rsmKey} geography={geo} tabIndex={0} aria-label={label}
          onMouseEnter={() => setActive({ code, name })} onFocus={() => setActive({ code, name })} onBlur={() => setActive(null)}
          fill={countryColor(stat?.count || 0, maximum)} stroke="#71717a" strokeWidth={0.4}
          style={{ default: { outline: 'none' }, hover: { fill: '#fb7185', outline: 'none', cursor: 'pointer' }, pressed: { fill: '#fda4af' } } as any}>
          <title>{label}</title>
        </Geography>;
      })}</Geographies>
    </ComposableMap>
    {active && <div role="tooltip" className="absolute bottom-3 left-3 pointer-events-none max-w-64 rounded-xl border border-white/15 bg-zinc-950/95 p-3 text-xs shadow-xl">
      <p className="font-bold text-white mb-1">{active.name}</p><p className="text-zinc-300">{selected?.count || 0} visionados · Promedio: {selected?.avgRating == null ? 'sin puntaje' : `${selected.avgRating.toFixed(1)}/10`}</p>
      {!!selected?.movies.length && <ul className="mt-2 space-y-1 text-zinc-400">{selected.movies.map(movie => <li key={movie.id}>{movie.title}</li>)}</ul>}
    </div>}
  </div>;
}
