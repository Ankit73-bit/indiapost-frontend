import { FileSpreadsheet, Loader2 } from 'lucide-react';

interface NoticeExcelGeneratingStateProps {
  excelFileName?: string;
  templateName: string;
}

export function NoticeExcelGeneratingState({
  excelFileName,
  templateName,
}: NoticeExcelGeneratingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <Loader2 className="absolute h-14 w-14 animate-spin text-primary/20" />
        <FileSpreadsheet className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="font-semibold">Generating PDFs…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Processing <span className="font-medium">{excelFileName}</span> with{' '}
          <span className="font-medium">{templateName}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          This may take a few minutes depending on the number of rows.
        </p>
      </div>
    </div>
  );
}
