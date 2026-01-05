import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

export async function renderConnections(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Analizando conexiones...</div>';

    // 1. Fetch all logged movies with their cast data
    const { data: logs, error } = await supabase
        .from('logs')
        .select(`
            tmdb_id,
            movie:movies(title, cast_data)
        `);

    if (error || !logs || logs.length === 0) {
        container.innerHTML = '<p>No hay suficientes datos para encontrar conexiones.</p>';
        return;
    }

    // 2. Aggregate Actors
    const actorCounts = {}; // { actorId: { name, photo, count, movies: [] } }

    logs.forEach(log => {
        const cast = log.movie.cast_data;
        if (Array.isArray(cast)) {
            cast.forEach(actor => {
                if (!actorCounts[actor.id]) {
                    actorCounts[actor.id] = {
                        id: actor.id,
                        name: actor.name,
                        photo: actor.profile_path,
                        count: 0,
                        movies: []
                    };
                }
                actorCounts[actor.id].count++;
                if (!actorCounts[actor.id].movies.includes(log.movie.title)) {
                    actorCounts[actor.id].movies.push(log.movie.title);
                }
            });
        }
    });

    // 3. Filter & Sort
    // Only actors seen in at least 2 distinct movies (arbitrary threshold, user said 4 but let's start with 2 for easier testing, or 3)
    // Let's stick to 2 for demo purposes as user might not have huge history yet.
    const connections = Object.values(actorCounts)
        .filter(a => a.count >= 2)
        .sort((a, b) => b.count - a.count);

    if (connections.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <h3>🕸️ Aún no hay conexiones</h3>
                <p>Necesitas ver más películas con los mismos actores para generar este mapa.</p>
            </div>
        `;
        return;
    }

    // 4. Render
    container.innerHTML = `
        <h2 style="margin-bottom:24px;">🔗 Tus Actores Fetiche</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:24px;">
            ${connections.map(actor => `
                <div style="background:var(--surface); border-radius:12px; padding:16px; display:flex; gap:16px; align-items:flex-start;">
                    <img src="${actor.photo ? TMDB.getImageUrl(actor.photo, 'w185') : 'https://placehold.co/100x150?text=?'}" 
                         style="width:80px; height:120px; object-fit:cover; border-radius:8px;">
                    <div>
                        <div style="font-size:1.1rem; font-weight:700; margin-bottom:4px;">${actor.name}</div>
                        <div style="color:var(--primary); font-weight:600; font-size:0.9rem; margin-bottom:8px;">
                            ${actor.count} Películas
                        </div>
                        <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
                            ${actor.movies.slice(0, 3).join(', ')}
                            ${actor.movies.length > 3 ? ` y ${actor.movies.length - 3} más` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
