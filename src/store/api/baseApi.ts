import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { getApiBaseUrl } from '@/lib/apiBase';

/**
 * baseApi — single RTK Query API instance.
 * All feature APIs are injected via .injectEndpoints().
 *
 * prepareHeaders is the ONE place to update when proper auth evolves
 * (refresh tokens, session expiry, role-based header flags, etc.)
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Client', 'List', 'ListPdfs', 'Article', 'SyncJob', 'FailedArticle', 'User', 'NoticeTemplate'],
  endpoints: () => ({}),
});
