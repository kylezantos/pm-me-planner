import { useEffect } from "react";
import { validateEnv } from "./lib/env";
import { testConnection } from "./lib/supabase";
import { ensureNotificationActionsRegistered } from "./lib/notifications";
import { startNotifications, type NotificationServiceHandle } from "./lib/notifications";
import Dashboard from "./pages/Dashboard";

function App() {
  useEffect(() => {
    // Validate environment variables on mount
    try {
      validateEnv();

      // Test Supabase connection
      testConnection().then((connected) => {
        if (!connected) {
          console.error("Failed to connect to Supabase");
        }
      });
    } catch (error) {
      console.error("Environment validation failed:", error);
    }
  }, []);

  useEffect(() => {
    const userId = import.meta.env.VITE_DEBUG_USER_ID;
    let handle: NotificationServiceHandle | null = null;
    if (userId) {
      handle = startNotifications({
        userId,
        deliveryIntervalMs: 30_000,
        scheduleIntervalMs: 60_000,
        lookaheadMinutes: 60,
        debounceMs: 3_000,
        minTickIntervalMs: 5_000,
        listenRealtime: true,
      });
    }
    return () => {
      handle?.stop();
    };
  }, []);

  useEffect(() => {
    ensureNotificationActionsRegistered().catch((error) => {
      console.error("Failed to register notification actions:", error);
    });
  }, []);

  return <Dashboard />;
}

export default App;
