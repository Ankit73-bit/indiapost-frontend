import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  Client,
  CreateClientBody,
  UpdateClientBody,
  ListClientsQuery,
  PaginationMeta,
} from '@/types';

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listClients: build.query<
      { data: Client[]; meta?: PaginationMeta },
      ListClientsQuery | undefined
    >({
      query: (params) => ({
        url: '/api/v1/clients',
        params: params ?? ({} satisfies ListClientsQuery),
      }),
      transformResponse: (res: ApiSuccess<Client[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({
                type: 'Client' as const,
                id: c._id,
              })),
              { type: 'Client', id: 'LIST' },
            ]
          : [{ type: 'Client', id: 'LIST' }],
    }),

    getClient: build.query<Client, string>({
      query: (clientId) => `/api/v1/clients/${clientId}`,
      transformResponse: (res: ApiSuccess<Client>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Client', id }],
    }),

    createClient: build.mutation<Client, CreateClientBody>({
      query: (body) => ({ url: '/api/v1/clients', method: 'POST', body }),
      transformResponse: (res: ApiSuccess<Client>) => res.data,
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),

    updateClient: build.mutation<
      Client,
      { clientId: string; body: UpdateClientBody }
    >({
      query: ({ clientId, body }) => ({
        url: `/api/v1/clients/${clientId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiSuccess<Client>) => res.data,
      invalidatesTags: (_r, _e, { clientId }) => [
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' },
      ],
    }),

    deactivateClient: build.mutation<Client, string>({
      query: (clientId) => ({
        url: `/api/v1/clients/${clientId}`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<Client>) => res.data,
      invalidatesTags: (_r, _e, clientId) => [
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' },
      ],
    }),

    reactivateClient: build.mutation<Client, string>({
      query: (clientId) => ({
        url: `/api/v1/clients/${clientId}/reactivate`,
        method: 'POST',
      }),
      transformResponse: (res: ApiSuccess<Client>) => res.data,
      invalidatesTags: (_r, _e, clientId) => [
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' },
      ],
    }),

    deleteClient: build.mutation<{ deleted: boolean; clientId: string }, string>({
      query: (clientId) => ({
        url: `/api/v1/clients/${clientId}/soft-delete`,
        method: 'POST',
      }),
      transformResponse: (
        res: ApiSuccess<{ deleted: boolean; clientId: string }>,
      ) => res.data,
      invalidatesTags: (_r, _e, clientId) => [
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' },
        { type: 'List', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeactivateClientMutation,
  useReactivateClientMutation,
  useDeleteClientMutation,
} = clientsApi;
