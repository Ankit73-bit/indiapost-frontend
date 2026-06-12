import { getApiBaseUrl } from './apiBase';

export interface ListExportFilters {
  status?: string;
  syncFailed?: boolean;
}

export async function downloadListExport(
  listId: string,
  listName: string,
  filters?: ListExportFilters,
): Promise<void> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.syncFailed) params.set('syncFailed', 'true');

  const qs = params.toString();
  const base =
    getApiBaseUrl();
  const url = `${base}/api/v1/lists/${listId}/export${qs ? `?${qs}` : ''}`;

  const token = localStorage.getItem('ip_token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');

  const blob = await res.blob();
  const suffix = filters?.syncFailed
    ? '_sync-failed'
    : filters?.status
      ? `_${filters.status}`
      : '';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${listName.replace(/[^a-z0-9]/gi, '_')}${suffix}.xlsx`;
  a.click();
  URL.revokeObjectURL(a.href);
}
