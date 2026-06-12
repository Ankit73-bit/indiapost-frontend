import type { List } from '@/types';

export function importPercent(list: List): number {
  const p = list.importProgress;
  if (!p || p.totalRows <= 0) return 0;
  return Math.min(100, Math.round((p.processedRows / p.totalRows) * 100));
}

export function syncPercent(list: List): number {
  const p = list.syncProgress;
  if (!p || p.totalArticles <= 0) return 0;
  return Math.min(100, Math.round((p.processedCount / p.totalArticles) * 100));
}

export function isProgressStuck(
  progress?: { updatedAt?: string; startedAt: string },
): boolean {
  if (!progress) return false;
  const last = progress.updatedAt ?? progress.startedAt;
  return Date.now() - new Date(last).getTime() > 5 * 60 * 1000;
}

export function importResultSummary(list: List): string | null {
  const r = list.lastImportResult;
  if (!r?.completedAt) return null;

  const errors = r.errorRows?.length ?? 0;
  const parts: string[] = [];

  if (r.totalRows > 0) {
    parts.push(
      `${r.imported.toLocaleString()} of ${r.totalRows.toLocaleString()} imported`,
    );
  } else if (r.imported > 0) {
    parts.push(`${r.imported.toLocaleString()} imported`);
  } else if (list.uploadedFile) {
    parts.push('0 rows imported');
  } else {
    return null;
  }

  if (r.skipped > 0) parts.push(`${r.skipped} skipped`);
  if (errors > 0) parts.push(`${errors} errors`);
  return parts.join(' · ');
}
