import { CONFIG } from './config.js';

const headers = {
    'Authorization': `Bearer ${CONFIG.TMDB_READ_TOKEN}`,
    'Content-Type': 'application/json'
};

export async function searchMovies(query) {
    const url = `${CONFIG.TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=es-MX&page=1`;
    try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error('TMDB Search Error:', error);
        return [];
    }
}

export async function getMovieDetails(tmdbId) {
    const url = `${CONFIG.TMDB_BASE_URL}/movie/${tmdbId}?language=es-MX&append_to_response=credits,watch/providers,keywords`;
    try {
        const res = await fetch(url, { headers });
        return await res.json();
    } catch (error) {
        console.error('TMDB Details Error:', error);
        return null;
    }
}

export async function getTrendingMovies(period = 'week', page = 1) {
    // Handle overload: if first arg is number, treat as page (legacy support)
    if (typeof period === 'number') {
        page = period;
        period = 'week';
    }
    const url = `${CONFIG.TMDB_BASE_URL}/trending/movie/${period}?language=es-MX&page=${page}`;
    return fetchTmdb(url);
}

export async function getRecommendations(tmdbId, page = 1) {
    const url = `${CONFIG.TMDB_BASE_URL}/movie/${tmdbId}/recommendations?language=es-MX&page=${page}`;
    return fetchTmdb(url);
}

export async function discoverMovies(params = {}) {
    const query = new URLSearchParams({
        language: 'es-MX',
        include_adult: 'false',
        ...params
    });
    const url = `${CONFIG.TMDB_BASE_URL}/discover/movie?${query.toString()}`;
    return fetchTmdb(url);
}

export async function getMovieImages(tmdbId) {
    const url = `${CONFIG.TMDB_BASE_URL}/movie/${tmdbId}/images`;
    return fetchTmdb(url);
}

async function fetchTmdb(url) {
    try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error('TMDB Error:', error);
        return [];
    }
}

export function getImageUrl(path, size = 'w500') {
    if (!path) return 'https://placehold.co/500x750?text=No+Image';
    return `${CONFIG.TMDB_IMAGE_BASE.replace('w500', size)}${path}`;
}
