import type { List } from '@/types';
import { useScopedClientId } from '@/hooks/useScopedClientId';
import { usePollListsWhileActive } from '@/hooks/usePollListsWhileActive';

type OperationsListsOptions = {
  clientId?: string;
  forcePoll?: boolean;
  skip?: boolean;
};

/**
 * Shared subscription for importing/syncing lists (no year filter).
 * Used by OperationsBanner and Lists page — RTK dedupes identical args.
 */
export function useOperationsLists(options?: OperationsListsOptions) {
  const scopedClientId = useScopedClientId();
  const clientId = options?.clientId ?? scopedClientId;

  const query = usePollListsWhileActive(
    { clientId, limit: 100 },
    { forcePoll: options?.forcePoll, skip: options?.skip },
  );

  const importing =
    query.data?.data.filter((l) => l.status === 'IMPORTING') ?? [];
  const syncing =
    query.data?.data.filter((l) => l.status === 'SYNCING') ?? [];

  return {
    ...query,
    importing,
    syncing,
    activeLists: [...importing, ...syncing] as List[],
  };
}
