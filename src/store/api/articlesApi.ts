import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  Article,
  ArticleStats,
  TrackingEvent,
  ListArticlesQuery,
  PaginationMeta,
} from '@/types';

export const articlesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listArticles: build.query<
      { data: Article[]; meta?: PaginationMeta },
      ListArticlesQuery
    >({
      query: (params) => ({ url: '/api/v1/articles', params }),
      transformResponse: (res: ApiSuccess<Article[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((a) => ({
                type: 'Article' as const,
                id: a._id,
              })),
              { type: 'Article', id: 'LIST' },
            ]
          : [{ type: 'Article', id: 'LIST' }],
    }),

    getArticle: build.query<Article, { articleId: string; clientId: string }>({
      query: ({ articleId, clientId }) => ({
        url: `/api/v1/articles/${articleId}`,
        params: { clientId },
      }),
      transformResponse: (res: ApiSuccess<Article>) => res.data,
      providesTags: (_r, _e, { articleId }) => [
        { type: 'Article', id: articleId },
      ],
    }),

    getArticleEvents: build.query<
      { data: TrackingEvent[]; meta?: PaginationMeta },
      { articleId: string; clientId: string; page?: number; limit?: number }
    >({
      query: ({ articleId, clientId, page = 1, limit = 50 }) => ({
        url: `/api/v1/articles/${articleId}/events`,
        params: { clientId, page, limit },
      }),
      transformResponse: (res: ApiSuccess<TrackingEvent[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
    }),

    getArticleStats: build.query<ArticleStats, string | undefined>({
      query: (clientId) => ({
        url: '/api/v1/articles/stats',
        params: clientId ? { clientId } : {},
      }),
      transformResponse: (res: ApiSuccess<ArticleStats>) => res.data,
      providesTags: (_r, _e, clientId) => [
        { type: 'Article', id: `STATS_${clientId ?? 'GLOBAL'}` },
      ],
    }),
  }),
});

export const {
  useListArticlesQuery,
  useGetArticleQuery,
  useGetArticleEventsQuery,
  useGetArticleStatsQuery,
} = articlesApi;
