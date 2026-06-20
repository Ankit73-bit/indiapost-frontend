import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Package,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Truck,
  FileText,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArticleStatusBadge,
  ListStatusBadge,
} from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import {
  useListArticlesQuery,
  useLazyListSyncableArticleIdsQuery,
  useGetArticleEventsQuery,
} from '@/store/api/articlesApi';
import { useGetListQuery } from '@/store/api/listsApi';
import { usePollListQuery } from '@/hooks/usePollListQuery';
import { SearchableListSelect } from '@/components/shared/SearchableListSelect';
import { FilterSheetButton, FilterField } from '@/components/shared/FilterSheetButton';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import {
  saveArticlesContext,
  loadArticlesContext,
  getRecentArticleListIds,
} from '@/lib/articlesNavigation';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useAppSelector } from '@/store';
import { ALL_STATUSES, TERMINAL_STATUSES } from '@/types';
import { useTriggerArticlesSyncMutation } from '@/store/api/syncApi';
import { formatDate, formatDateTime, formatRelative, STATUS_CONFIG, getApiErrorMessage } from '@/lib/helpers';
import { downloadPdfFile } from '@/lib/pdfFiles';
import { PdfViewerPanelLoader } from '@/components/lists/PdfViewerPanelLoader';
import { toast } from '@/lib/toast';
import { downloadListExport } from '@/lib/exportList';
import { importPercent, syncPercent } from '@/lib/listProgress';
import { listDisplayName } from '@/lib/listNaming';
import { OperationProgressBar } from '@/components/shared/OperationProgressBar';
import type { Article, NormalizedStatus } from '@/types';
import { ListPdfsDialog } from '@/components/lists/ListPdfsDialog';

