import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  List,
  CreateListBody,
  UpdateListBody,
  ListListsQuery,
  PaginationMeta,
} from '@/types';

export const listsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listLists: build.query<
      { data: List[]; meta?: PaginationMeta },
      ListListsQuery | void
    >({
      query: (params) => ({ url: '/api/v1/lists', params: params ?? {} }),
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

    createList: build.mutation<List, CreateListBody>({
      query: (body) => ({ url: '/api/v1/lists', method: 'POST', body }),
      transformResponse: (res: ApiSuccess<List>) => res.data,
      invalidatesTags: [{ type: 'List', id: 'LIST' }],
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
        url: `/api/v1/lists/${listId}/purge`,
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
  }),
});

export const {
  useListListsQuery,
  useGetListQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useArchiveListMutation,
  useUnarchiveListMutation,
  useDeleteListMutation,
  useUploadListFileMutation,
  useCancelImportMutation,
  useCancelSyncMutation,
} = listsApi;
