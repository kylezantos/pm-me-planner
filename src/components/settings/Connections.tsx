import React, { useEffect, useState } from "react";
import { Button } from "@/ui/components/Button";
import { FeatherCheckCircle, FeatherAlertCircle, FeatherCalendar } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Tooltip } from "@/ui/components/Tooltip";
import { listCalendarConnections } from "@/lib/repositories";
import type { CalendarConnection } from "@/lib/types";
import { createPkcePair, generateAuthUrl } from "@/lib/google/auth";
import { persistPkceVerifier, persistOAuthState } from "@/lib/google/session";
import { generateOAuthState } from "@/lib/google/utils";
import { showError, showSuccess } from "@/components/error/toastUtils";

const GOOGLE_SCOPES: Array<"https://www.googleapis.com/auth/calendar.readonly" | "https://www.googleapis.com/auth/userinfo.email"> = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

interface ConnectionsProps {
  userId: string;
}

export function Connections({ userId }: ConnectionsProps) {
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const { data, error } = await listCalendarConnections();
      if (error) {
        console.error("Failed to load calendar connections:", error);
        showError("Failed to load connections", error.message);
      } else {
        setConnections(data || []);
      }
    } catch (err) {
      console.error("Error loading connections:", err);
      showError("Error loading connections", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setConnecting(true);
    try {
      // Get environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        throw new Error("Google OAuth configuration is missing. Please check your environment variables.");
      }

      // Generate PKCE pair
      const { codeVerifier, codeChallenge } = createPkcePair();
      persistPkceVerifier(codeVerifier);

      // Generate OAuth state for CSRF protection
      const state = generateOAuthState();
      persistOAuthState(state);

      // Build authorization URL
      const authUrl = generateAuthUrl({
        clientId,
        redirectUri,
        scopes: GOOGLE_SCOPES,
        state,
        codeChallenge,
      });

      // Open auth URL in browser
      window.open(authUrl, '_blank');

      showSuccess(
        "Authorization window opened",
        "Please complete the Google Calendar authorization in the new window."
      );
    } catch (err) {
      console.error("Failed to start OAuth flow:", err);
      showError(
        "Failed to connect",
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    } finally {
      setConnecting(false);
    }
  };

  const googleConnection = connections.find((conn) => conn.provider === "google");

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex w-full flex-col items-start gap-2">
        <h2 className="text-heading-2 font-heading-2 text-default-font">
          Calendar Connections
        </h2>
        <p className="text-body font-body text-subtext-color">
          Connect your Google Calendar to sync events and detect meeting conflicts.
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-solid border-neutral-border bg-default-background p-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
              <FeatherCalendar className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Google Calendar
              </span>
              {loading ? (
                <span className="text-caption font-caption text-subtext-color">
                  Loading...
                </span>
              ) : googleConnection ? (
                <div className="flex items-center gap-2">
                  <FeatherCheckCircle className="h-4 w-4 text-success-600" />
                  <span className="text-caption font-caption text-success-700">
                    Connected as {googleConnection.account_email}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FeatherAlertCircle className="h-4 w-4 text-neutral-400" />
                  <span className="text-caption font-caption text-subtext-color">
                    Not connected
                  </span>
                </div>
              )}
            </div>
          </div>

          {!googleConnection && (
            <Button
              variant="brand-primary"
              size="medium"
              onClick={handleConnectGoogle}
              disabled={connecting || loading}
            >
              {connecting ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          )}

          {googleConnection && (
            <div className="flex items-center gap-2">
              <Button
                variant="neutral-secondary"
                size="small"
                onClick={loadConnections}
                disabled={loading}
              >
                Refresh
              </Button>
              <SubframeCore.Tooltip.Provider>
                <SubframeCore.Tooltip.Root>
                  <SubframeCore.Tooltip.Trigger asChild={true}>
                    <Button
                      variant="destructive-secondary"
                      size="small"
                      disabled={true}
                    >
                      Disconnect
                    </Button>
                  </SubframeCore.Tooltip.Trigger>
                  <SubframeCore.Tooltip.Portal>
                    <SubframeCore.Tooltip.Content
                      side="bottom"
                      align="center"
                      sideOffset={8}
                      asChild={true}
                    >
                      <Tooltip>Coming soon</Tooltip>
                    </SubframeCore.Tooltip.Content>
                  </SubframeCore.Tooltip.Portal>
                </SubframeCore.Tooltip.Root>
              </SubframeCore.Tooltip.Provider>
            </div>
          )}
        </div>

        {googleConnection && (
          <div className="flex w-full flex-col items-start gap-2 border-t border-solid border-neutral-border pt-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-caption-bold font-caption-bold text-subtext-color">
                CONNECTION DETAILS
              </span>
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="flex flex-col items-start gap-1">
                <span className="text-caption font-caption text-subtext-color">
                  Provider
                </span>
                <span className="text-body font-body text-default-font">
                  {googleConnection.provider}
                </span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-caption font-caption text-subtext-color">
                  Connected On
                </span>
                <span className="text-body font-body text-default-font">
                  {new Date(googleConnection.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-caption font-caption text-subtext-color">
                  Last Synced
                </span>
                <span className="text-body font-body text-default-font">
                  {googleConnection.last_synced_at
                    ? new Date(googleConnection.last_synced_at).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-caption font-caption text-subtext-color">
                  Permissions
                </span>
                <span className="text-body font-body text-default-font">
                  Read-only calendar access
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-start gap-2 rounded-lg border border-solid border-neutral-border bg-neutral-50 p-4">
        <div className="flex items-start gap-2">
          <FeatherAlertCircle className="h-5 w-5 flex-none text-subtext-color" />
          <div className="flex flex-col items-start gap-1">
            <span className="text-caption-bold font-caption-bold text-default-font">
              Read-only Access
            </span>
            <span className="text-caption font-caption text-subtext-color">
              PM Me Planner only reads your calendar events to detect conflicts.
              We never modify or create events in your Google Calendar.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
