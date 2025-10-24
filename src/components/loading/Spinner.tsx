import React from 'react';
import { Loader } from '@/ui/components/Loader';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Spinner({ size = 'medium', className }: SpinnerProps) {
  return (
    <Loader size={size} className={className} aria-label="Loading..." />
  );
}
