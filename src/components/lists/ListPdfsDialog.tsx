import { useDeferredValue, useEffect, useRef, useState } from 'react';
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
import { formatBytes, formatDateTime, getApiErrorMessage } from '@/lib/helpers';
import { downloadPdfFile, viewPdfInNewTab } from '@/lib/pdfFiles';
import { useZipDownload } from '@/components/lists/ZipDownloadProvider';
import { ZipDownloadProgress } from '@/components/lists/ZipDownloadProgress';
import {
  useGenerateListPdfsMutation,
  useListListPdfsQuery,
} from '@/store/api/listsApi';

const PDF_PAGE_SIZE = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function pdfProgressPercent(processed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((processed / total) * 100));
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

type ListPdfsDialogBodyProps = Omit<ListPdfsDialogProps, 'open'>;

function ListPdfsDialogBody({
  onClose,
  listId,
  clientId,
  listName,
  isAdmin,
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
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

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

  const [generatePdfs, { isLoading: generating }] =
    useGenerateListPdfsMutation();

  const pdfs = summary?.generatedPdfs ?? [];

  const allPageSelected =
    pdfs.length > 0 && pdfs.every((p) => selected.has(p.articleNumber));

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const p of pdfs) next.delete(p.articleNumber);
      } else {
        for (const p of pdfs) next.add(p.articleNumber);
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

  async function watchPdfProgress() {
    while (aliveRef.current) {
      const result = await refetch().unwrap();
      if (!result.data.pdfProgress) return;
      await sleep(3000);
    }
  }

  async function handleGenerate() {
    try {
      const result = await generatePdfs({ listId, clientId }).unwrap();
      toast.success(
        `PDF generation started for ${result.totalArticles.toLocaleString()} articles`,
      );
      void watchPdfProgress();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to start PDF generation'));
    }
  }

  async function handleView(articleNumber: string) {
    setBusyAction(`view-${articleNumber}`);
    try {
      await viewPdfInNewTab(listId, articleNumber, clientId);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to open PDF'));
    } finally {
      setBusyAction(null);
    }
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
      label: `Downloading ${numbers.length.toLocaleString()} selected PDFs…`,
      onComplete: clearSelection,
    });
  }

  function handleDownloadAll() {
    const total = summary?.pdfCount ?? 0;
    startZipDownload({
      listId,
      clientId,
      listName,
      label: `Downloading all ${total.toLocaleString()} PDFs…`,
    });
  }

  const progress = summary?.pdfProgress;
  const lastResult = summary?.lastPdfGenerationResult;
  const canGenerate =
    isAdmin && !progress && !generating && (summary?.totalArticles ?? 0) > 0;

  return (
    <>
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Tracking PDFs
          </DialogTitle>
          <DialogDescription>
            {listName} — view or download India Post status reports per article.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Ready
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {summary?.pdfCount ?? 0}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {summary?.totalArticles ?? 0}
                </span>
              </p>
            </div>
            {lastResult && !progress && (
              <>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Last run
                  </p>
                  <p className="mt-0.5 text-sm">
                    {lastResult.generated} generated · {lastResult.skipped}{' '}
                    skipped
                    {lastResult.failed > 0 && (
                      <span className="text-destructive">
                        {' '}
                        · {lastResult.failed} failed
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Completed
                  </p>
                  <p className="mt-0.5 text-sm">
                    {formatDateTime(lastResult.completedAt)}
                  </p>
                </div>
              </>
            )}
          </div>

          {summary?.pdfError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {summary.pdfError}
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
              ZIP download started — you can close this dialog and track progress
              in the banner at the top of the page.
            </p>
          )}

          {progress && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-3 text-sm text-violet-950 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Generating PDFs…</p>
                <span className="text-xs tabular-nums">
                  {progress.processedCount} / {progress.totalArticles}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-200">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-500"
                  style={{
                    width: `${pdfProgressPercent(
                      progress.processedCount,
                      progress.totalArticles,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Button
                size="sm"
                disabled={!canGenerate}
                onClick={() => void handleGenerate()}
              >
                {generating ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                {progress ? 'Generating…' : 'Generate PDFs'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={(summary?.pdfCount ?? 0) === 0 || isZipBusy}
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
                      aria-label="Select all PDFs on this page"
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Article
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium text-muted-foreground sm:table-cell">
                    Generated
                  </th>
                  <th className="hidden px-3 py-2 text-right font-medium text-muted-foreground md:table-cell">
                    Size
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(isLoading || isSearchPending) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading && !isSearchPending && pdfs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      {(summary?.pdfCount ?? 0) === 0
                        ? isAdmin
                          ? 'No PDFs yet. Sync tracking, then click Generate PDFs.'
                          : 'No PDFs available for this list yet.'
                        : 'No articles match your search.'}
                    </td>
                  </tr>
                )}
                {pdfs.map((pdf) => {
                  const isSelected = selected.has(pdf.articleNumber);
                  const viewBusy = busyAction === `view-${pdf.articleNumber}`;
                  const dlBusy = busyAction === `dl-${pdf.articleNumber}`;
                  return (
                    <tr
                      key={pdf.articleNumber}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-border"
                          checked={isSelected}
                          onChange={() => toggleOne(pdf.articleNumber)}
                          aria-label={`Select ${pdf.articleNumber}`}
                        />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        {pdf.articleNumber}
                        {pdf.isTerminal && (
                          <span className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-sans text-muted-foreground">
                            Final
                          </span>
                        )}
                      </td>
                      <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell">
                        {formatDateTime(pdf.generatedAt)}
                      </td>
                      <td className="hidden px-3 py-2.5 text-right text-muted-foreground md:table-cell">
                        {formatBytes(pdf.sizeBytes)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="View PDF"
                            disabled={Boolean(busyAction)}
                            onClick={() => void handleView(pdf.articleNumber)}
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
                              void handleDownloadOne(pdf.articleNumber)
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

          {isAdmin && !progress && (summary?.pdfCount ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              Tip: Run Generate PDFs again to refresh reports for articles still
              in transit. Completed articles are skipped automatically.
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-7 py-3 mb-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
    </>
  );
}

export function ListPdfsDialog({
  open,
  onClose,
  listId,
  clientId,
  ...rest
}: ListPdfsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {open ? (
          <ListPdfsDialogBody
            key={`${listId}:${clientId}`}
            onClose={onClose}
            listId={listId}
            clientId={clientId}
            {...rest}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
