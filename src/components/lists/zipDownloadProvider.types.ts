import type { PdfZipJobStatus } from '@/lib/pdfZipDownload';
import type { BulkExportFilters } from '@/lib/exportList';

export interface ZipDownloadTask {
  id: string;
  listId: string;
  listName: string;
  label: string;
  job: PdfZipJobStatus | null;
  cancelling: boolean;
}

export interface StartZipDownloadOptions {
  listId: string;
  clientId: string;
  listName: string;
  articleNumbers?: string[];
  label: string;
  onComplete?: () => void;
}

export interface StartBulkZipDownloadOptions {
  clientId: string;
  clientName: string;
  filters: BulkExportFilters;
  label: string;
  onComplete?: () => void;
}

export interface ZipDownloadContextValue {
  tasks: ZipDownloadTask[];
  startZipDownload: (options: StartZipDownloadOptions) => void;
  startBulkZipDownload: (options: StartBulkZipDownloadOptions) => void;
  cancelZipDownload: (taskId: string) => void;
  isListZipBusy: (listId: string) => boolean;
  getListTask: (listId: string) => ZipDownloadTask | undefined;
}

export interface CancelRef {
  current: boolean;
}
