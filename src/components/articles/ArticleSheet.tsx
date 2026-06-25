import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useGetArticleEventsQuery } from '@/store/api/articlesApi';
import { usePollListQuery } from '@/hooks/usePollListQuery';
import { PdfViewerPanelLoader } from '@/components/lists/PdfViewerPanelLoader';
import type { ArticleSheetProps } from '@/pages/articles/articlesPage.types';
import { ArticleSheetFooter } from './articleSheet/ArticleSheetFooter';
import { ArticleSheetHeader } from './articleSheet/ArticleSheetHeader';
import { ArticleSheetScrollBody } from './articleSheet/ArticleSheetScrollBody';
import { useArticleSheetPdf } from './articleSheet/useArticleSheetPdf';

export function ArticleSheet({
  article,
  isAdmin,
  onClose,
}: ArticleSheetProps) {
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
  } = useGetArticleEventsQuery({
    articleId: article._id,
    clientId: article.clientId,
  });

  const { data: list } = usePollListQuery(article.listId);
  const {
    pdfBusy,
    pdfViewerOpen,
    setPdfViewerOpen,
    handleDownloadPdf,
  } = useArticleSheetPdf({
    listId: article.listId,
    articleNumber: article.articleNumber,
    clientId: article.clientId,
  });

  const events = eventsData?.data ?? [];

  return (
    <Sheet
      open
      onOpenChange={(o) => {
        if (!o) {
          setPdfViewerOpen(false);
          onClose();
        }
      }}
    >
      <SheetContent
        className={cn(
          'flex h-full w-full flex-col gap-0 p-0 transition-[transform,opacity]!',
          pdfViewerOpen
            ? 'sm:max-w-[min(96vw,1200px)]! lg:w-[min(96vw,1200px)]'
            : 'sm:max-w-md!',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {pdfViewerOpen && (
            <div className="flex max-h-[45vh] min-h-0 min-w-0 flex-1 flex-col border-b border-border lg:max-h-none lg:border-b-0 lg:border-r">
              <PdfViewerPanelLoader
                target={{
                  listId: article.listId,
                  clientId: article.clientId,
                  articleNumber: article.articleNumber,
                }}
                onClose={() => setPdfViewerOpen(false)}
                onDownload={() => void handleDownloadPdf()}
                downloading={pdfBusy}
                showBackButton={false}
              />
            </div>
          )}

          <div
            className={cn(
              'flex min-h-0 flex-col overflow-hidden',
              pdfViewerOpen ? 'w-full lg:w-md lg:shrink-0' : 'w-full',
            )}
          >
            <ArticleSheetHeader article={article} isAdmin={isAdmin} />

            <ArticleSheetScrollBody
              article={article}
              isAdmin={isAdmin}
              listAvailable={Boolean(list)}
              pdfViewerOpen={pdfViewerOpen}
              pdfBusy={pdfBusy}
              onTogglePdfViewer={() => setPdfViewerOpen((open) => !open)}
              onDownloadPdf={handleDownloadPdf}
              eventsLoading={eventsLoading}
              eventsError={eventsError}
              events={events}
            />

            <ArticleSheetFooter article={article} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
