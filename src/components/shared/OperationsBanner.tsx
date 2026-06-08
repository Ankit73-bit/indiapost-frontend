import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import { useListListsQuery } from '@/store/api/listsApi';
import type { List } from '@/types';

function importPercent(list: List): number {
  const p = list.importProgress;
  if (!p || p.totalRows <= 0) return 0;
  return Math.min(100, Math.round((p.processedRows / p.totalRows) * 100));
}

function syncPercent(list: List): number {
  const p = list.syncProgress;
  if (!p || p.totalArticles <= 0) return 0;
  return Math.min(100, Math.round((p.processedCount / p.totalArticles) * 100));
}

export function OperationsBanner() {
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';
  const clientId = !isAdmin ? (user?.clientId ?? undefined) : undefined;

  const [poll, setPoll] = useState(false);

  const { data } = useListListsQuery(
    { clientId, limit: 100 },
    { pollingInterval: poll ? 3000 : 0 },
  );

  const importing = data?.data.filter((l) => l.status === 'IMPORTING') ?? [];
  const syncing = data?.data.filter((l) => l.status === 'SYNCING') ?? [];
  const activeCount = importing.length + syncing.length;

  useEffect(() => {
    setPoll(activeCount > 0);
  }, [activeCount]);

  if (activeCount === 0) return null;

  return (
    <div className="border-b border-border bg-muted/30 px-6 py-2.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          Background operations ({activeCount})
        </span>

        {importing.map((list) => (
          <Link
            key={list._id}
            to={`/lists${isAdmin ? `?clientId=${list.clientId}` : ''}`}
            className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100 transition-colors"
          >
            <span className="font-medium">{list.name}</span>
            <span className="text-amber-800/80">
              Importing
              {list.importProgress
                ? ` ${importPercent(list)}%`
                : ''}
            </span>
          </Link>
        ))}

        {syncing.map((list) => (
          <Link
            key={list._id}
            to={
              isAdmin
                ? `/sync?listId=${list._id}&clientId=${list.clientId}`
                : '/lists'
            }
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-900 hover:bg-blue-100 transition-colors"
          >
            <span className="font-medium">{list.name}</span>
            <span className="text-blue-800/80">
              Syncing
              {list.syncProgress ? ` ${syncPercent(list)}%` : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
