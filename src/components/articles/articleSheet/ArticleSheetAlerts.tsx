import { AlertCircle } from 'lucide-react';
import { formatRelative } from '@/lib/helpers';
import type { Article } from '@/types';

interface ArticleSheetAlertsProps {
  article: Article;
  isAdmin: boolean;
}

export function ArticleSheetAlerts({ article, isAdmin }: ArticleSheetAlertsProps) {
  return (
    <>
      {isAdmin && article.indiaPostTrackingExpired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          India Post no longer returns tracking for this article (~60 days
          after dispatch). Timeline shown here is from data synced earlier.
        </div>
      )}

      {article.syncError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            Last sync failed
          </div>
          <p className="mt-1.5 text-sm leading-snug">{article.syncError}</p>
          {article.syncErrorAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRelative(article.syncErrorAt)}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Trigger Sync on the list to retry automatically.
          </p>
        </div>
      )}
    </>
  );
}
