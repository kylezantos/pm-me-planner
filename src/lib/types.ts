import { Database } from './database.types';

// Export types from generated database types
export type BlockStatus = Database['public']['Enums']['block_status'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type TaskPriority = Database['public']['Enums']['task_priority'];

// Insert and Update types for mutations
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type BlockInstanceInsert = Database['public']['Tables']['block_instances']['Insert'];
export type BlockInstanceUpdate = Database['public']['Tables']['block_instances']['Update'];

export type BlockTypeInsert = Database['public']['Tables']['block_types']['Insert'];
export type BlockTypeUpdate = Database['public']['Tables']['block_types']['Update'];

export type OAuthScope =
  | 'https://www.googleapis.com/auth/calendar'
  | 'https://www.googleapis.com/auth/calendar.events'
  | 'https://www.googleapis.com/auth/calendar.readonly'
  | 'https://www.googleapis.com/auth/userinfo.email';

export interface BlockType {
  id: string;
  user_id: string;
  name: string;
  color: string;
  default_duration_minutes: number;
  pomodoro_focus_minutes: number;
  pomodoro_short_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_sessions_before_long_break: number;
  recurring_enabled: boolean;
  recurring_days_of_week: number[];
  recurring_time_of_day: string | null;
  recurring_auto_create: boolean;
  recurring_weeks_in_advance: number;
  created_at: string;
  updated_at: string;
}

export interface BlockInstance {
  id: string;
  user_id: string;
  block_type_id: string;
  planned_start: string;
  planned_end: string;
  status: BlockStatus;
  actual_start: string | null;
  actual_end: string | null;
  paused_until: string | null;
  pause_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  block_type_id: string;
  block_instance_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimated_duration_minutes: number | null;
  completed_at: string | null;
  actual_start: string | null;
  actual_end: string | null;
  is_currently_active: boolean;
  ai_prompt_enabled: boolean;
  focus_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  default_focus_minutes: number;
  default_short_break_minutes: number;
  default_long_break_minutes: number;
  default_sessions_before_long_break: number;
  standup_time: string | null;
  workday_start: string | null;
  workday_end: string | null;
  notifications_enabled: boolean;
  notification_lead_time_minutes: number | null;
  notification_sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarConnection {
  id: string;
  user_id: string;
  provider: string;
  account_email: string;
  token_expiry: string | null;
  scopes: OAuthScope[];
  is_primary: boolean;
  sync_token: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: string;
  self?: boolean;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  calendar_connection_id: string;
  external_event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  status: string | null;
  attendees: CalendarEventAttendee[] | null;
  is_all_day: boolean;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  task_id: string;
  block_instance_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeedUser {
  user_id: string;
}

export type NotificationType =
  | 'block_upcoming'
  | 'block_start'
  | 'block_paused'
  | 'block_resumed'
  | 'standup';

export interface NotificationQueueItem {
  id: string;
  user_id: string;
  type: NotificationType;
  target_time: string;
  payload: Record<string, unknown> | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StandupPayload {
  time?: string;
}

export type BlockNotificationPayload = {
  block_name?: string;
  lead_minutes?: number;
  block_type_id?: string;
  block_instance_id?: string;
  start_time?: string;
  block_color?: string;
} & Record<string, unknown>;

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  targetTime: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  sentAt?: string;
}

// Extended types with relationships for UI
export interface TaskWithBlockType extends Task {
  block_type?: BlockType;
}

export interface BlockInstanceWithDetails extends BlockInstance {
  block_type?: BlockType;
  tasks?: Task[];
}

// UI Form types
export interface TaskFormData {
  title: string;
  description?: string;
  block_type_id: string;
  priority?: TaskPriority;
  estimated_duration_minutes?: number;
}

export interface BlockInstanceFormData {
  block_type_id: string;
  planned_start: string; // ISO 8601
  planned_end: string;   // ISO 8601
  notes?: string;
}
