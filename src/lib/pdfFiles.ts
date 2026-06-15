import { getApiBaseUrl } from './apiBase';

const API_BASE = getApiBaseUrl();

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('ip_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

export async function fetchPdfBlob(
  listId: string,
  articleNumber: string,
  clientId: string,
  inline = false,
): Promise<Blob> {
  const res = await fetch(listPdfUrl(listId, articleNumber, clientId, inline), {
    headers: authHeaders(),
  });
  if (!res.ok) {
    let message = 'Failed to load PDF';
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      /* not JSON */
    }
    throw new Error(message);
  }
  return res.blob();
}

export async function loadPdfBlobUrl(
  listId: string,
  articleNumber: string,
  clientId: string,
): Promise<string> {
  const blob = await fetchPdfBlob(listId, articleNumber, clientId, true);
  return URL.createObjectURL(blob);
}

export async function downloadPdfFile(
  listId: string,
  articleNumber: string,
  clientId: string,
): Promise<void> {
  const blob = await fetchPdfBlob(listId, articleNumber, clientId, false);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${articleNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** @deprecated Use loadPdfBlobUrl + PdfViewerPanel for in-app viewing */
export async function viewPdfInNewTab(
  listId: string,
  articleNumber: string,
  clientId: string,
): Promise<void> {
  const url = await loadPdfBlobUrl(listId, articleNumber, clientId);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadPdfsZip(
  listId: string,
  clientId: string,
  listSlug: string,
  articleNumbers?: string[],
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/lists/${listId}/pdfs/download`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      ...(articleNumbers?.length ? { articleNumbers } : {}),
    }),
  });

  if (!res.ok) {
    let message = 'Failed to download ZIP';
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      /* not JSON */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${listSlug}-pdfs.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
}
