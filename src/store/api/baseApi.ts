import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { getApiBaseUrl } from '@/lib/apiBase';
import { clearCredentials, setUser } from '../authSlice';
import type { ApiSuccess, PublicUser } from '@/types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
});

const AUTH_SKIP_REAUTH = [
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/refresh',
];

function shouldSkipReauth(url: string): boolean {
  return AUTH_SKIP_REAUTH.some((path) => url.includes(path));
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const result = await rawBaseQuery(
        { url: '/api/v1/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      );
      if (result.error) return false;

      const user = (result.data as ApiSuccess<{ user: PublicUser }> | undefined)
        ?.data?.user;
      if (user) {
        api.dispatch(
          setUser({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: user.clientId,
          }),
        );
      }
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const url = typeof args === 'string' ? args : args.url;
  if (shouldSkipReauth(url)) {
    return result;
  }

  const refreshed = await tryRefreshSession(api, extraOptions);
  if (refreshed) {
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    api.dispatch(clearCredentials());
  }

  return result;
};

/**
 * baseApi — single RTK Query API instance.
 * Auth uses HttpOnly cookies; requests send credentials automatically.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Client', 'List', 'ListPdfs', 'Article', 'SyncJob', 'FailedArticle', 'User', 'NoticeTemplate'],
  endpoints: () => ({}),
});
