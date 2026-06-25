import { CheckCircle2, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoticeExcelDoneStateProps {
  pdfCount: number;
  rowCount: number;
  individualPdfCount: number;
  mergedPdfCount: number;
  mergePdfs: boolean;
  blobUrl: string | null;
  zipFileName: string;
  onReset: () => void;
}

export function NoticeExcelDoneState({
  pdfCount,
  rowCount,
  individualPdfCount,
  mergedPdfCount,
  mergePdfs,
  blobUrl,
  zipFileName,
  onReset,
}: NoticeExcelDoneStateProps) {
  const summary = mergePdfs
    ? `${mergedPdfCount} merged PDF${mergedPdfCount !== 1 ? 's' : ''} from ${individualPdfCount} individual notice${individualPdfCount !== 1 ? 's' : ''} (${rowCount} row${rowCount !== 1 ? 's' : ''})`
    : `${pdfCount} PDF${pdfCount !== 1 ? 's' : ''} generated from ${rowCount} row${rowCount !== 1 ? 's' : ''}`;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-lg font-semibold">Batch complete</p>
      <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
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
