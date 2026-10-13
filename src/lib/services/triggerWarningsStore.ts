import { supabase } from '@/lib/supabase/client';
import { TriggerWarningItem, TriggerWarningCategory } from '@/lib/types/triggerWarnings';

// In-memory fallback cache if Supabase table is not yet migrated
const memoryStore = new Map<number, TriggerWarningItem[]>();
const userReportsCount = new Map<string, number>(); // key: `${userId}_${tmdbId}` -> count
const userUpvotes = new Set<string>(); // key: `${userId}_${warningId}`

export async function getMovieTriggerWarnings(tmdbId: number, currentUserId?: string): Promise<TriggerWarningItem[]> {
  try {
    const { data, error } = await supabase
      .from('trigger_warnings')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .order('upvotes', { ascending: false });

    if (!error && Array.isArray(data)) {
      // Fetch user's upvotes if logged in
      let votedIds = new Set<string>();
      if (currentUserId) {
        const { data: votes } = await supabase
          .from('trigger_warning_votes')
          .select('warning_id')
          .eq('user_id', currentUserId);
        if (votes) {
          votes.forEach((v: { warning_id: string }) => votedIds.add(v.warning_id));
        }
      }

      return data.map((item) => ({
        ...item,
        user_has_upvoted: votedIds.has(item.id) || (currentUserId ? userUpvotes.has(`${currentUserId}_${item.id}`) : false),
      }));
    }
  } catch (err) {
    console.warn('Fallback to memoryStore for trigger_warnings:', err);
  }

  // Fallback to in-memory store
  const list = memoryStore.get(tmdbId) || [];
  return list.map((item) => ({
    ...item,
    user_has_upvoted: currentUserId ? userUpvotes.has(`${currentUserId}_${item.id}`) : false,
  }));
}

export async function saveTriggerWarning(
  warning: Omit<TriggerWarningItem, 'id' | 'created_at'>
): Promise<TriggerWarningItem> {
  const generatedId = `tw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const item: TriggerWarningItem = {
    ...warning,
    id: generatedId,
    created_at: new Date().toISOString(),
  };

  // Try saving to Supabase
  try {
    const { data, error } = await supabase
      .from('trigger_warnings')
      .insert({
        tmdb_id: warning.tmdb_id,
        category: warning.category,
        label: warning.label,
        source: warning.source,
        reported_by: warning.reported_by || null,
        upvotes: warning.upvotes || 0,
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase insert failed, storing in memory:', err);
  }

  // Save to memoryStore
  const existing = memoryStore.get(warning.tmdb_id) || [];
  // Avoid duplicate identical category from same source
  const alreadyExists = existing.some(
    (e) => e.category === warning.category && e.source === warning.source
  );
  if (!alreadyExists) {
    existing.push(item);
    memoryStore.set(warning.tmdb_id, existing);
  }

  return item;
}

export async function upvoteTriggerWarning(
  warningId: string,
  tmdbId: number,
  userId: string
): Promise<{ success: boolean; upvotes: number; alreadyVoted?: boolean }> {
  const voteKey = `${userId}_${warningId}`;
  if (userUpvotes.has(voteKey)) {
    return { success: false, upvotes: 0, alreadyVoted: true };
  }

  userUpvotes.add(voteKey);

  // Try updating in Supabase
  try {
    await supabase.from('trigger_warning_votes').insert({
      warning_id: warningId,
      user_id: userId,
    });

    const { data: current } = await supabase
      .from('trigger_warnings')
      .select('upvotes')
      .eq('id', warningId)
      .single();

    const newVotes = (current?.upvotes || 0) + 1;

    const { error: updateErr } = await supabase
      .from('trigger_warnings')
      .update({ upvotes: newVotes })
      .eq('id', warningId);

    if (!updateErr) {
      return { success: true, upvotes: newVotes };
    }
  } catch (err) {
    console.warn('Supabase upvote error, updating in-memory:', err);
  }

  // Update in memoryStore
  const list = memoryStore.get(tmdbId) || [];
  const target = list.find((w) => w.id === warningId);
  if (target) {
    target.upvotes = (target.upvotes || 0) + 1;
    return { success: true, upvotes: target.upvotes };
  }

  return { success: true, upvotes: 1 };
}

export function getUserReportCount(userId: string, tmdbId: number): number {
  return userReportsCount.get(`${userId}_${tmdbId}`) || 0;
}

export function incrementUserReportCount(userId: string, tmdbId: number): void {
  const key = `${userId}_${tmdbId}`;
  const curr = userReportsCount.get(key) || 0;
  userReportsCount.set(key, curr + 1);
}
