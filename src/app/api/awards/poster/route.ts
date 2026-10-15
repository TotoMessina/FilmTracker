import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TMDB_API_KEY = "31841cf8ea5ec78f32d856ec6e773ea0";
const posterCache = new Map<string, { tmdb_id: number | null; poster_path: string | null }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imdbId = searchParams.get("imdbId")?.trim();
    const title = searchParams.get("title")?.trim();

    const cacheKey = (imdbId || title || "").toLowerCase();
    if (!cacheKey) {
      return NextResponse.json({ tmdb_id: null, poster_path: null });
    }

    if (posterCache.has(cacheKey)) {
      return NextResponse.json(posterCache.get(cacheKey));
    }

    let result: { tmdb_id: number | null; poster_path: string | null } | null = null;

    // 1. Try finding by IMDb ID (tt...)
    if (imdbId && imdbId.startsWith("tt")) {
      try {
        const findUrl = `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=es-MX`;
        const res = await fetch(findUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.movie_results && data.movie_results.length > 0) {
            const m = data.movie_results[0];
            result = { tmdb_id: m.id, poster_path: m.poster_path || null };
          }
        }
      } catch (e) {}
    }

    // 2. Fallback: Search by title in TMDB
    if (!result && title) {
      try {
        const cleanTitle = title.split("|")[0].trim();
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=es-MX`;
        const res = await fetch(searchUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const m = data.results[0];
            result = { tmdb_id: m.id, poster_path: m.poster_path || null };
          }
        }
      } catch (e) {}
    }

    if (!result) {
      result = { tmdb_id: null, poster_path: null };
    }

    posterCache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ tmdb_id: null, poster_path: null });
  }
}
