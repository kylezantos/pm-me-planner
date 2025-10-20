import { useState, useEffect, useMemo } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { validateEnv } from "./lib/env";
import { testConnection } from "./lib/supabase";
import { NotificationQueueService } from "./lib/notifications/queue";
import { ensureNotificationActionsRegistered, NotificationRunner } from "./lib/notifications";
import { startNotifications, type NotificationServiceHandle } from "./lib/notifications";
import { sendQueuedNotification } from "./lib/notifications/sender";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");

  const notificationQueue = useMemo(() => new NotificationQueueService(), []);

  useEffect(() => {
    // Validate environment variables on mount
    try {
      validateEnv();

      // Test Supabase connection
      testConnection().then((connected) => {
        setDbStatus(connected ? "connected" : "error");
      });
    } catch (error) {
      console.error("Environment validation failed:", error);
      setDbStatus("error");
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

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to PM Me Planner</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <div style={{ margin: "20px 0", padding: "10px", background: "#1a1a1a", borderRadius: "8px" }}>
        <h3>Database Status</h3>
        <p>
          Supabase: {" "}
          {dbStatus === "checking" && "🔄 Checking connection..."}
          {dbStatus === "connected" && "✅ Connected"}
          {dbStatus === "error" && "❌ Connection failed (check console)"}
        </p>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      {import.meta.env.VITE_DEBUG_USER_ID ? (
        <button
          type="button"
          onClick={async () => {
            const now = new Date();
            now.setSeconds(now.getSeconds() + 5);

            const userId = import.meta.env.VITE_DEBUG_USER_ID;
            if (!userId) {
              return;
            }

            await notificationQueue.enqueue(userId, [
              {
                type: 'block_upcoming',
                targetTime: now.toISOString(),
                payload: {
                  block_name: 'Test block',
                  lead_minutes: 5,
                },
              },
            ]);

            const runner = new NotificationRunner({ userId, intervalMs: 2_000 });
            await runner.tick();

            const due = await notificationQueue.listDueNotifications(userId);
            for (const item of due) {
              await sendQueuedNotification(item);
            }
          }}
        >
          Send test notification
        </button>
      ) : null}
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
