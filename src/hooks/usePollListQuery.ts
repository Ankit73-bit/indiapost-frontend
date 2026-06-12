import { useAppSelector } from '@/store';
import { listsApi, useGetListQuery } from '@/store/api/listsApi';
import type { List } from '@/types';

type GetListOptions = Parameters<typeof useGetListQuery>[1];

function listNeedsPolling(list?: Pick<List, 'status' | 'pdfProgress'>): boolean {
  return (
    list?.status === 'IMPORTING' ||
    list?.status === 'SYNCING' ||
    Boolean(list?.pdfProgress)
  );
}

/** Fetch a list; poll every 3s while import, sync, or PDF generation is in progress. */
export function usePollListQuery(
  listId: string | undefined,
  options?: GetListOptions,
) {
  const skip = !listId || options?.skip;
  const cached = useAppSelector((state) =>
    listId ? listsApi.endpoints.getList.select(listId)(state).data : undefined,
  );
  const shouldPoll = !skip && listNeedsPolling(cached);

  return useGetListQuery(listId!, {
    refetchOnMountOrArgChange: true,
    ...options,
    skip: Boolean(skip),
    pollingInterval: shouldPoll ? 3000 : 0,
  });
}
