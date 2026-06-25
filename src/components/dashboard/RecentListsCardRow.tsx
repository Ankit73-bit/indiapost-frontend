import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { importResultSummary } from '@/lib/listProgress';
import { listDisplayName } from '@/lib/listNaming';
import { formatRelative } from '@/lib/helpers';
import type { List } from '@/types';

interface RecentListsCardRowProps {
  list: List;
  onClick: () => void;
}

export function RecentListsCardRow({ list, onClick }: RecentListsCardRowProps) {
  const delivered = list.stats?.DELIVERED ?? 0;
  const pct =
    list.totalArticles > 0
      ? Math.round((delivered / list.totalArticles) * 100)
      : 0;
  const importSummary = importResultSummary(list);
  const importErrors = list.lastImportResult?.errorRows?.length;

  return (
    <tr
      className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/20"
      onClick={onClick}
    >
      <td className="py-2.5">
        <p className="font-medium">{listDisplayName(list)}</p>
        {importSummary && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Last import: {importSummary}
          </p>
        )}
        {(importErrors ?? 0) > 0 && (
          <p className="mt-0.5 text-xs text-destructive">
            {importErrors} import error
            {importErrors !== 1 ? 's' : ''}
          </p>
        )}
      </td>
      <td className="py-2.5">
        <ListStatusBadge status={list.status} />
      </td>
      <td className="py-2.5 text-right font-mono text-xs">
        {(list.totalArticles ?? 0).toLocaleString()}
      </td>
      <td className="py-2.5 text-right font-mono text-xs">
        {delivered.toLocaleString()}{' '}
        <span className="text-muted-foreground">({pct}%)</span>
      </td>
      <td className="py-2.5 text-xs text-muted-foreground">
        {formatRelative(list.updatedAt)}
      </td>
    </tr>
  );
}
