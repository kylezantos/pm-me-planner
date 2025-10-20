import { supabase } from '../supabase';
import { NotificationQueueService } from './queue';
import type { BlockInstance } from '../types';

export function subscribePauseNotifications(params: { userId: string }): () => void {
  const { userId } = params;
  const queue = new NotificationQueueService();

  const channel = supabase
    .channel(`notif-pauses-${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'block_instances', filter: `user_id=eq.${userId}` },
      async (payload) => {
        const oldRow = payload.old as BlockInstance | undefined;
        const newRow = payload.new as BlockInstance | undefined;
        if (!oldRow || !newRow) return;

        if (oldRow.status !== 'paused' && newRow.status === 'paused') {
          try {
            let block_name: string | undefined;
            let block_color: string | undefined;
            try {
              const { data } = await supabase
                .from('block_types')
                .select('name, color')
                .eq('id', newRow.block_type_id)
                .maybeSingle();
              block_name = data?.name ?? undefined;
              block_color = (data as any)?.color ?? undefined;
            } catch (_) { /* noop */ }
            await queue.enqueue(userId, [
              {
                type: 'block_paused',
                targetTime: new Date().toISOString(),
                payload: {
                  block_type_id: newRow.block_type_id,
                  block_instance_id: newRow.id,
                  start_time: newRow.planned_start,
                  block_name,
                  block_color,
                },
              },
            ]);
          } catch (e) {
            console.error('[Notifications] Failed to enqueue pause notification', e);
          }
        }
      }
    )
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (_) {
      // noop
    }
  };
}
