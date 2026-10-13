import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { POPULAR_STREAMING_PLATFORMS } from '@/lib/services/streamingPlatforms';

// 6-hour cache per user: key: userId -> { timestamp, data }
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const userExpiringCache = new Map<string, { timestamp: number; data: any }>();

export interface ExpiringMovieItem {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  platform: {
    id: number;
    name: string;
    logo: string;
  };
  expiresAt: string;
  daysLeft: number;
}

// Helper to query JustWatch's GraphQL API for real availability and expiration dates
async function fetchJustWatchOffers(title: string, releaseYear?: number, country = 'AR'): Promise<any[]> {
  try {
    const query = {
      operationName: "GetTitleOffers",
      variables: {
        country,
        language: "es",
        filter: {
          searchQuery: title
        }
      },
      query: `
        query GetTitleOffers($country: Country!, $language: Language!, $filter: TitleFilter) {
          popularTitles(country: $country, filter: $filter, first: 3) {
            edges {
              node {
                id
                content(country: $country, language: $language) {
                  title
                  originalReleaseYear
                }
                offers(country: $country, platform: WEB) {
                  monetizationType
                  package {
                    packageId
                    clearName
                  }
                  availableTo
                }
              }
            }
          }
        }
      `
    };

    const res = await fetch('https://apis.justwatch.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify(query)
    });

    if (!res.ok) return [];
    const data = await res.json();
    const edges = data?.data?.popularTitles?.edges || [];
    if (edges.length === 0) return [];

    let chosenNode = edges[0]?.node;
    if (releaseYear) {
      const yearMatch = edges.find((e: any) => Math.abs((e.node?.content?.originalReleaseYear || 0) - releaseYear) <= 1);
      if (yearMatch) chosenNode = yearMatch.node;
    }

    return chosenNode?.offers || [];
  } catch (err) {
    console.warn(`Error consultando JustWatch para "${title}":`, err);
    return [];
  }
}

