import { Download, Eye, Loader2 } from 'lucide-react';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import type { NormalizedStatus, PdfArticleItem } from '@/types';

interface ListPdfsDialogArticleRowProps {
  item: PdfArticleItem;
  isSelected: boolean;
  viewBusy: boolean;
  dlBusy: boolean;
  busyAction: string | null;
  onToggle: () => void;
  onView: () => void;
  onDownload: () => void;
}

export function ListPdfsDialogArticleRow({
  item,
  isSelected,
  viewBusy,
  dlBusy,
  busyAction,
  onToggle,
  onView,
  onDownload,
}: ListPdfsDialogArticleRowProps) {
  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/20">
      <td className="px-3 py-2.5">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-border"
          checked={isSelected}
          onChange={onToggle}
          aria-label={`Select ${item.articleNumber}`}
        />
      </td>
      <td className="px-3 py-2.5 font-mono text-xs">
        {item.articleNumber}
        {item.isTerminal && (
          <span className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-sans text-muted-foreground">
            Final
          </span>
        )}
      </td>
      <td className="hidden px-3 py-2.5 sm:table-cell">
        {item.normalizedStatus ? (
          <ArticleStatusBadge
            status={item.normalizedStatus as NormalizedStatus}
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="View PDF"
            disabled={Boolean(busyAction)}
            onClick={onView}
          >
            {viewBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Download PDF"
            disabled={Boolean(busyAction)}
            onClick={onDownload}
          >
            {dlBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
