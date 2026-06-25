import { OperationProgressBar } from '@/components/shared/OperationProgressBar';
import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { importPercent, syncPercent } from '@/lib/listProgress';
import type { List } from '@/types';

export function ListsPageTableStatusCell({ list }: { list: List }) {
  return (
    <td className="px-4 py-3">
      <ListStatusBadge status={list.status} />
      {list.status === 'IMPORTING' && list.importProgress && (
        <div className="mt-2">
          <OperationProgressBar
            variant="import"
            percent={importPercent(list)}
            label={`${list.importProgress.processedRows.toLocaleString()} / ${list.importProgress.totalRows.toLocaleString()} rows${
              (list.importProgress.failedRows ?? 0) > 0
                ? ` · ${list.importProgress.failedRows} failed`
                : ''
            }`}
          />
        </div>
      )}
      {list.status === 'SYNCING' && list.syncProgress && (
        <div className="mt-2">
          <OperationProgressBar
            variant="sync"
            percent={syncPercent(list)}
            label={`${list.syncProgress.processedCount.toLocaleString()} / ${list.syncProgress.totalArticles.toLocaleString()} articles${
              list.syncProgress.failedCount > 0
                ? ` · ${list.syncProgress.failedCount} failed`
                : ''
            }`}
          />
        </div>
      )}
      {list.importError && (
        <p
          className="mt-1 max-w-xs text-xs text-destructive"
          title={list.lastImportResult?.errorRows?.[0]?.reason ?? list.importError}
        >
          {list.importError}
        </p>
      )}
    </td>
  );
}
