import { supabase } from './supabase-client.js';
import * as TMDB from './tmdb-api.js';
// We will import feature modules later, for now we keep it simple

// State
let currentUser = null;
let currentView = 'dashboard';

// DOM Elements
const appContent = document.getElementById('appContent');
const pageTitle = document.getElementById('pageTitle');
const navItems = document.querySelectorAll('.nav-item');
const logoutBtn = document.getElementById('logoutBtn');
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');

// --- Mobile Menu ---
function renderMobileMenu() {
    const existing = document.getElementById('mobileMenuModal');
    if (existing) return;

    const modal = document.createElement('div');
    modal.id = 'mobileMenuModal';
    modal.className = 'modal-backdrop active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
    <div class="modal-content slide-up" style="position: absolute; bottom: 60px; left: 0; width: 100%; height: auto; border-radius: 20px 20px 0 0; background: var(--surface); padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3>Más Opciones</h3>
            <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; text-align:center;">
            <a href="#stats" class="mobile-menu-item" onclick="closeMobileMenu()">
                <div class="menu-icon-box"><i class="fas fa-chart-line"></i></div>
                <span>Stats</span>
            </a>
            <a href="#map" class="mobile-menu-item" onclick="closeMobileMenu()">
                <div class="menu-icon-box"><i class="fas fa-globe-americas"></i></div>
                <span>Mapa</span>
            </a>
            <a href="#connections" class="mobile-menu-item" onclick="closeMobileMenu()">
                <div class="menu-icon-box"><i class="fas fa-project-diagram"></i></div>
                <span>Conex</span>
            </a>
            <a href="#tournament" class="mobile-menu-item" onclick="closeMobileMenu()">
                <div class="menu-icon-box"><i class="fas fa-trophy"></i></div>
                <span>Mundial</span>
            </a>
            <a href="#awards" class="mobile-menu-item" onclick="closeMobileMenu()">
                <div class="menu-icon-box"><i class="fas fa-award"></i></div>
                <span>Premios</span>
            </a>
            <a href="#settings" class="mobile-menu-item" onclick="closeMobileMenu()">
                <div class="menu-icon-box"><i class="fas fa-cog"></i></div>
                <span>Ajustes</span>
            </a>
        </div>
    </div>
`;

    document.body.appendChild(modal);
    modal.querySelector('.modal-close').onclick = closeMobileMenu;
    modal.onclick = (e) => { if (e.target === modal) closeMobileMenu(); };
}

window.closeMobileMenu = function () {
    const m = document.getElementById('mobileMenuModal');
    if (m) m.remove();
};

// --- Initialization ---

async function init() {
    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize Global Features
    // --- Mobile Menu ---


    // Check notifications
    import('./features/chat.js').then(m => m.checkUnreadCount());

    await import('./features/blacklist.js').then(m => m.initBlacklist());

    currentUser = session.user;
    updateUserProfileUI();

    // --- Theme Logic ---
    // Auto Day/Night: Dark from 8PM (20:00) to 6AM (6:00)
    // Means Light from 6AM to 8PM
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 20; // 6:00 - 19:59

    if (isDayTime) {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    // Explicit toggle override
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        };
        // Set initial icon
        const isLight = document.body.classList.contains('light-theme');
        themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    // Mobile Menu Button Listener
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.preventDefault();
            renderMobileMenu();
        };
    }

    // Handle Hash Navigation
    window.addEventListener('hashchange', handleRouting);

    // Global Movie Click Handler (Details Modal)
    window.handleMovieClick = async (tmdbId) => {
        const detailsModule = await import('./features/movie_details.js');
        detailsModule.openMovieDetails(tmdbId);
    };

    // Initial Route
    handleRouting();
}

function updateUserProfileUI() {
    userNameEl.textContent = currentUser.user_metadata.username || currentUser.email.split('@')[0];
    userAvatarEl.src = currentUser.user_metadata.avatar_url || 'https://ui-avatars.com/api/?name=User';

    // Link to my profile
    const link = document.getElementById('myProfileLink');
    if (link) {
        link.onclick = () => {
            window.location.hash = `#profile?id=${currentUser.id}`;
        }
    }
}

