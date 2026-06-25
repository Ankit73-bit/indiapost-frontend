import { LIST_PDFS_LARGE_LIST_THRESHOLD } from '@/components/lists/listPdfsDialog.constants';
import { estimateBulkPdfMinutes } from '@/components/lists/listPdfsDialog.utils';

interface ListPdfsDialogLargeListBannerProps {
  totalArticles: number;
}

export function ListPdfsDialogLargeListBanner({
  totalArticles,
}: ListPdfsDialogLargeListBannerProps) {
  if (totalArticles < LIST_PDFS_LARGE_LIST_THRESHOLD) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      Large list: bulk ZIP for {totalArticles.toLocaleString()} articles may take{' '}
      {estimateBulkPdfMinutes(totalArticles)}. Prefer selecting a subset, or run the
      download in the background via the top banner.
    </div>
  );
}
