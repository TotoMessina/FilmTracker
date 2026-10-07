import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getMovieDetails } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

export interface CommunityTrendingMovie {
  rank: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  year?: string;
  watchCount: number;
  averageRating: number | null;
  ratingCount: number;
}

interface CacheEntry {
  data: CommunityTrendingMovie[];
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
let trendingCache: CacheEntry | null = null;

// Curated community fallback in case DB has zero logs
const CURATED_COMMUNITY_TRENDING: CommunityTrendingMovie[] = [
  {
    rank: 1,
    tmdb_id: 872585,
    title: "Oppenheimer",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/rLb2cw69Pazuxaj0sRXQx29x65K.jpg",
    year: "2023",
    watchCount: 38,
    averageRating: 8.8,
    ratingCount: 34,
  },
  {
    rank: 2,
    tmdb_id: 693134,
    title: "Dune: Parte Dos",
    poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520b2.jpg",
    year: "2024",
    watchCount: 32,
    averageRating: 8.6,
    ratingCount: 29,
  },
  {
    rank: 3,
    tmdb_id: 496243,
    title: "Parásitos",
    poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop_path: "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",
    year: "2019",
    watchCount: 28,
    averageRating: 8.9,
    ratingCount: 26,
  },
  {
    rank: 4,
    tmdb_id: 244786,
    title: "Whiplash",
    poster_path: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    backdrop_path: "/6bbZ6XyvgfjhQAhplVUhBu294AM.jpg",
    year: "2014",
    watchCount: 24,
    averageRating: 8.7,
    ratingCount: 22,
  },
  {
    rank: 5,
    tmdb_id: 666277,
    title: "Vidas Pasadas",
    poster_path: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    backdrop_path: "/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    year: "2023",
    watchCount: 21,
    averageRating: 8.4,
    ratingCount: 19,
  },
  {
    rank: 6,
    tmdb_id: 157336,
    title: "Interestelar",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    year: "2014",
    watchCount: 19,
    averageRating: 8.8,
    ratingCount: 18,
  },
  {
    rank: 7,
    tmdb_id: 155,
    title: "El Caballero de la Noche",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
    year: "2008",
    watchCount: 17,
    averageRating: 9.0,
    ratingCount: 16,
  },
  {
    rank: 8,
    tmdb_id: 414906,
    title: "The Batman",
    poster_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    backdrop_path: "/5P8SmMzSNYikXpxil6BYzG16611.jpg",
    year: "2022",
    watchCount: 15,
    averageRating: 8.1,
    ratingCount: 14,
  },
];

export async function GET(req: NextRequest) {
  try {
    // 1. Check in-memory 1 hour cache
    if (trendingCache && Date.now() - trendingCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(trendingCache.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 2. Query Supabase logs from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentLogs, error } = await supabase
      .from("logs")
      .select("tmdb_id, rating, created_at, watched_at, movie:movies(title, poster_path, backdrop_path, release_date)")
      .gte("created_at", sevenDaysAgo.toISOString())
      .limit(300);

    let logsToProcess = recentLogs || [];

    // Fallback to broader recent logs if fewer than 4 movies were logged in the last 7 days
    if (logsToProcess.length < 4) {
      const { data: allLogs } = await supabase
        .from("logs")
        .select("tmdb_id, rating, created_at, watched_at, movie:movies(title, poster_path, backdrop_path, release_date)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (allLogs && allLogs.length > 0) {
        logsToProcess = allLogs;
      }
    }

    if (logsToProcess.length === 0) {
      // Use curated community fallback
      return NextResponse.json(CURATED_COMMUNITY_TRENDING, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 3. Group by tmdb_id, calculate count & average rating
    const map = new Map<number, {
      tmdb_id: number;
      title: string;
      poster_path: string | null;
      backdrop_path: string | null;
      year?: string;
      ratings: number[];
      count: number;
    }>();

    for (const log of logsToProcess) {
      const tmdbId = log.tmdb_id;
      if (!tmdbId) continue;

      const movieObj = (log as any).movie;
      const title = movieObj?.title || `Película #${tmdbId}`;
      const posterPath = movieObj?.poster_path || null;
      const backdropPath = movieObj?.backdrop_path || null;
      const releaseDate = movieObj?.release_date;
      const year = releaseDate ? releaseDate.slice(0, 4) : undefined;

      if (!map.has(tmdbId)) {
        map.set(tmdbId, {
          tmdb_id: tmdbId,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          year,
          ratings: [],
          count: 0,
        });
      }

      const entry = map.get(tmdbId)!;
      entry.count += 1;
      if (typeof log.rating === "number" && !isNaN(log.rating) && log.rating > 0) {
        entry.ratings.push(log.rating);
      }
      if (!entry.poster_path && posterPath) {
        entry.poster_path = posterPath;
      }
      if (!entry.backdrop_path && backdropPath) {
        entry.backdrop_path = backdropPath;
      }
    }

    const items = Array.from(map.values());

    // 4. Sort by count descending, then by average rating descending
    items.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const avgA = a.ratings.length ? a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length : 0;
      const avgB = b.ratings.length ? b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length : 0;
      return avgB - avgA;
    });

    const top10Items = items.slice(0, 10);

    // 5. Enrich any missing posters from TMDB
    const enrichedList: CommunityTrendingMovie[] = await Promise.all(
      top10Items.map(async (item, index) => {
        let poster = item.poster_path;
        let backdrop = item.backdrop_path;
        let finalTitle = item.title;
        let finalYear = item.year;

        if (!poster || !backdrop) {
          try {
            const details = await getMovieDetails(item.tmdb_id);
            if (details) {
              poster = poster || details.poster_path;
              backdrop = backdrop || details.backdrop_path;
              finalTitle = details.title || finalTitle;
              if (!finalYear && details.release_date) {
                finalYear = details.release_date.slice(0, 4);
              }
            }
          } catch {
            // ignore
          }
        }

        const avg = item.ratings.length > 0
          ? Number((item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1))
          : null;

        return {
          rank: index + 1,
          tmdb_id: item.tmdb_id,
          title: finalTitle,
          poster_path: poster,
          backdrop_path: backdrop,
          year: finalYear,
          watchCount: item.count,
          averageRating: avg,
          ratingCount: item.ratings.length,
        };
      })
    );

    // Save to cache
    trendingCache = {
      data: enrichedList,
      timestamp: Date.now(),
    };

    return NextResponse.json(enrichedList, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    console.error("Error en /api/community/trending:", err);
    return NextResponse.json(CURATED_COMMUNITY_TRENDING, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }
}
