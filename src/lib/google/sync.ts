import type { calendar_v3 } from 'googleapis';
import { createCalendarClient } from './calendarClient';

export interface SyncEventsParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  syncToken?: string;
}

export interface SyncedEvents {
  events: calendar_v3.Schema$Event[];
  nextSyncToken?: string;
}

export async function fetchCalendarEvents(
  params: SyncEventsParams
): Promise<SyncedEvents> {
  const {
    clientId,
    clientSecret,
    redirectUri,
    accessToken,
    refreshToken,
    expiryDate,
    calendarId = 'primary',
    timeMin,
    timeMax,
    syncToken,
  } = params;

  const calendar = createCalendarClient({
    clientId,
    clientSecret,
    redirectUri,
    accessToken,
    refreshToken,
    expiryDate,
  });

  const request: calendar_v3.Params$Resource$Events$List = {
    calendarId,
    singleEvents: true,
    orderBy: 'startTime',
    showDeleted: true,
    maxResults: 250,
  };

  if (syncToken) {
    request.syncToken = syncToken;
  } else {
    request.timeMin = timeMin ?? new Date().toISOString();
    if (timeMax) {
      request.timeMax = timeMax;
    }
  }

  const allEvents: calendar_v3.Schema$Event[] = [];
  let nextSyncToken: string | undefined;
  let pageToken: string | undefined;

  do {
    const response = await calendar.events.list({
      ...request,
      pageToken,
    });

    allEvents.push(...(response.data.items ?? []));
    nextSyncToken = response.data.nextSyncToken ?? nextSyncToken;
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return {
    events: allEvents,
    nextSyncToken,
  };
}

interface UpsertEventParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  calendarId?: string;
  event: calendar_v3.Schema$Event;
}

export async function upsertCalendarEvent(
  params: UpsertEventParams
): Promise<calendar_v3.Schema$Event | null> {
  const {
    clientId,
    clientSecret,
    redirectUri,
    accessToken,
    refreshToken,
    expiryDate,
    calendarId = 'primary',
    event,
  } = params;

  const calendar = createCalendarClient({
    clientId,
    clientSecret,
    redirectUri,
    accessToken,
    refreshToken,
    expiryDate,
  });

  const eventId = event.id;

  if (eventId) {
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data;
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: 'all',
  });

  return response.data ?? null;
}
