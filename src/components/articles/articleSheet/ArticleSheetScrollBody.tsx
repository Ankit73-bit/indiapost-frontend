import { ArticleSheetAlerts } from '@/components/articles/articleSheet/ArticleSheetAlerts';
import { ArticleSheetAttributesSection } from '@/components/articles/articleSheet/ArticleSheetAttributesSection';
import { ArticleSheetBookingSection } from '@/components/articles/articleSheet/ArticleSheetBookingSection';
import { ArticleSheetLatestUpdate } from '@/components/articles/articleSheet/ArticleSheetLatestUpdate';
import { ArticleSheetPdfSection } from '@/components/articles/articleSheet/ArticleSheetPdfSection';
import { ArticleSheetRecipientSection } from '@/components/articles/articleSheet/ArticleSheetRecipientSection';
import { ArticleSheetTrackingTimeline } from '@/components/articles/articleSheet/ArticleSheetTrackingTimeline';
import type { ArticleSheetScrollBodyProps } from '@/components/articles/articleSheet/articleSheetScrollBody.types';

export type { ArticleSheetScrollBodyProps } from '@/components/articles/articleSheet/articleSheetScrollBody.types';

export function ArticleSheetScrollBody({
  article,
  isAdmin,
  listAvailable,
  pdfViewerOpen,
  pdfBusy,
  onTogglePdfViewer,
  onDownloadPdf,
  eventsLoading,
  eventsError,
  events,
}: ArticleSheetScrollBodyProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
      <ArticleSheetAlerts article={article} isAdmin={isAdmin} />

      <ArticleSheetPdfSection
        listAvailable={listAvailable}
        pdfViewerOpen={pdfViewerOpen}
        pdfBusy={pdfBusy}
        onTogglePdfViewer={onTogglePdfViewer}
        onDownloadPdf={onDownloadPdf}
      />

      <ArticleSheetLatestUpdate article={article} />

      <ArticleSheetRecipientSection article={article} />

      <ArticleSheetBookingSection article={article} />

      <ArticleSheetAttributesSection article={article} />

      <ArticleSheetTrackingTimeline
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        events={events}
      />
    </div>
  );
}
