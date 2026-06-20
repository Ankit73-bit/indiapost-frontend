import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  CreateNoticeTemplateBody,
  ListNoticeTemplatesQuery,
  NoticeConfig,
  NoticeTemplate,
  PaginationMeta,
  VariableValidationResult,
} from '@/types';

export const noticeTemplatesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listNoticeTemplates: build.query<
      { data: NoticeTemplate[]; meta?: PaginationMeta },
      ListNoticeTemplatesQuery
    >({
      query: (params) => ({
        url: '/api/v1/notice-templates',
        params,
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((t) => ({
                type: 'NoticeTemplate' as const,
                id: t._id,
              })),
              { type: 'NoticeTemplate', id: 'LIST' },
            ]
          : [{ type: 'NoticeTemplate', id: 'LIST' }],
    }),

    getNoticeTemplate: build.query<NoticeTemplate, string>({
      query: (templateId) => `/api/v1/notice-templates/${templateId}`,
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'NoticeTemplate', id }],
    }),

    createNoticeTemplate: build.mutation<NoticeTemplate, CreateNoticeTemplateBody>({
      query: (body) => ({
        url: '/api/v1/notice-templates',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: [{ type: 'NoticeTemplate', id: 'LIST' }],
    }),

    createNoticeVersion: build.mutation<
      NoticeTemplate,
      { templateId: string; description?: string; cloneFromVersion?: string }
    >({
      query: ({ templateId, ...body }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),

    updateNoticeVersionConfig: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string; noticeConfig: NoticeConfig }
    >({
      query: ({ templateId, version, noticeConfig }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/config`,
        method: 'PATCH',
        body: { noticeConfig },
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
      ],
    }),

    updateNoticeVersionLayout: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string; with_header: boolean }
    >({
      query: ({ templateId, version, with_header }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/layout`,
        method: 'PATCH',
        body: { with_header },
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
      ],
    }),

    getNoticeVersionValidation: build.query<
      VariableValidationResult,
      { templateId: string; version: string }
    >({
      query: ({ templateId, version }) =>
        `/api/v1/notice-templates/${templateId}/versions/${version}/validation`,
      transformResponse: (res: ApiSuccess<VariableValidationResult>) => res.data,
    }),

    getNoticeSampleRow: build.query<
      Record<string, string>,
      { templateId: string; version: string }
    >({
      query: ({ templateId, version }) =>
        `/api/v1/notice-templates/${templateId}/versions/${version}/sample-row`,
      transformResponse: (res: ApiSuccess<Record<string, string>>) => res.data,
    }),

    uploadNoticeVersionFiles: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string; files: File[] }
    >({
      query: ({ templateId, version, files }) => {
        const form = new FormData();
        for (const file of files) {
          form.append('files', file);
        }
        return {
          url: `/api/v1/notice-templates/${templateId}/versions/${version}/files`,
          method: 'POST',
          body: form,
        };
      },
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
      ],
    }),

    activateNoticeVersion: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string }
    >({
      query: ({ templateId, version }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/activate`,
        method: 'POST',
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
        { type: 'NoticeTemplate', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListNoticeTemplatesQuery,
  useGetNoticeTemplateQuery,
  useCreateNoticeTemplateMutation,
  useCreateNoticeVersionMutation,
  useUpdateNoticeVersionConfigMutation,
  useUpdateNoticeVersionLayoutMutation,
  useGetNoticeVersionValidationQuery,
  useGetNoticeSampleRowQuery,
  useLazyGetNoticeSampleRowQuery,
  useUploadNoticeVersionFilesMutation,
  useActivateNoticeVersionMutation,
} = noticeTemplatesApi;

export async function fetchNoticeTestPdf(
  token: string,
  templateId: string,
  version: string,
  options?: {
    row?: Record<string, string | number | boolean>;
    generateSample?: boolean;
  },
): Promise<Blob> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/test-pdf`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        row: options?.row,
        generateSample: options?.generateSample,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? 'Failed to generate test PDF',
    );
  }
  return res.blob();
}

export async function fetchNoticeTestPdfFromSpreadsheet(
  token: string,
  templateId: string,
  version: string,
  file: File,
  rowIndex = 0,
): Promise<{ blob: Blob; rowJson?: string }> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const form = new FormData();
  form.append('file', file);
  form.append('rowIndex', String(rowIndex));

  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/test-pdf/upload`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? 'Failed to generate test PDF from file',
    );
  }
  return {
    blob: await res.blob(),
    rowJson: res.headers.get('X-Test-Row-Json') ?? undefined,
  };
}
