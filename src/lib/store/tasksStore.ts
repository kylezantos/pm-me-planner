import { create } from 'zustand';
import { supabase } from '../supabase';
import type { Task, TaskInsert, TaskUpdate, TaskWithBlockType } from '../types';

interface TasksState {
  tasks: Task[];
  backlogTasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBacklogTasks: (userId: string) => Promise<void>;
  fetchTasksByBlockInstance: (blockInstanceId: string) => Promise<Task[]>;
  createTask: (task: TaskInsert) => Promise<Task | null>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTaskToBlock: (taskId: string, blockInstanceId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  backlogTasks: [],
  loading: false,
  error: null,

  fetchBacklogTasks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .is('block_instance_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ backlogTasks: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch backlog tasks',
        loading: false,
      });
    }
  },

  fetchTasksByBlockInstance: async (blockInstanceId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('block_instance_id', blockInstanceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch tasks for block:', error);
      return [];
    }
  },

  createTask: async (task: TaskInsert) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;

      // Add to backlog if no block_instance_id
      if (!task.block_instance_id) {
        set((state) => ({
          backlogTasks: [data, ...state.backlogTasks],
          loading: false,
        }));
      }

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        loading: false,
      });
      return null;
    }
  },

  updateTask: async (id: string, updates: TaskUpdate) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update in backlog if present
      set((state) => ({
        backlogTasks: state.backlogTasks.map((t) => (t.id === id ? data : t)),
        tasks: state.tasks.map((t) => (t.id === id ? data : t)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        loading: false,
      });
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      // Remove from both lists
      set((state) => ({
        backlogTasks: state.backlogTasks.filter((t) => t.id !== id),
        tasks: state.tasks.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
        loading: false,
      });
    }
  },

  assignTaskToBlock: async (taskId: string, blockInstanceId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ block_instance_id: blockInstanceId })
        .eq('id', taskId);

      if (error) throw error;

      // Remove from backlog after successful assignment
      set((state) => ({
        backlogTasks: state.backlogTasks.filter((t) => t.id !== taskId),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to assign task to block',
      });
    }
  },

  toggleTaskStatus: async (taskId: string) => {
    const task = get().backlogTasks.find((t) => t.id === taskId) || get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: Task['status'] =
      task.status === 'completed'
        ? 'pending'
        : task.status === 'pending'
          ? 'in_progress'
          : 'completed';

    const updates: TaskUpdate = {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    };

    await get().updateTask(taskId, updates);
  },

  setTasks: (tasks: Task[]) => set({ tasks }),
}));
