import type { BulkExportFilters } from '../exportList';
import type { PdfZipJobStatus } from './pdfZipDownload.types';
import {
  cancelBulkPdfZipJob,
  cancelPdfZipJob,
  downloadBulkPdfZipJobFile,
  downloadPdfZipJobFile,
  fetchBulkPdfZipJob,
  fetchPdfZipJob,
  notifyBulkPdfZipJobComplete,
  notifyPdfZipJobComplete,
  startBulkPdfZipJob,
  startPdfZipJob,
} from './pdfZipDownload.api';
import {
  PdfZipDownloadCancelledError,
  sleep,
  triggerBrowserDownload,
} from './pdfZipDownload.utils';

interface RunPdfZipDownloadOptions {
  listId: string;
  clientId: string;
  articleNumbers?: string[];
  onProgress: (job: PdfZipJobStatus) => void;
  isCancelled: () => boolean;
}

export async function runPdfZipDownload(
  options: RunPdfZipDownloadOptions,
): Promise<{ count: number; fileName: string }> {
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

interface RunBulkPdfZipDownloadOptions {
  filters: BulkExportFilters;
  onProgress: (job: PdfZipJobStatus) => void;
  isCancelled: () => boolean;
}

export async function runBulkPdfZipDownload(
  options: RunBulkPdfZipDownloadOptions,
): Promise<{ count: number; fileName: string }> {
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
