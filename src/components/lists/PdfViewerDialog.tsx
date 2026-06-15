import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadPdfFile, loadPdfBlobUrl } from '@/lib/pdfFiles';
import { getApiErrorMessage } from '@/lib/helpers';
import { PdfViewerPanel } from '@/components/lists/PdfViewerPanel';

export interface PdfViewerTarget {
  listId: string;
  clientId: string;
  articleNumber: string;
}

interface PdfViewerDialogProps {
  open: boolean;
  onClose: () => void;
  target: PdfViewerTarget | null;
}

export function PdfViewerDialog({ open, onClose, target }: PdfViewerDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  function revokeBlob() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setBlobUrl(null);
  }

  useEffect(() => {
    if (!open || !target) {
      revokeBlob();
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    revokeBlob();

    void loadPdfBlobUrl(target.listId, target.articleNumber, target.clientId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        blobUrlRef.current = url;
        setBlobUrl(url);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to load PDF'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, target?.listId, target?.clientId, target?.articleNumber]);

  useEffect(() => {
    return () => revokeBlob();
  }, []);

  async function handleDownload() {
    if (!target) return;
    setDownloading(true);
    try {
      await downloadPdfFile(target.listId, target.articleNumber, target.clientId);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="z-60 flex h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)]! sm:max-w-[calc(100vw-1.5rem)]! flex-col gap-0 overflow-hidden rounded-lg p-0"
      >
        <DialogTitle className="sr-only">
          {target ? `PDF — ${target.articleNumber}` : 'PDF viewer'}
        </DialogTitle>
        <PdfViewerPanel
          title={target?.articleNumber ?? ''}
          blobUrl={blobUrl}
          loading={loading}
          error={error}
          onClose={onClose}
          onDownload={target ? handleDownload : undefined}
          downloading={downloading}
          showBackButton={false}
        />
      </DialogContent>
    </Dialog>
  );
}
