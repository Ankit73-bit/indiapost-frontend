import { FileText } from 'lucide-react';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/helpers';
import { isArticleSyncSelectable } from '@/pages/articles/articlesPage.utils';
import type { Article } from '@/types';

interface ArticlesTableRowProps {
  article: Article;
  selectedArticleId?: string;
  onSelectArticle: (article: Article) => void;
  hasLoanAccount: boolean;
  hasCustomerId: boolean;
  pdfArticleNumbers: Set<string>;
  selectedSyncIds: Set<string>;
  isListSyncing: boolean;
  isAdmin: boolean;
  onToggleSyncSelection: (articleId: string) => void;
}

export function ArticlesTableRow({
  article,
  selectedArticleId,
  onSelectArticle,
  hasLoanAccount,
  hasCustomerId,
  pdfArticleNumbers,
  selectedSyncIds,
  isListSyncing,
  isAdmin,
  onToggleSyncSelection,
}: ArticlesTableRowProps) {
  const syncSelectable = isArticleSyncSelectable(article);

  return (
    <tr
      className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-muted/20 ${
        selectedArticleId === article._id ? 'bg-muted/30' : ''
      }`}
      onClick={() => onSelectArticle(article)}
    >
      <td
        className="px-3 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-border disabled:cursor-not-allowed disabled:opacity-40"
          checked={selectedSyncIds.has(article._id)}
          disabled={!syncSelectable || isListSyncing}
          onChange={() => onToggleSyncSelection(article._id)}
          aria-label={
            syncSelectable
              ? `Select ${article.articleNumber} for sync`
              : `${article.articleNumber} cannot be synced`
          }
        />
      </td>
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          {article.articleNumber}
          {pdfArticleNumbers.has(
            article.articleNumber.toUpperCase(),
          ) && (
            <FileText
              className="h-3 w-3 shrink-0 text-primary"
              aria-label="PDF available"
            />
          )}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium leading-tight">
          {article.recipient.name}
        </p>
        {article.recipient.city && (
          <p className="text-xs text-muted-foreground">
            {article.recipient.city}
          </p>
        )}
      </td>
      {hasLoanAccount && (
        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
          {article.attributes?.loan_account_no ?? '—'}
        </td>
      )}
      {hasCustomerId && (
        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
          {article.attributes?.customer_id ?? '—'}
        </td>
      )}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-wrap items-center gap-1.5">
          <ArticleStatusBadge status={article.normalizedStatus} />
          {article.syncError && (
            <span
              className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
              title={article.syncError}
            >
              Sync err
            </span>
          )}
          {isAdmin && article.indiaPostTrackingExpired && (
            <span
              className="rounded border border-amber-300/60 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
              title="India Post tracking expired (~60 days after dispatch)"
            >
              IP expired
            </span>
          )}
        </div>
      </td>
      <td
        className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate"
        title={article.latestEvent?.rawEvent}
      >
        {article.latestEvent?.rawEvent ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(article.lastSyncedAt)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
        {article.syncAttempts}
      </td>
    </tr>
  );
}
