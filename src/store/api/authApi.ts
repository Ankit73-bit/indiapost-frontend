import { baseApi } from './baseApi';
import type { ApiSuccess, AuthUser, LoginRequest, LoginResponse } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<ApiSuccess<LoginResponse>, LoginRequest>({
      query: (body) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body,
      }),
    }),
    logout: build.mutation<ApiSuccess<{ loggedOut: boolean }>, void>({
      query: () => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
      }),
    }),
    refreshSession: build.mutation<ApiSuccess<{ user: AuthUser }>, void>({
      query: () => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
} = authApi;
