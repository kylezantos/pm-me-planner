import React, { useState, useEffect } from "react";
import { Switch } from "@/ui/switch";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Bell } from "lucide-react";
import { getUserPreferences, upsertUserPreferences } from "@/lib/repositories";
import { sendTestNotification } from "@/lib/notifications/testing";
import { showSuccess, showError } from "@/components/error/toastUtils";
import type { UserPreferences } from "@/lib/types";

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Form state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState("15");
  const [standupTime, setStandupTime] = useState("09:00");
  const [workdayStart, setWorkdayStart] = useState("08:00");
  const [workdayEnd, setWorkdayEnd] = useState("18:00");

  // Load user preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserPreferences(userId);

      if (error) {
        showError("Failed to load preferences", error.message);
        return;
      }

      if (data) {
        setNotificationsEnabled(data.notifications_enabled);
        setNotificationSoundEnabled(data.notification_sound_enabled);
        setLeadTimeMinutes(data.notification_lead_time_minutes?.toString() || "15");
        setStandupTime(data.standup_time || "09:00");
        setWorkdayStart(data.workday_start || "08:00");
        setWorkdayEnd(data.workday_end || "18:00");
      }
    } catch (error) {
      showError("Error loading preferences", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate lead time
    const leadTime = parseInt(leadTimeMinutes, 10);
    if (isNaN(leadTime) || leadTime < 1 || leadTime > 60) {
      showError("Invalid lead time", "Lead time must be between 1 and 60 minutes");
      return;
    }

    // Validate time formats (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(standupTime)) {
      showError("Invalid standup time", "Please use format HH:MM (e.g., 09:00)");
      return;
    }
    if (!timeRegex.test(workdayStart)) {
      showError("Invalid workday start", "Please use format HH:MM (e.g., 08:00)");
      return;
    }
    if (!timeRegex.test(workdayEnd)) {
      showError("Invalid workday end", "Please use format HH:MM (e.g., 18:00)");
      return;
    }

    setSaving(true);
    try {
      const preferences: UserPreferences = {
        user_id: userId,
        notifications_enabled: notificationsEnabled,
        notification_sound_enabled: notificationSoundEnabled,
        notification_lead_time_minutes: leadTime,
        standup_time: standupTime,
        workday_start: workdayStart,
        workday_end: workdayEnd,
        // Default pomodoro settings (not exposed in this MVP)
        default_focus_minutes: 25,
        default_short_break_minutes: 5,
        default_long_break_minutes: 15,
        default_sessions_before_long_break: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await upsertUserPreferences(preferences);

      if (error) {
        showError("Failed to save preferences", error.message);
        return;
      }

      showSuccess("Settings saved", "Your notification preferences have been updated");
    } catch (error) {
      showError("Error saving preferences", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTest(true);
    try {
      const result = await sendTestNotification({
        title: "Test Notification",
        body: notificationSoundEnabled
          ? "This is a test notification with sound enabled"
          : "This is a test notification (sound disabled)",
        sound: notificationSoundEnabled,
      });

      if (result.error) {
        showError("Failed to send notification", result.error);
      } else if (!result.permissionGranted) {
        showError("Permission denied", "Please enable notifications in your system settings");
      } else {
        showSuccess("Test notification sent", notificationSoundEnabled
          ? "Check if you heard the notification sound"
          : "Sound is disabled in settings");
      }
    } catch (error) {
      showError("Error sending notification", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col items-start gap-6">
        <div className="flex w-full items-center gap-2">
          <Bell className="h-6 w-6 text-brand-600" />
          <span className="text-heading-2 font-heading-2 text-default-font">
            Notifications
          </span>
        </div>
        <div className="flex w-full items-center justify-center py-8">
          <span className="text-body font-body text-subtext-color">
            Loading preferences...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-6">
      {/* Section Header */}
      <div className="flex w-full items-center gap-2">
        <Bell className="h-6 w-6 text-brand-600" />
        <span className="text-heading-2 font-heading-2 text-default-font">
          Notifications
        </span>
      </div>

      {/* Enable Notifications Toggle */}
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-body-bold font-body-bold text-default-font">
            Enable Notifications
          </span>
          <span className="text-caption font-caption text-subtext-color">
            Receive notifications for upcoming blocks and events
          </span>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
      </div>

      {/* Notification Sound Toggle */}
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-body-bold font-body-bold text-default-font">
            Notification Sounds
          </span>
          <span className="text-caption font-caption text-subtext-color">
            Play sound when notifications appear
          </span>
        </div>
        <Switch
          checked={notificationSoundEnabled}
          onCheckedChange={setNotificationSoundEnabled}
        />
      </div>

      {/* Lead Time */}
      <div className="flex w-full flex-col items-start gap-2">
        <Label htmlFor="lead-time">Lead Time (minutes)</Label>
        <Input
          id="lead-time"
          type="number"
          min={1}
          max={60}
          value={leadTimeMinutes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            // Allow empty string for typing, will validate on save
            if (val === "" || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0)) {
              setLeadTimeMinutes(val);
            }
          }}
          placeholder="15"
        />
        <p className="text-caption font-caption text-subtext-color">
          How many minutes before a block starts to show notification (1-60)
        </p>
      </div>

      {/* Standup Time */}
      <div className="flex w-full flex-col items-start gap-2">
        <Label htmlFor="standup-time">Daily Standup Time</Label>
        <Input
          id="standup-time"
          type="time"
          value={standupTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStandupTime(e.target.value)
          }
        />
        <p className="text-caption font-caption text-subtext-color">
          Time for daily standup reminder (HH:MM format)
        </p>
      </div>

      {/* Workday Start */}
      <div className="flex w-full flex-col items-start gap-2">
        <Label htmlFor="workday-start">Workday Start</Label>
        <Input
          id="workday-start"
          type="time"
          value={workdayStart}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setWorkdayStart(e.target.value)
          }
        />
        <p className="text-caption font-caption text-subtext-color">
          When your workday typically begins (HH:MM format)
        </p>
      </div>

      {/* Workday End */}
      <div className="flex w-full flex-col items-start gap-2">
        <Label htmlFor="workday-end">Workday End</Label>
        <Input
          id="workday-end"
          type="time"
          value={workdayEnd}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setWorkdayEnd(e.target.value)
          }
        />
        <p className="text-caption font-caption text-subtext-color">
          When your workday typically ends (HH:MM format)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button
          variant="secondary"
          onClick={handleSendTestNotification}
          disabled={sendingTest || !notificationsEnabled}
        >
          <Bell className="mr-2 h-4 w-4" />
          {sendingTest ? "Sending..." : "Send Test Notification"}
        </Button>
      </div>

      {/* Test notification info */}
      {!notificationsEnabled && (
        <div className="flex w-full items-start gap-2 rounded-md bg-neutral-100 px-3 py-2">
          <span className="text-caption font-caption text-subtext-color">
            Enable notifications to send test notifications
          </span>
        </div>
      )}
    </div>
  );
}