// Helper to match JustWatch package ID to the user's platform definition
function matchUserPlatform(packageId: number, clearName: string, userPlatformIds: number[]) {
  let matchedId: number | null = null;
  if (userPlatformIds.includes(packageId)) {
    matchedId = packageId;
  } else if ((packageId === 9 || packageId === 119) && userPlatformIds.includes(119)) {
    matchedId = 119;
  } else if ((packageId === 384 || packageId === 1899) && userPlatformIds.includes(1899)) {
    matchedId = 1899;
  }

  if (!matchedId) return null;
  const def = POPULAR_STREAMING_PLATFORMS.find((p) => p.id === matchedId);
  return {
    id: matchedId,
    name: def?.name || clearName,
    logo: def?.logo || '',
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isSimulate = searchParams.get('simulate') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere userId para obtener el radar de streaming.' },
        { status: 400 }
      );
    }

    // Check 6-hour cache (skip if ?fresh=true or simulating)
    const skipCache = searchParams.get('fresh') === 'true' || isSimulate;
    const cached = userExpiringCache.get(userId);
    const now = new Date();
    if (!skipCache && cached && now.getTime() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    // 1. Fetch user's watchlist
    const tmdbIdsParam = searchParams.get('tmdbIds');
    let watchlistItems: Array<{ tmdb_id: number; movie_title?: string; poster_path?: string | null }> = [];

    const { data: watchlist, error: wlError } = await supabase
      .from('watchlist')
      .select('tmdb_id, title')
      .eq('user_id', userId);

    if (watchlist && watchlist.length > 0) {
      watchlistItems = watchlist.map((w: any) => ({
        tmdb_id: w.tmdb_id,
        movie_title: w.title,
      }));
    } else if (tmdbIdsParam) {
      const parsedIds = tmdbIdsParam.split(',').map(Number).filter((n) => !isNaN(n) && n > 0);
      watchlistItems = parsedIds.map((id) => ({ tmdb_id: id }));
    }

    if (watchlistItems.length === 0) {
      const emptyResult = { expiringSoon: [], message: 'Watchlist vacía.' };
      return NextResponse.json(emptyResult);
    }

    // 2. Fetch user's active streaming platforms
    let userPlatformIds: number[] = [8, 1899, 119, 337]; // default popular platforms (Netflix, Max, Prime, Disney+)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('streaming_platforms')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.streaming_platforms) {
        const raw = profile.streaming_platforms;
        const parsed = Array.isArray(raw)
          ? raw.map(Number)
          : typeof raw === 'string'
          ? JSON.parse(raw).map(Number)
          : [];
        if (parsed.length > 0) userPlatformIds = parsed;
      }
    } catch (err) {
      console.warn('Error leyendo streaming_platforms del perfil:', err);
    }

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '31841cf8ea5ec78f32d856ec6e773ea0';
    const expiringSoon: ExpiringMovieItem[] = [];

    // 3. Evaluate each watchlist movie with STRICT real-world criteria
    for (const item of watchlistItems.slice(0, 25)) {
      try {
        const tmdbUrl = `https://api.themoviedb.org/3/movie/${item.tmdb_id}?api_key=${apiKey}&language=es-MX&append_to_response=watch/providers`;
        const movieData = await fetch(tmdbUrl).then((r) => r.json());

        // CRITICAL CHECK 1: The movie MUST be released and already premiered!
        // If it is in Post Production, Planned, or release_date is in the future, it CANNOT be on streaming.
        const releaseDate = movieData.release_date ? new Date(movieData.release_date) : null;
        const isReleased = movieData.status === 'Released' && releaseDate !== null && releaseDate <= now;
        if (!isReleased) {
          continue;
        }

        // CRITICAL CHECK 2: The movie MUST actually be on flatrate streaming on the user's platforms!
        // Never fabricate or force fallback platforms onto movies not available on them.
        const regions = ['AR', 'MX', 'ES', 'US', 'CL', 'CO'];
        let hasActiveFlatrate = false;
        let matchedCandidatePlatform: { id: number; name: string; logo: string } | null = null;

        for (const reg of regions) {
          const flatrate = movieData['watch/providers']?.results?.[reg]?.flatrate;
          if (Array.isArray(flatrate)) {
            for (const prov of flatrate) {
              if (userPlatformIds.includes(prov.provider_id)) {
                hasActiveFlatrate = true;
                const matchedDef = POPULAR_STREAMING_PLATFORMS.find((p) => p.id === prov.provider_id);
                if (!matchedCandidatePlatform) {
                  matchedCandidatePlatform = {
                    id: prov.provider_id,
                    name: matchedDef?.name || prov.provider_name,
                    logo: matchedDef?.logo || prov.logo_path || '',
                  };
                }
              }
            }
          }
        }

        // If not available on user's active streaming services, skip
        if (!hasActiveFlatrate || !matchedCandidatePlatform) {
          continue;
        }

        // CRITICAL CHECK 3: Query JustWatch for verified upcoming expiration (availableTo <= 30 days)
        const releaseYear = releaseDate?.getFullYear();
        const jwOffers = await fetchJustWatchOffers(movieData.title || item.movie_title || '', releaseYear, 'AR');

        let foundRealExpiration = false;
        if (Array.isArray(jwOffers)) {
          for (const offer of jwOffers) {
            if (offer.monetizationType === 'FLATRATE' && offer.availableTo) {
              const matchedPlat = matchUserPlatform(offer.package?.packageId, offer.package?.clearName, userPlatformIds);
              if (matchedPlat) {
                const expDate = new Date(offer.availableTo);
                const diffTime = expDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Only titles with real expiration in the next 30 days
                if (daysLeft > 0 && daysLeft <= 30) {
                  expiringSoon.push({
                    tmdb_id: item.tmdb_id,
                    title: movieData.title || item.movie_title || 'Película',
                    poster_path: item.poster_path || movieData.poster_path || null,
                    platform: matchedPlat,
                    expiresAt: expDate.toISOString(),
                    daysLeft,
                  });
                  foundRealExpiration = true;
                  break;
                }
              }
            }
          }
        }

        // Optional simulation ONLY if explicitly requested via ?simulate=true AND movie is confirmed released & on streaming
        if (!foundRealExpiration && isSimulate) {
          const simDays = ((item.tmdb_id % 15) + 3);
          const simExpDate = new Date(now.getTime() + simDays * 24 * 60 * 60 * 1000);
          expiringSoon.push({
            tmdb_id: item.tmdb_id,
            title: movieData.title || item.movie_title || 'Película',
            poster_path: item.poster_path || movieData.poster_path || null,
            platform: matchedCandidatePlatform,
            expiresAt: simExpDate.toISOString(),
            daysLeft: simDays,
          });
        }
      } catch (err) {
        console.warn(`Error evaluando streaming para tmdb_id ${item.tmdb_id}:`, err);
      }
    }

    // Sort by days left ascending (most urgent first)
    expiringSoon.sort((a, b) => a.daysLeft - b.daysLeft);

    const result = {
      expiringSoon,
      cached: false,
      userPlatformsCount: userPlatformIds.length,
      fallbackNotice: "El radar de streaming no detectó títulos próximos a expirar en tus plataformas en este momento. Podés verificar el catálogo en JustWatch."
    };

    // Store in cache
    userExpiringCache.set(userId, { timestamp: now.getTime(), data: result });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/streaming/expiring:', error);
    return NextResponse.json(
      {
        expiringSoon: [],
        error: 'El radar de streaming no está disponible en este momento. Revisá manualmente en JustWatch.',
        fallbackUrl: 'https://www.justwatch.com/es',
      },
      { status: 500 }
    );
  }
}
