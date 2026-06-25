import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { useGetListQuery } from '@/store/api/listsApi';
import { formatDate } from '@/lib/helpers';
import { listDisplayName } from '@/lib/listNaming';
import type { RecentListCardProps } from '@/pages/articles/articlesPage.types';

export function RecentListCard({
  clientId,
  listId,
  isMostRecent,
}: RecentListCardProps) {
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
