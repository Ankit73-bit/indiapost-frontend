import { PdfViewerPanel } from '@/components/lists/PdfViewerPanel';
import { usePdfBlob, type PdfBlobTarget } from '@/hooks/usePdfBlob';

interface PdfViewerPanelLoaderProps {
  target: PdfBlobTarget;
  onClose: () => void;
  onDownload?: () => void;
  downloading?: boolean;
  showBackButton?: boolean;
}

export function PdfViewerPanelLoader({
  target,
  onClose,
  onDownload,
  downloading = false,
  showBackButton = true,
}: PdfViewerPanelLoaderProps) {
  const { blobUrl, loading, error } = usePdfBlob(target, true);

  return (
    <PdfViewerPanel
      title={target.articleNumber}
      blobUrl={blobUrl}
      loading={loading}
      error={error}
      onClose={onClose}
      onDownload={onDownload}
      downloading={downloading}
      showBackButton={showBackButton}
    />
  );
}
