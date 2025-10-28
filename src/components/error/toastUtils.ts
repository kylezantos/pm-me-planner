import { toast } from 'sonner';

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

export const showPromise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) => {
  return toast.promise(promise, {
    loading,
    success,
    error,
  });
};
