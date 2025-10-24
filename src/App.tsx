import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { validateEnv } from "./lib/env";
import { testConnection } from "./lib/supabase";
import { ensureNotificationActionsRegistered } from "./lib/notifications";
import { startNotifications, type NotificationServiceHandle } from "./lib/notifications";
import { initializeStores } from "./lib/store";
import { initializeUserPreferences } from "./lib/repositories";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { CalendarSyncProvider } from "./lib/google";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import CalendarTest from "./pages/CalendarTest";
import OAuthCallback from "./pages/OAuthCallback";

// Hardcoded test user ID for development
// TODO: Replace with actual auth when implemented
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

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

      // Initialize default user preferences if they don't exist
      initializeUserPreferences(TEST_USER_ID).then((result) => {
        if (result.error) {
          console.error("Failed to initialize user preferences:", result.error);
        } else {
          console.log("User preferences initialized:", result.data);
        }
      });

      // Initialize Zustand stores with test user ID
      initializeStores(TEST_USER_ID);
    } catch (error) {
      console.error("Environment validation failed:", error);
    }
  }, []);

  useEffect(() => {
    const userId = import.meta.env.VITE_DEBUG_USER_ID || TEST_USER_ID;
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

  return (
    <ErrorBoundary>
      {/* Provide calendar sync context so manual sync and future auto-sync work */}
      <CalendarSyncProvider userId={TEST_USER_ID} autoStart={false}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard userId={TEST_USER_ID} />} />
            <Route path="/settings" element={<Settings userId={TEST_USER_ID} />} />
            <Route path="/calendar-test" element={<CalendarTest />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CalendarSyncProvider>
    </ErrorBoundary>
  );
}

export default App;
