import { Truck } from 'lucide-react';
import { formatDateTime } from '@/lib/helpers';
import type { Article } from '@/types';

interface ArticleSheetLatestUpdateProps {
  article: Article;
}

export function ArticleSheetLatestUpdate({ article }: ArticleSheetLatestUpdateProps) {
  if (!article.latestEvent) {
    return null;
  }

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <Truck className="h-3.5 w-3.5" />
        Latest update
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug">
        {article.latestEvent.rawEvent}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {article.latestEvent.office}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatDateTime(article.latestEvent.eventDate)}
      </p>
    </div>
  );
}
