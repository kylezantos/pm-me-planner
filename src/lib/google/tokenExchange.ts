import { invoke } from '@tauri-apps/api/core';

export interface ExchangeCodeParams {
  code: string;
  codeVerifier: string;
}

export interface ExchangeCodeSuccess {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
  scope?: string | null;
  token_type?: string | null;
}

export interface ExchangeCodeError {
  error: string;
  error_description?: string | null;
}

export type TokenResponse = ExchangeCodeSuccess | ExchangeCodeError;

function isErrorResponse(value: unknown): value is ExchangeCodeError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'error' in value && typeof (value as { error: unknown }).error === 'string';
}

export async function exchangeCodeForTokens(
  params: ExchangeCodeParams
): Promise<{ tokens: ExchangeCodeSuccess; email: string | null }> {
  const response = await invoke<[ExchangeCodeSuccess, string | null]>(
    'exchange_google_code',
    params as unknown as Record<string, unknown>
  );

  const [tokens, email] = response;

  if (isErrorResponse(tokens)) {
    throw new Error(tokens.error_description ?? tokens.error);
  }

  return {
    tokens,
    email,
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<ExchangeCodeSuccess> {
  const result = await invoke<unknown>('refresh_google_token', {
    refreshToken,
  });

  if (isErrorResponse(result)) {
    throw new Error(
      result.error_description ?? result.error ?? 'Failed to refresh access token'
    );
  }

  return result as ExchangeCodeSuccess;
}
