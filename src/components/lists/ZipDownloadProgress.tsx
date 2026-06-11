import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatZipEta,
  zipJobStatusLabel,
  type PdfZipJobStatus,
} from '@/lib/pdfZipDownload';

interface ZipDownloadProgressProps {
  job: PdfZipJobStatus;
  label: string;
  onCancel: () => void;
  cancelling?: boolean;
}

export function ZipDownloadProgress({
  job,
  label,
  onCancel,
  cancelling = false,
}: ZipDownloadProgressProps) {
  const isCompressing = job.phase === 'compressing';
  const canCancel = job.status === 'building' && !cancelling;

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            <p className="font-medium">{label}</p>
          </div>
          <p className="text-xs tabular-nums text-sky-800 dark:text-sky-200">
            {zipJobStatusLabel(job)}
          </p>
          <p className="text-xs text-sky-700 dark:text-sky-300">
            {isCompressing
              ? 'Finalizing ZIP — almost done'
              : formatZipEta(job.etaSeconds)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 border-sky-300 bg-white/80 text-sky-900 hover:bg-white dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100"
          disabled={!canCancel}
          onClick={onCancel}
        >
          {cancelling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </>
          )}
        </Button>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-200 dark:bg-sky-900">
        <div
          className="h-full rounded-full bg-sky-600 transition-all duration-500 dark:bg-sky-400"
          style={{ width: `${job.percent}%` }}
        />
      </div>
    </div>
  );
}
