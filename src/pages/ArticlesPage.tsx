import { Fragment, useEffect, useState } from 'react';
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
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  ArticleStatusBadge,
  ListStatusBadge,
} from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import {
  useListArticlesQuery,
  useGetArticleEventsQuery,
} from '@/store/api/articlesApi';
import { useGetListQuery, useListListsQuery } from '@/store/api/listsApi';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useAppSelector } from '@/store';
import { ALL_STATUSES } from '@/types';
import { formatDate, formatDateTime, STATUS_CONFIG } from '@/lib/helpers';
import type { Article, NormalizedStatus } from '@/types';

// ─── Article detail sheet ─────────────────────────────────────────────────────

function ArticleSheet({
  article,
  onClose,
}: {
  article: Article;
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

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-mono text-base break-all">
            {article.articleNumber}
          </SheetTitle>
        </SheetHeader>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ArticleStatusBadge status={article.normalizedStatus} />
          {article.isTerminal && (
            <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Terminal
            </span>
          )}
        </div>

        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recipient
          </h3>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 space-y-0.5 text-sm">
            <p className="font-medium">{article.recipient.name}</p>
            {article.recipient.mobile && (
              <p className="text-muted-foreground">
                {article.recipient.mobile}
              </p>
            )}
            {article.recipient.email && (
              <p className="text-muted-foreground">{article.recipient.email}</p>
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

        {article.attributes && Object.keys(article.attributes).length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Attributes
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              {Object.entries(article.attributes).map(([k, v]) => (
                <Fragment key={k}>
                  <dt className="text-muted-foreground capitalize">
                    {k.replace(/_/g, ' ')}
                  </dt>
                  <dd className="font-mono text-xs break-all">{v}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tracking Events
          </h3>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading events…
            </div>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load events.</p>
          )}
          {!isLoading && !isError && eventsData?.data.length === 0 && (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          )}
          {!isLoading && !isError && (eventsData?.data.length ?? 0) > 0 && (
            <ol className="space-y-0">
              {eventsData?.data.map((event, index) => (
                <li key={event._id} className="relative pl-6 pb-5 last:pb-0">
                  {index < (eventsData?.data.length ?? 0) - 1 && (
                    <span
                      className="absolute left-[4.5px] top-3 bottom-0 w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <span
                    className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background"
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{event.rawEvent}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.office}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <ArticleStatusBadge status={event.normalizedStatus} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(event.eventDate)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="mt-6 border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
          <p>Sync attempts: {article.syncAttempts}</p>
          <p>Last synced: {formatDateTime(article.lastSyncedAt)}</p>
          <p>Added: {formatDateTime(article.createdAt)}</p>
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

function ListPicker({
  clientId,
  isAdmin,
}: {
  clientId: string;
  isAdmin: boolean;
}) {
  const navigate = useNavigate();
  const {
    data: listsData,
    isLoading,
    isError,
  } = useListListsQuery({
    clientId,
    limit: 100,
  });
  const { data: clientsData } = useListClientsQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  const clientName =
    clientsData?.data.find((c) => c._id === clientId)?.name ??
    clientId.slice(-6);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 text-center px-6">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">Failed to load lists.</p>
      </div>
    );
  }

  const lists = listsData?.data ?? [];

  if (lists.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
        <p className="font-medium">No lists found</p>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? `Create a list for ${clientName} to start tracking articles.`
            : 'Create a list to start tracking articles.'}
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
      <p className="text-sm text-muted-foreground">
        {isAdmin ? (
          <>
            Showing lists for{' '}
            <span className="font-medium text-foreground">{clientName}</span>.
            Select a list to view its articles.
          </>
        ) : (
          'Select a list to view its articles.'
        )}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <button
            key={list._id}
            type="button"
            onClick={() =>
              navigate(`/articles?clientId=${clientId}&listId=${list._id}`)
            }
            className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/20"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-snug">{list.name}</p>
              <ListStatusBadge status={list.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{list.totalArticles.toLocaleString()} articles</span>
              {list.dispatchDate && (
                <span>Dispatch {formatDate(list.dispatchDate)}</span>
              )}
            </div>
          </button>
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
}: {
  clientId: string;
  listId: string;
  isAdmin: boolean;
  totalArticles?: number;
}) {
  const navigate = useNavigate();
  const { data: list } = useGetListQuery(listId);
  const { data: listsData } = useListListsQuery({ clientId, limit: 100 });
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
        onClick={() =>
          navigate(`/lists${isAdmin ? `?clientId=${clientId}` : ''}`)
        }
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Lists
      </Button>

      <div className="hidden h-4 w-px bg-border sm:block" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium truncate">
            {list?.name ?? 'Loading list…'}
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
      </div>

      {(listsData?.data.length ?? 0) > 1 && (
        <Select
          value={listId}
          onValueChange={(id) =>
            navigate(`/articles?clientId=${clientId}&listId=${id}`)
          }
        >
          <SelectTrigger className="h-8 w-[180px] text-xs">
            <SelectValue placeholder="Switch list" />
          </SelectTrigger>
          <SelectContent>
            {listsData?.data.map((l) => (
              <SelectItem key={l._id} value={l._id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching, refetch } =
    useListArticlesQuery(
      {
        clientId,
        listId,
        status: statusFilter,
        search: search || undefined,
        page,
        limit: 25,
      },
      { skip: false },
    );

  const hasActiveFilters = Boolean(searchInput || statusFilter);

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setStatusFilter(undefined);
    setPage(1);
  }

  const hasLoanAccount = data?.data.some((a) => a.attributes?.loan_account_no);
  const hasCustomerId = data?.data.some((a) => a.attributes?.customer_id);
  const extraCols = (hasLoanAccount ? 1 : 0) + (hasCustomerId ? 1 : 0);
  const statusLabel = statusFilter
    ? (STATUS_CONFIG[statusFilter]?.label ?? statusFilter)
    : 'All Statuses';

  return (
    <>
      <ListContextBar
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
        totalArticles={data?.meta?.total}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search article number or recipient…"
            className="pl-8"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            aria-label="Search articles"
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5" />
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

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}

        {data?.meta && (
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {data.meta.total.toLocaleString()} article
            {data.meta.total !== 1 ? 's' : ''}
            {hasActiveFilters && ' matching filters'}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
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
                    colSpan={6 + extraCols}
                    className="px-4 py-12 text-center"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!isLoading && data?.data.length === 0 && (
                <tr>
                  <td
                    colSpan={6 + extraCols}
                    className="px-4 py-12 text-center"
                  >
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
                  </td>
                </tr>
              )}
              {data?.data.map((article) => (
                <tr
                  key={article._id}
                  className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-muted/20 ${
                    selectedArticle?._id === article._id ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {article.articleNumber}
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
                    <ArticleStatusBadge status={article.normalizedStatus} />
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
              ))}
            </tbody>
          </table>
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
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ArticlesPage() {
  const [searchParams] = useSearchParams();
  const urlClientId = searchParams.get('clientId') ?? '';
  const listId = searchParams.get('listId') ?? undefined;
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const customerClientId = !isAdmin ? (authUser?.clientId ?? '') : '';
  const clientId = urlClientId || customerClientId;

  if (!clientId) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Articles"
          description="Individual postal articles and their tracking status."
        />
        <NoContextState isAdmin={isAdmin} />
      </div>
    );
  }

  if (!listId) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Articles"
          description="Individual postal articles and their tracking status."
        />
        <ListPicker clientId={clientId} isAdmin={isAdmin} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Articles"
        description="Individual postal articles and their tracking status."
      />
      <ArticlesListView
        key={`${clientId}-${listId}`}
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
