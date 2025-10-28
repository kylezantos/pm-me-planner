import type { CalendarConnection, OAuthScope } from '../types';
import { refreshAccessToken } from './tokenExchange';
import { storeCalendarConnection } from './storeConnection';

const REFRESH_BUFFER_MS = 60_000;

export function isTokenExpiring(tokenExpiry: string | null): boolean {
  if (!tokenExpiry) {
    return true;
  }

  const expiryTime = new Date(tokenExpiry).getTime();
  return expiryTime - REFRESH_BUFFER_MS <= Date.now();
}

interface RefreshResult {
  accessToken: string;
  refreshToken: string | null;
  connection: CalendarConnection;
}

function mapRecordToConnection(
  previous: CalendarConnection,
  record: {
    id: string;
    user_id: string;
    provider: string;
    account_email: string;
    token_expiry: string | null;
    scopes: string[];
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    sync_token: string | null;
    last_synced_at: string | null;
  }
): CalendarConnection {
  return {
    ...previous,
    id: record.id,
    user_id: record.user_id,
    provider: record.provider,
    account_email: record.account_email,
    token_expiry: record.token_expiry,
    scopes: record.scopes as OAuthScope[],
    is_primary: record.is_primary,
    created_at: record.created_at,
    updated_at: record.updated_at,
    sync_token: record.sync_token,
    last_synced_at: record.last_synced_at,
  };
}

export async function refreshConnectionTokens(
  connection: CalendarConnection,
  refreshToken: string
): Promise<RefreshResult> {
  const tokens = await refreshAccessToken(refreshToken);

  const newAccessToken = tokens.access_token;
  const nextRefreshToken = tokens.refresh_token ?? refreshToken;
  const expiresInSeconds = tokens.expires_in ?? null;
  const nextExpiry = expiresInSeconds
    ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
    : connection.token_expiry;

  const record = await storeCalendarConnection({
    userId: connection.user_id,
    provider: connection.provider,
    accountEmail: connection.account_email,
    accessToken: newAccessToken,
    refreshToken: nextRefreshToken,
    tokenExpiry: nextExpiry,
    scopes: connection.scopes,
    isPrimary: connection.is_primary,
    connectionId: connection.id,
  });

  const updatedConnection = mapRecordToConnection(connection, record);

  return {
    accessToken: newAccessToken,
    refreshToken: nextRefreshToken,
    connection: updatedConnection,
  };
}
