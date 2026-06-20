import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';

export function useNoticeClientContext() {
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: clientsData } = useListClientsQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  const activeClients = useMemo(
    () => (clientsData?.data ?? []).filter((c) => c.isActive),
    [clientsData],
  );

  const clientIdFromUrl = searchParams.get('clientId') ?? '';
  const clientId = isAdmin
    ? clientIdFromUrl || activeClients[0]?._id || ''
    : authUser?.clientId ?? '';

  useEffect(() => {
    if (!isAdmin || !clientId || clientIdFromUrl) return;
    const next = new URLSearchParams(searchParams);
    next.set('clientId', clientId);
    setSearchParams(next, { replace: true });
  }, [isAdmin, clientId, clientIdFromUrl, searchParams, setSearchParams]);

  function setClientId(id: string) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('clientId', id);
    else next.delete('clientId');
    setSearchParams(next);
  }

  const selectedClient = activeClients.find((c) => c._id === clientId);

  return {
    clientId,
    setClientId,
    isAdmin,
    activeClients,
    selectedClient,
  };
}
