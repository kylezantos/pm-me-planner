import { invoke } from '@tauri-apps/api/core';

export interface StoreCalendarConnectionParams {
  userId: string;
  provider?: string;
  accountEmail: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiry?: string | null;
  scopes: string[];
  isPrimary?: boolean;
  connectionId?: string;
}

export interface StoreConnectionSuccess {
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

export interface StoreConnectionError {
  error: string;
  error_description?: string;
}

export type CalendarConnectionRecord = StoreConnectionSuccess | StoreConnectionError;

function isErrorResponse(value: unknown): value is StoreConnectionError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'error' in value && typeof (value as { error: unknown }).error === 'string';
}

export async function storeCalendarConnection(
  params: StoreCalendarConnectionParams
): Promise<StoreConnectionSuccess> {
  const result = await invoke<unknown>(
    'store_calendar_connection',
    params as unknown as Record<string, unknown>
  );

  if (isErrorResponse(result)) {
    throw new Error(result.error_description ?? result.error);
  }

  return result as StoreConnectionSuccess;
}
