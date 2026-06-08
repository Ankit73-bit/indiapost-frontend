import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  PublicUser,
  ListUsersQuery,
  UpdateMeBody,
  UpdatePasswordBody,
  UpdateEmailBody,
  AdminUpdateUserBody,
  AssignClientBody,
  PaginationMeta,
} from '@/types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Self ──────────────────────────────────────────────────────────────────

    getMe: build.query<PublicUser, void>({
      query: () => '/api/v1/users/me',
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      providesTags: ['User' as never],
    }),

    updateMe: build.mutation<PublicUser, UpdateMeBody>({
      query: (body) => ({ url: '/api/v1/users/me', method: 'PATCH', body }),
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      invalidatesTags: ['User' as never],
    }),

    updateMyPassword: build.mutation<{ updated: boolean }, UpdatePasswordBody>({
      query: (body) => ({ url: '/api/v1/users/me/password', method: 'PATCH', body }),
      transformResponse: (res: ApiSuccess<{ updated: boolean }>) => res.data,
    }),

    updateMyEmail: build.mutation<PublicUser, UpdateEmailBody>({
      query: (body) => ({ url: '/api/v1/users/me/email', method: 'PATCH', body }),
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      invalidatesTags: ['User' as never],
    }),

    // ── Admin ─────────────────────────────────────────────────────────────────

    listUsers: build.query<{ data: PublicUser[]; meta?: PaginationMeta }, ListUsersQuery | void>({
      query: (params) => ({ url: '/api/v1/users', params: params ?? {} }),
      transformResponse: (res: ApiSuccess<PublicUser[]>) => ({ data: res.data, meta: res.meta }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    getUserById: build.query<PublicUser, string>({
      query: (userId) => `/api/v1/users/${userId}`,
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'User' as const, id }],
    }),

    adminUpdateUser: build.mutation<PublicUser, { userId: string; body: AdminUpdateUserBody }>({
      query: ({ userId, body }) => ({ url: `/api/v1/users/${userId}`, method: 'PATCH', body }),
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),

    deactivateUser: build.mutation<PublicUser, string>({
      query: (userId) => ({ url: `/api/v1/users/${userId}`, method: 'DELETE' }),
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),

    reactivateUser: build.mutation<PublicUser, string>({
      query: (userId) => ({ url: `/api/v1/users/${userId}/reactivate`, method: 'POST' }),
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),

    deleteUser: build.mutation<{ deleted: boolean; userId: string }, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/purge`,
        method: 'POST',
      }),
      transformResponse: (
        res: ApiSuccess<{ deleted: boolean; userId: string }>,
      ) => res.data,
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),

    assignClient: build.mutation<PublicUser, { userId: string; body: AssignClientBody }>({
      query: ({ userId, body }) => ({
        url: `/api/v1/users/${userId}/assign-client`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiSuccess<PublicUser>) => res.data,
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateMyPasswordMutation,
  useUpdateMyEmailMutation,
  useListUsersQuery,
  useGetUserByIdQuery,
  useAdminUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useDeleteUserMutation,
  useAssignClientMutation,
} = usersApi;
