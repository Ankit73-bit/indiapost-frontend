import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { usePollListQuery } from '@/hooks/usePollListQuery';
import { SearchableListSelect } from '@/components/shared/SearchableListSelect';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { formatDate } from '@/lib/helpers';
import { listDisplayName } from '@/lib/listNaming';
import { syncPercent } from '@/lib/listProgress';
import { OperationProgressBar } from '@/components/shared/OperationProgressBar';
import type { ListContextBarProps } from '@/pages/articles/articlesPage.types';

export function ListContextBar({
  clientId,
  listId,
  isAdmin,
  totalArticles,
  onOpenPdfs,
}: ListContextBarProps) {
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
