import { getApiBaseUrl } from './apiBase';

export interface ListExportFilters {
  status?: string;
  syncFailed?: boolean;
  deliveredFrom?: string;
  deliveredTo?: string;
}

export interface BulkExportFilters {
  clientId: string;
  year?: number;
  month?: number;
  noticeType?: string;
  dispatchFrom?: string;
  dispatchTo?: string;
  status?: string;
  syncFailed?: boolean;
}

async function downloadExcel(url: string, filename: string): Promise<void> {
  const token = localStorage.getItem('ip_token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');

  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildQueryParams(filters: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '' || value === false) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export async function downloadListExport(
  listId: string,
  listName: string,
  filters?: ListExportFilters,
): Promise<void> {
  const qs = buildQueryParams({
    status: filters?.status,
    syncFailed: filters?.syncFailed ? 'true' : undefined,
    deliveredFrom: filters?.deliveredFrom,
    deliveredTo: filters?.deliveredTo,
  });

  const base = getApiBaseUrl();
  const url = `${base}/api/v1/lists/${listId}/export${qs ? `?${qs}` : ''}`;

  const suffix = filters?.syncFailed
    ? '_sync-failed'
    : filters?.status
      ? `_${filters.status}`
      : '';
  const filename = `${listName.replace(/[^a-z0-9]/gi, '_')}${suffix}.xlsx`;

  await downloadExcel(url, filename);
}

export async function downloadBulkExport(
  filters: BulkExportFilters,
  filename?: string,
): Promise<void> {
  const qs = buildQueryParams({
    clientId: filters.clientId,
    year: filters.year,
    month: filters.month,
    noticeType: filters.noticeType,
    dispatchFrom: filters.dispatchFrom,
    dispatchTo: filters.dispatchTo,
    status: filters.status,
    syncFailed: filters.syncFailed ? 'true' : undefined,
  });

  const base = getApiBaseUrl();
  const url = `${base}/api/v1/lists/export?${qs}`;

  const parts = ['export'];
  if (filters.year) parts.push(String(filters.year));
  if (filters.month) parts.push(String(filters.month).padStart(2, '0'));
  if (filters.noticeType) parts.push(filters.noticeType.toLowerCase());
  if (filters.dispatchFrom) parts.push(filters.dispatchFrom);
  if (filters.dispatchTo) parts.push(filters.dispatchTo);

  const defaultFilename = `${parts.join('_')}.xlsx`;
  await downloadExcel(url, filename ?? defaultFilename);
}
