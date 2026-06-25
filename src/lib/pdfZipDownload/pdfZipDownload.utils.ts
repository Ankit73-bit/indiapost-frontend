import type { PdfZipJobPhase, PdfZipJobStatus } from './pdfZipDownload.types';

export async function parsePdfZipError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string };
    return json.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function triggerBrowserDownload(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  a.click();
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

function zipPhaseLabel(phase: PdfZipJobPhase): string {
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

export class PdfZipDownloadCancelledError extends Error {
  constructor() {
    super('ZIP download cancelled');
    this.name = 'PdfZipDownloadCancelledError';
  }
}
