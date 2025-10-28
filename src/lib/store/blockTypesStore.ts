import { create } from 'zustand';
import { supabase } from '../supabase';
import type { BlockType, BlockTypeInsert, BlockTypeUpdate } from '../types';

interface BlockTypesState {
  blockTypes: BlockType[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBlockTypes: (userId: string) => Promise<void>;
  createBlockType: (blockType: BlockTypeInsert) => Promise<BlockType | null>;
  updateBlockType: (id: string, updates: BlockTypeUpdate) => Promise<void>;
  deleteBlockType: (id: string) => Promise<void>;
  setBlockTypes: (blockTypes: BlockType[]) => void;
}

export const useBlockTypesStore = create<BlockTypesState>((set, get) => ({
  blockTypes: [],
  loading: false,
  error: null,

  fetchBlockTypes: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('block_types')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;

      set({ blockTypes: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch block types',
        loading: false,
      });
    }
  },

  createBlockType: async (blockType: BlockTypeInsert) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('block_types')
        .insert(blockType)
        .select()
        .single();

      if (error) throw error;

      // Add to state
      set((state) => ({
        blockTypes: [...state.blockTypes, data].sort((a, b) => a.name.localeCompare(b.name)),
        loading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create block type',
        loading: false,
      });
      return null;
    }
  },

  updateBlockType: async (id: string, updates: BlockTypeUpdate) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('block_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update in state
      set((state) => ({
        blockTypes: state.blockTypes.map((bt) => (bt.id === id ? data : bt)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update block type',
        loading: false,
      });
    }
  },

  deleteBlockType: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('block_types').delete().eq('id', id);

      if (error) throw error;

      // Remove from state
      set((state) => ({
        blockTypes: state.blockTypes.filter((bt) => bt.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete block type',
        loading: false,
      });
    }
  },

  setBlockTypes: (blockTypes: BlockType[]) => set({ blockTypes }),
}));
