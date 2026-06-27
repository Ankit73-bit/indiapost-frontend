import { baseApi } from './baseApi';
import type {
  ApiSuccess,
  CreateNoticeExcelBody,
  ListNoticeExcelsQuery,
  NoticeExcelDetail,
  NoticeExcelRecord,
  PaginationMeta,
  SampleExcelPreviewData,
  ValidateProductionExcelResult,
} from '@/types';

export const noticeExcelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listNoticeExcels: build.query<
      { data: NoticeExcelRecord[]; meta?: PaginationMeta },
      ListNoticeExcelsQuery
    >({
      query: (params) => ({
        url: '/api/v1/notice-excels',
        params,
      }),
      transformResponse: (res: ApiSuccess<NoticeExcelRecord[]>) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((e) => ({ type: 'NoticeExcel' as const, id: e._id })),
              { type: 'NoticeExcel', id: 'LIST' },
            ]
          : [{ type: 'NoticeExcel', id: 'LIST' }],
    }),

    getNoticeExcel: build.query<NoticeExcelDetail, string>({
      query: (excelId) => `/api/v1/notice-excels/${excelId}`,
      transformResponse: (res: ApiSuccess<NoticeExcelDetail>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'NoticeExcel', id }],
    }),
  }),
});

export const { useListNoticeExcelsQuery, useGetNoticeExcelQuery } = noticeExcelsApi;

async function credFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(`${getApiBaseUrl()}${url}`, init);
  const json = (await res.json().catch(() => ({}))) as ApiSuccess<T> & {
    success?: boolean;
    error?: string;
    data?: T;
  };
  if (!res.ok) {
    throw Object.assign(new Error(json.error ?? 'Request failed'), {
      status: res.status,
      data: json.data,
    });
  }
  return json.data as T;
}

export async function validateProductionExcelFile(clientId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  form.append('clientId', clientId);
  return credFetchJson<ValidateProductionExcelResult>(
    '/api/v1/notice-excels/validate',
    { method: 'POST', body: form },
  );
}

export async function createNoticeExcelRecord(
  body: CreateNoticeExcelBody,
  file: File,
) {
  const form = new FormData();
  form.append('file', file);
  Object.entries(body).forEach(([key, value]) => {
    if (value != null && value !== '') form.append(key, String(value));
  });
  return credFetchJson<NoticeExcelRecord>('/api/v1/notice-excels', {
    method: 'POST',
    body: form,
  });
}

export async function replaceNoticeExcelFile(
  excelId: string,
  file: File,
  templateId?: string,
) {
  const form = new FormData();
  form.append('file', file);
  if (templateId) form.append('templateId', templateId);
  return credFetchJson<NoticeExcelRecord>(
    `/api/v1/notice-excels/${excelId}/replace`,
    { method: 'POST', body: form },
  );
}

export async function fetchNoticeExcelPreview(excelId: string) {
  return credFetchJson<SampleExcelPreviewData>(
    `/api/v1/notice-excels/${excelId}/preview`,
  );
}

export async function downloadNoticeExcelFile(excelId: string) {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-excels/${excelId}/download`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Download failed');
  }
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const fileNameMatch = /filename="([^"]+)"/.exec(disposition);
  return {
    blob: await res.blob(),
    fileName: fileNameMatch?.[1] ?? 'production.xlsx',
  };
}

export interface BatchPdfFromExcelOptions {
  sheetIndex?: number;
  mergePdfs?: boolean;
  individualPdfs?: boolean;
  mergeBatchSize?: number;
}

export interface BatchPdfFromExcelResult {
  blob: Blob;
  fileName: string;
  rowCount: number;
  pdfCount: number;
  individualPdfCount: number;
  mergedPdfCount: number;
}

export async function fetchBatchPdfFromStoredExcel(
  excelId: string,
  options: BatchPdfFromExcelOptions = {},
): Promise<BatchPdfFromExcelResult> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');

  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-excels/${excelId}/batch-pdf`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetIndex: options.sheetIndex ?? 0,
        mergePdfs: options.mergePdfs ?? false,
        individualPdfs: options.individualPdfs ?? true,
        mergeBatchSize: options.mergeBatchSize ?? 500,
      }),
    },
  );

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? `Server error ${res.status}`);
  }

  const rowCount = Number(res.headers.get('X-Row-Count') ?? '0');
  const pdfCount = Number(res.headers.get('X-Pdf-Count') ?? '0');
  const individualPdfCount = Number(
    res.headers.get('X-Individual-Pdf-Count') ?? String(pdfCount),
  );
  const mergedPdfCount = Number(res.headers.get('X-Merged-Pdf-Count') ?? '0');
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const fileName = match?.[1] ?? `batch-${excelId}.zip`;
  const blob = await res.blob();

  return { blob, fileName, rowCount, pdfCount, individualPdfCount, mergedPdfCount };
}
