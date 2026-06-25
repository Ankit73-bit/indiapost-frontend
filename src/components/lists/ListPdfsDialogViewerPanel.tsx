import { PdfViewerPanelLoader } from '@/components/lists/PdfViewerPanelLoader';

interface ListPdfsDialogViewerPanelProps {
  listId: string;
  clientId: string;
  viewingArticle: string;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function ListPdfsDialogViewerPanel({
  listId,
  clientId,
  viewingArticle,
  downloading,
  onClose,
  onDownload,
}: ListPdfsDialogViewerPanelProps) {
  return (
    <div className="flex max-h-[45vh] min-h-0 min-w-0 flex-1 flex-col border-b border-border lg:max-h-none lg:w-1/2 lg:border-b-0 lg:border-r">
      <PdfViewerPanelLoader
        target={{ listId, clientId, articleNumber: viewingArticle }}
        onClose={onClose}
        onDownload={onDownload}
        downloading={downloading}
        showBackButton={false}
      />
    </div>
  );
}
