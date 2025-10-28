import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../supabase';

// Zustand store for calendar sync state
interface CalendarSyncState {
  syncing: boolean;
  lastSync: Date | null;
  connectionsCount: number;
  error: string | null;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (lastSync: Date | null) => void;
  setConnectionsCount: (count: number) => void;
  setError: (error: string | null) => void;
}

export const useCalendarSyncStore = create<CalendarSyncState>((set) => ({
  syncing: false,
  lastSync: null,
  connectionsCount: 0,
  error: null,
  setSyncing: (syncing) => set({ syncing }),
  setLastSync: (lastSync) => set({ lastSync }),
  setConnectionsCount: (connectionsCount) => set({ connectionsCount }),
  setError: (error) => set({ error }),
}));

// Context for sync functionality
interface CalendarSyncContextValue {
  syncNow: () => Promise<void>;
}

const CalendarSyncContext = createContext<CalendarSyncContextValue | null>(null);

interface CalendarSyncProviderProps {
  children: React.ReactNode;
  userId: string;
  autoStart?: boolean;
  intervalMs?: number;
}

export function CalendarSyncProvider({
  children,
  userId,
}: CalendarSyncProviderProps) {
  const store = useCalendarSyncStore();

  // Fetch connection count
  const fetchConnectionCount = async () => {
    try {
      const { count, error } = await supabase
        .from('calendar_connections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to fetch connection count:', error);
        store.setConnectionsCount(0);
        return;
      }

      store.setConnectionsCount(count ?? 0);
    } catch (error) {
      console.error('Failed to fetch connection count:', error);
      store.setConnectionsCount(0);
    }
  };

  // Fetch initial connection count on mount
  useEffect(() => {
    fetchConnectionCount();
  }, [userId]);

  // Subscribe to calendar_connections changes to update count
  useEffect(() => {
    const channel = supabase
      .channel('calendar-connections-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_connections',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch connection count on any change
          fetchConnectionCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Manual sync function (stub implementation)
  // TODO: Implement calendar sync via Tauri backend command
  const syncNow = async () => {
    // Disable sync if no connections exist
    if (store.connectionsCount === 0) {
      store.setError('No calendar connections available');
      return;
    }

    store.setSyncing(true);
    store.setError(null);

    try {
      // TODO: Call Tauri backend command for calendar sync
      // await invoke('sync_calendar', { userId });

      console.log('Calendar sync stub - backend implementation pending');
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      store.setLastSync(new Date());
      store.setError('Calendar sync not yet implemented - backend integration pending');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      store.setError(errorMessage);
    } finally {
      store.setSyncing(false);
    }
  };

  const contextValue: CalendarSyncContextValue = {
    syncNow,
  };

  return (
    <CalendarSyncContext.Provider value={contextValue}>
      {children}
    </CalendarSyncContext.Provider>
  );
}

// Hook to use calendar sync functionality
export function useCalendarSync() {
  const context = useContext(CalendarSyncContext);
  const store = useCalendarSyncStore();

  if (!context) {
    throw new Error('useCalendarSync must be used within CalendarSyncProvider');
  }

  return {
    syncNow: context.syncNow,
    syncing: store.syncing,
    lastSync: store.lastSync,
    connectionsCount: store.connectionsCount,
    error: store.error,
  };
}
