import { getApiBaseUrl } from '@/lib/apiBase';
import { credFetch } from '@/lib/fetchCredentials';
import { fetchPdfBlob } from '@/lib/pdfFiles/pdfBlob';

const API_BASE = getApiBaseUrl();

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

export async function downloadPdfsZip(
  listId: string,
  clientId: string,
  listSlug: string,
  articleNumbers?: string[],
): Promise<void> {
  const res = await credFetch(`${API_BASE}/api/v1/lists/${listId}/pdfs/download`, {
    method: 'POST',
    headers: {
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
