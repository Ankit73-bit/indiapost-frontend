import { FileText, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleSheetPdfSectionProps {
  listAvailable: boolean;
  pdfViewerOpen: boolean;
  pdfBusy: boolean;
  onTogglePdfViewer: () => void;
  onDownloadPdf: () => void;
}

export function ArticleSheetPdfSection({
  listAvailable,
  pdfViewerOpen,
  pdfBusy,
  onTogglePdfViewer,
  onDownloadPdf,
}: ArticleSheetPdfSectionProps) {
  if (!listAvailable) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        Tracking PDF
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Generated on demand with the latest tracking events.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant={pdfViewerOpen ? 'default' : 'outline'}
          size="sm"
          className="h-8 gap-1.5"
          disabled={pdfBusy}
          onClick={onTogglePdfViewer}
        >
          <Eye className="h-3.5 w-3.5" />
          {pdfViewerOpen ? 'Hide PDF' : 'View PDF'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          disabled={pdfBusy}
          onClick={() => void onDownloadPdf()}
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </div>
    </div>
  );
}
