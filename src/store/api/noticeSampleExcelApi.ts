import type { ApiSuccess, NoticeConfigRecord, SampleExcelValidationResult } from '@/types';

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

export async function fetchRequiredExcelColumns(configId: string) {
  return credFetchJson<{ columns: string[]; indexedColumns: string[]; maxRows: number }>(
    `/api/v1/notice-configs/${configId}/required-excel-columns`,
  );
}

export async function validateSampleExcelFile(configId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return credFetchJson<SampleExcelValidationResult>(
    `/api/v1/notice-configs/${configId}/sample-excel/validate`,
    { method: 'POST', body: form },
  );
}

export async function uploadSampleExcelFile(configId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return credFetchJson<{
    record: NoticeConfigRecord;
    validation: SampleExcelValidationResult;
  }>(`/api/v1/notice-configs/${configId}/sample-excel`, { method: 'POST', body: form });
}

export async function downloadSampleExcelFile(configId: string) {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-configs/${configId}/sample-excel`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Download failed');
  }
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const fileNameMatch = /filename="([^"]+)"/.exec(disposition);
  return {
    blob: await res.blob(),
    fileName: fileNameMatch?.[1] ?? 'sample.xlsx',
  };
}

export async function fetchTestPdfFromSampleExcel(
  templateId: string,
  version: string,
): Promise<{ blob: Blob; fileName: string }> {
  const { getApiBaseUrl } = await import('@/lib/apiBase');
  const { credFetch } = await import('@/lib/fetchCredentials');
  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/test-pdf`,
    { method: 'POST' },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Test PDF failed');
  }
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const fileNameMatch = /filename="([^"]+)"/.exec(disposition);
  const rowCount = Number(res.headers.get('X-Row-Count') ?? '0');
  const pdfCount = Number(res.headers.get('X-Pdf-Count') ?? '0');
  return {
    blob: await res.blob(),
    fileName: fileNameMatch?.[1] ?? 'test-notice.pdf',
    rowCount,
    pdfCount,
  };
}
