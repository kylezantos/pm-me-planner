import type { SupabaseClient } from '@supabase/supabase-js';
import type { CalendarConnection } from '../types';
import { syncCalendarEvents } from './calendarSyncService';
import {
  isTokenExpiring,
  refreshConnectionTokens,
} from './tokenManager';

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

interface AutoSyncConfig {
  supabaseClient?: SupabaseClient;
  intervalMs?: number;
  credentials: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  tokenSecret: string;
}

interface ConnectionWithTokens extends CalendarConnection {
  accessToken: string;
  refreshToken?: string;
}

async function fetchConnections(
  client: SupabaseClient
): Promise<CalendarConnection[]> {
  const { data, error } = await client
    .from('calendar_connections')
    .select(
      'id, user_id, provider, account_email, token_expiry, scopes, is_primary, sync_token, last_synced_at, created_at, updated_at'
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CalendarConnection[];
}

async function fetchTokens(
  client: SupabaseClient,
  connectionId: string,
  secret: string
): Promise<{ access_token: string; refresh_token: string | null } | null> {
  const { data, error } = await client.rpc('get_calendar_connection_tokens', {
    p_connection_id: connectionId,
    p_secret: secret,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data as { access_token: string; refresh_token: string | null };
}

async function resolveConnectionsWithTokens(
  client: SupabaseClient,
  secret: string
): Promise<ConnectionWithTokens[]> {
  const connections = await fetchConnections(client);

  const resolved: ConnectionWithTokens[] = [];

  for (const connection of connections) {
    const tokens = await fetchTokens(client, connection.id, secret);

    if (!tokens?.access_token) {
      continue;
    }

    resolved.push({
      ...connection,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
    });
  }

  return resolved;
}

export class AutoSyncScheduler {
  private readonly client: SupabaseClient;
  private readonly intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(private readonly config: AutoSyncConfig) {
    if (!config.supabaseClient) {
      throw new Error('AutoSyncScheduler requires a Supabase client');
    }

    this.client = config.supabaseClient;
    this.intervalMs = config.intervalMs ?? DEFAULT_INTERVAL_MS;
  }

  async runOnce(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const connections = await resolveConnectionsWithTokens(
        this.client,
        this.config.tokenSecret
      );

      await Promise.all(
        connections.map(async (connection) => {
          let currentAccessToken = connection.accessToken;
          let currentRefreshToken = connection.refreshToken ?? null;
          let currentConnection: CalendarConnection = connection;

          if (
            currentRefreshToken &&
            isTokenExpiring(connection.token_expiry)
          ) {
            try {
              const refreshed = await refreshConnectionTokens(
                connection,
                currentRefreshToken
              );

              currentAccessToken = refreshed.accessToken;
              currentRefreshToken = refreshed.refreshToken;
              currentConnection = refreshed.connection;
            } catch (error) {
              console.error(
                'Failed to refresh calendar connection %s: %s',
                connection.id,
                error
              );
              return;
            }
          }

          await syncCalendarEvents(
            {
              connectionId: currentConnection.id,
              userId: currentConnection.user_id,
              credentials: this.config.credentials,
              accessToken: currentAccessToken,
              refreshToken: currentRefreshToken ?? undefined,
              expiryDate: currentConnection.token_expiry
                ? new Date(currentConnection.token_expiry).getTime()
                : undefined,
              syncToken: currentConnection.sync_token ?? undefined,
            },
            this.client
          ).catch((error) => {
            console.error(
              'Failed to sync calendar connection %s: %s',
              currentConnection.id,
              error
            );
          });
        })
      );
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);

    void this.runOnce();
  }

  stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
  }
}