// --- Routing ---

function handleRouting() {
    const rawHash = window.location.hash.replace('#', '') || 'dashboard';
    const cleanView = rawHash.split('?')[0];
    currentView = cleanView;

    // Update Nav
    navItems.forEach(item => {
        if (item.dataset.view === currentView) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Title
    pageTitle.textContent = currentView.charAt(0).toUpperCase() + currentView.slice(1);

    // Render View
    renderView(currentView);
}

async function renderView(view) {
    appContent.innerHTML = '<div class="loading">Cargando...</div>';

    switch (view) {
        case 'dashboard':
            // Removed inline renderDashboard logic
            const dashboardModule = await import(`./features/dashboard.js?v=${Date.now()}`);
            await dashboardModule.renderDashboard('appContent');
            break;
        case 'search':
            await renderSearch();
            break;
        // Imports dynamic
        case 'diary':
            appContent.innerHTML = '<div id="diaryContainer"></div>';
            const diaryModule = await import('./features/diary.js');
            await diaryModule.renderDiary('diaryContainer');
            break;
        case 'watchlist':
            appContent.innerHTML = '<div id="watchlistContainer"></div>';
            const wlModule = await import('./features/watchlist.js');
            await wlModule.renderWatchlist('watchlistContainer');
            break;
        case 'stats':
            appContent.innerHTML = '<div id="statsContainer"></div>';
            // appContent.innerHTML = '<div id="statsContainer"></div>'; // Removed, renderStats will handle
            const statsModule = await import('./features/stats.js');
            await statsModule.renderStats('appContent');
            break;
        case 'connections':
            appContent.innerHTML = '<div id="connectionsContainer"></div>';
            const connModule = await import('./features/connections.js');
            await connModule.renderConnections('connectionsContainer');
            break;
        case 'awards':
            appContent.innerHTML = '<div id="awardsContainer"></div>';
            const awardsModule = await import('./features/awards.js');
            await awardsModule.renderAwards('awardsContainer');
            break;
        case 'map':
            appContent.innerHTML = '<div id="mapContainer"></div>';
            const mapModule = await import('./features/map.js');
            await mapModule.renderMap('mapContainer');
            break;
        case 'tournament':
            appContent.innerHTML = '<div id="tournamentContainer"></div>';
            const tourModule = await import('./features/tournament.js');
            await tourModule.initTournament('tournamentContainer');
            break;
        case 'social':
            appContent.innerHTML = '<div id="socialContainer"></div>';
            const socialModule = await import('./features/social.js');
            await socialModule.renderCommunity('socialContainer');
            break;
        case 'chat':
            appContent.innerHTML = '<div id="chatContainer" style="padding-bottom: 80px;"></div>';
            const chatModule = await import(`./features/chat.js?v=${Date.now()}`);
            await chatModule.renderChatList('chatContainer');
            break;
        case 'settings':
            appContent.innerHTML = `
                <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h1>Ajustes</h1>
                    <div class="card" style="padding: 20px; margin-top: 20px;">
                        <h3>Apariencia</h3>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                            <span>Tema Oscuro / Claro</span>
                            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('themeToggleBtn').click()">Alternar</button>
                        </div>
                    </div>
                    <div class="card" style="padding: 20px; margin-top: 20px;">
                        <h3>Cuenta</h3>
                        <p style="color:var(--text-muted); font-size:0.9rem;">Sesión iniciada como <b>${currentUser?.email}</b></p>
                        <button class="btn btn-danger" style="width:100%; margin-top:10px;" onclick="supabase.auth.signOut().then(() => window.location.href='index.html')">Cerrar Sesión</button>
                    </div>
                </div>
            `;
            break;
        case 'profile':
            // Assume hash is like #profile?id=123
            const hashParts = window.location.hash.split('?');
            const query = new URLSearchParams(hashParts[1] || '');
            const targetUserId = query.get('id');

            if (!targetUserId) {
                // Default to Me
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    window.location.hash = `#profile?id=${user.id}`;
                    return; // Reload with hash
                } else {
                    appContent.innerHTML = '<p>Debes iniciar sesión.</p>';
                    return;
                }
            }

            appContent.innerHTML = `
                <div id="profileHeader" style="margin-bottom:30px;">
                    <!-- Header Skeleton -->
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div style="width:80px; height:80px; border-radius:50%; background:var(--surface); animation: pulse 1s infinite;"></div>
                        <div><div style="width:150px; height:24px; background:var(--surface);"></div></div>
                    </div>
                </div>
                <div class="tabs" style="margin-bottom:20px; display:flex; gap:16px; border-bottom:1px solid var(--border); padding-bottom:10px;">
                    <button class="btn btn-sm btn-primary active" onclick="switchProfileTab('stats', '${targetUserId}')">Estadísticas</button>
                    <button class="btn btn-sm btn-secondary" onclick="switchProfileTab('diary', '${targetUserId}')">Diario</button>
                </div>
                <div id="profileContent"></div>
            `;

            // Render Header (Name/Avatar/FollowBtn/Counts)
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
            const socialMod = await import('./features/social.js');
            const relStatus = await socialMod.getRelationshipStatus(targetUserId);
            const counts = await socialMod.getNetworkCounts(targetUserId);

            if (profile) {
                let actionBtn = '';
                let statusBadge = '';

                if (!relStatus.isMe) {
                    const btnText = relStatus.isFollowing ? 'Siguiendo' : 'Seguir';
                    const btnClass = relStatus.isFollowing ? 'btn-secondary' : 'btn-primary';
                    const btnIcon = relStatus.isFollowing ? '<i class="fas fa-check"></i>' : '<i class="fas fa-user-plus"></i>';

                    actionBtn = `
                        <button id="followBtn" class="btn btn-sm ${btnClass}" style="margin-top:8px;">
                            ${btnIcon} ${btnText}
                        </button>
                    `;

                    if (relStatus.isFriend) {
                        statusBadge = `<span style="background:var(--primary); color:white; padding:4px 8px; border-radius:12px; font-size:0.75rem; margin-left:10px; font-weight:bold;"><i class="fas fa-handshake"></i> Amigos</span>`;
                    } else if (relStatus.isFollower) {
                        statusBadge = `<span style="background:var(--surface-hover); color:var(--text-muted); padding:4px 8px; border-radius:12px; font-size:0.75rem; margin-left:10px;">Te sigue</span>`;
                    }
                } else {
                    // It is ME - Show Edit Button
                    actionBtn = `
                        <button id="editProfileBtn" class="btn btn-sm btn-secondary" style="margin-top:8px;">
                            <i class="fas fa-edit"></i> Editar Perfil
                        </button>
                    `;
                }

                const headerEl = document.getElementById('profileHeader');
                if (headerEl) {
                    headerEl.innerHTML = `
                        <div style="display:flex; align-items:center; gap:24px;">
                            <div style="width:100px; height:100px; border-radius:50%; background:var(--primary); display:flex; justify-content:center; align-items:center; font-size:2.5rem; font-weight:bold; overflow:hidden;">
                                ${profile.avatar_url ? `<img src="${profile.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : (profile.username || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style="display:flex; align-items:center;">
                                    <h1 style="margin:0;">${profile.username || 'Usuario Nuevo'}</h1>
                                    ${statusBadge}
                                </div>
                                <p style="color:var(--text-muted); margin-bottom:12px;">Perfil de Cinéfilo</p>
                                
                                <div style="display:flex; gap:24px; font-size:0.9rem;">
                                    <div id="followersClick" style="cursor:pointer;" class="hover-text-light">
                                        <span style="font-weight:bold; font-size:1.1rem;">${counts.followers}</span> Seguidores
                                    </div>
                                    <div id="followingClick" style="cursor:pointer;" class="hover-text-light">
                                        <span style="font-weight:bold; font-size:1.1rem;">${counts.following}</span> Siguiendo
                                    </div>
                                </div>

                                ${actionBtn}
                            </div>
                        </div>
                    `;
                }

                // Bind Events

                // 1. Follow Button
                const btn = document.getElementById('followBtn');
                if (btn) {
                    btn.addEventListener('click', async () => {
                        btn.disabled = true;
                        btn.innerHTML = '...';
                        await socialMod.toggleFollow(targetUserId);
                        handleRouting();
                    });
                }

                // 2. Edit Button
                const editBtn = document.getElementById('editProfileBtn');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        openEditProfileModal(profile);
                    });
                }

                // 3. Counts Lists
                const followersEl = document.getElementById('followersClick');
                if (followersEl) {
                    followersEl.addEventListener('click', async () => {
                        const users = await socialMod.getFollowers(targetUserId);
                        socialMod.renderUserListModal(users, 'Seguidores');
                    });
                }

                const followingEl = document.getElementById('followingClick');
                if (followingEl) {
                    followingEl.addEventListener('click', async () => {
                        const users = await socialMod.getFollowing(targetUserId);
                        socialMod.renderUserListModal(users, 'Siguiendo');
                    });
                }
            }

            // Global helper for tab switching (simple implementation)
            window.switchProfileTab = async (tab, uid) => {
                const container = document.getElementById('profileContent');
                document.querySelectorAll('.tabs button').forEach(b => {
                    b.classList.remove('active', 'btn-primary');
                    b.classList.add('btn-secondary');
                    if (b.textContent.includes(tab === 'stats' ? 'Estadísticas' : 'Diario')) {
                        b.classList.add('active', 'btn-primary');
                        b.classList.remove('btn-secondary');
                    }
                });

                if (tab === 'stats') {
                    container.innerHTML = '<div id="statsContainer"></div>';
                    const stats = await import('./features/stats.js');
                    await stats.renderStats('statsContainer', uid);
                } else {
                    container.innerHTML = '<div id="diaryContainer"></div>';
                    const diary = await import('./features/diary.js');
                    await diary.renderDiary('diaryContainer', uid);
                }
            };

            // Initial Load
            window.switchProfileTab('stats', targetUserId);
            break;
        default:
            appContent.innerHTML = '<p>Página no encontrada</p>';
    }
}

// --- View Renderers (Basic Implementations for now) ---

// --- View Renderers (Basic Implementations for now) ---

// renderDashboard removed - now in features/dashboard.js

// State for Search/Discovery
let discoveryState = {
    page: 1,
    mode: 'trending', // trending, recommendations_log, recommendations_wl, genre, random, search
    params: {}, // Extra params like with_genres
    seedTitle: '',
    isLoading: false,
    hasMore: true
};

async function renderSearch() {
    appContent.innerHTML = `
        <div class="search-container" style="max-width: 900px; margin: 0 auto;">
            <!-- Main Search Input -->
            <div style="position:relative; margin-bottom: 24px;">
                <input type="text" id="movieSearchInput" class="search-input" placeholder="Busca una película..." style="width:100%;">
                <i class="fas fa-search search-icon"></i>
            </div>

            <!-- Discovery Filters (Pills) -->
            <div style="background:var(--surface); padding:16px; border-radius:12px; margin-bottom:24px; border:1px solid var(--border);">
                 <!-- Time Filter -->
                <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
                    <label style="color:var(--text-muted); font-size:0.9rem;"><i class="fas fa-clock"></i> Tiempo disponible:</label>
                    <input type="range" id="discoverTimeSlider" min="60" max="240" step="15" value="240" style="flex:1; cursor:pointer;">
                    <span id="discoverTimeDisplay" style="font-weight:bold; min-width:80px; text-align:right;">Cualquiera</span>
                </div>

                <div id="discoveryPills" class="no-scrollbar" style="display:flex; gap:12px; overflow-x:auto; padding-bottom:12px; margin-bottom:24px;">
                    <button class="btn btn-sm btn-primary pill-active" data-mode="trending">🔥 Tendencias</button>
                    <button class="btn btn-sm btn-secondary btn-smart" data-mode="smart">❤️ Para Ti</button>
                    <button class="btn btn-sm btn-secondary" data-mode="recommendations_log">👁️ Porque viste...</button>
                    <button class="btn btn-sm btn-secondary" data-mode="recommendations_wl">🔖 De tu Watchlist</button>
                    <button class="btn btn-sm btn-secondary" data-mode="random">🎲 Sorpréndeme</button>
                    <div style="width:1px; background:var(--border); margin:0 8px;"></div>
                    <button class="btn btn-sm btn-secondary" data-mode="genre" data-genre="28">Acción</button>
                    <button class="btn btn-sm btn-secondary" data-mode="genre" data-genre="35">Comedia</button>
                    <button class="btn btn-sm btn-secondary" data-mode="genre" data-genre="27">Terror</button>
                    <button class="btn btn-sm btn-secondary" data-mode="genre" data-genre="878">Sci-Fi</button>
                    <button class="btn btn-sm btn-secondary" data-mode="genre" data-genre="18">Drama</button>
                </div>
            </div>

            <h3 id="moviesGridTitle" style="text-align:left; margin-bottom:16px; color:var(--text-muted); font-size:1.1rem;">
                Tendencias Globales
            </h3>
            
            <div id="searchResults" class="grid-movies"></div>
            
            <div id="loadingTrigger" style="height: 60px; margin-top:32px; display:flex; justify-content:center; align-items:center;">
                <div class="loader hidden"></div>
            </div>
            <!-- Hack to ensure footer margin -->
            <div style="height:60px;"></div>
        </div>
    `;

    // Initialize logic
    setupDiscoveryEvents();

    // Default load
    discoveryState = { page: 1, mode: 'trending', params: {}, seedTitle: '', isLoading: false, hasMore: true };
    await fetchDiscoveryMovies();

    // Infinite Scroll
    const trigger = document.getElementById('loadingTrigger');
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !discoveryState.isLoading && discoveryState.hasMore) {
            console.log('Loading more page:', discoveryState.page + 1);
            fetchDiscoveryMovies();
        }
    }, { rootMargin: '400px' });
    observer.observe(trigger);
}
// Helper to reset state
function resetGrid(mode = null) {
    if (mode) discoveryState.mode = mode;
    discoveryState.page = 1;
    discoveryState.isLoading = false;
    discoveryState.hasMore = true;
    // If switching to search, clear other params
    if (mode === 'search') discoveryState.params = {};

    const grid = document.getElementById('searchResults');
    if (grid) grid.innerHTML = '';
}

function resetDiscovery() {
    resetGrid();
}

function setupDiscoveryEvents() {
    // 1. Pills Logic
    const pills = document.querySelectorAll('#discoveryPills button');
    pills.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            // UI Update
            pills.forEach(p => {
                p.classList.remove('btn-primary', 'pill-active');
                p.classList.add('btn-secondary');
            });
            e.target.classList.remove('btn-secondary');
            e.target.classList.add('btn-primary', 'pill-active');

            // Logic Update
            const mode = e.target.dataset.mode;
            const genre = e.target.dataset.genre;

            // Clear search input if switching away from search (optional, but good UX)
            if (mode !== 'search') {
                document.getElementById('movieSearchInput').value = '';
            }

            await switchDiscoveryMode(mode, { genre, title: e.target.textContent });
        });
    });

    // 2. Search Input Logic
    const input = document.getElementById('movieSearchInput');
    let debounceTimer;
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (query.length === 0) {
            // If cleared, go back to currently selected pill or default (Trending)
            // Ideally trigger the active pill's click, but simpler:
            switchDiscoveryMode('trending', { title: 'Tendencias Globales' });
            return;
        }

        debounceTimer = setTimeout(async () => {
            // Search triggers only on meaningful input
            // Check if query is different to avoid reload? No, simpler is fine.
            discoveryState.params = { query };
            document.getElementById('moviesGridTitle').textContent = `Resultados para "${query}"`;

            // Visual deselect pills
            pills.forEach(p => {
                p.classList.remove('btn-primary', 'pill-active');
                p.classList.add('btn-secondary');
            });

            await switchDiscoveryMode('search', { query }); // Reuse switch logic
        }, 500); // 500ms debounce
    });

    // 3. Time Slider Logic
    const timeSlider = document.getElementById('discoverTimeSlider');
    const timeDisplay = document.getElementById('discoverTimeDisplay');

    if (timeSlider) {
        timeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (val === 240) {
                timeDisplay.textContent = 'Cualquiera';
                delete discoveryState.params['with_runtime.lte'];
            } else {
                const h = Math.floor(val / 60);
                const m = val % 60;
                timeDisplay.textContent = `< ${h}h ${m}m`;
                discoveryState.params['with_runtime.lte'] = val;
            }
        });

        // Refresh on slider change (debounce/lazy)
        timeSlider.addEventListener('change', () => {
            resetGrid();
            fetchDiscoveryMovies();
        });
    }

    // 4. Infinite Scroll
    const trigger = document.getElementById('loadingTrigger');
    if (trigger) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !discoveryState.isLoading && discoveryState.hasMore) {
                fetchDiscoveryMovies();
            }
        }, { rootMargin: '400px' });
        observer.observe(trigger);
    }
}

async function switchDiscoveryMode(mode, { genre, query, title } = {}) {
    discoveryState.mode = mode;

    // Update Params based on mode
    if (mode === 'genre') {
        discoveryState.params = { with_genres: genre };
        // Keep runtime filter if exists? Yes, merging.
        // But currently params is overwritten in some places. 
        // Let's ensure we merge with existing runtime filter if needed, 
        // but typically switching mode resets other filters except maybe runtime.
        // For simplicity:
        const currentRuntime = discoveryState.params['with_runtime.lte'];
        discoveryState.params = { with_genres: genre };
        if (currentRuntime) discoveryState.params['with_runtime.lte'] = currentRuntime;

    } else if (mode === 'search') {
        discoveryState.params = { query }; // Search is exclusive usually
        discoveryState.seedTitle = query;
    } else {
        // Trending, recommendations, etc.
        const currentRuntime = discoveryState.params['with_runtime.lte'];
        discoveryState.params = {};
        if (currentRuntime) discoveryState.params['with_runtime.lte'] = currentRuntime;
    }

    // Title Query
    if (title) document.getElementById('moviesGridTitle').textContent = title;

    resetGrid(mode);
    await fetchDiscoveryMovies();
}



async function fetchDiscoveryMovies() {
    if (discoveryState.isLoading || !discoveryState.hasMore) return;

    discoveryState.isLoading = true;
    document.querySelector('.loader').classList.remove('hidden');

    let results = [];
    const { mode, page, params, seedTitle } = discoveryState;

    try {
        if (mode === 'search') {
            // Search API doesn't support runtime filter well, but we can client-side filter if needed
            // For now, raw search
            results = await TMDB.searchMovies(seedTitle);
            discoveryState.hasMore = false; // Simple one-page search for now
        } else if (mode === 'trending') {
            // Use discover for trending to allow filters
            results = await TMDB.discoverMovies({
                sort_by: 'popularity.desc',
                page,
                ...params
            });
        } else if (mode === 'genre') {
            results = await TMDB.discoverMovies({
                page,
                ...params
            });
        } else if (mode === 'random') {
            results = await TMDB.discoverMovies({
                sort_by: 'popularity.desc',
                page: Math.floor(Math.random() * 50) + 1,
                ...params
            });
        } else if (mode === 'recommendations_wl' || mode === 'recommendations_log') {
            // Complex logic omitted for brevity, fallback to trending
            results = await TMDB.discoverMovies({
                sort_by: 'vote_average.desc',
                'vote_count.gte': 500,
                page,
                ...params
            });
        }

        if (results.length === 0) {
            discoveryState.hasMore = false;
        } else {
            appendMovies(results);
            discoveryState.page++;
        }
    } catch (err) {
        console.error(err);
    } finally {
        discoveryState.isLoading = false;
        document.querySelector('.loader').classList.add('hidden');
    }
}

function appendMovies(movies) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    const html = movies.map(movie => `
        <div class="movie-card" onclick="window.handleMovieClick(${movie.id})">
            <img src="${TMDB.getImageUrl(movie.poster_path)}" class="movie-poster" alt="${movie.title}" loading="lazy">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">
                    <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                    <span><i class="fas fa-star" style="color: var(--warning)"></i> ${movie.vote_average.toFixed(1)}</span>
                </div>
            </div>
        </div>
    `).join('');
    container.insertAdjacentHTML('beforeend', html);
}
// We attach this to window so onclick works in HTML string
window.handleMovieClick = async (tmdbId) => {
    // Open Modal Logic to be implemented
    console.log('Clicked movie:', tmdbId);
    // In a real module system we wouldn't attach to window, but for simplicity here:
    import('./features/logging.js').then(module => {
        module.openLogModal(tmdbId);
    });
};


async function renderWatchlist() {
    // Needs DB fetch logic
    appContent.innerHTML = 'Watchlist coming soon...';
}

// --- Auth ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

// Start
init();

// --- Edit Profile Helper ---

function openEditProfileModal(profile) {
    // Remove existing
    const existing = document.getElementById('editProfileModal');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'editProfileModal';
    backdrop.className = 'modal-backdrop active';

    backdrop.innerHTML = `
        <div class="modal-content" style="max-width:400px; height:auto;">
            <div class="modal-header">
                <h2>Editar Perfil</h2>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="display:flex; flex-direction:column; gap:16px;">
                <div class="form-group">
                    <label>Nombre de Usuario</label>
                    <input type="text" id="editUsername" class="form-input" value="${profile.username || ''}" placeholder="Tu nombre...">
                </div>
                <div class="form-group">
                    <label>Avatar URL (Opcional)</label>
                    <input type="text" id="editAvatar" class="form-input" value="${profile.avatar_url || ''}" placeholder="https://...">
                    <small style="color:var(--text-muted);">Usa un enlace directo a una imagen (jpg, png).</small>
                </div>
                <button id="saveProfileBtn" class="btn btn-primary" style="width:100%;">Guardar Cambios</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    // Logic
    const closeBtn = backdrop.querySelector('.modal-close');
    const saveBtn = document.getElementById('saveProfileBtn');

    const close = () => backdrop.remove();
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

    saveBtn.addEventListener('click', async () => {
        const newName = document.getElementById('editUsername').value.trim();
        const newAvatar = document.getElementById('editAvatar').value.trim();

        if (newName.length < 2) {
            alert('El nombre debe tener al menos 2 caracteres.');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        const { error } = await supabase
            .from('profiles')
            .update({ username: newName, avatar_url: newAvatar || null })
            .eq('id', profile.id);

        if (error) {
            alert('Error al guardar: ' + error.message);
            saveBtn.disabled = false;
        } else {
            // Reload page to refresh everything
            window.location.reload();
        }
    });
}
