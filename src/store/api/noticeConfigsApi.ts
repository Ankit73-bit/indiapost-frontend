import { baseApi } from './baseApi';
import type { AppDispatch } from '@/store';
import { noticeTemplatesApi } from './noticeTemplatesApi';
import type {
  ApiSuccess,
  CreateNoticeConfigBody,
  ListNoticeConfigsQuery,
  NoticeConfig,
  NoticeConfigRecord,
  NoticeTemplate,
  PaginationMeta,
} from '@/types';

function patchNoticeConfigInCache(dispatch: AppDispatch, config: NoticeConfigRecord) {
  dispatch(
    noticeConfigsApi.util.updateQueryData('getNoticeConfig', config._id, () => config),
  );
}

function invalidateConfigAndRelatedTemplates(
  dispatch: AppDispatch,
  configId: string,
  linkedTemplateId?: string,
) {
  const tags: Array<{ type: 'NoticeConfig' | 'NoticeTemplate'; id: string }> = [
    { type: 'NoticeConfig', id: configId },
    { type: 'NoticeConfig', id: 'LIST' },
    { type: 'NoticeTemplate', id: 'LIST' },
  ];
  if (linkedTemplateId) tags.push({ type: 'NoticeTemplate', id: linkedTemplateId });
  dispatch(baseApi.util.invalidateTags(tags));
}

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchNoticeConfigInCache(dispatch, data);
          invalidateConfigAndRelatedTemplates(
            dispatch,
            data._id,
            data.linkedTemplateId,
          );
        } catch {
          // mutation failed
        }
      },
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchNoticeConfigInCache(dispatch, data);
          invalidateConfigAndRelatedTemplates(
            dispatch,
            data._id,
            data.linkedTemplateId,
          );
        } catch {
          // mutation failed
        }
      },
    }),

    deleteNoticeConfig: build.mutation<{ deleted: boolean }, string>({
      query: (configId) => ({
        url: `/api/v1/notice-configs/${configId}`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<{ deleted: boolean }>) => res.data,
      invalidatesTags: (_r, _e, configId) => [
        { type: 'NoticeConfig', id: configId },
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
      async onQueryStarted({ templateId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchNoticeConfigInCache(dispatch, data);
          invalidateConfigAndRelatedTemplates(dispatch, data._id, templateId);
        } catch {
          // mutation failed
        }
      },
    }),

    unlinkNoticeConfigTemplate: build.mutation<NoticeConfigRecord, string>({
      query: (configId) => ({
        url: `/api/v1/notice-configs/${configId}/link-template`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<NoticeConfigRecord>) => res.data,
      async onQueryStarted(configId, { dispatch, queryFulfilled, getState }) {
        const previous = noticeConfigsApi.endpoints.getNoticeConfig.select(configId)(
          getState(),
        )?.data;
        try {
          const { data } = await queryFulfilled;
          patchNoticeConfigInCache(dispatch, data);
          invalidateConfigAndRelatedTemplates(
            dispatch,
            data._id,
            previous?.linkedTemplateId,
          );
        } catch {
          // mutation failed
        }
      },
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
      async onQueryStarted({ templateId, configId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            noticeTemplatesApi.util.updateQueryData(
              'getNoticeTemplate',
              templateId,
              () => data,
            ),
          );
          dispatch(
            baseApi.util.invalidateTags([
              { type: 'NoticeTemplate', id: templateId },
              { type: 'NoticeTemplate', id: 'LIST' },
              { type: 'NoticeConfig', id: configId },
              { type: 'NoticeConfig', id: 'LIST' },
            ]),
          );
        } catch {
          // mutation failed
        }
      },
    }),

    unlinkTemplateConfig: build.mutation<NoticeTemplate, string>({
      query: (templateId) => ({
        url: `/api/v1/notice-templates/${templateId}/link-config`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      async onQueryStarted(templateId, { dispatch, queryFulfilled, getState }) {
        const previous = noticeTemplatesApi.endpoints.getNoticeTemplate.select(
          templateId,
        )(getState())?.data;
        try {
          const { data } = await queryFulfilled;
          dispatch(
            noticeTemplatesApi.util.updateQueryData(
              'getNoticeTemplate',
              templateId,
              () => data,
            ),
          );
          dispatch(
            baseApi.util.invalidateTags([
              { type: 'NoticeTemplate', id: templateId },
              { type: 'NoticeTemplate', id: 'LIST' },
              ...(previous?.linkedConfigId
                ? [
                    { type: 'NoticeConfig' as const, id: previous.linkedConfigId },
                    { type: 'NoticeConfig' as const, id: 'LIST' },
                  ]
                : [{ type: 'NoticeConfig' as const, id: 'LIST' }]),
            ]),
          );
        } catch {
          // mutation failed
        }
      },
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
