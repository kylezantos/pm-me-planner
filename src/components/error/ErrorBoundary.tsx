import React, { Component, ReactNode } from 'react';
import { Button } from '@/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
              <AlertCircle className="h-8 w-8 text-error-600" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-heading-2 font-heading-2 text-default-font">
                Something went wrong
              </h2>
              <p className="text-body font-body text-subtext-color max-w-md">
                We encountered an unexpected error. Please try refreshing the page or
                contact support if the problem persists.
              </p>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-caption font-caption text-subtext-color hover:text-default-font">
                    Error details
                  </summary>
                  <pre className="mt-2 rounded-md bg-neutral-100 p-3 text-caption font-mono text-error-700 overflow-auto max-w-2xl">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
          <Button
            onClick={this.handleReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
