import type { SupabaseClient } from '@supabase/supabase-js';
import type { calendar_v3 } from 'googleapis';
import { fetchCalendarEvents } from './sync';
import type { CalendarEvent } from '../types';

interface SyncCalendarEventsOptions {
  connectionId: string;
  userId: string;
  credentials: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  syncToken?: string | null;
}

interface SyncResult {
  events: CalendarEvent[];
  deletedExternalEventIds: string[];
  nextSyncToken?: string;
}

function mapEventToRecord(
  event: calendar_v3.Schema$Event,
  options: { connectionId: string; userId: string; externalId: string }
): Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> {
  const { connectionId, userId, externalId } = options;

  const attendees = (event.attendees ?? []).map((attendee) => ({
    email: attendee.email ?? '',
    displayName: attendee.displayName ?? undefined,
    responseStatus: attendee.responseStatus ?? undefined,
    self: attendee.self ?? undefined,
  }));

  const startTime = event.start?.dateTime ?? event.start?.date ?? undefined;
  const endTime = event.end?.dateTime ?? event.end?.date ?? undefined;

  if (!startTime || !endTime) {
    throw new Error('Event missing start or end time');
  }

  return {
    user_id: userId,
    calendar_connection_id: connectionId,
    external_event_id: externalId,
    title: event.summary ?? 'Untitled Event',
    description: event.description ?? null,
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    location: event.location ?? null,
    status: event.status ?? null,
    attendees: attendees.length > 0 ? attendees : null,
    is_all_day: Boolean(event.start?.date) && !event.start?.dateTime,
    last_synced_at: new Date().toISOString(),
  };
}

export async function syncCalendarEvents(
  options: SyncCalendarEventsOptions,
  client: SupabaseClient
): Promise<SyncResult> {
  const {
    connectionId,
    userId,
    credentials,
    accessToken,
    refreshToken,
    expiryDate,
    calendarId,
    timeMin,
    timeMax,
    syncToken,
  } = options;

  const { events, nextSyncToken } = await fetchCalendarEvents({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    redirectUri: credentials.redirectUri,
    accessToken,
    refreshToken,
    expiryDate,
    calendarId,
    timeMin,
    timeMax,
    syncToken: syncToken ?? undefined,
  });

  const lastSyncedAt = new Date().toISOString();
  const deletedExternalEventIds: string[] = [];

  const activeEvents = events.flatMap((event) => {
    const externalId = event.id ?? event.iCalUID;

    if (!externalId) {
      console.warn('Skipping event without a stable identifier', event);
      return [];
    }

    if (event.status === 'cancelled') {
      deletedExternalEventIds.push(externalId);
      return [];
    }

    if (!event.start && !event.end) {
      return [];
    }

    try {
      return [
        mapEventToRecord(event, {
          connectionId,
          userId,
          externalId,
        }),
      ];
    } catch (error) {
      console.warn('Skipping event due to missing data', error);
      return [];
    }
  });

  let upsertedEvents: CalendarEvent[] = [];

  if (activeEvents.length > 0) {
    const { data, error } = await client
      .from('calendar_events')
      .upsert(activeEvents, {
        onConflict: 'calendar_connection_id,external_event_id',
      })
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    upsertedEvents = (data ?? []) as CalendarEvent[];
  }

  if (deletedExternalEventIds.length > 0) {
    const { error } = await client
      .from('calendar_events')
      .delete()
      .eq('calendar_connection_id', connectionId)
      .in('external_event_id', deletedExternalEventIds);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (nextSyncToken || activeEvents.length > 0 || deletedExternalEventIds.length > 0) {
    const { error } = await client
      .from('calendar_connections')
      .update({
        sync_token: nextSyncToken ?? syncToken ?? null,
        last_synced_at: lastSyncedAt,
      })
      .eq('id', connectionId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    events: upsertedEvents,
    deletedExternalEventIds,
    nextSyncToken,
  };
}
