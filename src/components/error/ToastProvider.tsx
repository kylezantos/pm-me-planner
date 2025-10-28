import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-default-background border border-neutral-border shadow-lg',
          title: 'text-body-bold font-body-bold text-default-font',
          description: 'text-caption font-caption text-subtext-color',
          success: 'border-success-600 bg-success-50',
          error: 'border-error-600 bg-error-50',
          warning: 'border-warning-600 bg-warning-50',
          info: 'border-brand-600 bg-brand-50',
        },
      }}
      duration={4000}
      richColors
    />
  );
}
