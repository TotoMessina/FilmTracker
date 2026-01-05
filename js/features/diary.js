import { supabase } from '../supabase-client.js';
import { getImageUrl } from '../tmdb-api.js';

export async function renderDiary(containerId, targetUserId = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Cargando diario...</div>';

    // 1. Resolve User
    let userId = targetUserId;
    let isOwner = false;
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!userId) {
        if (!currentUser) return;
        userId = currentUser.id;
        isOwner = true;
    } else {
        isOwner = currentUser && currentUser.id === userId;
    }

    const { data: logs, error } = await supabase
        .from('logs')
        .select(`
            *,
            movie:movies(*)
        `)
        .eq('user_id', userId)
        .order('watched_at', { ascending: false });

    if (error) {
        container.innerHTML = 'Error cargando diario.';
        return;
    }

    if (!logs || logs.length === 0) {
        container.innerHTML = '<p>No hay registros disponibles.</p>';
        return;
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="border-bottom: 2px solid var(--border); text-align:left; color:var(--text-muted); font-size:0.9rem;">
                    <th style="padding:12px;">Póster</th>
                    <th style="padding:12px;">Película</th>
                    <th style="padding:12px;">Fecha</th>
                    <th style="padding:12px;">Nota</th>
                    <th style="padding:12px;">Plataforma</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => `
                <tr style="border-bottom: 1px solid var(--border); transition: background 0.2s; ${isOwner ? 'cursor:pointer;' : ''}" 
                    onclick="${isOwner ? `handleLogClick('${log.movie.tmdb_id}', '${log.id}')` : ''}">
                    <td style="padding:12px; width:60px;">
                         <img src="${getImageUrl(log.custom_poster_path || log.movie.poster_path, 'w92')}" style="width:40px; border-radius:4px;">
                    </td>
                    <td style="padding:12px;">
                        <div style="font-weight:600;">${log.movie.title}</div>
                        ${log.is_rewatch ? '<span style="font-size:0.7rem; color:var(--text-muted);"><i class="fas fa-redo"></i> Rewatch</span>' : ''}
                    </td>
                    <td style="padding:12px; color:var(--text-muted); font-size:0.9rem;">
                        ${log.watched_at}
                    </td>
                    <td style="padding:12px;">
                        <div style="font-size:1.1rem; color:${getColorForRating(log.rating)}; font-weight:700;">
                            ${log.rating}
                        </div>
                    </td>
                    <td style="padding:12px; color:var(--text-muted); font-size:0.8rem;">
                        ${log.platform || '-'}
                    </td>
                    <td style="padding:12px; text-align:right;">
                         ${isOwner ? '<i class="fas fa-edit" style="color:var(--text-muted);"></i>' : ''}
                         ${(log.platform === 'Cine' && isOwner) ?
            `<button class="btn-icon" onclick="event.stopPropagation(); import('./ticket.js').then(m => m.openTicketModal('${log.id}'))" title="Ver Ticket" style="margin-left:10px;">
                                <i class="fas fa-ticket-alt" style="color:var(--gold);"></i>
                            </button>`
            : ''}
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Attach local helper to window for row click (hacky but simple for modular JS without framework)
    // Ideally we attach event listeners to rows, but keeping it simple as per existing pattern
    window.handleLogClick = async (tmdbId, logId) => {
        // Need to fetch full log object first? We have it in `logs`.
        // Better: Find log in memory.
        const log = logs.find(l => l.id === logId);
        import('./logging.js').then(m => m.openLogModal(tmdbId, log));
    };
}

function getColorForRating(rating) {
    if (rating >= 8) return 'var(--success)';
    if (rating >= 5) return 'var(--warning)';
    return '#ff6b6b';
}
