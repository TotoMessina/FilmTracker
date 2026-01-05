import { supabase } from '../supabase-client.js';

// --- Main View ---

export async function renderCommunity(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            
            <!-- Recommendations Section -->
            <div id="suggestionsSection" style="margin-bottom: 40px;">
                <h2 style="margin-bottom: 20px;">👥 Almas Gemelas del Cine</h2>
                <div id="suggestionsLoader" class="loading">Buscando coincidencias...</div>
                <div id="suggestionsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;"></div>
            </div>

            <!-- Search Section -->
            <div class="search-container" style="text-align: center; border-top: 1px solid var(--border); padding-top: 30px;">
                <h2 style="margin-bottom: 24px;">Buscar Cinéfilos 🕵️‍♂️</h2>
                <div style="position: relative; margin-bottom: 32px;">
                    <input type="text" id="userSearchInput" class="search-input" placeholder="Buscar por nombre..." style="width: 100%; padding: 16px 20px; border-radius: 30px; border: 1px solid var(--border); background: var(--surface); color: var(--text);">
                    <button id="searchUserBtn" class="btn btn-primary" style="position: absolute; right: 6px; top: 6px; bottom: 6px; border-radius: 24px;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div id="userResults" style="display: grid; gap: 16px;"></div>
            </div>
        </div>
    `;

    // 1. Load Suggestions
    loadSuggestions();

    // 2. Setup Search
    setupSearch();
}

async function loadSuggestions() {
    const grid = document.getElementById('suggestionsGrid');
    const loader = document.getElementById('suggestionsLoader');

    try {
        const users = await getSuggestedUsers();
        loader.remove();

        if (users.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted);">No encontramos coincidencias aún. ¡Sigue viendo películas para refinar tu perfil!</p>';
            return;
        }

        grid.innerHTML = users.map(u => `
            <div class="stat-card" onclick="window.location.hash = '#profile?id=${u.id}'" style="cursor: pointer; padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; transition: transform 0.2s;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.5rem; overflow: hidden;">
                     ${u.avatar_url ? `<img src="${u.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : (u.username || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <div style="font-weight: bold; margin-bottom: 4px;">${u.username || 'Usuario'}</div>
                    <div style="font-size: 0.8rem; color: var(--gold); background: rgba(255, 215, 0, 0.1); padding: 4px 8px; border-radius: 12px;">
                        <i class="fas fa-star"></i> ${u.matchCount} Coincidencias
                    </div>
                </div>
                <button class="btn btn-sm btn-secondary" style="width: 100%; margin-top: auto;">Ver Perfil</button>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        loader.innerHTML = 'Error al cargar sugerencias.';
    }
}

function setupSearch() {
    const input = document.getElementById('userSearchInput');
    const btn = document.getElementById('searchUserBtn');
    const resultsContainer = document.getElementById('userResults');

    const doSearch = async () => {
        const query = input.value.trim();
        if (!query) return;

        resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${query}%`)
            .limit(10);

        if (error) {
            console.error(error);
            resultsContainer.innerHTML = 'Error al buscar.';
            return;
        }

        if (profiles.length === 0) {
            resultsContainer.innerHTML = '<p>No se encontraron usuarios.</p>';
            return;
        }

        resultsContainer.innerHTML = profiles.map(profile => `
            <div class="user-card" onclick="window.location.hash = '#profile?id=${profile.id}'" style="background: var(--surface); padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 16px; cursor: pointer; border: 1px solid var(--border); transition: transform 0.2s;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.2rem; overflow: hidden;">
                    ${profile.avatar_url ? `<img src="${profile.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : (profile.username || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div style="text-align: left; flex: 1;">
                    <div style="font-weight: bold; font-size: 1.1rem;">${profile.username || 'Usuario'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">Ver perfil</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
        `).join('');
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });
}

// --- Suggestion Logic ---

async function getSuggestedUsers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get my favorites (Rated >= 8)
    const { data: myFavs } = await supabase
        .from('logs')
        .select('tmdb_id')
        .eq('user_id', user.id)
        .gte('rating', 8)
        .limit(30);

    if (!myFavs || myFavs.length === 0) return [];

    const movieIds = myFavs.map(l => l.tmdb_id);

    // 2. Find others who rated these >= 8
    // Note: This is an expensive query if DB grows huge, but fine for MVP.
    // Ideally use an RPC function in Supabase.
    const { data: matches } = await supabase
        .from('logs')
        .select('user_id, tmdb_id')
        .in('tmdb_id', movieIds)
        .gte('rating', 8)
        .neq('user_id', user.id) // Not me
        .limit(200);

    if (!matches || matches.length === 0) return [];

    // 3. Count matches per user
    const userCounts = {};
    matches.forEach(m => {
        userCounts[m.user_id] = (userCounts[m.user_id] || 0) + 1;
    });

    // 4. Sort user IDs by count desc
    const sortedUserIds = Object.keys(userCounts)
        .sort((a, b) => userCounts[b] - userCounts[a])
        .slice(0, 5); // Top 5

    if (sortedUserIds.length === 0) return [];

    // 5. Filter out already followed
    const { data: following } = await supabase
        .from('relationships')
        .select('following_id')
        .eq('follower_id', user.id);

    const followingSet = new Set(following?.map(f => f.following_id) || []);
    let candidateIds = sortedUserIds.filter(id => !followingSet.has(id));

    // --- FALLBACK: Add Random Users if few matches ---
    if (candidateIds.length < 5) {
        const needed = 5 - candidateIds.length;
        // Fetch random profiles (simple implementation: fetch 20, shuffle, take needed)
        // Exclude me and already followed
        const { data: randoms } = await supabase
            .from('profiles')
            .select('id')
            .neq('id', user.id)
            .limit(20); // Just fetch some

        if (randoms) {
            const randomCandidates = randoms
                .map(r => r.id)
                .filter(id => !followingSet.has(id) && !candidateIds.includes(id));

            // Shuffle simply
            const shuffled = randomCandidates.sort(() => 0.5 - Math.random());
            candidateIds = [...candidateIds, ...shuffled.slice(0, needed)];
        }
    }

    if (candidateIds.length === 0) return [];

    // 6. Fetch Profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', candidateIds);

    // Combine with match count (or 0 for randoms)
    return profiles.map(p => ({
        ...p,
        matchCount: userCounts[p.id] || 0
    })).sort((a, b) => b.matchCount - a.matchCount);

}

// --- Relationship Logic ---

export async function toggleFollow(targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should allow login prompt?

    // Check current status first (optimized: assumes call knows context, but we check DB for safety)
    const { data: existing } = await supabase
        .from('relationships')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    if (existing) {
        // Unfollow
        await supabase
            .from('relationships')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId);
        return 'unfollowed';
    } else {
        // Follow
        await supabase
            .from('relationships')
            .insert([{ follower_id: user.id, following_id: targetUserId }]);
        return 'followed';
    }
}

export async function getRelationshipStatus(targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isMe: false, isFollowing: false, isFollower: false, isFriend: false };

    if (user.id === targetUserId) return { isMe: true };

    // Am I following them?
    const { data: following } = await supabase
        .from('relationships')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    // Are they following me?
    const { data: follower } = await supabase
        .from('relationships')
        .select('*')
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
        .single();

    const isFollowing = !!following;
    const isFollower = !!follower;

    return {
        isMe: false,
        isFollowing,
        isFollower,
        isFriend: isFollowing && isFollower
    };
}

// --- Feed Logic ---

export async function getFriendsActivity() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get who I follow
    const { data: following } = await supabase
        .from('relationships')
        .select('following_id')
        .eq('follower_id', user.id);

    if (!following || following.length === 0) return [];

    const followingIds = following.map(f => f.following_id);

    // 2. Get their logs
    const { data: logs, error } = await supabase
        .from('logs')
        .select(`
            *,
            movie:movies(title, poster_path),
            profile:profiles(username, avatar_url)
        `)
        .in('user_id', followingIds)
        .order('watched_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Feed error:', error);
        return [];
    }

    return logs;
}

// --- Network Lists & Counts ---

export async function getNetworkCounts(userId) {
    const { count: followersCount } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

    const { count: followingCount } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

    return { followers: followersCount || 0, following: followingCount || 0 };
}

export async function getFollowers(userId) {
    // Get relationship rows
    const { data: rels } = await supabase
        .from('relationships')
        .select('follower_id')
        .eq('following_id', userId);

    if (!rels || rels.length === 0) return [];

    const ids = rels.map(r => r.follower_id);

    // Get profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids);

    return profiles || [];
}

export async function getFollowing(userId) {
    // Get relationship rows
    const { data: rels } = await supabase
        .from('relationships')
        .select('following_id')
        .eq('follower_id', userId);

    if (!rels || rels.length === 0) return [];

    const ids = rels.map(r => r.following_id);

    // Get profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids);

    return profiles || [];
}

export function renderUserListModal(users, title) {
    // Remove existing modal if any
    const existing = document.getElementById('userListModal');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'userListModal';
    backdrop.className = 'modal-backdrop active';

    // HTML
    backdrop.innerHTML = `
        <div class="modal-content" style="max-width: 500px; height:auto; max-height:80vh;">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="grid-template-columns: 1fr; padding:0;">
                <div class="no-scrollbar" style="overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px;">
                    ${users.length === 0 ? '<p>Vacío.</p>' : users.map(u => `
                        <div class="user-card" onclick="window.location.hash = '#profile?id=${u.id}'; document.getElementById('userListModal').remove();" style="display:flex; align-items:center; gap:16px; cursor:pointer;">
                            <div style="width:40px; height:40px; border-radius:50%; background:var(--primary); overflow:hidden; display:flex; justify-content:center; align-items:center; font-weight:bold;">
                                ${u.avatar_url ? `<img src="${u.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : (u.username || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div style="font-weight:bold; font-size:1rem;">${u.username || 'Usuario Desconocido'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
    });
}
