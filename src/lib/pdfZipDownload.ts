import { getApiBaseUrl } from './apiBase';
import type { BulkExportFilters } from './exportList';

const API_BASE = getApiBaseUrl();

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('ip_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type PdfZipJobStatus = {
  jobId: string;
  status: 'building' | 'ready' | 'failed' | 'cancelled';
  processed: number;
  total: number;
  percent: number;
  phase: 'generating' | 'compressing' | 'uploading';
  startedAt: string;
  finishedAt?: string;
  error?: string;
  fileName?: string;
  downloadUrl?: string;
  etaSeconds: number | null;
};

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string };
    return json.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function formatZipEta(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return 'Estimating time…';
  }
  if (seconds < 60) return `~${Math.ceil(seconds)}s remaining`;
  const mins = Math.ceil(seconds / 60);
  if (mins < 60) return `~${mins} min remaining`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `~${hours}h ${remMins}m remaining` : `~${hours}h remaining`;
}

function zipPhaseLabel(phase: PdfZipJobStatus['phase']): string {
  if (phase === 'uploading') return 'Uploading archive…';
  if (phase === 'compressing') return 'Compressing archive…';
  return 'Generating PDFs…';
}

export function zipJobStatusLabel(job: PdfZipJobStatus): string {
  if (job.phase === 'compressing' || job.phase === 'uploading') {
    return `${zipPhaseLabel(job.phase)} ${job.percent}%`;
  }
  return `${zipPhaseLabel(job.phase)} ${job.processed.toLocaleString()} / ${job.total.toLocaleString()} (${job.percent}%)`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function startPdfZipJob(
  listId: string,
  clientId: string,
  articleNumbers?: string[],
): Promise<PdfZipJobStatus> {
  const res = await fetch(`${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      ...(articleNumbers?.length ? { articleNumbers } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to start ZIP download'));
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
  const res = await fetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}?${params}`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to get download status'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function cancelPdfZipJob(
  listId: string,
  clientId: string,
  jobId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}`,
    {
      method: 'DELETE',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to cancel download'));
  }
}

function triggerBrowserDownload(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  a.click();
}

async function downloadPdfZipJobFile(
  listId: string,
  clientId: string,
  jobId: string,
  fileName: string,
): Promise<void> {
  const params = new URLSearchParams({ clientId });
  const res = await fetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}/file?${params}`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to download ZIP file'));
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  triggerBrowserDownload(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
}

export class PdfZipDownloadCancelledError extends Error {
  constructor() {
    super('ZIP download cancelled');
    this.name = 'PdfZipDownloadCancelledError';
  }
}

export async function notifyPdfZipJobComplete(
  listId: string,
  clientId: string,
  jobId: string,
): Promise<void> {
  await fetch(
    `${API_BASE}/api/v1/lists/${listId}/pdfs/download-jobs/${jobId}/complete`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  ).catch(() => undefined);
}

export async function runPdfZipDownload(options: {
  listId: string;
  clientId: string;
  articleNumbers?: string[];
  onProgress: (job: PdfZipJobStatus) => void;
  isCancelled: () => boolean;
}): Promise<{ count: number; fileName: string }> {
  const job = await startPdfZipJob(
    options.listId,
    options.clientId,
    options.articleNumbers,
  );
  options.onProgress(job);

  let current = job;
  while (current.status === 'building') {
    if (options.isCancelled()) {
      await cancelPdfZipJob(options.listId, options.clientId, current.jobId);
      throw new PdfZipDownloadCancelledError();
    }
    await sleep(1000);
    current = await fetchPdfZipJob(
      options.listId,
      options.clientId,
      current.jobId,
    );
    options.onProgress(current);
  }

  if (current.status === 'cancelled') {
    throw new PdfZipDownloadCancelledError();
  }

  if (current.status === 'failed') {
    throw new Error(current.error ?? 'ZIP build failed');
  }

  if (current.status !== 'ready' || !current.fileName) {
    throw new Error('ZIP download did not complete');
  }

  if (current.downloadUrl) {
    triggerBrowserDownload(current.downloadUrl, current.fileName);
    void notifyPdfZipJobComplete(options.listId, options.clientId, current.jobId);
  } else {
    await downloadPdfZipJobFile(
      options.listId,
      options.clientId,
      current.jobId,
      current.fileName,
    );
    void notifyPdfZipJobComplete(options.listId, options.clientId, current.jobId);
  }

  return { count: current.total, fileName: current.fileName };
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
  const res = await fetch(`${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bulkFiltersBody(filters)),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to start bulk PDF download'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function fetchBulkPdfZipJob(
  clientId: string,
  jobId: string,
): Promise<PdfZipJobStatus> {
  const params = new URLSearchParams({ clientId });
  const res = await fetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}?${params}`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to get bulk download status'));
  }

  const json = (await res.json()) as { data: PdfZipJobStatus };
  return json.data;
}

export async function cancelBulkPdfZipJob(
  clientId: string,
  jobId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}`,
    {
      method: 'DELETE',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to cancel bulk download'));
  }
}

async function downloadBulkPdfZipJobFile(
  clientId: string,
  jobId: string,
  fileName: string,
): Promise<void> {
  const params = new URLSearchParams({ clientId });
  const res = await fetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}/file?${params}`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to download bulk ZIP file'));
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
  await fetch(
    `${API_BASE}/api/v1/lists/pdfs/bulk-download-jobs/${jobId}/complete`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    },
  ).catch(() => undefined);
}

export async function runBulkPdfZipDownload(options: {
  filters: BulkExportFilters;
  onProgress: (job: PdfZipJobStatus) => void;
  isCancelled: () => boolean;
}): Promise<{ count: number; fileName: string }> {
  const clientId = options.filters.clientId;
  const job = await startBulkPdfZipJob(options.filters);
  options.onProgress(job);

  let current = job;
  while (current.status === 'building') {
    if (options.isCancelled()) {
      await cancelBulkPdfZipJob(clientId, current.jobId);
      throw new PdfZipDownloadCancelledError();
    }
    await sleep(1000);
    current = await fetchBulkPdfZipJob(clientId, current.jobId);
    options.onProgress(current);
  }

  if (current.status === 'cancelled') {
    throw new PdfZipDownloadCancelledError();
  }

  if (current.status === 'failed') {
    throw new Error(current.error ?? 'ZIP build failed');
  }

  if (current.status !== 'ready' || !current.fileName) {
    throw new Error('ZIP download did not complete');
  }

  if (current.downloadUrl) {
    triggerBrowserDownload(current.downloadUrl, current.fileName);
    void notifyBulkPdfZipJobComplete(clientId, current.jobId);
  } else {
    await downloadBulkPdfZipJobFile(clientId, current.jobId, current.fileName);
    void notifyBulkPdfZipJobComplete(clientId, current.jobId);
  }

  return { count: current.total, fileName: current.fileName };
}
