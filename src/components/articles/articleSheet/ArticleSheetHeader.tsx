import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import type { Article } from '@/types';

interface ArticleSheetHeaderProps {
  article: Article;
  isAdmin: boolean;
}

export function ArticleSheetHeader({ article, isAdmin }: ArticleSheetHeaderProps) {
  return (
    <SheetHeader className="shrink-0 space-y-3 border-b border-border px-4 py-4 pr-12">
      <div className="space-y-1">
        <SheetDescription>Article details</SheetDescription>
        <SheetTitle className="font-mono text-base leading-snug break-all">
          {article.articleNumber}
        </SheetTitle>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ArticleStatusBadge status={article.normalizedStatus} />
        {article.syncError && (
          <span className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
            Sync failed
          </span>
        )}
        {article.isTerminal && (
          <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Terminal
          </span>
        )}
        {isAdmin && article.indiaPostTrackingExpired && (
          <span className="rounded border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            IP tracking expired
          </span>
        )}
      </div>
    </SheetHeader>
  );
}
