import { PdfViewerPanel } from '@/components/lists/PdfViewerPanel';
import { TemplatePreviewPanelHeader } from './TemplatePreviewPanelHeader';
import type { TemplatePreviewPanelProps } from './templatePreviewPanel.types';

export function TemplatePreviewPanel({
  fileName,
  pdfUrl,
  loading,
  error,
  onClose,
  onRefresh,
}: TemplatePreviewPanelProps) {
  const shortName = fileName.split('/').pop() ?? fileName;

  return (
    <aside className="flex w-[min(42vw,480px)] shrink-0 flex-col border-l border-border bg-card">
      <TemplatePreviewPanelHeader
        shortName={shortName}
        loading={loading}
        onClose={onClose}
        onRefresh={onRefresh}
      />
      <PdfViewerPanel
        title={shortName}
        blobUrl={pdfUrl}
        loading={loading}
        error={error}
        onClose={onClose}
        showBackButton={false}
      />
    </aside>
  );
}
