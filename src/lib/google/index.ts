// Calendar Sync Provider and Hook
export { CalendarSyncProvider, useCalendarSync, useCalendarSyncStore } from './CalendarSyncProvider';

// Authentication helpers
export { createPkcePair, generateAuthUrl } from './auth';

// Token Management (safe - uses Tauri invoke only)
export { isTokenExpiring, refreshConnectionTokens } from './tokenManager';

// Store Connection
export { storeCalendarConnection } from './storeConnection';

// Meeting Detection
export { detectMeetings } from './meetingDetection';

// NOTE: The following exports have been removed to prevent googleapis from being bundled in the browser:
// - AutoSyncScheduler (imports syncCalendarEvents → googleapis)
// - syncCalendarEvents (imports googleapis)
// - createCalendarClient (imports googleapis)
//
// Calendar sync will be implemented via Tauri backend commands instead.
