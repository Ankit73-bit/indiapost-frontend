import { useEffect, useState } from 'react';
import { useListListsQuery } from '@/store/api/listsApi';

type ListListsArgs = Parameters<typeof useListListsQuery>[0];
type ListListsOptions = Parameters<typeof useListListsQuery>[1];

/** Poll list queries every 3s while any list is importing or syncing. */
export function usePollListsWhileActive(
  args?: ListListsArgs,
  options?: Omit<ListListsOptions, 'pollingInterval'>,
) {
  const [pollingInterval, setPollingInterval] = useState(0);
  const result = useListListsQuery(args, { ...options, pollingInterval });

  const isActive = Boolean(
    result.data?.data.some(
      (l) => l.status === 'IMPORTING' || l.status === 'SYNCING',
    ),
  );

  useEffect(() => {
    setPollingInterval(isActive ? 3000 : 0);
  }, [isActive]);

  return result;
}
