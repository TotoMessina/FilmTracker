import { supabase } from '../supabase-client.js';

let blacklistCache = new Set();

export async function initBlacklist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
        .from('hidden_items')
        .select('tmdb_id');

    if (data) {
        blacklistCache = new Set(data.map(i => i.tmdb_id));
    }
}

export function isBlacklisted(tmdbId) {
    return blacklistCache.has(tmdbId);
}

export async function addToBlacklist(tmdbId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    blacklistCache.add(tmdbId); // Optimistic update

    const { error } = await supabase
        .from('hidden_items')
        .insert({ user_id: user.id, tmdb_id: tmdbId });

    if (error) {
        console.error('Error adding to blacklist:', error);
        blacklistCache.delete(tmdbId); // Revert
    } else {
        // Dispatch event to remove from UI if present
        window.dispatchEvent(new CustomEvent('blacklist:add', { detail: { tmdbId } }));
    }
}
