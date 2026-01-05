import { supabase } from '../supabase-client.js';

export const BADGES = [
    {
        code: 'NEWBIE',
        name: 'Palomitas Frescas',
        description: 'Registra tu primera película',
        icon: 'fas fa-baby',
        color: '#3498db',
        check: (logs) => logs.length >= 1
    },
    {
        code: 'FAN',
        name: 'Cinéfilo',
        description: '10 Películas registradas',
        icon: 'fas fa-video',
        color: '#e67e22',
        check: (logs) => logs.length >= 10
    },
    {
        code: 'CRITIC',
        name: 'La Pluma de Oro',
        description: 'Escribe 3 reseñas',
        icon: 'fas fa-pen-nib',
        color: '#f1c40f',
        check: (logs) => logs.filter(l => l.review && l.review.length > 10).length >= 3
    },
    {
        code: 'MARATHON',
        name: 'Maratonista',
        description: '3 películas en un mismo día',
        icon: 'fas fa-running',
        color: '#e74c3c',
        check: (logs) => {
            const counts = {};
            logs.forEach(l => {
                const date = l.watched_at;
                counts[date] = (counts[date] || 0) + 1;
            });
            return Object.values(counts).some(c => c >= 3);
        }
    },
    {
        code: 'GLOBETROTTER',
        name: 'Trotamundos',
        description: 'Películas de 5 países diferentes (Basado en Logs)',
        icon: 'fas fa-globe-americas',
        color: '#9b59b6',
        check: (logs) => {
            const countries = new Set();
            logs.forEach(l => {
                if (l.movie && l.movie.production_countries) {
                    // Parse JSON if needed
                    const pcs = typeof l.movie.production_countries === 'string'
                        ? JSON.parse(l.movie.production_countries)
                        : l.movie.production_countries;

                    if (Array.isArray(pcs)) {
                        pcs.forEach(c => countries.add(c.iso_3166_1));
                    }
                }
            });
            return countries.size >= 5;
        }
    }
];

export async function checkAndUnlockBadges(userId) {
    if (!userId) return;

    // 1. Get all logs for calculation
    const { data: logs } = await supabase
        .from('logs')
        .select('*, movie:movies(*)')
        .eq('user_id', userId);

    if (!logs) return;

    // 2. Get existing badges
    const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_code')
        .eq('user_id', userId);

    const ownedCodes = new Set(existingBadges.map(b => b.badge_code));
    const newBadges = [];

    // 3. Check logic
    for (const badge of BADGES) {
        if (!ownedCodes.has(badge.code)) {
            if (badge.check(logs)) {
                newBadges.push(badge);
            }
        }
    }

    // 4. Unlock
    if (newBadges.length > 0) {
        // Insert
        const inserts = newBadges.map(b => ({
            user_id: userId,
            badge_code: b.code
        }));

        await supabase.from('user_badges').insert(inserts);

        // Notify
        newBadges.forEach(b => {
            alert(`🏆 ¡LOGRO DESBLOQUEADO!\n\n${b.name}: ${b.description}`);
        });
    }
}

export async function getBadgesStatus(userId) {
    const { data: owned } = await supabase
        .from('user_badges')
        .select('badge_code, earned_at')
        .eq('user_id', userId);

    const ownedMap = {};
    if (owned) {
        owned.forEach(o => ownedMap[o.badge_code] = o.earned_at);
    }

    return BADGES.map(b => ({
        ...b,
        unlocked: !!ownedMap[b.code],
        earnedAt: ownedMap[b.code]
    }));
}
