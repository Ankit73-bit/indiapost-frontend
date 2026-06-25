import { RecentListsCardRow } from '@/components/dashboard/RecentListsCardRow';
import type { useListListsQuery } from '@/store/api/listsApi';

interface RecentListsCardProps {
  recentListsData: NonNullable<ReturnType<typeof useListListsQuery>['data']>;
  onViewAll: () => void;
  onListClick: (clientId: string, listId: string) => void;
}

export function RecentListsCard({
  recentListsData,
  onViewAll,
  onListClick,
}: RecentListsCardProps) {
  if (recentListsData.data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Lists</h2>
        <button
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={onViewAll}
        >
          View all
        </button>
      </div>
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left font-medium text-muted-foreground text-xs">
                Name
              </th>
              <th className="pb-2 text-left font-medium text-muted-foreground text-xs">
                Status
              </th>
              <th className="pb-2 text-right font-medium text-muted-foreground text-xs">
                Articles
              </th>
              <th className="pb-2 text-right font-medium text-muted-foreground text-xs">
                Delivered
              </th>
              <th className="pb-2 text-left font-medium text-muted-foreground text-xs">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {recentListsData.data.map((list) => (
              <RecentListsCardRow
                key={list._id}
                list={list}
                onClick={() => onListClick(list.clientId, list._id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
