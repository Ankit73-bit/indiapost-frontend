import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  List,
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
    }),

    getList: build.query<List, string>({
      query: (listId) => `/api/v1/lists/${listId}`,
      transformResponse: (res: ApiSuccess<List>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'List', id }],
    }),

    listNoticeTypes: build.query<string[], void>({
      query: () => '/api/v1/lists/notice-types',
      transformResponse: (res: ApiSuccess<string[]>) => res.data,
      providesTags: [{ type: 'List', id: 'NOTICE_TYPES' }],
    }),

    createList: build.mutation<List, CreateListBody>({
      query: (body) => ({ url: '/api/v1/lists', method: 'POST', body }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: [
        { type: 'List', id: 'LIST' },
        { type: 'List', id: 'NOTICE_TYPES' },
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
        { type: 'List', id: 'NOTICE_TYPES' },
      ],
    }),

    archiveList: build.mutation<List, string>({
      query: (listId) => ({ url: `/api/v1/lists/${listId}`, method: 'DELETE' }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: (_r, _e, listId) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
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

    listListPdfs: build.query<ListPdfsSummary, { listId: string; clientId: string }>({
      query: ({ listId, clientId }) => ({
        url: `/api/v1/lists/${listId}/pdfs`,
        params: { clientId },
      }),
      transformResponse: (res: ApiSuccess<ListPdfsSummary>) => res.data,
      providesTags: (_r, _e, { listId }) => [{ type: 'ListPdfs', id: listId }],
    }),
  }),
});

export const {
  useListListsQuery,
  useListNoticeTypesQuery,
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
