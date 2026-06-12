import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  SyncJob,
  FailedArticle,
  TrackingExpiredArticle,
  TriggerSyncBody,
  TriggerSyncResponse,
  ListSyncJobsQuery,
  PaginationMeta,
} from '@/types';

export const syncApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    triggerSync: build.mutation<TriggerSyncResponse, TriggerSyncBody>({
      query: (body) => ({ url: '/api/v1/sync/trigger', method: 'POST', body }),
      transformResponse: (res: ApiSuccess<TriggerSyncResponse>) => res.data,
      invalidatesTags: [
        { type: 'SyncJob', id: 'LIST' },
        { type: 'List', id: 'LIST' },
        { type: 'FailedArticle', id: 'LIST' },
      ],
    }),

    listSyncJobs: build.query<
      { data: SyncJob[]; meta?: PaginationMeta },
      ListSyncJobsQuery | void
    >({
      query: (params) => ({ url: '/api/v1/sync/jobs', params: params ?? {} }),
      transformResponse: (res: ApiSuccess<SyncJob[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: [{ type: 'SyncJob', id: 'LIST' }],
    }),

    getSyncJob: build.query<SyncJob, string>({
      query: (jobId) => `/api/v1/sync/jobs/${jobId}`,
      transformResponse: (res: ApiSuccess<SyncJob>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'SyncJob', id }],
    }),

    getListSyncHistory: build.query<
      { data: SyncJob[]; meta?: PaginationMeta },
      { listId: string; page?: number; limit?: number }
    >({
      query: ({ listId, page = 1, limit = 20 }) => ({
        url: `/api/v1/sync/lists/${listId}/history`,
        params: { page, limit },
      }),
      transformResponse: (res: ApiSuccess<SyncJob[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (_r, _e, { listId }) => [
        { type: 'SyncJob', id: `HISTORY_${listId}` },
      ],
    }),

    listFailedArticles: build.query<
      { data: FailedArticle[]; meta?: PaginationMeta },
      {
        clientId?: string;
        listId?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({ url: '/api/v1/sync/failed', params: params ?? {} }),
      transformResponse: (res: ApiSuccess<FailedArticle[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: [{ type: 'FailedArticle', id: 'LIST' }],
    }),

    retryFailedArticle: build.mutation<unknown, string>({
      query: (articleId) => ({
        url: `/api/v1/sync/failed/${articleId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'FailedArticle', id: 'LIST' },
        { type: 'SyncJob', id: 'LIST' },
      ],
    }),

    listTrackingExpiredArticles: build.query<
      { data: TrackingExpiredArticle[]; meta?: PaginationMeta },
      {
        clientId?: string;
        listId?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: '/api/v1/sync/tracking-expired',
        params: params ?? {},
      }),
      transformResponse: (res: ApiSuccess<TrackingExpiredArticle[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: [{ type: 'FailedArticle', id: 'TRACKING_EXPIRED' }],
    }),
  }),
});

export const {
  useTriggerSyncMutation,
  useListSyncJobsQuery,
  useGetSyncJobQuery,
  useGetListSyncHistoryQuery,
  useListFailedArticlesQuery,
  useRetryFailedArticleMutation,
  useListTrackingExpiredArticlesQuery,
} = syncApi;
