import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import { useOperationsLists } from '@/hooks/useOperationsLists';
import { importPercent, syncPercent } from '@/lib/listProgress';
import { listDisplayName } from '@/lib/listNaming';
import { isFullWidthAppRoute } from '@/lib/appLayout';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export function OperationsBanner() {
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';
  const { importing, syncing } = useOperationsLists();
  const activeCount = importing.length + syncing.length;

  if (activeCount === 0) return null;

  const fullWidth = isFullWidthAppRoute(location.pathname);

  return (
    <div className="border-b border-border bg-muted/30 px-4 py-2.5 sm:px-6">
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm',
          fullWidth ? 'w-full' : 'mx-auto max-w-7xl',
        )}
      >
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
            <span className="font-medium">{listDisplayName(list)}</span>
            <span className="text-amber-800/80">
              Importing
              {list.importProgress ? ` ${importPercent(list)}%` : ''}
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
            <span className="font-medium">{listDisplayName(list)}</span>
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
