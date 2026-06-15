import { ArrowLeft, Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerPanelProps {
  title: string;
  blobUrl: string | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onDownload?: () => void;
  downloading?: boolean;
  showBackButton?: boolean;
}

export function PdfViewerPanel({
  title,
  blobUrl,
  loading = false,
  error = null,
  onClose,
  onDownload,
  downloading = false,
  showBackButton = true,
}: PdfViewerPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        {showBackButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2"
            onClick={onClose}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        )}
        <p className="min-w-0 flex-1 truncate font-mono text-sm">{title}</p>
        {onDownload && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!blobUrl || downloading}
            onClick={onDownload}
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
          aria-label="Close PDF viewer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative min-h-0 flex-1 bg-muted/30">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Generating PDF…
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-destructive">
            {error}
          </div>
        )}
        {blobUrl && !loading && !error && (
          <iframe
            title={title}
            src={blobUrl}
            className="h-full w-full border-0 bg-white"
          />
        )}
      </div>
    </div>
  );
}
