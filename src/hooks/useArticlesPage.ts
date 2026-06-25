import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  saveArticlesContext,
  loadArticlesContext,
} from '@/lib/articlesNavigation';
import { useAppSelector } from '@/store';

export function useArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlClientId = searchParams.get('clientId') ?? '';
  const listId = searchParams.get('listId') ?? undefined;
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const customerClientId = !isAdmin ? (authUser?.clientId ?? '') : '';
  const clientId = urlClientId || customerClientId;

  useEffect(() => {
    const saved = loadArticlesContext();
    if (!saved?.clientId) return;

    if (!isAdmin || urlClientId) return;

    const next = new URLSearchParams(searchParams);
    next.set('clientId', saved.clientId);
    setSearchParams(next, { replace: true });
    // Restore client only — list picker card view is shown until user picks a list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!clientId) return;
    saveArticlesContext(clientId, listId);
  }, [clientId, listId]);

  return { clientId, listId, isAdmin };
}
