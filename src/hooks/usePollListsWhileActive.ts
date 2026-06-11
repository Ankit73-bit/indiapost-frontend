import { useAppSelector } from '@/store';
import { listsApi, useListListsQuery } from '@/store/api/listsApi';

type ListListsArgs = Parameters<typeof useListListsQuery>[0];
type ListListsOptions = Parameters<typeof useListListsQuery>[1];

type PollListsOptions = Omit<ListListsOptions, 'pollingInterval'> & {
  /** Keep polling even before IMPORTING/SYNCING appears in cache (e.g. right after upload). */
  forcePoll?: boolean;
};

/** Poll list queries every 3s while any list is importing/syncing or forcePoll is set. */
export function usePollListsWhileActive(
  args?: ListListsArgs,
  options?: PollListsOptions,
) {
  const { forcePoll, ...queryOptions } = options ?? {};
  const cached = useAppSelector((state) =>
    listsApi.endpoints.listLists.select(args)(state).data,
  );

  const isActive = Boolean(
    cached?.data.some(
      (l) => l.status === 'IMPORTING' || l.status === 'SYNCING',
    ),
  );
  const pollingInterval = forcePoll || isActive ? 3000 : 0;

  return useListListsQuery(args, { ...queryOptions, pollingInterval });
}

/** Poll lists with a specific status (for import/sync banners). */
export function usePollListsByStatus(
  args: ListListsArgs & { status: string },
  forcePoll = false,
) {
  const cached = useAppSelector((state) =>
    listsApi.endpoints.listLists.select(args)(state).data,
  );

  const isActive = (cached?.data.length ?? 0) > 0;
  const pollingInterval = forcePoll || isActive ? 3000 : 0;

  return useListListsQuery(args, { pollingInterval });
}
