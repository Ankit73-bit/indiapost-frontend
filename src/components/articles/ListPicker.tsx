import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getRecentArticleListIds } from '@/lib/articlesNavigation';
import { useListClientsQuery } from '@/store/api/clientsApi';
import type { ListPickerProps } from '@/pages/articles/articlesPage.types';
import { RecentListCard } from '@/components/articles/RecentListCard';

export function ListPicker({ clientId, isAdmin }: ListPickerProps) {
  const recentListIds = getRecentArticleListIds(clientId);
  const { data: clientsData } = useListClientsQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  const clientName =
    clientsData?.data.find((c) => c._id === clientId)?.name ??
    clientId.slice(-6);

  if (recentListIds.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
        <p className="font-medium">No recent lists</p>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? `Open a list for ${clientName} from the Lists page — it will appear here for quick access.`
            : 'Open a list from the Lists page — it will appear here for quick access.'}
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
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isAdmin ? (
            <>
              Recently viewed for{' '}
              <span className="font-medium text-foreground">{clientName}</span>
            </>
          ) : (
            'Recently viewed lists'
          )}
        </p>
        <Link
          to={`/lists?clientId=${clientId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Browse all lists
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recentListIds.map((id, index) => (
          <RecentListCard
            key={id}
            clientId={clientId}
            listId={id}
            isMostRecent={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
