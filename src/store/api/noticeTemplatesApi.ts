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
      { templateId: string; version: string; noticeConfig: NoticeConfig; configFileName?: string }
    >({
      query: ({ templateId, version, noticeConfig, configFileName }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/config`,
        method: 'PATCH',
        body: { noticeConfig, configFileName },
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

    getNoticeVersionTemplateMap: build.query<
      { mappings: Record<string, string>; typFiles: string[]; readOnly: boolean },
      { templateId: string; version: string }
    >({
      query: ({ templateId, version }) =>
        `/api/v1/notice-templates/${templateId}/versions/${version}/template-map`,
      transformResponse: (
        res: ApiSuccess<{
          mappings: Record<string, string>;
          typFiles: string[];
          readOnly: boolean;
        }>,
      ) => res.data,
      providesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
      ],
    }),

    updateNoticeVersionTemplateMap: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string; mappings: Record<string, string> }
    >({
      query: ({ templateId, version, mappings }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/template-map`,
        method: 'PUT',
        body: { mappings },
      }),
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
      ],
    }),

    importNoticeVersionTemplateMap: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string; file: File }
    >({
      query: ({ templateId, version, file }) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: `/api/v1/notice-templates/${templateId}/versions/${version}/template-map/import`,
          method: 'POST',
          body: form,
        };
      },
      transformResponse: (res: ApiSuccess<NoticeTemplate>) => res.data,
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'NoticeTemplate', id: templateId },
      ],
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

    getNoticeVersionFile: build.query<
      { fileName: string; content: string; contentType: string },
      { templateId: string; version: string; fileName: string }
    >({
      query: ({ templateId, version, fileName }) =>
        `/api/v1/notice-templates/${templateId}/versions/${version}/files/${encodeURIComponent(fileName)}`,
      transformResponse: (
        res: ApiSuccess<{ fileName: string; content: string; contentType: string }>,
      ) => res.data,
    }),

    updateNoticeVersionFile: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string; fileName: string; content: string }
    >({
      query: ({ templateId, version, fileName, content }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/files/${encodeURIComponent(fileName)}`,
        method: 'PUT',
        body: { content },
      }),
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

    deactivateNoticeVersion: build.mutation<
      NoticeTemplate,
      { templateId: string; version: string }
    >({
      query: ({ templateId, version }) => ({
        url: `/api/v1/notice-templates/${templateId}/versions/${version}/deactivate`,
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
  useGetNoticeVersionTemplateMapQuery,
  useUpdateNoticeVersionTemplateMapMutation,
  useImportNoticeVersionTemplateMapMutation,
  useUploadNoticeVersionFilesMutation,
  useLazyGetNoticeVersionFileQuery,
  useUpdateNoticeVersionFileMutation,
  useActivateNoticeVersionMutation,
  useDeactivateNoticeVersionMutation,
} = noticeTemplatesApi;

export const DEFAULT_CONFIG_FILE_NAME = 'sample.json';

export async function fetchNoticeVersionFile(
  templateId: string,
  version: string,
  fileName: string,
): Promise<{ fileName: string; content: string; contentType: string }> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/files/${encodeURIComponent(fileName)}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to load file');
  }
  const json = (await res.json()) as ApiSuccess<{
    fileName: string;
    content: string;
    contentType: string;
  }>;
  return json.data;
}

export async function downloadNoticeVersionTemplateMap(
  templateId: string,
  version: string,
): Promise<{ blob: Blob; fileName: string }> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/template-map/export`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Export failed');
  }
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const fileNameMatch = /filename="([^"]+)"/.exec(disposition);
  return {
    blob: await res.blob(),
    fileName: fileNameMatch?.[1] ?? 'template.json',
  };
}

export async function fetchNoticeBatchPdf(
  templateId: string,
  version: string,
  excelFile: File,
  sheetIndex = 0,
): Promise<{ blob: Blob; fileName: string; rowCount: number; pdfCount: number }> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');

  const form = new FormData();
  form.append('file', excelFile);
  if (sheetIndex !== 0) form.append('sheetIndex', String(sheetIndex));

  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/batch-pdf`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Batch generation failed');
  }

  const disposition = res.headers.get('Content-Disposition') ?? '';
  const fileNameMatch = /filename="([^"]+)"/.exec(disposition);
  return {
    blob: await res.blob(),
    fileName: fileNameMatch?.[1] ?? 'notices.zip',
    rowCount: Number(res.headers.get('X-Row-Count') ?? 0),
    pdfCount: Number(res.headers.get('X-Pdf-Count') ?? 0),
  };
}

export async function fetchNoticeTemplatePreviewPdf(
  templateId: string,
  version: string,
  options?: {
    fileName?: string;
    typOverrides?: Record<string, string>;
  },
): Promise<{ blob: Blob; fileName: string }> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/preview-pdf`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: options?.fileName,
        typOverrides: options?.typOverrides,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? 'Failed to generate preview',
    );
  }
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const fileNameMatch = /filename="([^"]+)"/.exec(disposition);
  return {
    blob: await res.blob(),
    fileName: fileNameMatch?.[1] ?? 'preview.pdf',
  };
}
