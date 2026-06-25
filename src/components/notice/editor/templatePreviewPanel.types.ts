export interface TemplatePreviewPanelProps {
  fileName: string;
  pdfUrl: string | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

export interface TemplatePreviewPanelHeaderProps {
  shortName: string;
  loading?: boolean;
  onClose: () => void;
  onRefresh: () => void;
}
