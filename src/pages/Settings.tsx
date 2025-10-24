import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherArrowLeft } from "@subframe/core";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Connections } from "@/components/settings/Connections";

interface SettingsProps {
  userId: string;
}

export function Settings({ userId }: SettingsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-start bg-neutral-50">
      {/* Header */}
      <div className="flex w-full items-center justify-between gap-2 border-b border-solid border-neutral-border bg-default-background px-6 py-4">
        <div className="flex items-center gap-3">
          <IconButton
            size="small"
            icon={<FeatherArrowLeft />}
            onClick={() => navigate("/")}
          />
          <span className="text-heading-1 font-heading-1 text-default-font">
            Settings
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full grow shrink-0 basis-0 items-start justify-center overflow-y-auto px-6 py-6">
        <div className="flex w-full max-w-2xl flex-col items-start gap-8">
          {/* Google Calendar Connections Section */}
          <Connections userId={userId} />

          {/* Notification Settings Section */}
          <NotificationSettings userId={userId} />

          {/* Future sections can be added here */}
          {/* <GeneralSettings userId={userId} /> */}
          {/* <AppearanceSettings userId={userId} /> */}
        </div>
      </div>
    </div>
  );
}

export default Settings;
