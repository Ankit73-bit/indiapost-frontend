import { getApiBaseUrl } from '../apiBase';
import { credFetch } from '../fetchCredentials';
import type { BulkExportFilters } from '../exportList';
import type { PdfZipJobStatus } from './pdfZipDownload.types';
import { parsePdfZipError, triggerBrowserDownload } from './pdfZipDownload.utils';

const API_BASE = getApiBaseUrl();

export async function startPdfZipJob(
  listId: string,
  clientId: string,
  articleNumbers?: string[],
): Promise<PdfZipJobStatus> {
  const res = await credFetch(`${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      ...(articleNumbers?.length ? { articleNumbers } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to start ZIP download'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function fetchPdfZipJob(
  listId: string,
  clientId: string,
  jobId: string,
): Promise<PdfZipJobStatus> {
  const params = new URLSearchParams({ clientId });
  const res = await credFetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}?${params}`,
  );

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to get download status'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function cancelPdfZipJob(
  listId: string,
  clientId: string,
  jobId: string,
): Promise<void> {
  const res = await credFetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  );

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to cancel download'));
  }
}

async function downloadPdfZipJobFile(
  listId: string,
  clientId: string,
  jobId: string,
  fileName: string,
): Promise<void> {
  const params = new URLSearchParams({ clientId });
  const res = await credFetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}/file?${params}`,
  );

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to download ZIP file'));
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  triggerBrowserDownload(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
}

export async function notifyPdfZipJobComplete(
  listId: string,
  clientId: string,
  jobId: string,
): Promise<void> {
  await credFetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  ).catch(() => undefined);
}

function bulkFiltersBody(filters: BulkExportFilters): Record<string, unknown> {
  return {
    clientId: filters.clientId,
    ...(filters.year != null ? { year: filters.year } : {}),
    ...(filters.month != null ? { month: filters.month } : {}),
    ...(filters.noticeType ? { noticeType: filters.noticeType } : {}),
    ...(filters.dispatchFrom ? { dispatchFrom: filters.dispatchFrom } : {}),
    ...(filters.dispatchTo ? { dispatchTo: filters.dispatchTo } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.syncFailed ? { syncFailed: 'true' } : {}),
  };
}

export async function startBulkPdfZipJob(
  filters: BulkExportFilters,
): Promise<PdfZipJobStatus> {
  const res = await credFetch(`${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bulkFiltersBody(filters)),
  });

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to start bulk PDF download'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function fetchBulkPdfZipJob(
  clientId: string,
  jobId: string,
): Promise<PdfZipJobStatus> {
  const params = new URLSearchParams({ clientId });
  const res = await credFetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}?${params}`,
  );

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to get bulk download status'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function cancelBulkPdfZipJob(
  clientId: string,
  jobId: string,
): Promise<void> {
  const res = await credFetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  );

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to cancel bulk download'));
  }
}

async function downloadBulkPdfZipJobFile(
  clientId: string,
  jobId: string,
  fileName: string,
): Promise<void> {
  const params = new URLSearchParams({ clientId });
  const res = await credFetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}/file?${params}`,
  );

  if (!res.ok) {
    throw new Error(await parsePdfZipError(res, 'Failed to download bulk ZIP file'));
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  triggerBrowserDownload(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
}

export async function notifyBulkPdfZipJobComplete(
  clientId: string,
  jobId: string,
): Promise<void> {
  await credFetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  ).catch(() => undefined);
}

export {
  downloadPdfZipJobFile,
  downloadBulkPdfZipJobFile,
};
