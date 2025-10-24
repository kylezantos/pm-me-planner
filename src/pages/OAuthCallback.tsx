import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FeatherCheckCircle, FeatherAlertCircle, FeatherLoader } from "@subframe/core";
import {
  readPkceVerifier,
  readOAuthState,
  clearPkceVerifier,
  clearOAuthState
} from "@/lib/google/session";
import { exchangeCodeForTokens } from "@/lib/google/tokenExchange";
import { storeCalendarConnection } from "@/lib/google/storeConnection";
import { showError, showSuccess } from "@/components/error/toastUtils";

// Hardcoded test user ID for development (same as App.tsx)
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

type OAuthStatus = "processing" | "success" | "error";

interface OAuthResult {
  status: OAuthStatus;
  message: string;
  details?: string;
}

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<OAuthResult>({
    status: "processing",
    message: "Processing authorization...",
  });

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Parse URL parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Check for OAuth errors
      if (error) {
        const errorMsg = errorDescription || error;
        console.error("OAuth error:", error, errorDescription);

        setResult({
          status: "error",
          message: "Authorization failed",
          details: errorMsg,
        });

        showError("Authorization failed", errorMsg);

        // Clear stored state
        clearPkceVerifier();
        clearOAuthState();

        // Redirect after delay
        setTimeout(() => navigate("/settings"), 3000);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        const msg = "Missing required OAuth parameters";
        console.error(msg, { code: !!code, state: !!state });

        setResult({
          status: "error",
          message: "Invalid callback",
          details: msg,
        });

        showError("Invalid callback", msg);

        setTimeout(() => navigate("/settings"), 3000);
        return;
      }

      // Validate CSRF state
      const storedState = readOAuthState();
      if (!storedState || storedState !== state) {
        const msg = "State mismatch - possible CSRF attack";
        console.error(msg, { storedState, receivedState: state });

        setResult({
          status: "error",
          message: "Security validation failed",
          details: msg,
        });

        showError("Security validation failed", "Please try connecting again");

        clearPkceVerifier();
        clearOAuthState();

        setTimeout(() => navigate("/settings"), 3000);
        return;
      }

      // Read PKCE verifier
      const codeVerifier = readPkceVerifier();
      if (!codeVerifier) {
        const msg = "PKCE verifier not found";
        console.error(msg);

        setResult({
          status: "error",
          message: "Session expired",
          details: msg,
        });

        showError("Session expired", "Please try connecting again");

        clearOAuthState();

        setTimeout(() => navigate("/settings"), 3000);
        return;
      }

      // Exchange authorization code for tokens
      setResult({
        status: "processing",
        message: "Exchanging authorization code...",
      });

      const { tokens, email } = await exchangeCodeForTokens({
        code,
        codeVerifier,
      });

      if (!tokens.access_token) {
        throw new Error("No access token received from Google");
      }

      // Store calendar connection
      setResult({
        status: "processing",
        message: "Saving connection...",
      });

      const connection = await storeCalendarConnection({
        userId: TEST_USER_ID,
        provider: "google",
        accountEmail: email || "unknown",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        scopes: tokens.scope?.split(" ") || [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
        isPrimary: true,
      });

      console.log("Calendar connection stored:", connection);

      // Clear stored state and verifier
      clearPkceVerifier();
      clearOAuthState();

      // Show success
      setResult({
        status: "success",
        message: "Successfully connected Google Calendar",
        details: email ? `Connected as ${email}` : undefined,
      });

      showSuccess(
        "Successfully connected",
        email ? `Connected as ${email}` : "Google Calendar connected"
      );

      // Redirect to settings after delay
      setTimeout(() => navigate("/settings"), 2000);

    } catch (err) {
      console.error("OAuth callback error:", err);

      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";

      // Check for specific error types
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("invalid_grant") || errorMessage.includes("401")) {
        userFriendlyMessage = "Authorization was declined or has expired. Please try again.";
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        userFriendlyMessage = "Network error. Please check your connection and try again.";
      }

      setResult({
        status: "error",
        message: "Failed to connect",
        details: userFriendlyMessage,
      });

      showError("Failed to connect", userFriendlyMessage);

      // Clear stored state
      clearPkceVerifier();
      clearOAuthState();

      // Redirect after delay
      setTimeout(() => navigate("/settings"), 3000);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-50">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border border-solid border-neutral-border bg-default-background p-8 shadow-sm">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          {result.status === "processing" && (
            <FeatherLoader className="h-8 w-8 animate-spin text-brand-600" />
          )}
          {result.status === "success" && (
            <FeatherCheckCircle className="h-8 w-8 text-success-600" />
          )}
          {result.status === "error" && (
            <FeatherAlertCircle className="h-8 w-8 text-error-600" />
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-heading-2 font-heading-2 text-default-font">
            {result.message}
          </h1>
          {result.details && (
            <p className="text-body font-body text-subtext-color">
              {result.details}
            </p>
          )}
        </div>

        {/* Status indicator */}
        {result.status === "processing" && (
          <p className="text-caption font-caption text-subtext-color">
            Please wait...
          </p>
        )}
        {result.status === "success" && (
          <p className="text-caption font-caption text-success-700">
            Redirecting to settings...
          </p>
        )}
        {result.status === "error" && (
          <p className="text-caption font-caption text-error-700">
            Redirecting to settings...
          </p>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;
