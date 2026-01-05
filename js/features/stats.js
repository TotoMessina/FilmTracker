import { supabase } from '../supabase-client.js';

export async function renderStats(containerId, targetUserId = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Calculando estadísticas...</div>';

    // Determine whose stats to show
    let userId = targetUserId;
    if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        userId = user.id;
    }

    // Fetch all logs with movie details for this user
    const { data: logs, error } = await supabase
        .from('logs')
        .select(`
            *,
            movie:movies(*)
        `)
        .eq('user_id', userId)
        .order('watched_at', { ascending: true });

    if (error || !logs) {
        container.innerHTML = 'Error cargando datos.';
        return;
    }

    // --- Calculations ---

    // 1. Time of Life
    let totalMinutes = 0;
    logs.forEach(log => {
        if (log.movie && log.movie.runtime) {
            totalMinutes += log.movie.runtime;
        }
    });

    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const mins = totalMinutes % 60;


    // 2. Genre Distribution
    const genreCounts = {};
    logs.forEach(log => {
        if (log.movie && log.movie.genres) {
            const genres = typeof log.movie.genres === 'string' ? JSON.parse(log.movie.genres) : log.movie.genres;
            genres.forEach(g => {
                genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
            });
        }
    });

    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Top 8

    // 3. Ratings
    const ratings = logs.map(l => l.rating).filter(r => r !== null);

    // 4. Badges
    const badgeModule = await import('./badges.js');
    // For badges, we need to pass the userId explicitly to getBadgesStatus
    const badgesStatus = await badgeModule.getBadgesStatus(userId);


    // --- Render ---

    container.innerHTML = `
        <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
            
            <!-- Badges (Full Width) -->
            <div class="stat-card" style="grid-column: 1 / -1; background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
                    <i class="fas fa-trophy" style="color:#f1c40f;"></i> Logros
                </h3>
                <div style="display:flex; gap:16px; flex-wrap:wrap;">
                    ${badgesStatus.map(b => `
                        <div style="
                            display:flex; align-items:center; gap:12px; 
                            background: ${b.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)'}; 
                            padding:12px; border-radius:8px; border:1px solid ${b.unlocked ? b.color : 'transparent'};
                            opacity: ${b.unlocked ? 1 : 0.5};
                        ">
                            <div style="
                                width:40px; height:40px; border-radius:50%; background:${b.unlocked ? b.color : '#333'}; 
                                display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:white;
                            ">
                                <i class="${b.icon}"></i>
                            </div>
                            <div>
                                <div style="font-weight:700; font-size:0.9rem;">${b.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${b.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Time Card -->
            <div class="stat-card" style="background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">Tiempo de Vida</h3>
                <div style="font-size:2.5rem; font-weight:800; margin-top:12px; background:linear-gradient(45deg, #46d369, #2ecc71); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                    ${days}d ${hours}h ${mins}m
                </div>
                <div style="margin-top:8px; color:var(--text-muted); font-size:0.9rem;">
                    Total de ${logs.length} películas vistas.
                </div>
            </div>

            <!-- Taste DNA -->
            <div class="stat-card" style="background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">ADN del Gusto (Top Géneros)</h3>
                <canvas id="genreChart"></canvas>
            </div>

            <!-- Ratings Curve -->
            <div class="stat-card" style="background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">Curva Crítica</h3>
                <canvas id="ratingChart"></canvas>
            </div>

            <!-- NEW: Velocity (Ritmo) -->
            <div class="stat-card" style="grid-column: 1 / -1; background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">Ritmo Mensual (Último Año)</h3>
                <canvas id="velocityChart" style="max-height:300px;"></canvas>
            </div>

            <!-- NEW: Decades -->
            <div class="stat-card" style="background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">Viajero en el Tiempo (Décadas)</h3>
                <canvas id="decadeChart"></canvas>
            </div>

             <!-- NEW: Platforms -->
            <div class="stat-card" style="background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">Tus Pantallas</h3>
                <canvas id="platformChart"></canvas>
            </div>

             <!-- NEW: Days of Week -->
            <div class="stat-card" style="background:var(--surface); padding:24px; border-radius:16px;">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">Hábitos Semanales</h3>
                <canvas id="dayChart"></canvas>
            </div>

        </div>
    `;

    // Initialize Charts
    renderGenreChart(sortedGenres);
    renderRatingChart(ratings);
    renderVelocityChart(logs);
    renderDecadeChart(logs);
    renderPlatformChart(logs);
    renderDayOfWeekChart(logs);
}

// ... existing Charts ...

function renderDayOfWeekChart(logs) {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const counts = Array(7).fill(0);

    logs.forEach(l => {
        if (l.watched_at) {
            // watched_at is YYYY-MM-DD. Creates date.
            // Note: Date parsing can change due to timezone, but assuming YYYY-MM-DD string is local or UTC consistent enough for this stat.
            // To be safe, we split and use Date.UTC or simple constructor 
            const [y, m, d] = l.watched_at.split('-');
            const date = new Date(y, m - 1, d);
            const dayIndex = date.getDay(); // 0-6
            counts[dayIndex]++;
        }
    });

    // Shift to start on Monday? Default JS is Sunday=0. Let's keep Dom-Sab or Lun-Dom.
    // Let's do Lun-Dom for better reading
    const shiftedDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const shiftedCounts = [
        counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]
    ];

    const ctx = document.getElementById('dayChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: shiftedDays,
            datasets: [{
                label: 'Días',
                data: shiftedCounts,
                backgroundColor: (ctx) => {
                    // Highlight Weekend
                    const idx = ctx.dataIndex; // 0=Lun ... 5=Sab, 6=Dom
                    return (idx >= 5) ? '#e67e22' : '#3498db';
                },
                borderRadius: 4
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888', stepSize: 1 } },
                x: { grid: { display: false }, ticks: { color: '#ccc' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderGenreChart(data) {
    const ctx = document.getElementById('genreChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d[0]),
            datasets: [{
                data: data.map(d => d[1]),
                backgroundColor: [
                    '#E50914', '#ff6b6b', '#f5c518', '#46d369',
                    '#3498db', '#9b59b6', '#e67e22', '#1abc9c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right', labels: { color: '#ccc', font: { size: 11 } } }
            }
        }
    });
}

function renderRatingChart(ratings) {
    const counts = Array(11).fill(0); // 0-10 buckets
    ratings.forEach(r => {
        const bucket = Math.round(r);
        if (bucket >= 0 && bucket <= 10) counts[bucket]++;
    });

    const ctx = document.getElementById('ratingChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            datasets: [{
                label: 'Votos',
                data: counts,
                backgroundColor: (ctx) => {
                    const v = ctx.parsed.x;
                    return v >= 8 ? '#46d369' : (v >= 5 ? '#f5c518' : '#e74c3c');
                },
                borderRadius: 4
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888' } },
                x: { grid: { display: false }, ticks: { color: '#888' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderVelocityChart(logs) {
    // Last 12 months map
    const months = {};
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7); // YYYY-MM
        months[key] = 0;
    }

    logs.forEach(l => {
        const key = l.watched_at.slice(0, 7);
        if (months.hasOwnProperty(key)) {
            months[key]++;
        }
    });

    const ctx = document.getElementById('velocityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(months).map(m => {
                const [y, mn] = m.split('-');
                const date = new Date(y, mn - 1);
                return date.toLocaleDateString('es-MX', { month: 'short' });
            }),
            datasets: [{
                label: 'Películas',
                data: Object.values(months),
                borderColor: '#E50914',
                backgroundColor: 'rgba(229, 9, 20, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888', stepSize: 1 } },
                x: { grid: { display: false }, ticks: { color: '#888' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderDecadeChart(logs) {
    const decades = {};
    logs.forEach(l => {
        if (l.movie && l.movie.release_date) {
            const year = parseInt(l.movie.release_date.split('-')[0]);
            if (!isNaN(year)) {
                const decade = Math.floor(year / 10) * 10;
                decades[decade + 's'] = (decades[decade + 's'] || 0) + 1;
            }
        }
    });

    // Sort by decade
    const sortedKeys = Object.keys(decades).sort();

    const ctx = document.getElementById('decadeChart').getContext('2d');
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: sortedKeys,
            datasets: [{
                data: sortedKeys.map(k => decades[k]),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right', labels: { color: '#ccc' } }
            },
            scales: {
                r: {
                    ticks: { display: false, backdropColor: 'transparent' },
                    grid: { color: '#444' }
                }
            }
        }
    });
}

function renderPlatformChart(logs) {
    const platforms = {};
    logs.forEach(l => {
        const p = l.platform || 'Otro';
        platforms[p] = (platforms[p] || 0) + 1;
    });

    const ctx = document.getElementById('platformChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // or doughnut
        data: {
            labels: Object.keys(platforms),
            datasets: [{
                label: 'Vistas',
                data: Object.values(platforms),
                backgroundColor: Object.keys(platforms).map(p => {
                    if (p === 'Netflix') return '#E50914';
                    if (p === 'HBO' || p === 'Max') return '#9b59b6';
                    if (p === 'Cine') return '#f1c40f';
                    if (p === 'Prime') return '#3498db';
                    return '#95a5a6';
                }),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            scales: {
                x: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888' } },
                y: { grid: { display: false }, ticks: { color: '#ccc' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
