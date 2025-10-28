const PKCE_VERIFIER_KEY = 'pmmeplanner:google:pkce_verifier';
const OAUTH_STATE_KEY = 'pmmeplanner:google:oauth_state';
export const OAUTH_RESPONSE_STORAGE_KEY = 'pmmeplanner:google:oauth_response';

export interface StoredOAuthResponse {
  code: string | null;
  state: string | null;
  error?: string | null;
  error_description?: string | null;
  timestamp: number;
}

export function persistPkceVerifier(value: string): void {
  localStorage.setItem(PKCE_VERIFIER_KEY, value);
}

export function readPkceVerifier(): string | null {
  return localStorage.getItem(PKCE_VERIFIER_KEY);
}

export function clearPkceVerifier(): void {
  localStorage.removeItem(PKCE_VERIFIER_KEY);
}

export function persistOAuthState(state: string): void {
  localStorage.setItem(OAUTH_STATE_KEY, state);
}

export function readOAuthState(): string | null {
  return localStorage.getItem(OAUTH_STATE_KEY);
}

export function clearOAuthState(): void {
  localStorage.removeItem(OAUTH_STATE_KEY);
}

export function persistOAuthResponse(payload: StoredOAuthResponse): void {
  localStorage.setItem(OAUTH_RESPONSE_STORAGE_KEY, JSON.stringify(payload));
}

export function readOAuthResponse(): StoredOAuthResponse | null {
  const raw = localStorage.getItem(OAUTH_RESPONSE_STORAGE_KEY);

  if (!raw) {
    return null;
}

  try {
    return JSON.parse(raw) as StoredOAuthResponse;
  } catch (error) {
    console.warn('Failed to parse stored OAuth response', error);
    return null;
  }
}

export function consumeOAuthResponse(): StoredOAuthResponse | null {
  const value = readOAuthResponse();

  if (value) {
    localStorage.removeItem(OAUTH_RESPONSE_STORAGE_KEY);
  }

  return value;
}
