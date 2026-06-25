import { ALL_STATUSES, type NormalizedStatus } from '@/types';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import type { useGetArticleStatsQuery } from '@/store/api/articlesApi';

function toNormalizedStatus(status: string): NormalizedStatus {
  if ((ALL_STATUSES as readonly string[]).includes(status)) {
    return status as NormalizedStatus;
  }
  return 'UNKNOWN';
}

interface ArticleStatusBreakdownCardProps {
  statsData: NonNullable<ReturnType<typeof useGetArticleStatsQuery>['data']>;
}

export function ArticleStatusBreakdownCard({
  statsData,
}: ArticleStatusBreakdownCardProps) {
  if (statsData.totalArticles <= 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Article Status Breakdown</h2>
      <div className="space-y-2">
        {Object.entries(statsData.byStatus)
          .sort(([, a], [, b]) => Number(b ?? 0) - Number(a ?? 0))
          .map(([status, count]) => {
            const rowCount = Number(count ?? 0);
            const pct =
              statsData.totalArticles > 0
                ? Math.round((rowCount / statsData.totalArticles) * 100)
                : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <ArticleStatusBadge
                  status={toNormalizedStatus(status)}
                  className="w-32 justify-center"
                />
                <div className="flex-1 rounded-full bg-muted h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs text-muted-foreground">
                  {(count ?? 0).toLocaleString()}{' '}
                  <span className="text-muted-foreground/60">({pct}%)</span>
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
