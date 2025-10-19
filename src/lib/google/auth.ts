import { google } from 'googleapis';

export type OAuthScope =
  | 'https://www.googleapis.com/auth/calendar'
  | 'https://www.googleapis.com/auth/calendar.events'
  | 'https://www.googleapis.com/auth/calendar.readonly';

interface GenerateAuthUrlParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: OAuthScope[];
  loginHint?: string;
}

export function generateAuthUrl(params: GenerateAuthUrlParams): string {
  const { clientId, clientSecret, redirectUri, scopes, loginHint } = params;

  const oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
  });

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    include_granted_scopes: true,
    login_hint: loginHint,
  });
}

interface ExchangeCodeParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  scope?: string;
  tokenType?: string;
}

export async function exchangeCodeForTokens(
  params: ExchangeCodeParams
): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri, code } = params;

  const oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
  });

  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token ?? '',
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined,
    scope: tokens.scope ?? undefined,
    tokenType: tokens.token_type ?? undefined,
  };
}
