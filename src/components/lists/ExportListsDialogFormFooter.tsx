import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface ExportListsDialogFormFooterProps {
  onClose: () => void;
  busy: boolean;
  startingPdfZip: boolean;
  exporting: boolean;
  onDownloadPdfs: () => void;
  onExport: () => void;
}

export function ExportListsDialogFormFooter({
  onClose,
  busy,
  startingPdfZip,
  exporting,
  onDownloadPdfs,
  onExport,
}: ExportListsDialogFormFooterProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onDownloadPdfs}
        disabled={busy}
      >
        {startingPdfZip ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="mr-1.5 h-3.5 w-3.5" />
        )}
        Download PDFs
      </Button>
      <Button type="button" onClick={onExport} disabled={busy}>
        {exporting ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Download Excel
      </Button>
    </DialogFooter>
  );
}
