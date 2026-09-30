"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Globe2, Film, MapPin, Compass } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Log } from "@/lib/supabase/types";

interface CountryStat {
  code: string;
  name: string;
  count: number;
  movies: { id: number; title: string }[];
}

// Country code to emoji flag helper
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function CineTravelerMapPage() {
  const { user, isGuest } = useAuth();
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCountryStats() {
      setLoading(true);
      try {
        let logs: Log[] = [];

        if (user) {
          const { data } = await supabase
            .from("logs")
            .select("*, movie:movies(*)")
            .eq("user_id", user.id);
          if (data) logs = data as Log[];
        } else if (isGuest) {
          logs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
        }

        const map: Record<string, CountryStat> = {};

        logs.forEach((log) => {
          const countriesList = log.movie?.production_countries;
          const movieTitle = log.movie?.title || "Película";
          const tmdbId = log.tmdb_id;

          if (Array.isArray(countriesList)) {
            countriesList.forEach((c) => {
              if (!c.iso_3166_1) return;
              const code = c.iso_3166_1.toUpperCase();
              if (!map[code]) {
                map[code] = {
                  code,
                  name: c.name || code,
                  count: 0,
                  movies: [],
                };
              }
              if (!map[code].movies.some((m) => m.id === tmdbId)) {
                map[code].count += 1;
                map[code].movies.push({ id: tmdbId, title: movieTitle });
              }
            });
          }
        });

        const sorted = Object.values(map).sort((a, b) => b.count - a.count);
        setCountries(sorted);
        if (sorted.length > 0) setSelectedCountry(sorted[0]);
      } catch (err) {
        console.warn("Map error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCountryStats();
  }, [user, isGuest]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cine-Traveler: Mapa Mundial
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Descubre de qué rincones del planeta provienen las historias que has visto.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-400 flex items-center justify-center gap-2">
          <Film className="w-5 h-5 animate-spin text-red-500" />
          <span>Localizando países de origen...</span>
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-20 bg-[#141420]/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto space-y-4">
          <Globe2 className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Aún no hay países registrados</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Cuando registres películas en tu diario, el pasaporte de Cine-Traveler se llenará automáticamente con banderas y conteos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Countries Ranking / Selector */}
          <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Pasaporte Cinéfilo</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                {countries.length} Países visitados
              </span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {countries.map((c) => {
                const isSelected = selectedCountry?.code === c.code;

                return (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCountry(c)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition text-left ${
                      isSelected
                        ? "bg-red-600/20 border-red-500 text-white shadow-md"
                        : "bg-white/5 border-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFlagEmoji(c.code)}</span>
                      <div>
                        <p className="font-bold text-sm leading-tight">{c.name}</p>
                        <span className="text-[11px] text-zinc-400">{c.code}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-zinc-200">
                      {c.count} {c.count === 1 ? "film" : "films"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Country Details and Titles */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#141420] border border-white/5 space-y-6 shadow-xl flex flex-col">
            {selectedCountry ? (
              <>
                <div className="flex items-start justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{getFlagEmoji(selectedCountry.code)}</span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {selectedCountry.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>Código ISO: {selectedCountry.code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-red-500">
                      {selectedCountry.count}
                    </span>
                    <p className="text-xs text-zinc-400">películas vistas</p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <h4 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">
                    Películas de este país en tu diario:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCountry.movies.map((m) => (
                      <Link
                        key={m.id}
                        href={`/movie/${m.id}`}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-white/10 transition flex items-center justify-between group"
                      >
                        <span className="font-semibold text-sm text-zinc-200 group-hover:text-white truncate">
                          {m.title}
                        </span>
                        <Compass className="w-4 h-4 text-zinc-500 group-hover:text-red-400 shrink-0 ml-2" />
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
