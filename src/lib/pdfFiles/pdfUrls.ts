import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE = getApiBaseUrl();

export function listPdfUrl(
  listId: string,
  articleNumber: string,
  clientId: string,
  inline = false,
): string {
  const params = new URLSearchParams({ clientId });
  if (inline) params.set('inline', '1');
  return `${API_BASE}/api/v1/lists/${listId}/pdfs/${encodeURIComponent(articleNumber)}?${params}`;
}
