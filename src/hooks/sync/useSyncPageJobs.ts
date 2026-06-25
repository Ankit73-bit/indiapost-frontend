import { useEffect, useMemo, useState } from 'react';
import { listsApi } from '@/store/api/listsApi';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  syncApi,
  useListSyncJobsQuery,
} from '@/store/api/syncApi';
import { listDisplayName } from '@/lib/listNaming';
import { isActiveSyncJob } from '@/lib/syncJobUtils';
import type { SyncJobStatus, SyncJobType } from '@/types';

type UseSyncPageJobsParams = {
  jobsPage: number;
  filterClientId: string;
  filterListId: string;
  filterStatus: string;
  filterJobType: string;
  filterFromDate: string;
  filterToDate: string;
  syncPollForced: boolean;
};

export function useSyncPageJobs({
  jobsPage,
  filterClientId,
  filterListId,
  filterStatus,
  filterJobType,
  filterFromDate,
  filterToDate,
  syncPollForced,
}: UseSyncPageJobsParams) {
  const dispatch = useAppDispatch();
  const [resolvedListNames, setResolvedListNames] = useState<
    Record<string, string>
  >({});

  const jobsQueryArgs = useMemo(
    () => ({
      page: jobsPage,
      limit: 20,
      listOnly: true as const,
      clientId: filterClientId || undefined,
      listId: filterListId || undefined,
      status: (filterStatus as SyncJobStatus) || undefined,
      type: (filterJobType as SyncJobType) || undefined,
      fromDate: filterFromDate || undefined,
      toDate: filterToDate || undefined,
    }),
    [
      jobsPage,
      filterClientId,
      filterListId,
      filterStatus,
      filterJobType,
      filterFromDate,
      filterToDate,
    ],
  );

  const cachedJobs = useAppSelector(
    (state) => syncApi.endpoints.listSyncJobs.select(jobsQueryArgs)(state).data,
  );
  const activeJobs = cachedJobs?.data.filter((j) => isActiveSyncJob(j)) ?? [];
  const shouldPollJobs = syncPollForced || activeJobs.length > 0;

  const { data: jobsData, isLoading: jobsLoading } = useListSyncJobsQuery(
    jobsQueryArgs,
    { pollingInterval: shouldPollJobs ? 3000 : 0 },
  );

  const listNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, name] of Object.entries(resolvedListNames))
      map.set(id, name);
    return map;
  }, [resolvedListNames]);

  useEffect(() => {
    if (!jobsData?.data.length) return;

    const known = new Set(listNameById.keys());
    const missing = jobsData.data
      .map((j) => j.listId)
      .filter((id): id is string => Boolean(id && !known.has(id)));

    for (const listId of [...new Set(missing)]) {
      dispatch(listsApi.endpoints.getList.initiate(listId))
        .unwrap()
        .then((list) => {
          setResolvedListNames((prev) => ({
            ...prev,
            [list._id]: listDisplayName(list),
          }));
        })
        .catch(() => {});
    }
  }, [jobsData?.data, dispatch, listNameById]);

  return {
    activeJobs,
    jobsData,
    jobsLoading,
    listNameById,
    shouldPollJobs,
  };
}
