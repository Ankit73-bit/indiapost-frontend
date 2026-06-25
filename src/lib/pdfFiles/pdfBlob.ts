import { credFetch } from '@/lib/fetchCredentials';
import { listPdfUrl } from '@/lib/pdfFiles/pdfUrls';

export async function fetchPdfBlob(
  listId: string,
  articleNumber: string,
  clientId: string,
  inline = false,
): Promise<Blob> {
  const res = await credFetch(listPdfUrl(listId, articleNumber, clientId, inline));
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
