import crypto from 'crypto';
import type { OAuthScope } from '../types';

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
}

export function createPkcePair(): PkcePair {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

interface GenerateAuthUrlParams {
  clientId: string;
  redirectUri: string;
  scopes: OAuthScope[];
  state: string;
  codeChallenge: string;
  loginHint?: string;
}

export function generateAuthUrl(params: GenerateAuthUrlParams): string {
  const {
    clientId,
    redirectUri,
    scopes,
    state,
    codeChallenge,
    loginHint,
  } = params;

  const baseUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  baseUrl.searchParams.set('client_id', clientId);
  baseUrl.searchParams.set('redirect_uri', redirectUri);
  baseUrl.searchParams.set('response_type', 'code');
  baseUrl.searchParams.set('scope', scopes.join(' '));
  baseUrl.searchParams.set('access_type', 'offline');
  baseUrl.searchParams.set('include_granted_scopes', 'true');
  baseUrl.searchParams.set('prompt', 'consent');
  baseUrl.searchParams.set('state', state);
  baseUrl.searchParams.set('code_challenge', codeChallenge);
  baseUrl.searchParams.set('code_challenge_method', 'S256');

  if (loginHint) {
    baseUrl.searchParams.set('login_hint', loginHint);
  }

  return baseUrl.toString();
}
