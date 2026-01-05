import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

// Mock Data for "Awards 2026" (using real 2023/24 examples for structure or just placeholders)
const AWARDS_CONFIG = {
    title: "Oscars 2026",
    categories: [
        {
            name: "Mejor Película",
            nominees: [
                { id: 933131, title: "Godzilla Minus One" }, // Example IDs
                { id: 872585, title: "Oppenheimer" },
                { id: 346698, title: "Barbie" },
                { id: 466420, title: "Killers of the Flower Moon" },
                { id: 609681, title: "The Marvels" } // Just randoms for demo
            ]
        },
        {
            name: "Mejor Director",
            nominees: [
                { id: 872585, title: "Oppenheimer (C. Nolan)" },
                { id: 466420, title: "Killers (M. Scorsese)" }
            ]
        }
    ]
};

export async function renderAwards(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Cargando temporada de premios...</div>';

    // 1. Fetch User Logs
    const { data: logs } = await supabase.from('logs').select('tmdb_id');
    const watchedIds = new Set(logs?.map(l => l.tmdb_id) || []);

    // 2. Calculate Stats
    let totalNominees = 0;
    let watchedNominees = 0;

    AWARDS_CONFIG.categories.forEach(cat => {
        cat.nominees.forEach(nom => {
            totalNominees++;
            if (watchedIds.has(nom.id)) watchedNominees++;
        });
    });

    const progress = Math.round((watchedNominees / totalNominees) * 100);

    // 3. Render
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding:32px; border-radius:16px; border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                <div>
                    <h1 style="font-family:var(--font-heading); background:linear-gradient(45deg, #d4af37, #f9f295); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px;">
                        🏆 ${AWARDS_CONFIG.title}
                    </h1>
                    <p style="color:var(--text-muted);">Tu progreso en la temporada</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:2.5rem; font-weight:800; color:var(--text);">${progress}%</div>
                    <div style="font-size:0.9rem; color:var(--text-muted);">${watchedNominees}/${totalNominees} Vistas</div>
                </div>
            </div>

            <!-- Progress Bar -->
            <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden; margin-bottom:32px;">
                <div style="height:100%; width:${progress}%; background:var(--gold, #d4af37); transition:width 1s ease;"></div>
            </div>

            <div style="display:grid; gap:32px;">
                ${AWARDS_CONFIG.categories.map(cat => `
                    <div>
                        <h3 style="margin-bottom:16px; border-left:4px solid var(--gold, #d4af37); padding-left:12px;">${cat.name}</h3>
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:16px;">
                            ${cat.nominees.map(nom => {
        const isWatched = watchedIds.has(nom.id);
        return `
                                    <div class="movie-card" style="opacity:${isWatched ? 1 : 0.6}; border:${isWatched ? '1px solid var(--gold, #d4af37)' : '1px solid transparent'};"
                                         onclick="window.handleMovieClick(${nom.id})">
                                        <div style="padding:16px; background:var(--surface);">
                                            <div style="font-weight:600; margin-bottom:8px;">${nom.title}</div>
                                            <div style="font-size:0.8rem;">
                                                ${isWatched ? '<span style="color:var(--success);"><i class="fas fa-check"></i> Vista</span>' : '<span style="color:var(--text-muted);"><i class="far fa-circle"></i> Pendiente</span>'}
                                            </div>
                                        </div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
