import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { restoreSession } from '@/store/authSlice';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const dispatch = useAppDispatch();
  const sessionChecked = useAppSelector((s) => s.auth.sessionChecked);

  useEffect(() => {
    try {
      localStorage.removeItem('ip_token');
    } catch {
      // ignore
    }
    void dispatch(restoreSession());
  }, [dispatch]);

  if (!sessionChecked) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
