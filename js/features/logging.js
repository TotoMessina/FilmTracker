import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

// Elements
const modal = document.getElementById('logModal');
const modalBody = document.getElementById('logModalBody');
const closeBtn = document.querySelector('.modal-close');

let currentMovie = null;
let selectedPosterPath = null; // [NEW] Track selected poster
let currentLogId = null; // [NEW] Track if we are editing

// Initialize events
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

function closeModal() {
    modal.classList.remove('active');
    modalBody.innerHTML = '';
    currentMovie = null;
    selectedPosterPath = null;
    currentLogId = null;
}

export async function openLogModal(tmdbId, existingLog = null) {
    modal.classList.add('active');
    modalBody.innerHTML = '<div class="loading">Cargando detalles...</div>';

    currentLogId = existingLog ? existingLog.id : null;
    currentMovie = await TMDB.getMovieDetails(tmdbId);
    selectedPosterPath = existingLog ? existingLog.custom_poster_path : currentMovie.poster_path;

    await renderLogForm(existingLog);
}

async function renderLogForm(existingLog = null) {
    const { data: { user } } = await supabase.auth.getUser(); // Get user for friend fetch
    const m = currentMovie;
    const year = m.release_date ? m.release_date.split('-')[0] : '';
    const providers = m['watch/providers']?.results?.ES?.flatrate || [];
    const providersHtml = providers.slice(0, 3).map(p =>
        `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}" style="width:24px;border-radius:4px;">`
    ).join(' ');

    const hasPostCredits = m.keywords?.keywords?.some(k => k.id === 179430 || k.id === 179431);

    // --- NEW: Fetch Friends for "Watched With" ---
    let friendsHtml = '';

    // Fetch existing companions if editing
    let existingCompanions = [];
    if (existingLog) {
        const { data: comps } = await supabase.from('log_companions').select('user_id').eq('log_id', existingLog.id);
        existingCompanions = comps ? comps.map(c => c.user_id) : [];
    }

    if (user) {
        try {
            const socialMod = await import('./social.js');
            const friends = await socialMod.getFollowers(user.id);
            if (friends && friends.length > 0) {
                friendsHtml = `
                    <div style="grid-column: 1 / -1;">
                        <label style="display:block; font-size:0.8rem; margin-bottom:4px;">¿Con quién la viste? 👥</label>
                        <div class="companions-grid" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">
                            ${friends.map(f => `
                                <label style="display:flex; align-items:center; gap:6px; background:var(--surface); padding:6px 12px; border-radius:20px; cursor:pointer; border:1px solid var(--border); font-size:0.85rem;">
                                    <input type="checkbox" name="companion" value="${f.id}" style="accent-color:var(--primary);" ${existingCompanions.includes(f.id) ? 'checked' : ''}>
                                    ${f.username || 'Amigo'}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Error loading friends:', err);
        }
    }

    const defaultDate = existingLog ? existingLog.watched_at : new Date().toISOString().split('T')[0];
    const defaultRating = existingLog ? existingLog.rating : '';
    const defaultReview = existingLog ? existingLog.review || '' : '';

    modalBody.innerHTML = `
        <div class="log-poster" style="position:relative;">
            <img id="formPoster" src="${TMDB.getImageUrl(selectedPosterPath)}" style="width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
            <button id="changePosterBtn" class="btn btn-sm btn-secondary" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); z-index:10; opacity:0.9;">
                <i class="fas fa-image"></i> Cambiar
            </button>
            <div style="margin-top:16px; font-size:0.9rem; color:var(--text-muted);">
                <div><i class="fas fa-clock"></i> ${m.runtime} min</div>
                <div style="margin-top:4px;">${m.genres.map(g => g.name).slice(0, 3).join(', ')}</div>
                <div style="margin-top:8px;">${providersHtml}</div>
                ${hasPostCredits ?
            `<div style="margin-top:12px; background:rgba(255,255,255,0.1); padding:8px; border-radius:6px; font-size:0.8rem; color:#ffd700; border:1px solid #ffd700;">
                        <i class="fas fa-exclamation-triangle"></i> Tiene Escena Post-Créditos
                    </div>`
            : ''}
            </div>
        </div>

        <div class="log-form-container">
            <h2 style="margin-bottom:4px;">${existingLog ? 'Editar: ' : ''}${m.title} <span style="font-weight:400; color:var(--text-muted);">(${year})</span></h2>
            
            <form id="logForm" style="margin-top:24px; display:flex; flex-direction:column; gap:16px;">
                <!-- Date & Rewatch -->
                <div style="display:flex; gap:16px;">
                    <div style="flex:1;">
                        <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Fecha de Visualización</label>
                        <input type="date" name="watched_at" class="form-input" value="${defaultDate}" required>
                    </div>
                    <div style="display:flex; align-items:flex-end; padding-bottom:10px;">
                        <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                            <input type="checkbox" name="is_rewatch" ${existingLog?.is_rewatch ? 'checked' : ''}> <span>Es Rewatch?</span>
                        </label>
                    </div>
                </div>

                <!-- Rating -->
                <div>
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Tu Puntuación (0-10)</label>
                    <input type="number" name="rating" class="form-input" min="0" max="10" step="0.5" value="${defaultRating}" placeholder="8.5">
                </div>

                <!-- Context -->
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
                    <div>
                        <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Plataforma</label>
                        <select name="platform" class="form-input">
                            <option value="">Seleccionar...</option>
                            ${['Netflix', 'HBO Max', 'Disney+', 'Prime Video', 'Cine', 'Archivo'].map(o => `<option value="${o}" ${existingLog?.platform === o ? 'selected' : ''}>${o}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                         <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Formato</label>
                         <select name="format" class="form-input">
                            <option value="">Normal</option>
                            ${['4K', 'IMAX', '3D'].map(o => `<option value="${o}" ${existingLog?.format === o ? 'selected' : ''}>${o}</option>`).join('')}
                        </select>
                    </div>
                     <div>
                         <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Compañía</label>
                         <select name="company" class="form-input">
                            <option value="Solo">Solo</option>
                            <option value="Pareja">Pareja</option>
                            <option value="Amigos">Amigos</option>
                            <option value="Familia">Familia</option>
                        </select>
                    </div>
                </div>

                <!-- Review -->
                <div>
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Reseña (Opcional)</label>
                    <textarea name="review" class="form-input" rows="3" placeholder="¿Qué te pareció...">${defaultReview}</textarea>
                </div>
                
                ${friendsHtml}

                <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;">
                    <button type="button" class="btn btn-secondary" id="addToWlBtn"><i class="fas fa-plus"></i> Watchlist</button>
                    <button type="button" class="btn btn-secondary modal-close-internal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${existingLog ? 'Actualizar' : 'Guardar Log'}</button>
                </div>
            </form>
        </div>
    `;

    // Listeners and Helper Logic
    document.getElementById('logForm').addEventListener('submit', handleLogSubmit);
    document.getElementById('addToWlBtn').addEventListener('click', handleAddToWatchlist);
    document.querySelector('.modal-close-internal').addEventListener('click', closeModal);

    // Poster Change Listener
    document.getElementById('changePosterBtn').addEventListener('click', async () => {
        const btn = document.getElementById('changePosterBtn');
        btn.textContent = 'Cargando...';

        const images = await TMDB.getMovieImages(currentMovie.id);
        if (!images?.posters?.length) {
            alert('No hay pósters alternativos.');
            btn.innerHTML = '<i class="fas fa-image"></i> Cambiar';
            return;
        }

        showPosterSelector(images.posters);
        btn.innerHTML = '<i class="fas fa-image"></i> Cambiar';
    });
}

// ... showPosterSelector remains same ...

async function handlePosterSelect(posterPath) {
    selectedPosterPath = posterPath;
    document.getElementById('formPoster').src = TMDB.getImageUrl(selectedPosterPath);
    document.querySelector('.poster-selector-overlay').remove();
}

function showPosterSelector(posters) {
    const overlay = document.createElement('div');
    overlay.className = 'poster-selector-overlay';
    overlay.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; padding:20px; overflow-y:auto;`;

    overlay.innerHTML = `
        <div style="max-width:1000px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:white;">Selecciona un Póster</h2>
                <button class="btn btn-secondary" id="closeSelector">Cerrar</button>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:16px;">
                ${posters.slice(0, 40).map(p => `
                    <img src="${TMDB.getImageUrl(p.file_path, 'w185')}" 
                         class="poster-option" 
                         data-path="${p.file_path}"
                         onclick=""
                         style="width:100%; border-radius:8px; cursor:pointer; transition:transform 0.2s; border:2px solid transparent;">
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('closeSelector').onclick = () => document.body.removeChild(overlay);

    overlay.querySelectorAll('.poster-option').forEach(img => {
        img.onclick = () => handlePosterSelect(img.dataset.path);
        img.onmouseover = () => img.style.transform = 'scale(1.05)';
        img.onmouseout = () => img.style.transform = 'scale(1)';
    });
}

async function handleAddToWatchlist() {
    const movieData = {
        tmdb_id: currentMovie.id,
        title: currentMovie.title,
        poster_path: currentMovie.poster_path,
        backdrop_path: currentMovie.backdrop_path,
        release_date: currentMovie.release_date || null,
        runtime: currentMovie.runtime,
        genres: JSON.stringify(currentMovie.genres),
        production_countries: JSON.stringify(currentMovie.production_countries),
        vote_average: currentMovie.vote_average
    };
    const { addToWatchlist } = await import('./watchlist.js');
    await addToWatchlist(currentMovie.id, movieData);
}

async function handleLogSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const logData = Object.fromEntries(formData.entries());

    logData.rating = logData.rating ? parseFloat(logData.rating) : null;
    logData.is_rewatch = logData.is_rewatch === 'on';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Debes iniciar sesión');

    // ... Movie Cache Logic (Same as before) ...
    const cast = currentMovie.credits?.cast?.slice(0, 10).map(c => ({
        id: c.id, name: c.name, character: c.character, profile_path: c.profile_path
    })) || [];
    const movieData = {
        tmdb_id: currentMovie.id, title: currentMovie.title, poster_path: currentMovie.poster_path,
        backdrop_path: currentMovie.backdrop_path, release_date: currentMovie.release_date || null,
        runtime: currentMovie.runtime, genres: JSON.stringify(currentMovie.genres),
        production_countries: JSON.stringify(currentMovie.production_countries),
        vote_average: currentMovie.vote_average, cast_data: JSON.stringify(cast)
    };
    await supabase.from('movies').upsert(movieData, { onConflict: 'tmdb_id' });

    let error;
    let finalLogId = currentLogId;

    if (currentLogId) {
        // UPDATE
        const { error: err } = await supabase
            .from('logs')
            .update({
                custom_poster_path: selectedPosterPath,
                ...logData
            })
            .eq('id', currentLogId);
        error = err;
        // Clean companions to re-insert
        if (!error) await supabase.from('log_companions').delete().eq('log_id', currentLogId);
    } else {
        // INSERT
        const { data: inserted, error: err } = await supabase
            .from('logs')
            .insert({
                user_id: user.id,
                tmdb_id: currentMovie.id,
                custom_poster_path: selectedPosterPath, // [NEW]
                ...logData
            })
            .select()
            .single();
        error = err;
        finalLogId = inserted?.id;
    }

    if (error) {
        console.error('Error saving log:', error);
        alert('Error saving log: ' + error.message);
    } else {
        // Save Companions
        const selectedCompanions = Array.from(document.querySelectorAll('input[name="companion"]:checked')).map(cb => cb.value);
        if (selectedCompanions.length > 0 && finalLogId) {
            const companionInserts = selectedCompanions.map(friendId => ({
                log_id: finalLogId,
                user_id: friendId
            }));
            await supabase.from('log_companions').insert(companionInserts);
        }

        alert('Guardado!');
        closeModal();
        import('./badges.js').then(m => m.checkAndUnlockBadges(user.id));
        // Refresh 
        if (currentLogId) {
            window.location.reload();
        } else {
            window.location.hash = '#diary';
        }
    }
}
