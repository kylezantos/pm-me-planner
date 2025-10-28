import { supabase } from '../supabase';

type Handler = () => void;

/**
 * Subscribes to realtime changes for calendar-related data and invokes
 * the handler when block instances or block types change for the user.
 *
 * Note: We pass a filter on user_id for block_instances. For block_types
 * we also filter by user_id so we only refresh when the current user's
 * type metadata changes (e.g., name/color).
 */
export function subscribeCalendarChanges(params: {
  userId: string;
  onChange: Handler;
}): () => void {
  const { userId, onChange } = params;

  const channel = supabase
    .channel(`calendar-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'block_instances', filter: `user_id=eq.${userId}` },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'block_types', filter: `user_id=eq.${userId}` },
      () => onChange()
    )
    .subscribe();

  return () => {
    try {
      // Remove the channel; ignore result
      supabase.removeChannel(channel);
    } catch (_) {
      // noop
    }
  };
}

