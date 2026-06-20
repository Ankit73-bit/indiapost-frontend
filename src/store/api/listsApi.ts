import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  List,
  ListSummaryStats,
  CreateListBody,
  UpdateListBody,
  ListListsQuery,
  PaginationMeta,
  ListPdfsSummary,
} from '@/types';

export const listsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listLists: build.query<
      { data: List[]; meta?: PaginationMeta },
      ListListsQuery | undefined
    >({
      query: (params) => ({
        url: '/api/v1/lists',
        params: params ?? ({} satisfies ListListsQuery),
      }),
      transformResponse: (res: ApiSuccess<List[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((l) => ({ type: 'List' as const, id: l._id })),
              { type: 'List', id: 'LIST' },
            ]
          : [{ type: 'List', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled;
          for (const list of result.data) {
            dispatch(listsApi.util.upsertQueryData('getList', list._id, list));
          }
        } catch {
          // ignore — list index fetch failed
        }
      },
    }),

    getListStats: build.query<ListSummaryStats, { clientId?: string } | void>({
      query: (params) => ({
        url: '/api/v1/lists/stats',
        params: params?.clientId ? { clientId: params.clientId } : undefined,
      }),
      transformResponse: (res: ApiSuccess<ListSummaryStats>) => res.data,
      providesTags: (_r, _e, arg) => [
        { type: 'List', id: `STATS_${arg?.clientId ?? 'ALL'}` },
      ],
    }),

    getList: build.query<List, string>({
      query: (listId) => `/api/v1/lists/${listId}`,
      transformResponse: (res: ApiSuccess<List>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'List', id }],
    }),

    listNoticeTypes: build.query<string[], { clientId?: string } | void>({
      query: (params) => ({
        url: '/api/v1/lists/notice-types',
        params: params?.clientId ? { clientId: params.clientId } : undefined,
      }),
      transformResponse: (res: ApiSuccess<string[]>) => res.data,
      providesTags: (_r, _e, arg) => [
        { type: 'List', id: `NOTICE_TYPES_${arg?.clientId ?? 'ALL'}` },
      ],
    }),

    listYears: build.query<number[], { clientId?: string } | void>({
      query: (params) => ({
        url: '/api/v1/lists/years',
        params: params?.clientId ? { clientId: params.clientId } : undefined,
      }),
      transformResponse: (res: ApiSuccess<number[]>) => res.data,
      providesTags: (_r, _e, arg) => [
        { type: 'List', id: `YEARS_${arg?.clientId ?? 'ALL'}` },
      ],
    }),

    createList: build.mutation<List, CreateListBody>({
      query: (body) => ({ url: '/api/v1/lists', method: 'POST', body }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: (result) => [
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
        { type: 'List', id: 'NOTICE_TYPES_ALL' },
        { type: 'List', id: 'YEARS_ALL' },
        ...(result
          ? [
              { type: 'List' as const, id: `STATS_${result.clientId}` },
              { type: 'List' as const, id: `NOTICE_TYPES_${result.clientId}` },
              { type: 'List' as const, id: `YEARS_${result.clientId}` },
            ]
          : []),
      ],
    }),

    updateList: build.mutation<List, { listId: string; body: UpdateListBody }>({
      query: ({ listId, body }) => ({
        url: `/api/v1/lists/${listId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: (_r, _e, { listId }) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
        { type: 'List', id: 'NOTICE_TYPES_ALL' },
        { type: 'List', id: 'YEARS_ALL' },
        ...(_r
          ? [
              { type: 'List' as const, id: `STATS_${_r.clientId}` },
              { type: 'List' as const, id: `NOTICE_TYPES_${_r.clientId}` },
              { type: 'List' as const, id: `YEARS_${_r.clientId}` },
            ]
          : []),
      ],
    }),

    archiveList: build.mutation<List, string>({
      query: (listId) => ({ url: `/api/v1/lists/${listId}`, method: 'DELETE' }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: (_r, _e, listId) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
        ...(_r ? [{ type: 'List' as const, id: `STATS_${_r.clientId}` }] : []),
      ],
    }),

    unarchiveList: build.mutation<List, string>({
      query: (listId) => ({
        url: `/api/v1/lists/${listId}/unarchive`,
        method: 'POST',
      }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: (_r, _e, listId) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
        ...(_r ? [{ type: 'List' as const, id: `STATS_${_r.clientId}` }] : []),
      ],
    }),

    deleteList: build.mutation<{ deleted: boolean; listId: string }, string>({
      query: (listId) => ({
        url: `/api/v1/lists/${listId}/soft-delete`,
        method: 'POST',
      }),
      transformResponse: (
        res: ApiSuccess<{ deleted: boolean; listId: string }>,
      ) => res.data,
      invalidatesTags: (_r, _e, listId) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
        { type: 'Article', id: 'LIST' },
      ],
    }),

    cancelImport: build.mutation<{ cancelled: boolean; listId: string }, string>({
      query: (listId) => ({
        url: `/api/v1/lists/${listId}/cancel-import`,
        method: 'POST',
      }),
      transformResponse: (
        res: ApiSuccess<{ cancelled: boolean; listId: string }>,
      ) => res.data,
      invalidatesTags: (_r, _e, listId) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
      ],
    }),

    cancelSync: build.mutation<{ cancelled: boolean; listId: string }, string>({
      query: (listId) => ({
        url: `/api/v1/lists/${listId}/cancel-sync`,
        method: 'POST',
      }),
      transformResponse: (
        res: ApiSuccess<{ cancelled: boolean; listId: string }>,
      ) => res.data,
      invalidatesTags: (_r, _e, listId) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
      ],
    }),

    uploadListFile: build.mutation<unknown, { listId: string; file: File }>({
      query: ({ listId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: `/api/v1/lists/${listId}/upload`,
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: (_r, _e, { listId }) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'STATS_ALL' },
      ],
    }),

    generateListPdfs: build.mutation<
      { jobId: string; message: string; totalArticles: number },
      { listId: string; clientId: string }
    >({
      query: ({ listId, clientId }) => ({
        url: `/api/v1/lists/${listId}/generate-pdfs`,
        method: 'POST',
        body: { clientId },
      }),
      transformResponse: (
        res: ApiSuccess<{ jobId: string; message: string; totalArticles: number }>,
      ) => res.data,
      invalidatesTags: (_r, _e, { listId }) => [
        { type: 'List', id: listId },
        { type: 'ListPdfs', id: listId },
      ],
    }),

    listListPdfs: build.query<
      { data: ListPdfsSummary; meta?: PaginationMeta },
      {
        listId: string;
        clientId: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ listId, clientId, page, limit, search }) => ({
        url: `/api/v1/lists/${listId}/pdfs`,
        params: {
          clientId,
          page,
          limit,
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (res: ApiSuccess<ListPdfsSummary>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (_r, _e, { listId }) => [{ type: 'ListPdfs', id: listId }],
    }),
  }),
});

export const {
  useListListsQuery,
  useGetListStatsQuery,
  useListNoticeTypesQuery,
  useListYearsQuery,
  useGetListQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useArchiveListMutation,
  useUnarchiveListMutation,
  useDeleteListMutation,
  useUploadListFileMutation,
  useCancelImportMutation,
  useCancelSyncMutation,
  useGenerateListPdfsMutation,
  useListListPdfsQuery,
} = listsApi;
