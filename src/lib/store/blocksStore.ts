import { create } from 'zustand';
import { supabase } from '../supabase';
import type { BlockInstance, BlockInstanceInsert, BlockInstanceUpdate, BlockInstanceWithDetails } from '../types';

interface BlocksState {
  blocks: BlockInstance[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBlocksForWeek: (userId: string, startDate: Date) => Promise<void>;
  fetchBlocksForDateRange: (userId: string, start: string, end: string) => Promise<BlockInstance[]>;
  createBlock: (block: BlockInstanceInsert) => Promise<BlockInstance | null>;
  updateBlock: (id: string, updates: BlockInstanceUpdate) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  setBlocks: (blocks: BlockInstance[]) => void;
}

export const useBlocksStore = create<BlocksState>((set, get) => ({
  blocks: [],
  loading: false,
  error: null,

  fetchBlocksForWeek: async (userId: string, startDate: Date) => {
    set({ loading: true, error: null });
    try {
      // Calculate start and end of week
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - start.getDay()); // Sunday

      const end = new Date(start);
      end.setDate(end.getDate() + 7); // Next Sunday
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('block_instances')
        .select('*')
        .eq('user_id', userId)
        .gte('planned_start', start.toISOString())
        .lt('planned_start', end.toISOString())
        .order('planned_start', { ascending: true });

      if (error) throw error;

      set({ blocks: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch blocks',
        loading: false,
      });
    }
  },

  fetchBlocksForDateRange: async (userId: string, start: string, end: string) => {
    try {
      const { data, error } = await supabase
        .from('block_instances')
        .select('*')
        .eq('user_id', userId)
        .gte('planned_start', start)
        .lt('planned_start', end)
        .order('planned_start', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch blocks for date range:', error);
      return [];
    }
  },

  createBlock: async (block: BlockInstanceInsert) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('block_instances')
        .insert(block)
        .select()
        .single();

      if (error) throw error;

      // Add to state
      set((state) => ({
        blocks: [...state.blocks, data].sort(
          (a, b) =>
            new Date(a.planned_start).getTime() - new Date(b.planned_start).getTime()
        ),
        loading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create block',
        loading: false,
      });
      return null;
    }
  },

  updateBlock: async (id: string, updates: BlockInstanceUpdate) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('block_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update in state
      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === id ? data : b)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update block',
        loading: false,
      });
    }
  },

  deleteBlock: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('block_instances').delete().eq('id', id);

      if (error) throw error;

      // Remove from state
      set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete block',
        loading: false,
      });
    }
  },

  setBlocks: (blocks: BlockInstance[]) => set({ blocks }),
}));
