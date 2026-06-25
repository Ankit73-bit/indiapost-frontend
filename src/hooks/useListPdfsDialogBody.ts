import { useDeferredValue, useState } from 'react';
import { useZipDownload } from '@/components/lists/useZipDownload';
import {
  LIST_PDFS_LARGE_LIST_THRESHOLD,
  LIST_PDFS_PAGE_SIZE,
} from '@/components/lists/listPdfsDialog.constants';
import type { UseListPdfsDialogBodyOptions } from '@/components/lists/listPdfsDialog.types';
import { estimateBulkPdfMinutes } from '@/components/lists/listPdfsDialog.utils';
import { getApiErrorMessage } from '@/lib/helpers';
import { downloadPdfFile } from '@/lib/pdfFiles';
import { toast } from '@/lib/toast';
import { useListListPdfsQuery } from '@/store/api/listsApi';
import type { PdfArticleItem } from '@/types';

export function useListPdfsDialogBody({
  listId,
  clientId,
  listName,
  onViewingArticleChange,
}: UseListPdfsDialogBodyOptions) {
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
    limit: LIST_PDFS_PAGE_SIZE,
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
    if (total >= LIST_PDFS_LARGE_LIST_THRESHOLD) {
      const ok = window.confirm(
        `This list has ${total.toLocaleString()} articles. Generating all PDFs may take ${estimateBulkPdfMinutes(total)}. You can close this dialog and track progress in the banner at the top. Continue?`,
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

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const totalArticles = summary?.totalArticles ?? 0;

  return {
    search,
    page,
    selected,
    busyAction,
    listZipTask,
    isZipBusy,
    pdfMeta,
    isLoading,
    isFetching,
    isSearchPending,
    articles,
    allPageSelected,
    totalArticles,
    toggleAllOnPage,
    toggleOne,
    clearSelection,
    handleView,
    handleDownloadOne,
    handleDownloadSelected,
    handleDownloadAll,
    handleSearchChange,
    setPage,
    refetch,
    cancelZipDownload,
  };
}
