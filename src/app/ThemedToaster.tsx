import { Toaster } from 'sonner';
import { useTheme } from '@/components/theme/ThemeProvider';

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={resolvedTheme}
    />
  );
}
