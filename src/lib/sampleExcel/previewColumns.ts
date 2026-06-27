export const SAMPLE_EXCEL_PREVIEW_DEFAULT_COLUMNS = 10;

export function defaultVisibleColumns(columns: string[]): string[] {
  return columns.slice(0, SAMPLE_EXCEL_PREVIEW_DEFAULT_COLUMNS);
}

/** Keep user-selected columns that still exist; otherwise fall back to first 10. */
export function mergeVisibleColumns(previous: string[], allColumns: string[]): string[] {
  if (!allColumns.length) return [];
  const kept = previous.filter((column) => allColumns.includes(column));
  if (kept.length) return kept;
  return defaultVisibleColumns(allColumns);
}

export function allVisibleColumns(columns: string[]): string[] {
  return [...columns];
}
