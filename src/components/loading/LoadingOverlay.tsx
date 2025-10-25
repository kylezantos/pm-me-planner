import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  /** If true, shows a semi-transparent backdrop */
  showBackdrop?: boolean;
}

export function LoadingOverlay({
  message = 'Loading...',
  showBackdrop = true
}: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      {showBackdrop && (
        <div className="absolute inset-0 bg-default-background/80 backdrop-blur-sm" />
      )}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        {message && (
          <span className="text-body font-body text-default-font">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
