import { toast as sonnerToast } from 'sonner';
import { getApiErrorMessage } from '@/lib/helpers';

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  apiError: (err: unknown, fallback: string) =>
    sonnerToast.error(getApiErrorMessage(err, fallback)),
};
