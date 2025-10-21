export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      block_instances: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          block_type_id: string
          created_at: string
          id: string
          notes: string | null
          pause_reason: string | null
          paused_until: string | null
          planned_end: string
          planned_start: string
          status: Database["public"]["Enums"]["block_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          block_type_id: string
          created_at?: string
          id?: string
          notes?: string | null
          pause_reason?: string | null
          paused_until?: string | null
          planned_end: string
          planned_start: string
          status?: Database["public"]["Enums"]["block_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          block_type_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          pause_reason?: string | null
          paused_until?: string | null
          planned_end?: string
          planned_start?: string
          status?: Database["public"]["Enums"]["block_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_instances_block_type_id_fkey"
            columns: ["block_type_id"]
            isOneToOne: false
            referencedRelation: "block_types"
            referencedColumns: ["id"]
          },
        ]
      }
      block_types: {
        Row: {
          color: string
          created_at: string
          default_duration_minutes: number
          id: string
          name: string
          pomodoro_focus_minutes: number
          pomodoro_long_break_minutes: number
          pomodoro_sessions_before_long_break: number
          pomodoro_short_break_minutes: number
          recurring_auto_create: boolean
          recurring_days_of_week: number[]
          recurring_enabled: boolean
          recurring_time_of_day: string | null
          recurring_weeks_in_advance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          default_duration_minutes: number
          id?: string
          name: string
          pomodoro_focus_minutes?: number
          pomodoro_long_break_minutes?: number
          pomodoro_sessions_before_long_break?: number
          pomodoro_short_break_minutes?: number
          recurring_auto_create?: boolean
          recurring_days_of_week?: number[]
          recurring_enabled?: boolean
          recurring_time_of_day?: string | null
          recurring_weeks_in_advance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          default_duration_minutes?: number
          id?: string
          name?: string
          pomodoro_focus_minutes?: number
          pomodoro_long_break_minutes?: number
          pomodoro_sessions_before_long_break?: number
          pomodoro_short_break_minutes?: number
          recurring_auto_create?: boolean
          recurring_days_of_week?: number[]
          recurring_enabled?: boolean
          recurring_time_of_day?: string | null
          recurring_weeks_in_advance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_connections: {
        Row: {
          access_token_encrypted: string
          account_email: string
          created_at: string
          id: string
          is_primary: boolean
          last_synced_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          scopes: string[]
          sync_token: string | null
          token_expiry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          account_email: string
          created_at?: string
          id?: string
          is_primary?: boolean
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          scopes: string[]
          sync_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          account_email?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          scopes?: string[]
          sync_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: Json | null
          calendar_connection_id: string
          created_at: string
          description: string | null
          end_time: string
          external_event_id: string
          id: string
          is_all_day: boolean
          last_sync_token: string | null
          last_synced_at: string
          location: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: Json | null
          calendar_connection_id: string
          created_at?: string
          description?: string | null
          end_time: string
          external_event_id: string
          id?: string
          is_all_day?: boolean
          last_sync_token?: string | null
          last_synced_at?: string
          location?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: Json | null
          calendar_connection_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          external_event_id?: string
          id?: string
          is_all_day?: boolean
          last_sync_token?: string | null
          last_synced_at?: string
          location?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_calendar_connection_id_fkey"
            columns: ["calendar_connection_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          sent_at: string | null
          target_time: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          sent_at?: string | null
          target_time: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          sent_at?: string | null
          target_time?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          ai_prompt_enabled: boolean
          block_instance_id: string | null
          block_type_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          focus_mode: boolean
          id: string
          is_currently_active: boolean
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          ai_prompt_enabled?: boolean
          block_instance_id?: string | null
          block_type_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          focus_mode?: boolean
          id?: string
          is_currently_active?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          ai_prompt_enabled?: boolean
          block_instance_id?: string | null
          block_type_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          focus_mode?: boolean
          id?: string
          is_currently_active?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_block_instance_id_fkey"
            columns: ["block_instance_id"]
            isOneToOne: false
            referencedRelation: "block_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_block_type_id_fkey"
            columns: ["block_type_id"]
            isOneToOne: false
            referencedRelation: "block_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          default_focus_minutes: number
          default_long_break_minutes: number
          default_sessions_before_long_break: number
          default_short_break_minutes: number
          notification_lead_time_minutes: number | null
          notification_sound_enabled: boolean
          notifications_enabled: boolean
          standup_time: string | null
          updated_at: string
          user_id: string
          workday_end: string | null
          workday_start: string | null
        }
        Insert: {
          created_at?: string
          default_focus_minutes?: number
          default_long_break_minutes?: number
          default_sessions_before_long_break?: number
          default_short_break_minutes?: number
          notification_lead_time_minutes?: number | null
          notification_sound_enabled?: boolean
          notifications_enabled?: boolean
          standup_time?: string | null
          updated_at?: string
          user_id: string
          workday_end?: string | null
          workday_start?: string | null
        }
        Update: {
          created_at?: string
          default_focus_minutes?: number
          default_long_break_minutes?: number
          default_sessions_before_long_break?: number
          default_short_break_minutes?: number
          notification_lead_time_minutes?: number | null
          notification_sound_enabled?: boolean
          notifications_enabled?: boolean
          standup_time?: string | null
          updated_at?: string
          user_id?: string
          workday_end?: string | null
          workday_start?: string | null
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          block_instance_id: string | null
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          block_instance_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          block_instance_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_block_instance_id_fkey"
            columns: ["block_instance_id"]
            isOneToOne: false
            referencedRelation: "block_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      decrypt_calendar_token: {
        Args: { secret: string; token_encrypted: string }
        Returns: string
      }
      encrypt_calendar_token: {
        Args: { secret: string; token: string }
        Returns: string
      }
      get_calendar_connection_tokens: {
        Args: { p_connection_id: string; p_secret: string }
        Returns: {
          access_token: string
          refresh_token: string
        }[]
      }
      upsert_calendar_connection: {
        Args: {
          p_access_token: string
          p_account_email: string
          p_connection_id?: string
          p_is_primary: boolean
          p_provider: string
          p_refresh_token: string
          p_scopes: string[]
          p_secret: string
          p_token_expiry: string
          p_user_id: string
        }
        Returns: {
          access_token_encrypted: string
          account_email: string
          created_at: string
          id: string
          is_primary: boolean
          last_synced_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          scopes: string[]
          sync_token: string | null
          token_expiry: string | null
          updated_at: string
          user_id: string
        }
      }
    }
    Enums: {
      block_status:
        | "scheduled"
        | "in_progress"
        | "paused"
        | "completed"
        | "skipped"
      task_priority: "low" | "medium" | "high"
      task_status: "pending" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      block_status: [
        "scheduled",
        "in_progress",
        "paused",
        "completed",
        "skipped",
      ],
      task_priority: ["low", "medium", "high"],
      task_status: ["pending", "in_progress", "completed"],
    },
  },
} as const
