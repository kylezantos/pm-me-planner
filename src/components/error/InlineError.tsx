import React from 'react';
import { FeatherAlertCircle } from '@subframe/core';

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-md bg-error-50 px-3 py-2 border border-error-200 ${className}`}
      role="alert"
    >
      <FeatherAlertCircle className="h-4 w-4 text-error-600 flex-shrink-0 mt-0.5" />
      <span className="text-caption font-caption text-error-700">
        {message}
      </span>
    </div>
  );
}
