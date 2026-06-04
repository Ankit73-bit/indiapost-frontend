import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import {
  useListArticlesQuery,
  useGetArticleEventsQuery,
} from '@/store/api/articlesApi';
import { ALL_STATUSES } from '@/types';
import { formatDate, formatDateTime } from '@/lib/helpers';
import type { Article, NormalizedStatus } from '@/types';

// ─── Article detail sheet ─────────────────────────────────────────────────────

function ArticleSheet({
  article,
  onClose,
}: {
  article: Article;
  onClose: () => void;
}) {
  const { data: eventsData, isLoading } = useGetArticleEventsQuery({
    articleId: article._id,
    clientId: article.clientId,
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-mono text-base">
            {article.articleNumber}
          </SheetTitle>
        </SheetHeader>

        {/* Status + flags */}
        <div className="mb-4 flex items-center gap-2">
          <ArticleStatusBadge status={article.normalizedStatus} />
          {article.isTerminal && (
            <span className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              Terminal
            </span>
          )}
        </div>

        {/* Recipient */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recipient
          </h3>
          <div className="rounded border border-border bg-muted/20 px-3 py-2 space-y-0.5 text-sm">
            <p className="font-medium">{article.recipient.name}</p>
            {article.recipient.mobile && (
              <p className="text-muted-foreground">
                {article.recipient.mobile}
              </p>
            )}
            {article.recipient.addressLine1 && (
              <p className="text-muted-foreground">
                {article.recipient.addressLine1}
              </p>
            )}
            {article.recipient.addressLine2 && (
              <p className="text-muted-foreground">
                {article.recipient.addressLine2}
              </p>
            )}
            {(article.recipient.city ||
              article.recipient.state ||
              article.recipient.pincode) && (
              <p className="text-muted-foreground">
                {[
                  article.recipient.city,
                  article.recipient.state,
                  article.recipient.pincode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </section>

        {/* Booking details */}
        {article.bookingDetails && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Booking Details
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              {article.bookingDetails.articleType && (
                <>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{article.bookingDetails.articleType}</dd>
                </>
              )}
              {article.bookingDetails.originPincode && (
                <>
                  <dt className="text-muted-foreground">Origin PIN</dt>
                  <dd className="font-mono">
                    {article.bookingDetails.originPincode}
                  </dd>
                </>
              )}
              {article.bookingDetails.destinationPincode && (
                <>
                  <dt className="text-muted-foreground">Dest PIN</dt>
                  <dd className="font-mono">
                    {article.bookingDetails.destinationPincode}
                  </dd>
                </>
              )}
              {article.bookingDetails.tariff !== undefined && (
                <>
                  <dt className="text-muted-foreground">Tariff</dt>
                  <dd>₹{article.bookingDetails.tariff}</dd>
                </>
              )}
              {article.deliveredAt && (
                <>
                  <dt className="text-muted-foreground">Delivered At</dt>
                  <dd>{formatDateTime(article.deliveredAt)}</dd>
                </>
              )}
            </dl>
          </section>
        )}

        {/* Custom attributes */}
        {article.attributes && Object.keys(article.attributes).length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Attributes
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              {Object.entries(article.attributes).map(([k, v]) => (
                <>
                  <dt
                    key={`k-${k}`}
                    className="text-muted-foreground capitalize"
                  >
                    {k}
                  </dt>
                  <dd key={`v-${k}`}>{v}</dd>
                </>
              ))}
            </dl>
          </section>
        )}

        {/* Tracking timeline */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tracking Events
          </h3>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {eventsData?.data.length === 0 && (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          )}
          <ol className="relative border-l border-border pl-5 space-y-4">
            {eventsData?.data.map((event) => (
              <li key={event._id} className="relative">
                <div className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border-2 border-border bg-background" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{event.rawEvent}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.office}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <ArticleStatusBadge status={event.normalizedStatus} />
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(event.eventDate)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Meta */}
        <div className="mt-6 border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
          <p>Sync attempts: {article.syncAttempts}</p>
          <p>Last synced: {formatDateTime(article.lastSyncedAt)}</p>
          <p>Added: {formatDateTime(article.createdAt)}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ArticlesPage() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') ?? '';
  const listId = searchParams.get('listId') ?? undefined;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    NormalizedStatus | undefined
  >();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data, isLoading } = useListArticlesQuery(
    {
      clientId,
      listId,
      status: statusFilter,
      search: search || undefined,
      page,
      limit: 25,
    },
    { skip: !clientId },
  );

  if (!clientId) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground">
        Select a client from the Clients page to view articles.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Articles"
        description="Individual postal articles and their tracking status."
      />

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search article number or recipient…"
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              {statusFilter ?? 'All Statuses'}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={!statusFilter}
              onCheckedChange={() => {
                setStatusFilter(undefined);
                setPage(1);
              }}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            {ALL_STATUSES.map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={statusFilter === s}
                onCheckedChange={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
              >
                {s}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(search || statusFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatusFilter(undefined);
              setPage(1);
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Article #
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Recipient
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Latest Event
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Last Synced
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                Attempts
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No articles found.
                </td>
              </tr>
            )}
            {data?.data.map((article) => (
              <tr
                key={article._id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <td className="px-4 py-3 font-mono text-xs">
                  {article.articleNumber}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{article.recipient.name}</p>
                  {article.recipient.city && (
                    <p className="text-xs text-muted-foreground">
                      {article.recipient.city}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ArticleStatusBadge status={article.normalizedStatus} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                  {article.latestEvent?.rawEvent ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(article.lastSyncedAt)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {article.syncAttempts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      {selectedArticle && (
        <ArticleSheet
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
