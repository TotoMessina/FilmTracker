import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

export async function openMovieDetails(tmdbId) {
    // 1. Create/Open Modal
    const modalId = 'movieDetailsModal';
    let backdrop = document.getElementById(modalId);
    if (backdrop) backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.id = modalId;
    backdrop.className = 'modal-backdrop active';
    backdrop.style.zIndex = '9000'; // Below Mobile Menu (10000) but above content
    document.body.appendChild(backdrop);

    backdrop.innerHTML = `
        <div class="modal-content" style="max-width: 800px; height: 90vh; display: flex; flex-direction: column; padding: 0; background: var(--background);">
            <div class="loading">Cargando detalles...</div>
        </div>
    `;

    // 2. Fetch Data Parallel
    const [movie, reviews] = await Promise.all([
        TMDB.getMovieDetails(tmdbId),
        fetchMovieReviews(tmdbId)
    ]);

    // 3. Render Content
    const content = backdrop.querySelector('.modal-content');
    content.innerHTML = `
        <!-- Hero Header -->
        <div style="
            position: relative; 
            height: 300px; 
            flex-shrink: 0;
            background-image: url('${TMDB.getImageUrl(movie.backdrop_path, 'w1280')}');
            background-size: cover;
            background-position: center;
        ">
            <div style="
                position: absolute; top:0; left:0; width:100%; height:100%;
                background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, var(--background) 100%);
            "></div>
            
            <button class="modal-close-btn" style="
                position: absolute; top: 16px; right: 16px; 
                background: rgba(0,0,0,0.5); border: none; color: white; 
                width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
            "><i class="fas fa-times"></i></button>

            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; display: flex; align-items: flex-end; gap: 20px;">
                <img src="${TMDB.getImageUrl(movie.poster_path)}" style="
                    width: 100px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    border: 2px solid white;
                ">
                <div style="flex: 1; margin-bottom: 5px;">
                    <h1 style="font-size: 1.5rem; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${movie.title}</h1>
                    <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">
                        ${movie.release_date ? movie.release_date.split('-')[0] : ''} • ${movie.runtime}m • 
                        <i class="fas fa-star" style="color: var(--warning)"></i> ${movie.vote_average.toFixed(1)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Scrollable Body -->
        <div style="flex: 1; overflow-y: auto; padding: 20px;">
            
            <!-- Actions -->
            <div style="display: flex; gap: 10px; margin-bottom: 24px;">
                <button id="detailLogBtn" class="btn btn-primary" style="flex: 1;">
                    <i class="fas fa-plus-circle"></i> Registrar / Puntuar
                </button>
                <button id="detailWatchlistBtn" class="btn btn-secondary" style="flex: 1;">
                    <i class="fas fa-bookmark"></i> Watchlist
                </button>
            </div>

            <!-- Overview -->
            <p style="line-height: 1.6; color: var(--text-muted); margin-bottom: 24px;">
                ${movie.overview || 'Sin descripción disponible.'}
            </p>

            <!-- Metadata Pills -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
                ${movie.genres.map(g => `<span style="background: var(--surface); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; color: var(--text-muted); border: 1px solid var(--border);">${g.name}</span>`).join('')}
            </div>

            <!-- Providers Section -->
            <div style="margin-bottom: 24px;">
                ${(() => {
            const providers = movie['watch/providers']?.results?.MX?.flatrate;
            if (!providers || providers.length === 0) return '';
            return `
                        <h4 style="margin-bottom: 12px; font-size: 0.9rem; color: var(--text-muted);">🎬 Disponible en:</h4>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            ${providers.map(p => `
                                <img src="${TMDB.getImageUrl(p.logo_path, 'original')}" 
                                     title="${p.provider_name}" 
                                     style="width: 40px; height: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            `).join('')}
                        </div>
                    `;
        })()}
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border); margin-bottom: 24px;">

            <!-- Reviews Section -->
            <h3 style="margin-bottom: 16px;">💬 Reseñas de la Comunidad</h3>
            <div id="reviewsList" style="display: flex; flex-direction: column; gap: 16px;">
                ${renderReviewsList(reviews)}
            </div>

        </div>
    `;

    // Events
    const close = () => backdrop.remove();
    backdrop.querySelector('.modal-close-btn').onclick = close;
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); }

    // Action: Log
    document.getElementById('detailLogBtn').onclick = () => {
        close(); // Close details
        // Slight delay to allow smooth transition
        setTimeout(() => {
            import('./logging.js').then(m => m.openLogModal(tmdbId));
        }, 100);
    };

    // Action: Watchlist
    document.getElementById('detailWatchlistBtn').onclick = async () => {
        const btn = document.getElementById('detailWatchlistBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        const { addToWatchlist } = await import('./watchlist.js');
        // Construct basic object for WL
        await addToWatchlist(tmdbId, {
            tmdb_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average
        });
        btn.innerHTML = '<i class="fas fa-check"></i> Agregada';
    };
}

async function fetchMovieReviews(tmdbId) {
    // Determine the movie ID in our DB using tmdbId
    // Update: Logs references movies(tmdb_id) directly if we look at the schema carefully or we should double check.
    // The schema says `tmdb_id integer references movies(tmdb_id)`.
    // So we can query logs directly by tmdb_id.

    const { data: logs } = await supabase
        .from('logs')
        .select(`
            id, rating, review, watched_at,
            profiles:user_id (username, avatar_url)
        `)
        .eq('tmdb_id', tmdbId) // Corrected from movieData.id
        .not('review', 'is', null) // Only with reviews
        .neq('review', '') // Not empty
        .order('watched_at', { ascending: false })
        .limit(20);

    return logs || [];
}

function renderReviewsList(reviews) {
    if (!reviews || reviews.length === 0) {
        return `
            <div style="text-align: center; padding: 20px; background: var(--surface); border-radius: 12px; color: var(--text-muted);">
                <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                Aún no hay reseñas. ¡Sé el primero en opinar!
            </div>
        `;
    }

    return reviews.map(log => `
        <div style="background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); overflow: hidden;">
                         ${log.profiles.avatar_url ? `<img src="${log.profiles.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                    </div>
                    <div>
                        <div style="font-weight: bold; font-size: 0.9rem;">${log.profiles.username}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(log.watched_at).toLocaleDateString()}</div>
                    </div>
                </div>
                ${log.rating ? `
                    <div style="background: ${log.rating >= 8 ? 'var(--success)' : 'var(--warning)'}; color: black; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 0.8rem;">
                        ${log.rating}
                    </div>` : ''}
            </div>
            <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text);">
                "${log.review}"
            </p>
        </div>
    `).join('');
}
