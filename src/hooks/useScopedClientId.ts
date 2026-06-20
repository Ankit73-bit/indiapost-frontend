import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';

/** Admin: optional ?clientId= from URL. Customer: assigned clientId. */
export function useScopedClientId(): string | undefined {
  const authUser = useAppSelector((s) => s.auth.user);
  const [searchParams] = useSearchParams();
  const isAdmin = authUser?.role === 'admin';

  if (!isAdmin) {
    return authUser?.clientId ?? undefined;
  }

  return searchParams.get('clientId') ?? undefined;
}
