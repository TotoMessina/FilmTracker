import { CONFIG } from './config.js';

if (!window.supabase) {
    console.error('Supabase SDK not loaded.');
}

export const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
