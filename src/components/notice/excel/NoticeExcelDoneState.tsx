import { CheckCircle2, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoticeExcelDoneStateProps {
  pdfCount: number;
  rowCount: number;
  blobUrl: string | null;
  zipFileName: string;
  onReset: () => void;
}

export function NoticeExcelDoneState({
  pdfCount,
  rowCount,
  blobUrl,
  zipFileName,
  onReset,
}: NoticeExcelDoneStateProps) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-lg font-semibold">Batch complete</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {pdfCount} PDF{pdfCount !== 1 ? 's' : ''} generated from {rowCount} row
        {rowCount !== 1 ? 's' : ''}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {blobUrl && (
          <a href={blobUrl} download={zipFileName}>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Download ZIP
            </Button>
          </a>
        )}
        <Button variant="outline" className="gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Generate another batch
        </Button>
      </div>
    </div>
  );
}
