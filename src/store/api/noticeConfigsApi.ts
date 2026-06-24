import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  CreateNoticeConfigBody,
  ListNoticeConfigsQuery,
  NoticeConfig,
  NoticeConfigRecord,
  NoticeTemplate,
  PaginationMeta,
} from '@/types';

export const noticeConfigsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listNoticeConfigs: build.query<
      { data: NoticeConfigRecord[]; meta?: PaginationMeta },
      ListNoticeConfigsQuery
    >({
      query: (params) => ({
        url: '/api/v1/notice-configs',
        params,
      }),
      transformResponse: (res: ApiSuccess<NoticeConfigRecord[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({
                type: 'NoticeConfig' as const,
                id: c._id,
              })),
              { type: 'NoticeConfig', id: 'LIST' },
            ]
          : [{ type: 'NoticeConfig', id: 'LIST' }],
    }),

    getNoticeConfig: build.query<NoticeConfigRecord, string>({
      query: (configId) => `/api/v1/notice-configs/${configId}`,
      transformResponse: (res: ApiSuccess<NoticeConfigRecord>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'NoticeConfig', id }],
    }),

    createNoticeConfig: build.mutation<NoticeConfigRecord, CreateNoticeConfigBody>({
      query: (body) => ({
        url: '/api/v1/notice-configs',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiSuccess<NoticeConfigRecord>) => res.data,
      invalidatesTags: [
        { type: 'NoticeConfig', id: 'LIST' },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),

    updateNoticeConfig: build.mutation<
      NoticeConfigRecord,
      {
        configId: string;
        config: NoticeConfig;
        configFileName?: string;
        description?: string;
      }
    >({
      query: ({ configId, ...body }) => ({
        url: `/api/v1/notice-configs/${configId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiSuccess<NoticeConfigRecord>) => res.data,
      invalidatesTags: (_r, _e, { configId }) => [
        { type: 'NoticeConfig', id: configId },
        { type: 'NoticeConfig', id: 'LIST' },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),

    deleteNoticeConfig: build.mutation<{ deleted: boolean }, string>({
      query: (configId) => ({
        url: `/api/v1/notice-configs/${configId}`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<{ deleted: boolean }>) => res.data,
      invalidatesTags: [
        { type: 'NoticeConfig', id: 'LIST' },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),

    linkNoticeConfigTemplate: build.mutation<
      NoticeConfigRecord,
      { configId: string; templateId: string }
    >({
      query: ({ configId, templateId }) => ({
        url: `/api/v1/notice-configs/${configId}/link-template`,
        method: 'POST',
        body: { templateId },
      }),
      transformResponse: (res: ApiSuccess<NoticeConfigRecord>) => res.data,
      invalidatesTags: (_r, _e, { configId }) => [
        { type: 'NoticeConfig', id: configId },
        { type: 'NoticeConfig', id: 'LIST' },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),

    unlinkNoticeConfigTemplate: build.mutation<NoticeConfigRecord, string>({
      query: (configId) => ({
        url: `/api/v1/notice-configs/${configId}/link-template`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<NoticeConfigRecord>) => res.data,
      invalidatesTags: (_r, _e, configId) => [
        { type: 'NoticeConfig', id: configId },
        { type: 'NoticeConfig', id: 'LIST' },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),

    linkTemplateConfig: build.mutation<
      NoticeTemplate,
      { templateId: string; configId: string }
    >({
      query: ({ templateId, configId }) => ({
        url: `/api/v1/notice-templates/${templateId}/link-config`,
        method: 'POST',
        body: { configId },
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId, configId }) => [
        { type: 'NoticeTemplate', id: templateId },
        { type: 'NoticeTemplate', id: 'LIST' },
        { type: 'NoticeConfig', id: configId },
        { type: 'NoticeConfig', id: 'LIST' },
      ],
    }),

    unlinkTemplateConfig: build.mutation<NoticeTemplate, string>({
      query: (templateId) => ({
        url: `/api/v1/notice-templates/${templateId}/link-config`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, templateId) => [
        { type: 'NoticeTemplate', id: templateId },
        { type: 'NoticeTemplate', id: 'LIST' },
        { type: 'NoticeConfig', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListNoticeConfigsQuery,
  useGetNoticeConfigQuery,
  useCreateNoticeConfigMutation,
  useUpdateNoticeConfigMutation,
  useDeleteNoticeConfigMutation,
  useLinkNoticeConfigTemplateMutation,
  useUnlinkNoticeConfigTemplateMutation,
  useLinkTemplateConfigMutation,
  useUnlinkTemplateConfigMutation,
} = noticeConfigsApi;
