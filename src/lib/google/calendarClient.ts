import { google, calendar_v3 } from 'googleapis';

export interface CalendarCredentials {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  expiryDate?: number;
}

export function createCalendarClient({
  accessToken,
  refreshToken,
  clientId,
  clientSecret,
  redirectUri,
  expiryDate,
}: CalendarCredentials): calendar_v3.Calendar {
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
