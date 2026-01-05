import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

export async function addToWatchlist(tmdbId, movieData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Inicia sesión primero');

    // Ensure movie is in cache
    const { error: movieError } = await supabase
        .from('movies')
        .upsert(movieData, { onConflict: 'tmdb_id' });

    if (movieError) console.error('Cache error', movieError);

    const { error } = await supabase.from('watchlist').insert({
        user_id: user.id,
        tmdb_id: tmdbId
    });

    if (error) {
        if (error.code === '23505') alert('Ya está en tu Watchlist');
        else alert('Error: ' + error.message);
    } else {
        alert('Añadida a la Watchlist');
    }
}

export async function renderWatchlist(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Cargando watchlist...</div>';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        container.innerHTML = '<p>Inicia sesión para ver tu watchlist.</p>';
        return;
    }

    const { data: watchlist, error } = await supabase
        .from('watchlist')
        .select(`
            *,
            movie:movies(*)
        `)
        .eq('user_id', user.id) // Filter by current user
        .order('added_at', { ascending: false });

    if (error) {
        container.innerHTML = 'Error cargando watchlist.';
        return;
    }

    if (!watchlist || watchlist.length === 0) {
        container.innerHTML = '<p>Tu watchlist está vacía.</p>';
        return;
    }

    // Tools: Shuffle & Time Filter
    const toolsHtml = `
        <div style="margin-bottom: 24px; display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; background:var(--surface); padding:16px; border-radius:12px; border:1px solid var(--border);">
            <div style="flex:1;">
                <label style="display:block; font-size:0.9rem; margin-bottom:8px; color:var(--text-muted);">
                    <i class="fas fa-hourglass-half"></i> ¿Cuánto tiempo tienes? (minutos)
                </label>
                <div style="display:flex; align-items:center; gap:12px;">
                    <input type="range" id="timeSlider" min="60" max="240" value="240" style="flex:1; cursor:pointer;">
                    <span id="timeDisplay" style="font-weight:bold; font-size:1.1rem; min-width:60px; text-align:right;">All</span>
                </div>
            </div>
            
            <button id="shuffleBtn" class="btn btn-primary" style="height:42px;">
                <i class="fas fa-random"></i> Elegir al Azar
            </button>
        </div>
        <div id="watchlistGridStub"></div>
    `;

    container.innerHTML = toolsHtml;

    // Helper to render grid
    const renderGrid = (items) => {
        const gridContainer = document.getElementById('watchlistGridStub');
        if (items.length === 0) {
            gridContainer.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted);">No hay películas tan cortas. ¡Tienes tiempo de ver un corto!</p>';
            return;
        }

        gridContainer.innerHTML = `
            <div class="grid-movies">
                ${items.map(item => {
            // Ribbon Logic
            const today = new Date();
            const theaterCutoff = new Date();
            theaterCutoff.setDate(today.getDate() - 35); // 35 days heuristic
            const releaseDate = new Date(item.movie.release_date);
            let ribbon = '';
            if (item.movie.release_date) {
                if (releaseDate > today) {
                    ribbon = '<div class="ribbon ribbon-upcoming">Próximamente</div>';
                } else if (releaseDate >= theaterCutoff) {
                    ribbon = '<div class="ribbon ribbon-theater">Solo en Cines</div>';
                }
            }

            return `
                    <div class="movie-card" style="cursor:pointer;" onclick="import('./js/features/logging.js').then(m => m.openLogModal(${item.tmdb_id}))">
                        <div class="poster-container" style="position:relative; overflow:hidden; border-radius:12px;">
                            <img src="${TMDB.getImageUrl(item.movie.poster_path)}" class="movie-poster" style="border-radius:0;">
                            ${ribbon}
                        </div>
                        <div class="movie-info">
                            <div class="movie-title">${item.movie.title}</div>
                            <div class="movie-meta">
                                <span style="margin-right:8px;"><i class="fas fa-clock"></i> ${item.movie.runtime}m</span>
                                <span><i class="fas fa-star" style="color:var(--warning);"></i> ${item.movie.vote_average.toFixed(1)}</span>
                            </div>
                            <button class="btn btn-secondary" style="width:100%; margin-top:8px; font-size:0.8rem; position:relative; z-index:2;" onclick="event.stopPropagation(); window.removeFromWatchlist(${item.tmdb_id})">
                                <i class="fas fa-trash"></i> Borrar
                            </button>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
    };

    // Initial render
    renderGrid(watchlist);

    // Event Listeners
    const slider = document.getElementById('timeSlider');
    const display = document.getElementById('timeDisplay');

    slider.addEventListener('input', (e) => {
        const minutes = parseInt(e.target.value);
        if (minutes === 240) {
            display.textContent = 'All';
            renderGrid(watchlist);
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            display.textContent = `${hours}h ${mins}m`; // e.g. 1h 45m

            const filtered = watchlist.filter(item => (item.movie.runtime || 999) <= minutes);
            renderGrid(filtered);
        }
    });

    document.getElementById('shuffleBtn').addEventListener('click', () => {
        // filter based on current slider too? No, shuffle from everything usually better, or current view. 
        // Let's shuffle from current view (filtered)
        const minutes = parseInt(slider.value);
        const sourceList = (minutes === 240) ? watchlist : watchlist.filter(item => (item.movie.runtime || 999) <= minutes);

        if (sourceList.length === 0) return alert('No hay películas para elegir.');

        const random = sourceList[Math.floor(Math.random() * sourceList.length)];
        alert(`¡El destino dice que veas: ${random.movie.title}! (${random.movie.runtime} min)`);
    });
}

// Global helper for the onclick handling in string literal
window.removeFromWatchlist = async (tmdbId) => {
    if (!confirm('¿Borrar de watchlist?')) return;
    const { error } = await supabase.from('watchlist').delete().eq('tmdb_id', tmdbId);
    if (error) alert('Error');
    else {
        // Simple reload
        document.querySelector('.nav-item[data-view="watchlist"]').click();
    }
};
