import { google, calendar_v3 } from 'googleapis';

interface CalendarClientParams {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  expiryDate?: number;
}

export function createCalendarClient(
  params: CalendarClientParams
): calendar_v3.Calendar {
  const { accessToken, refreshToken, clientId, clientSecret, redirectUri, expiryDate } =
    params;

  const oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
  });

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}
