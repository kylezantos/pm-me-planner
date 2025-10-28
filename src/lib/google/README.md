# Google Calendar Integration

This directory contains the Google Calendar sync implementation for PM Me Planner.

## CalendarSyncProvider & useCalendarSync Hook

The `CalendarSyncProvider` component and `useCalendarSync` hook provide a React-based interface for managing calendar synchronization.

### Usage

#### 1. Wrap your app with CalendarSyncProvider

```tsx
import { CalendarSyncProvider } from './lib/google';

function App() {
  const userId = useAuth().userId; // Get from your auth context

  return (
    <CalendarSyncProvider
      userId={userId}
      autoStart={true}  // Optional: auto-start periodic sync
      intervalMs={300000}  // Optional: sync interval (default: 5 minutes)
    >
      {/* Your app components */}
    </CalendarSyncProvider>
  );
}
```

#### 2. Use the hook in your components

```tsx
import { useCalendarSync } from './lib/google';

function SyncButton() {
  const { syncNow, syncing, lastSync, connectionsCount, error } = useCalendarSync();

  return (
    <div>
      <button
        onClick={syncNow}
        disabled={syncing || connectionsCount === 0}
      >
        {syncing ? 'Syncing...' : 'Sync Calendar'}
      </button>

      {lastSync && (
        <p>Last synced: {lastSync.toLocaleString()}</p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}

      {connectionsCount === 0 && (
        <p>No calendar connections. Please connect a calendar first.</p>
      )}
    </div>
  );
}
```

### API Reference

#### CalendarSyncProvider Props

- `children`: React.ReactNode - Child components
- `userId`: string - User ID to filter calendar connections
- `autoStart?`: boolean - Whether to start auto-sync on mount (default: false)
- `intervalMs?`: number - Sync interval in milliseconds (default: 300000 = 5 minutes)

#### useCalendarSync Return Value

```typescript
{
  syncNow: () => Promise<void>;  // Manually trigger a sync
  syncing: boolean;              // Whether sync is currently running
  lastSync: Date | null;         // Timestamp of last successful sync
  connectionsCount: number;      // Number of active calendar connections
  error: string | null;          // Error message if sync failed
}
```

### Features

- **Single Scheduler Instance**: Uses a single `AutoSyncScheduler` instance per provider
- **Automatic Lifecycle Management**: Automatically starts/stops scheduler on mount/unmount
- **Real-time Connection Count**: Subscribes to calendar_connections table changes
- **Error Handling**: Surfaces errors via the hook for UI display
- **Connection Validation**: Automatically disables sync when no connections exist
- **Manual Sync**: Provides `syncNow()` for on-demand synchronization

### Implementation Details

The provider uses:
- **Zustand store** (`useCalendarSyncStore`) for global sync state
- **React Context** for providing the `syncNow` function and scheduler instance
- **Tauri commands** to securely fetch Google credentials from backend
- **Supabase Realtime** to track calendar connection changes

### Error Scenarios

The hook will set an error and prevent sync in these cases:

1. **No connections**: `connectionsCount === 0`
2. **Scheduler not initialized**: Credentials missing or initialization failed
3. **Sync failure**: Network errors, token refresh failures, etc.

All errors are surfaced via the `error` property and logged to console.
