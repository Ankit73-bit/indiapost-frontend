import { formatDate } from '@/lib/helpers';
import type { Article } from '@/types';

interface ArticleSheetFooterProps {
  article: Article;
}

export function ArticleSheetFooter({ article }: ArticleSheetFooterProps) {
  return (
    <div className="shrink-0 border-t border-border bg-muted/20 px-4 py-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sync tries
          </p>
          <p className="mt-0.5 font-mono text-sm tabular-nums">
            {article.syncAttempts}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Last synced
          </p>
          <p className="mt-0.5 text-xs leading-snug">
            {formatDate(article.lastSyncedAt)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Added
          </p>
          <p className="mt-0.5 text-xs leading-snug">
            {formatDate(article.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
