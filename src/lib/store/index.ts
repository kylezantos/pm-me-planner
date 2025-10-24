import { supabase } from '../supabase';
import { useTasksStore } from './tasksStore';
import { useBlocksStore } from './blocksStore';
import { useBlockTypesStore } from './blockTypesStore';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Task, BlockInstance, BlockType } from '../types';

// Export all stores
export { useTasksStore, useBlocksStore, useBlockTypesStore };

// Real-time subscription manager
let tasksChannel: RealtimeChannel | null = null;
let blocksChannel: RealtimeChannel | null = null;
let blockTypesChannel: RealtimeChannel | null = null;

export function subscribeToRealtime(userId: string) {
  // Unsubscribe from existing channels
  unsubscribeFromRealtime();

  // Subscribe to tasks changes
  tasksChannel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
          case 'INSERT':
            // If task has no block_instance_id, add to backlog
            if (newRecord && !newRecord.block_instance_id) {
              const task = newRecord as Task;
              const currentBacklog = useTasksStore.getState().backlogTasks;
              if (!currentBacklog.find((t) => t.id === task.id)) {
                useTasksStore.setState({
                  backlogTasks: [task, ...currentBacklog],
                });
              }
            }
            break;

          case 'UPDATE':
            if (newRecord) {
              const task = newRecord as Task;
              // Update in backlog if present
              useTasksStore.setState((state) => ({
                backlogTasks: state.backlogTasks.map((t) =>
                  t.id === task.id ? task : t
                ),
                tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
              }));

              // Remove from backlog if assigned to a block
              if (task.block_instance_id) {
                useTasksStore.setState((state) => ({
                  backlogTasks: state.backlogTasks.filter((t) => t.id !== task.id),
                }));
              }
            }
            break;

          case 'DELETE':
            if (oldRecord) {
              const task = oldRecord as Task;
              useTasksStore.setState((state) => ({
                backlogTasks: state.backlogTasks.filter((t) => t.id !== task.id),
                tasks: state.tasks.filter((t) => t.id !== task.id),
              }));
            }
            break;
        }
      }
    )
    .subscribe();

  // Subscribe to block_instances changes
  blocksChannel = supabase
    .channel('blocks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'block_instances',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
          case 'INSERT':
            if (newRecord) {
              const block = newRecord as BlockInstance;
              useBlocksStore.setState((state) => {
                // Check if block already exists
                if (state.blocks.find((b) => b.id === block.id)) {
                  return state;
                }
                return {
                  blocks: [...state.blocks, block].sort(
                    (a, b) =>
                      new Date(a.planned_start).getTime() -
                      new Date(b.planned_start).getTime()
                  ),
                };
              });
            }
            break;

          case 'UPDATE':
            if (newRecord) {
              const block = newRecord as BlockInstance;
              useBlocksStore.setState((state) => ({
                blocks: state.blocks.map((b) => (b.id === block.id ? block : b)),
              }));
            }
            break;

          case 'DELETE':
            if (oldRecord) {
              const block = oldRecord as BlockInstance;
              useBlocksStore.setState((state) => ({
                blocks: state.blocks.filter((b) => b.id !== block.id),
              }));
            }
            break;
        }
      }
    )
    .subscribe();

  // Subscribe to block_types changes
  blockTypesChannel = supabase
    .channel('block-types-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'block_types',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
          case 'INSERT':
            if (newRecord) {
              const blockType = newRecord as BlockType;
              useBlockTypesStore.setState((state) => {
                // Check if block type already exists
                if (state.blockTypes.find((bt) => bt.id === blockType.id)) {
                  return state;
                }
                return {
                  blockTypes: [...state.blockTypes, blockType].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  ),
                };
              });
            }
            break;

          case 'UPDATE':
            if (newRecord) {
              const blockType = newRecord as BlockType;
              useBlockTypesStore.setState((state) => ({
                blockTypes: state.blockTypes.map((bt) =>
                  bt.id === blockType.id ? blockType : bt
                ),
              }));
            }
            break;

          case 'DELETE':
            if (oldRecord) {
              const blockType = oldRecord as BlockType;
              useBlockTypesStore.setState((state) => ({
                blockTypes: state.blockTypes.filter((bt) => bt.id !== blockType.id),
              }));
            }
            break;
        }
      }
    )
    .subscribe();
}

export function unsubscribeFromRealtime() {
  if (tasksChannel) {
    supabase.removeChannel(tasksChannel);
    tasksChannel = null;
  }
  if (blocksChannel) {
    supabase.removeChannel(blocksChannel);
    blocksChannel = null;
  }
  if (blockTypesChannel) {
    supabase.removeChannel(blockTypesChannel);
    blockTypesChannel = null;
  }
}

// Initialize stores with data
export async function initializeStores(userId: string) {
  // Fetch all data in parallel
  await Promise.all([
    useTasksStore.getState().fetchBacklogTasks(userId),
    useBlocksStore.getState().fetchBlocksForWeek(userId, new Date()),
    useBlockTypesStore.getState().fetchBlockTypes(userId),
  ]);

  // Start real-time subscriptions
  subscribeToRealtime(userId);
}
