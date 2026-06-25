import { useEffect, useMemo, useState } from 'react';
import {
  useListArticlesQuery,
  useLazyListSyncableArticleIdsQuery,
} from '@/store/api/articlesApi';
import { usePollListQuery } from '@/hooks/usePollListQuery';
import { useTriggerArticlesSyncMutation } from '@/store/api/syncApi';
import { TERMINAL_STATUSES } from '@/types';
import { toast } from '@/lib/toast';
import { downloadListExport } from '@/lib/exportList';
import { listDisplayName } from '@/lib/listNaming';
import type { Article, NormalizedStatus } from '@/types';
import {
  buildSearchPlaceholder,
  isArticleSyncSelectable,
} from '@/pages/articles/articlesPage.utils';

export function useArticlesListView(clientId: string, listId: string) {
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

  function handleSearchInputChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function handleStatusFilterChange(status: NormalizedStatus | undefined) {
    setStatusFilter(status);
    setPage(1);
  }

  function handleSyncFailedOnlyToggle() {
    setSyncFailedOnly((v) => !v);
    setPage(1);
  }

  function handleNonTerminalOnlyToggle() {
    setNonTerminalOnly((v) => !v);
    setPage(1);
  }

  return {
    page,
    setPage,
    searchInput,
    searchPlaceholder,
    handleSearchInputChange,
    statusFilter,
    handleStatusFilterChange,
    syncFailedOnly,
    handleSyncFailedOnlyToggle,
    nonTerminalOnly,
    handleNonTerminalOnlyToggle,
    listNonTerminalCount,
    selectedSyncIds,
    selectedArticle,
    setSelectedArticle,
    pdfsOpen,
    setPdfsOpen,
    exporting,
    articleFilterActiveCount,
    hasActiveFilters,
    clearFilters,
    toggleSyncSelection,
    headerCheckboxChecked,
    selectingAllSyncable,
    handleToggleAllSyncable,
    syncingSelected,
    isListSyncing,
    handleSyncSelected,
    hasLoanAccount,
    hasCustomerId,
    extraCols,
    pdfArticleNumbers,
    isImporting,
    handleExportFiltered,
    listMeta,
    listDisplayName: listMeta ? listDisplayName(listMeta) : 'List',
    data,
    articles,
    syncableOnPage,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
}
