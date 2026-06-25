import type { Article, TrackingEvent } from '@/types';

export interface ArticleSheetScrollBodyProps {
  article: Article;
  isAdmin: boolean;
  listAvailable: boolean;
  pdfViewerOpen: boolean;
  pdfBusy: boolean;
  onTogglePdfViewer: () => void;
  onDownloadPdf: () => void;
  eventsLoading: boolean;
  eventsError: boolean;
  events: TrackingEvent[];
}
