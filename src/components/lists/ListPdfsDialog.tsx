import { useDeferredValue, useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pagination } from '@/components/shared/Pagination';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { downloadPdfFile } from '@/lib/pdfFiles';
import { useZipDownload } from '@/components/lists/ZipDownloadProvider';
import { ZipDownloadProgress } from '@/components/lists/ZipDownloadProgress';
import { PdfViewerPanelLoader } from '@/components/lists/PdfViewerPanelLoader';
import { useListListPdfsQuery } from '@/store/api/listsApi';
import type { PdfArticleItem } from '@/types';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import type { NormalizedStatus } from '@/types';

const PDF_PAGE_SIZE = 50;
const LARGE_LIST_THRESHOLD = 1000;

function estimateBulkMinutes(count: number): string {
  // ~2–3 PDFs/sec with concurrency 4 on a typical server
  const seconds = Math.ceil(count / 2.5);
  if (seconds < 120) return `~${Math.ceil(seconds / 60) || 1} min`;
  const mins = Math.ceil(seconds / 60);
  if (mins < 120) return `~${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `~${hours}h ${rem}m` : `~${hours}h`;
}

interface ListPdfsDialogProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  clientId: string;
  listName: string;
  listSlug: string;
  isAdmin: boolean;
}

type ListPdfsDialogBodyProps = Omit<ListPdfsDialogProps, 'open'> & {
  viewingArticle: string | null;
  onViewingArticleChange: (articleNumber: string | null) => void;
};

function ListPdfsDialogBody({
  onClose,
  listId,
  clientId,
  listName,
  viewingArticle,
  onViewingArticleChange,
}: ListPdfsDialogBodyProps) {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const { startZipDownload, cancelZipDownload, isListZipBusy, getListTask } =
    useZipDownload();
  const listZipTask = getListTask(listId);
  const isZipBusy = isListZipBusy(listId);

  const querySearch = deferredSearch.trim() || undefined;

  const { data, isLoading, isFetching, refetch } = useListListPdfsQuery({
    listId,
    clientId,
    page,
    limit: PDF_PAGE_SIZE,
    search: querySearch,
  });

  const summary = data?.data;
  const pdfMeta = data?.meta;
  const isSearchPending = search !== deferredSearch;

  const articles: PdfArticleItem[] =
    summary?.articles ?? summary?.generatedPdfs ?? [];

  const allPageSelected =
    articles.length > 0 &&
    articles.every((p) => selected.has(p.articleNumber));

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const p of articles) next.delete(p.articleNumber);
      } else {
        for (const p of articles) next.add(p.articleNumber);
      }
      return next;
    });
  }

  function toggleOne(articleNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(articleNumber)) next.delete(articleNumber);
      else next.add(articleNumber);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleView(articleNumber: string) {
    onViewingArticleChange(articleNumber);
  }

  async function handleDownloadOne(articleNumber: string) {
    setBusyAction(`dl-${articleNumber}`);
    try {
      await downloadPdfFile(listId, articleNumber, clientId);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download PDF'));
    } finally {
      setBusyAction(null);
    }
  }

  function handleDownloadSelected() {
    const numbers = [...selected];
    if (numbers.length === 0) return;

    if (numbers.length === 1) {
      const articleNumber = numbers[0]!;
      setBusyAction(`dl-${articleNumber}`);
      void downloadPdfFile(listId, articleNumber, clientId)
        .then(() => clearSelection())
        .catch((err) =>
          toast.error(getApiErrorMessage(err, 'Failed to download PDF')),
        )
        .finally(() => setBusyAction(null));
      return;
    }

    startZipDownload({
      listId,
      clientId,
      listName,
      articleNumbers: numbers,
      label: `Generating ${numbers.length.toLocaleString()} PDFs…`,
      onComplete: clearSelection,
    });
  }

  function handleDownloadAll() {
    const total = summary?.pdfCount ?? 0;
    if (total >= LARGE_LIST_THRESHOLD) {
      const ok = window.confirm(
        `This list has ${total.toLocaleString()} articles. Generating all PDFs may take ${estimateBulkMinutes(total)}. You can close this dialog and track progress in the banner at the top. Continue?`,
      );
      if (!ok) return;
    }

    startZipDownload({
      listId,
      clientId,
      listName,
      label: `Generating all ${total.toLocaleString()} PDFs…`,
    });
  }

  const totalArticles = summary?.totalArticles ?? 0;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {viewingArticle && (
        <div className="flex min-h-0 min-w-0 w-1/2 flex-col border-r border-border">
          <PdfViewerPanelLoader
            target={{ listId, clientId, articleNumber: viewingArticle }}
            onClose={() => onViewingArticleChange(null)}
            onDownload={() => void handleDownloadOne(viewingArticle)}
            downloading={busyAction === `dl-${viewingArticle}`}
            showBackButton={false}
          />
        </div>
      )}

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-col',
          viewingArticle ? 'w-1/2' : 'w-full',
        )}
      >
      <DialogHeader className="shrink-0 space-y-1 border-b border-border px-5 py-4">
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Tracking PDFs
        </DialogTitle>
        <DialogDescription>
          {listName} — PDFs are generated on demand with the latest tracking data.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Articles
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {totalArticles.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Each PDF is built when you view or download — always up to date.
          </p>
        </div>

        {totalArticles >= LARGE_LIST_THRESHOLD && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Large list: bulk ZIP for {totalArticles.toLocaleString()} articles may
            take {estimateBulkMinutes(totalArticles)}. Prefer selecting a subset,
            or run the download in the background via the top banner.
          </div>
        )}

        {listZipTask?.job && (
          <ZipDownloadProgress
            job={listZipTask.job}
            label={listZipTask.label}
            cancelling={listZipTask.cancelling}
            onCancel={() => cancelZipDownload(listZipTask.id)}
          />
        )}
        {listZipTask && !listZipTask.job && (
          <p className="text-xs text-muted-foreground">
            ZIP download started — you can close this dialog and track progress in
            the banner at the top of the page.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={totalArticles === 0 || isZipBusy}
            onClick={handleDownloadAll}
          >
            {isZipBusy ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Download all (ZIP)
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected.size === 0 || isZipBusy}
            onClick={handleDownloadSelected}
          >
            {isZipBusy ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Download selected ({selected.size})
          </Button>
          {selected.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isZipBusy}
              onClick={clearSelection}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear selection
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search article number…"
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-border"
                    checked={allPageSelected}
                    onChange={toggleAllOnPage}
                    aria-label="Select all articles on this page"
                  />
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Article
                </th>
                <th className="hidden px-3 py-2 text-left font-medium text-muted-foreground sm:table-cell">
                  Status
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(isLoading || isSearchPending) && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!isLoading && !isSearchPending && articles.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {totalArticles === 0
                      ? 'No articles in this list yet.'
                      : 'No articles match your search.'}
                  </td>
                </tr>
              )}
              {articles.map((item) => {
                const isSelected = selected.has(item.articleNumber);
                const viewBusy = busyAction === `view-${item.articleNumber}`;
                const dlBusy = busyAction === `dl-${item.articleNumber}`;
                return (
                  <tr
                    key={item.articleNumber}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-border"
                        checked={isSelected}
                        onChange={() => toggleOne(item.articleNumber)}
                        aria-label={`Select ${item.articleNumber}`}
                      />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      {item.articleNumber}
                      {item.isTerminal && (
                        <span className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-sans text-muted-foreground">
                          Final
                        </span>
                      )}
                    </td>
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      {item.normalizedStatus ? (
                        <ArticleStatusBadge
                          status={item.normalizedStatus as NormalizedStatus}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="View PDF"
                          disabled={Boolean(busyAction)}
                          onClick={() => void handleView(item.articleNumber)}
                        >
                          {viewBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Download PDF"
                          disabled={Boolean(busyAction)}
                          onClick={() =>
                            void handleDownloadOne(item.articleNumber)
                          }
                        >
                          {dlBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pdfMeta && pdfMeta.total > 0 && (
            <div className="px-3 pb-3">
              <Pagination meta={pdfMeta} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-border px-7 py-3 mb-0">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
      </div>
    </div>
  );
}

export function ListPdfsDialog({
  open,
  onClose,
  listId,
  clientId,
  ...rest
}: ListPdfsDialogProps) {
  const [viewingArticle, setViewingArticle] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setViewingArticle(null);
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0',
          viewingArticle
            ? 'w-[min(96vw,1200px)] sm:max-w-[min(96vw,1200px)]!'
            : 'sm:max-w-2xl!',
        )}
      >
        {open ? (
          <ListPdfsDialogBody
            key={`${listId}:${clientId}`}
            onClose={onClose}
            listId={listId}
            clientId={clientId}
            viewingArticle={viewingArticle}
            onViewingArticleChange={setViewingArticle}
            {...rest}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