// ─── Article detail sheet ─────────────────────────────────────────────────────

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 px-3 py-2.5 text-sm last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          'min-w-0 text-right',
          mono && 'font-mono text-xs break-all',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function RecipientLine({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2 text-sm">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 wrap-break-word text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

function ArticleSheet({
  article,
  isAdmin,
  onClose,
}: {
  article: Article;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const {
    data: eventsData,
    isLoading,
    isError,
  } = useGetArticleEventsQuery({
    articleId: article._id,
    clientId: article.clientId,
  });

  const { data: list } = usePollListQuery(article.listId);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await downloadPdfFile(
        article.listId,
        article.articleNumber,
        article.clientId,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download PDF'));
    } finally {
      setPdfBusy(false);
    }
  }

  const { recipient, bookingDetails } = article;
  const attributeEntries = Object.entries(article.attributes ?? {});
  const hasAddress = Boolean(
    recipient.addressLine1 ||
      recipient.addressLine2 ||
      recipient.city ||
      recipient.state ||
      recipient.pincode,
  );
  const hasBookingDetails = Boolean(
    bookingDetails?.articleType ||
      bookingDetails?.originPincode ||
      bookingDetails?.destinationPincode ||
      bookingDetails?.tariff !== undefined ||
      article.deliveredAt,
  );
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
        {/* Header */}
        <SheetHeader className="shrink-0 space-y-3 border-b border-border px-4 py-4 pr-12">
          <div className="space-y-1">
            <SheetDescription>Article details</SheetDescription>
            <SheetTitle className="font-mono text-base leading-snug break-all">
              {article.articleNumber}
            </SheetTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ArticleStatusBadge status={article.normalizedStatus} />
            {article.syncError && (
              <span className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                Sync failed
              </span>
            )}
            {article.isTerminal && (
              <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Terminal
              </span>
            )}
            {isAdmin && article.indiaPostTrackingExpired && (
              <span className="rounded border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                IP tracking expired
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {isAdmin && article.indiaPostTrackingExpired && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              India Post no longer returns tracking for this article (~60 days
              after dispatch). Timeline shown here is from data synced earlier.
            </div>
          )}

          {article.syncError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                Last sync failed
              </div>
              <p className="mt-1.5 text-sm leading-snug">{article.syncError}</p>
              {article.syncErrorAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelative(article.syncErrorAt)}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Trigger Sync on the list to retry automatically.
              </p>
            </div>
          )}

          {list && (
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Tracking PDF
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Generated on demand with the latest tracking events.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant={pdfViewerOpen ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={pdfBusy}
                  onClick={() => setPdfViewerOpen((open) => !open)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {pdfViewerOpen ? 'Hide PDF' : 'View PDF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={pdfBusy}
                  onClick={() => void handleDownloadPdf()}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {article.latestEvent && (
            <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Truck className="h-3.5 w-3.5" />
                Latest update
              </div>
              <p className="mt-1.5 text-sm font-medium leading-snug">
                {article.latestEvent.rawEvent}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {article.latestEvent.office}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(article.latestEvent.eventDate)}
              </p>
            </div>
          )}

          <DetailSection title="Recipient">
            <p className="border-b border-border/50 px-3 py-2.5 text-sm font-medium">
              {recipient.name}
            </p>
            {recipient.mobile && (
              <RecipientLine icon={Phone}>{recipient.mobile}</RecipientLine>
            )}
            {recipient.email && (
              <RecipientLine icon={Mail}>{recipient.email}</RecipientLine>
            )}
            {hasAddress ? (
              <RecipientLine icon={MapPin}>
                <span className="block space-y-0.5">
                  {recipient.addressLine1 && (
                    <span className="block">{recipient.addressLine1}</span>
                  )}
                  {recipient.addressLine2 && (
                    <span className="block">{recipient.addressLine2}</span>
                  )}
                  {(recipient.city ||
                    recipient.state ||
                    recipient.pincode) && (
                    <span className="block">
                      {[recipient.city, recipient.state, recipient.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  )}
                </span>
              </RecipientLine>
            ) : (
              !recipient.mobile &&
              !recipient.email && (
                <p className="px-3 py-2.5 text-sm text-muted-foreground">
                  No contact details on file.
                </p>
              )
            )}
          </DetailSection>

          {hasBookingDetails && (
            <DetailSection title="Booking">
              {bookingDetails?.articleType && (
                <DetailRow label="Type" value={bookingDetails.articleType} />
              )}
              {bookingDetails?.originPincode && (
                <DetailRow
                  label="Origin PIN"
                  value={bookingDetails.originPincode}
                  mono
                />
              )}
              {bookingDetails?.destinationPincode && (
                <DetailRow
                  label="Destination PIN"
                  value={bookingDetails.destinationPincode}
                  mono
                />
              )}
              {bookingDetails?.tariff !== undefined && (
                <DetailRow label="Tariff" value={`₹${bookingDetails.tariff}`} />
              )}
              {article.deliveredAt && (
                <DetailRow
                  label="Delivered at"
                  value={formatDateTime(article.deliveredAt)}
                />
              )}
            </DetailSection>
          )}

          {attributeEntries.length > 0 && (
            <DetailSection title="Attributes">
              {attributeEntries.map(([key, value]) => (
                <DetailRow
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={value}
                  mono
                />
              ))}
            </DetailSection>
          )}

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tracking timeline
            </h3>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading events…
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Failed to load tracking events.
              </div>
            )}

            {!isLoading && !isError && events.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
                No tracking events yet.
              </div>
            )}

            {!isLoading && !isError && events.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <ol className="space-y-0">
                  {events.map((event, index) => (
                    <li key={event._id} className="flex gap-3">
                      <div className="flex w-3 shrink-0 flex-col items-center">
                        <span
                          className={cn(
                            'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2',
                            index === 0
                              ? 'border-primary bg-primary'
                              : 'border-border bg-background',
                          )}
                          aria-hidden
                        />
                        {index < events.length - 1 && (
                          <span
                            className="my-1 w-px flex-1 bg-border"
                            aria-hidden
                          />
                        )}
                      </div>
                      <div
                        className={cn(
                          'min-w-0 flex-1 pb-5',
                          index === events.length - 1 && 'pb-0',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-sm leading-snug',
                              index === 0
                                ? 'font-medium text-foreground'
                                : 'text-foreground/90',
                            )}
                          >
                            {event.rawEvent}
                          </p>
                          <ArticleStatusBadge
                            status={event.normalizedStatus}
                            className="shrink-0"
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {event.office}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateTime(event.eventDate)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-muted/20 px-4 py-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Sync tries
              </p>
              <p className="mt-0.5 font-mono text-sm tabular-nums">
                {article.syncAttempts}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Last synced
              </p>
              <p className="mt-0.5 text-xs leading-snug">
                {formatDate(article.lastSyncedAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Added
              </p>
              <p className="mt-0.5 text-xs leading-snug">
                {formatDate(article.createdAt)}
              </p>
            </div>
          </div>
        </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
  );
}

// ─── Empty / picker states ────────────────────────────────────────────────────

function NoContextState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
      <div className="rounded-full bg-muted p-4">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-foreground">No list selected</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isAdmin
            ? 'Choose a list from the Lists page, or pick one below after selecting a client.'
            : 'Select a list from the Lists page to view its articles.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/lists"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Lists <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {isAdmin && (
          <Link
            to="/clients"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            Go to Clients
          </Link>
        )}
      </div>
    </div>
  );
}

function RecentListCard({
  clientId,
  listId,
  isMostRecent,
}: {
  clientId: string;
  listId: string;
  isMostRecent: boolean;
}) {
  const navigate = useNavigate();
  const { data: list, isLoading, isError } = useGetListQuery(listId);

  if (isLoading) {
    return (
      <div className="flex h-[88px] items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !list) return null;

  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/articles?clientId=${clientId}&listId=${list._id}`)
      }
      className={cn(
        'rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/20',
        isMostRecent
          ? 'border-primary/50 ring-1 ring-primary/20'
          : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">{listDisplayName(list)}</p>
        <ListStatusBadge status={list.status} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{list.totalArticles.toLocaleString()} articles</span>
        {list.dispatchDate && (
          <span>Dispatch {formatDate(list.dispatchDate)}</span>
        )}
        {isMostRecent && (
          <span className="font-medium text-primary">Last opened</span>
        )}
      </div>
    </button>
  );
}

function ListPicker({
  clientId,
  isAdmin,
}: {
  clientId: string;
  isAdmin: boolean;
}) {
  const recentListIds = getRecentArticleListIds(clientId);
  const { data: clientsData } = useListClientsQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  const clientName =
    clientsData?.data.find((c) => c._id === clientId)?.name ??
    clientId.slice(-6);

  if (recentListIds.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
        <p className="font-medium">No recent lists</p>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? `Open a list for ${clientName} from the Lists page — it will appear here for quick access.`
            : 'Open a list from the Lists page — it will appear here for quick access.'}
        </p>
        <Link
          to={`/lists?clientId=${clientId}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Lists <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isAdmin ? (
            <>
              Recently viewed for{' '}
              <span className="font-medium text-foreground">{clientName}</span>
            </>
          ) : (
            'Recently viewed lists'
          )}
        </p>
        <Link
          to={`/lists?clientId=${clientId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Browse all lists
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recentListIds.map((id, index) => (
          <RecentListCard
            key={id}
            clientId={clientId}
            listId={id}
            isMostRecent={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

function ListContextBar({
  clientId,
  listId,
  isAdmin,
  totalArticles,
  onOpenPdfs,
}: {
  clientId: string;
  listId: string;
  isAdmin: boolean;
  totalArticles?: number;
  onOpenPdfs: () => void;
}) {
  const navigate = useNavigate();
  const { data: list } = usePollListQuery(listId);
  const { data: clientsData } = useListClientsQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  const clientName = clientsData?.data.find((c) => c._id === clientId)?.name;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2 text-muted-foreground"
        onClick={() => navigate(`/articles?clientId=${clientId}`)}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Recent lists
      </Button>

      <div className="hidden h-4 w-px bg-border sm:block" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium truncate">
            {list ? listDisplayName(list) : 'Loading list…'}
          </p>
          {list && <ListStatusBadge status={list.status} />}
        </div>
        <p className="text-xs text-muted-foreground">
          {isAdmin && clientName && <span>{clientName} · </span>}
          {list?.dispatchDate && (
            <span>Dispatch {formatDate(list.dispatchDate)} · </span>
          )}
          {(totalArticles ?? list?.totalArticles ?? 0).toLocaleString()}{' '}
          articles
        </p>
        {list?.status === 'SYNCING' && list.syncProgress && (
          <div className="mt-2 max-w-xs">
            <OperationProgressBar
              variant="sync"
              percent={syncPercent(list)}
              label={`${list.syncProgress.processedCount.toLocaleString()} / ${list.syncProgress.totalArticles.toLocaleString()} articles synced`}
            />
          </div>
        )}
      </div>

      <SearchableListSelect
        clientId={clientId}
        value={listId}
        onChange={(id) =>
          navigate(`/articles?clientId=${clientId}&listId=${id}`)
        }
        placeholder="Switch list"
        className="w-[220px]"
      />

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 shrink-0"
        onClick={onOpenPdfs}
      >
        <FileText className="h-3.5 w-3.5" />
        PDFs
        {(totalArticles ?? list?.totalArticles ?? 0) > 0 && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary tabular-nums">
            {(totalArticles ?? list?.totalArticles ?? 0).toLocaleString()}
          </span>
        )}
      </Button>
    </div>
  );
}

function buildSearchPlaceholder(
  hasLoanAccount: boolean,
  hasCustomerId: boolean,
): string {
  const fields = ['article number', 'recipient'];
  if (hasLoanAccount) fields.push('loan A/C');
  if (hasCustomerId) fields.push('customer ID');
  const last = fields.pop()!;
  return fields.length > 0
    ? `Search ${fields.join(', ')} or ${last}…`
    : `Search ${last}…`;
}

function isArticleSyncSelectable(article: Article): boolean {
  return !article.isTerminal && !article.indiaPostTrackingExpired;
}

// ─── List articles view (remounts when client/list changes) ───────────────────

function ArticlesListView({
  clientId,
  listId,
  isAdmin,
}: {
  clientId: string;
  listId: string;
  isAdmin: boolean;
}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    NormalizedStatus | undefined
  >();
  const [syncFailedOnly, setSyncFailedOnly] = useState(false);
  const [nonTerminalOnly, setNonTerminalOnly] = useState(false);
  const [selectedSyncIds, setSelectedSyncIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [pdfsOpen, setPdfsOpen] = useState(
    () => new URLSearchParams(window.location.search).get('pdfs') === '1',
  );
  const [exporting, setExporting] = useState(false);
  const [allListSyncableSelected, setAllListSyncableSelected] = useState(false);
  const [selectingAllSyncable, setSelectingAllSyncable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: listMeta } = usePollListQuery(listId);

  const [triggerArticlesSync, { isLoading: syncingSelected }] =
    useTriggerArticlesSyncMutation();
  const [fetchSyncableIds] = useLazyListSyncableArticleIdsQuery();

  const { data, isLoading, isError, isFetching, refetch } =
    useListArticlesQuery(
      {
        clientId,
        listId,
        status: statusFilter,
        search: search || undefined,
        syncFailed: syncFailedOnly || undefined,
        nonTerminal: nonTerminalOnly || undefined,
        page,
        limit: 25,
      },
      { skip: false },
    );

  const articles = data?.data ?? [];
  const syncableOnPage = articles.filter(isArticleSyncSelectable);
  const allSyncablePageSelected =
    syncableOnPage.length > 0 &&
    syncableOnPage.every((a) => selectedSyncIds.has(a._id));

  const listNonTerminalCount = useMemo(() => {
    if (!listMeta) return 0;
    const terminal = TERMINAL_STATUSES.reduce(
      (sum, status) => sum + (listMeta.stats?.[status] ?? 0),
      0,
    );
    return Math.max(0, listMeta.totalArticles - terminal);
  }, [listMeta]);

  const isListSyncing = listMeta?.status === 'SYNCING';

  useEffect(() => {
    setSelectedSyncIds(new Set());
    setAllListSyncableSelected(false);
  }, [clientId, listId, search, statusFilter, syncFailedOnly, nonTerminalOnly]);

  const hasActiveFilters = Boolean(
    searchInput || statusFilter || syncFailedOnly || nonTerminalOnly,
  );

  const articleFilterActiveCount = [
    statusFilter,
    syncFailedOnly,
    nonTerminalOnly,
  ].filter(Boolean).length;

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setStatusFilter(undefined);
    setSyncFailedOnly(false);
    setNonTerminalOnly(false);
    setPage(1);
  }

  function toggleSyncSelection(articleId: string) {
    setAllListSyncableSelected(false);
    setSelectedSyncIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  }

  function toggleAllSyncableOnPage() {
    setAllListSyncableSelected(false);
    setSelectedSyncIds((prev) => {
      const next = new Set(prev);
      if (allSyncablePageSelected) {
        for (const a of syncableOnPage) next.delete(a._id);
      } else {
        for (const a of syncableOnPage) next.add(a._id);
      }
      return next;
    });
  }

  const headerCheckboxChecked = nonTerminalOnly
    ? allListSyncableSelected
    : allSyncablePageSelected;

  async function handleToggleAllSyncable() {
    if (isListSyncing || selectingAllSyncable) return;

    if (nonTerminalOnly) {
      if (allListSyncableSelected) {
        setSelectedSyncIds(new Set());
        setAllListSyncableSelected(false);
        return;
      }

      setSelectingAllSyncable(true);
      try {
        const result = await fetchSyncableIds({
          clientId,
          listId,
          status: statusFilter,
          search: search || undefined,
          syncFailed: syncFailedOnly || undefined,
          nonTerminal: true,
        }).unwrap();

        setSelectedSyncIds(new Set(result.articleIds));
        setAllListSyncableSelected(result.total > 0);
        if (result.total === 0) {
          toast.info('No syncable non-terminal articles in this list');
        }
      } catch {
        toast.error('Failed to select all articles');
      } finally {
        setSelectingAllSyncable(false);
      }
      return;
    }

    toggleAllSyncableOnPage();
  }

  async function handleSyncSelected() {
    if (selectedSyncIds.size === 0) return;
    try {
      const result = await triggerArticlesSync(
        allListSyncableSelected
          ? {
              clientId,
              listId,
              syncFilters: {
                status: statusFilter,
                search: search || undefined,
                syncFailed: syncFailedOnly || undefined,
                nonTerminal: true,
              },
            }
          : {
              clientId,
              listId,
              articleIds: [...selectedSyncIds],
            },
      ).unwrap();
      toast.success(
        `Sync started for ${result.enqueued.toLocaleString()} article${result.enqueued !== 1 ? 's' : ''}`,
      );
      setSelectedSyncIds(new Set());
      setAllListSyncableSelected(false);
    } catch (err) {
      toast.apiError(err, 'Failed to start sync for selected articles');
    }
  }

  const hasLoanAccount = data?.data.some((a) => a.attributes?.loan_account_no);
  const hasCustomerId = data?.data.some((a) => a.attributes?.customer_id);
  const extraCols = (hasLoanAccount ? 1 : 0) + (hasCustomerId ? 1 : 0);
  const statusLabel = statusFilter
    ? (STATUS_CONFIG[statusFilter]?.label ?? statusFilter)
    : 'All Statuses';
  const searchPlaceholder = buildSearchPlaceholder(
    Boolean(hasLoanAccount),
    Boolean(hasCustomerId),
  );

  const pdfArticleNumbers = useMemo(() => {
    const set = new Set<string>();
    for (const a of data?.data ?? []) {
      set.add(a.articleNumber.toUpperCase());
    }
    return set;
  }, [data?.data]);

  const isImporting = listMeta?.status === 'IMPORTING';

  async function handleExportFiltered() {
    setExporting(true);
    try {
      await downloadListExport(listId, listMeta?.name ?? 'list', {
        status: statusFilter,
        syncFailed: syncFailedOnly || undefined,
      });
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <ListContextBar
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
        totalArticles={data?.meta?.total}
        onOpenPdfs={() => setPdfsOpen(true)}
      />

      <ListPdfsDialog
        open={pdfsOpen}
        onClose={() => setPdfsOpen(false)}
        listId={listId}
        clientId={clientId}
        listName={listMeta ? listDisplayName(listMeta) : 'List'}
        listSlug={listMeta?.slug ?? 'list'}
        isAdmin={isAdmin}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            aria-label={searchPlaceholder}
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>

        <FilterSheetButton
          activeCount={articleFilterActiveCount}
          onClear={clearFilters}
          clearDisabled={!hasActiveFilters}
          description="Filter articles by delivery status or sync state."
        >
          <FilterField label="Status">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between gap-1.5">
                  {statusLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter ?? 'all'}
                  onValueChange={(v) => {
                    setStatusFilter(
                      v === 'all' ? undefined : (v as NormalizedStatus),
                    );
                    setPage(1);
                  }}
                >
                  <DropdownMenuRadioItem value="all">
                    All Statuses
                  </DropdownMenuRadioItem>
                  {ALL_STATUSES.map((s) => (
                    <DropdownMenuRadioItem key={s} value={s}>
                      {STATUS_CONFIG[s]?.label ?? s}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </FilterField>

          <FilterField
            label="Sync failed only"
            hint={
              <HelpTooltip content="Show only articles where the most recent India Post sync attempt failed." />
            }
          >
            <Button
              variant={syncFailedOnly ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-1.5"
              onClick={() => {
                setSyncFailedOnly((v) => !v);
                setPage(1);
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {syncFailedOnly ? 'Enabled' : 'Off'}
            </Button>
          </FilterField>

          <FilterField
            label="Non-terminal only"
            hint={
              <HelpTooltip content="Show articles still in transit (not delivered or RTO)." />
            }
          >
            <Button
              variant={nonTerminalOnly ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-1.5"
              onClick={() => {
                setNonTerminalOnly((v) => !v);
                setPage(1);
              }}
            >
              <Truck className="h-3.5 w-3.5" />
              Non-terminal
              {listNonTerminalCount > 0 && (
                <span className="tabular-nums text-xs opacity-80">
                  ({listNonTerminalCount.toLocaleString()})
                </span>
              )}
            </Button>
          </FilterField>
        </FilterSheetButton>

        {selectedSyncIds.size > 0 && (
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            disabled={syncingSelected || isListSyncing}
            onClick={handleSyncSelected}
          >
            {syncingSelected ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Sync selected ({selectedSyncIds.size})
          </Button>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          disabled={exporting || (data?.meta?.total ?? 0) === 0}
          title={
            (data?.meta?.total ?? 0) === 0
              ? 'No articles to export'
              : hasActiveFilters
                ? 'Export filtered articles'
                : 'Export all articles'
          }
          onClick={handleExportFiltered}
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export
        </Button>

        {data?.meta && (
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {data.meta.total.toLocaleString()} article
            {data.meta.total !== 1 ? 's' : ''}
            {hasActiveFilters && ' matching filters'}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="font-medium">Failed to load articles</p>
            <p className="text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-3 py-2.5">
                  {selectingAllSyncable ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  ) : (
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-border"
                      checked={headerCheckboxChecked}
                      onChange={() => void handleToggleAllSyncable()}
                      disabled={
                        (nonTerminalOnly
                          ? listNonTerminalCount === 0
                          : syncableOnPage.length === 0) || isListSyncing
                      }
                      aria-label={
                        nonTerminalOnly
                          ? 'Select all syncable non-terminal articles in this list'
                          : 'Select all syncable articles on this page'
                      }
                    />
                  )}
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Article #
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Recipient
                </th>
                {hasLoanAccount && (
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Loan A/C
                  </th>
                )}
                {hasCustomerId && (
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Customer ID
                  </th>
                )}
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Latest Event
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Last Synced
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Tries
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={7 + extraCols}
                    className="px-4 py-12 text-center"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!isLoading && articles.length === 0 && (
                <tr>
                  <td
                    colSpan={7 + extraCols}
                    className="px-4 py-12 text-center"
                  >
                    {isImporting && !hasActiveFilters ? (
                      <div className="mx-auto max-w-sm space-y-3">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                        <p className="font-medium">Import in progress</p>
                        <p className="text-sm text-muted-foreground">
                          Articles appear here as rows are processed. You can
                          leave this page — import continues on the server.
                        </p>
                        {listMeta?.importProgress && (
                          <OperationProgressBar
                            variant="import"
                            percent={importPercent(listMeta)}
                            label={`${listMeta.importProgress.processedRows.toLocaleString()} / ${listMeta.importProgress.totalRows.toLocaleString()} rows`}
                            className="mx-auto max-w-[200px]"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-muted-foreground">
                          {hasActiveFilters
                            ? 'No articles match your filters.'
                            : 'No articles in this list yet.'}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-1 h-auto p-0"
                            onClick={clearFilters}
                          >
                            Clear filters
                          </Button>
                        )}
                        {syncFailedOnly && (
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-1 h-auto p-0"
                            asChild
                          >
                            <Link
                              to={`/sync?tab=failed&clientId=${clientId}&listId=${listId}`}
                            >
                              View on Sync page
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              )}
              {articles.map((article) => {
                const syncSelectable = isArticleSyncSelectable(article);
                return (
                <tr
                  key={article._id}
                  className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-muted/20 ${
                    selectedArticle?._id === article._id ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-border disabled:cursor-not-allowed disabled:opacity-40"
                      checked={selectedSyncIds.has(article._id)}
                      disabled={!syncSelectable || isListSyncing}
                      onChange={() => toggleSyncSelection(article._id)}
                      aria-label={
                        syncSelectable
                          ? `Select ${article.articleNumber} for sync`
                          : `${article.articleNumber} cannot be synced`
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {article.articleNumber}
                      {pdfArticleNumbers.has(
                        article.articleNumber.toUpperCase(),
                      ) && (
                        <FileText
                          className="h-3 w-3 shrink-0 text-primary"
                          aria-label="PDF available"
                        />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium leading-tight">
                      {article.recipient.name}
                    </p>
                    {article.recipient.city && (
                      <p className="text-xs text-muted-foreground">
                        {article.recipient.city}
                      </p>
                    )}
                  </td>
                  {hasLoanAccount && (
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {article.attributes?.loan_account_no ?? '—'}
                    </td>
                  )}
                  {hasCustomerId && (
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {article.attributes?.customer_id ?? '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ArticleStatusBadge status={article.normalizedStatus} />
                      {article.syncError && (
                        <span
                          className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
                          title={article.syncError}
                        >
                          Sync err
                        </span>
                      )}
                      {isAdmin && article.indiaPostTrackingExpired && (
                        <span
                          className="rounded border border-amber-300/60 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                          title="India Post tracking expired (~60 days after dispatch)"
                        >
                          IP expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate"
                    title={article.latestEvent?.rawEvent}
                  >
                    {article.latestEvent?.rawEvent ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(article.lastSyncedAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                    {article.syncAttempts}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          </div>
        )}

        {!isError && data?.meta && data.meta.totalPages > 1 && (
          <div className="border-t border-border px-4 py-3">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      {selectedArticle && (
        <ArticleSheet
          article={selectedArticle}
          isAdmin={isAdmin}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlClientId = searchParams.get('clientId') ?? '';
  const listId = searchParams.get('listId') ?? undefined;
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const customerClientId = !isAdmin ? (authUser?.clientId ?? '') : '';
  const clientId = urlClientId || customerClientId;

  useEffect(() => {
    const saved = loadArticlesContext();
    if (!saved?.clientId) return;

    if (!isAdmin || urlClientId) return;

    const next = new URLSearchParams(searchParams);
    next.set('clientId', saved.clientId);
    setSearchParams(next, { replace: true });
    // Restore client only — list picker card view is shown until user picks a list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!clientId) return;
    saveArticlesContext(clientId, listId);
  }, [clientId, listId]);

  if (!clientId) {
    return (
      <div className="space-y-5">
        <NoContextState isAdmin={isAdmin} />
      </div>
    );
  }

  if (!listId) {
    return (
      <div className="space-y-5">
        <ListPicker clientId={clientId} isAdmin={isAdmin} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ArticlesListView
        key={`${clientId}-${listId}`}
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
