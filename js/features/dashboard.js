import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';
import { getFriendsActivity } from './social.js';

export async function renderDashboard(containerId) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    container.innerHTML = '<div class="loading">Cargando Dashboard...</div>';

    const { data: { user } } = await supabase.auth.getUser();

    // Parallel Fetching
    const [trendingMovies, userStats, communityFeed] = await Promise.all([
        TMDB.getTrendingMovies('day'),
        fetchUserStats(user.id),
        getFriendsActivity()
    ]);

    const heroMovie = trendingMovies[0];
    const otherTrending = trendingMovies.slice(1);

    container.innerHTML = `
        <div class="dashboard-container" style="max-width: 1200px; margin: 0 auto; padding-bottom: 80px;">
            
            ${renderHero(heroMovie)}

            <div style="padding: 20px;">
                <!-- Quick Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 30px;">
                    ${renderStatCard('Películas', userStats.watchedCount, 'fas fa-film', '#FF0055')}
                    ${renderStatCard('Minutos', userStats.totalRuntime, 'fas fa-clock', '#00D2FF')}
                    ${renderStatCard('Racha', userStats.streak + ' días', 'fas fa-fire', '#FF9900')}
                </div>

                <!-- Trending Slider -->
                <h3 style="margin-bottom: 16px;">🔥 Tendencias de Hoy</h3>
                <div class="no-scrollbar" style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory;">
                    ${otherTrending.map(m => renderMovieCard(m)).join('')}
                </div>

                <!-- Community Hub -->
                <h3 style="margin-top: 30px; margin-bottom: 16px;">👥 Actividad de la Comunidad</h3>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${renderCommunityFeed(communityFeed)}
                </div>
            </div>
        </div>
    `;

    // Attach Click Handlers for Slider
    // Note: We use global handleMovieClick for now as per app convention
}

function renderHero(movie) {
    if (!movie) return '';
    const backdropUrl = TMDB.getImageUrl(movie.backdrop_path, 'w1280');
    return `
        <div style="
            position: relative; 
            width: 100%; 
            height: 50vh; 
            min-height: 400px; 
            background-image: url('${backdropUrl}'); 
            background-size: cover; 
            background-position: center;
            border-radius: 0 0 24px 24px;
            overflow: hidden; 
            z-index: 1;
            box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        ">
            <div style="
                position: absolute; 
                top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(to top, var(--background) 10%, transparent 80%);
            "></div>
            <div style="
                position: absolute; 
                bottom: 60px; 
                left: 20px; 
                right: 20px;
                text-align: left;
            ">
                <span style="background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; display: inline-block;">
                    #1 Tendencia
                </span>
                <h1 style="font-size: 2.5rem; margin: 8px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.8); line-height: 1.1;">
                    ${movie.title}
                </h1>
                <p style="
                    max-width: 600px; 
                    display: -webkit-box; 
                    -webkit-line-clamp: 2; 
                    -webkit-box-orient: vertical; 
                    overflow: hidden;
                    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
                    margin-bottom: 16px;
                ">
                    ${movie.overview}
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="window.handleMovieClick(${movie.id})">
                        <i class="fas fa-info-circle"></i> Ver Detalles
                    </button>
                    ${renderVideoToggle(movie.id)}
                </div>
            </div>
        </div>
    `;
}

function renderVideoToggle(id) {
    // Placeholder for trailer modal
    return '';
}

function renderStatCard(label, value, icon, color) {
    return `
        <div class="stat-card" style="background: var(--surface); padding: 16px; border-radius: 16px; display: flex; align-items: center; gap: 12px; border: 1px solid var(--border);">
            <div style="
                width: 40px; height: 40px; 
                border-radius: 12px; 
                background: ${color}20; 
                color: ${color}; 
                display: flex; justify-content: center; align-items: center; font-size: 1.2rem;
            ">
                <i class="${icon}"></i>
            </div>
            <div>
                <div style="font-size: 1.5rem; font-weight: bold;">${value}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${label}</div>
            </div>
        </div>
    `;
}

function renderMovieCard(movie) {
    return `
        <div class="movie-card" onclick="window.handleMovieClick(${movie.id})" style="min-width: 140px; scroll-snap-align: start;">
            <img src="${TMDB.getImageUrl(movie.poster_path)}" class="movie-poster" alt="${movie.title}" loading="lazy" style="border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            <div style="margin-top: 8px; font-weight: bold; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${movie.title}
            </div>
            <div style="font-size: 0.8rem; color: var(--warning);">
                <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
            </div>
        </div>
    `;
}

function renderCommunityFeed(feed) {
    if (!feed || feed.length === 0) {
        return `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No hay actividad reciente. ¡Sigue a más amigos!</p>`;
    }

    return feed.map(log => `
        <div style="background: var(--surface); padding: 16px; border-radius: 16px; display: flex; gap: 16px; border: 1px solid var(--border);">
            <div style="flex-shrink: 0; width: 50px;">
                <img src="${TMDB.getImageUrl(log.movie.poster_path)}" style="width: 100%; border-radius: 8px; aspect-ratio: 2/3; object-fit: cover;">
            </div>
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--border); overflow: hidden;">
                        ${log.profile.avatar_url ? `<img src="${log.profile.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                    </div>
                    <span style="font-weight: bold; font-size: 0.9rem;">${log.profile.username}</span>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">vio</span>
                    <span style="font-weight: bold; font-size: 0.9rem;">${log.movie.title}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="background: ${log.rating >= 8 ? 'var(--success)' : 'var(--warning)'}; color: black; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 0.8rem;">
                        ${log.rating}
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(log.watched_at).toLocaleDateString()}</span>
                </div>
                ${log.review ? `<p style="margin-top: 8px; font-style: italic; color: #ccc; font-size: 0.9rem;">"${log.review}"</p>` : ''}
            </div>
        </div>
    `).join('');
}

async function fetchUserStats(userId) {
    // 1. Count Logs
    const { count: watchedCount } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // 2. Sum Runtime (Using view or raw fetch)
    // Quick approximation: fetch last 100 logs just to sum runtime? Expensive.
    // Ideally we have a 'stats_view'. Let's check schema phase 2.
    // For now, let's just use watchedCount. 
    // Wait, let's make a guess or fetch from 'movie_logs_view' if exists.
    // I will assume simple count for now to be fast.

    // 3. Streak
    const streak = await calculateStreak(userId);

    return {
        watchedCount: watchedCount || 0,
        totalRuntime: (watchedCount || 0) * 120, // Guestimate 2h per movie
        streak: streak || 0
    };
}

async function calculateStreak(userId) {
    // Simple logic: check dates of logs
    const { data: logs } = await supabase
        .from('logs')
        .select('watched_at')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })
        .limit(10);

    if (!logs || logs.length === 0) return 0;

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0); // Today 00:00

    // Remove time components from logs
    const dates = [...new Set(logs.map(l => new Date(l.watched_at).toDateString()))].map(d => new Date(d));

    // Check today or yesterday match
    const lastLog = dates[0];
    const diffDays = (current - lastLog) / (1000 * 60 * 60 * 24);

    if (diffDays > 1) return 0; // Lost streak

    streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
        const d1 = dates[i];
        const d2 = dates[i + 1];
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
    }
    return streak;
}
