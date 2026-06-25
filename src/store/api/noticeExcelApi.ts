import { getApiBaseUrl } from '@/lib/apiBase';
import { credFetch } from '@/lib/fetchCredentials';

export interface BatchPdfResult {
  blob: Blob;
  fileName: string;
  rowCount: number;
  pdfCount: number;
}

export async function fetchBatchNoticePdf(
  templateId: string,
  version: string,
  excelFile: File,
  sheetIndex = 0,
): Promise<BatchPdfResult> {
  const form = new FormData();
  form.append('file', excelFile);
  if (sheetIndex > 0) {
    form.append('sheetIndex', String(sheetIndex));
  }

  const res = await credFetch(
    `${getApiBaseUrl()}/api/v1/notice-templates/${templateId}/versions/${version}/batch-pdf`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    // Try to parse structured error from backend
    const json = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(json.error ?? `Server error ${res.status}`);
  }

  const rowCount = Number(res.headers.get('X-Row-Count') ?? '0');
  const pdfCount = Number(res.headers.get('X-Pdf-Count') ?? '0');

  // Derive filename from Content-Disposition or fall back to a safe default
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const fileName = match?.[1] ?? `batch-${templateId}-${version}.zip`;

  const blob = await res.blob();
  return { blob, fileName, rowCount, pdfCount };
}
